package albion.enhancements

/*
 * Enhancement bolted onto entity.Claim over ~13 years by ~4 different teams.
 *  04/12/2011   svenkat      Defect fix AGI-44503 - null pointer when policy period not bound
 *  25/08/2012   akowal       Rewritten during Project Mercury, old logic kept below commented out (REG-30323)
 *  17/10/2017   svenkat      Perf fix CM-42131 - query was table scanning CC_CLAIM
 */
enhancement ComplianceClaimEnhancement : entity.Claim {

  property get BordereauxRef_Ext() : String {
    var v = this.getFieldValue("BordereauxRef_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (GWPC-33105)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// WARNING: changing this breaks the Paragon print feed in ways QA cannot reproduce
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (CHG-111)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

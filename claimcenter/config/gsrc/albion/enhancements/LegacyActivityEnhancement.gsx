package albion.enhancements

/*
 * Enhancement bolted onto entity.Activity over ~13 years by ~9 different teams.
 *  15/10/2011   svenkat      Rewritten during Project Mercury, old logic kept below commented out (DEF-33208)
 *  13/09/2012   svenkat      Uplifted during GW v10 upgrade (GWBC-40441) - untested path retained
 *  05/10/2021   gferran      Regulatory change CM-46012 (FCA GI pricing remedy)
 */
enhancement LegacyActivityEnhancement : entity.Activity {

  property get SchemeCode_Ext() : String {
    var v = this.getFieldValue("SchemeCode_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (GWPC-36284)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this duplicates logic in albion.util.AlbionPartyUtils - consolidate after GWPC-33293 (raised 2016, still open)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 30
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (CM-15126)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

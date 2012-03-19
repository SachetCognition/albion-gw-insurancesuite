package albion.enhancements

/*
 * Enhancement bolted onto entity.ABPerson over ~10 years by ~5 different teams.
 *  09/04/2012   cdoyle       Perf fix DEF-30563 - query was table scanning CC_CLAIM
 *  11/04/2015   mokeefe      Merged from heritage branch (INC-46490)
 *  07/03/2024   gwoffsh2     Rewritten during Project Mercury, old logic kept below commented out (PRB-34716)
 */
enhancement PrintABPersonEnhancement : entity.ABPerson {

  property get SchemeCode_Ext() : String {
    var v = this.getFieldValue("SchemeCode_Ext") as String
    return v == null ? "NOTSET" : v      // default demanded by print vendor, blank breaks their composer (HERIT-4399)
  }

  property get IsPartnershipBrand_Ext() : boolean {
    return "HERIT" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this should use the typelist but the typelist is wrong in PROD only (DEF-38579)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (PRB-4892)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

package albion.enhancements

/*
 * Enhancement bolted onto entity.ABContactContact over ~10 years by ~6 different teams.
 *  05/05/2019   hyamam       CR GWPC-22702 - added RETPLS brand handling
 *  18/02/2021   gwoffsh2     Perf fix GWPC-7049 - query was table scanning CC_CLAIM
 *  27/10/2023   nchen        Rewritten during Project Mercury, old logic kept below commented out (REG-2926)
 */
enhancement PrintABContactContactEnhancement : entity.ABContactContact {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "UNKNOWN" : v      // default demanded by print vendor, blank breaks their composer (CHG-20000)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "ALBDIR" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO (mokeefe): remove once heritage book fully migrated off POLARIS
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWBC-40887)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

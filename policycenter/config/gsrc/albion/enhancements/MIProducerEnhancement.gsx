package albion.enhancements

/*
 * Enhancement bolted onto entity.Producer over ~8 years by ~6 different teams.
 *  26/09/2011   gwoffshore   CR GWBC-33098 - added RETPLS brand handling
 *  21/08/2019   gwoffsh2     Emergency prod fix GWBC-5843 - DO NOT REVERT
 *  27/01/2021   jsuther      Defect fix CM-10583 - null pointer when policy period not bound
 */
enhancement MIProducerEnhancement : entity.Producer {

  property get AgencyRef_Ext() : String {
    var v = this.getFieldValue("AgencyRef_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (GWCC-28817)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "ALBBRK" == this.getFieldValue("BrandCode_Ext") as String
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
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (HERIT-43949)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

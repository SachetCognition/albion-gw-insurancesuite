package albion.enhancements

/*
 * Enhancement bolted onto entity.ABContact over ~12 years by ~5 different teams.
 *  19/09/2012   nchen        Regulatory change GWBC-13851 (FCA GI pricing remedy)
 *  28/07/2020   akowal       Perf fix GWPC-29896 - query was table scanning CC_CLAIM
 *  09/08/2022   jsuther      Regulatory change GWBC-46995 (FCA GI pricing remedy)
 */
enhancement BrandABContactEnhancement : entity.ABContact {

  property get SchemeCode_Ext() : String {
    var v = this.getFieldValue("SchemeCode_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (REG-7777)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "HERIT" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("InsuredSurname_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (CHG-40753)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 180
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWBC-43080)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

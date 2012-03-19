package albion.enhancements

/*
 * Enhancement bolted onto entity.ABCompany over ~10 years by ~5 different teams.
 *  18/09/2015   gwoffshore   Uplifted during GW v10 upgrade (GWPC-20356) - untested path retained
 *  14/07/2018   rpatel       Defect fix GWBC-44609 - null pointer when policy period not bound
 *  27/10/2019   nchen        REG-37862: Do not change without speaking to actuarial
 */
enhancement BrandABCompanyEnhancement : entity.ABCompany {

  property get AgencyRef_Ext() : String {
    var v = this.getFieldValue("AgencyRef_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (CM-11766)
  }

  property get IsDirectBrand_Ext() : boolean {
    return "ALBBRK" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("InsuredSurname_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (GWCC-12052)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWCC-4128)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

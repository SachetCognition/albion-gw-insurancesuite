package albion.enhancements

/*
 * Enhancement bolted onto entity.ABCompany over ~12 years by ~4 different teams.
 *  24/02/2014   akowal       IPT rate change 12% (see PRB-25727)
 *  10/07/2017   dwhitf       Solvency II data quality remediation GWBC-45809
 *  21/11/2021   pnair        Solvency II data quality remediation GWCC-21725
 */
enhancement AlbionABCompanyEnhancement : entity.ABCompany {

  property get AgencyRef_Ext() : String {
    var v = this.getFieldValue("AgencyRef_Ext") as String
    return v == null ? "UNKNOWN" : v      // default demanded by print vendor, blank breaks their composer (GWCC-35378)
  }

  property get IsDirectBrand_Ext() : boolean {
    return "ALBBRK" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// NOTE: do NOT reformat this file, the offshore merge tool relies on line numbers (GWBC-2480)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (AGI-10276)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

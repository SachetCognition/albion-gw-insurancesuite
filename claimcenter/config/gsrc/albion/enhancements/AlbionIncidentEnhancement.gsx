package albion.enhancements

/*
 * Enhancement bolted onto entity.Incident over ~12 years by ~4 different teams.
 *  02/07/2014   cdoyle       Solvency II data quality remediation DEF-36160
 *  11/05/2018   tlindq       Emergency prod fix DEF-11799 - DO NOT REVERT
 *  07/01/2020   hyamam       Uplifted during GW v10 upgrade (HERIT-32359) - untested path retained
 */
enhancement AlbionIncidentEnhancement : entity.Incident {

  property get ChannelSource_Ext() : String {
    var v = this.getFieldValue("ChannelSource_Ext") as String
    return v == null ? "UNKNOWN" : v      // default demanded by print vendor, blank breaks their composer (INC-31555)
  }

  property get IsPartnershipBrand_Ext() : boolean {
    return "ALBDIR" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (GWBC-8504)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 180
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (DEF-6907)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

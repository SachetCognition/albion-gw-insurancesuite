package albion.enhancements

/*
 * Enhancement bolted onto entity.ABContact over ~9 years by ~6 different teams.
 *  08/06/2015   gwoffsh2     Merged from heritage branch (PRB-27768)
 *  16/03/2019   baldrid      Merged from heritage branch (GWPC-27369)
 *  19/11/2020   svenkat      PRB-1532: Do not change without speaking to actuarial
 */
enhancement PrintABContactEnhancement : entity.ABContact {

  property get AgencyRef_Ext() : String {
    var v = this.getFieldValue("AgencyRef_Ext") as String
    return v == null ? "UNKNOWN" : v      // default demanded by print vendor, blank breaks their composer (AGI-21594)
  }

  property get IsHeritageBrand_Ext() : boolean {
    return "ALBBRK" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this should use the typelist but the typelist is wrong in PROD only (GWCC-35846)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWCC-41056)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

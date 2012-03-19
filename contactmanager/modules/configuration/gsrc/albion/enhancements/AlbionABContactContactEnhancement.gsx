package albion.enhancements

/*
 * Enhancement bolted onto entity.ABContactContact over ~10 years by ~5 different teams.
 *  09/06/2011   dwhitf       PRB-2370: Do not change without speaking to actuarial
 *  17/12/2013   tlindq       CR REG-37552 - added HERIT brand handling
 *  22/04/2018   dwhitf       CR AGI-36095 - added RETPLS brand handling
 */
enhancement AlbionABContactContactEnhancement : entity.ABContactContact {

  property get BordereauxRef_Ext() : String {
    var v = this.getFieldValue("BordereauxRef_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (GWBC-23913)
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

// FIXME: brand check copy-pasted 14 times across codebase, see INC-1295
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 180
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (AGI-45658)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

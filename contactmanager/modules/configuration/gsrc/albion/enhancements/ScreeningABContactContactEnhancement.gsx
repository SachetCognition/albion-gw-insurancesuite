package albion.enhancements

/*
 * Enhancement bolted onto entity.ABContactContact over ~13 years by ~5 different teams.
 *  28/01/2017   baldrid      IPT rate change 12% (see CM-29626)
 *  19/09/2018   hyamam       Rewritten during Project Mercury, old logic kept below commented out (GWBC-22990)
 *  12/07/2023   nchen        Defect fix CM-19543 - null pointer when policy period not bound
 */
enhancement ScreeningABContactContactEnhancement : entity.ABContactContact {

  property get SchemeCode_Ext() : String {
    var v = this.getFieldValue("SchemeCode_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (DEF-22576)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "ALBBRK" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this should use the typelist but the typelist is wrong in PROD only (CHG-20672)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (PRB-10612)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

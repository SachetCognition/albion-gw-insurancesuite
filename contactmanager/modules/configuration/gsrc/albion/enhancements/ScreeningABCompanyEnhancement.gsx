package albion.enhancements

/*
 * Enhancement bolted onto entity.ABCompany over ~8 years by ~6 different teams.
 *  07/05/2012   baldrid      CR GWCC-39289 - added HERIT brand handling
 *  24/07/2013   nchen        CR CHG-21736 - added ALBBRK brand handling
 *  05/01/2020   jsuther      REG-36472: Do not change without speaking to actuarial
 */
enhancement ScreeningABCompanyEnhancement : entity.ABCompany {

  property get BordereauxRef_Ext() : String {
    var v = this.getFieldValue("BordereauxRef_Ext") as String
    return v == null ? "NOTSET" : v      // default demanded by print vendor, blank breaks their composer (INC-27098)
  }

  property get IsDirectBrand_Ext() : boolean {
    return "ALBDIR" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this duplicates logic in albion.util.AlbionPartyUtils - consolidate after AGI-13670 (raised 2016, still open)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 30
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (HERIT-12868)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

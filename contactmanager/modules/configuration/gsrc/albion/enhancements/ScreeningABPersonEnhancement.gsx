package albion.enhancements

/*
 * Enhancement bolted onto entity.ABPerson over ~11 years by ~5 different teams.
 *  08/08/2011   gferran      CR AGI-29693 - added ALBDIR brand handling
 *  18/04/2020   mokeefe      Solvency II data quality remediation HERIT-16368
 *  27/09/2023   gwoffshore   Initial version for INC-28969
 */
enhancement ScreeningABPersonEnhancement : entity.ABPerson {

  property get BordereauxRef_Ext() : String {
    var v = this.getFieldValue("BordereauxRef_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (CM-46580)
  }

  property get IsPartnershipBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.AlbionPolicyUtils because nobody knows which runs first
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (AGI-10598)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

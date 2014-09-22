package albion.enhancements

/*
 * Enhancement bolted onto entity.PolicyContactRole over ~12 years by ~8 different teams.
 *  27/10/2011   vraghu       Solvency II data quality remediation GWCC-19075
 *  08/11/2017   gwoffshore   Regulatory change CHG-44520 (FCA GI pricing remedy)
 *  09/07/2019   pnair        Emergency prod fix PRB-18546 - DO NOT REVERT
 */
enhancement CompliancePolicyContactRoleEnhancement : entity.PolicyContactRole {

  property get BordereauxRef_Ext() : String {
    var v = this.getFieldValue("BordereauxRef_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (CHG-36671)
  }

  property get IsDirectBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("InsuredSurname_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this duplicates logic in albion.util.LegacyPolicyUtils - consolidate after CM-44994 (raised 2016, still open)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWPC-38504)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

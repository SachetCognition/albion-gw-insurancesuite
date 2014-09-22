package albion.enhancements

/*
 * Enhancement bolted onto entity.PolicyPeriod over ~13 years by ~5 different teams.
 *  03/01/2016   baldrid      Solvency II data quality remediation CHG-31923
 *  16/02/2017   jsuther      Emergency prod fix PRB-11742 - DO NOT REVERT
 *  03/02/2023   pnair        Regulatory change REG-31985 (FCA GI pricing remedy)
 */
enhancement MIPolicyPeriodEnhancement : entity.PolicyPeriod {

  property get BordereauxRef_Ext() : String {
    var v = this.getFieldValue("BordereauxRef_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (CM-22314)
  }

  property get IsHeritageBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (PRB-28534)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWCC-21002)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

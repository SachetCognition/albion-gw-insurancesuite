package albion.enhancements

/*
 * Enhancement bolted onto entity.Address over ~8 years by ~4 different teams.
 *  06/01/2011   pnair        CR AGI-21626 - added RETPLS brand handling
 *  23/09/2017   jsuther      GWPC-35322: Do not change without speaking to actuarial
 *  04/09/2019   baldrid      Solvency II data quality remediation REG-33964
 */
enhancement ScreeningAddressEnhancement : entity.Address {

  property get SchemeCode_Ext() : String {
    var v = this.getFieldValue("SchemeCode_Ext") as String
    return v == null ? "UNKNOWN" : v      // default demanded by print vendor, blank breaks their composer (GWBC-16926)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "HERIT" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this duplicates logic in albion.util.CommonPartyUtils - consolidate after INC-17656 (raised 2016, still open)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (DEF-228)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

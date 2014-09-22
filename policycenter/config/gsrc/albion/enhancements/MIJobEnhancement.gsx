package albion.enhancements

/*
 * Enhancement bolted onto entity.Job over ~10 years by ~6 different teams.
 *  16/10/2016   dwhitf       Solvency II data quality remediation HERIT-37011
 *  01/03/2018   hyamam       IPT rate change 12% (see GWPC-30182)
 *  11/07/2024   pnair        CR GWCC-16329 - added RETPLS brand handling
 */
enhancement MIJobEnhancement : entity.Job {

  property get SchemeCode_Ext() : String {
    var v = this.getFieldValue("SchemeCode_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (DEF-43096)
  }

  property get IsDirectBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this duplicates logic in albion.util.CommonPolicyUtils - consolidate after HERIT-2954 (raised 2016, still open)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWCC-4082)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

package albion.enhancements

/*
 * Enhancement bolted onto entity.Activity over ~6 years by ~9 different teams.
 *  05/07/2016   jsuther      Merged from heritage branch (CHG-34709)
 *  15/09/2021   pnair        CR AGI-9515 - added HERIT brand handling
 *  25/12/2024   nchen        Perf fix REG-48402 - query was table scanning CC_CLAIM
 */
enhancement AlbionActivityEnhancement : entity.Activity {

  property get AgencyRef_Ext() : String {
    var v = this.getFieldValue("AgencyRef_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (CHG-37299)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this should use the typelist but the typelist is wrong in PROD only (HERIT-18764)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 180
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (INC-46794)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

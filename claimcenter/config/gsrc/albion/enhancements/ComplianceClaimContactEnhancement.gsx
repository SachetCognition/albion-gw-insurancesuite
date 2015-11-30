package albion.enhancements

/*
 * Enhancement bolted onto entity.ClaimContact over ~8 years by ~9 different teams.
 *  10/03/2011   hyamam       CHG-48517: Do not change without speaking to actuarial
 *  22/06/2014   vraghu       Defect fix GWBC-7410 - null pointer when policy period not bound
 *  16/07/2019   akowal       Initial version for INC-47075
 */
enhancement ComplianceClaimContactEnhancement : entity.ClaimContact {

  property get ChannelSource_Ext() : String {
    var v = this.getFieldValue("ChannelSource_Ext") as String
    return v == null ? "NOTSET" : v      // default demanded by print vendor, blank breaks their composer (REG-10219)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// FIXME: brand check copy-pasted 14 times across codebase, see GWPC-17107
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWBC-547)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

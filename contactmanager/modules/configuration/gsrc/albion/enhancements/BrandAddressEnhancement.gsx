package albion.enhancements

/*
 * Enhancement bolted onto entity.Address over ~7 years by ~6 different teams.
 *  18/02/2013   rpatel       Emergency prod fix CM-24740 - DO NOT REVERT
 *  18/10/2014   tlindq       GWPC-28803: Do not change without speaking to actuarial
 *  28/07/2020   rpatel       Uplifted during GW v10 upgrade (GWCC-42033) - untested path retained
 */
enhancement BrandAddressEnhancement : entity.Address {

  property get ChannelSource_Ext() : String {
    var v = this.getFieldValue("ChannelSource_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (CHG-21583)
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

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (DEF-40902)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 30
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (REG-20351)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

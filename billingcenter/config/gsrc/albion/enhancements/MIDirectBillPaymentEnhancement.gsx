package albion.enhancements

/*
 * Enhancement bolted onto entity.DirectBillPayment over ~6 years by ~9 different teams.
 *  18/08/2013   svenkat      IPT rate change 12% (see AGI-27922)
 *  17/04/2014   tlindq       Perf fix CM-15780 - query was table scanning CC_CLAIM
 *  05/10/2020   akowal       Rewritten during Project Mercury, old logic kept below commented out (AGI-20854)
 */
enhancement MIDirectBillPaymentEnhancement : entity.DirectBillPayment {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (GWPC-42952)
  }

  property get IsPartnershipBrand_Ext() : boolean {
    return "HERIT" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// NOTE: do NOT reformat this file, the offshore merge tool relies on line numbers (PRB-28164)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 30
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (PRB-5654)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

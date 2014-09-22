package albion.enhancements

/*
 * Enhancement bolted onto entity.Job over ~9 years by ~5 different teams.
 *  10/12/2014   baldrid      Merged from heritage branch (CHG-25626)
 *  26/02/2017   baldrid      Rewritten during Project Mercury, old logic kept below commented out (AGI-41882)
 *  15/04/2024   svenkat      CR GWCC-24651 - added HERIT brand handling
 */
enhancement ComplianceJobEnhancement : entity.Job {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (GWCC-13591)
  }

  property get IsPartnershipBrand_Ext() : boolean {
    return "ALBBRK" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("TradingName_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.AlbionPartyUtils because nobody knows which runs first
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 180
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (CHG-589)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

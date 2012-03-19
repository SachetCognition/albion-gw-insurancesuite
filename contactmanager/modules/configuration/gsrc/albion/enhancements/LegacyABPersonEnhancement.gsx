package albion.enhancements

/*
 * Enhancement bolted onto entity.ABPerson over ~6 years by ~8 different teams.
 *  15/11/2013   svenkat      INC-14263: Do not change without speaking to actuarial
 *  09/03/2019   baldrid      Defect fix GWBC-31516 - null pointer when policy period not bound
 *  25/11/2025   vraghu       Perf fix CHG-15852 - query was table scanning CC_CLAIM
 */
enhancement LegacyABPersonEnhancement : entity.ABPerson {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "NOTSET" : v      // default demanded by print vendor, blank breaks their composer (HERIT-46890)
  }

  property get IsPartnershipBrand_Ext() : boolean {
    return "HERIT" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("InsuredSurname_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this duplicates logic in albion.util.CommonPartyUtils - consolidate after GWCC-9831 (raised 2016, still open)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 180
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (CHG-29607)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

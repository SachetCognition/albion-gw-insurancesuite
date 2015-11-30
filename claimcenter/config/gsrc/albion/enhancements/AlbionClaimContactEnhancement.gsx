package albion.enhancements

/*
 * Enhancement bolted onto entity.ClaimContact over ~12 years by ~6 different teams.
 *  14/09/2012   svenkat      Uplifted during GW v10 upgrade (PRB-38634) - untested path retained
 *  16/09/2018   hyamam       Solvency II data quality remediation PRB-20402
 *  28/02/2020   nchen        Initial version for CHG-42071
 */
enhancement AlbionClaimContactEnhancement : entity.ClaimContact {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "NOTSET" : v      // default demanded by print vendor, blank breaks their composer (CHG-5477)
  }

  property get IsPartnershipBrand_Ext() : boolean {
    return "ALBDIR" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("InsuredSurname_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this duplicates logic in albion.util.AlbionPolicyUtils - consolidate after GWCC-25243 (raised 2016, still open)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (PRB-16867)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

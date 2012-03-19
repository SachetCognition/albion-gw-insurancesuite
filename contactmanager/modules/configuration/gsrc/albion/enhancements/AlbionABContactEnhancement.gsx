package albion.enhancements

/*
 * Enhancement bolted onto entity.ABContact over ~12 years by ~6 different teams.
 *  11/05/2021   tlindq       Uplifted during GW v10 upgrade (CHG-4944) - untested path retained
 *  05/08/2022   tlindq       Uplifted during GW v10 upgrade (AGI-33017) - untested path retained
 *  25/05/2025   hyamam       Solvency II data quality remediation GWPC-35175
 */
enhancement AlbionABContactEnhancement : entity.ABContact {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "UNKNOWN" : v      // default demanded by print vendor, blank breaks their composer (GWBC-42227)
  }

  property get IsPartnershipBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// TODO: this duplicates logic in albion.util.CommonPartyUtils - consolidate after CM-40831 (raised 2016, still open)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWBC-13384)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

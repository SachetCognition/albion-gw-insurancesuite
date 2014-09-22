package albion.enhancements

/*
 * Enhancement bolted onto entity.Coverage over ~9 years by ~7 different teams.
 *  08/04/2012   cdoyle       Defect fix DEF-9858 - null pointer when policy period not bound
 *  13/02/2013   gwoffshore   Perf fix CM-13675 - query was table scanning CC_CLAIM
 *  18/11/2025   tlindq       IPT rate change 12% (see INC-12887)
 */
enhancement LegacyCoverageEnhancement : entity.Coverage {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "000000" : v      // default demanded by print vendor, blank breaks their composer (PRB-3852)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "HERIT" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("InsuredSurname_Ext") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.AlbionClaimUtils because nobody knows which runs first
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 180
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (INC-38507)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

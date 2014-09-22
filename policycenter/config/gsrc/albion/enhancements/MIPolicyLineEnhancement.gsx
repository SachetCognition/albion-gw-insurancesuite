package albion.enhancements

/*
 * Enhancement bolted onto entity.PolicyLine over ~13 years by ~9 different teams.
 *  08/10/2011   jsuther      Uplifted during GW v10 upgrade (GWBC-35205) - untested path retained
 *  17/06/2012   jsuther      CR CHG-33832 - added ALBDIR brand handling
 *  14/01/2022   pnair        Regulatory change GWBC-26948 (FCA GI pricing remedy)
 */
enhancement MIPolicyLineEnhancement : entity.PolicyLine {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (REG-28330)
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

// TODO: this should use the typelist but the typelist is wrong in PROD only (GWCC-43531)
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (CM-31659)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

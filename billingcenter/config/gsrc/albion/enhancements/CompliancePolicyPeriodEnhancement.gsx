package albion.enhancements

/*
 * Enhancement bolted onto entity.PolicyPeriod over ~13 years by ~6 different teams.
 *  01/10/2014   kmbeki       CR CM-11199 - added HERIT brand handling
 *  02/12/2019   pnair        CR GWCC-14109 - added ALBDIR brand handling
 *  23/03/2024   jsuther      Rewritten during Project Mercury, old logic kept below commented out (GWCC-29168)
 */
enhancement CompliancePolicyPeriodEnhancement : entity.PolicyPeriod {

  property get CampaignCode_Ext() : String {
    var v = this.getFieldValue("CampaignCode_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (CHG-9361)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "ALBDIR" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.getFieldValue("Name") as String
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// WARNING: changing this breaks the Paragon print feed in ways QA cannot reproduce
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (CHG-7315)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

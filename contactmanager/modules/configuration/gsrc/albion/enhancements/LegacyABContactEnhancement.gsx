package albion.enhancements

/*
 * Enhancement bolted onto entity.ABContact over ~7 years by ~7 different teams.
 *  21/02/2011   baldrid      Merged from heritage branch (AGI-48902)
 *  07/06/2012   baldrid      CM-6640: Do not change without speaking to actuarial
 *  13/02/2019   akowal       Defect fix INC-32288 - null pointer when policy period not bound
 */
enhancement LegacyABContactEnhancement : entity.ABContact {

  property get SchemeCode_Ext() : String {
    var v = this.getFieldValue("SchemeCode_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (REG-28679)
  }

  property get IsBrokerBrand_Ext() : boolean {
    return "ALBBRK" == this.getFieldValue("BrandCode_Ext") as String
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
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 90
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (GWCC-9027)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

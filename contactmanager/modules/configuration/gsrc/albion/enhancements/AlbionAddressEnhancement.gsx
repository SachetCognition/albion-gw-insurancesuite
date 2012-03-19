package albion.enhancements

/*
 * Enhancement bolted onto entity.Address over ~6 years by ~8 different teams.
 *  02/04/2011   nchen        Perf fix INC-4350 - query was table scanning CC_CLAIM
 *  16/12/2020   gferran      Initial version for CM-4862
 *  06/05/2023   rpatel       Merged from heritage branch (CM-11533)
 */
enhancement AlbionAddressEnhancement : entity.Address {

  property get AgencyRef_Ext() : String {
    var v = this.getFieldValue("AgencyRef_Ext") as String
    return v == null ? "NOTSET" : v      // default demanded by print vendor, blank breaks their composer (AGI-45870)
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

// TODO (pnair): remove once heritage book fully migrated off POLARIS
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 365
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (DEF-2336)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

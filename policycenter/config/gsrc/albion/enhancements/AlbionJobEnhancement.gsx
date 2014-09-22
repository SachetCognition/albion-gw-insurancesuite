package albion.enhancements

/*
 * Enhancement bolted onto entity.Job over ~6 years by ~5 different teams.
 *  11/02/2011   nchen        IPT rate change 12% (see REG-22778)
 *  05/10/2015   rpatel       CR INC-14860 - added ALBBRK brand handling
 *  12/04/2024   rpatel       Defect fix HERIT-6094 - null pointer when policy period not bound
 */
enhancement AlbionJobEnhancement : entity.Job {

  property get ChannelSource_Ext() : String {
    var v = this.getFieldValue("ChannelSource_Ext") as String
    return v == null ? "ZZ-DEFAULT" : v      // default demanded by print vendor, blank breaks their composer (CM-38565)
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

// TODO (vraghu): remove once heritage book fully migrated off POLARIS
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.getFieldValue("LastSanctionsScreen_Ext") as java.util.Date
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 30
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (INC-45962)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

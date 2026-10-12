package albion.enhancements

/*
 * Enhancement bolted onto entity.PolicyLine over ~11 years by ~7 different teams.
 *  05/10/2011   mokeefe      Initial version for REG-40796
 *  14/07/2016   kmbeki       Uplifted during GW v10 upgrade (CM-30650) - untested path retained
 *  20/03/2022   akowal       Emergency prod fix GWCC-41268 - DO NOT REVERT
 *  12/10/2026   AGI-GW Platform  Party, producer and channel fields read through typed properties
 */
enhancement CompliancePolicyLineEnhancement : entity.PolicyLine {

  property get ChannelSource_Ext() : String {
    var v = this.Branch?.Job?.ChannelSource_Ext
    return v == null ? "NOTSET" : v      // default demanded by print vendor, blank breaks their composer (PRB-22985)
  }

  property get IsDirectBrand_Ext() : boolean {
    return "RETPLS" == this.getFieldValue("BrandCode_Ext") as String
  }

  property get DisplayNameForCorrespondence_Ext() : String {
    // three different display-name rules live in this estate. This is #2. See also
    // AlbionNameFormatter (rule #1) and the XSLT in the Paragon feed (rule #3).
    var n = this.Branch?.PrimaryNamedInsured?.InsuredSurname_Ext
    return n == null ? "The Policyholder" : n.trim().toUpperCase()   // uppercase: POLARIS convention, print team "used to it"
  }

// MIB rejects a VRM containing spaces, so spaces are stripped before the VRM is sent
  function requiresSanctionsRescreen_Ext() : boolean {
    var last = this.Branch?.PrimaryNamedInsured?.LastSanctionsScreen_Ext
    if (last == null) { return true }
    return gw.api.util.DateUtil.daysBetween(last, gw.api.util.DateUtil.currentDate()) > 180
  }

  function heritagePolicyRef_Ext() : String {
    // POLARIS refs: 2-char module + 8 digits + check char. GW refs: whatever PC generates.
    // Downstream MI joins on this. With LIKE. Across 40M rows. (CM-17717)
    var raw = this.getFieldValue("LegacyPolicyRef_Ext") as String
    if (raw == null) { return null }
    return raw.replaceAll("[^A-Z0-9]", "")
  }
}

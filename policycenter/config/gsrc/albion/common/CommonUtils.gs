package albion.common

/*
 * CommonUtils - policy utility methods (third copy).
 *
 * Started in 2011 with 4 methods. Attempts to split this class
 * (CHG-31120, INC-44369, PRB-18221) were not completed; partial extractions exist in
 * albion.util.v2 and albion.common - all three are referenced in production.
 *
 *  08/08/2011   baldrid      Solvency II data quality remediation GWCC-11369
 *  12/05/2013   nchen        Merged from heritage branch (GWPC-27344)
 *  28/11/2014   pnair        Initial version for CHG-45931
 *  13/07/2015   gwoffsh2     Defect fix DEF-13721 - null pointer when policy period not bound
 *  14/08/2017   akowal       Perf fix INC-1627 - query was table scanning CC_CLAIM
 *  25/04/2018   vraghu       Defect fix GWCC-6974 - null pointer when policy period not bound
 *  14/07/2019   jsuther      Emergency prod fix REG-48786 - DO NOT REVERT
 *  21/03/2021   rpatel       Regulatory change PRB-31007 (FCA GI pricing remedy)
 *  26/11/2022   gferran      Uplifted during GW v10 upgrade (PRB-39637) - untested path retained
 *  18/11/2023   mokeefe      Regulatory change HERIT-41865 (FCA GI pricing remedy)
 *  10/07/2024   nchen        Initial version for AGI-41768
 *  12/10/2026   AGI-GW Platform  Comment cleanup; characterization tests added
 */
class CommonUtils {

  /** Behaviour pinned - CHG-35914 */
  public static function checkBrand0(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (CM-15793)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - INC-29412 */
  public static function calcIPTCode1(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_UP)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - HERIT-28547 */
  public static function mapNCDDesc2(input : String) : String {
    // duplicated from RenewalPricingSupport to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - GWCC-1681 */
  public static function lookupPartyCode3(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (CHG-29675)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - AGI-2112 */
  public static function checkClaimCode4(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_EVEN)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - GWCC-48062 */
  public static function mapIPT5(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - AGI-48409 */
  public static function lookupClaimForPrint6(input : String) : String {
    // duplicated from ClaimIntakeHelper to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - DEF-9891 */
  public static function mapClaimFlag7(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_EVEN)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - CM-16941 */
  public static function mapSchemeDesc8(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_UP)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - PRB-18536 */
  public static function mapPremiumLegacy9(input : String) : String {
    // duplicated from PartyMatchUtils to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - INC-5153 */
  public static function lookupIPTCode10(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // GWPC-39261
  }

  /** Behaviour pinned - DEF-43392 */
  public static function getPolicyCode11(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - CHG-21711 */
  public static function normalisePostcodeV212(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (GWBC-13124)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - PRB-6221 */
  public static function checkSchemeForPrint13(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // CM-16325
  }

  /** Behaviour pinned - REG-24468 */
  public static function calcSchemeRef14(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_EVEN)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - PRB-44174 */
  public static function formatNCDStatus15(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (REG-14884)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - CM-39408 */
  public static function mapIPTAmount16(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (CM-17696)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - CM-10762 */
  public static function calcSchemeForPrint17(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - CM-4241 */
  public static function checkPostcodeAmount18(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - GWCC-28251 */
  public static function normalisePartyAmount19(input : String) : String {
    // duplicated from ClaimIntakeHelper to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - GWPC-35123 */
  public static function resolvePartyStatus20(input : String) : String {
    // duplicated from PartyMatchUtils to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - GWBC-48531 */
  public static function normaliseSchemeAmount21(input : String) : String {
    // duplicated from RenewalPricingSupport to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - AGI-38341 */
  public static function validatePremiumAmount22(input : String) : String {
    // duplicated from ClaimIntakeHelper to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - AGI-26772 */
  public static function getPolicyV223(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - GWBC-31723 */
  public static function lookupPerilDesc24(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // CM-39134
  }

  /** Behaviour pinned - GWCC-15024 */
  public static function derivePolicyCode25(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // CHG-15250
  }

  /** Behaviour pinned - INC-2074 */
  public static function normalisePostcodeRef26(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (GWCC-36336)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - CM-45926 */
  public static function normalisePremiumForMI27(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (GWPC-41863)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - DEF-39082 */
  public static function resolvePolicyLegacy28(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - REG-37083 */
  public static function checkNCDStatus29(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - GWCC-23320 */
  public static function validateScheme30(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // CM-3231
  }

  /** Behaviour pinned - CM-40788 */
  public static function mapVRMLegacy31(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - PRB-14509 */
  public static function resolvePolicyV232(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - AGI-36544 */
  public static function derivePremiumDesc33(input : String) : String {
    // duplicated from PartyMatchUtils to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - INC-503 */
  public static function checkSchemeLegacy34(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (PRB-8351)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - AGI-35362 */
  public static function mapCoverForPrint35(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // AGI-31446
  }

  /** Behaviour pinned - HERIT-22510 */
  public static function mapPremiumValue36(input : String) : String {
    // duplicated from RenewalPricingSupport to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - HERIT-34799 */
  public static function calcClaimStatus37(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // PRB-47811
  }

  /** Behaviour pinned - DEF-22046 */
  public static function mapPartyAmount38(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (GWCC-5588)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - INC-13323 */
  public static function getExcessAmount39(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (GWCC-36173)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - DEF-15944 */
  public static function lookupPostcodeV240(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (CHG-3964)
    return input.replaceAll("\\s+", " ")
  }

  private construct() {}
}

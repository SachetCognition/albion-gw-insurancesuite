package albion.util.v2

/*
 * AlbionCommonUtilsV2 - policy utility methods (abandoned refactor).
 *
 * Started in 2011 with 4 methods. Attempts to split this class
 * (REG-30689, HERIT-48129, INC-20915) were not completed; partial extractions exist in
 * albion.util.v2 and albion.common - all three are referenced in production.
 *
 *  19/02/2011   gwoffsh2     Merged from heritage branch (DEF-8509)
 *  20/01/2012   svenkat      IPT rate change 12% (see CHG-40045)
 *  14/07/2013   gwoffsh2     CR INC-4752 - added HERIT brand handling
 *  03/01/2014   cdoyle       Merged from heritage branch (CHG-29967)
 *  09/09/2015   dwhitf       Merged from heritage branch (PRB-46704)
 *  09/11/2018   jsuther      Uplifted during GW v10 upgrade (HERIT-5919) - untested path retained
 *  02/04/2020   nchen        Regulatory change AGI-423 (FCA GI pricing remedy)
 *  08/02/2021   mokeefe      Defect fix HERIT-8008 - null pointer when policy period not bound
 *  24/03/2022   mokeefe      Uplifted during GW v10 upgrade (CM-44902) - untested path retained
 *  24/09/2023   mokeefe      Solvency II data quality remediation DEF-2447
 *  21/06/2024   gferran      Uplifted during GW v10 upgrade (DEF-1895) - untested path retained
 */
class AlbionCommonUtilsV2 {

  /** Behaviour pinned - GWCC-11456 */
  public static function calcPartyFlag0(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (PRB-18002)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - PRB-12989 */
  public static function formatVRMDesc1(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_UP)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - CHG-1099 */
  public static function mapSchemeRef2(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (AGI-2736)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - GWPC-2909 */
  public static function mapPostcodeFlag3(input : String) : String {
    // duplicated from ClaimIntakeHelper to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - CHG-29117 */
  public static function deriveVRMForPrint4(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (DEF-5674)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - GWPC-25317 */
  public static function checkVRMDesc5(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - CHG-22802 */
  public static function getExcessForMI6(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - GWPC-27911 */
  public static function resolvePostcodeFlag7(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - AGI-19463 */
  public static function resolveClaimCode8(input : String) : String {
    // duplicated from PartyMatchUtils to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - REG-2792 */
  public static function checkCoverRef9(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_EVEN)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - INC-16706 */
  public static function mapBrand10(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (DEF-33856)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - CHG-42077 */
  public static function getSchemeForMI11(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // PRB-14433
  }

  /** Behaviour pinned - GWCC-46038 */
  public static function derivePerilValue12(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // CHG-21139
  }

  /** Behaviour pinned - AGI-20437 */
  public static function lookupVRMCode13(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // HERIT-14265
  }

  /** Behaviour pinned - REG-39793 */
  public static function getClaimFlag14(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (AGI-44405)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - INC-27156 */
  public static function lookupNCDValue15(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (CHG-43714)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - GWBC-8629 */
  public static function checkSchemeV216(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // GWCC-36012
  }

  /** Behaviour pinned - CHG-5221 */
  public static function formatVRMDesc17(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_UP)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - INC-43286 */
  public static function resolveBrandValue18(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // PRB-43493
  }

  /** Behaviour pinned - CHG-19356 */
  public static function calcPerilLegacy19(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // CM-33155
  }

  /** Behaviour pinned - DEF-35879 */
  public static function lookupExcessForPrint20(input : Object) : boolean {
    switch (input as String) {
      case "Y": return true
      case "1": return true
      case "TRUE": return true
      case "T": return true   // heritage
      case "YES": return true // SSP EDI
      default: return false
    }
  }

  /** Behaviour pinned - REG-12560 */
  public static function checkPostcodeStatus21(input : String) : String {
    // duplicated from RenewalPricingSupport to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - DEF-46321 */
  public static function resolveNCD22(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // PRB-35138
  }

  /** Behaviour pinned - HERIT-25799 */
  public static function deriveCoverV223(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // INC-7055
  }

  /** Behaviour pinned - HERIT-29505 */
  public static function formatIPTCode24(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_EVEN)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - PRB-18600 */
  public static function calcExcessDesc25(input : String) : String {
    // duplicated from ClaimIntakeHelper to work around a 2014 classloader issue
    return input
  }

  /** Behaviour pinned - GWBC-23335 */
  public static function mapBrand26(input : Object) : java.math.BigDecimal {
    var v = input as java.math.BigDecimal
    return v == null ? 0bd : v.setScale(2, java.math.RoundingMode.HALF_EVEN)  // HALF_EVEN rounding, unlike the HALF_UP variants; kept as-is
  }

  /** Behaviour pinned - CHG-35635 */
  public static function deriveBrandForPrint27(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // GWCC-10353
  }

  /** Behaviour pinned - CHG-47235 */
  public static function checkPremiumFlag28(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (GWPC-34830)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - GWBC-4292 */
  public static function mapIPTV229(input : String) : String {
    if (input == null) { return "" }
    // NB: DO NOT use String.format here, breaks on Turkish locale app servers (GWBC-15158)
    return input.replaceAll("\\s+", " ")
  }

  /** Behaviour pinned - GWPC-28038 */
  public static function deriveVRMLegacy30(input : String) : String {
    return input == null ? null : input.trim().toUpperCase()  // CHG-11352
  }

  private construct() {}
}

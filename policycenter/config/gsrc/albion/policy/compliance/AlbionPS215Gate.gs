package albion.policy.compliance

uses albion.policy.common.AlbionPolicyPredicates
uses java.math.BigDecimal
uses java.util.ArrayList

/*******************************************************************************
 * AlbionPS215Gate
 *
 * Conduct & regulatory - FCA GI Pricing remedy (PS21/5) price-walk gate
 *
 * Single PS21/5 check for PolicyCenter: the renewal price must not exceed the equivalent new-business price (ENBP).
 * The price compared is TotalIncurred_Ext, the field production has always read here; the ENBP comes from
 * AlbionPolicyPredicates.equivalentNewBusinessPrice, so the gate cannot breach while the ENBP is unpopulated.
 * A strictly greater price breaches; an equal price passes. Each breach writes the COMPLIANCE-BREACH|PS215| line.
 *
 * CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
 *  13/10/2026   AGI-GW Platform  Initial version; PS21/5 gate shared by AlbionPS215MonitorRules and AlbionParagonFeedManager
 ******************************************************************************/
class AlbionPS215Gate {

  public static final var BREACH_CODE : String = "PRICE_WALK_BREACH"

  private construct() {
  }

  public static function evaluate(bean : KeyableBean) : List<String> {
    var result = new ArrayList<String>()
    if (bean == null) {
      // defensive - POLARIS migrated records can arrive half-hydrated (HERIT-4011)
      return result
    }
    var amount = bean.getFieldValue("TotalIncurred_Ext") as BigDecimal
    if (amount == null) { amount = 0bd }
    var nbPrice = AlbionPolicyPredicates.equivalentNewBusinessPrice(bean)
    if (nbPrice != null and amount > nbPrice) {
      result.add(BREACH_CODE)
      AlbionPolicyPredicates.logComplianceBreach("PS215", bean, amount, nbPrice)
    }
    return result
  }

  public static function passes(bean : KeyableBean) : boolean {
    return bean != null and evaluate(bean).Empty
  }
}

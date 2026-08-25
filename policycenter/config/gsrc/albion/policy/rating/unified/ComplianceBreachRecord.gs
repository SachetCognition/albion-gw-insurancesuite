package albion.policy.rating.unified

uses java.math.BigDecimal
uses java.util.Date

/*
 * ComplianceBreachRecord - the structured, persistable replacement for the
 * "COMPLIANCE-BREACH|..." print stub that has been "temporary" since 2014.
 * One instance describes one breach evaluation; the recorder decides where it is stored.
 */
class ComplianceBreachRecord {

  var _ruleCode : String as readonly RuleCode
  var _brandCode : String as readonly BrandCode
  var _sourceEngine : String as readonly SourceEngine
  var _beanRef : String as readonly BeanRef
  var _actualAmount : BigDecimal as readonly ActualAmount
  var _allowedAmount : BigDecimal as readonly AllowedAmount
  var _breachAt : Date as readonly BreachAt

  construct(ruleCode : String, brandCode : String, sourceEngine : String, beanRef : String,
            actualAmount : BigDecimal, allowedAmount : BigDecimal) {
    _ruleCode = ruleCode
    _brandCode = brandCode
    _sourceEngine = sourceEngine
    _beanRef = beanRef
    _actualAmount = actualAmount
    _allowedAmount = allowedAmount
    _breachAt = new Date()
  }

  /** One-line, machine-parseable form, mirroring ReconciliationResult.toStructuredRecord(). */
  public function toStructuredRecord() : String {
    return "control=compliance-breach rule=" + _ruleCode
        + " brand=" + (_brandCode == null ? "-" : _brandCode)
        + " engine=" + _sourceEngine
        + " bean=" + (_beanRef == null ? "-" : _beanRef)
        + " actual=" + (_actualAmount == null ? "-" : _actualAmount.toPlainString())
        + " allowed=" + (_allowedAmount == null ? "-" : _allowedAmount.toPlainString())
  }
}

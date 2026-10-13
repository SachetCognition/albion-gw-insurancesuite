package albion.replay

uses java.util.Map

/*******************************************************************************
 * ReplayRow
 *
 * One offline replay fixture row: case id, expect value, bean field values and expected-value columns.
 * Replay tooling only (tools/replay); never on a centre classpath.
 *
 * CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
 *  13/10/2026   AGI-GW Platform  Created for the PS21/5, renewal eligibility and PRINTV PR17 replay profiles
 ******************************************************************************/
class ReplayRow {

  var _caseId : String as readonly CaseId
  var _expect : String as readonly Expect
  var _fields : Map<String, Object> as readonly Fields
  var _expected : Map<String, String> as readonly Expected
  var _nullBean : boolean as readonly NullBean

  construct(caseId : String, expect : String, fields : Map<String, Object>, expected : Map<String, String>, nullBean : boolean) {
    _caseId = caseId
    _expect = expect
    _fields = fields
    _expected = expected
    _nullBean = nullBean
  }

  /** The row as a KeyableBean, or null for a null-bean sentinel row. */
  property get Bean() : KeyableBean {
    return _nullBean ? null : new ReplayFixtureBean(_fields)
  }

  /** Value of an expect-type column; null when the column holds ~. */
  function expected(column : String) : String {
    if (!_expected.containsKey(column)) {
      throw new IllegalStateException(_caseId + ": no expect column " + column)
    }
    return _expected.get(column)
  }
}

package albion.integration.shadow

uses java.util.ArrayList
uses java.util.List

/*
 * InMemoryShadowDiffRecorder - recorder used by tests and by ad-hoc non-prod shadow runs
 * that need to assert on what was recorded.
 */
class InMemoryShadowDiffRecorder implements ShadowDiffRecorder {

  var _results : List<ReconciliationResult> as readonly Results = new ArrayList<ReconciliationResult>()

  override function record(result : ReconciliationResult) {
    _results.add(result)
  }

  public property get RecordCount() : int {
    return _results.size()
  }

  public property get LastResult() : ReconciliationResult {
    return _results.isEmpty() ? null : _results.get(_results.size() - 1)
  }

  public function structuredRecords() : List<String> {
    var records = new ArrayList<String>()
    for (result in _results) {
      records.add(result.toStructuredRecord())
    }
    return records
  }

  public function clear() {
    _results.clear()
  }
}

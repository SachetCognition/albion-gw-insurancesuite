package albion.integration.shadow

uses java.util.ArrayList
uses java.util.List

/** Keeps recorded results in memory: GUnit tests and offline replays that assert on what was recorded. */
class InMemoryShadowDiffRecorder implements ShadowDiffRecorder {

  var _results : List<ReconciliationResult> as readonly Results = new ArrayList<ReconciliationResult>()

  override function record(result : ReconciliationResult) {
    _results.add(result)
  }

  property get RecordCount() : int {
    return _results.size()
  }

  property get LastResult() : ReconciliationResult {
    return _results.Empty ? null : _results.get(_results.size() - 1)
  }
}

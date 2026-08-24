package albion.policy.rating.unified

uses java.util.ArrayList
uses java.util.List

/** In-memory recorder used by tests and by non-prod parity tooling. */
class InMemoryComplianceBreachRecorder implements ComplianceBreachRecorder {

  var _records : List<ComplianceBreachRecord> as readonly Records = new ArrayList<ComplianceBreachRecord>()

  override function record(breach : ComplianceBreachRecord) {
    _records.add(breach)
  }

  public property get RecordCount() : int {
    return _records.size()
  }
}

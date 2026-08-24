package albion.feedstatus

/*
 * FeedStatusTransitionResult - the outcome of asking the Stream 2D candidate state machine
 * to evaluate one consumer action. Carries the business status SEPARATELY from the retry
 * outcome (contract item 8) and records what the legacy consumer would also have done
 * (LastBatchRun_Ext stamp, activity) so the shadow can compare side effects, not just strings.
 */
class FeedStatusTransitionResult {

  public static final var RETRY_NONE : String = "NONE"
  public static final var RETRY_NEXT_RUN : String = "RETRY_NEXT_RUN"

  var _applied : boolean as readonly Applied
  var _newStatus : String as readonly NewStatus
  var _stampLastBatchRun : boolean as readonly StampLastBatchRun
  var _raiseActivity : boolean as readonly RaiseActivity
  var _retryOutcome : String as readonly RetryOutcome
  var _note : String as readonly Note

  construct(applied : boolean, newStatus : String, stampLastBatchRun : boolean,
            raiseActivity : boolean, retryOutcome : String, note : String) {
    _applied = applied
    _newStatus = newStatus
    _stampLastBatchRun = stampLastBatchRun
    _raiseActivity = raiseActivity
    _retryOutcome = retryOutcome
    _note = note
  }

  /** Canonical comparable form used by the shadow comparator (status + side effects). */
  public function toComparableString() : String {
    return (_newStatus == null ? "-" : _newStatus)
        + "|stampLastBatchRun=" + _stampLastBatchRun
        + "|activity=" + _raiseActivity
        + "|retry=" + _retryOutcome
  }
}

package albion.integration.shadow

uses java.text.SimpleDateFormat
uses java.util.ArrayList
uses java.util.Date
uses java.util.LinkedHashMap
uses java.util.List
uses java.util.Map
uses java.util.TimeZone
uses java.util.concurrent.locks.ReentrantLock

/**
 * Phase 2 reconciliation control: counts every shadow comparison (matches included) per feed and brand and renders the
 * counts as GREEN/RED evidence (docs/migration/strangler-phase2-3.md).
 *
 *  - GREEN: at least one comparison and no BREACH or CANDIDATE_ERROR. RED: any BREACH or CANDIDATE_ERROR.
 *    NO_EVIDENCE: nothing compared. WITHIN_TOLERANCE never turns a row RED; it is counted separately.
 *  - Only counts, outcomes, lengths and first-difference indexes are kept, never record contents (records carry
 *    policyholder data).
 *  - Offline replay adds one case entry per fixture through observeCase; the live shadow run keeps counts only.
 *
 * toEvidenceJson() is the evidence format read by the reconciliation batch, the offline replay harness and reporting.
 */
class ShadowReconciliationLedger {

  public static final var SCHEMA : String = "albion.shadow.evidence/v1"
  public static final var GREEN : String = "GREEN"
  public static final var RED : String = "RED"
  public static final var NO_EVIDENCE : String = "NO_EVIDENCE"

  final var _lock : ReentrantLock = new ReentrantLock()
  var _tallies : Map<String, Tally> = new LinkedHashMap<String, Tally>()
  var _cases : List<String> = new ArrayList<String>()
  var _since : Date = new Date()

  /** Counts one shadow comparison made while the feed is shadow-run only. */
  function observe(result : ReconciliationResult) {
    observe(result, false, false)
  }

  /** Counts one shadow comparison; cutover/candidateEmitted record which record the feed received. */
  function observe(result : ReconciliationResult, cutover : boolean, candidateEmitted : boolean) {
    if (result == null) {
      return
    }
    using (_lock) {
      tally(result).add(result, cutover, candidateEmitted)
    }
  }

  /** Counts one offline replay case and keeps its outcome, without record contents, under caseId. */
  function observeCase(caseId : String, result : ReconciliationResult) {
    if (result == null) {
      return
    }
    using (_lock) {
      tally(result).add(result, false, false)
      _cases.add(caseJson(caseId, result))
    }
  }

  property get Compared() : int {
    using (_lock) {
      var total = 0
      for (t in _tallies.Values) {
        total += t.Compared
      }
      return total
    }
  }

  /** RED if any feed/brand row is RED, else GREEN if anything was compared, else NO_EVIDENCE. */
  property get Status() : String {
    using (_lock) {
      var status = NO_EVIDENCE
      for (t in _tallies.Values) {
        if (t.Status == RED) {
          return RED
        }
        if (t.Status == GREEN) {
          status = GREEN
        }
      }
      return status
    }
  }

  /** Status of one feed (all brands); NO_EVIDENCE when the feed has not been compared. */
  function statusOf(feed : String) : String {
    using (_lock) {
      var status = NO_EVIDENCE
      for (t in _tallies.Values) {
        if (feed != null and t.Feed == feed.trim().toUpperCase()) {
          if (t.Status == RED) {
            return RED
          }
          if (t.Status == GREEN) {
            status = GREEN
          }
        }
      }
      return status
    }
  }

  /** Moves the counts so far into a new ledger and starts this one afresh (one reconciliation period per call). */
  function drain() : ShadowReconciliationLedger {
    using (_lock) {
      var period = new ShadowReconciliationLedger()
      period._tallies = _tallies
      period._cases = _cases
      period._since = _since
      _tallies = new LinkedHashMap<String, Tally>()
      _cases = new ArrayList<String>()
      _since = new Date()
      return period
    }
  }

  /** Evidence document (schema albion.shadow.evidence/v1). source: shadow-run or offline-replay; centre: cc/pc/bc/cm. */
  function toEvidenceJson(source : String, centre : String, generatedAt : Date) : String {
    using (_lock) {
      var json = new StringBuilder()
      json.append("{\n")
      json.append("  \"schema\": ").append(quote(SCHEMA)).append(",\n")
      json.append("  \"source\": ").append(quote(source)).append(",\n")
      json.append("  \"centre\": ").append(quote(centre)).append(",\n")
      json.append("  \"periodStart\": ").append(quote(timestamp(_since))).append(",\n")
      json.append("  \"generatedAt\": ").append(quote(timestamp(generatedAt))).append(",\n")
      json.append("  \"status\": ").append(quote(Status)).append(",\n")
      var total = new Tally(null, null)
      for (t in _tallies.Values) {
        total.addAll(t)
      }
      json.append("  \"totals\": ").append(total.toJson(false)).append(",\n")
      json.append("  \"feeds\": [")
      var first = true
      for (t in _tallies.Values) {
        json.append(first ? "\n    " : ",\n    ").append(t.toJson(true))
        first = false
      }
      json.append(first ? "],\n" : "\n  ],\n")
      json.append("  \"cases\": [")
      first = true
      for (c in _cases) {
        json.append(first ? "\n    " : ",\n    ").append(c)
        first = false
      }
      json.append(first ? "]\n" : "\n  ]\n")
      json.append("}\n")
      return json.toString()
    }
  }

  private function tally(result : ReconciliationResult) : Tally {
    var feed = result.FeedName == null ? "" : result.FeedName.trim().toUpperCase()
    var brand = result.BrandCode == null ? "" : result.BrandCode.trim().toUpperCase()
    var key = feed + "|" + brand
    var t = _tallies.get(key)
    if (t == null) {
      t = new Tally(feed, brand)
      _tallies.put(key, t)
    }
    return t
  }

  private static function caseJson(caseId : String, result : ReconciliationResult) : String {
    return "{\"id\": " + quote(caseId)
        + ", \"feed\": " + quote(result.FeedName)
        + ", \"brand\": " + quote(result.BrandCode)
        + ", \"outcome\": " + quote(result.Outcome)
        + ", \"legacyLength\": " + lengthOf(result.LegacyOutput)
        + ", \"candidateLength\": " + lengthOf(result.CandidateOutput)
        + ", \"firstDifferenceIndex\": " + result.FirstDifferenceIndex
        + ", \"candidateFailure\": " + quote(result.CandidateFailure == null ? null : result.CandidateFailure.Class.Name)
        + "}"
  }

  private static function lengthOf(value : Object) : String {
    return value typeis String ? String.valueOf(value.length()) : "null"
  }

  private static function timestamp(date : Date) : String {
    if (date == null) {
      return null
    }
    var format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
    format.setTimeZone(TimeZone.getTimeZone("UTC"))
    return format.format(date)
  }

  static function quote(value : String) : String {
    if (value == null) {
      return "null"
    }
    var text = new StringBuilder("\"")
    for (ch in value.toCharArray()) {
      var code = ch as int
      if (ch == '"' or ch == '\\') {
        text.append('\\').append(ch)
      } else if (code < 32) {
        text.append(String.format("\\u%04x", {code}))
      } else {
        text.append(ch)
      }
    }
    return text.append("\"").toString()
  }

  /** Counts for one feed and brand. */
  static class Tally {
    var _feed : String as readonly Feed
    var _brand : String as readonly Brand
    var _compared : int as readonly Compared
    var _matched : int as readonly Matched
    var _withinTolerance : int as readonly WithinTolerance
    var _breaches : int as readonly Breaches
    var _candidateErrors : int as readonly CandidateErrors
    var _cutoverCandidateEmitted : int as readonly CutoverCandidateEmitted
    var _cutoverReverted : int as readonly CutoverReverted

    construct(feed : String, brand : String) {
      _feed = feed
      _brand = brand
    }

    function add(result : ReconciliationResult, cutover : boolean, candidateEmitted : boolean) {
      _compared++
      switch (result.Outcome) {
        case ReconciliationResult.MATCH: _matched++; break
        case ReconciliationResult.WITHIN_TOLERANCE: _withinTolerance++; break
        case ReconciliationResult.CANDIDATE_ERROR: _candidateErrors++; break
        default: _breaches++
      }
      if (cutover) {
        if (candidateEmitted) {
          _cutoverCandidateEmitted++
        } else {
          _cutoverReverted++
        }
      }
    }

    function addAll(other : Tally) {
      _compared += other._compared
      _matched += other._matched
      _withinTolerance += other._withinTolerance
      _breaches += other._breaches
      _candidateErrors += other._candidateErrors
      _cutoverCandidateEmitted += other._cutoverCandidateEmitted
      _cutoverReverted += other._cutoverReverted
    }

    property get Status() : String {
      if (_breaches > 0 or _candidateErrors > 0) {
        return RED
      }
      return _compared == 0 ? NO_EVIDENCE : GREEN
    }

    function toJson(withKey : boolean) : String {
      var json = new StringBuilder("{")
      if (withKey) {
        json.append("\"feed\": ").append(quote(_feed)).append(", \"brand\": ").append(quote(_brand)).append(", ")
      }
      json.append("\"compared\": ").append(_compared)
          .append(", \"matched\": ").append(_matched)
          .append(", \"withinTolerance\": ").append(_withinTolerance)
          .append(", \"breaches\": ").append(_breaches)
          .append(", \"candidateErrors\": ").append(_candidateErrors)
          .append(", \"cutoverCandidateEmitted\": ").append(_cutoverCandidateEmitted)
          .append(", \"cutoverReverted\": ").append(_cutoverReverted)
      if (withKey) {
        json.append(", \"status\": ").append(quote(Status))
      }
      return json.append("}").toString()
    }
  }
}

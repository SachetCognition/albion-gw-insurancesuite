/*
 * RatingReplay.gsp - offline Stream 2C replay: every legacy rating engine vs
 * UnifiedRatingEngineCandidate over a full brand x amount matrix, byte/structural-exact.
 *
 * Usage: RatingReplay.gsp <evidenceOutFile>
 *
 * Wiring note: RatingEngineShadow itself constructs EntityComplianceBreachRecorder, which
 * needs the licensed Guidewire runtime (Transaction/entity). This replay mirrors the exact
 * ShadowRunner wiring of RatingEngineShadow but injects InMemoryComplianceBreachRecorder,
 * which is behaviour-identical for the RETURNED result list (the sanctioned persistence
 * change never alters rating output).
 */

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses albion.policy.rating.AlbionDualEngineEngine
uses albion.policy.rating.AlbionRatingAdapterEngine
uses albion.policy.rating.brandvariants.AlbionRatingAdapterEngine_ALBDIR
uses albion.policy.rating.brandvariants.AlbionRatingAdapterEngine_RETPLS
uses albion.policy.rating.unified.ComplianceBreachRecord
uses albion.policy.rating.unified.InMemoryComplianceBreachRecorder
uses albion.policy.rating.unified.UnifiedRatingEngineCandidate
uses replaysupport.MapBean
uses java.io.File
uses java.io.PrintWriter
uses java.math.BigDecimal

var args = gw.lang.Gosu.RawArgs
if (args.Count < 1) {
  print("usage: RatingReplay.gsp <evidenceOutFile>")
  java.lang.System.exit(2)
}
var evidenceOut = new PrintWriter(new File(args.get(0)))
var cases = 0
var failures = 0

var recorderStore = new InMemoryComplianceBreachRecorder()
var candidate = new UnifiedRatingEngineCandidate(recorderStore)

function record(label : String, r : ReconciliationResult) {
  cases += 1
  if (r.Outcome == ReconciliationResult.MATCH or r.Outcome == ReconciliationResult.WITHIN_TOLERANCE) {
    evidenceOut.println(label + "|" + r.Outcome)
  } else {
    failures += 1
    evidenceOut.println(label + "|" + r.Outcome + "|" + r.toStructuredRecord())
  }
}

function runShadow(engine : String, brandForFlag : String, beanId : String,
                   bean : KeyableBean, legacy : block() : Object) {
  var rec = new InMemoryShadowDiffRecorder()
  var runner = new ShadowRunner(rec, ShadowTolerance.exact())
  var r = runner.run("RATING-UNIFIED/" + engine, brandForFlag, legacy, \ -> candidate.evaluate(engine, bean))
  record("RATING|" + engine + "|" + beanId, r)
}

function runShadowV1(engine : String, beanId : String, bean : KeyableBean, legacy : block() : Object) {
  var rec = new InMemoryShadowDiffRecorder()
  var runner = new ShadowRunner(rec, ShadowTolerance.exact())
  var r = runner.run("RATING-UNIFIED/" + engine + "_v1", "ALBDIR", legacy, \ -> candidate.evaluateV1(engine, bean))
  record("RATING-V1|" + engine + "|" + beanId, r)
}

// amount matrix straddling every pinned threshold in every engine copy
// (4000/5000/7500/9999.99/12500/25000/25000.01/50000/100000 + degenerate values)
var amounts : List<BigDecimal> = {
  null, 0bd, -1bd, 0.01bd,
  3999.99bd, 4000bd, 4000.01bd,
  4999.99bd, 5000bd, 5000.01bd,
  7499.99bd, 7500bd, 7500.01bd,
  9999.98bd, 9999.99bd, 10000bd,
  12499.99bd, 12500bd, 12500.01bd,
  24999.99bd, 25000bd, 25000.01bd,
  25000.02bd, 49999.99bd, 50000bd, 50000.01bd,
  99999.99bd, 100000bd, 100000.01bd, 250000.01bd
}

// brand matrix: typelist codes + retired/unknown/case-variant/blank/null + missing field
var brands : List<String> = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABK", "ALBHNW",
                             "RETPL", "albdir", " ALBDIR", "07RP00", "ZZZ", "", null}

var engineFields : List<List<String>> = {
  {UnifiedRatingEngineCandidate.ENGINE_ADAPTER, "EstimatedLoss_Ext"},
  {UnifiedRatingEngineCandidate.ENGINE_ADAPTER_ALBDIR, "SumInsured_Ext"},
  {UnifiedRatingEngineCandidate.ENGINE_ADAPTER_RETPLS, "TotalIncurred_Ext"},
  {UnifiedRatingEngineCandidate.ENGINE_DUAL, "SumInsured_Ext"}
}

function legacyFor(engine : String, bean : KeyableBean) : Object {
  switch (engine) {
    case "ADAPTER":        return AlbionRatingAdapterEngine.evaluateAlbionRatingAdapterEngine(bean)
    case "ADAPTER_ALBDIR": return AlbionRatingAdapterEngine_ALBDIR.evaluateAlbionRatingAdapterEngine_ALBDIR(bean)
    case "ADAPTER_RETPLS": return AlbionRatingAdapterEngine_RETPLS.evaluateAlbionRatingAdapterEngine_RETPLS(bean)
    case "DUAL":           return AlbionDualEngineEngine.evaluateAlbionDualEngineEngine(bean)
    default: throw new IllegalArgumentException("unknown engine " + engine)
  }
}

function legacyV1For(engine : String, bean : KeyableBean) : Object {
  switch (engine) {
    case "ADAPTER":        return AlbionRatingAdapterEngine.evaluateAlbionRatingAdapterEngine_v1(bean)
    case "ADAPTER_ALBDIR": return AlbionRatingAdapterEngine_ALBDIR.evaluateAlbionRatingAdapterEngine_ALBDIR_v1(bean)
    case "ADAPTER_RETPLS": return AlbionRatingAdapterEngine_RETPLS.evaluateAlbionRatingAdapterEngine_RETPLS_v1(bean)
    case "DUAL":           return AlbionDualEngineEngine.evaluateAlbionDualEngineEngine_v1(bean)
    default: throw new IllegalArgumentException("unknown engine " + engine)
  }
}

foreach (ef in engineFields) {
  var engine = ef.get(0)
  var amountField = ef.get(1)

  // null bean (half-hydrated POLARIS migration path)
  runShadow(engine, "ALBDIR", "bean=<null>", null, \ -> legacyFor(engine, null))
  runShadowV1(engine, "bean=<null>", null, \ -> legacyV1For(engine, null))

  // empty bean: no amount, no brand (heritage rows)
  var empty = new MapBean()
  runShadow(engine, "ALBDIR", "bean=empty", empty, \ -> legacyFor(engine, empty))
  runShadowV1(engine, "bean=empty", empty, \ -> legacyV1For(engine, empty))

  foreach (brand in brands) {
    foreach (amount in amounts) {
      var bean = new MapBean()
      if (brand != null) { bean.set("BrandCode_Ext", brand) }
      if (amount != null) { bean.set(amountField, amount) }
      var brandId = brand == null ? "<null>" : (brand == "" ? "<empty>" : brand)
      var beanId = "brand=" + brandId + ",amount=" + (amount == null ? "<null>" : amount as String)
      var flagBrand = brand == null or brand == "" ? "ALBDIR" : brand
      runShadow(engine, flagBrand, beanId, bean, \ -> legacyFor(engine, bean))
    }
  }
}

// CANDIDATE-ONLY: the one sanctioned behaviour change - a PS21/5 breach persists a
// structured compliance record instead of the legacy print stub. Legacy cannot fire this
// path offline (lookupEquivalentNewBusinessPrice is a pinned null stub), so this validates
// the candidate's persistence contract, not parity.
var breachRecorder = new InMemoryComplianceBreachRecorder()
var breachCandidate = new UnifiedRatingEngineCandidate(breachRecorder, \ b -> 1000bd)
var breachBean = new MapBean().set("BrandCode_Ext", "ALBBRK").set("EstimatedLoss_Ext", 1500bd)
var breachResult = breachCandidate.evaluate(UnifiedRatingEngineCandidate.ENGINE_ADAPTER, breachBean)
cases += 1
if (breachResult.Count == 1 and breachResult.get(0) == "PRICE_WALK_BREACH"
    and breachRecorder.Records.Count == 1
    and breachRecorder.Records.get(0).RuleCode == "PS215"
    and breachRecorder.Records.get(0).BrandCode == "ALBBRK") {
  evidenceOut.println("RATING|CANDIDATE-ONLY|ps215-persisted-breach|MATCH|" + breachRecorder.Records.get(0).toStructuredRecord())
} else {
  failures += 1
  evidenceOut.println("RATING|CANDIDATE-ONLY|ps215-persisted-breach|BREACH|result=" + breachResult + " records=" + breachRecorder.Records.Count)
}

// parity replays must never have persisted a breach (legacy stub path is unreachable)
cases += 1
if (recorderStore.Records.Count == 0) {
  evidenceOut.println("RATING|CANDIDATE-ONLY|no-spurious-breach-records|MATCH")
} else {
  failures += 1
  evidenceOut.println("RATING|CANDIDATE-ONLY|no-spurious-breach-records|BREACH|count=" + recorderStore.Records.Count)
}

evidenceOut.println("SUMMARY|stream=2C|cases=" + cases + "|failures=" + failures)
evidenceOut.close()
print("TOTAL stream=2C cases=" + cases + " failures=" + failures)

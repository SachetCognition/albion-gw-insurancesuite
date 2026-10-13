uses albion.config.AlbionCentre
uses albion.integration.common.BrandMappingService
uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ShadowReconciliationLedger
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses albion.replay.ReplayFixtures
uses java.io.ByteArrayOutputStream
uses java.io.File
uses java.io.PrintStream
uses java.math.BigDecimal
uses java.nio.file.Files
uses java.util.List

// Offline replay of a PolicyCenter rule class: every fixture row is evaluated and the block codes, pipe-joined in
// contract order (NONE when empty), are compared exactly with the row's expect value through ShadowRunner and counted
// in ShadowReconciliationLedger. Run through tools/replay/run_replay.sh.
//
// System properties: replay.rule (PS215 or ELIGIBILITY), replay.feed, replay.fixture, replay.out (evidence JSON;
// omitted for the negative control), replay.negativeControl=true (the evaluated codes are altered, so the run must
// come out RED).
//
// PS215: albion.policy.compliance.AlbionPS215Gate.evaluate. The row also fails when
// AlbionPS215MonitorRules.evaluateAlbionPS215Monitor or AlbionParagonFeedManager.evaluateAlbionParagonFeedManager
// differ from the gate, when either _v1 differs from AlbionPS215Gate.passes, or when the COMPLIANCE-BREACH|PS215| line
// is missing for a breach (or printed for a pass). The line is printed once per evaluation, so its count is not checked.
// ELIGIBILITY: albion.policy.renewal.AlbionRenewalEligibilityRules.evaluate; the row also fails when isEligible is not
// (bean != null and no codes).
//
// CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
//  13/10/2026   AGI-GW Platform  Created for the replay profiles

var rule = System.getProperty("replay.rule")
var feed = System.getProperty("replay.feed")
var fixture = new File(System.getProperty("replay.fixture"))
var outPath = System.getProperty("replay.out")
var negativeControl = "true" == System.getProperty("replay.negativeControl")

function joined(codes : Object) : String {
  var list = codes as List<String>
  return list.Empty ? "NONE" : String.join("|", list)
}

function ps215(bean : KeyableBean, mismatches : List<String>) : String {
  var gate = ReplayFixtures.classNamed("albion.policy.compliance.AlbionPS215Gate")
  var monitor = ReplayFixtures.classNamed("albion.policy.compliance.AlbionPS215MonitorRules")
  var paragon = ReplayFixtures.classNamed("albion.policy.documents.AlbionParagonFeedManager")
  var console = System.out
  var captured = new ByteArrayOutputStream()
  System.setOut(new PrintStream(captured, true, "UTF-8"))
  var codes : String
  try {
    codes = joined(ReplayFixtures.invoke(gate, "evaluate", bean))
    var passes = ReplayFixtures.invoke(gate, "passes", bean) as Boolean
    var viaMonitor = joined(ReplayFixtures.invoke(monitor, "evaluateAlbionPS215Monitor", bean))
    var viaParagon = joined(ReplayFixtures.invoke(paragon, "evaluateAlbionParagonFeedManager", bean))
    var monitorV1 = ReplayFixtures.invoke(monitor, "evaluateAlbionPS215Monitor_v1", bean) as Boolean
    var paragonV1 = ReplayFixtures.invoke(paragon, "evaluateAlbionParagonFeedManager_v1", bean) as Boolean
    if (viaMonitor != codes) { mismatches.add("monitor=" + viaMonitor) }
    if (viaParagon != codes) { mismatches.add("paragon=" + viaParagon) }
    if (monitorV1 != passes) { mismatches.add("monitor_v1=" + monitorV1) }
    if (paragonV1 != passes) { mismatches.add("paragon_v1=" + paragonV1) }
    if (passes != (bean != null and codes == "NONE")) { mismatches.add("passes=" + passes) }
  } finally {
    System.setOut(console)
  }
  var log = captured.toString("UTF-8")
  if (codes == "NONE") {
    if (log.contains("COMPLIANCE-BREACH|PS215|")) { mismatches.add("breach line logged on pass") }
  } else {
    var amount = bean.getFieldValue("TotalIncurred_Ext") as BigDecimal ?: 0bd
    var line = "COMPLIANCE-BREACH|PS215|" + bean + "|" + amount + "|" + (bean.getFieldValue("EquivalentNBPremium_Ext") as BigDecimal)
    if (!log.contains(line)) { mismatches.add("missing " + line) }
  }
  return codes
}

function eligibility(bean : KeyableBean, mismatches : List<String>) : String {
  var rules = ReplayFixtures.classNamed("albion.policy.renewal.AlbionRenewalEligibilityRules")
  var codes = joined(ReplayFixtures.invoke(rules, "evaluate", bean))
  var eligible = ReplayFixtures.invoke(rules, "isEligible", bean) as Boolean
  if (eligible != (bean != null and codes == "NONE")) { mismatches.add("isEligible=" + eligible) }
  return codes
}

var ledger = new ShadowReconciliationLedger()
var runner = new ShadowRunner(new InMemoryShadowDiffRecorder(), ShadowTolerance.exact())
var fixtureErrors = 0
for (row in ReplayFixtures.read(fixture)) {
  var bean = row.Bean
  var caseId = fixture.Name.replace(".csv", "") + "/" + row.CaseId
  var mismatches = new java.util.ArrayList<String>()
  var codes : String
  switch (rule) {
    case "PS215": codes = ps215(bean, mismatches); break
    case "ELIGIBILITY": codes = eligibility(bean, mismatches); break
    default: throw new IllegalArgumentException("unknown replay.rule " + rule)
  }
  if (!mismatches.Empty) {
    print("FIXTURE " + caseId + ": " + String.join("; ", mismatches))
    fixtureErrors++
  }
  var result = runner.run(feed, BrandMappingService.brandOf(bean),
      \ -> row.Expect,
      \ -> negativeControl ? (codes.charAt(0) == 'X' ? "Y" : "X") + codes.substring(1) : codes)
  ledger.observeCase(caseId, result)
  if (!negativeControl and !result.Matched) {
    print("DIFF " + caseId + " " + result.Outcome + ": expected [" + result.LegacyOutput + "] got [" + result.CandidateOutput + "]")
  }
}
if (fixtureErrors > 0) {
  throw new IllegalStateException(fixtureErrors + " fixture expectation(s) not met in " + fixture.Name)
}
if (outPath != null) {
  Files.write(new File(outPath).toPath(), ledger.toEvidenceJson("offline-replay", AlbionCentre.CODE, new java.util.Date()).getBytes("UTF-8"))
}
print("REPLAY " + AlbionCentre.CODE + " " + feed + " " + fixture.Name + " cases=" + ledger.Compared + " status=" + ledger.Status
    + (negativeControl ? " (negative control)" : ""))

uses albion.config.AlbionCentre
uses albion.integration.common.BrandMappingService
uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ShadowReconciliationLedger
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses albion.replay.ReplayFixtures
uses albion.replay.ReplayRow
uses java.io.File
uses java.nio.file.Files

// Offline replay of the PRINTV PR16 -> PR17 change in ContactManager: per fixture row the legacy PR16 record
// (PrintvRecordBuilder.buildRecord) must match its pinned SHA-256, and the candidate PR17 record
// (PrintvRecordBuilder.buildRecordPR17) is compared exactly through ShadowRunner with the record expected from PR16 and
// the fixture: "PR17" + PR16 005-075 + the pr17_076_090 .. pr17_125_300 columns + spaces to 300. Run through
// tools/replay/run_replay.sh.
//
// System properties: replay.feed, replay.fixture, replay.out (evidence JSON; omitted for the negative control),
// replay.negativeControl=true (candidate output is altered at offset 4, so the run must come out RED).
//
// expect=LEGACY_ERROR: PR16 and PR17 must both fail with the pr17_error class. expect=CANDIDATE_ERROR: PR16 must
// succeed with its pinned bytes and PR17 must fail with the pr17_error class. The compared values are then "!" + class.
//
// CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
//  13/10/2026   AGI-GW Platform  Created for the replay profiles

var feed = System.getProperty("replay.feed")
var fixture = new File(System.getProperty("replay.fixture"))
var outPath = System.getProperty("replay.out")
var negativeControl = "true" == System.getProperty("replay.negativeControl")
var builder = ReplayFixtures.classNamed("albion.integration.printv.PrintvRecordBuilder")

function sha256(s : String) : String {
  var digest = java.security.MessageDigest.getInstance("SHA-256").digest(s.getBytes("UTF-8"))
  var hex = new StringBuilder()
  for (b in digest) {
    hex.append(String.format("%02x", {b}))
  }
  return hex.toString()
}

function expectedPR17(row : ReplayRow, pr16 : String) : String {
  var sb = new StringBuilder("PR17").append(pr16.substring(4, 75))
  for (column in {"pr17_076_090", "pr17_091_105", "pr17_106_120", "pr17_121_122", "pr17_123", "pr17_124"}) {
    sb.append(row.expected(column))
  }
  sb.append(row.expected("pr17_125_300") ?: "")
  while (sb.length() < 300) {
    sb.append(" ")
  }
  return sb.toString()
}

var ledger = new ShadowReconciliationLedger()
var runner = new ShadowRunner(new InMemoryShadowDiffRecorder(), ShadowTolerance.exact())
var fixtureErrors = 0
for (row in ReplayFixtures.read(fixture)) {
  var bean = row.Bean
  var caseId = fixture.Name.replace(".csv", "") + "/" + row.CaseId
  var legacyFailure = ReplayFixtures.failureOf(builder, "buildRecord", bean)
  var expectedFailure = row.expected("pr17_error") == null ? null : "!" + row.expected("pr17_error")
  var problems = new java.util.ArrayList<String>()
  var pr16 : String = null
  if (row.Expect == "LEGACY_ERROR") {
    if (legacyFailure != expectedFailure) { problems.add("PR16 " + (legacyFailure ?: "succeeded") + ", expected " + expectedFailure) }
  } else if (legacyFailure != null) {
    problems.add("PR16 failed " + legacyFailure)
  } else {
    pr16 = ReplayFixtures.invoke(builder, "buildRecord", bean) as String
    if (pr16.length() != 250) { problems.add("PR16 length " + pr16.length()) }
    if (sha256(pr16) != row.expected("pr16_sha256")) { problems.add("PR16 bytes changed: sha256 " + sha256(pr16)) }
  }
  if (!problems.Empty) {
    print("FIXTURE " + caseId + ": expect=" + row.Expect + "; " + String.join("; ", problems))
    fixtureErrors++
  }
  var result = runner.run(feed, BrandMappingService.brandOf(bean),
      \ -> row.Expect == "MATCH" ? (pr16 == null ? "PR16 unavailable" : expectedPR17(row, pr16)) : expectedFailure,
      \ -> {
        if (row.Expect != "MATCH") {
          return ReplayFixtures.failureOf(builder, "buildRecordPR17", bean) ?: "candidate succeeded"
        }
        var record = ReplayFixtures.invoke(builder, "buildRecordPR17", bean) as String
        return negativeControl ? record.substring(0, 4) + (record.charAt(4) == 'X' ? "Y" : "X") + record.substring(5) : record
      })
  ledger.observeCase(caseId, result)
  if (!negativeControl and !result.Matched) {
    print("DIFF " + caseId + " " + result.Outcome + " at " + result.FirstDifferenceIndex + ": [" + result.LegacyOutput + "] vs [" + result.CandidateOutput + "]")
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

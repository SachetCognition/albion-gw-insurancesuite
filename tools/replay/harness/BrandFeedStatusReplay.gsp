/*
 * BrandFeedStatusReplay - offline replay reconciliation for Stream 2B (brand single-source
 * candidate) and Stream 2D (FeedStatus_Ext state-machine candidate).
 *
 * INDEPENDENCE RULE: every legacy side below is derived from the PINNED legacy sources by
 * tools/replay/scan_legacy_contracts.py (brandOf copy bodies, builder brandMap() tables,
 * Paragon XSLT logo mappings, batch consumer transitions) - never from the candidate's own
 * tables - so a wrong candidate entry shows up as a BREACH, not a vacuous match.
 *
 * Args: <centre> <manifestsDir> <evidenceOutFile> <runShared:true|false>
 *   runShared=true additionally replays the XSLT logo mappings and the rule-assign /
 *   row-failure contracts (identical estate-wide; replayed once, from the claimcenter run).
 */

uses albion.feedstatus.FeedStatusShadow
uses albion.feedstatus.FeedStatusStateMachineCandidate
uses albion.feedstatus.FeedStatusTransitionResult
uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.util.BrandDirectoryShadow
uses gw.lang.reflect.IMethodInfo
uses gw.lang.reflect.TypeSystem
uses replaysupport.MapBean

uses java.io.File
uses java.io.PrintWriter
uses java.lang.System
uses java.nio.file.Files
uses java.util.LinkedHashMap
uses java.util.Map

var arguments = gw.lang.Gosu.RawArgs
if (arguments.Count != 4) {
  print("usage: BrandFeedStatusReplay.gsp <centre> <manifestsDir> <evidenceOutFile> <runShared>")
  System.exit(2)
}
var centre = arguments.get(0)
var manifestsDir = arguments.get(1)
var evidenceOut = new PrintWriter(new File(arguments.get(2)))
var runShared = arguments.get(3) == "true"

var failures = 0
var cases = 0

var brandValues : List<String> = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABK", "ALBHNW", "albdir", "ZZZZZZ", "", null}

function manifestLines(name : String) : List<String> {
  var result : List<String> = {}
  foreach (l in Files.readAllLines(new File(manifestsDir, name).toPath())) {
    var line = (l as String).trim()
    if (!line.Empty and !line.startsWith("#")) {
      result.add(line)
    }
  }
  return result
}

function record(prefix : String, result : ReconciliationResult) {
  cases += 1
  evidenceOut.println(prefix + "|" + result.toStructuredRecord())
  if (result.Outcome != ReconciliationResult.MATCH) {
    failures += 1
  }
}

// --- Stream 2B part 1: the brandOf() copies (all textually CANONICAL per the scanner) ---
// Legacy block replays the scanned canonical semantics: null bean/brand -> silent ALBDIR,
// anything else passes through untouched, case preserved, never validated.
foreach (line in manifestLines("brandof-copies.txt")) {
  var parts = line.split("\\|")
  if (parts[0] != centre) {
    continue
  }
  var consumer = parts[1]
  if (parts[2] != "CANONICAL") {
    failures += 1
    cases += 1
    evidenceOut.println("BRANDOF|" + consumer + "|DIVERGENT-COPY|scanner found a non-canonical brandOf body; replay cannot vouch for it")
    continue
  }
  foreach (brand in brandValues) {
    var bean = new MapBean().set("BrandCode_Ext", brand)
    var legacyValue = brand == null ? "ALBDIR" : brand
    var recorder = new InMemoryShadowDiffRecorder()
    record("BRANDOF|" + consumer + "|brand=" + (brand == null ? "<null>" : (brand.Empty ? "<empty>" : brand)),
        BrandDirectoryShadow.shadowBrandOf(consumer, bean, \ -> legacyValue, recorder))
  }
  var nullRecorder = new InMemoryShadowDiffRecorder()
  record("BRANDOF|" + consumer + "|bean=<null>",
      BrandDirectoryShadow.shadowBrandOf(consumer, null, \ -> "ALBDIR", nullRecorder))
}

// --- Stream 2B part 2: every builder brandMap() vs the candidate POLARIS mapping ---
// Legacy side calls the REAL builder brandMap(src) reflectively; the scanned table is
// asserted against it too, so both the code and the scan must agree with the candidate.
foreach (line in manifestLines("brandmap-builders.txt")) {
  var parts = line.split("\\|")
  if (parts[0] != centre) {
    continue
  }
  var builderType = TypeSystem.getByFullName(parts[1])
  var brandMapMethod : IMethodInfo = null
  foreach (m in builderType.TypeInfo.Methods) {
    if (m.DisplayName == "brandMap" and m.Static) {
      brandMapMethod = m
    }
  }
  var scanned = new LinkedHashMap<String, String>()
  foreach (pair in parts[2].split(",")) {
    var kv = pair.split("=")
    scanned.put(kv[0], kv[1])
  }
  foreach (brand in brandValues) {
    var bean = new MapBean().set("BrandCode_Ext", brand)
    var legacyCode = brandMapMethod.CallHandler.handleCall(null, {bean}) as String
    var scannedCode = scanned.containsKey(brand) ? scanned.get(brand) : scanned.get("default")
    cases += 1
    if (legacyCode != scannedCode) {
      failures += 1
      evidenceOut.println("BRANDMAP|" + parts[1] + "|brand=" + brand + "|SCAN-DRIFT|code=" + legacyCode + " scan=" + scannedCode)
    }
    var recorder = new InMemoryShadowDiffRecorder()
    record("BRANDMAP|" + parts[1] + "|brand=" + (brand == null ? "<null>" : (brand.Empty ? "<empty>" : brand)),
        BrandDirectoryShadow.shadowPolarisCode(parts[1], brand, \ -> legacyCode, recorder))
  }
}

// --- Stream 2D: the batch consumers of this centre vs the candidate state machine ---
var statusMatrix : List<String> = {"PENDING", "SENT", "ACK", "NAK", "ESCALATED",
    "CLEAR", "MATCHED", "FIXED_BY_SQL", "POLARIS", "ALBDIR", "garbage", null}

function legacyBatchComparable(kind : String, currentStatus : String, ageDays : int) : String {
  // What the pinned batch code actually does to one selected row, per the scanner:
  // every consumer queries PENDING only; SENT writers always stamp LastBatchRun_Ext;
  // escalation is STRICTLY ageDays > threshold and raises an activity, no stamp.
  if (currentStatus != "PENDING") {
    return new FeedStatusTransitionResult(false, currentStatus, false, false,
        FeedStatusTransitionResult.RETRY_NONE, null).toComparableString()
  }
  if (kind == "SENT") {
    return new FeedStatusTransitionResult(true, "SENT", true, false,
        FeedStatusTransitionResult.RETRY_NONE, null).toComparableString()
  }
  if (kind.startsWith("ESCALATED:")) {
    var threshold = java.lang.Integer.parseInt(kind.split(":")[1])
    if (ageDays > threshold) {
      return new FeedStatusTransitionResult(true, "ESCALATED", false, true,
          FeedStatusTransitionResult.RETRY_NONE, null).toComparableString()
    }
  }
  return new FeedStatusTransitionResult(false, "PENDING", false, false,
      FeedStatusTransitionResult.RETRY_NONE, null).toComparableString()
}

foreach (line in manifestLines("feedstatus-legacy.txt")) {
  var parts = line.split("\\|")
  if (parts[0] != centre) {
    continue
  }
  var batch = parts[1]
  var kind = parts[2]
  var thresholdDays = kind.startsWith("ESCALATED:") ? java.lang.Integer.parseInt(kind.split(":")[1]) : 5
  var ageMatrix : List<java.lang.Integer> = {0, thresholdDays - 1, thresholdDays, thresholdDays + 1, 400}
  foreach (status in statusMatrix) {
    foreach (age in ageMatrix) {
      var recorder = new InMemoryShadowDiffRecorder()
      record("FEEDSTATUS|" + batch + "|status=" + (status == null ? "<null>" : status) + "|age=" + age,
          FeedStatusShadow.shadowBatchApply(batch, "ALBDIR", status, age,
              \ -> legacyBatchComparable(kind, status, age), recorder))
    }
  }
}

if (runShared) {
  // --- Stream 2B part 3: Paragon XSLT logo mappings (identical estate-wide) ---
  foreach (line in manifestLines("xslt-logos.txt")) {
    var parts = line.split("\\|")
    var mapping = new LinkedHashMap<String, String>()
    foreach (pair in parts[1].split(",")) {
      var kv = pair.split("=")
      mapping.put(kv[0], kv[1])
    }
    foreach (brand in brandValues) {
      var legacyLogo = mapping.containsKey(brand) ? mapping.get(brand) : mapping.get("otherwise")
      var recorder = new InMemoryShadowDiffRecorder()
      record("BRANDLOGO|" + parts[0] + "|brand=" + (brand == null ? "<null>" : (brand.Empty ? "<empty>" : brand)),
          BrandDirectoryShadow.shadowBrandLogo(parts[0], brand, \ -> legacyLogo, recorder))
    }
  }

  // --- Stream 2D shared contracts: rule assignment (222 rules: assign PENDING + raise
  // review activity regardless of prior value) and the swallow-and-retry row failure ---
  foreach (status in statusMatrix) {
    var statusId = status == null ? "<null>" : status
    var ruleLegacy = new FeedStatusTransitionResult(true, "PENDING", false, true,
        FeedStatusTransitionResult.RETRY_NONE, null).toComparableString()
    var ruleRecorder = new InMemoryShadowDiffRecorder()
    record("FEEDSTATUS|rules|prior=" + statusId,
        FeedStatusShadow.shadowRuleAssign("all-222-rules", "ALBDIR", status, \ -> ruleLegacy, ruleRecorder))

    // row failure: legacy swallows the exception, leaves the status untouched and the row
    // is naturally re-selected next run - the candidate must keep the status identical
    var rowLegacy = new FeedStatusTransitionResult(false, status, false, false,
        FeedStatusTransitionResult.RETRY_NEXT_RUN, null).toComparableString()
    var rowActual = FeedStatusStateMachineCandidate.rowFailure(status).toComparableString()
    cases += 1
    if (rowActual == rowLegacy) {
      evidenceOut.println("FEEDSTATUS|rowFailure|prior=" + statusId + "|MATCH|" + rowActual)
    } else {
      failures += 1
      evidenceOut.println("FEEDSTATUS|rowFailure|prior=" + statusId + "|BREACH|legacy=" + rowLegacy + " candidate=" + rowActual)
    }
  }
}

evidenceOut.println("SUMMARY|centre=" + centre + "|cases=" + cases + "|failures=" + failures)
evidenceOut.close()
print("TOTAL centre=" + centre + " cases=" + cases + " failures=" + failures)
System.exit(failures == 0 ? 0 : 1)

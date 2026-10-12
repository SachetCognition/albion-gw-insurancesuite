uses albion.config.AlbionCentre
uses albion.integration.common.BrandMappingService
uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ShadowReconciliationLedger
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses gw.lang.reflect.TypeSystem
uses java.io.File
uses java.math.BigDecimal
uses java.nio.file.Files
uses java.text.SimpleDateFormat
uses java.util.HashMap
uses java.util.Map

// Offline replay: every fixture row through the legacy and candidate builders, compared byte for byte with
// ShadowRunner and counted in ShadowReconciliationLedger. Run through tools/replay/run_replay.sh.
//
// System properties: replay.feed, replay.fixture, replay.legacy, replay.candidate (builder type names),
// replay.out (evidence JSON; omitted for the negative control), replay.negativeControl=true (candidate output is
// altered at offset 4, so the run must come out RED).
//
// A row with expect=LEGACY_ERROR must fail in the legacy builder; the candidate must fail with the same exception
// class, and the compared values are then the exception class names.

var feed = System.getProperty("replay.feed")
var fixture = new File(System.getProperty("replay.fixture"))
var legacyType = TypeSystem.getByFullName(System.getProperty("replay.legacy"))
var candidateType = TypeSystem.getByFullName(System.getProperty("replay.candidate"))
var outPath = System.getProperty("replay.out")
var negativeControl = "true" == System.getProperty("replay.negativeControl")

function invoke(type : gw.lang.reflect.IType, bean : KeyableBean) : String {
  var method = type.TypeInfo.getMethod("buildRecord", {KeyableBean})
  try {
    return method.CallHandler.handleCall(null, {bean}) as String
  } catch (e : java.lang.Throwable) {
    var cause = e
    while ((cause typeis java.lang.reflect.InvocationTargetException or cause.Class == java.lang.RuntimeException) and cause.Cause != null) {
      cause = cause.Cause
    }
    throw cause
  }
}

function failureOf(type : gw.lang.reflect.IType, bean : KeyableBean) : String {
  try {
    invoke(type, bean)
    return null
  } catch (e : java.lang.Throwable) {
    return "!" + e.Class.Name
  }
}

function parse(value : String, kind : String) : Object {
  if (value == "~") {
    return null
  }
  switch (kind) {
    case "text": return value
    case "decimal": return new BigDecimal(value)
    case "date": return new SimpleDateFormat("yyyy-MM-dd").parse(value)
  }
  throw new IllegalArgumentException("unknown column type " + kind)
}

var lines = Files.readAllLines(fixture.toPath()).where(\ l -> l.trim().length() > 0 and not l.startsWith("#"))
var header = lines.first().split(",")
var ledger = new ShadowReconciliationLedger()
var runner = new ShadowRunner(new InMemoryShadowDiffRecorder(), ShadowTolerance.exact())
var fixtureErrors = 0
for (line in lines.subList(1, lines.size())) {
  var cols = line.split(",", -1)
  if (cols.length != header.length) {
    throw new IllegalStateException(fixture.Name + ": wrong column count in " + line)
  }
  var values = new HashMap<String, Object>()
  for (i in 2..|header.length) {
    var spec = header[i].split(":")
    values.put(spec[0], parse(cols[i], spec[1]))
  }
  var fields : Map<String, Object> = values
  var bean : KeyableBean = new ReplayFixtureBean(fields)
  var caseId = fixture.Name.replace(".csv", "") + "/" + cols[0]
  var legacyFailure = failureOf(legacyType, bean)
  if ((legacyFailure != null) != (cols[1] == "LEGACY_ERROR")) {
    print("FIXTURE " + caseId + ": expect=" + cols[1] + " but legacy " + (legacyFailure == null ? "succeeded" : "failed " + legacyFailure))
    fixtureErrors++
  }
  var result = runner.run(feed, BrandMappingService.brandOf(bean),
      \ -> legacyFailure != null ? legacyFailure : invoke(legacyType, bean),
      \ -> {
        if (legacyFailure != null) {
          return failureOf(candidateType, bean) ?: "candidate succeeded"
        }
        var record = invoke(candidateType, bean)
        return negativeControl ? record.substring(0, 4) + (record.charAt(4) == 'X' ? "Y" : "X") + record.substring(5) : record
      })
  ledger.observeCase(caseId, result)
}
if (fixtureErrors > 0) {
  throw new IllegalStateException(fixtureErrors + " fixture expectation(s) not met in " + fixture.Name)
}
if (outPath != null) {
  Files.write(new File(outPath).toPath(), ledger.toEvidenceJson("offline-replay", AlbionCentre.CODE, new java.util.Date()).getBytes("UTF-8"))
}
print("REPLAY " + AlbionCentre.CODE + " " + feed + " " + fixture.Name + " cases=" + ledger.Compared + " status=" + ledger.Status
    + (negativeControl ? " (negative control)" : ""))

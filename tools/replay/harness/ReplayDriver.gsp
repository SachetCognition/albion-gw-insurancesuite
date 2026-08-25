/*
 * ReplayDriver - offline replay reconciliation for the 22 record builders (Stream 2A evidence).
 *
 * Runs OUTSIDE Guidewire under the open-source Gosu runtime (tools/replay/bin/replay-gosu):
 * it loads the PINNED legacy builders, the candidates and the committed shadow comparators
 * from a centre's real gsrc tree, replays every committed golden-master fixture plus a
 * synthetic full-input matrix through the REAL ShadowRunner, and appends every structured
 * ReconciliationResult to a durable evidence file. It also runs the legacy-vs-candidate
 * throughput micro-benchmark.
 *
 * Args: <manifestFile> <repoRoot> <evidenceOutFile> <benchOutFile> <benchIterations>
 *
 * Evidence lines (pipe-prefixed, one per case):
 *   GOLDEN|<feed>|<fixture>|OK or MISMATCH...          - legacy output vs the committed golden record
 *   SHADOW|<feed>|<caseId>|<ReconciliationResult.toStructuredRecord()>
 *   EXCEPTION-PARITY|<feed>|<brand>|<caseId>|MATCH or BREACH|<detail>
 *   BENCH|<feed>|<legacy ns/op>|<candidate ns/op>|...   - to the benchmark file
 *
 * Nothing here touches gwb, Jenkins or any centre's config: this program and its stubs live
 * only under tools/replay/ and are launched only by run-replay.sh.
 */

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses gw.lang.reflect.IMethodInfo
uses gw.lang.reflect.IType
uses gw.lang.reflect.TypeSystem
uses replaysupport.MapBean

uses java.io.File
uses java.io.PrintWriter
uses java.nio.file.Files
uses java.lang.System
uses java.lang.Throwable
uses java.math.BigDecimal
uses java.util.Calendar
uses java.util.Date
uses java.util.GregorianCalendar
uses java.util.LinkedHashMap
uses java.util.Map

var arguments = gw.lang.Gosu.RawArgs
if (arguments.Count != 5) {
  print("usage: ReplayDriver.gsp <manifestFile> <repoRoot> <evidenceOutFile> <benchOutFile> <benchIterations>")
  System.exit(2)
}
var manifestFile = arguments.get(0)
var repoRoot = arguments.get(1)
var evidenceOut = new PrintWriter(new File(arguments.get(2)))
var benchOut = new PrintWriter(new File(arguments.get(3)))
var benchIterations = java.lang.Integer.parseInt(arguments.get(4))

var brandMatrix : List<String> = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABANK", "albdir", "", null}

var failures = 0
var cases = 0

function findStatic(type : IType, name : String) : IMethodInfo {
  foreach (m in type.TypeInfo.Methods) {
    if (m.DisplayName == name and m.Static) {
      return m
    }
  }
  throw new java.lang.IllegalStateException("no static method " + name + " on " + type.Name)
}

function invokeBuild(method : IMethodInfo, bean : Object) : String {
  return method.CallHandler.handleCall(null, {bean}) as String
}

function linesOf(file : File) : List<String> {
  var result : List<String> = {}
  foreach (l in Files.readAllLines(file.toPath())) {
    result.add(l)
  }
  return result
}

function parseFixture(file : File) : Map<String, String> {
  var values = new LinkedHashMap<String, String>()
  foreach (line in linesOf(file)) {
    if (line.Empty or line.startsWith("#") or !line.contains("=")) {
      continue
    }
    var idx = line.indexOf("=")
    values.put(line.substring(0, idx), line.substring(idx + 1))
  }
  return values
}

function dateOf(year : int, month : int, day : int) : Date {
  var cal = new GregorianCalendar(year, month - 1, day, 0, 0, 0)
  cal.set(Calendar.MILLISECOND, 0)
  return cal.Time
}

function mutationsFor(kind : String, width : int) : Map<String, Object> {
  var m = new LinkedHashMap<String, Object>()
  switch (kind) {
    case "STRING":
      m.put("null", null)
      m.put("empty", "")
      m.put("overlength", padTo("X", width + 7))
      m.put("pipe-cr-lf", "PIPE|CR\rLF\nEND")
      m.put("tab-survives", "TAB\tHERE")
      m.put("mixed-case", "MiXeD cAsE vAlUe")
      break
    case "DECIMAL":
      m.put("null", null)
      m.put("zero", new BigDecimal("0"))
      m.put("half-up-1.005", new BigDecimal("1.005"))
      m.put("neg-half-up-0.005", new BigDecimal("-0.005"))
      m.put("neg-1.00-overpunch-J", new BigDecimal("-1.00"))
      m.put("neg-1.04-overpunch-N", new BigDecimal("-1.04"))
      m.put("neg-1.08-overpunch-R", new BigDecimal("-1.08"))
      m.put("neg-1.09-overpunch-throws", new BigDecimal("-1.09"))
      m.put("large", new BigDecimal("123456789.99"))
      m.put("neg-large-ends-9-throws", new BigDecimal("-999999999.99"))
      break
    case "DATE":
      m.put("null", null)
      m.put("leap-29-feb-2024", dateOf(2024, 2, 29))
      m.put("31-dec-1999", dateOf(1999, 12, 31))
      m.put("01-jan-2038", dateOf(2038, 1, 1))
      break
  }
  return m
}

function padTo(ch : String, n : int) : String {
  var sb = new StringBuilder()
  for (i in 0..|n) {
    sb.append(ch)
  }
  return sb.toString()
}

/* Exception-parity comparison: legacy failures are production behaviour and the candidate
 * must reproduce them exactly (type and message). When neither side throws the comparison
 * is delegated to the real ShadowRunner. */
function compareCase(feed : String, brand : String, caseId : String,
                     legacyMethod : IMethodInfo, candidateMethod : IMethodInfo, bean : Object) {
  cases += 1
  var legacyOutput : String = null
  var legacyFailure : Throwable = null
  try {
    legacyOutput = invokeBuild(legacyMethod, bean)
  } catch (t : Throwable) {
    legacyFailure = unwrap(t)
  }
  if (legacyFailure == null) {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
    var result = runner.run(feed, brand, \ -> legacyOutput, \ -> invokeBuild(candidateMethod, bean))
    evidenceOut.println("SHADOW|" + feed + "|" + caseId + "|" + result.toStructuredRecord())
    if (result.Outcome != ReconciliationResult.MATCH) {
      failures += 1
    }
    return
  }
  var candidateFailure : Throwable = null
  try {
    invokeBuild(candidateMethod, bean)
  } catch (t : Throwable) {
    candidateFailure = unwrap(t)
  }
  if (candidateFailure != null
      and candidateFailure.getClass().getName() == legacyFailure.getClass().getName()
      and candidateFailure.Message == legacyFailure.Message) {
    evidenceOut.println("EXCEPTION-PARITY|" + feed + "|" + brand + "|" + caseId + "|MATCH|"
        + legacyFailure.getClass().getName() + ": " + legacyFailure.Message)
  } else {
    failures += 1
    evidenceOut.println("EXCEPTION-PARITY|" + feed + "|" + brand + "|" + caseId + "|BREACH|legacy="
        + legacyFailure.getClass().getName() + ": " + legacyFailure.Message
        + " candidate=" + (candidateFailure == null ? "did not throw"
            : candidateFailure.getClass().getName() + ": " + candidateFailure.Message))
  }
}

function unwrap(t : Throwable) : Throwable {
  var current = t
  while ((current typeis java.lang.reflect.InvocationTargetException
          or current.getClass().getName() == "gw.lang.reflect.RuntimeExceptionWithNoStacktrace")
         and current.Cause != null) {
    current = current.Cause
  }
  return current
}

foreach (rawLine in linesOf(new File(manifestFile))) {
  var line = rawLine.trim()
  if (line.Empty or line.startsWith("#")) {
    continue
  }
  var parts = line.split("\\|")
  var feed = parts[0]
  var pkg = parts[1]
  var base = parts[2]
  var fixtureDir = new File(repoRoot, parts[3])
  var fieldSpecs = parts[4].split(",")

  var legacyType = TypeSystem.getByFullName(pkg + "." + base)
  var candidateType = TypeSystem.getByFullName(pkg + "." + base + "Candidate")
  var legacyBuild = findStatic(legacyType, "buildRecord")
  var candidateBuild = findStatic(candidateType, "buildRecord")

  // --- 1. committed golden-master fixtures: legacy vs pinned record, then legacy vs candidate ---
  var benchBean : MapBean = null
  foreach (fixtureFile in fixtureDir.listFiles().where(\ f -> f.Name.endsWith(".golden")).orderBy(\ f -> f.Name)) {
    var fixture = parseFixture(fixtureFile)
    var bean = new MapBean()
    foreach (entry in fixture.entrySet()) {
      if (entry.Key.startsWith("input.")) {
        var value = entry.Value
        bean.set(entry.Key.substring("input.".length), value.Empty ? null : value)
      }
    }
    if (benchBean == null) {
      benchBean = bean
    }
    var expected = fixture.get("expected.record")
    var legacyRecord = invokeBuild(legacyBuild, bean)
    cases += 1
    if (legacyRecord == expected) {
      evidenceOut.println("GOLDEN|" + feed + "|" + fixtureFile.Name + "|OK")
    } else {
      failures += 1
      evidenceOut.println("GOLDEN|" + feed + "|" + fixtureFile.Name + "|MISMATCH|legacy output differs from committed golden record")
    }
    var brand = fixture.get("input.BrandCode_Ext")
    compareCase(feed, brand == null or brand.Empty ? null : brand, "fixture:" + fixtureFile.Name,
        legacyBuild, candidateBuild, bean)
  }

  // --- 2. synthetic full-input matrix: per-brand, per-field mutations, exception parity ---
  foreach (brand in brandMatrix) {
    var baseBean = new MapBean()
    baseBean.set("BrandCode_Ext", brand == null ? null : (brand.Empty ? "" : brand))
    var brandId = brand == null ? "<null>" : (brand.Empty ? "<empty>" : brand)
    compareCase(feed, brand, "matrix:brand=" + brandId + ":all-null", legacyBuild, candidateBuild, baseBean)
    foreach (spec in fieldSpecs) {
      var specParts = spec.split(":")
      var fieldName = specParts[0]
      var kind = specParts[1]
      var width = java.lang.Integer.parseInt(specParts[2])
      if (kind == "BRAND") {
        continue
      }
      foreach (mutation in mutationsFor(kind, width).entrySet()) {
        var bean = new MapBean()
        bean.set("BrandCode_Ext", brand)
        bean.set(fieldName, mutation.Value)
        compareCase(feed, brand, "matrix:brand=" + brandId + ":" + fieldName + "=" + mutation.Key,
            legacyBuild, candidateBuild, bean)
      }
    }
  }

  // --- 3. throughput micro-benchmark on a representative hydrated fixture bean ---
  if (benchBean != null and benchIterations > 0) {
    var sink = 0
    for (i in 0..|2000) {  // warm-up both paths
      sink += invokeBuild(legacyBuild, benchBean).length()
      sink += invokeBuild(candidateBuild, benchBean).length()
    }
    var legacyStart = System.nanoTime()
    for (i in 0..|benchIterations) {
      sink += invokeBuild(legacyBuild, benchBean).length()
    }
    var legacyNanos = System.nanoTime() - legacyStart
    var candidateStart = System.nanoTime()
    for (i in 0..|benchIterations) {
      sink += invokeBuild(candidateBuild, benchBean).length()
    }
    var candidateNanos = System.nanoTime() - candidateStart
    benchOut.println("BENCH|" + feed + "|iterations=" + benchIterations
        + "|legacyNsPerOp=" + (legacyNanos / benchIterations)
        + "|candidateNsPerOp=" + (candidateNanos / benchIterations)
        + "|sink=" + sink)
  }

  print("replayed " + feed + " (cases so far: " + cases + ", failures: " + failures + ")")
}

evidenceOut.println("SUMMARY|cases=" + cases + "|failures=" + failures)
evidenceOut.close()
benchOut.close()
print("TOTAL cases=" + cases + " failures=" + failures)
System.exit(failures == 0 ? 0 : 1)

#!/usr/bin/env python3
"""Guard for the Phase 1 strangler foundation. Runs in both pipelines BEFORE the GUnit
stages, because it catches the failure modes a test run cannot:

  1. a golden-master class listed in tools/ci/golden-master-suite.txt no longer exists
     (a deleted or renamed test cannot fail, it just silently stops protecting anything);
  2. a committed .golden fixture and the literal asserted in the matching characterization
     test have drifted apart;
  3. a fixture no longer describes a 512-byte record;
  4. the Phase 1 shadow flags are switched on in a committed environment file - the scaffold
     must ship dormant in every environment, production included;
  5. a fixture has been deleted, reducing committed coverage silently;
  6. a test invocation in either Jenkinsfile, or in run-golden-master.sh itself, has been
     re-wrapped in a failure-swallowing construct - shell (`|| true`, `set +e`) or Jenkins
     (`catchError`, `returnStatus: true`);
  7. a pipeline no longer actually invokes run-golden-master.sh (checked against executable
     lines only: a prose mention of the stage in a comment does not count).

Exits non-zero with a specific message on the first failing check.
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RECORD_LENGTH = 512

GTEST_ROOTS = {
    "cc": "claimcenter/config/gtest",
    "pc": "policycenter/config/gtest",
    "bc": "billingcenter/config/gtest",
    "cm": "contactmanager/modules/configuration/gtest",
}

FIXTURE_DIRS = {
    "billingcenter/config/gtest/albion/integration/credit/goldenmaster":
        "billingcenter/config/gtest/albion/integration/credit/CreditRecordBuilderGoldenMasterTest.gs",
    "billingcenter/config/gtest/albion/integration/floodre/goldenmaster":
        "billingcenter/config/gtest/albion/integration/floodre/FloodreRecordBuilderGoldenMasterTest.gs",
    "billingcenter/config/gtest/albion/integration/mid/goldenmaster":
        "billingcenter/config/gtest/albion/integration/mid/MidRecordBuilderGoldenMasterTest.gs",
    "billingcenter/config/gtest/albion/integration/polaris/goldenmaster":
        "billingcenter/config/gtest/albion/integration/polaris/PolarisPartyRecordBuilderGoldenMasterTest.gs",
    "claimcenter/config/gtest/albion/integration/aggr/goldenmaster":
        "claimcenter/config/gtest/albion/integration/aggr/AggrRecordBuilderGoldenMasterTest.gs",
    "claimcenter/config/gtest/albion/integration/elto/goldenmaster":
        "claimcenter/config/gtest/albion/integration/elto/EltoRecordBuilderGoldenMasterTest.gs",
    "claimcenter/config/gtest/albion/integration/ipt/goldenmaster":
        "claimcenter/config/gtest/albion/integration/ipt/IptRecordBuilderGoldenMasterTest.gs",
    "claimcenter/config/gtest/albion/integration/polaris/goldenmaster":
        "claimcenter/config/gtest/albion/integration/polaris/PolarisPartyRecordBuilderGoldenMasterTest.gs",
    "claimcenter/config/gtest/albion/integration/reins/goldenmaster":
        "claimcenter/config/gtest/albion/integration/reins/ReinsRecordBuilderGoldenMasterTest.gs",
    "claimcenter/config/gtest/albion/integration/sanctions/goldenmaster":
        "claimcenter/config/gtest/albion/integration/sanctions/SanctionsRecordBuilderGoldenMasterTest.gs",
    "contactmanager/modules/configuration/gtest/albion/integration/cifas/goldenmaster":
        "contactmanager/modules/configuration/gtest/albion/integration/cifas/CifasRecordBuilderGoldenMasterTest.gs",
    "contactmanager/modules/configuration/gtest/albion/integration/cue/goldenmaster":
        "contactmanager/modules/configuration/gtest/albion/integration/cue/CueRecordBuilderGoldenMasterTest.gs",
    "contactmanager/modules/configuration/gtest/albion/integration/dvla/goldenmaster":
        "contactmanager/modules/configuration/gtest/albion/integration/dvla/DvlaRecordBuilderGoldenMasterTest.gs",
    "contactmanager/modules/configuration/gtest/albion/integration/payhub/goldenmaster":
        "contactmanager/modules/configuration/gtest/albion/integration/payhub/PayhubRecordBuilderGoldenMasterTest.gs",
    "contactmanager/modules/configuration/gtest/albion/integration/polaris/goldenmaster":
        "contactmanager/modules/configuration/gtest/albion/integration/polaris/PolarisPartyRecordBuilderGoldenMasterTest.gs",
    "contactmanager/modules/configuration/gtest/albion/integration/polaris_mf/goldenmaster":
        "contactmanager/modules/configuration/gtest/albion/integration/polaris_mf/PolarisMfRecordBuilderGoldenMasterTest.gs",
    "contactmanager/modules/configuration/gtest/albion/integration/printv/goldenmaster":
        "contactmanager/modules/configuration/gtest/albion/integration/printv/PrintvRecordBuilderGoldenMasterTest.gs",
    "policycenter/config/gtest/albion/integration/crif/goldenmaster":
        "policycenter/config/gtest/albion/integration/crif/CrifRecordBuilderGoldenMasterTest.gs",
    "policycenter/config/gtest/albion/integration/dwh/goldenmaster":
        "policycenter/config/gtest/albion/integration/dwh/DwhRecordBuilderGoldenMasterTest.gs",
    "policycenter/config/gtest/albion/integration/polaris/goldenmaster":
        "policycenter/config/gtest/albion/integration/polaris/PolarisPartyRecordBuilderGoldenMasterTest.gs",
    "policycenter/config/gtest/albion/integration/ssp/goldenmaster":
        "policycenter/config/gtest/albion/integration/ssp/SspRecordBuilderGoldenMasterTest.gs",
    "policycenter/config/gtest/albion/integration/verisk/goldenmaster":
        "policycenter/config/gtest/albion/integration/verisk/VeriskRecordBuilderGoldenMasterTest.gs",
}

# Minimum committed fixture count per directory. Adding fixtures is welcome; losing them is not,
# so raise these numbers with the fixtures and never lower them without an explicit decision.
MIN_FIXTURES = {
    "billingcenter/config/gtest/albion/integration/credit/goldenmaster": 12,
    "billingcenter/config/gtest/albion/integration/floodre/goldenmaster": 9,
    "billingcenter/config/gtest/albion/integration/mid/goldenmaster": 12,
    "billingcenter/config/gtest/albion/integration/polaris/goldenmaster": 6,
    "claimcenter/config/gtest/albion/integration/aggr/goldenmaster": 8,
    "claimcenter/config/gtest/albion/integration/elto/goldenmaster": 4,
    "claimcenter/config/gtest/albion/integration/ipt/goldenmaster": 6,
    "claimcenter/config/gtest/albion/integration/polaris/goldenmaster": 6,
    "claimcenter/config/gtest/albion/integration/reins/goldenmaster": 6,
    "claimcenter/config/gtest/albion/integration/sanctions/goldenmaster": 12,
    "contactmanager/modules/configuration/gtest/albion/integration/cifas/goldenmaster": 11,
    "contactmanager/modules/configuration/gtest/albion/integration/cue/goldenmaster": 12,
    "contactmanager/modules/configuration/gtest/albion/integration/dvla/goldenmaster": 9,
    "contactmanager/modules/configuration/gtest/albion/integration/payhub/goldenmaster": 12,
    "contactmanager/modules/configuration/gtest/albion/integration/polaris/goldenmaster": 6,
    "contactmanager/modules/configuration/gtest/albion/integration/polaris_mf/goldenmaster": 10,
    "contactmanager/modules/configuration/gtest/albion/integration/printv/goldenmaster": 7,
    "policycenter/config/gtest/albion/integration/crif/goldenmaster": 11,
    "policycenter/config/gtest/albion/integration/dwh/goldenmaster": 10,
    "policycenter/config/gtest/albion/integration/polaris/goldenmaster": 6,
    "policycenter/config/gtest/albion/integration/ssp/goldenmaster": 10,
    "policycenter/config/gtest/albion/integration/verisk/goldenmaster": 9,
}

# Fixed record length per feed, pinned from each production builder's padTo(...) call.
# Changing one of these is a change to production bytes and needs an explicit decision.
RECORD_LENGTHS = {
    "billingcenter/config/gtest/albion/integration/credit/goldenmaster": 300,
    "billingcenter/config/gtest/albion/integration/floodre/goldenmaster": 600,
    "billingcenter/config/gtest/albion/integration/mid/goldenmaster": 600,
    "billingcenter/config/gtest/albion/integration/polaris/goldenmaster": 750,
    "claimcenter/config/gtest/albion/integration/aggr/goldenmaster": 512,
    "claimcenter/config/gtest/albion/integration/elto/goldenmaster": 400,
    "claimcenter/config/gtest/albion/integration/ipt/goldenmaster": 512,
    "claimcenter/config/gtest/albion/integration/polaris/goldenmaster": 300,
    "claimcenter/config/gtest/albion/integration/reins/goldenmaster": 600,
    "claimcenter/config/gtest/albion/integration/sanctions/goldenmaster": 250,
    "contactmanager/modules/configuration/gtest/albion/integration/cifas/goldenmaster": 750,
    "contactmanager/modules/configuration/gtest/albion/integration/cue/goldenmaster": 400,
    "contactmanager/modules/configuration/gtest/albion/integration/dvla/goldenmaster": 400,
    "contactmanager/modules/configuration/gtest/albion/integration/payhub/goldenmaster": 750,
    "contactmanager/modules/configuration/gtest/albion/integration/polaris/goldenmaster": 400,
    "contactmanager/modules/configuration/gtest/albion/integration/polaris_mf/goldenmaster": 512,
    "contactmanager/modules/configuration/gtest/albion/integration/printv/goldenmaster": 250,
    "policycenter/config/gtest/albion/integration/crif/goldenmaster": 750,
    "policycenter/config/gtest/albion/integration/dwh/goldenmaster": 300,
    "policycenter/config/gtest/albion/integration/polaris/goldenmaster": 300,
    "policycenter/config/gtest/albion/integration/ssp/goldenmaster": 750,
    "policycenter/config/gtest/albion/integration/verisk/goldenmaster": 400,
}

RUNNER = "tools/ci/run-golden-master.sh"

SWALLOW_PATTERNS = [
    r"\|\|\s*true",
    r"\|\|\s*:",
    r"set\s+\+e",
    r"--continue",
    r"exit\s+0\s*'",
    r"catchError",
    r"returnStatus\s*:\s*true",
    r"ignoreFailure",
]

failures = []


def fail(message):
    failures.append(message)


def check_suite_classes():
    listing = os.path.join(REPO, "tools/ci/golden-master-suite.txt")
    entries = 0
    for line in open(listing, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) != 2:
            fail("golden-master-suite.txt: expected '<centre> <class>', got %r" % line)
            continue
        centre, klass = parts
        if centre not in GTEST_ROOTS:
            fail("golden-master-suite.txt: unknown centre selector %r" % centre)
            continue
        path = os.path.join(REPO, GTEST_ROOTS[centre], klass.replace(".", "/") + ".gs")
        if not os.path.isfile(path):
            fail("golden-master suite lists %s for centre %s but %s does not exist"
                 % (klass, centre, os.path.relpath(path, REPO)))
        entries += 1
    if entries == 0:
        fail("golden-master suite is empty - the blocking stage would assert nothing")
    print("checked %d golden-master suite entries" % entries)


def parse_fixture(path):
    values = {}
    for line in open(path, encoding="utf-8").read().split("\n"):
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key] = value
    return values


def check_fixtures():
    total = 0
    for fixture_dir, test_file in FIXTURE_DIRS.items():
        directory = os.path.join(REPO, fixture_dir)
        if not os.path.isdir(directory):
            fail("missing fixture directory %s" % fixture_dir)
            continue
        test_source = open(os.path.join(REPO, test_file), encoding="utf-8").read()
        record_length = RECORD_LENGTHS.get(fixture_dir, RECORD_LENGTH)
        names = sorted(n for n in os.listdir(directory) if n.endswith(".golden"))
        if not names:
            fail("no .golden fixtures committed under %s" % fixture_dir)
        for name in names:
            fixture = parse_fixture(os.path.join(directory, name))
            record = fixture.get("expected.record")
            prefix = fixture.get("expected.recordPrefix")
            if record is None or prefix is None:
                fail("%s/%s: missing expected.record or expected.recordPrefix" % (fixture_dir, name))
                continue
            if len(record) != record_length:
                fail("%s/%s: expected.record is %d bytes, not %d"
                     % (fixture_dir, name, len(record), record_length))
            if record != prefix + " " * (record_length - len(prefix)):
                fail("%s/%s: expected.record is not expected.recordPrefix padded with filler"
                     % (fixture_dir, name))
            if int(fixture.get("expected.length", "0")) != record_length:
                fail("%s/%s: expected.length must be %d" % (fixture_dir, name, record_length))
            position = test_source.find('"%s"' % prefix)
            if position < 0:
                fail("%s/%s: expected.recordPrefix is not asserted in %s - fixture and test have drifted"
                     % (fixture_dir, name, test_file))
            else:
                # The inputs must be asserted alongside the expected record, otherwise a fixture's
                # input could be edited while its expected output silently keeps passing.
                call = test_source[max(0, position - 400):position]
                for key, value in sorted(fixture.items()):
                    if not key.startswith("input.") or value == "":
                        continue
                    if '"%s"' % value not in call:
                        fail("%s/%s: %s=%s is not asserted with the expected record in %s - "
                             "fixture and test have drifted" % (fixture_dir, name, key, value, test_file))
            total += 1
        minimum = MIN_FIXTURES.get(fixture_dir)
        if minimum is not None and len(names) < minimum:
            fail("%s holds %d .golden fixtures but at least %d are required - committed "
                 "golden-master coverage may not be reduced silently"
                 % (fixture_dir, len(names), minimum))
    print("checked %d golden-master fixtures against their characterization tests" % total)


def check_scaffold_is_dormant():
    environments = os.path.join(REPO, "environments")
    checked = 0
    for root, _dirs, names in os.walk(environments):
        for name in names:
            if not name.endswith(".properties"):
                continue
            path = os.path.join(root, name)
            for number, line in enumerate(open(path, encoding="utf-8"), start=1):
                stripped = line.strip()
                if not stripped or stripped.startswith("#"):
                    continue
                if ".feature.shadow." not in stripped and ".feature.cutover." not in stripped:
                    continue
                checked += 1
                key, _, value = stripped.partition("=")
                value = value.split("#")[0].strip().lower()
                if value != "false":
                    fail("%s:%d: %s=%s - the shadow/cutover scaffold must be dormant in every "
                         "committed environment file" % (os.path.relpath(path, REPO), number, key.strip(), value))
    print("checked %d committed shadow-flag entries; all dormant" % checked)


def code_lines(path, comment_markers):
    """(line number, code) pairs with comments stripped, so prose never satisfies a check."""
    lines = []
    for number, line in enumerate(open(path, encoding="utf-8").read().split("\n"), start=1):
        code = line
        for marker in comment_markers:
            code = code.split(marker)[0]
        if code.strip():
            lines.append((number, code))
    return lines


def check_pipelines_do_not_swallow_failures():
    sources = [("Jenkinsfile", ("//",)), ("Jenkinsfile.legacy", ("//",)), (RUNNER, ("#",))]
    for name, markers in sources:
        lines = code_lines(os.path.join(REPO, name), markers)
        for number, code in lines:
            if "gwb" not in code and "golden" not in code:
                continue
            for pattern in SWALLOW_PATTERNS:
                if re.search(pattern, code):
                    fail("%s:%d: test invocation swallows failures (%r)" % (name, number, pattern))
        if name != RUNNER and not any(re.search(r"run-golden-master\.sh", code) for _n, code in lines):
            fail("%s: no executable invocation of %s - the blocking golden-master stage is gone "
                 "(a comment mentioning it does not count)" % (name, RUNNER))
    print("checked both pipelines and %s for failure-swallowing or missing test invocations" % RUNNER)


# The pre-existing per-environment rating key (read by RatingEngineShadow since Phase 2).
# Shadowing may only ever run where it was ALREADY true (dev/dev2/sit); production and every
# other committed environment must stay false until a Phase 3C decision flips it explicitly.
RATING_KEY = "po.feature.newratingengine.enabled"
RATING_KEY_ALLOWED_TRUE = {"dev", "dev2", "sit"}


def check_rating_flag_environments():
    environments = os.path.join(REPO, "environments")
    checked = 0
    for env_name in sorted(os.listdir(environments)):
        path = os.path.join(environments, env_name, "policycenter.properties")
        if not os.path.isfile(path):
            continue
        for number, line in enumerate(open(path, encoding="utf-8"), start=1):
            stripped = line.strip()
            if not stripped.startswith(RATING_KEY):
                continue
            checked += 1
            value = stripped.partition("=")[2].split("#")[0].strip().lower()
            if value == "true" and env_name not in RATING_KEY_ALLOWED_TRUE:
                fail("%s:%d: %s=true - the rating shadow may only run in %s until Phase 3C"
                     % (os.path.relpath(path, REPO), number, RATING_KEY,
                        "/".join(sorted(RATING_KEY_ALLOWED_TRUE))))
    print("checked %s in %d environment files" % (RATING_KEY, checked))


def check_brand_xref_pinned():
    """brand_xref.csv rows must equal the rows pinned in BrandDirectoryCandidate.XREF_ROWS
    (all four centre copies). Drift between the csv and the candidate is a Stream 2B breach
    that must surface here, not silently in a shadow window."""
    csv_path = os.path.join(REPO, "integration/polaris/mappings/brand_xref.csv")
    csv_rows = [line.strip() for line in open(csv_path, encoding="utf-8").read().split("\n")[1:] if line.strip()]
    candidates = [
        "claimcenter/config/gsrc/albion/util/BrandDirectoryCandidate.gs",
        "policycenter/config/gsrc/albion/util/BrandDirectoryCandidate.gs",
        "billingcenter/config/gsrc/albion/util/BrandDirectoryCandidate.gs",
        "contactmanager/modules/configuration/gsrc/albion/util/BrandDirectoryCandidate.gs",
    ]
    for rel in candidates:
        source = open(os.path.join(REPO, rel), encoding="utf-8").read()
        for row in csv_rows:
            if '"%s"' % row not in source:
                fail("%s: brand_xref.csv row %r is not pinned in XREF_ROWS - csv and candidate "
                     "have drifted (AGI-5452 / AGI-30921)" % (rel, row))
    print("checked %d brand_xref.csv rows against all four BrandDirectoryCandidate copies" % len(csv_rows))


def main():
    check_suite_classes()
    check_fixtures()
    check_scaffold_is_dormant()
    check_pipelines_do_not_swallow_failures()
    check_rating_flag_environments()
    check_brand_xref_pinned()
    if failures:
        print("\nPhase 1 scaffold verification FAILED:")
        for message in failures:
            print("  - %s" % message)
        return 1
    print("\nPhase 1 scaffold verification passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())

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
    "claimcenter/config/gtest/albion/integration/ipt/goldenmaster":
        "claimcenter/config/gtest/albion/integration/ipt/IptRecordBuilderGoldenMasterTest.gs",
    "contactmanager/modules/configuration/gtest/albion/integration/polaris_mf/goldenmaster":
        "contactmanager/modules/configuration/gtest/albion/integration/polaris_mf/PolarisMfRecordBuilderGoldenMasterTest.gs",
}

# Minimum committed fixture count per directory. Adding fixtures is welcome; losing them is not,
# so raise these numbers with the fixtures and never lower them without an explicit decision.
MIN_FIXTURES = {
    "claimcenter/config/gtest/albion/integration/ipt/goldenmaster": 6,
    "contactmanager/modules/configuration/gtest/albion/integration/polaris_mf/goldenmaster": 10,
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
            if len(record) != RECORD_LENGTH:
                fail("%s/%s: expected.record is %d bytes, not %d"
                     % (fixture_dir, name, len(record), RECORD_LENGTH))
            if record != prefix + " " * (RECORD_LENGTH - len(prefix)):
                fail("%s/%s: expected.record is not expected.recordPrefix padded with filler"
                     % (fixture_dir, name))
            if int(fixture.get("expected.length", "0")) != RECORD_LENGTH:
                fail("%s/%s: expected.length must be %d" % (fixture_dir, name, RECORD_LENGTH))
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
                if not stripped or stripped.startswith("#") or ".feature.shadow." not in stripped:
                    continue
                checked += 1
                key, _, value = stripped.partition("=")
                value = value.split("#")[0].strip().lower()
                if value != "false":
                    fail("%s:%d: %s=%s - the Phase 1 shadow scaffold must be dormant in every "
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


def main():
    check_suite_classes()
    check_fixtures()
    check_scaffold_is_dormant()
    check_pipelines_do_not_swallow_failures()
    if failures:
        print("\nPhase 1 scaffold verification FAILED:")
        for message in failures:
            print("  - %s" % message)
        return 1
    print("\nPhase 1 scaffold verification passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())

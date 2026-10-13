#!/bin/sh
# Plain JUnit 4 tests of the record builders and renewal rule classes on the open-source Gosu runtime
# (tools/replay/junit/README.md). One JVM per centre, because each centre's gsrc defines its own copies of the shared
# albion.* packages. Exits non-zero when any test fails.
# GOSU_LIB: directory holding the open-source Gosu 1.17.5 runtime jars (tools/replay/README.md).
# JUNIT_LIB: directory holding junit-4.13.2.jar and hamcrest-core-1.3.jar (default: GOSU_LIB). Nothing is downloaded.
# JUNIT_TESTS: space-separated subset of the test classes below (default: all of them).
set -eu
: "${GOSU_LIB:?set GOSU_LIB to the directory holding the Gosu 1.17.5 runtime jars (see tools/replay/README.md)}"
JUNIT_LIB=${JUNIT_LIB:-$GOSU_LIB}
for jar in junit-4.13.2.jar hamcrest-core-1.3.jar; do
  [ -f "$JUNIT_LIB/$jar" ] || { echo "$jar not found in JUNIT_LIB=$JUNIT_LIB (see tools/replay/junit/README.md)" >&2; exit 2; }
done
ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
LIBS="$JUNIT_LIB/junit-4.13.2.jar:$JUNIT_LIB/hamcrest-core-1.3.jar:$GOSU_LIB/*"
# shellcheck disable=SC2046
javac -d "$WORK/classes" -cp "$LIBS" $(find "$ROOT/tools/replay/standins" "$ROOT/tools/replay/junit/src" -name '*.java')

GROUPS_="cc claimcenter/config/gsrc IptRecordBuilderGoldenTest
pc policycenter/config/gsrc PolarisMfPcRecordBuilderGoldenTest AlbionPS215GateRuleTest AlbionRenewalEligibilityRulesRuleTest
cm contactmanager/modules/configuration/gsrc PolarisMfCmRecordBuilderGoldenTest PrintvPR16RecordBuilderGoldenTest PrintvPR17RecordBuilderTest"

STATUS=0
echo "$GROUPS_" > "$WORK/groups"
while read -r centre gsrc tests; do
  selected=""
  for t in $tests; do
    case " ${JUNIT_TESTS:-$t} " in *" $t "*) selected="$selected $t" ;; esac
  done
  [ -n "$selected" ] || continue
  echo "JUNIT $centre:$selected"
  # shellcheck disable=SC2086
  java -cp "$WORK/classes:$LIBS" -Dreplay.gosu.classpath="$ROOT/$gsrc" org.junit.runner.JUnitCore $selected || STATUS=1
done < "$WORK/groups"
exit $STATUS

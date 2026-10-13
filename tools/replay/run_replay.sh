#!/bin/sh
# Offline replay of the synthetic fixtures through the replay profiles (tools/replay/README.md): the legacy and
# candidate record builders of every wired feed, the PolicyCenter PS21/5 and renewal eligibility rules, and the
# ContactManager PRINTV PR16 -> PR17 record change. Every profile also runs a negative control that must come out RED.
# Writes tools/replay/evidence/replay-evidence.json and exits non-zero unless the evidence is GREEN.
# GOSU_LIB: directory holding the open-source Gosu 1.17.5 runtime jars (tools/replay/README.md). No Guidewire
# distribution is needed or used.
# REPLAY_PROFILES: space-separated subset of the profiles below (default: all of them).
set -eu
: "${GOSU_LIB:?set GOSU_LIB to the directory holding the Gosu 1.17.5 runtime jars (see tools/replay/README.md)}"
ALL_PROFILES="IPT_CC POLARIS_MF_PC POLARIS_MF_CM PS215_PC ELIGIBILITY_PC PRINTV_PR17_CM"
PROFILES=${REPLAY_PROFILES:-$ALL_PROFILES}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK/standins"
# shellcheck disable=SC2046
javac -d "$WORK/standins" $(find "$ROOT/tools/replay/standins" -name '*.java')

# profile <name>: sets GSRC, PROGRAM, FEED, FIXTURE, CENTRE and the program's extra system properties (ARGS)
profile() {
  case "$1" in
    IPT_CC) GSRC=claimcenter/config/gsrc PROGRAM=ReplayHarness.gsp FEED=IPT FIXTURE=ipt_cc.csv CENTRE=cc
      ARGS="-Dreplay.legacy=albion.integration.ipt.IptRecordBuilder -Dreplay.candidate=albion.integration.ipt.IptRecordBuilderCandidate" ;;
    POLARIS_MF_PC) GSRC=policycenter/config/gsrc PROGRAM=ReplayHarness.gsp FEED=POLARIS_MF FIXTURE=polaris_mf_pc.csv CENTRE=pc
      ARGS="-Dreplay.legacy=albion.integration.polaris_mf.PolarisMfRecordBuilderV2 -Dreplay.candidate=albion.integration.polaris_mf.PolarisMfRecordBuilderCandidate" ;;
    POLARIS_MF_CM) GSRC=contactmanager/modules/configuration/gsrc PROGRAM=ReplayHarness.gsp FEED=POLARIS_MF FIXTURE=polaris_mf_cm.csv CENTRE=cm
      ARGS="-Dreplay.legacy=albion.integration.polaris_mf.PolarisMfRecordBuilder -Dreplay.candidate=albion.integration.polaris_mf.PolarisMfRecordBuilderCandidate" ;;
    PS215_PC) GSRC=policycenter/config/gsrc PROGRAM=RuleReplayHarness.gsp FEED=PS215 FIXTURE=renewal_ps215.csv CENTRE=pc
      ARGS="-Dreplay.rule=PS215" ;;
    ELIGIBILITY_PC) GSRC=policycenter/config/gsrc PROGRAM=RuleReplayHarness.gsp FEED=RENEWAL_ELIGIBILITY FIXTURE=renewal_eligibility.csv CENTRE=pc
      ARGS="-Dreplay.rule=ELIGIBILITY" ;;
    PRINTV_PR17_CM) GSRC=contactmanager/modules/configuration/gsrc PROGRAM=PrintvReplayHarness.gsp FEED=PRINTV FIXTURE=printv_pr17.csv CENTRE=cm
      ARGS="" ;;
    *) echo "unknown replay profile $1 (profiles: $ALL_PROFILES)" >&2; exit 2 ;;
  esac
}

replay() {  # <out|-> <negativeControl>
  # shellcheck disable=SC2086
  java -cp "$WORK/standins:$GOSU_LIB/*" -Dreplay.feed="$FEED" -Dreplay.fixture="$ROOT/tools/replay/fixtures/$FIXTURE" \
      $ARGS ${1:+-Dreplay.out="$1"} -Dreplay.negativeControl="$2" \
      gw.lang.Gosu -classpath "$ROOT/$GSRC:$ROOT/tools/replay/gsrc" "$ROOT/tools/replay/$PROGRAM"
}

NEGATIVE=RED
RUNS=""
for name in $PROFILES; do
  profile "$name"
  replay "$WORK/$name.json" false
  [ -s "$WORK/$name.json" ] || { echo "replay failed for $name" >&2; exit 1; }
  replay "" true | tee "$WORK/$name.negative"
  if grep -q "status=RED" "$WORK/$name.negative"; then NEG=RED; else NEG=GREEN; NEGATIVE=GREEN; fi
  RUNS="$RUNS $name=$ROOT/tools/replay/fixtures/$FIXTURE:$WORK/$name.json:$NEG"
done
# shellcheck disable=SC2086
python3 "$ROOT/tools/replay/merge_evidence.py" "$ROOT/tools/replay/evidence/replay-evidence.json" "$NEGATIVE" $RUNS

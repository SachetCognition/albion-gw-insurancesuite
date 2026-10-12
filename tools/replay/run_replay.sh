#!/bin/sh
# Offline replay of the synthetic fixtures through the legacy and candidate record builders of every wired feed.
# Writes tools/replay/evidence/replay-evidence.json and exits non-zero unless the evidence is GREEN.
# GOSU_LIB: directory holding the open-source Gosu 1.17.5 runtime jars (tools/replay/README.md). No Guidewire
# distribution is needed or used.
set -eu
: "${GOSU_LIB:?set GOSU_LIB to the directory holding the Gosu 1.17.5 runtime jars (see tools/replay/README.md)}"
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK/standins"
javac -d "$WORK/standins" "$ROOT"/tools/replay/standins/*.java

replay() {  # <centre gsrc> <feed> <fixture> <legacy> <candidate> <out|-> <negativeControl>
  java -cp "$GOSU_LIB/*:$WORK/standins" -Dreplay.feed="$2" -Dreplay.fixture="$ROOT/tools/replay/fixtures/$3" \
      -Dreplay.legacy="$4" -Dreplay.candidate="$5" ${6:+-Dreplay.out="$6"} -Dreplay.negativeControl="$7" \
      gw.lang.Gosu -classpath "$ROOT/$1" "$ROOT/tools/replay/ReplayHarness.gsp"
}

FEEDS="claimcenter/config/gsrc IPT ipt_cc.csv albion.integration.ipt.IptRecordBuilder albion.integration.ipt.IptRecordBuilderCandidate cc
policycenter/config/gsrc POLARIS_MF polaris_mf_pc.csv albion.integration.polaris_mf.PolarisMfRecordBuilderV2 albion.integration.polaris_mf.PolarisMfRecordBuilderCandidate pc
contactmanager/modules/configuration/gsrc POLARIS_MF polaris_mf_cm.csv albion.integration.polaris_mf.PolarisMfRecordBuilder albion.integration.polaris_mf.PolarisMfRecordBuilderCandidate cm"

NEGATIVE=RED
PAIRS=""
echo "$FEEDS" | {
  while read -r gsrc feed fixture legacy candidate centre; do
    replay "$gsrc" "$feed" "$fixture" "$legacy" "$candidate" "$WORK/$centre.json" false
    [ -s "$WORK/$centre.json" ] || { echo "replay failed for $centre $feed" >&2; exit 1; }
    replay "$gsrc" "$feed" "$fixture" "$legacy" "$candidate" "" true | tee "$WORK/$centre.negative"
    grep -q "status=RED" "$WORK/$centre.negative" || NEGATIVE=GREEN
    PAIRS="$PAIRS $ROOT/tools/replay/fixtures/$fixture:$WORK/$centre.json"
  done
  # shellcheck disable=SC2086
  python3 "$ROOT/tools/replay/merge_evidence.py" "$ROOT/tools/replay/evidence/replay-evidence.json" "$NEGATIVE" $PAIRS
}

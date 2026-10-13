#!/usr/bin/env bash
# Records the terminal part of the Phase 1 demo as asciinema v2 casts:
#   docs/demo/phase1/cli-replay.cast    tools/replay/run_replay.sh (all profiles, GREEN, with negative controls)
#   docs/demo/phase1/cli-evidence.cast  summary of tools/replay/evidence/replay-evidence.json
#   docs/demo/phase1/cli-checks.cast    brand/config drift check and Guidewire coherence check
# Fails unless the replay is GREEN with a RED negative control and both checks exit 0.
# Env: GOSU_LIB (required), REPLAY_PROFILES (optional subset), KEEP_EVIDENCE=1 keeps the regenerated evidence file
# (default: the evidence file is restored to its state before the run).
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
PHASE1=$(cd "$HERE/.." && pwd)
ROOT=$(cd "$HERE/../../../.." && pwd)
EVIDENCE="$ROOT/tools/replay/evidence/replay-evidence.json"
COLS=${CAST_COLS:-120}
ROWS=${CAST_ROWS:-32}

die() { echo "record_cli: $*" >&2; exit 1; }

: "${GOSU_LIB:?set GOSU_LIB to the directory holding the Gosu 1.17.5 runtime jars (see tools/replay/README.md)}"
ls "$GOSU_LIB"/gosu-core-1.17.5.jar >/dev/null 2>&1 || die "GOSU_LIB=$GOSU_LIB does not contain gosu-core-1.17.5.jar"
for tool in java javac python3 git tar; do command -v "$tool" >/dev/null || die "$tool not found"; done
if ! command -v asciinema >/dev/null; then
  echo "record_cli: installing asciinema 2.4.0 with pip" >&2
  python3 -m pip install --user --quiet asciinema==2.4.0 || die "could not install asciinema"
  export PATH="$HOME/.local/bin:$PATH"
fi
case "$(asciinema --version)" in "asciinema 2."*) ;; *) die "asciinema 2.x is required (v2 cast format)" ;; esac

STATE=$(mktemp -d)
BACKUP="$STATE/replay-evidence.json"
[ -f "$EVIDENCE" ] && cp "$EVIDENCE" "$BACKUP"
restore() {
  if [ "${KEEP_EVIDENCE:-0}" != "1" ] && [ -f "$BACKUP" ]; then cp "$BACKUP" "$EVIDENCE"; fi
  rm -rf "$STATE"
}
trap restore EXIT

export GOSU_LIB ${REPLAY_PROFILES:+REPLAY_PROFILES}
for scene in replay evidence checks; do
  echo "record_cli: recording cli-$scene.cast" >&2
  TERM=xterm-256color asciinema rec --overwrite --quiet --cols "$COLS" --rows "$ROWS" --idle-time-limit 2 \
    --title "Phase 1 renewal compliance: $scene" \
    --command "bash '$HERE/scene.sh' $scene '$STATE'" "$PHASE1/cli-$scene.cast" </dev/null
  [ -f "$STATE/$scene.rc" ] || die "scene $scene did not complete"
  rc=$(cat "$STATE/$scene.rc")
  [ "$rc" = "0" ] || die "scene $scene failed (exit $rc); see $PHASE1/cli-$scene.cast"
done

python3 - "$EVIDENCE" <<'PY' || die "replay evidence is not GREEN with a RED negative control"
import json, sys
d = json.load(open(sys.argv[1], encoding="utf-8"))
sys.exit(0 if d.get("status") == "GREEN" and d.get("negativeControl") == "RED" and d.get("runs") else 1)
PY
grep -q 'status=RED (negative control)' "$PHASE1/cli-replay.cast" || die "negative control output missing from cli-replay.cast"
echo "record_cli: casts written to $PHASE1" >&2

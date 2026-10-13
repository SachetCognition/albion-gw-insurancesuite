#!/usr/bin/env bash
# One terminal scene of the Phase 1 demo, run inside `asciinema rec` by record_cli.sh.
# Usage: scene.sh replay|evidence|checks <state dir>. The scene's exit code is written to <state dir>/<scene>.rc
# because asciinema does not pass it through.
set -u
SCENE=$1
STATE=$2
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
cd "$ROOT"

say() { printf '\033[2m# %s\033[0m\n' "$*"; }
prompt() {  # types the command at a prompt, then runs it
  printf '\033[1;32malbion\033[0m:\033[1;34m~/albion-gw-insurancesuite\033[0m$ '
  local text=$1 i
  for ((i = 0; i < ${#text}; i++)); do printf '%s' "${text:i:1}"; sleep 0.012; done
  printf '\n'
  sleep 0.3
}

rc=0
case "$SCENE" in
  replay)
    say "Offline replay: synthetic fixtures through legacy and candidate code, open-source Gosu runtime"
    say "Profiles: ${REPLAY_PROFILES:-all (REPLAY_PROFILES unset)}; each profile is followed by its negative control"
    sleep 1
    prompt "GOSU_LIB=${GOSU_LIB/#$HOME/\~} tools/replay/run_replay.sh"
    tools/replay/run_replay.sh || rc=$?
    ;;
  evidence)
    say "Replay evidence written by the run above (tools/replay/evidence/replay-evidence.json)"
    sleep 1
    prompt "python3 docs/demo/phase1/capture/evidence_summary.py"
    python3 docs/demo/phase1/capture/evidence_summary.py || rc=$?
    ;;
  checks)
    say "Repository gates, run on a clean copy of the working tree (git ls-files, node_modules excluded)"
    CLEAN=$(mktemp -d)
    trap 'rm -rf "$CLEAN"' EXIT
    git ls-files -co --exclude-standard -z | grep -zv '/node_modules/' | tar --null -T - -cf - | tar -xf - -C "$CLEAN"
    cd "$CLEAN"
    sleep 1
    prompt "python3 tools/scripts/check_brand_config_drift.py"
    python3 tools/scripts/check_brand_config_drift.py || rc=$?
    echo "exit code: $rc"
    sleep 1
    prompt "python3 tools/scripts/check_gw_coherence.py ."
    c=0
    python3 tools/scripts/check_gw_coherence.py . || c=$?
    echo "exit code: $c"
    [ "$rc" -ne 0 ] || rc=$c
    ;;
  *)
    echo "unknown scene: $SCENE" >&2
    rc=2
    ;;
esac
echo "$rc" > "$STATE/$SCENE.rc"
sleep 2

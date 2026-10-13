#!/usr/bin/env bash
# Builds the Phase 1 renewal demo video in one command:
#   1. records the terminal casts (record_cli.sh: replay GREEN with negative controls, evidence summary, repo checks)
#   2. renders each cast and the title cards to video (render_terminal.mjs, asciinema-player from node_modules)
#   3. drives the renewal mock UI journey (record_ui.mjs)
#   4. encodes every clip to docs/demo/phase1/clips/*.mp4 and concatenates docs/demo/phase1/phase1-renewal-demo.mp4
#      (H.264, yuv420p, 1280x720, 25 fps, no audio, < 25 MB)
# Fails before recording anything if a precondition is missing.
# Env: GOSU_LIB (required); PORT (default 4317) or MOCK_UI_URL; MOCK_UI_START=0 to never start tools/mock-ui itself;
#      REPLAY_PROFILES, KEEP_EVIDENCE (see record_cli.sh); PW_CHANNEL (browser channel instead of bundled Chromium);
#      SKIP_BROWSER_INSTALL=1; KEEP_WORK=1 keeps the intermediate WebM files.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
PHASE1=$(cd "$HERE/.." && pwd)
ROOT=$(cd "$HERE/../../../.." && pwd)
PORT=${PORT:-4317}
MOCK_UI_URL=${MOCK_UI_URL:-http://localhost:$PORT}
MOCK_UI_DIR="$ROOT/tools/mock-ui"
MAX_BYTES=$((25 * 1024 * 1024))
CRF=${CRF:-26}

die() { echo "build_video: $*" >&2; exit 1; }
log() { echo "build_video: $*" >&2; }

# Preconditions
: "${GOSU_LIB:?set GOSU_LIB to the directory holding the Gosu 1.17.5 runtime jars (see tools/replay/README.md)}"
ls "$GOSU_LIB"/gosu-core-1.17.5.jar >/dev/null 2>&1 || die "GOSU_LIB=$GOSU_LIB does not contain gosu-core-1.17.5.jar"
for tool in node npm ffmpeg ffprobe curl java javac python3 git; do command -v "$tool" >/dev/null || die "$tool not found"; done
node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)' || die "node 18 or later is required"
case "$(ffmpeg -hide_banner -encoders 2>/dev/null)" in *libx264*) ;; *) die "ffmpeg lacks the libx264 encoder" ;; esac

WORK=$(mktemp -d)
UI_PID=""
cleanup() {
  [ -n "$UI_PID" ] && kill "$UI_PID" 2>/dev/null || true
  if [ "${KEEP_WORK:-0}" = "1" ]; then log "intermediate files kept in $WORK"; else rm -rf "$WORK"; fi
}
trap cleanup EXIT

ui_up() { curl -fsS -o /dev/null --max-time 5 "$MOCK_UI_URL/"; }
if ui_up; then
  log "using the mock UI already running at $MOCK_UI_URL"
elif [ "${MOCK_UI_START:-1}" != "0" ] && [ -f "$MOCK_UI_DIR/package.json" ]; then
  log "starting the mock UI from tools/mock-ui on port $PORT"
  (cd "$MOCK_UI_DIR" && npm ci --no-audit --no-fund >&2)
  (cd "$MOCK_UI_DIR" && PORT=$PORT exec npm start >"$WORK/mock-ui.log" 2>&1) &
  UI_PID=$!
  for _ in $(seq 1 60); do ui_up && break; sleep 1; done
  ui_up || { cat "$WORK/mock-ui.log" >&2; die "mock UI did not come up at $MOCK_UI_URL"; }
else
  die "mock UI not reachable at $MOCK_UI_URL and tools/mock-ui is not available to start (MOCK_UI_START=${MOCK_UI_START:-1})"
fi
curl -fsS -o /dev/null --max-time 5 -X POST "$MOCK_UI_URL/api/reset" || die "POST $MOCK_UI_URL/api/reset failed"

log "installing capture dependencies (package-lock.json)"
(cd "$HERE" && npm ci --no-audit --no-fund >&2)
[ "${SKIP_BROWSER_INSTALL:-0}" = "1" ] || [ -n "${PW_CHANNEL:-}" ] || (cd "$HERE" && npx playwright install chromium >&2)

# 1. Terminal casts
"$HERE/record_cli.sh"

# 2. Title cards and casts to WebM
cd "$HERE"
node render_terminal.mjs card "$WORK/00-intro.webm" "Phase 1 renewal compliance" \
  "PS21/5 price-walking gate · renewal eligibility and suppression
ICOBS 6A renewal disclosure (PRINTV PR17) · offline replay evidence · renewal journey" 5
node render_terminal.mjs cast "$PHASE1/cli-replay.cast" "$WORK/01-cli-replay.webm" \
  "Offline replay: legacy vs candidate, every profile GREEN" \
  "tools/replay/run_replay.sh · each profile followed by its negative control, which must come out RED"
node render_terminal.mjs cast "$PHASE1/cli-evidence.cast" "$WORK/02-cli-evidence.webm" \
  "Replay evidence" "tools/replay/evidence/replay-evidence.json · status, fixtures and per-run totals"
node render_terminal.mjs cast "$PHASE1/cli-checks.cast" "$WORK/03-cli-checks.webm" \
  "Repository gates pass" "Brand/config drift check and Guidewire coherence check, 0 findings"

# 3. Mock UI journey
MOCK_UI_URL="$MOCK_UI_URL" node record_ui.mjs "$WORK"
node render_terminal.mjs card "$WORK/99-outro.webm" "Regenerate this video" \
  "GOSU_LIB=<gosu jars> docs/demo/phase1/capture/build_video.sh
Index of clips and the gaps they close: docs/demo/phase1/README.md" 4

# 4. Encode and concatenate
CLIPS_DIR="$PHASE1/clips"
rm -rf "$CLIPS_DIR"
mkdir -p "$CLIPS_DIR"
ORDER="00-intro 01-cli-replay 02-cli-evidence 03-cli-checks"
n=10
while read -r ui; do ORDER="$ORDER $n-${ui#ui-[0-9][0-9]-}"; cp "$WORK/$ui.webm" "$WORK/$n-${ui#ui-[0-9][0-9]-}.webm"
  cp "$WORK/$ui.webm.trim" "$WORK/$n-${ui#ui-[0-9][0-9]-}.webm.trim"; n=$((n + 1)); done <"$WORK/ui-clips.txt"
ORDER="$ORDER 99-outro"

encode() {  # <in.webm> <out.mp4> <crf>
  local trim=0
  [ -f "$1.trim" ] && trim=$(cat "$1.trim")
  ffmpeg -v error -y -ss "$trim" -i "$1" -an \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x0b1526,fps=25,format=yuv420p" \
    -c:v libx264 -preset medium -crf "$3" -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart "$2"
}

: >"$WORK/concat.txt"
for clip in $ORDER; do
  [ -s "$WORK/$clip.webm" ] || die "missing clip $clip"
  encode "$WORK/$clip.webm" "$CLIPS_DIR/$clip.mp4" "$CRF"
  echo "file '$CLIPS_DIR/$clip.mp4'" >>"$WORK/concat.txt"
done
OUT="$PHASE1/phase1-renewal-demo.mp4"
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/concat.txt" -c copy -movflags +faststart "$OUT"
size=$(stat -c %s "$OUT")
if [ "$size" -ge "$MAX_BYTES" ]; then
  log "$OUT is $size bytes; re-encoding at a higher CRF"
  ffmpeg -v error -y -i "$OUT" -c:v libx264 -preset slow -crf 32 -pix_fmt yuv420p -an -movflags +faststart "$WORK/smaller.mp4"
  mv "$WORK/smaller.mp4" "$OUT"
  size=$(stat -c %s "$OUT")
  [ "$size" -lt "$MAX_BYTES" ] || die "$OUT is still $size bytes (limit $MAX_BYTES)"
fi
probe=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,pix_fmt,width,height -of csv=p=0 "$OUT")
[ "$probe" = "h264,1280,720,yuv420p" ] || die "unexpected video stream: $probe"
duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
log "wrote $OUT ($probe, ${duration}s, $size bytes) and $(echo $ORDER | wc -w) clips in $CLIPS_DIR"

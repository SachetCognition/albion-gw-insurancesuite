# Phase 1 renewal compliance: demo video

`phase1-renewal-demo.mp4` (H.264, yuv420p, 1280x720, 25 fps, no audio, under 25 MB) walks through the Phase 1
renewal compliance changes: the PS21/5 price-walking gate, the renewal eligibility and suppression screen, the
ICOBS 6A/6B renewal disclosure in the PRINTV PR17 record, the offline replay evidence and the renewal journey in the
mock UI. It is the concatenation of the clips in `clips/`, in the order below. Every clip is regenerated from the
repository by one command (see Regenerate).

**All data is synthetic and every run is offline.** Policy references (`SYN-REN-*`, `HR12345678A`), surnames,
postcodes and premiums are invented; the replay runs the repository's code on the open-source Gosu runtime against
synthetic fixtures, and the UI is the local mock in `tools/mock-ui/`. Nothing shown is a production result.

## Index

| Clip | Source | What it shows | Gap it closes |
|---|---|---|---|
| `clips/00-intro.mp4` | title card | Scope of the video | – |
| `clips/01-cli-replay.mp4` | `cli-replay.cast` | `tools/replay/run_replay.sh` over every profile (`IPT_CC`, `POLARIS_MF_PC`, `POLARIS_MF_CM`, `PS215_PC`, `ELIGIBILITY_PC`, `PRINTV_PR17_CM`); each profile GREEN, each negative control RED | Replay evidence GREEN with a negative control; the PS21/5 gate unified in `AlbionPS215Gate` and enforced through the heritage `_v1` binding (`PS215_PC`); the eligibility screen (`ELIGIBILITY_PC`); PR17 alongside an unchanged PR16 (`PRINTV_PR17_CM`) |
| `clips/02-cli-evidence.mp4` | `cli-evidence.cast` | `capture/evidence_summary.py`: status, negative control, fixtures with hashes, per-run totals of `tools/replay/evidence/replay-evidence.json` | Replay evidence GREEN with a negative control |
| `clips/03-cli-checks.mp4` | `cli-checks.cast` | `tools/scripts/check_brand_config_drift.py` and `tools/scripts/check_gw_coherence.py .`, both exit 0 with 0 findings | Guidewire coherence of the new fields and activity patterns |
| `clips/10-pending-invite.mp4` | mock UI | Journey step 1: PENDING renewal `SYN-REN-0004`, invite with prior premium, renewal premium, equivalent new business price and the shopping-around prompt (policy year 4) | ICOBS 6A/6B renewal disclosure |
| `clips/11-eligibility-pass.mp4` | mock UI | Journey step 2: `SYN-REN-0004` has no block codes | Renewal eligibility/suppression screen |
| `clips/12-ps215-gate.mp4` | mock UI | Journey step 3: `SYN-REN-0004` passes; breach variant `SYN-REN-0002` returns `PRICE_WALK_BREACH` with the `COMPLIANCE-BREACH\|PS215` log line; `SYN-REN-0005` (renewal equal to new business price) passes | PS21/5 gate; mock-UI breach path |
| `clips/13-vulnerability-banner.mp4` | mock UI | `SYN-REN-0003`: FG21/1 vulnerability banner (`VULNERABILITY_REVIEW`) | Renewal eligibility/suppression screen |
| `clips/14-pr16-pr17-records.mp4` | mock UI | Journey step 4: PR16 (250 bytes) and PR17 (300 bytes) for `SYN-REN-0004`; positions 005-075 identical | ICOBS 6A/6B disclosure in PR17 with PR16 unchanged |
| `clips/15-opt-out.mp4` | mock UI | Journey step 5: opt-out captured on `/optout/SYN-REN-0004`, suppression flag shown, PR17 opt-out flag (position 124) re-read | Mock-UI opt-out path; suppression |
| `clips/16-auto-renew-blocked.mp4` | mock UI | Journey steps 6-7: auto-renewal blocked with `OPT_OUT`, journey summary | Mock-UI opt-out path; eligibility screen |
| `clips/17-admin-eligibility.mp4` | mock UI | `/admin/eligibility`: block codes for every seed policy | Renewal eligibility/suppression screen |
| `clips/18-heritage-cics.mp4` | mock UI | Heritage reference `HR12345678A` answered by the simulated CICS passthrough, with the measured delay | Heritage routing stays on the passthrough |
| `clips/99-outro.mp4` | title card | How to regenerate | – |

The casts (`cli-replay.cast`, `cli-evidence.cast`, `cli-checks.cast`) are asciinema v2 files and can be replayed in a
terminal with `asciinema play <file>`.

## Regenerate

```
GOSU_LIB=<dir with the Gosu 1.17.5 runtime jars> docs/demo/phase1/capture/build_video.sh
```

`build_video.sh` checks its preconditions first and stops with a message if one is missing: `GOSU_LIB`, the mock UI
(reachable at `http://localhost:${PORT:-4317}`, otherwise started from `tools/mock-ui` with `npm ci && npm start`),
`POST /api/reset`, Node.js 18+, ffmpeg with libx264, Java 11 and Python 3. It then:

1. `capture/record_cli.sh` records the three casts with asciinema 2.x (installed with pip when absent). It fails
   unless the replay exits 0, every negative control comes out RED, the evidence file is GREEN and both repository
   checks exit 0. The checks run on a clean copy of the working tree (`git ls-files`, `node_modules` excluded), so
   local dependency folders do not produce findings. The regenerated evidence file is restored afterwards unless
   `KEEP_EVIDENCE=1`; `REPLAY_PROFILES` selects a subset of profiles.
2. `capture/render_terminal.mjs` renders each cast, and the title cards, to video in headless Chromium with
   `asciinema-player` loaded from `capture/node_modules` (no network).
3. `capture/record_ui.mjs` resets the mock UI and drives the journey with Playwright through the mock UI routes
   (`/`, `/invite/:ref`, `/optout/:ref`, `/ps215/:ref`, `/records/:ref`, `/admin/eligibility`, `/journey?step=N`) and
   their `data-testid`s, adding a caption per step. Captions that quote values (premiums, PS21/5 result, record
   positions, the heritage delay) are read from the page during the run. The run fails if an expected element or
   code (`PRICE_WALK_BREACH`, `COMPLIANCE-BREACH|PS215`, `OPT_OUT`, `VULNERABILITY_REVIEW`) is missing.
4. ffmpeg encodes each clip to `clips/*.mp4` and concatenates them into `phase1-renewal-demo.mp4`, then checks codec,
   pixel format, size (1280x720) and file size (under 25 MB).

Other options: `PORT` or `MOCK_UI_URL`, `MOCK_UI_START=0` (never start the mock UI), `PW_CHANNEL=chrome` (use an
installed browser instead of the bundled Chromium), `SKIP_BROWSER_INSTALL=1`, `STEP_PAUSE_MS`, `CAST_SPEED`,
`KEEP_WORK=1` (keep the intermediate WebM files).

## Prerequisites

- Gosu runtime jars in `GOSU_LIB`: `gosu-core` and `gosu-core-api` 1.17.5, `gw-asm-all` 9.2, `manifold`,
  `manifold-util` and `manifold-rt` 2022.1.33 (see `tools/replay/README.md`). No Guidewire distribution is used.
- Java 11, Python 3, Node.js 18+ with npm, ffmpeg with libx264, git.
- Capture dependencies are exact-pinned in `capture/package.json` and `capture/package-lock.json` (`playwright`
  1.61.1, `asciinema-player` 3.15.1); `npm ci` installs them into `capture/node_modules`, which is not committed.
  The first run downloads the Playwright Chromium build once.

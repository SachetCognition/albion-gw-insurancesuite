# Phase 2 Reconciliation Status

Per-component, per-brand reconciliation status for the strangler migration. This is the
report the Phase 3 hard gate reads: **a component/brand may be cut over in dev ONLY when
its row is GREEN_REPLAY (offline replay evidence), and in any later environment ONLY when
its live shadow window is GREEN within the documented tolerance**
(`docs/architecture/CONTROLS-AND-TOLERANCES.md`). Anything not green stays on legacy.

## How to read this report

Three distinct kinds of evidence, deliberately not conflated:

| Evidence | What it proves | Where it comes from |
|---|---|---|
| **Golden-master parity (CI)** | Candidate reproduces pinned production bytes for every committed fixture and the full characterization matrix (nulls, half-hydrated beans, over-length, negative overpunch, 29-Feb, every brand, unknown brand). Blocking in both pipelines via `tools/ci/golden-master-suite.txt`. | This repository, every build |
| **Offline replay (GREEN_REPLAY)** | The REAL legacy and candidate Gosu classes, executed on a standalone Gosu runtime through the REAL `ShadowRunner`, byte-exact over golden fixtures + a full synthetic matrix + the independently scanned legacy contracts, plus a legacy-vs-candidate throughput micro-benchmark. 14,069 cases, 0 failures — see `PHASE2-REPLAY-EVIDENCE.md`. Permits the cut-over flag in **dev only**. | `tools/replay/` harness; archived under `tools/replay/evidence/` |
| **Shadow window (non-prod, GREEN)** | Candidate matches legacy over REAL traffic in a live Guidewire runtime for a sustained window; diffs land as structured `ReconciliationResult` records, zero unexplained diffs required. Only this (plus the load test) permits sit/uat/preprod/prod. | Non-prod environments after this branch deploys |

Golden-master green is a prerequisite for starting a shadow window, not a substitute for it.
Offline replay is data-level parity evidence for the code paths; it cannot prove entity-level
behaviour, licensed-compiler compatibility, prod-only typelist values, live scheduling, or
production-scale load. **No live shadow window has started yet.** Until a window is green for
a component+brand, that component+brand stays on legacy everywhere beyond dev.

Tolerances: record builders = exact byte parity (tolerance 0). Count-based feeds
(IPT month-end) = documented `<0.1%` relative count tolerance only for month-end counts;
record bytes remain exact.

## Stream 2A — record builders (22)

Status key: GREEN = live-window green; REPLAY = GREEN_REPLAY (offline replay, all four
brands + unknown/null, byte-exact — dev cut-over only); PEND = not started;
n/a = brand not applicable to feed.

| Component | Centre | Golden-master (CI) | Offline replay (all brands) | Live shadow window | Phase 3A eligible |
|---|---|---|---|---|---|
| IPT | cc | GREEN | REPLAY | PEND | dev only (GREEN_REPLAY) |
| Polaris MF | cm | GREEN | REPLAY | PEND | dev only |
| Polaris Party | cc | GREEN | REPLAY | PEND | dev only |
| Polaris Party | pc | GREEN | REPLAY | PEND | dev only |
| Polaris Party | bc | GREEN | REPLAY | PEND | dev only |
| Polaris Party | cm | GREEN | REPLAY | PEND | dev only |
| MID | bc | GREEN | REPLAY | PEND | dev only |
| Credit | bc | GREEN | REPLAY | PEND | dev only |
| Floodre | bc | GREEN | REPLAY | PEND | dev only |
| Aggr | cc | GREEN | REPLAY | PEND | dev only |
| ELTO | cc | GREEN | REPLAY | PEND | dev only |
| Reins | cc | GREEN | REPLAY | PEND | dev only |
| Sanctions | cc | GREEN | REPLAY | PEND | dev only |
| Cifas | cm | GREEN | REPLAY | PEND | dev only |
| CUE | cm | GREEN | REPLAY | PEND | dev only |
| DVLA | cm | GREEN | REPLAY | PEND | dev only |
| Payhub | cm | GREEN | REPLAY | PEND | dev only |
| Printv | cm | GREEN | REPLAY | PEND | dev only |
| CRIF | pc | GREEN | REPLAY | PEND | dev only |
| DWH | pc | GREEN | REPLAY | PEND | dev only |
| SSP | pc | GREEN | REPLAY | PEND | dev only |
| Verisk | pc | GREEN | REPLAY | PEND | dev only |

Known drift risk carried on every 2A diff record: duplicated `brandMap()` vs
`brand_xref.csv` (AGI-30921 / AGI-5452). NOT converged in Phase 2; `tools/ci/`
cross-checks the csv against the pinned `BrandDirectoryCandidate.XREF_ROWS`.

## Streams 2B/2C/2D — cross-cutting candidates

| Component | Scope | Golden-master (CI) | Shadow window | Authoritative flip gate |
|---|---|---|---|---|
| Brand directory (2B) | all 4 centres | GREEN — reconciled against typelist, varchar `brandOf()` copies, POLARIS mapping + `brand_xref.csv`, Paragon XSLT | GREEN_REPLAY (447 scanned `brandOf()` copies, 22 `brandMap()` tables, 23 XSLT logos — 0 divergent); live window PEND | Stream 3B; per brand, after comparator green |
| Unified rating engine (2C) | pc | GREEN — parity vs `AlbionRatingAdapterEngine`, `_ALBDIR`, `_RETPLS`, `AlbionDualEngineEngine`, `*_v1` signatures | GREEN_REPLAY (1,578 cases, all thresholds straddled); live window PEND (only dev/dev2/sit may shadow — `po.feature.newratingengine.enabled`) | Stream 3C; prod shadow parity + actuarial sign-off + `HeritageRenewalInviteBatch` migrated before `_v1` retirement |
| FeedStatus state machine (2D) | all 4 centres | GREEN — 29 batch contracts, 222-rule transition, invalid/administrative value handling pinned | GREEN_REPLAY (29 contracts x full prior-status x boundary-age matrix); live window PEND | Stream 3D; per centre, after comparator green |

Known pinned disagreements (drift evidence, not defects to fix):

- `brandOf()` null → `ALBDIR` vs builders' `brandMap()` null → `999999` — both preserved.
- `03DL00 → ALBBRK` exists only in `brand_xref.csv` (disputed with MI since 2018).
- PROD `BrandCode_Ext` typelist carries 3 codes not in source control (AGI-35347) — cannot be
  reconciled from this repository; must be verified during the non-prod/preprod shadow window.
- Heritage letters get `LOGO_AGI_FALLBACK.tif` (accepted risk AGI-17908) — preserved.
- `ACK`/`NAK` advertised in 14 entity descriptions with no producer — candidate does not invent one.

## Phase 2 exit criteria checklist

| Criterion | Status |
|---|---|
| Golden-master suite green and BLOCKING in CI (`\|\| true` removal in place, guarded by `verify_phase1_scaffold.py`) | MET on this branch |
| Offline replay reconciliation (GREEN_REPLAY) per candidate, byte-exact, with benchmark | MET — 14,069 cases / 0 failures (`PHASE2-REPLAY-EVIDENCE.md`) |
| Sustained GREEN reconciliation per candidate over a live non-prod shadow window | **NOT MET — windows not started (no Guidewire runtime available)** |
| Flags OFF in every committed environment except gate-checked dev cut-overs (CI-enforced) | MET |
| Production behaviour unchanged (legacy authoritative in every environment beyond dev) | MET |
| This report enumerates per-component/brand green vs not-green | MET |

**Consequence: Phase 3A cut-over is enabled in dev ONLY (all 22 builders x 4 brands, on
GREEN_REPLAY evidence, with reverse-shadow + auto-revert). Every other environment stays on
legacy** until its live shadow window turns the row GREEN — see
`docs/runbooks/PHASE3-CUTOVER-RUNBOOK.md` for the flip procedure, environment order and
load-test gate.

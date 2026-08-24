# Phase 2 Reconciliation Status

Per-component, per-brand reconciliation status for the strangler migration. This is the
report the Phase 3 hard gate reads: **a component/brand may be cut over ONLY when its row
here is GREEN in the "Shadow window" column within the documented tolerance**
(`docs/architecture/CONTROLS-AND-TOLERANCES.md`). Anything not green stays on legacy.

## How to read this report

Two distinct kinds of evidence, deliberately not conflated:

| Evidence | What it proves | Where it comes from |
|---|---|---|
| **Golden-master parity (CI)** | Candidate reproduces pinned production bytes for every committed fixture and the full characterization matrix (nulls, half-hydrated beans, over-length, negative overpunch, 29-Feb, every brand, unknown brand). Blocking in both pipelines via `tools/ci/golden-master-suite.txt`. | This repository, every build |
| **Shadow window (non-prod)** | Candidate matches legacy over REAL traffic for a sustained window with the shadow flag enabled in a non-prod environment; diffs land as structured `ReconciliationResult` records, zero unexplained diffs required. | Non-prod environments after this branch deploys |

Golden-master green is a prerequisite for starting a shadow window, not a substitute for it.
**No shadow window has started yet** — this branch is what makes the windows possible. Until a
window is green for a component+brand, that component+brand stays on legacy and its
Phase 3A flag stays OFF.

Tolerances: record builders = exact byte parity (tolerance 0). Count-based feeds
(IPT month-end) = documented `<0.1%` relative count tolerance only for month-end counts;
record bytes remain exact.

## Stream 2A — record builders (22)

Status key: GREEN = green; PEND = not started; n/a = brand not applicable to feed.

| Component | Centre | Golden-master (CI) | Shadow window ALBDIR | ALBBRK | RETPLS | HERIT | Phase 3A eligible |
|---|---|---|---|---|---|---|---|
| IPT | cc | GREEN | PEND | PEND | PEND | PEND | NO — shadow window not started |
| Polaris MF | cm | GREEN | PEND | PEND | PEND | PEND | NO |
| Polaris Party | cc | GREEN | PEND | PEND | PEND | PEND | NO |
| Polaris Party | pc | GREEN | PEND | PEND | PEND | PEND | NO |
| Polaris Party | bc | GREEN | PEND | PEND | PEND | PEND | NO |
| Polaris Party | cm | GREEN | PEND | PEND | PEND | PEND | NO |
| MID | bc | GREEN | PEND | PEND | PEND | PEND | NO |
| Credit | bc | GREEN | PEND | PEND | PEND | PEND | NO |
| Floodre | bc | GREEN | PEND | PEND | PEND | PEND | NO |
| Aggr | cc | GREEN | PEND | PEND | PEND | PEND | NO |
| ELTO | cc | GREEN | PEND | PEND | PEND | PEND | NO |
| Reins | cc | GREEN | PEND | PEND | PEND | PEND | NO |
| Sanctions | cc | GREEN | PEND | PEND | PEND | PEND | NO |
| Cifas | cm | GREEN | PEND | PEND | PEND | PEND | NO |
| CUE | cm | GREEN | PEND | PEND | PEND | PEND | NO |
| DVLA | cm | GREEN | PEND | PEND | PEND | PEND | NO |
| Payhub | cm | GREEN | PEND | PEND | PEND | PEND | NO |
| Printv | cm | GREEN | PEND | PEND | PEND | PEND | NO |
| CRIF | pc | GREEN | PEND | PEND | PEND | PEND | NO |
| DWH | pc | GREEN | PEND | PEND | PEND | PEND | NO |
| SSP | pc | GREEN | PEND | PEND | PEND | PEND | NO |
| Verisk | pc | GREEN | PEND | PEND | PEND | PEND | NO |

Known drift risk carried on every 2A diff record: duplicated `brandMap()` vs
`brand_xref.csv` (AGI-30921 / AGI-5452). NOT converged in Phase 2; `tools/ci/`
cross-checks the csv against the pinned `BrandDirectoryCandidate.XREF_ROWS`.

## Streams 2B/2C/2D — cross-cutting candidates

| Component | Scope | Golden-master (CI) | Shadow window | Authoritative flip gate |
|---|---|---|---|---|
| Brand directory (2B) | all 4 centres | GREEN — reconciled against typelist, varchar `brandOf()` copies, POLARIS mapping + `brand_xref.csv`, Paragon XSLT | PEND | Stream 3B; per brand, after comparator green |
| Unified rating engine (2C) | pc | GREEN — parity vs `AlbionRatingAdapterEngine`, `_ALBDIR`, `_RETPLS`, `AlbionDualEngineEngine`, `*_v1` signatures | PEND (only dev/dev2/sit may shadow — `po.feature.newratingengine.enabled`) | Stream 3C; prod shadow parity + actuarial sign-off + `HeritageRenewalInviteBatch` migrated before `_v1` retirement |
| FeedStatus state machine (2D) | all 4 centres | GREEN — 29 batch contracts, 222-rule transition, invalid/administrative value handling pinned | PEND | Stream 3D; per centre, after comparator green |

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
| Sustained GREEN reconciliation per candidate over a non-prod shadow window | **NOT MET — windows not started** |
| All flags OFF in every committed environment (CI-enforced, shadow + cutover) | MET |
| Production behaviour unchanged (legacy authoritative everywhere) | MET |
| This report enumerates per-component/brand green vs not-green | MET |

**Consequence: no Phase 3 cutover is permitted yet.** The Phase 3A seam (`CutoverRouter`,
per-brand `cutover.*` flags, reverse-shadow + auto-revert) ships dormant so that flips need
no further code change once a row above turns green — see
`docs/runbooks/PHASE3-CUTOVER-RUNBOOK.md` for the flip procedure, environment order and
load-test gate.

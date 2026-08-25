# Albion migration demo UI

A presenter-driven, **mock-data-only** front end that tells the story of the Guidewire →
strangler migration: what changes, what provably does not, and how it is put back if it ever
misbehaves. Nothing here connects to Guidewire, POLARIS, or any Albion environment; every
figure is hard-coded in `src/data/mock.ts` and shaped after the committed artefacts in this
repository.

## Run it

```bash
cd demo-ui
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm run lint` (oxlint), `npm run build` (tsc + vite), `npm run preview`.

## Screens

| # | Screen | Story |
|---|---|---|
| 01 | Executive overview | Phase 3A state (14,069 replay cases / 0 failures), GREEN_REPLAY vs GREEN evidence ladder, strangler principles, phase shape, brand order, risk register |
| 02 | Migration control tower | Component × brand routing board per environment, promotion ladder, evidence ladder and replay limits, gate evidence detail |
| 03 | Business journeys | Step-through of FNOL → claim → feed, renewal → PS21/5, payment → Payhub, plus the `FeedStatus_Ext` lifecycle |
| 04 | Shadow run & auto-revert | Legacy vs candidate byte lanes, simulated mismatch, auto-revert to legacy |
| 05 | Dashboards | Parity reconciliation, load-test gate vs Phase-0 baselines, rollback drills |

Navigate with the header, the URL hash (`#control-tower`), or the ← / → keys.

## Source artefacts the mock data is shaped after

- `tools/ci/reconciliation-status.csv` — 124 component × brand cut-over gate rows
- `docs/reconciliation/PHASE2-RECONCILIATION-STATUS.md`
- `docs/runbooks/PHASE3-CUTOVER-RUNBOOK.md`, `docs/runbooks/LOAD-TEST-GATES.md`
- `docs/architecture/FEEDSTATUS-STATE-MACHINE.md`, `docs/architecture/CONTROLS-AND-TOLERANCES.md`
- `docs/interfaces/INTERFACE-CONTRACT-INVENTORY.md` and `interface-contract-inventory.csv`
- `docs/reconciliation/PHASE2-REPLAY-EVIDENCE.md` and `tools/replay/evidence/`
- `environments/dev/*.properties` — the 88 enabled dev cut-over flags

## What the mock data mirrors

The board follows the current Phase 3A position: all 124 gate rows are `GREEN_REPLAY` (offline
replay reconciliation evidence — 14,069 cases, 0 failures), which permits the cut-over flag in
`dev` and nowhere else. So `dev` shows the candidate authoritative for the 22 record builders ×
4 brands with legacy reverse-shadowing, while `sit`, `uat/preprod` and `prod` stay on legacy
until a sustained live shadow window plus the load test turns a row `GREEN`. Per-row case
counts, dev-bake volumes and the benchmark figures are illustrative; the headline replay and
flag counts match the repository.

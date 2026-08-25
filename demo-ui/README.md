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
| 01 | Executive overview | Strangler principles, phase shape, brand order, risk register |
| 02 | Migration control tower | Component × brand cut-over board, environment promotion, gate evidence detail |
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

The real gate rows are all `PENDING` today. The board here shows an illustrative mid-migration
position so the mechanics — green, shadowing, blocked, promotion order — are visible in a demo.

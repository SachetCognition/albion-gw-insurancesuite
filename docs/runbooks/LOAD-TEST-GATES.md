# Load-Test Gates for Phase 3 Cut-over

Every prod-authoritative flip is blocked until the candidate passes a load test against the
Phase-0/inventory peak baseline for that interface, run in the perf environment on the exact
revision being promoted. Target is **parity or better**: any throughput regression vs the
legacy baseline on the same run blocks the flip.

## Method

- Run legacy and candidate on the SAME perf environment, same dataset, same run — the
  reverse-shadow configuration doubles builder work by design, so the measured gate is:
  1. **candidate-alone throughput ≥ legacy-alone throughput** (the post-retirement steady
     state must not regress), and
  2. **cutover-mode throughput (candidate + reverse shadow) ≥ observed prod peak for the
     interface** (the bake period itself must keep up with the real feed).
- Peak profile must include **renewals + catastrophe combined** — all three big feeds peak
  on that combination, not on average days.
- Record results (records/day sustained, p95 batch wall-clock, DB writer wait) in the
  evidence column of `tools/ci/reconciliation-status.csv` alongside the reconciliation
  evidence; the gate row is not GREEN without both.

## Baselines (Phase-0 interface inventory, prod peaks)

| Interface | Centre | Peak baseline | Notes |
|---|---|---|---|
| MID | bc | ~743,000 records/day | largest feed; hard regulatory delivery window |
| IPT | cc | ~437,000 records/day | month-end count tolerance `<0.1%` applies to counts only, never to throughput |
| DWH | pc | ~429,000 records/day | overnight window; finish-by time is the binding constraint |
| All other builders | — | per `docs/interfaces/INTERFACE-CONTRACT-INVENTORY.md` | gate on each interface's documented peak before its flip |

## Status

No load-test run has been recorded yet. Every gate row in
`tools/ci/reconciliation-status.csv` is PENDING; the first runs are scheduled with the first
non-prod shadow windows (same perf environment booking).

# Phase 2 offline replay reconciliation evidence (GREEN_REPLAY)

This document records the OFFLINE REPLAY evidence backing every `GREEN_REPLAY` row in
`tools/ci/reconciliation-status.csv`, what that evidence does and does not prove, and how
to regenerate it. Raw structured evidence is archived under `tools/replay/evidence/`.

## What GREEN_REPLAY is

`GREEN_REPLAY` is a NEW gate status distinct from `GREEN`:

| Status | Evidence | Permits cut-over flag in |
|---|---|---|
| `PENDING` | none | nowhere |
| `GREEN_REPLAY` | offline JVM replay reconciliation (this document) | **dev only** |
| `GREEN` | sustained live non-prod shadow window + load test | dev/sit -> uat/preprod -> prod |

Offline replay executes the REAL legacy and candidate Gosu classes (the same `.gs` sources
Guidewire compiles) on a standalone Gosu 1.18.9 runtime, through the REAL `ShadowRunner`
with exact (tolerance 0) comparison, against the committed Phase 0 golden-master fixtures
plus a synthetic full input matrix. It is genuine byte-level parity evidence for the code
paths, but it is NOT a live Guidewire runtime and therefore can never turn a row `GREEN`.

## What offline replay CANNOT prove (why prod stays gated)

- Entity-level behaviour: real `KeyableBean` entities, typelists, bundles/transactions,
  `LastBatchRun_Ext` persistence, the `ComplianceBreach_Ext` entity write path.
- Licensed-compiler compatibility (`gwb compile` / GUnit) and plugin wiring.
- Production-only data: the 3 prod-only typelist codes (AGI-35347), real POLARIS rows.
- Live scheduling (Control-M vs `scheduler-config.xml`) and batch windows.
- Production-scale load (MID ~743k/day, IPT ~437k/day, DWH ~429k/day, renewal+cat peaks);
  the JVM micro-benchmark below is a proxy, not a load test.

## Results (all archived under tools/replay/evidence/)

Grand total: **14,069 replay cases, 0 failures** across all four centres.

### Stream 2A - 22 record builders (byte-exact, tolerance 0)

| Centre | Cases | Failures | Evidence |
|---|---|---|---|
| ClaimCenter (AGGR, ELTO, IPT, POLARIS, REINS, SANCTIONS) | 1,380 | 0 | `claimcenter-builders-replay.log.gz` |
| BillingCenter (CREDIT, FLOODRE, MID, POLARIS) | 942 | 0 | `billingcenter-builders-replay.log.gz` |
| PolicyCenter (CRIF, DWH, POLARIS, SSP, VERISK) | 1,172 | 0 | `policycenter-builders-replay.log.gz` |
| ContactManager (CIFAS, CUE, DVLA, PAYHUB, POLARIS, POLARIS_MF, PRINTV) | 1,646 | 0 | `contactmanager-builders-replay.log.gz` |

Each builder replays: every committed golden-master fixture (legacy output re-verified
byte-for-byte against the committed `expected.record`, candidate shadowed via
`ShadowRunner`), plus a synthetic matrix of nulls, half-hydrated beans, over-length
strings, pipe/CR/LF normalisation characters, negative decimals (including the pinned
overpunch `StringIndexOutOfBoundsException` on trailing-9 negatives, asserted as
EXCEPTION-PARITY on both paths), 29-Feb dates, all brand codes and unknown/case-variant
brands (the pinned `999999` default).

### Stream 2B - brand single-source candidate

Replayed against the independently scanned legacy contracts
(`tools/replay/scan_legacy_contracts.py` -> `tools/replay/manifests/`):
447 canonical `brandOf()` copies (0 divergent), all 22 builder `brandMap()` tables
(invoked reflectively on the real classes and cross-checked against the scanned source),
23 Paragon XSLT logo mappings, `brand_xref.csv` pins. Matrix: valid brands, HERIT,
retired `07RP00`, unknown, case variants, empty, null field, null bean (pinned
`ALBDIR` default and `999999` unknown code).

### Stream 2C - unified rating engine candidate

`policycenter-rating-replay.log.gz`: 1,578 cases, 0 failures. All four legacy engines
(ADAPTER, ADAPTER_ALBDIR, ADAPTER_RETPLS, DUAL) vs `UnifiedRatingEngineCandidate` over a
brand x amount matrix straddling every pinned threshold (4000/5000/7500/9999.99/12500/
25000/50000/100000), plus the `@Deprecated *_v1` signatures (HeritageRenewalInviteBatch
bindings). The one sanctioned change (PS21/5 breach persisted via
`ComplianceBreachRecorder`) is validated candidate-only with `InMemoryComplianceBreachRecorder`;
the `EntityComplianceBreachRecorder` entity write needs live Guidewire.

### Stream 2D - FeedStatus_Ext state machine candidate

Included in `*-brand-feedstatus-replay.log.gz` per centre (7,351 cases with 2B, 0
failures): all 29 scanned batch consumer contracts x prior status (PENDING/SENT/ACK/NAK/
ESCALATED/administrative/legacy-invalid/garbage/null) x threshold boundary ages
(strict `>`), rule-assign contract, row-failure (retry-next-run, status untouched),
`LastBatchRun_Ext` stamping semantics, external strings unchanged.

### Throughput micro-benchmark (proxy for the load gate)

100,000 iterations per builder over golden fixtures, same JVM, legacy first
(`*-bench.log`). Candidate ns/op is at parity or better for all 22 builders (transient
single-run deltas re-run and confirmed as JIT noise). Worst observed candidate ns/op
(~3.3us/record) gives >250M records/day/thread headroom vs the largest daily baseline
(MID ~743k/day) - i.e. no plausible throughput regression at data level, pending the
real load test for `GREEN`.

### Harness self-checks (not vacuous)

Negative runs prove the harness detects breaches: a mutated golden fixture -> 1 failure
(GOLDEN MISMATCH); a mutated brand mapping + escalation threshold in the scanned
manifests -> 7 failures (SCAN-DRIFT/BREACH). Both restored to green afterwards.

## How to regenerate

```
tools/replay/gen_manifests.py                 # 22-builder manifests (fails if != 22)
tools/replay/scan_legacy_contracts.py         # legacy brand/feedstatus contract manifests
tools/replay/bin/replay-gosu "tools/replay/stubs:tools/replay/harness:<centre gsrc>" \
    tools/replay/harness/ReplayDriver.gsp tools/replay/manifests/<centre>.manifest . \
    <evidence.log> <bench.log> 100000
tools/replay/bin/replay-gosu ... BrandFeedStatusReplay.gsp <centre> tools/replay/manifests <evidence.log> <runShared>
tools/replay/bin/replay-gosu ... RatingReplay.gsp <evidence.log>       # policycenter only
```

Runtime: standalone Gosu 1.18.9 + the `gw.lang.Deprecated` shim under `tools/replay/shim/`
(the open-source runtime lacks the licensed annotation); stubs under `tools/replay/stubs/`
provide only `KeyableBean` and empty `gw.api.database` types - no legacy or candidate
logic is stubbed.

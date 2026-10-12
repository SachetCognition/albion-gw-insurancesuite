# Strangler migration: Phase 2 shadow reconciliation and Phase 3 cutover

Builds on the Phase 1 foundation (`docs/migration/strangler-phase1.md`). Wired feeds are unchanged: IPT (ClaimCenter
`IptTransport`) and POLARIS_MF (PolicyCenter and ContactManager `PolarisMfTransport`). Every committed environment
template keeps every switch below OFF/empty, so with the committed values each feed writes its legacy record only.

## Switches

| Key (after `<prefix>.`, `cl`/`po`/`bi`/`co`) | Committed | Effect |
|---|---|---|
| `feature.shadow.enabled` | `false` | Master shadow switch (Phase 1). |
| `feature.shadow.feeds` | empty | Feeds shadow-run: `IPT`, `POLARIS_MF`. |
| `feature.shadow.brands` | empty | Optional BrandCode_Ext allow-list; empty = all brands. Also limits cutover. |
| `feature.cutover.feeds` | empty | Feeds cut over to the candidate builder. Only effective for a feed that is also shadow-run. |

`AlbionConfigService.isCutoverEnabled(feed, brand)` is true only when the feed is in `feature.cutover.feeds` and
`isShadowEnabled(feed, brand)` is true. `validationErrors()` reports a cutover feed that is not shadow-run, so the server
start-up check fails on that configuration. `tools/scripts/check_brand_config_drift.py` fails if a committed template sets
`feature.shadow.enabled` to anything but `false` or `feature.cutover.feeds` to anything but empty. Enabling either in
SIT, UAT or production is a deploy-time override of the rendered `<centre>.properties` (or a `-D` system property, which
wins over the file); it is never a committed value.

## Phase 2: shadow reconciliation

`ShadowRecordFacade.buildRecord` modes:

| Mode | Record sent | Legacy runs | Candidate runs | Evidence |
|---|---|---|---|---|
| Off (committed) | legacy | yes | no | none |
| Shadow | legacy | yes, first | yes | every comparison counted in `ShadowRecordFacade.Ledger`; non-matches logged by `LoggingShadowDiffRecorder` |
| Cutover | candidate when it reconciles, else legacy | yes, first (reverse shadow) | yes | as shadow, plus `cutoverCandidateEmitted` / `cutoverReverted` counts |

- Comparison is byte for byte (`ShadowTolerance.exact()`): any difference in a 512-byte record is a `BREACH`.
- Legacy failures (for example the COBOL overpunch of a negative amount ending in 9) propagate unchanged in every mode.
- Candidate failures are contained as `CANDIDATE_ERROR` and never reach the feed.
- `ShadowReconciliationLedger` counts `compared`, `matched`, `withinTolerance`, `breaches` and `candidateErrors` per feed
  and brand. A row is `GREEN` with at least one comparison and no breach or candidate error, `RED` with any, and
  `NO_EVIDENCE` with none. It holds counts, outcomes and lengths only, never record contents.
- Count tolerances follow `docs/architecture/CONTROLS-AND-TOLERANCES.md`: `ShadowTolerance.iptMonthEndCountTolerance()`
  permits a relative difference strictly below 0.1%; exactly 0.1% is a breach.

### Reconciliation batch (unscheduled candidate)

`albion.integration.shadow.batch.AlbionShadowReconciliationBatch` (BatchProcessType `AlbionShadowRecon_Ext`, category
`UIRunnable`) in ClaimCenter, PolicyCenter and ContactManager drains the server's ledger and logs one
`albion.shadow.evidence/v1` JSON document under logger category `albion.integration.shadow.reconciliation`: `INFO` when
GREEN or NO_EVIDENCE, `ERROR` (and one failed operation on the batch console) when RED. BillingCenter has no wired feed and
no batch.

It is not in `scheduler-config.xml` or Control-M and has no JCL member: Control-M owns scheduling, and adding a job is a
change for its owners. Until then it is run on demand from the batch process console at the end of each shadow-run
period, on every server that sends the feed (the ledger is per server).

## Offline replay evidence

`tools/replay/run_replay.sh` replays committed synthetic fixtures (`tools/replay/fixtures/*.csv`, invented values only)
through the legacy and candidate builders of each wired feed with `ShadowRunner`, plus a negative control that alters
the candidate record and must come out RED. It writes `tools/replay/evidence/replay-evidence.json`:

```
{
  "schema": "albion.shadow.replay/v1",
  "generatedAt": "<UTC ISO-8601>",
  "status": "GREEN" | "RED",          // GREEN: every run GREEN and negativeControl RED
  "tolerance": "exact",
  "runtime": "open-source Gosu 1.17.5",
  "negativeControl": "RED",
  "fixtures": [{"path": "...csv", "sha256": "...", "cases": 17}],
  "runs": [ <albion.shadow.evidence/v1 document per centre and feed> ]
}
```

Each `albion.shadow.evidence/v1` document (also the reconciliation batch output) has `schema`, `source`
(`offline-replay` or `shadow-run`), `centre` (`cc`/`pc`/`bc`/`cm`), `periodStart`, `generatedAt`, `status`, `totals`
(`compared`, `matched`, `withinTolerance`, `breaches`, `candidateErrors`, `cutoverCandidateEmitted`, `cutoverReverted`),
`feeds` (the same counts per `feed` and `brand` plus `status`) and `cases` (replay only: `id`, `feed`, `brand`,
`outcome`, `legacyLength`, `candidateLength`, `firstDifferenceIndex`, `candidateFailure`). For a fixture marked
`LEGACY_ERROR` both builders must fail with the same exception class; the compared values are then the class names.
Run instructions: `tools/replay/README.md`.

## Phase 3 cutover runbook

Gate, per feed (all required, recorded in the change):
1. `tools/replay/evidence/replay-evidence.json` regenerated on the release commit and `GREEN`.
2. The feed shadow-run in the target environment for at least one full business cycle, including a month end for IPT,
   with every `AlbionShadowReconciliationBatch` document for the period `GREEN`.
3. The golden-master tests for the feed pass in the release pipeline.

Cutover, in an approved change window:
1. Keep `feature.shadow.enabled=true` and the feed in `feature.shadow.feeds` (and any `feature.shadow.brands` limit).
2. Add the feed to `feature.cutover.feeds` in the rendered properties and restart, or set the system property.
3. Run `AlbionShadowReconciliationBatch` after the first sends: `cutoverCandidateEmitted` should equal `compared`, with
   `cutoverReverted`, `breaches` and `candidateErrors` at 0.

Rollback: clear `feature.cutover.feeds` (empty value) and restart; the legacy record is authoritative again with shadow
running unchanged. Clearing `feature.shadow.enabled` as well returns the feed to legacy only. Neither requires a code
deployment. Any `cutoverReverted` count means the legacy record was sent for that message; treat it as a RED period and
roll back the feed.

With exact tolerance the record sent after cutover is byte-identical to the legacy record. Cutover makes the candidate
the producing code path and leaves legacy as the reverse shadow; retiring the legacy builder is a later, separate change.

## Change-window and heritage-book constraints

- No switch change during month-end IPT reconciliation (`docs/runbooks/month-end-ipt-reconciliation.md`): the shadow
  period must close, and its evidence be GREEN, before or after it.
- Switch changes go through the release change process like any other environment change; enabling in one environment
  never promotes to the next by itself, because every committed template stays OFF.
- Heritage book: heritage rows with no `BrandCode_Ext` resolve to `ALBDIR` (`BrandMappingService.brandOf`) for the
  shadow and cutover brand limit, while their record still carries the `999999` POLARIS code from `brandMap`. A
  `feature.shadow.brands=HERIT` limit therefore does not cover heritage rows without a brand; shadow-run `ALBDIR` (or all
  brands) to reconcile them. Policies held in `LegacyPolicySnapshot_Ext` are not re-sent by cutover.
- Records keep the POLARIS layout: 512 bytes, silent truncation, space padding, implied-2dp numbers with the trailing
  overpunch, `00000000` null dates, `999999` unknown-brand code.

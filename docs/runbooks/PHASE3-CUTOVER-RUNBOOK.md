# Phase 3 Cut-over Runbook

Procedure for making a candidate implementation production-authoritative, per component,
per brand. Nothing here is a code change: every flip is a feature-flag change gated by
`tools/ci/reconciliation-status.csv`, and every flip is reversible by turning the same flag
off. The legacy implementation is never deleted until the retirement step at the end.

## Hard gate (enforced in CI)

A committed `*.feature.cutover.*` flag that enables a component+brand fails
`tools/ci/verify_phase1_scaffold.py` unless:

1. **dev**: the matching row in `tools/ci/reconciliation-status.csv` is `GREEN_REPLAY` or
   `GREEN` **with cited durable evidence** (never a log grep). `GREEN_REPLAY` = offline
   replay reconciliation + benchmark (`docs/reconciliation/PHASE2-REPLAY-EVIDENCE.md`) —
   valid for dev ONLY, because replay cannot prove entity-level behaviour, prod-only
   typelist values, live scheduling or production-scale load;
2. **sit/uat/preprod/prod**: the row is `GREEN` (live shadow window + load test), and
   environment promotion order is respected: dev/sit → uat/preprod → prod. A later
   environment cannot be enabled before every earlier one. prod and dr are additionally
   hard-blocked while any flag is true without a `GREEN` row.

A row may be set `GREEN` only when the non-prod shadow window for that component+brand has
run sustained with **zero unexplained diffs** — exact byte parity for record builders,
documented tolerance for count feeds only (`docs/architecture/CONTROLS-AND-TOLERANCES.md`,
e.g. IPT month-end `<0.1%` counts). Current status: **all 124 rows GREEN_REPLAY** — dev
cut-over is enabled for all 22 builders x 4 brands (demo scope); every other environment
remains on legacy until its live window runs.

## Brand order (smallest blast radius first)

1. `ALBDIR` (direct)
2. `ALBBRK` (broker)
3. `RETPLS` (partnerships)
4. `HERIT` — **LAST**, because heritage rows have no `BrandCode_Ext` (they hit the silent
   `ALBDIR` default) and `HeritageRenewalInviteBatch` still binds the `@Deprecated *_v1`
   signatures. HERIT may not flip for rating (3C) until that batch is migrated.

## Per-flip procedure (Stream 3A, one builder + one brand)

Flag: `<centre>.feature.cutover.<builder>.brand.<BRAND>.enabled=true`
(prefixes: `cl` = ClaimCenter, `po` = PolicyCenter, `bi` = BillingCenter, `co` = ContactManager)

1. **Pre-checks**: gate row GREEN_REPLAY (dev) or GREEN (beyond dev); golden-master suite
   green on the deploying revision; load-test gate passed for this interface before any
   authoritative environment beyond dev (see `docs/runbooks/LOAD-TEST-GATES.md`; the
   offline benchmark in `PHASE2-REPLAY-EVIDENCE.md` is a proxy, not the load test).
2. **Flip in dev** (dev-only under GREEN_REPLAY; sit requires GREEN). `CutoverRouter` now
   routes the candidate as authoritative for that
   brand only. The legacy builder still runs on **every** record as the reverse shadow:
   any difference (including a candidate exception) is recorded as a structured
   `ReconciliationResult` (the auto-alert) and that record **auto-reverts to legacy bytes**
   — a divergent candidate can never change what leaves the estate.
3. **Bake** one full business cycle including a month-end. Zero auto-reverts required.
4. **Promote** to uat/preprod, bake again (this is also where the three PROD-only typelist
   codes (AGI-35347) can appear — any of them showing up is a diff, not a surprise in prod).
5. **Promote to prod.** Bake for the full agreed window covering a renewal peak; the MID /
   IPT / DWH class of feeds must additionally cover a combined renewals+catastrophe peak.
6. **Rollback** at any point = set the same flag to false. No deploy, no data change.
   Emitted bytes were identical throughout a green bake, so rollback is byte-invisible.
7. **Retire the legacy builder** only after ALL brands of that builder are green in prod
   through their full bakes, as its own reviewed change.

## Stream 3B — brand single source (do not interleave with a 3A flip for the same brand)

Gate: `cutover.branddirectory` rows GREEN per centre+brand while the `BrandDirectoryShadow`
comparator stays green against all four sources of truth. Flip replaces the 17+ `brandOf()`
copies and the per-builder `brandMap()` duplicates with `BrandDirectoryCandidate` — behaviour
pinned, including `brandOf(null)=ALBDIR` vs `polarisCodeOf(null)=999999` and the disputed
`03DL00` row. The `brand_xref.csv` ↔ `XREF_ROWS` CI cross-check stays in place afterwards.

## Stream 3C — unified rating engine

Gate: `cutover.newratingengine` rows GREEN per brand from prod shadow parity against BOTH
legacy engines and `HeritageRenewalInviteBatch`, **plus explicit actuarial sign-off** ("do
not change without speaking to actuarial" — this gate is human, not automated). Order:
ALBDIR → ALBBRK → RETPLS → HERIT. The `@Deprecated *_v1` signatures are retired only after
`HeritageRenewalInviteBatch` is migrated off them, as the last step. Compliance breaches
persist to `ComplianceBreach_Ext` throughout (already active in shadow — persistence is
side-effect-only and never alters rating output).

## Stream 3D — FeedStatus state machine (per centre)

Gate: `cutover.feedstatus` rows GREEN per centre while `FeedStatusShadow` reproduces every
observed transition and `LastBatchRun_Ext` side effect across the 29 batches / 222 rules
with zero diffs. External strings never change. THEN, as separate individually-gated changes
(each validated against the golden master, none bundled with the flip):

1. single active scheduler per environment (Control-M vs `scheduler-config.xml` double
   scheduling);
2. bounded/resumable selection for the unbounded `PENDING` query (the 1.4M heritage rows);
3. real retry/poison-row state (the candidate already carries `RetryOutcome` separately from
   business status so this needs no external string change).

Each must preserve the order and output of successful records.

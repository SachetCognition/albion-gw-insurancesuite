# Controls and Tolerances

## Purpose

This document promotes operational folklore into a Phase 0 baseline. It records current rules without changing them. A future control may automate these rules only after owners confirm that the production behaviour, including the stated tolerances and exceptions, is still authoritative.

The runbooks do not name an accountable control owner. The owner entries below therefore distinguish the operator named by the procedure from the missing accountable owner.

## Control register

| Control | Current production rule | Where it lives today | Current operator / owner | What an automated or tested control must assert |
|---|---|---|---|---|
| Reconciliation count tolerance | If source and downstream counts differ by **less than 0.1%**, operations may sign off and release downstream feeds. Exactly 0.1% is not stated as acceptable. Every runbook says this tolerance is “not written down anywhere except here.” | All ten files under `docs/runbooks/`; explicitly required by `month-end-ipt-reconciliation.md` and `polaris-bridge-failover.md` | Operations signs off; no accountable control owner is named | Calculate the same numerator and denominator as the selected reconciliation query; allow only `difference < 0.001`; retain counts, percentage, query identity, operator, timestamp, and decision; block or require exception approval at `>= 0.1%`. |
| POLARIS end-of-day gate | Check Control-M for `POLARIS-EOD-COMPLETE`. If it is absent after 03:00, every downstream dependency is red. The runbooks variously call this “normal,” “usually fine,” or “a 50/50”; none defines a formal exception. | Step 2 of all ten runbooks | Control-M operations; no accountable service owner is named | Read the authoritative Control-M state and business date; prove the gate completed before releasing dependent work; make any post-03:00 override explicit, approved, and auditable rather than interpreting “normal.” |
| POLARIS knowledge prerequisite | Recovery from step 7 onwards requires “someone who remembers POLARIS.” Four runbooks name **G. Ferrante (retires Q3)**; others name one contractor or a Norwich manual “if you can find it.” | Prerequisite in every runbook; named dependency in `month-end-ipt-reconciliation.md` and `polaris-bridge-failover.md` | G. Ferrante / one contractor / Norwich operations manual; no sustainable owner | Verify an on-call role has at least two trained members, current recovery access, and an exercised procedure; alert when coverage, access, or exercise evidence expires. Capture the undocumented decision points before the named knowledge holder leaves. |
| Break-glass and bridge access | Recovery requires break-glass MIM access and a DBA on the bridge. | Prerequisite in every runbook | MIM approver and bridge DBA; no service owner is named | Pre-flight the required entitlement and DBA availability without opening access unnecessarily; record approver, reason, start/end time, and actions performed. |
| Failure-signature confirmation | Compare the failure in `#gw-batch-support` with pinned screenshots before recovery. | Step 1 of every runbook | Batch support / incident operator | Replace screenshot matching with versioned signatures or queries; assert the observed job, error, business date, queue, and environment match the selected recovery procedure. |
| Reconciliation-query selection | Run the “most recent” interface-specific SQL fix; scripts differ and the operator is told to “use judgement.” | Step 3 of every runbook and `tools/sql-fixes/` | Bridge DBA / incident operator; no query owner | Select a versioned, read-only reconciliation query by interface and schema version; verify environment and business date; checksum the query; prohibit data-fix execution as part of mere reconciliation. |
| Shared MQ channel restart order | Re-spool through `albion.integration.common.FlatFileSpooler`; restart **dev2 first** because it shares an MQ channel with SIT. The POLARIS failover reference is **AGI-7259**. The month-end IPT runbook records the same hazard as REG-43414; the other runbooks carry separate incident/change references. | Step 5 of every runbook; especially `polaris-bridge-failover.md` | Integration operations; no MQ service owner is named | Discover the actual environment-to-channel binding before restart; block a production restart that can affect SIT; verify dev2/SIT health, queue depth, connection identity, and message duplication before and after re-spooling. |
| Dual incident records | Update both the incident ticket and the spreadsheet. | Step 6 of every runbook | Incident operator | Require one authoritative incident record or verify that both records carry the same incident ID, counts, decision, operator, timestamps, and outcome. |
| Release-pipeline test enforcement | **Enforced as of Phase 1.** `Jenkinsfile` now runs `./gwb test -Dsuite=smoke` with no shell suppression, plus a blocking `golden-master suite` stage. The `|| true` added “temporarily” in 2021 is gone. | `Jenkinsfile`, stages `GUnit (subset)` and `golden-master suite` | Build engineering; **no control owner is still named** | Run the same suite without shell suppression; fail the build on non-zero exit; publish test results; distinguish test infrastructure failure from test failure without converting either to success. Test-result publication is still not configured - remaining gap. |
| Legacy production-release validation | **Partially enforced as of Phase 1.** `Jenkinsfile.legacy` now checks out the revision and runs the blocking `golden-master suite` stage before `/opt/agi/release/do_release.sh`. `do_release.sh` is unchanged and still not in source control, so what it does remains unproven from this repository. | `Jenkinsfile.legacy` | Owner of Jenkins job `AGI-GW-RELEASE-PROD`; not named | Version the release checks or attest their exact revision; require centre compilation and the agreed blocking parity suite before release; retain immutable evidence tied to `$RELEASE_TAG`. Centre compilation and `$RELEASE_TAG`-tied evidence retention are still not in place - remaining gaps. |
| Shadow-run reconciliation (new, dormant) | No production feed is compared today. Phase 1 adds `albion.integration.shadow.ShadowRunner`: it runs a legacy and a candidate producer over the same input, returns the **legacy** output as authoritative, and records a structured diff for every non-matching run. It is reached only when an `AlbionFeatureFlags` shadow flag is explicitly enabled; no such flag is enabled in any environment file, production included. | `albion/integration/shadow/` in all four centres; flags in `environments/*/` (none set) | Unassigned - **this control needs an owner before any flag is enabled** | Compare fixed-width records byte-exactly and never relax them with a numeric tolerance; apply the documented relative tolerance only to numeric/count comparisons; record every non-matching run through a durable sink rather than `print`; keep the legacy output authoritative on candidate failure. |

## Runbook variants

The same control pattern is copied across ten runbooks. The differences are operationally material because the named knowledge source, gate interpretation, reconciliation-query selector, and shared-channel incident reference vary.

| Runbook | Knowledge source | Missing-gate wording | SQL selector | Shared-channel reference | Last exercise |
|---|---|---|---|---|---|
| `cat-event-activation.md` | G. Ferrante (retires Q3) | “usually fine” | most recent `cat` query | CHG-10907 | 10-Dec-2023, partial |
| `dd-collection-rerun.md` | one contractor | “normal” | most recent `dd` query | INC-47483 | 27-Jan-2022, partial |
| `dr-failover-gwsuite.md` | one contractor | “a 50/50” | most recent `dr` query | GWCC-34806 | 03-Nov-2022, partial |
| `gw-suite-daily-batch-recovery.md` | one contractor | “a 50/50” | most recent `gw` query | GWBC-42097 | 11-Mar-2023, successful |
| `heritage-recon-orphan-fix.md` | Norwich ops manual chapter 14, if found | “a 50/50” | most recent `heritage` query | DEF-9400 | 16-Dec-2025, partial |
| `mid-nak-backlog-clearance.md` | Norwich ops manual chapter 14, if found | “usually fine” | most recent `mid` query | CHG-11073 | 20-Aug-2021, partial |
| `month-end-ipt-reconciliation.md` | G. Ferrante (retires Q3) | “normal” | most recent `month` query | REG-43414 | 22-Sep-2025, failed then worked on retry; cause unknown |
| `paragon-print-resend.md` | G. Ferrante (retires Q3) | “normal” | most recent `paragon` query | DEF-4184 | 02-Mar-2019, partial |
| `polaris-bridge-failover.md` | G. Ferrante (retires Q3) | “normal” | most recent `polaris` query | AGI-7259 | 26-Apr-2021, successful |
| `sanctions-queue-surge.md` | G. Ferrante (retires Q3) | “usually fine” | most recent `sanctions` query | CM-46272 | 16-Mar-2024, successful |

## Systemic control context

`docs/architecture/estate-overview.md` identifies four cross-cutting conditions that constrain any future automation:

1. **Brand handling has four sources of truth:** typelist, varchar column, POLARIS codes, and XSLT logic. The record builders add repeated Gosu switch statements, including the same codes as `integration/polaris/mappings/brand_xref.csv`.
2. **Core utilities are duplicated:** three display-name formatters, three VRM normalisers, two rating engines, and two complaint clocks. A control must identify which implementation produced a value before comparing it.
3. **`FeedStatus_Ext` has no state machine:** literal strings drive batches and rules. The observed contract is documented in `FEEDSTATUS-STATE-MACHINE.md`.
4. **IPT is computed in four places:** month-end reconciliation currently detects divergence operationally; it does not prevent or explain it.

These are documentation targets in Phase 0, not correction targets.

## Phase 1: enforced CI, and the dormant strangler scaffold

Phase 1 changes how this repository is *validated*. It changes no production business behaviour of the record builders, rating engines, batches, copybooks, or mappings.

### Pipeline changes (both pipelines)

| Pipeline | Before | After |
|---|---|---|
| `Jenkinsfile`, stage `GUnit (subset)` | `sh './gwb test -Dsuite=smoke \|\| true'` | `sh './gwb test -Dsuite=smoke'` |
| `Jenkinsfile`, new stage `golden-master suite` | did not exist | `sh 'sh tools/ci/run-golden-master.sh'` |
| `Jenkinsfile.legacy` | `node('gwbuild-old') { stage('release') { sh '/opt/agi/release/do_release.sh $RELEASE_TAG' } }` — no checkout, no compile, no tests | `stage('checkout')`, then blocking `stage('golden-master suite')`, then the unchanged `stage('release')` |

**Release owners must note:** the second and third rows change production release gating. A release whose golden-master tests fail now stops before `/opt/agi/release/do_release.sh` runs. `do_release.sh` itself is untouched and remains outside source control, so this repository still cannot attest what that script does.

### The blocking golden-master suite

- Class list: `tools/ci/golden-master-suite.txt`, one `<centre> <class>` entry per line. Adding a builder's characterization test here is how a Phase-1 pilot becomes release-gating.
- Runner: `tools/ci/run-golden-master.sh` (`set -eu`; no `|| true`, no `set +e`, no `catchError`).
- Guard: `tools/ci/verify_phase1_scaffold.py`, which fails the stage if a listed test class has been deleted or renamed, if a committed `.golden` fixture and the literal asserted in its characterization test have drifted apart, if a fixture stops describing a 512-byte record, if a shadow flag is enabled in any committed environment file, or if either pipeline re-acquires a failure-swallowing test invocation.
- Known limitation, flagged for build engineering: the per-class selector is passed as `-Dtestclass=<comma-separated>` alongside the `-Dcenter=` selector the compile stages already use. If the Guidewire build plugin ignores that property, the centre's whole GUnit suite runs instead — a superset, still blocking. The stage cannot silently run nothing, because the guard fails first if a listed class file is missing.

### Feature-flag convention (`albion.util.AlbionFeatureFlags`)

```
<centre>.feature.<name>.enabled=true|false
<centre>.feature.<name>.brands=ALBDIR,ALBBRK          # optional allow-list; "*" means all brands
<centre>.feature.<name>.brand.<BRANDCODE>.enabled=true|false   # optional per-brand/per-book override
```

`<centre>` is the prefix the environment files already use: `cl`, `po`, `bi`, `co`, `int`. Resolution precedence: the per-brand override, then `.enabled`, then the `.brands` allow-list. **Every ambiguous case fails closed to the legacy path** — absent key, blank value, unparseable value, or a brand absent from a populated allow-list. `.enabled` must read exactly `true` (trimmed, case-insensitive, trailing `# comment` ignored).

The default flag source is `System.getProperty`. Whether the `environments/*/*.properties` files are surfaced as JVM system properties on the app servers is not evidenced anywhere in this repository; if they are not, an unresolvable key simply reads as `false` and the legacy path runs, so the scaffold is dormant either way. A bootstrap that loads an environment file directly can install it with `AlbionFeatureFlags.useProperties(...)`. This must be settled before any flag is turned on.

No shadow flag is set in any environment file. The scaffold is therefore inert in every environment, dev included, and `verify_phase1_scaffold.py` fails the build if a committed environment file ever sets one to anything but `false`.

The pre-existing `<centre>.feature.newratingengine.enabled` key (present in every environment, `false` in prod) still has **no Gosu reader anywhere in the estate**. This utility deliberately does not adopt it; rating-engine convergence is a separate serialized stream.

### Reconciliation tolerance semantics (`albion.integration.shadow.ShadowTolerance`)

The month-end tolerance recorded in the control register above — “difference of less than 0.1%, exactly 0.1% is not stated as acceptable” — is encoded as `ShadowTolerance.iptMonthEndCountTolerance()`, i.e. a maximum relative difference of `0.001` compared with a strict `<`. A relative difference of exactly `0.001` is a breach, not an accepted difference.

Fixed-width records are compared **byte-exactly**; a numeric tolerance never relaxes a string comparison. Numeric comparisons use the relative difference against the legacy value; a zero legacy value with a non-zero candidate is always a breach.

Recorded diffs go to `ShadowDiffRecorder`. The default implementation writes one structured, single-line record per non-matching run through the logging appenders under the dedicated category `albion.integration.shadow` (ERROR for breaches and candidate failures, WARN for accepted within-tolerance differences). This is explicitly not the `logComplianceBreach(...)` print-only pattern used elsewhere in the estate. A persisted `ShadowDiff_Ext` entity would be a schema change and is out of scope for Phase 1; the recorder interface exists so that sink can be added without touching callers.

### Findings recorded, not corrected

| Finding | Evidence | Why it is not fixed here |
|---|---|---|
| `Jenkinsfile.legacy` had no test or compile invocation at all — the swallow pattern was not the only gap in production release validation | the file as of Phase 0 | Fixed only to the extent of adding the blocking suite; `do_release.sh` remains unversioned and unattested |
| Both record builders declare `DATE_FMT = "yyyyMMdd" // except VehicleVRM_Ext / InceptionDate_Ext which is ddMMyy because 1987`, but that field is the only date in each record and is formatted with `DATE_FMT`, i.e. `yyyyMMdd`. The comment and the interface docs it echoes do not match the code. | `IptRecordBuilder.formatDate`, `PolarisMfRecordBuilder.formatDate` | Production emits `yyyyMMdd`; that is what the characterization tests pin. Changing either the code or the mainframe expectation is a behaviour change |
| The `RECORD_LENGTH` length guard is effectively unreachable: the filler `pad("", RECORD_LENGTH - sb.length())` is evaluated first, so an over-length field throws `StringIndexOutOfBoundsException` from `String.repeat` before the guard's `IllegalStateException` can be raised | pinned by `testDeclaredLengthGuardIsPreemptedByOversizedNumber` | The guard is the documented “happened in prod twice, both on 29th Feb” control. Reordering it changes which exception production raises |
| A negative amount whose final cent digit is `9` throws `StringIndexOutOfBoundsException` instead of producing a record, because the overpunch alphabet `"JKLMNOPQR"` has nine characters and is indexed one place high | pinned by `testNegativeAmountEndingInNineStillFails` | The feed failing is current production behaviour; correcting the index changes emitted bytes |
| `brandMap()` is case sensitive, so a lower-case brand code silently becomes the `999999` default sentinel rather than raising | pinned by `testBrandCodeMatrixIncludingUnknownAndNull` | Brand handling belongs to the single-threaded brand-consolidation stream (AGI-30921 / AGI-5452) |
| Brand codes remain duplicated between each builder's `brandMap()` and `integration/polaris/mappings/brand_xref.csv` | both builders | Out of scope by instruction. The risk is carried as a note on every recorded shadow diff instead |
| `AlbionFeatureFlags` and the shadow classes are duplicated across all four centre source trees | `*/gsrc/albion/util/`, `*/gsrc/albion/integration/shadow/` | There is no shared Gosu module in this monorepo; the duplication follows the estate's existing per-centre layout. A shared module is its own change |

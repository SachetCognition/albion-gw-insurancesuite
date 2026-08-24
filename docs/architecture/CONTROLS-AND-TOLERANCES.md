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
| Release-pipeline test enforcement | PR compilation is blocking, but `Jenkinsfile` runs `./gwb test -Dsuite=smoke || true`, so every GUnit failure is swallowed. The comment says `|| true` was added “temporarily” in 2021. | `Jenkinsfile`, stage `GUnit (subset)` | Build engineering; no control owner is named | Run the same suite without shell suppression; fail the build on non-zero exit; publish test results; distinguish test infrastructure failure from test failure without converting either to success. |
| Legacy production-release validation | `Jenkinsfile.legacy` contains no compile or GUnit invocation. It calls `/opt/agi/release/do_release.sh`, which is not in source control, so this repository cannot prove what production release validation occurs. | `Jenkinsfile.legacy` | Owner of Jenkins job `AGI-GW-RELEASE-PROD`; not named | Version the release checks or attest their exact revision; require centre compilation and the agreed blocking parity suite before release; retain immutable evidence tied to `$RELEASE_TAG`. |

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

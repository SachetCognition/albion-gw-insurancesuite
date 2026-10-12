# agi-gw-insurancesuite

Albion General Insurance Group — Guidewire InsuranceSuite 10 configuration monorepo for ClaimCenter, PolicyCenter, BillingCenter and ContactManager, plus the integration and batch estate that connects the suite to the POLARIS mainframe and to 18 external interfaces.

Migrated from SVN to Git on 22-Mar-2016; earlier history is held in the archived SVN dump. Owned by the AGI-GW Platform team; per-area owners are in `CODEOWNERS`.

## Branching

| Branch | Purpose |
|--------|---------|
| `main` | Integration branch; PR pipeline target |
| `release/*` | Production release lines |
| `heritage/*` | Heritage-book maintenance; subject to the mainframe change window below |

## Repository layout

| Path | Contents |
|------|----------|
| `claimcenter/config/` | ClaimCenter configuration: FNOL to settlement, OIC, catastrophe, complaints |
| `policycenter/config/` | PolicyCenter configuration: new business, renewals (PS21/5), MTA, schemes |
| `billingcenter/config/` | BillingCenter configuration: Direct Debit collections, dunning, broker accounts |
| `contactmanager/` | ContactManager 10 — group party hub ("golden party"); configuration under `modules/configuration/` |
| `integration/` | POLARIS copybooks, Paragon XSLT, interface field maps and sample records |
| `batch/` | Control-M job definitions (`controlm/`) and the JCL members they submit (`jcl/`) |
| `environments/` | Per-environment property templates rendered at deploy time (see below) |
| `legacy/` | POLARIS DDL extracts and Project Mercury migration reconciliation |
| `tools/scripts/` | Operational shell scripts and the CI consistency checks |
| `tools/sql-fixes/` | Production data fixes, 2015 onwards (named `<date>_<ticket>_datafix.sql`) |
| `tools/ci/` | Gradle init script used by the CI GUnit stages |
| `docs/` | Architecture notes, interface specifications, business journeys and runbooks |

## How the centres are configured

- **Rules.** Each rule set is a native Guidewire rule set: a `<RuleSet>.grs` class under `config/rules/rules/<Family>/` and one `.gr` file per rule under the matching `<RuleSet>_dir/`. Rules carry their legacy rule ID (`AGI_<FAMILY>_<nnn>`) and change ticket in the rule name or body. Review activities are raised through `albion.util.AlbionActivityUtils.raiseActivity(bean, "<pattern code>", subject)`.
- **Admin data.** Activity patterns and other reference data are loaded from each centre's `config/import/` admin-data XML. A pattern code used in Gosu or rules must exist there; the coherence check (E11) enforces this.
- **Outbound integration.** Each external destination is declared in `config/messaging/` and backed by a `MessageTransport` plugin registered in `config/plugin/registry/*Transport.gwp`. Transports extend `albion.integration.common.AlbionSpoolTransport`, which writes one fixed-width record per message to the destination's flat-file spool via `FlatFileSpooler`. The spool directory is `<prefix>.integration.spool.dir` (default `/var/agi/spool/outbound`); Control-M file-transfer jobs collect and deliver the spool files. A message is acknowledged once spooled and retried by the destination otherwise.
- **Shared services.** `albion.config.AlbionConfigService` (business constants per environment) and `albion.integration.common.BrandMappingService` (POLARIS ↔ `BrandCode_Ext`) are copied into each centre; see `docs/architecture/albion-config-and-brand-services.md`.

## Batch

- `batch/controlm/*.xml` mirrors the production Control-M application `AGI-GWSUITE` (18 jobs on nodes `agibatch01`–`agibatch04`). Every job names its JCL member with `MEMNAME` (equal to `JOBNAME`) in `MEMLIB="AGI.PROD.JCLLIB"`, and `batch/jcl/<MEMNAME>.jcl` carries the matching `//<MEMNAME> JOB` card.
- All jobs wait on the two external conditions `AGI-DB-BACKUP-OK` (database backup) and `POLARIS-EOD-COMPLETE` (mainframe end of day). If `POLARIS-EOD-COMPLETE` has not arrived by 03:00, follow `docs/runbooks/gw-suite-daily-batch-recovery.md`.
- `batch/jcl/adhoc/` holds members that are not scheduled and are submitted only on request under a break-glass MIM. Its README lists them, the full job-to-member map and the members that were removed.
- Guidewire batch processes are also listed in each centre's `config/scheduler/scheduler-config.xml`; an entry is `disabled="true"` in environments where Control-M runs it instead.

## Environments

`environments/<env>/` (dev, dev2, sit, sit2, uat, preprod, prod, perf, dr, train) holds one `*.properties.template` per centre, `integration.properties.template` and `hosts.txt.template`. Non-sensitive values (feature flags, `polaris.enabled`, IPT rates, business constants) are committed in the templates. Credentials, hosts, queue names and endpoints are `${TOKEN}` placeholders resolved from the environment's CyberArk safe (`AGI-GW-<ENV>`) by the deployment tool, which fails the deploy if any token is left unresolved. Rendered `.properties` files are gitignored and must never be committed. Details: `environments/README.txt`.

## Build and CI

- Compile per centre with `./gwb compile -Dcenter=cc|pc|bc|cm` (JDK 8 via `JAVA18_HOME`); run GUnit with `./gwb test -Dcenter=<centre>`. Building requires the licensed Guidewire distribution (`repository/`, `gradle/` and base platform modules), which is not stored in this repository.
- `Jenkinsfile` (PR pipeline) gates, in order:
  1. `python3 tools/scripts/check_brand_config_drift.py` — brand mapping and config drift across centres;
  2. `python3 tools/scripts/check_gw_coherence.py .` — references, admin data, rule format and Control-M/JCL consistency (exit 1 on any finding);
  3. compile of all four centres;
  4. full GUnit suite per centre with JaCoCo coverage (`tools/ci/coverage.init.gradle`);
  5. SonarQube analysis and quality gate (pipeline aborts on a red gate).
- `Jenkinsfile.legacy` is the production release pipeline (Jenkins job `AGI-GW-RELEASE-PROD`).
- The Ant build (`build.xml`) is used only for the Paragon feed assembly step and the heritage recon jar. It must be retained (CHG-47886).

## Change rules

1. Brand mapping changes must be checked against all four sources of truth: the `BrandCode_Ext` typelists, the brand varchar columns, `integration/polaris/mappings/brand_xref.csv` and the Paragon XSLT (see `docs/architecture/estate-overview.md`).
2. Changes touching `heritage` or POLARIS must be scheduled in the mainframe change window, Sunday 02:00–04:00. Copybook changes require 90 days' notice to the vendor; the copybook master is held in Endevor.
3. `FeedStatus_Ext` values are load-bearing strings consumed by batch and integration jobs. Search all usages before changing or renaming any value (see `docs/architecture/FEEDSTATUS-STATE-MACHINE.md`).
4. Control-M changes must keep `JOBNAME`, `MEMNAME`, the JCL file name and the JOB card in step; the coherence check fails the build otherwise.
5. Sonar exclusions are maintained in `sonar-project.properties`; any new exclusion must be justified in the PR.

## Known gaps

- `AGIP709D` (Paragon print, `AGI_EOM_18`) and `AGIC163D` (sanctions screening, `AGI_WEEKLY_15`) were rebuilt from sibling members; their program and dataset names still need confirming against the Endevor master.
- Several interface feeds have JCL but no Control-M job and run only on request: POLARIS heritage nightly sync (`AGIC488D`, `AGIM386M`), Broker EDI, data warehouse extract, reinsurance and Flood Re bordereaux, ELTO. The heritage nightly sync is the first candidate for scheduling.
- Batch class headers name Control-M jobs that are not in `batch/controlm/`; the Control-M side of those schedules is held only in the production scheduler.
- `STATUS=UNKNOWN` rows in `integration/mappings/` have not been re-verified since their `LAST_VERIFIED` date (see `integration/mappings/README.md`).
- Field-level drift between copybooks and record builders is tracked per interface in `docs/interfaces/INTERFACE-CONTRACT-INVENTORY.md`.
- POLARIS decommissioning is planned for 2027; until then the end-of-day gate and the copybook notice period apply.

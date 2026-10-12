# agi-gw-insurancesuite

Albion General Insurance Group — Guidewire InsuranceSuite 10 configuration monorepo covering ClaimCenter, PolicyCenter, BillingCenter and ContactManager, plus the integration estate that bridges the suite to the POLARIS mainframe.

Migrated from SVN to Git on 22-Mar-2016; earlier history is held in the archived SVN dump.

## Branching

| Branch | Purpose |
|--------|---------|
| `main` | Integration branch; PR pipeline target |
| `release/*` | Production release lines |
| `heritage/*` | Heritage-book maintenance; subject to the mainframe change window below |

## Modules

| Path | Contents |
|------|----------|
| `contactmanager/` | ContactManager 10 — group party hub ("golden party") |
| `claimcenter/config/` | ClaimCenter configuration: FNOL to settlement, OIC, catastrophe, complaints |
| `policycenter/config/` | PolicyCenter configuration: new business, renewals (PS21/5), MTA, schemes |
| `billingcenter/config/` | BillingCenter configuration: Direct Debit collections, dunning, broker accounts |
| `integration/` | Copybooks, XSLT and field mappings for the POLARIS bridge and external interfaces |
| `batch/` | JCL and Control-M job definitions (mirrors of the scheduler definitions) |
| `legacy/` | POLARIS DDL extracts and Project Mercury migration reconciliation |
| `tools/sql-fixes/` | Production data fixes, 2015 onwards |
| `docs/` | Business journeys, interface specifications, architecture notes and runbooks |
| `environments/` | Per-environment property files |

## Build

- Compile per centre with `./gwb compile -Dcenter=cc|pc|bc|cm` (JDK 8 via `JAVA18_HOME`). Smoke GUnit suite: `./gwb test -Dsuite=smoke`.
- Building requires the licensed Guidewire distribution (`repository/`, `gradle/` and base platform modules), which is not stored in this repository.
- `Jenkinsfile` is the PR pipeline. `Jenkinsfile.legacy` is the production release pipeline (Jenkins job `AGI-GW-RELEASE-PROD`).
- The Ant build (`build.xml`) is used only for the Paragon feed assembly step and the heritage recon jar. It must be retained (CHG-47886).

## Change rules

1. Brand mapping changes must be checked against all four sources of truth (see `docs/architecture/estate-overview.md`).
2. Changes touching `heritage` or POLARIS must be scheduled in the mainframe change window, Sunday 02:00–04:00. Copybook changes require 90 days' notice to the vendor.
3. `FeedStatus_Ext` values are load-bearing strings consumed by batch and integration jobs. Search all usages before changing or renaming any value (see `docs/architecture/FEEDSTATUS-STATE-MACHINE.md`).
4. Sonar exclusions are maintained in `sonar-project.properties`; any new exclusion must be justified in the PR.

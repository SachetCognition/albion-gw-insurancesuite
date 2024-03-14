# agi-gw-insurancesuite

Albion General Insurance Group — Guidewire InsuranceSuite configuration monorepo (CC / PC / BC / ContactManager + integration estate).

> Migrated SVN → Git 22-Mar-2016. History before that lives in the SVN dump on the NAS (if the NAS still spins up).
> Branching: `master` = prod-ish. `release/*` = what is actually in prod. `heritage/*` = do not ask.

## Modules
| Path | What | Health |
|------|------|--------|
| `contactmanager/` | ContactManager 10 — group party hub ("golden party") | amber |
| `claimcenter/config/` | CC config: FNOL→settlement, OIC, cat, complaints | amber/red |
| `policycenter/config/` | PC config: NB, renewals (PS21/5), MTA, schemes | amber |
| `billingcenter/config/` | BC config: DD collections, dunning, broker a/c | amber |
| `integration/` | Copybooks, XSLT, mappings — the POLARIS bridge | red, load-bearing |
| `batch/` | JCL + Control-M defs (mirrors of scheduler truth) | red |
| `legacy/` | POLARIS DDL extracts, migration recon | archaeological |
| `tools/sql-fixes/` | Production data fixes, 2015→ | growing |
| `docs/` | Journeys, interface specs, runbooks | best available |

## Build
`./gwb compile` per center. Full pipeline: see `Jenkinsfile` (new) and `Jenkinsfile.legacy` (still what PROD releases use).
Ant build (`build.xml`) is only for the Paragon feed assembly step. Do not delete (CHG-47886).

## The rules
1. Do not change brand mapping without checking all four sources of truth (see estate-overview.md).
2. Anything touching `heritage` or POLARIS: mainframe change window is Sunday 02:00–04:00, 90-day vendor notice on copybooks.
3. `FeedStatus_Ext` values are load-bearing strings. Grep before you "tidy".
4. If Sonar blocks you, the exclusions file is where quality goes to be forgotten — add yours like everyone else.

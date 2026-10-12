# On-demand JCL members

Members in this directory are **not scheduled in Control-M**. They are submitted on request
(month/quarter-end runs, reinsurer or regulator requests, re-runs) and only under a break-glass MIM,
following the runbooks in `docs/runbooks/`. Each member's JOB card matches its file name.

| Member | Interface |
|---|---|
| `AGIB402M` | Broker EDI (SSP/Acturis/OpenGI) messages |
| `AGIB886M` | Broker EDI (SSP/Acturis/OpenGI) messages |
| `AGIC349W` | Broker EDI (SSP/Acturis/OpenGI) messages |
| `AGIC357M` | Group Data Warehouse (Teradata) extract |
| `AGIC488D` | POLARIS mainframe policy admin (heritage book) nightly sync |
| `AGIC622W` | Flood Re cession & bordereaux |
| `AGIM120D` | Group Data Warehouse (Teradata) extract |
| `AGIM269D` | Reinsurance bordereaux (XL Cat programme) |
| `AGIM386M` | POLARIS mainframe policy admin (heritage book) nightly sync |
| `AGIP426D` | Reinsurance bordereaux (XL Cat programme) |
| `AGIP581D` | Group Data Warehouse (Teradata) extract |
| `AGIP761W` | Reinsurance bordereaux (XL Cat programme) |
| `AGIP801M` | Employers Liability Tracing Office ELD feed |

Scheduled members live in `batch/jcl/` and are referenced from `batch/controlm/*.xml` via
`MEMNAME`/`MEMLIB="AGI.PROD.JCLLIB"`. External Control-M conditions (not produced by any job in this
repo): `AGI-DB-BACKUP-OK` (database backup) and `POLARIS-EOD-COMPLETE` (mainframe end of day).

## Scheduled job to member map

| Control-M file | JOBNAME / MEMNAME | Description | Member source |
|---|---|---|---|
| `AGI_EOM_01.xml` | `AGIB137D` | Group Payment Hub (BACS/Direct Debit/Faster Payments) | `AGIP137D` (renamed) |
| `AGI_EOM_05.xml` | `AGIC618D` | Aggregator gateway (CTM/MSM/GoCo/Confused) | `AGIC755D` (renamed) |
| `AGI_EOM_09.xml` | `AGIC477D` | Motor Insurance Database (MIB) vehicle feed | `AGIB115D` (renamed) |
| `AGI_EOM_10.xml` | `AGIB615D` | Claims & Underwriting Exchange enquiry/load | `AGIC920M` (renamed) |
| `AGI_EOM_12.xml` | `AGIP789D` | DVLA MyLicence ADD/DDS lookup | `AGIP357M` (renamed) |
| `AGI_EOM_18.xml` | `AGIP709D` | Print vendor (Paragon) document composition feed | new (standard layout) |
| `AGI_NIGHTLY_03.xml` | `AGIB819D` | HMT/OFSI sanctions & PEP screening via WorldCheck | `AGIC892M` (renamed) |
| `AGI_NIGHTLY_04.xml` | `AGIB109D` | CIFAS fraud database | `AGIB444M` (renamed) |
| `AGI_NIGHTLY_06.xml` | `AGIC205D` | Experian credit & quote-manipulation checks | `AGIC424D` (renamed) |
| `AGI_NIGHTLY_07.xml` | `AGIB253D` | Verisk property data enrichment | `AGIB610W` (renamed) |
| `AGI_NIGHTLY_08.xml` | `AGIP632D` | DVLA MyLicence ADD/DDS lookup | `AGIC489W` (renamed) |
| `AGI_NIGHTLY_13.xml` | `AGIB765D` | Motor Insurance Database (MIB) vehicle feed | `AGIB696M` (renamed) |
| `AGI_NIGHTLY_17.xml` | `AGIC364D` | Verisk property data enrichment | `AGIB771W` (renamed) |
| `AGI_WEEKLY_02.xml` | `AGIC960D` | Insurance Premium Tax calculation & HMRC returns | `AGIC157D` (renamed) |
| `AGI_WEEKLY_11.xml` | `AGIB368D` | Experian credit & quote-manipulation checks | `AGIC520D` (renamed) |
| `AGI_WEEKLY_14.xml` | `AGIC679D` | HMT/OFSI sanctions & PEP screening via WorldCheck | `AGIP609W` (renamed) |
| `AGI_WEEKLY_15.xml` | `AGIC163D` | HMT/OFSI sanctions & PEP screening via WorldCheck | new (layout of `AGIB819D`) |
| `AGI_WEEKLY_16.xml` | `AGIC468D` | CRIF claims history | `AGIB513D` (renamed) |

## Removed members

Removed because they duplicated a scheduled member for the same interface and had no Control-M job,
script, runbook or document referencing them. They remain in git history.

| Member | Interface |
|---|---|
| `AGIB237M` | Experian credit & quote-manipulation checks |
| `AGIB364D` | Insurance Premium Tax calculation & HMRC returns |
| `AGIB600M` | CIFAS fraud database |
| `AGIB870D` | Aggregator gateway (CTM/MSM/GoCo/Confused) |
| `AGIC531D` | Experian credit & quote-manipulation checks |
| `AGIC814M` | Group Payment Hub (BACS/Direct Debit/Faster Payments) |
| `AGIC998M` | Experian credit & quote-manipulation checks |
| `AGIM118D` | CRIF claims history |
| `AGIM140M` | CIFAS fraud database |
| `AGIM498W` | Claims & Underwriting Exchange enquiry/load |
| `AGIM576W` | Motor Insurance Database (MIB) vehicle feed |
| `AGIM777M` | Motor Insurance Database (MIB) vehicle feed |
| `AGIM919M` | DVLA MyLicence ADD/DDS lookup |
| `AGIP174M` | Claims & Underwriting Exchange enquiry/load |
| `AGIP278M` | CIFAS fraud database |
| `AGIP299W` | Verisk property data enrichment |
| `AGIP759D` | CRIF claims history |

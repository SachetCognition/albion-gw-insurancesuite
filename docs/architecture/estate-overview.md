# Albion General Insurance Group — Guidewire Estate Overview

## Timeline
- **1996–2011**: POLARIS mainframe (CICS/COBOL/DB2) runs all lines of business. Modules P100–P9xx.
- **2011**: Guidewire programme starts — ClaimCenter first, motor only, Albion Direct only.
- **2012–2014**: PolicyCenter new business and renewals for direct personal lines. The broker book stays on POLARIS.
- **2014–2017**: "Project Mercury" — migration of the broker and heritage books in 14 waves. Waves 6 and 11 were partially rolled back; `LegacyPolicySnapshot_Ext` (41M rows) holds the policies left in that state.
- **2016**: RetailPlus bancassurance brands onboarded; their contractual SLAs are hard-coded in configuration.
- **2017–2019**: BillingCenter replaces 2 of the 3 legacy billing systems. The third (broker accounts) still runs on an AS/400 fronted by `BrokerBordereauxService`.
- **2019**: Novabank partnership exits; 212 HNW pilot policies and ~900 configuration references remain.
- **2021**: GI pricing remedy (PS21/5) — dual rating engines introduced as a temporary measure and still in place.
- **2021–2023**: Guidewire v9 → v10 upgrade. PCF diff-against-base was not completed; cloned screens are frozen.
- **2024–now**: Consumer Duty checkpoints added to every customer journey. POLARIS decommissioning is planned for 2027 (the date has moved five times).

## Integration map
18 external interfaces (see `docs/interfaces/` and `INTERFACE-CONTRACT-INVENTORY.md`). Outbound records are spooled by each centre's `*Transport` messaging plugin and delivered by Control-M file-transfer jobs (`batch/controlm/`, `batch/jcl/`). Single points of failure: the POLARIS end-of-day gate (`POLARIS-EOD-COMPLETE`), the one MapInfo desktop used for flood geocoding, and the single POLARIS bridge SME (see `docs/runbooks/polaris-bridge-failover.md`).

## Known systemic issues
1. Brand handling: typelist + varchar column + POLARIS codes (`integration/polaris/mappings/brand_xref.csv`) + XSLT logic — four sources of truth, checked by `tools/scripts/check_brand_config_drift.py`.
2. Three display-name formatters, three VRM normalisers, two rating engines, two complaint clocks.
3. `FeedStatus_Ext` drives the feed batches with no enforced state machine — see `FEEDSTATUS-STATE-MACHINE.md`.
4. IPT is computed in 4 places; month-end reconciliation is a runbook (`docs/runbooks/month-end-ipt-reconciliation.md`), not a control.

## Strangler migration
POLARIS-facing record builders are replaced feed by feed behind `albion.integration.shadow.ShadowRecordFacade`, which the
registered `IptTransport` (ClaimCenter) and `PolarisMfTransport` (PolicyCenter, ContactManager) call for every record.
Shadow running is switched by `<prefix>.feature.shadow.enabled` / `.feeds` / `.brands` in the environment templates and
ships off, so each feed writes its legacy record only. Golden-master GUnit tests pin today's IPT and POLARIS_MF 512-byte
records and the IPT calculation, and prove each candidate builder byte-identical. See `docs/migration/strangler-phase1.md`.

## Admin data
Each centre loads its activity patterns from `<config-root>/import/gen/albion-activity-patterns.xml`, listed in that directory's `importfiles.txt` and loaded with the standard admin-data import: ClaimCenter 13, PolicyCenter 20, BillingCenter 15 and ContactManager 18 patterns. Every pattern code raised by a rule (`AGI_*`) or an escalation batch is defined there; `check_gw_coherence.py` (E11) fails the build if a code is missing. In BillingCenter and ContactManager the activity subjects are display keys.

## Known gaps
- **Claim data outside ClaimCenter.** BillingCenter and ContactManager do not hold claim data. Claim-amount thresholds read 0 in those centres, and the ClaimNumber slots in their outbound records are blank or filler; record lengths are unchanged.
- **Navigation.** The Albion screens in all four centres have no navigation entry point, because the base-product menus they hang from are not held in this repository.
- **Encryption.** NI numbers and ContactManager bank details are encrypted at rest by `albion.security.AlbionAesEncryptionPlugin` (AES-256-GCM, keys from CyberArk); see `albion-config-and-brand-services.md` (Encryption at rest). ContactManager `LicenseNumber` and `TaxID` stay unencrypted until a hashed lookup column replaces their database-equality duplicate matching.
- **Rules for business review.**
  - BillingCenter `AGI_ESCA_001`/`AGI_ESCA_002` and `AGI_PREU_001`/`AGI_PREU_006` have duplicate conditions.
  - BillingCenter `AGI_ESCA_009` and `AGI_PREU_007`, and ContactManager `vali_002`, fire on every record.
  - ContactManager `preu_006` duplicates `preu_003`.
- **POLARIS policyholder summary.** The summary is carried on `ABContact` in ContactManager.
- **Mainframe confirmation.** Program and dataset names in `AGIP709D` and `AGIC163D` are still to be confirmed against Endevor.
- **Unscheduled batch.** Some interface feeds have JCL in `batch/jcl/adhoc/` but no Control-M job. The POLARIS heritage nightly sync is the first candidate for scheduling.

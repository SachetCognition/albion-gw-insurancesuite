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

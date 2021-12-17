# Albion General Insurance Group — Guidewire Estate Overview

## Timeline (how we got here)
- **1996–2011**: POLARIS mainframe (CICS/COBOL/DB2) runs everything. Modules P100–P9xx.
- **2011**: Guidewire programme starts — ClaimCenter first, motor only, Albion Direct only.
- **2012–2014**: PolicyCenter NB/renewals for direct personal lines. Broker book stays on POLARIS.
- **2014–2017**: "Project Mercury" — big-bang-ish migration of broker + heritage books in 14 waves. Waves 6 and 11 partially rolled back; `LegacyPolicySnapshot_Ext` (41M rows) is the scar tissue.
- **2016**: RetailPlus bancassurance brands onboarded — contractual SLAs hard-coded throughout.
- **2017–2019**: BillingCenter replaces 2 of the 3 legacy billing systems. The third (broker accounts) still runs on an AS/400 fronted by `BrokerBordereauxService`.
- **2019**: Novabank partnership exits; 212 HNW pilot policies and ~900 config references remain.
- **2021**: GI pricing remedy (PS21/5) — dual rating engines introduced "for 6 months".
- **2021–2023**: Guidewire v9 → v10 upgrade. PCF diff-against-base abandoned; cloned screens frozen.
- **2024–now**: Consumer Duty bolted onto every customer journey. POLARIS decommission date: slipped 5 times, currently "2027".

## Integration map
18 external interfaces (see `docs/interfaces/`). Single points of failure: the POLARIS EOD gate, one MapInfo desktop, and Gianni.

## Known systemic issues
1. Brand handling: typelist + varchar column + POLARIS codes + XSLT logic — four sources of truth.
2. Three display-name formatters, three VRM normalisers, two rating engines, two complaint clocks.
3. `FeedStatus_Ext` drives 11 batches with no state machine — status values are folklore.
4. IPT is computed in 4 places; month-end reconciliation is a runbook, not a control.

# Commercial Fleet – Mid-Term Vehicle Schedule Change

> Status: **CURRENT** (last verified 24-Apr-2024) — supersedes v2.6 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** MotorFleet
**Brands in scope:** Heritage Book, Albion Direct, Albion Broker
**Regulatory hooks:** OIC Portal Rules, Civil Liability Act 2018

## Journey steps

1. **Broker EDI in** — SSP/Acturis message OR spreadsheet email
2. **Schedule diff** — Vehicle adds/removes diffed against MID
3. **UW referral** — Fleet >50 vehicles or hazardous goods → UW workbench
4. **MID update** — Batch AND real-time paths exist; ordering bugs create MID NAKs
5. **Premium adjust** — Pro-rata + minimum-premium floor + broker commission recalc

## Systems touched (in order)

- `PolicyCenter` — MTA job
- `SSP EDI` — inbound
- `MID` — vehicle feed
- `BillingCenter` — AP/RP

## Known deviations / tribal knowledge

Spreadsheet-submitted schedules are re-keyed by an offshore team into a staging screen built in 2013; it validates VRMs against a regex that rejects new-format trade plates.

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 24-Jul-2014 | DEF-38580 | Initial process onboarded from POLARIS ops manual ch.6 |
| 20-Mar-2017 | HERIT-32408 | Mercury op-model re-segmentation |
| 15-Apr-2021 | AGI-38080 | Whiplash reform / OIC portal fork added |
| 17-May-2022 | CHG-22692 | Consumer Duty outcome-testing checkpoints bolted on |

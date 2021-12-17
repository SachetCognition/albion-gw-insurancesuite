# Cat Event – Named Storm Surge Mode

> Status: **CURRENT** (last verified 13-Oct-2021) — supersedes v2.4 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** HomeProperty/CommercialProperty
**Brands in scope:** Albion Direct, Albion Broker, RetailPlus Partnerships
**Regulatory hooks:** FCA ICOBS 8, PS21/5

## Journey steps

1. **Event declare** — Cat coordinator assigns event code within 4h of Met Office naming
2. **Bulk tag** — Postcode-polygon claims auto-linked (polygon file maintained in MapInfo by one person)
3. **Surge triage** — Fast-track thresholds doubled; segmentation overrides
4. **Field deploy** — Loss adjuster panel surge contracts
5. **Daily MI** — Exec dashboard = Excel refreshed from 4 SQL scripts in tools/sql-fixes
6. **Stand down** — Thresholds revert — twice they haven't (see PRB-24274)

## Systems touched (in order)

- `ClaimCenter` — event linking
- `Reinsurance` — XL cat notify at 60% retention
- `DWH` — event MI

## Known deviations / tribal knowledge

Surge mode is toggled via a script_parameter changed directly in prod DB by DBAs under break-glass. It has been left on for up to 11 days after stand-down.

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 27-Oct-2014 | CHG-4949 | Initial process onboarded from POLARIS ops manual ch.8 |
| 03-Nov-2018 | CM-44022 | Mercury op-model re-segmentation |
| 14-Dec-2019 | DEF-12991 | Whiplash reform / OIC portal fork added |
| 27-Aug-2023 | PRB-23105 | Consumer Duty outcome-testing checkpoints bolted on |

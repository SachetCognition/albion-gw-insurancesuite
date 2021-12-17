# Home – Escape of Water end-to-end

> Status: **CURRENT** (last verified 10-Nov-2021) — supersedes v2.8 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** HomeProperty
**Brands in scope:** Heritage Book, Albion Broker, Albion Direct
**Regulatory hooks:** OIC Portal Rules, Civil Liability Act 2018

## Journey steps

1. **FNOL** — EOW is 40% of home claims by volume
2. **Triage** — Postcode BD* forces surveyor (2010 freeze rule, nobody will remove it)
3. **Drying** — IoT drying monitors feed readings via CSV email attachment (yes)
4. **Alternative accommodation** — AA desk; long-running spend leakage reports monthly
5. **Scope & settle** — Scope agreed in supplier portal, re-keyed into CC manually

## Systems touched (in order)

- `ClaimCenter` — core
- `Verisk` — property enrichment
- `Paragon` — letters
- `DWH` — leakage MI

## Known deviations / tribal knowledge

The drying-vendor CSV has a column order change every time the vendor releases; parser has 6 format branches keyed off file header sniffing.

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 22-Sep-2013 | AGI-19304 | Initial process onboarded from POLARIS ops manual ch.3 |
| 21-Dec-2017 | AGI-38460 | Mercury op-model re-segmentation |
| 14-Jun-2020 | REG-34716 | Whiplash reform / OIC portal fork added |
| 21-Sep-2023 | INC-33982 | Consumer Duty outcome-testing checkpoints bolted on |

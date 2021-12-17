# Complaint – DISP Eight-Week Clock with FOS Escalation

> Status: **CURRENT** (last verified 25-May-2023) — supersedes v2.7 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** All lines
**Brands in scope:** Albion Broker, RetailPlus Partnerships, Albion Direct
**Regulatory hooks:** FCA ICOBS 8, PS21/5

## Journey steps

1. **Log** — Complaint logged (5 entry channels, 3 create duplicate cases)
2. **Acknowledge** — T+3 promise vs T+5 regulatory
3. **Investigate** — Root cause taxonomy v2 — MI still reports v1
4. **Four-week holding letter** — auto unless suppressed
5. **Final response** — T+56 hard gate; redress calc + interest at 8% simple
6. **FOS pack** — PDF bundle assembled from 6 systems, one is a shared drive

## Systems touched (in order)

- `ClaimCenter` — complaint entity
- `Pega` — group complaints workflow — dual-keyed
- `Paragon` — letters
- `DWH` — FCA complaints return

## Known deviations / tribal knowledge

The 8-week clock calculation excludes weekends in GW and includes them in Pega. Quarterly FCA return is hand-adjusted to reconcile. Everyone knows.

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 23-Jul-2013 | INC-48677 | Initial process onboarded from POLARIS ops manual ch.11 |
| 10-Feb-2018 | CM-24781 | Mercury op-model re-segmentation |
| 09-May-2019 | GWBC-5025 | Whiplash reform / OIC portal fork added |
| 26-Jan-2022 | CM-38486 | Consumer Duty outcome-testing checkpoints bolted on |

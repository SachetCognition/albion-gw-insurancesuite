# Renewal – FCA PS21/5 Price Walk Compliance

> Status: **CURRENT** (last verified 16-Jun-2023) — supersedes v4.7 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** All personal lines
**Brands in scope:** Heritage Book, Albion Direct, RetailPlus Partnerships
**Regulatory hooks:** FCA ICOBS 8, PS21/5

## Journey steps

1. **T-45 extract** — Renewal candidates extracted nightly
2. **Equivalent NB price** — Dual rating run — old engine AND new engine, compare, alert if >2% variance (alerts ignored)
3. **PS21/5 gate** — Renewal ≤ equivalent NB price or block + refer pricing
4. **Invite generation** — Paragon spool T-28; email fallback T-25
5. **Auto-renew window** — DD customers auto-renew T-0 unless opted out
6. **Lapse chase** — Outbound dialler file T+3

## Systems touched (in order)

- `PolicyCenter` — renewal jobs
- `Rating engine x2` — dual-running 'temporarily' since 2021
- `BillingCenter` — instalment re-plan
- `Paragon` — invites
- `Experian` — re-score

## Known deviations / tribal knowledge

Heritage book renewals run through a SEPARATE batch (HeritageRenewalInviteBatch) that reimplements ~70% of this journey with 2015-era rules. Its PS21/5 gate was retrofitted differently. Pricing insists both are compliant. Evidence pack differs.

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 14-Jan-2014 | REG-5727 | Initial process onboarded from POLARIS ops manual ch.18 |
| 05-Sep-2016 | DEF-39890 | Mercury op-model re-segmentation |
| 08-Sep-2020 | GWCC-6110 | Whiplash reform / OIC portal fork added |
| 10-Oct-2024 | CM-5378 | Consumer Duty outcome-testing checkpoints bolted on |

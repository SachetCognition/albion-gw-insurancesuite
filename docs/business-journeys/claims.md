# Claims – Sanctions Hit During Payment

> Status: **CURRENT** (last verified 08-Mar-2022) — supersedes v2.5 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** All lines
**Brands in scope:** Heritage Book, Albion Broker, RetailPlus Partnerships
**Regulatory hooks:** Flood Re Scheme Rules, IPT (FA1994 s.51)

## Journey steps

1. **Screening** — Payee screened at party create AND pre-payment (different services, different fuzzy thresholds)
2. **Freeze** — TRUEMATCH freezes party + blocks Check writer
3. **L1/L2 review** — Compliance queues; 6y evidence retention
4. **OFSI report** — Manual template; 'automation' is a Word mail-merge
5. **Release** — Override audit trail mandatory

## Systems touched (in order)

- `ContactManager` — golden party + screening state
- `WorldCheck` — vendor
- `ClaimCenter` — payment block
- `BillingCenter` — refund block — added 2 years after claims, gap window documented in REG-8817

## Known deviations / tribal knowledge

The two screening services disagree on 'Ł' vs 'L' transliteration. Compliance manually re-screens Polish surnames. Known since 2019.

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 05-Apr-2015 | GWCC-31450 | Initial process onboarded from POLARIS ops manual ch.15 |
| 25-Jun-2016 | REG-1958 | Mercury op-model re-segmentation |
| 08-Jul-2019 | CM-31566 | Whiplash reform / OIC portal fork added |
| 09-Feb-2025 | REG-43444 | Consumer Duty outcome-testing checkpoints bolted on |

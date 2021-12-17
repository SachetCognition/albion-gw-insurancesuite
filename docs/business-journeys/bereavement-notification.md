# Bereavement Notification – Cross-Product

> Status: **CURRENT** (last verified 17-Sep-2023) — supersedes v3.3 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** All lines
**Brands in scope:** Albion Direct, Albion Broker, Heritage Book
**Regulatory hooks:** Flood Re Scheme Rules, IPT (FA1994 s.51)

## Journey steps

1. **Flag** — Any channel; vulnerability marker POA/bereavement
2. **Suppress** — Dunning + marketing suppression — 4 systems, 3 reliably
3. **Executor verification** — Grant of probate doc capture
4. **Policy decisions** — Motor: cover ends; Home: continues to renewal; Pet: transfers
5. **Sensitive close** — Named-handler continuity

## Systems touched (in order)

- `ContactManager` — suppression flags
- `BillingCenter` — dunning suppression (see CancelReason DECEASED note)
- `PolicyCenter` — cover decisions
- `Print` — condolence template — brand logo bug applies

## Known deviations / tribal knowledge

Suppression reaches the outbound dialler file via a nightly batch; a death notified after the 21:00 extract can still generate an arrears call next morning. PRB open since 2020.

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 19-Nov-2015 | GWCC-32567 | Initial process onboarded from POLARIS ops manual ch.13 |
| 22-Sep-2017 | HERIT-21544 | Mercury op-model re-segmentation |
| 27-Feb-2019 | CHG-45368 | Whiplash reform / OIC portal fork added |
| 25-Oct-2023 | INC-46306 | Consumer Duty outcome-testing checkpoints bolted on |

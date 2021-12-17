# Motor FNOL – Fault Accident with Third Party Injury

> Status: **CURRENT** (last verified 01-Feb-2022) — supersedes v3.5 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** PersonalMotor
**Brands in scope:** Heritage Book, Albion Broker, Albion Direct
**Regulatory hooks:** Flood Re Scheme Rules, IPT (FA1994 s.51)

## Journey steps

1. **Notification** — Customer calls (or app FNOL, which creates a DIFFERENT activity pattern) — script pack v34
2. **CUE & fraud screen** — Synchronous CUE enquiry; fraud model scores; SIU refer if ≥55
3. **Liability decision** — Handler sets liability; disputed cases to TPPD hub
4. **OIC portal fork** — Injury <£5k whiplash → OIC portal via A2A; else litigation track
5. **Repair deploy** — Approved repairer network; total-loss to engineer + salvage (Cat A/B crush)
6. **Hire & intervention** — TP capture attempts credit-hire mitigation within 3h SLA
7. **Settlement** — Payments via BACS batch; recovery raised if non-fault

## Systems touched (in order)

- `ClaimCenter` — intake, segmentation, reserves, payments
- `ContactManager` — party dedupe — 3 Smiths problem
- `CUE` — enquiry + load
- `OIC A2A` — portal integration v2 AND v3 live
- `POLARIS` — heritage motor still notified via mainframe bridge
- `Paragon` — acknowledgement letters

## Known deviations / tribal knowledge

App-originated FNOLs skip the vulnerability prompt (defect since 2022, accepted). Heritage motor book FNOL requires manual POLARIS enquiry — handlers keep a green-screen emulator open. The fraud score threshold differs between the model doc (65) and the code (55).

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 16-Aug-2013 | CM-29527 | Initial process onboarded from POLARIS ops manual ch.8 |
| 17-Aug-2016 | AGI-30537 | Mercury op-model re-segmentation |
| 27-Jul-2021 | AGI-15348 | Whiplash reform / OIC portal fork added |
| 25-Nov-2025 | CM-40680 | Consumer Duty outcome-testing checkpoints bolted on |

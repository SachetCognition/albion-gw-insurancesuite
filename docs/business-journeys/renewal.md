# Renewal – FCA PS21/5 Price Walk Compliance

> Status: **CURRENT** (last verified 16-Jun-2023) — supersedes v4.7 on the wiki, which supersedes the Word doc on the F: drive, which is what Operations actually print out.

**Line of business:** All personal lines
**Brands in scope:** Heritage Book, Albion Direct, RetailPlus Partnerships
**Regulatory hooks:** FCA ICOBS 8, ICOBS 6A/6B, PS21/5, FG21/1 (vulnerable customers)

## Journey steps

1. **T-45 extract** — Renewal candidates extracted nightly
2. **Eligibility and suppression screen** — `AlbionRenewalEligibilityRules.evaluate` (PolicyCenter, `albion.policy.renewal`) returns block codes in this order: `OPT_OUT`, `MARKETING_SUPPRESSED`, `SANCTIONS_HOLD`, `VULNERABILITY_REVIEW`, `BEREAVEMENT_HOLD`, `GDPR_ERASURE_PENDING`. Any code blocks the invite and auto-renew; `AlbionRenewalEligibilityActivities.raise` opens one review activity per pattern (`renewal_suppression`, `renewal_sanctions_hold`, `renewal_vulnerability_review`, `renewal_bereavement_hold`). Runs in `AlbionRenewalFeedBatch` before the PS21/5 gate. No new `FeedStatus_Ext` value.
3. **Equivalent NB price** — Dual rating run — old engine AND new engine, compare, alert if >2% variance (alerts ignored). The result is carried on `PolicyPeriod.EquivalentNBPremium_Ext`, read by `AlbionPolicyPredicates.equivalentNewBusinessPrice`.
4. **PS21/5 gate** — Renewal ≤ equivalent NB price or block + refer pricing. One implementation, `AlbionPS215Gate` (`albion.policy.compliance`): price `TotalIncurred_Ext` (null → 0) strictly greater than the ENBP raises `PRICE_WALK_BREACH` and writes the `COMPLIANCE-BREACH|PS215|...` line via `AlbionPolicyPredicates.logComplianceBreach`; equal price passes; no ENBP (data gap) cannot breach. `AlbionPS215MonitorRules`, `AlbionParagonFeedManager` and both deprecated `_v1` heritage bindings delegate to it.
5. **Invite generation** — Paragon spool T-28; email fallback T-25. Production record is PRINTV PR16 (250 bytes, unchanged). The ICOBS 6A/6B disclosure record PR17 (300 bytes: PR16 content plus prior premium, renewal premium, equivalent NB price, NCD years, shopping-around prompt from policy year 4, opt-out flag) is built by `PrintvRecordBuilder.buildRecordPR17` against the draft copybook `integration/paragon/AGIPRINRE-v2.draft.cpy`; it goes live only after the 90-day vendor notice and in the Sunday 02:00–04:00 mainframe window.
6. **Auto-renew window** — DD customers auto-renew T-0 unless opted out (`RenewalOptOut_Ext`, screened at step 2)
7. **Lapse chase** — Outbound dialler file T+3

## Systems touched (in order)

- `PolicyCenter` — renewal jobs
- `Rating engine x2` — dual-running since 2021 (introduced as an interim measure)
- `BillingCenter` — instalment re-plan
- `Paragon` — invites
- `Experian` — re-score

## Known deviations

Heritage book renewals run through a SEPARATE batch (HeritageRenewalInviteBatch) that reimplements ~70% of this journey with 2015-era rules. Its PS21/5 gate was retrofitted differently. Pricing insists both are compliant. Evidence pack differs.

- **Resolved (13-Oct-2026), PS21/5 gate:** the batch's bindings `AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1` and `AlbionParagonFeedManager.evaluateAlbionParagonFeedManager_v1` returned `bean != null` (any record passed). Both now return `AlbionPS215Gate.passes(bean)`, so heritage and core renewals enforce the same gate and produce the same `COMPLIANCE-BREACH|PS215` evidence. The batch source is outside this repository and is unchanged; the deprecated signatures are kept.
- **Resolved (13-Oct-2026), duplicated gate logic:** the second copy of the price-walk breach in `AlbionParagonFeedManager` is removed.
- **Open:** about 135 classes across the four centres still carry a copy of the PS21/5 price-walk template body; most have no ENBP data and cannot breach. Consolidation is a follow-up for the gate owner.
- **Open:** the ENBP (`EquivalentNBPremium_Ext`) is not yet populated by the rating integration; until it is, the gate cannot breach in production. The PS21/5 price compared is `TotalIncurred_Ext`, as production has always read.
- **Open:** PR17 is draft; the live invite is still PR16 without the ICOBS 6A disclosure fields.

Offline evidence: `tools/replay/evidence/replay-evidence.json` (profiles `PS215_PC`, `ELIGIBILITY_PC`, `PRINTV_PR17_CM`), the JUnit harness in `tools/replay/junit/`, the mock journey in `tools/mock-ui/` and the recorded walkthrough in `docs/demo/phase1/`. All data is synthetic.

## Change history

| Date | Ticket | Change |
|------|--------|--------|
| 14-Jan-2014 | REG-5727 | Initial process onboarded from POLARIS ops manual ch.18 |
| 05-Sep-2016 | DEF-39890 | Mercury op-model re-segmentation |
| 08-Sep-2020 | GWCC-6110 | Whiplash reform / OIC portal fork added |
| 10-Oct-2024 | CM-5378 | Consumer Duty outcome-testing checkpoints added |
| 13-Oct-2026 | — | Eligibility and suppression screen; single PS21/5 gate incl. heritage bindings; draft PR17 disclosure record |

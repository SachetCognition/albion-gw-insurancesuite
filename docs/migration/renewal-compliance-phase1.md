# Renewal compliance: Phase 1 (PS21/5 gate, eligibility screen, PR17 disclosure)

Status: merged into config; offline evidence GREEN. Not yet compiled or GUnit-tested against the licensed Guidewire
distribution (Jenkins is authoritative for that).

## What changed

| Area | Change | Where |
|---|---|---|
| PS21/5 gate | One implementation, `AlbionPS215Gate.evaluate` / `passes`. `AlbionPS215MonitorRules` and `AlbionParagonFeedManager` delegate to it; the duplicate breach logic in the feed manager is removed. | `policycenter/config/gsrc/albion/policy/compliance/` |
| Heritage binding | `evaluateAlbionPS215Monitor_v1` and `evaluateAlbionParagonFeedManager_v1` keep their signatures for `HeritageRenewalInviteBatch` (outside this repository) but return `AlbionPS215Gate.passes(bean)` instead of `bean != null`. | same |
| ENBP | `AlbionPolicyPredicates.equivalentNewBusinessPrice` reads `PolicyPeriod.EquivalentNBPremium_Ext` (new, decimal 18,2); `logComplianceBreach` unchanged. | `policycenter/config/gsrc/albion/policy/common/`, `PolicyPeriod.etx` |
| Eligibility screen | `AlbionRenewalEligibilityRules.evaluate` returns block codes; `AlbionRenewalEligibilityActivities.raise` opens one activity per pattern. `AlbionRenewalFeedBatch.process` screens first, then runs the PS21/5 gate for unblocked renewals; aged-item escalation unchanged. | `policycenter/config/gsrc/albion/policy/renewal/` |
| Eligibility data | New `PolicyPeriod` bits `RenewalOptOut_Ext`, `MarketingSuppressed_Ext`, `SanctionsHold_Ext`, `BereavementHold_Ext`, `GDPRErasurePending_Ext`; existing `VulnerabilityNoted_Ext` reused. Four activity patterns added. No `FeedStatus_Ext` value added. | `PolicyPeriod.etx`, `policycenter/config/import/gen/albion-activity-patterns.xml` |
| PRINTV PR17 | `PrintvRecordBuilder.buildRecordPR17` (300 bytes) next to the unchanged PR16 `buildRecord` (250 bytes). Six `ABContact` fields. Draft copybook and field-map rows (`STATUS=DRAFT`). Only ContactManager has a PRINTV builder. | `contactmanager/.../integration/printv/`, `integration/paragon/`, `integration/mappings/printv_field_map.csv` |
| Evidence | Replay profiles `PS215_PC`, `ELIGIBILITY_PC`, `PRINTV_PR17_CM` with negative controls; JUnit harness; Jenkins stage `Offline replay + builder JUnit`. | `tools/replay/`, `Jenkinsfile` |
| Demo | Offline mock UI of the renewal journey and a recorded walkthrough. | `tools/mock-ui/`, `docs/demo/phase1/` |

## Verification (offline)

- `tools/replay/run_replay.sh`: six profiles GREEN, every negative control RED; evidence committed in
  `tools/replay/evidence/replay-evidence.json`.
- `tools/replay/junit/run_junit.sh`: all builder and rule tests pass on the open-source Gosu runtime.
- `python3 tools/scripts/check_brand_config_drift.py` and `python3 tools/scripts/check_gw_coherence.py .`: pass.

## Before production

1. `./gwb compile` and the GUnit suites in the licensed sandbox (not runnable offline).
2. Populate `EquivalentNBPremium_Ext` from the rating integration; until then the gate cannot breach.
3. Pricing confirms the heritage `_v1` behaviour change with the `HeritageRenewalInviteBatch` owner: breaching heritage
   renewals now fail the binding instead of passing.
4. PR17 go-live: 90-day vendor notice to the copybook owner, Endevor master copybook change, deployment in the Sunday
   02:00–04:00 mainframe window, then switch the invite caller from `buildRecord` to `buildRecordPR17`.
5. Data feeds for the eligibility bits (opt-out capture, marketing suppression, sanctions, bereavement, erasure) and
   PCF screens for the new activities (out of scope here: need the licensed sandbox).
6. Follow-up: the ~135 copies of the PS21/5 price-walk template body across centres (see the PS21/5 gate PR for the
   inventory).

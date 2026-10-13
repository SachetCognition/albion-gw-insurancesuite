# Renewal compliance mock UI (offline)

An offline, dependency-light demo of the renewal invite journey: price disclosure, ICOBS 6A shopping-around prompt,
opt-out capture, FCA FG21/1 vulnerability notice, PS21/5 price-walking gate, renewal eligibility codes and the PRINTV
PR16 vs PR17 print record. It also stubs `RenewalInviteServiceV1`–`V4` with their exact XML byte format.

**Offline demo – synthetic data, not production results.** Every policy, name and amount is invented.

## Run

```bash
cd tools/mock-ui
npm ci
npm start            # http://localhost:4317  (override with PORT=...)
npm test             # node:test unit and HTTP tests
```

Node.js 18+ and one runtime dependency (`express` 4.22.3, exact-pinned, `package-lock.json` committed).
No build step, no external fonts, scripts or network calls at runtime: the screens are vanilla HTML/CSS/JS served
from `public/`.

| Variable        | Default | Meaning                                                    |
|-----------------|---------|------------------------------------------------------------|
| `PORT`          | `4317`  | HTTP port                                                  |
| `CICS_DELAY_MS` | `2500`  | Simulated POLARIS round-trip for heritage references       |

State is held in memory. `POST /api/reset` (or the **Reset demo** button) restores the seed state.

## Screens

| Route                  | Screen                                                                                          |
|------------------------|-------------------------------------------------------------------------------------------------|
| `/`                    | Policy book, per-policy outcome chips, RenewalInviteService console                             |
| `/invite/:ref`         | 1 – renewal invite: prior vs renewal vs equivalent NB price, shopping-around prompt (year >= 4)  |
| `/optout/:ref`         | 2 – opt-out capture, writes `RenewalOptOut_Ext = Y` (suppression flag)                          |
| `/invite/SYN-REN-0003` | 3 – vulnerability / FCA FG21/1 banner (shown on the invite for vulnerable customers)            |
| `/ps215/:ref`          | 4 – PS21/5 result (`PRICE_WALK_BREACH`) and the compliance log                                   |
| `/admin/eligibility`   | 5 – eligibility code catalogue (code, source field, activity pattern) and PS21/5 input mapping  |
| `/records/:ref`        | PRINTV PR16 (250 bytes) vs PR17 (300 bytes) with offset ruler; disclosure block highlighted     |
| `/journey?step=N`      | Scripted step-through, N = 1..7; every step is a working deep link, including after a reset     |

`/invite/HR12345678A` shows the heritage path: the invite status is fetched through the stub service and visibly
"Routed via CICS".

Journey (`SYN-REN-0004`, breach variant `SYN-REN-0002`): 1 PENDING policy loaded · 2 eligibility pass ·
3 PS21/5 pass and breach variant · 4 PR16/PR17 records · 5 opt-out captured · 6 auto-renew blocked (`OPT_OUT`) ·
7 summary. Each step sets the journey policy to the state that step expects, so `?step=N` can be opened directly.

Stable `data-testid`s: `invite-summary`, `prior-premium`, `renewal-premium`, `nb-equivalent`,
`shopping-around-prompt`, `vulnerability-banner`, `optout-form`, `optout-submit`, `suppression-flag`, `ps215-result`,
`compliance-log`, `eligibility-codes-table`, `record-pr16`, `record-pr17`, `auto-renew-status`, `journey-step-<N>`
(the active step panel), `journey-next`. Extra: `cics-routing`, `ws-response`, `eligibility-result`, `ps215-mapping`.

## Seed policies

| Ref            | Brand  | Year | Prior  | Renewal | Equiv. NB | Outcome                                             |
|----------------|--------|------|--------|---------|-----------|-----------------------------------------------------|
| `SYN-REN-0001` | ALBDIR | 2    | 412.30 | 438.10  | 441.00    | eligible, PS21/5 pass                               |
| `SYN-REN-0002` | ALBDIR | 5    | 520.00 | 610.00  | 575.00    | `PRICE_WALK_BREACH` + compliance log line           |
| `SYN-REN-0003` | ALBBRK | 3    | 298.40 | 305.20  | 309.00    | `VULNERABILITY_REVIEW`, FG21/1 banner               |
| `SYN-REN-0004` | ALBDIR | 4    | 389.00 | 401.50  | 405.00    | FeedStatus PENDING, eligible, pass, shopping-around; opt-out journey policy |
| `SYN-REN-0005` | RETPLS | 1    | 289.99 | 300.00  | 300.00    | pass (equal-price boundary)                         |
| `HR12345678A`  | HERIT  | –    | –      | –       | –         | heritage reference, CICS passthrough                |

## HTTP API

| Method & path                                                    | Purpose                                                                   |
|------------------------------------------------------------------|---------------------------------------------------------------------------|
| `GET /ws/v{1..4}/RenewalInviteService?policyNumber=&brandCode=`  | Invite status XML (`text/xml`). Optional `centre=pc|cc|cm` (default `pc`) |
| `GET /api/policies` · `GET /api/policies/:ref`                   | Policies with derived eligibility codes, PS21/5 preview, flags            |
| `POST /api/policies/:ref/optout` `{reason?, channel?}`           | Sets `RenewalOptOut_Ext = Y`                                              |
| `POST /api/policies/:ref/decision`                               | Eligibility → PS21/5 → auto-renew `ALLOWED` / `BLOCKED`, raises activities |
| `POST /api/policies/:ref/ps215`                                  | Runs the gate, appends breach lines to the compliance log                 |
| `GET /api/policies/:ref/records`                                 | PR16 and PR17 strings plus layout metadata                                |
| `GET /api/compliance-log` · `GET /api/activities`                | Logged `COMPLIANCE-BREACH|PS215|<bean>|<actual>|<allowed>` lines; raised activities |
| `GET /api/eligibility/codes`                                     | Code catalogue and PS21/5 input mapping                                   |
| `POST /api/journey/:step`                                        | State and data for journey step 1..7                                      |
| `POST /api/reset`                                                | Restore the seed state                                                    |

Response headers on `/ws/...`: `X-Albion-Route` (`GW`, `CICS` or `ERROR`), `X-Albion-CICS-Transaction`,
`X-Albion-CICS-Delay-Ms`.

## How it maps to the Gosu classes

| JavaScript             | Mirrors                                                                                                   |
|------------------------|-----------------------------------------------------------------------------------------------------------|
| `lib/eligibility.js`   | `albion.policy.renewal.AlbionRenewalEligibilityRules` (codes, fixed order, SET truthiness) and the activity pattern mapping used by `AlbionRenewalEligibilityActivities` |
| `lib/ps215.js`         | `albion.policy.compliance.AlbionPS215Gate.evaluate/passes`, `AlbionPolicyPredicates.equivalentNewBusinessPrice` and `complianceBreachLine` |
| `lib/printv.js`        | `albion.integration.printv.PrintvRecordBuilder` (ContactManager): `buildRecord` (PR16) and `buildRecordPR17`, `pad`, `padNum`, `formatDate` |
| `lib/brand.js`         | ContactManager `albion.integration.common.BrandMappingService.brandMap`                                    |
| `lib/renewalInvite.js` | `albion.ws.v1..v4.RenewalInviteServiceV1..V4` (PC, CC and CM copies) and `PolarisCICSGateway.enquire`     |
| `lib/bean.js`          | the `KeyableBean` / `ReplayFixtureBean` stand-in used by `tools/replay/` (`getFieldValue` only)           |
| `lib/decimal.js`       | `java.math.BigDecimal` parsing and `compareTo` (scale-insensitive), `HALF_UP` to 2dp                      |

Production behaviour, including quirks, is reproduced rather than corrected:

- PS21/5 reads the renewal premium from `TotalIncurred_Ext` (null → 0); a missing `EquivalentNBPremium_Ext` means no
  comparison. Strictly greater breaches; equal passes. The admin screen shows this mapping.
- `pad()` silently truncates overlong text. `padNum()` writes implied 2dp, zero-padded, with a COBOL trailing
  overpunch (`J`..`R`) on negatives; a negative ending in 9 throws, as the 9-entry overpunch table does in production.
- PRINTV writes `PolicyNumber_Ext` through the date formatter (zero-filled when null) and maps brands through
  `BrandMappingService` (null or unknown brand → `999999`). PR16 is unchanged; PR17 is 300 bytes with the disclosure
  block at 076–124 and exact-length guards on both.
- RenewalInviteService: references shorter than 5 characters return `AGI-4001`; references are normalised
  (non-alphanumerics stripped, upper-cased); every version emits `<Premuim>` (sic). Heritage references matching
  `^[A-Z]{2}[0-9]{8}[A-Z]$` go to the CICS passthrough with the transaction code of that version and centre
  (PolicyCenter V1 `AG90`, V2 `AG29`, V3 `AG19`, V4 `AG39`).

## What is simulated

- POLARIS/CICS: no mainframe call is made; the passthrough returns the gateway's response shape after `CICS_DELAY_MS`.
- Persistence, activities and the print feed are in memory only. Opt-out writes the flag on the in-memory policy.
- One policy map carries both the PolicyCenter fields (eligibility, PS21/5) and the ContactManager party fields
  (PRINTV), so a single reference drives every screen.
- No Guidewire runtime, PCF or workflow engine is involved; the logic modules mirror the Gosu rules field for field.

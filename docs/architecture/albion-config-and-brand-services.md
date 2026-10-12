# Albion config and brand services (consumer guide)

Session A foundation for the centre clean-up waves (B–E). Two services replace the hardcoded business constants and the
duplicated private `brandMap()` / `brandOf()` helpers found across ClaimCenter, PolicyCenter, BillingCenter and
ContactManager. **Behaviour is pinned to production, quirks included**: swapping a call site must not change any output.

## Where the code lives (copy strategy)

Each centre is a separate Guidewire application with its own `gsrc`. There is no shared Gosu module, so there is one
canonical implementation (ClaimCenter) and a byte-identical copy in every centre:

| File | cc | pc | bc | cm |
|---|---|---|---|---|
| `albion/config/AlbionConfigService.gs` | `claimcenter/config/gsrc` | `policycenter/config/gsrc` | `billingcenter/config/gsrc` | `contactmanager/modules/configuration/gsrc` |
| `albion/integration/common/BrandMappingService.gs` | same | same | same | same |
| `albion/config/AlbionCentre.gs` (**only per-centre file**) | `CODE="cc"`, `PROPERTY_PREFIX="cl"` | `"pc"`, `"po"` | `"bc"`, `"bi"` | `"cm"`, `"co"` |
| GUnit: `gtest/albion/config/AlbionConfigServiceTest.gs`, `gtest/albion/integration/common/BrandMappingServiceTest.gs` | same | same | same | same |

To change a service: edit the ClaimCenter copy, copy it to the other three centres, run the drift check.

## AlbionConfigService (`albion.config`)

Reads the non-sensitive business constants from `environments/<env>/<centre>.properties`. Keys are prefixed by the
centre's existing convention (`cl.`, `po.`, `bi.`, `co.`).

Source of values: the file named by `-Dalbion.config.file=<path>` (optional), overlaid by JVM system properties.
Trailing `   # comment` text on a value is stripped (the estate's property files use inline comments).
Invalid values (unparseable / out of range) throw `IllegalStateException` naming the full key; call
`AlbionConfigService.Instance.validate()` at start-up to fail fast on all of them at once.

```gosu
uses albion.config.AlbionConfigService
var cfg = AlbionConfigService.Instance          // this centre's prefix (AlbionCentre.PROPERTY_PREFIX)
if (score >= cfg.FraudReferScore) { ... }
```

### Keys, defaults, getters

Defaults equal the values hardcoded in the centres today. All ten envs (`dev dev2 sit sit2 uat preprod prod perf dr
train`) carry every key below with the default value, e.g. `bi.large.loss.threshold=25000`.

| Key (after prefix) | Default | Getter | Validation |
|---|---|---|---|
| `fraud.refer.score` | `55` | `FraudReferScore : int` | 0..100 |
| `ipt.standard.rate` | `0.12` | `IptStandardRate : BigDecimal` (falls back to the existing `ipt.rate` key) | 0 ≤ x < 1 |
| `large.loss.threshold` | `25000` | `LargeLossThreshold`, `largeLossThreshold(scope, legacyValue)` | ≥ 0 |
| `refer.threshold.albdir` | `10000` | `ReferThresholdAlbDir`, `referThresholdAlbDir(scope, legacyValue)` | ≥ 0 |
| `refer.threshold.albbrk` | `4000` | `ReferThresholdAlbBrk`, `referThresholdAlbBrk(scope, legacyValue)` | ≥ 0 |
| `sla.credithire.mitigation.hours` | `3` | `CreditHireMitigationSlaHours : int` (motor FNOL step 6) | 1..168 |
| `sla.cat.event.declare.hours` | `4` | `CatEventDeclareSlaHours : int` (cat event step 1) | 1..168 |
| `sla.complaint.ack.promise.days` | `3` | `ComplaintAckPromiseDays : int` | 1..365, ≤ regulatory |
| `sla.complaint.ack.regulatory.days` | `5` | `ComplaintAckRegulatoryDays : int` | 1..365 |
| `sla.complaint.holding.letter.days` | `28` | `ComplaintHoldingLetterDays : int` | 1..365, < final |
| `sla.complaint.final.response.days` | `56` | `ComplaintFinalResponseDays : int` | 1..365 |

Key names are also public constants (`AlbionConfigService.KEY_*`, list in `BUSINESS_KEYS`); defaults are `DEFAULT_*`.
Generic typed getters for other keys: `getString`, `getBoolean`, `getInt(key, default, min, max)`,
`getDecimal(key, default, min, max, maxExclusive)`, `rawValue`, `isSet`, `fullKey`.

### Divergent thresholds: use the legacy-pinned functions

`LARGE_LOSS_THRESHOLD` is 25000 / 50000 / 100000 / 250000 depending on the file, `REFER_ALBDIR` 5000 / 7500 / 10000 and
`REFER_ALBBRK` 2500 / 4000 / 12500. No single key can replace them without a behaviour change, so pass the file's
current literal and the caller's simple class name:

```gosu
// before: static final var LARGE_LOSS_THRESHOLD = 100000bd
if (amount > AlbionConfigService.Instance.largeLossThreshold("CreditInboundHandler", 100000bd)) { ... }
```

Resolution: `<prefix>.large.loss.threshold.<scope>` → `legacyValue` → `<prefix>.large.loss.threshold` → default.
With no scoped key set (the case today) the caller keeps exactly its current value; the business can later move a
call site by adding e.g. `bi.large.loss.threshold.CreditInboundHandler=150000` to the env file. Uniform constants
(fraud score, IPT) use the plain getters.

Tests: `AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, map))`, then
`setInstance(null)` in `finally`.

## BrandMappingService (`albion.integration.common`)

All static. Lookups between POLARIS code ↔ `BrandCode_Ext` typecode ↔ description.

| Function | Behaviour (pinned) |
|---|---|
| `brandOf(bean : Object) : String` | Drop-in for the private `brandOf()` copies: `BrandCode_Ext` value; `"ALBDIR"` when the bean is null, not a `KeyableBean`, or has no brand (heritage rows). Unknown values pass through unchanged. |
| `brandMap(src : KeyableBean) : String` | Drop-in for the record builders' `brandMap()`: `toPolarisCode(src.BrandCode_Ext)`. A null brand gives `999999`, **not** the ALBDIR default (as today). |
| `toPolarisCode(typecode) : String` | `ALBDIR→01AD00`, `ALBBRK→02BK00`, `RETPLS→07RP01`, `HERIT→00XX99`; everything else (`ALBHNW`, `NOVABK`, `TMP65`, `TMP69`, null, wrong case, unknown) → `999999` (`UNKNOWN_POLARIS_CODE`, the ops grep target). |
| `fromPolarisCode(code) : String` | Inbound: every CSV row incl. retired `07RP00→RETPLS` and disputed `03DL00→ALBBRK`; `999999`, unknown or null → null. |
| `polarisCodeRole(code)` | `OUTBOUND`, `INBOUND_ONLY` (03DL00), `RETIRED` (07RP00), `SENTINEL` (999999), or null. `isRetiredPolarisCode(code)`. |
| `polarisDescription(code)` | CSV `DESCRIPTION` (e.g. `RetailPlus (Novabank)`), or null. |
| `polarisCodesFor(typecode)` | All POLARIS codes for a typecode in CSV order (`ALBBRK → [02BK00, 03DL00]`). |
| `Typecodes`, `ActiveTypecodes`, `isKnownTypecode`, `isRetiredTypecode`, `typecodeName` | Typelist metadata (`HERIT → "Heritage Book"`). |

Never emitted outbound: `07RP00` (retired, do not reuse) and `03DL00` (mapping disputed with MI since 2018). These are
deliberate production behaviour and are pinned by characterization tests; do not "fix" them in a consumer.

The mapping tables are embedded in the service (`// BEGIN TYPECODES` / `// BEGIN POLARIS_XREF` blocks) rather than
read from `brand_xref.csv` at runtime, because the CSV is not on the centres' classpath. The drift check keeps them equal.

## BrandCode_Ext reconciliation

Before: CC and PC had 6 codes, BC additionally `TMP65` (INC-15529), CM additionally `TMP69` (INC-45565). After: all four
`BrandCode_Ext.ttx` files are identical with 8 codes. `TMP65` and `TMP69` were added to every centre with
`retired="true"` instead of being deleted: live rows (and the 3 PROD-only codes noted in AGI-35347) may still reference
them, and deleting a typecode Guidewire has persisted breaks upgrade/load of those rows. Retired typecodes stay
loadable but are hidden from new selections. Their original `desc` text is kept for traceability. `NOVABK` stays
retired; `ALBHNW` stays active (212 live policies). Bare `&` in two descriptions was escaped to `&amp;` (the files were
not well-formed XML); the displayed text is unchanged. `brand_xref.csv` was not changed.

## Drift check

```
python3 tools/scripts/check_brand_config_drift.py [--root <repo>]
```

Python 3 stdlib only, no Guidewire distribution needed; exit 1 on drift. Fails when: the four typelists differ; a CSV
`GW_TYPECODE` is missing from or retired in the typelist; the service tables differ from the typelist or CSV (or roles
are inconsistent with the CSV notes); any per-centre service/test copy is not byte-identical; `AlbionCentre` prefix does
not match the env files; or any of the 40 `environments/<env>/<centre>.properties` files lacks a business key.
Not yet wired into the `Jenkinsfile` (planned for the CI wave).

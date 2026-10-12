# Albion config and brand services (consumer guide)

Shared configuration foundation for the centre clean-up programme. Two services replace the hardcoded business constants and the
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
| `albion/security/AlbionAesEncryptionPlugin.gs` | same | same | same | same |
| `albion/integration/shadow/*.gs` (strangler shadow scaffold, `docs/migration/strangler-phase1.md`) | same | same | same | same |
| GUnit: `gtest/albion/config/AlbionConfigServiceTest.gs`, `gtest/albion/integration/common/BrandMappingServiceTest.gs`, `gtest/albion/security/AlbionAesEncryptionPluginTest.gs`, `gtest/albion/integration/shadow/*.gs` | same | same | same | same |

To change a service: edit the ClaimCenter copy, copy it to the other three centres, run the drift check.

## AlbionConfigService (`albion.config`)

Reads the non-sensitive business constants from the centre's environment property file. Keys are prefixed by the
centre's existing convention (`cl.`, `po.`, `bi.`, `co.`). In git the keys live in
`environments/<env>/<centre>.properties.template` (secrets as `${TOKENS}`); older trees have the plain
`<centre>.properties`. The business keys hold literal values in either file.

Source of values at runtime: the **rendered** `<centre>.properties` (produced from the template at deploy time), named by
`-Dalbion.config.file=<path>` (optional), overlaid by JVM system properties. The service never reads the
`.template` file itself.
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
train`) carry every key below with the default value in their `<centre>.properties.template` (or `<centre>.properties`),
e.g. `bi.large.loss.threshold=25000`.

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

Strangler feature flags (not business constants; listed in `FEATURE_KEYS`, committed OFF/empty in every template):

| Key (after prefix) | Default | Getter | Validation |
|---|---|---|---|
| `feature.shadow.enabled` | `false` | `ShadowRunEnabled : boolean` | `true`/`false` |
| `feature.shadow.feeds` | empty | `ShadowFeeds : List<String>` | comma list, upper-cased |
| `feature.shadow.brands` | empty (all brands) | `ShadowBrands : List<String>` | comma list, upper-cased |

`isShadowEnabled(feed, brandTypecode)` combines them; see `docs/migration/strangler-phase1.md`.

Key names are also public constants (`AlbionConfigService.KEY_*`, list in `BUSINESS_KEYS`); defaults are `DEFAULT_*`.
Generic typed getters for other keys: `getString`, `getBoolean`, `getInt(key, default, min, max)`,
`getDecimal(key, default, min, max, maxExclusive)`, `getList`, `rawValue`, `isSet`, `fullKey`.

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

## Encryption at rest (`albion.security`)

Every centre registers `albion.security.AlbionAesEncryptionPlugin` as its `IEncryption` plugin
(`<config>/plugin/registry/IEncryption.gwp`). Guidewire calls it for every column marked
`<columnParam name="encryption" value="true"/>`:

| Centre | Encrypted columns |
|---|---|
| cc | `Claim.NINumber_Ext` |
| pc | `PolicyContactRole.NINumber_Ext` |
| cm | `ABContact.NINumber_Ext`, `BankAccount.AccountNumber`, `BankAccount.RoutingNumber`, `EFTData.BankAccountNumber`, `EFTData.BankRoutingNumber` |
| bc | none yet (plugin registered so new encrypted columns work immediately) |

**Format.** AES-256-GCM (`javax.crypto`), a fresh random 96-bit IV per value, 128-bit tag. Stored value is
`<keyId>:<Base64(IV || ciphertext || tag)>`; the key id is also bound into the tag, so a value cannot be relabelled to
another key. The same input encrypts differently every time. Tampered values, unknown key ids and missing keys throw
`IllegalStateException`: the plugin fails closed and never stores or returns plaintext.

**Transparent on read.** Entities hold plaintext in memory; the platform encrypts on write and decrypts on read. Gosu,
PCFs and the fixed-width record builders (`getFieldValue("NINumber_Ext")` in the CIFAS, CRIF, CUE, Verisk, IPT, ELTO,
Payhub, DWH and POLARIS builders) see the same 9-character NI number as before, so record layouts, padding and lengths
(POLARIS 512-byte records included) are unchanged.

**Key provisioning (CyberArk).** Keys never appear in git. Each centre template carries three tokens, rendered from
the environment's CyberArk safe (see `environments/README.txt`):

```
cl.encryption.key=${CL_ENCRYPTION_KEY}                  # Base64 of 32 random bytes, e.g. openssl rand -base64 32
cl.encryption.key.id=${CL_ENCRYPTION_KEY_ID}            # [A-Za-z0-9._-], max 16 chars, e.g. k2026a
cl.encryption.keys.retired=${CL_ENCRYPTION_KEYS_RETIRED} # <keyId>:<Base64 key>,...  empty until first rotation
```

(`po.` / `bi.` / `co.` with `PO_` / `BI_` / `CO_` tokens in the other centres.) Use a different key per environment;
never copy production keys into lower environments. The keys are read through `AlbionConfigService`
(`KEY_ENCRYPTION_*`), have no defaults, and the drift check requires all three in every env/centre template.

**Key rotation.**
1. Generate a new key and a new key id in CyberArk.
2. Append the current `<id>:<key>` pair to `<P>_ENCRYPTION_KEYS_RETIRED`; set `<P>_ENCRYPTION_KEY` / `_KEY_ID` to the new pair.
3. Deploy and restart. New writes use the new id; existing rows keep decrypting under their retired id and move to
   the new id when next saved.
4. Remove a retired key only when no row still starts with `<oldId>:` (count it in SQL with `LIKE '<oldId>:%'` on each
   encrypted column). Dropping a key that is still in use makes those rows unreadable.

**Database upgrade on change.** Turning encryption on for an existing column, or changing the encryption plugin,
makes the Guidewire database upgrader run an encryption pass over every existing row on the next server start. This
release does both: CC/PC `NINumber_Ext` and the CM bank columns are encrypted for the first time, and CM's already
flagged columns move from the base-product sample plugin to this one. Plan the pass in the change window: size it on a
production-sized copy, take a backup first, follow the Guidewire procedure for changing the encryption plugin on CM,
make sure the keys are in CyberArk before the first start, and hold the Control-M schedule until the upgrade completes.

**Query limits.** An encrypted column cannot be used in a database `compare`, sort, filter or index (random IV, so
equal inputs never match). No `Query.make`/`compare`/index use exists on the NI columns or on the newly encrypted
bank columns. Known exceptions and deliberate omissions:
- CM `EFTData.etx` unique index `eftaccountnumber` includes `BankAccountNumber` (encrypted before this change). With a
  random IV the index no longer stops a contact holding the same account twice.
- CM `Person.LicenseNumber` and `TaxID` stay unencrypted: duplicate matching (`PersonQueryBuilderBase.hasEqualLicenseNumber`,
  `PersonDuplicateFinder`) and `search/search-config.xml` match them with database equality. Encrypting them needs a
  keyed-hash lookup column first.

## Drift check

```
python3 tools/scripts/check_brand_config_drift.py [--root <repo>]
```

Python 3 stdlib only, no Guidewire distribution needed; exit 1 on drift. Fails when: the four typelists differ; a CSV
`GW_TYPECODE` is missing from or retired in the typelist; the service tables differ from the typelist or CSV (or roles
are inconsistent with the CSV notes); any per-centre service/test copy is not byte-identical; `AlbionCentre` prefix does
not match the env files; any of the 40 env/centre property files lacks a business, feature-flag or encryption key; or
a template sets `feature.shadow.enabled` to anything but `false`. Per env/centre it checks
`environments/<env>/<centre>.properties.template` when present, else `<centre>.properties`, and fails if neither exists.
Not yet wired into the `Jenkinsfile` (planned for the CI wave).

## Coherence audit

```
python3 tools/scripts/check_gw_coherence.py <repo> [--detail N] [--centre cc|pc|bc|cm|batch]
```

Python 3 stdlib only; exit 1 when any finding exists. Static checks that each centre would make sense to Guidewire
Studio (E1–E10: undefined entity fields, typecodes, `albion.*` classes/methods, PCF refs, registry classes, scheduler
entries, contradictory rules; J1/R1 placeholder classes and non-GW rule files), meta/tell markers (T1), and batch
coherence (B1 every Control-M `INCOND` is produced by an `OUTCOND` or is external `AGI-DB-BACKUP-OK` /
`POLARIS-EOD-COMPLETE`; B2/B3 every job's `MEMNAME` exists in `batch/jcl/` and every member there is scheduled —
on-demand members live in `batch/jcl/adhoc/`; B4 `JOBNAME`, `MEMNAME` and the JCL `//<NAME> JOB` card agree). E11 flags an `ActivityPattern` code
used by `raiseActivity(...)`, `findPattern(...)` or an `ActivityPattern#Code` query that is not defined in the
centre's `config/import/` admin-data XML; defined patterns that nothing references are reported as W11
warnings only, because patterns are also picked by users from the New Activity menu and by base-product code.
E12 flags `*_Ext` field names passed as strings to `getFieldValue`/`setFieldValue`/`isFieldChanged`/
`getOriginalValue` (or used as other string lookups) that no entity extension, entity or typelist in that
centre defines. Warnings never change the exit status.
`--centre` limits the run to one centre tree or `batch`. Not yet wired into the `Jenkinsfile` (planned for the CI wave).

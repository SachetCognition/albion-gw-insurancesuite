# Strangler migration: Phase 1 foundation

Phase 1 puts the seams in place for replacing the POLARIS record builders and the IPT calculation feed by feed,
without changing any production output. Everything below ships **dormant**: with the committed environment values,
every feed writes exactly the record it writes today.

## Feature flags

Read through `albion.config.AlbionConfigService` (shared copy in every centre). Keys carry the centre prefix (`cl`,
`po`, `bi`, `co`) and are present in every `environments/<env>/<centre>.properties.template`.

| Key (after prefix) | Committed value | Getter | Meaning |
|---|---|---|---|
| `feature.shadow.enabled` | `false` | `ShadowRunEnabled : boolean` | Master switch. `false` = legacy record only, for every feed. |
| `feature.shadow.feeds` | empty | `ShadowFeeds : List<String>` | Feeds to shadow-run, comma separated (`IPT`, `POLARIS_MF`). Empty = none. |
| `feature.shadow.brands` | empty | `ShadowBrands : List<String>` | Optional `BrandCode_Ext` typecodes to limit the run to. Empty = all brands. |

`isShadowEnabled(feed, brandTypecode)` is true only when the switch is on, the feed is listed and the brand is
allowed. Feed and brand values are trimmed and compared in upper case. An invalid switch value (anything but
`true`/`false`) is reported by `validationErrors()` at start-up; at run time the facade treats it as off.

`tools/scripts/check_brand_config_drift.py` fails the build if any committed template is missing a key or sets
`feature.shadow.enabled` to anything but `false`. Turning shadow running on in an environment therefore means changing
that check together with the value, in a reviewed change.

## Facade and shadow scaffold

Package `albion.integration.shadow`, a byte-identical copy in each centre's `gsrc` (drift-checked like the config
service):

| Class | Role |
|---|---|
| `ShadowRecordFacade` | Single entry point the transports call: `buildRecord(feed, src, legacy, candidate)`. Flags off: returns `legacy(src)` and nothing else runs. Flags on: runs `ShadowRunner` and returns the legacy record. |
| `ShadowRunner` | Runs legacy first (its exceptions propagate unchanged), then the candidate (failures contained as `CANDIDATE_ERROR`). Records every result that is not a `MATCH`. |
| `ReconciliationResult` | Outcome (`MATCH`, `WITHIN_TOLERANCE`, `BREACH`, `CANDIDATE_ERROR`), first differing offset, lengths. `toStructuredRecord()` writes one key=value line with no record content (records carry personal data). |
| `ShadowTolerance` | `exact()` for records (byte for byte); `iptMonthEndCountTolerance()` = less than 0.1%, strictly, as in `docs/architecture/CONTROLS-AND-TOLERANCES.md`. |
| `ShadowDiffRecorder` | Sink interface. `LoggingShadowDiffRecorder` (default, logger category `albion.integration.shadow`, ERROR for breaches) and `InMemoryShadowDiffRecorder` (tests, offline replay). Replace with `ShadowRecordFacade.setRecorder(...)`. |
| `FixedWidthRecordWriter` | Field-layout encoder for candidate builders; reproduces the legacy `pad`/`padNum`/`formatDate`/filler/length-guard behaviour byte for byte. |

The facade is wired into the transports already registered in each centre's `plugin/registry/*.gwp`, so messaging
needs no configuration change:

| Centre | Transport (registry) | Feed | Legacy builder (authoritative) | Candidate |
|---|---|---|---|---|
| ClaimCenter | `albion.integration.ipt.IptTransport` (`IptTransport.gwp`) | `IPT` | `IptRecordBuilder` | `IptRecordBuilderCandidate` |
| PolicyCenter | `albion.integration.polaris_mf.PolarisMfTransport` (`PolarisMfTransport.gwp`) | `POLARIS_MF` | `PolarisMfRecordBuilderV2` | `PolarisMfRecordBuilderCandidate` |
| ContactManager | `albion.integration.polaris_mf.PolarisMfTransport` (`PolarisMfTransport.gwp`) | `POLARIS_MF` | `PolarisMfRecordBuilder` | `PolarisMfRecordBuilderCandidate` |

BillingCenter carries the scaffold and flags but has no 512-byte POLARIS or IPT record builder to wire: its IPT
transport spools the payload and its POLARIS_MF transport uses the 750-byte `PolarisPartyRecordBuilder`.

## How the characterization tests protect cutover

Golden-master GUnit tests pin today's output exactly, defects included. A failure means production bytes changed; an
expectation is never edited to make a change pass.

| Test | Pins |
|---|---|
| `claimcenter/config/gtest/albion/integration/ipt/IptRecordBuilderGoldenMasterTest` | IPT 512-byte record (IP89) |
| `policycenter/config/gtest/albion/integration/polaris_mf/PolarisMfRecordBuilderGoldenMasterTest` | POLARIS_MF 512-byte record (PO92) |
| `contactmanager/modules/configuration/gtest/albion/integration/polaris_mf/PolarisMfRecordBuilderGoldenMasterTest` | POLARIS_MF 512-byte record (PO99) |
| `policycenter/config/gtest/albion/policy/rating/IptCalculationGoldenMasterTest` | IPT calculation in the four PolicyCenter batches |
| `billingcenter/config/gtest/albion/billing/common/IptCalculationGoldenMasterTest` | IPT calculation in the three BillingCenter batches |

The record tests cover every captured sample in `integration/samples/ipt/` and `integration/samples/polaris_mf/`,
the brand codes (`01AD00`, `02BK00`, `07RP01`, `00XX99`, and `999999` for unknown, lower-case or null brands), silent
truncation, `|`/CR/LF replaced by a space, implied-decimal HALF_UP amounts, COBOL trailing overpunch `J`..`R`, the
`StringIndexOutOfBoundsException` on a negative amount ending in 9, over-wide amounts shifting later fields, and
`00000000` for a null date. Each expectation is asserted against the legacy builder **and** the candidate, so the
candidate is proven byte-identical before anyone enables a shadow run.

The IPT tests pin premium x `IptStandardRate` rounded HALF_UP to pence (scale 2) and require every batch copy to give
the same table, which is the precondition for consolidating the calculation.

All of them run in the blocking `GUnit CC/PC/BC/CM` stages of the `Jenkinsfile`.

## Next phases

Shadow reconciliation, offline replay evidence and the gated cutover switch (`feature.cutover.feeds`) are described in
`docs/migration/strangler-phase2-3.md`. They keep this foundation: the committed templates stay OFF and the drift check
keeps `DORMANT_FLAGS`; enabling in an environment is a deploy-time override.

Not changed in Phase 1: `Jenkinsfile.legacy` (the production release job). It still runs no tests; gating releases on
the golden-master tests is a decision for the owner of `AGI-GW-RELEASE-PROD`.

# Offline replay

Replays `fixtures/*.csv` through named replay profiles and writes `evidence/replay-evidence.json` (format:
`docs/migration/strangler-phase2-3.md`, Offline replay evidence). Every profile also runs a negative control (the
compared candidate value is deliberately altered) that must come out RED.

```
GOSU_LIB=<dir> tools/replay/run_replay.sh
REPLAY_PROFILES="IPT_CC POLARIS_MF_PC POLARIS_MF_CM" GOSU_LIB=<dir> tools/replay/run_replay.sh
```

`REPLAY_PROFILES` is a space-separated subset of the profiles below; the default is all of them.

| Profile | Centre | Program | Fixture | Legacy (expected) | Candidate (compared) |
| --- | --- | --- | --- | --- | --- |
| `IPT_CC` | cc | `ReplayHarness.gsp` | `ipt_cc.csv` | `IptRecordBuilder` | `IptRecordBuilderCandidate` |
| `POLARIS_MF_PC` | pc | `ReplayHarness.gsp` | `polaris_mf_pc.csv` | `PolarisMfRecordBuilderV2` | `PolarisMfRecordBuilderCandidate` |
| `POLARIS_MF_CM` | cm | `ReplayHarness.gsp` | `polaris_mf_cm.csv` | `PolarisMfRecordBuilder` | `PolarisMfRecordBuilderCandidate` |
| `PS215_PC` | pc | `RuleReplayHarness.gsp` | `renewal_ps215.csv` | fixture `expect` | `AlbionPS215Gate.evaluate` |
| `ELIGIBILITY_PC` | pc | `RuleReplayHarness.gsp` | `renewal_eligibility.csv` | fixture `expect` | `AlbionRenewalEligibilityRules.evaluate` |
| `PRINTV_PR17_CM` | cm | `PrintvReplayHarness.gsp` | `printv_pr17.csv` | PR16 `buildRecord` + fixture | `PrintvRecordBuilder.buildRecordPR17` |

- Builder profiles compare the legacy and candidate records byte for byte.
- Rule profiles compare the block codes, pipe-joined in contract order (`NONE` when empty), with `expect`. `PS215_PC`
  also fails a row when `AlbionPS215MonitorRules.evaluateAlbionPS215Monitor` or
  `AlbionParagonFeedManager.evaluateAlbionParagonFeedManager` differ from the gate, when either `_v1` differs from
  `AlbionPS215Gate.passes`, or when the `COMPLIANCE-BREACH|PS215|` line is missing for a breach or printed for a pass.
  The line is printed once per evaluation, so its count is not checked. `ELIGIBILITY_PC` also checks `isEligible`.
- `PRINTV_PR17_CM` pins every PR16 record by SHA-256 (PR16 must not change) and compares the PR17 record with the one
  expected from PR16 and the fixture: `PR17` + PR16 bytes 005-075 + the disclosure columns + spaces to 300 bytes.

`GOSU_LIB` holds the open-source Gosu runtime from Maven Central: `org.gosu-lang.gosu:gosu-core:1.17.5`,
`org.gosu-lang.gosu:gosu-core-api:1.17.5`, `org.gosu-lang.gosu.managed:gw-asm-all:9.2` and
`systems.manifold:manifold`, `manifold-util`, `manifold-rt` `2022.1.33`; for `junit/run_junit.sh` also
`junit:junit:4.13.2` and `org.hamcrest:hamcrest-core:1.3` (or set `JUNIT_LIB`). Java 11 and Python 3 are needed. The
Jenkins stage `Offline replay + builder JUnit` reads `GOSU_LIB` from the agent environment (default `$HOME/gosu-lib`).
Nothing is downloaded at run time.

No Guidewire distribution is used. `standins/` (compiled into a scratch directory for the run only, ahead of the Gosu
jars, never on a centre classpath) holds a one-method `KeyableBean` interface, a map-backed fixture bean, and the
minimal types PolicyCenter rule classes need to load: `PolicyPeriod` and `Job` interfaces, `gw.api.database.Query` and
`Relop`, and `gw.lang.Deprecated` with defaulted members (bare `@Deprecated` as the Guidewire runtime allows).
`gsrc/albion/replay/` holds the fixture reader shared by the replay programs.

Fixtures: one row per case, `case_id,expect,<Column>:<type>,...` with `~` for null and `#` comment lines; each fixture's
header comments explain its columns. Column types:

| Type | Value |
| --- | --- |
| `text` | String |
| `decimal` | `java.math.BigDecimal` |
| `date` | `java.util.Date`, `yyyy-MM-dd` |
| `integer` | `java.lang.Integer` |
| `bit` | `true`/`false` as Boolean; any other value kept as the String (POLARIS-hydrated flags such as `Y`, `1`) |
| `expect` | an expected value for the program, not a bean field |

A row whose `case_id` starts with `null_bean` is replayed with a null bean; its field columns must all be `~`.
Every value is invented (`SYN-` references, `TESTPERSON` surnames, `SYN` vehicle marks). For builder profiles `expect`
is `MATCH` or `LEGACY_ERROR` (the legacy builder must fail; the candidate must fail the same way); `PRINTV_PR17_CM` also
has `CANDIDATE_ERROR` (PR16 succeeds unchanged, PR17 fails with the `pr17_error` class).

The script exits non-zero unless the evidence is GREEN. Commit the regenerated evidence with any change to a builder,
candidate, rule class or fixture. A profile whose classes are not on the tree (for example `PS215_PC` before
`AlbionPS215Gate` exists) fails with `replay class ... is not on the replay classpath`; select the profiles that apply
with `REPLAY_PROFILES`.

Plain JUnit tests of the record builders and rule classes: `junit/README.md`.

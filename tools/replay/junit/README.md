# Builder and rule JUnit tests

Plain Java JUnit 4.13.2 tests (not GUnit) that boot the open-source Gosu 1.17.5 runtime programmatically
(`src/GosuRuntime.java`) on one centre's `gsrc` and call the record builders and rule classes with map-backed
`ReplayFixtureBean`s (`tools/replay/standins/`). All values are invented.

```
GOSU_LIB=<dir> tools/replay/junit/run_junit.sh
JUNIT_TESTS="PrintvPR16RecordBuilderGoldenTest" GOSU_LIB=<dir> tools/replay/junit/run_junit.sh
```

- `GOSU_LIB`: the Gosu runtime jars (`tools/replay/README.md`). Required.
- `JUNIT_LIB`: directory holding `junit-4.13.2.jar` and `hamcrest-core-1.3.jar`; default `GOSU_LIB`.
- `JUNIT_TESTS`: space-separated subset of the test classes; default all.

Nothing is downloaded. The script compiles `standins/` and `src/` into a scratch directory and runs one JVM per centre,
because each centre's `gsrc` has its own copies of the shared `albion.*` packages. It exits non-zero when any test fails.

| Centre | Test class | Class under test |
| --- | --- | --- |
| cc | `IptRecordBuilderGoldenTest` | `IptRecordBuilder`, `IptRecordBuilderCandidate` |
| pc | `PolarisMfPcRecordBuilderGoldenTest` | `PolarisMfRecordBuilderV2`, `PolarisMfRecordBuilderCandidate` |
| pc | `AlbionPS215GateRuleTest` | `AlbionPS215Gate`, delegation from `AlbionPS215MonitorRules` and `AlbionParagonFeedManager` |
| pc | `AlbionRenewalEligibilityRulesRuleTest` | `AlbionRenewalEligibilityRules` |
| cm | `PolarisMfCmRecordBuilderGoldenTest` | `PolarisMfRecordBuilder`, `PolarisMfRecordBuilderCandidate` |
| cm | `PrintvPR16RecordBuilderGoldenTest` | `PrintvRecordBuilder.buildRecord` (PR16) |
| cm | `PrintvPR17RecordBuilderTest` | `PrintvRecordBuilder.buildRecordPR17` (PR17) |

Builder tests assert golden records, field offsets (1-based, as in the copybooks), brand defaults (`999999`) and the
length guards, including production behaviour that must not change: silent text truncation, a numeric field wider than
its width shifting later bytes into the filler (PR16 and the PR16-shared PR17 bytes; a PR17 disclosure amount wider than
15 bytes fails with `IllegalStateException`), content wider than the record failing in the filler pad
(`StringIndexOutOfBoundsException`) before the length guard, a negative amount ending in 9 having no overpunch
character, and a null bean failing with `NullPointerException`. Rule tests cover each code, order, truthiness, the
equal-price boundary, null amounts and ENBP, and null beans.

A test class whose class under test is not on the tree fails with `Gosu class ... is not on the replay classpath`.

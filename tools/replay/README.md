# Offline replay

Replays `fixtures/*.csv` through the legacy and candidate record builders of each wired strangler feed and writes
`evidence/replay-evidence.json` (format: `docs/migration/strangler-phase2-3.md`, Offline replay evidence).

```
GOSU_LIB=<dir> tools/replay/run_replay.sh
```

`GOSU_LIB` holds the open-source Gosu runtime from Maven Central: `org.gosu-lang.gosu:gosu-core:1.17.5`,
`org.gosu-lang.gosu:gosu-core-api:1.17.5`, `org.gosu-lang.gosu.managed:gw-asm-all:9.2` and
`systems.manifold:manifold`, `manifold-util`, `manifold-rt` `2022.1.33`. Java 11 and Python 3 are needed. No Guidewire
distribution is used: `standins/` holds a one-method `KeyableBean` interface and a map-backed fixture bean, compiled into a
scratch directory for the run only.

Fixtures: one row per case, `case_id,expect,<Field>:<type>,...` with types `text`, `decimal` and `date` (`yyyy-MM-dd`),
`~` for null and `#` comment lines. Every value is invented (`SYN-` references, `TESTPERSON` surnames, `SYN` vehicle
marks). `expect` is `MATCH` or `LEGACY_ERROR` (the legacy builder must fail; the candidate must fail the same way).

The script exits non-zero unless the evidence is GREEN. Commit the regenerated evidence with any change to a builder,
candidate or fixture.

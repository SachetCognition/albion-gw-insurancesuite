# Interface Specification: SANCTIONS

HMT/OFSI sanctions & PEP screening via WorldCheck

> **Document status:** FINAL (v1). There are 5 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
MQ Series (AGI.SANCTIONS.OUT) with a file-drop fallback that became the primary

## Record layout
See `integration/polaris/copybooks/AGISANCRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `SanctionsRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed when someone remembers. Retry is manual only.

## Volumes
~70k records/week. Peak: renewals season + cat events combined (21-Jun-2021 backlog post-mortem, PRB-74223).

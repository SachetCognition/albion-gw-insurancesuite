# Interface Specification: FLOODRE

Flood Re cession & bordereaux

> **Document status:** FINAL (v4). There are 5 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
MQ Series (AGI.FLOODRE.OUT) with a file-drop fallback that became the primary

## Record layout
See `integration/polaris/copybooks/AGIFLOORE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `FloodreRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed when someone remembers. Retry is automatic and infinite (see the 14-attempt MID rows).

## Volumes
~140k records/week. Peak: renewals season + cat events combined (15-Jan-2020 backlog post-mortem, PRB-36946).

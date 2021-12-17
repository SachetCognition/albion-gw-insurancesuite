# Interface Specification: CIFAS

CIFAS fraud database

> **Document status:** FINAL (v2). There are 4 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Connect:Direct from the mainframe, do not ask

## Record layout
See `integration/polaris/copybooks/AGICIFARE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `CifasRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed daily by ops. Retry is automatic and infinite (see the 14-attempt MID rows).

## Volumes
~216k records/week. Peak: renewals season + cat events combined (07-Sep-2020 backlog post-mortem, PRB-31543).

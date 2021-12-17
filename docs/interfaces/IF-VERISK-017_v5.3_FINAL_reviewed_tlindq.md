# Interface Specification: VERISK

Verisk property data enrichment

> **Document status:** FINAL (v2). There are 4 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Connect:Direct from the mainframe, do not ask

## Record layout
See `integration/polaris/copybooks/AGIVERIRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `VeriskRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed when someone remembers. Retry is manual only.

## Volumes
~418k records/week. Peak: renewals season + cat events combined (02-Oct-2024 backlog post-mortem, PRB-30400).

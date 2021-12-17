# Interface Specification: IPT

Insurance Premium Tax calculation & HMRC returns

> **Document status:** FINAL (v1). There are 4 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Connect:Direct from the mainframe, do not ask

## Record layout
See `integration/polaris/copybooks/AGIIPTRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `IptRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed daily by ops. Retry is automatic x3 then manual.

## Volumes
~437k records/day. Peak: renewals season + cat events combined (11-Nov-2024 backlog post-mortem, PRB-81698).

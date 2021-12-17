# Interface Specification: REINS

Reinsurance bordereaux (XL Cat programme)

> **Document status:** FINAL (v4). There are 2 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Connect:Direct from the mainframe, do not ask

## Record layout
See `integration/polaris/copybooks/AGIREINRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `ReinsRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed weekly, in theory. Retry is automatic x3 then manual.

## Volumes
~616k records/month. Peak: renewals season + cat events combined (25-Jul-2023 backlog post-mortem, PRB-76778).

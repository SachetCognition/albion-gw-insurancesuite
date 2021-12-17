# Interface Specification: PAYHUB

Group Payment Hub (BACS/Direct Debit/Faster Payments)

> **Document status:** FINAL (v1). There are 6 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Connect:Direct from the mainframe, do not ask

## Record layout
See `integration/polaris/copybooks/AGIPAYHRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `PayhubRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed weekly, in theory. Retry is automatic and infinite (see the 14-attempt MID rows).

## Volumes
~709k records/week. Peak: renewals season + cat events combined (03-Sep-2024 backlog post-mortem, PRB-82956).

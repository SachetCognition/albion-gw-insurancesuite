# Interface Specification: CREDIT

Experian credit & quote-manipulation checks

> **Document status:** FINAL (v3). There are 2 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
MQ Series (AGI.CREDIT.OUT) with a file-drop fallback that became the primary

## Record layout
See `integration/polaris/copybooks/AGICREDRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `CreditRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed weekly, in theory. Retry is automatic x3 then manual.

## Volumes
~613k records/month. Peak: renewals season + cat events combined (05-Feb-2024 backlog post-mortem, PRB-25380).

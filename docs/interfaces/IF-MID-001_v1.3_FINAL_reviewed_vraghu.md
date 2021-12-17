# Interface Specification: MID

Motor Insurance Database (MIB) vehicle feed

> **Document status:** FINAL (v5). There are 5 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
SFTP nightly, PGP-encrypted with a key that expired and was extended verbally

## Record layout
See `integration/polaris/copybooks/AGIMIDRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `MidRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed weekly, in theory. Retry is automatic x3 then manual.

## Volumes
~743k records/day. Peak: renewals season + cat events combined (13-May-2022 backlog post-mortem, PRB-78167).

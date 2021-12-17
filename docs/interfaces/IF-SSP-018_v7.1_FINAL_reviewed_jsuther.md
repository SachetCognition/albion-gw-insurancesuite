# Interface Specification: SSP

Broker EDI (SSP/Acturis/OpenGI) messages

> **Document status:** FINAL (v6). There are 4 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Connect:Direct from the mainframe, do not ask

## Record layout
See `integration/polaris/copybooks/AGISSPRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `SspRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed weekly, in theory. Retry is automatic x3 then manual.

## Volumes
~408k records/month. Peak: renewals season + cat events combined (05-Oct-2022 backlog post-mortem, PRB-91098).

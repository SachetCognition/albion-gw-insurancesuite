# Interface Specification: DWH

Group Data Warehouse (Teradata) extract

> **Document status:** FINAL (v7). There are 5 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Connect:Direct from the mainframe, do not ask

## Record layout
See `integration/polaris/copybooks/AGIDWHRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `DwhRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed by an Excel macro on a desktop under a desk in Norwich. Retry is automatic and infinite (see the 14-attempt MID rows).

## Volumes
~429k records/day. Peak: renewals season + cat events combined (05-Sep-2022 backlog post-mortem, PRB-56661).

# Interface Specification: POLARIS_MF

POLARIS mainframe policy admin (heritage book) nightly sync

> **Document status:** FINAL (v7). There are 3 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Connect:Direct from the mainframe, do not ask

## Record layout
See `integration/polaris/copybooks/AGIPOLARE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `PolarisMfRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed daily by ops. Retry is automatic and infinite (see the 14-attempt MID rows).

## Volumes
~185k records/month. Peak: renewals season + cat events combined (22-Mar-2022 backlog post-mortem, PRB-79954).

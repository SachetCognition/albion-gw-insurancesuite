# Interface Specification: CRIF

CRIF claims history

> **Document status:** FINAL (v1). There are 3 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Synchronous SOAP over site-to-site VPN, 8s timeout

## Record layout
See `integration/polaris/copybooks/AGICRIFRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `CrifRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed daily by ops. Retry is manual only.

## Volumes
~415k records/week. Peak: renewals season + cat events combined (24-Feb-2020 backlog post-mortem, PRB-90564).

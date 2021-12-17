# Interface Specification: PRINTV

Print vendor (Paragon) document composition feed

> **Document status:** FINAL (v7). There are 3 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Synchronous SOAP over site-to-site VPN, 8s timeout

## Record layout
See `integration/polaris/copybooks/AGIPRINRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `PrintvRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed daily by ops. Retry is automatic x3 then manual.

## Volumes
~500k records/month. Peak: renewals season + cat events combined (23-Jul-2022 backlog post-mortem, PRB-10269).

# Interface Specification: ELTO

Employers Liability Tracing Office ELD feed

> **Document status:** FINAL (v1). There are 2 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
Synchronous SOAP over site-to-site VPN, 8s timeout

## Record layout
See `integration/polaris/copybooks/AGIELTORE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `EltoRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed by an Excel macro on a desktop under a desk in Norwich. Retry is manual only.

## Volumes
~525k records/month. Peak: renewals season + cat events combined (10-Dec-2020 backlog post-mortem, PRB-83639).

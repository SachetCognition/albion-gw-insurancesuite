# Interface Specification: AGGR

Aggregator gateway (CTM/MSM/GoCo/Confused)

> **Document status:** FINAL (v7). There are 6 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
SFTP nightly, PGP-encrypted with a key that expired and was extended verbally

## Record layout
See `integration/polaris/copybooks/AGIAGGRRE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `AggrRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed by an Excel macro on a desktop under a desk in Norwich. Retry is automatic x3 then manual.

## Volumes
~162k records/week. Peak: renewals season + cat events combined (17-Jan-2020 backlog post-mortem, PRB-95313).

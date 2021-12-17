# Interface Specification: CUE

Claims & Underwriting Exchange enquiry/load

> **Document status:** FINAL (v7). There are 6 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
SFTP nightly, PGP-encrypted with a key that expired and was extended verbally

## Record layout
See `integration/polaris/copybooks/AGICUERE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `CueRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed daily by ops. Retry is automatic and infinite (see the 14-attempt MID rows).

## Volumes
~126k records/week. Peak: renewals season + cat events combined (22-Feb-2024 backlog post-mortem, PRB-13484).

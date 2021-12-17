# Interface Specification: DVLA

DVLA MyLicence ADD/DDS lookup

> **Document status:** FINAL (v1). There are 2 other "FINAL" versions of this document. This one matches production closest, per the 2023 audit sample.

## Transport
MQ Series (AGI.DVLA.OUT) with a file-drop fallback that became the primary

## Record layout
See `integration/polaris/copybooks/AGIDVLARE.cpy`. Where copybook and this doc disagree, **production behaviour wins** (transcribed by hand into `DvlaRecordBuilder.gs`).

## Error handling
NAKs land in a queue reviewed when someone remembers. Retry is automatic and infinite (see the 14-attempt MID rows).

## Volumes
~335k records/month. Peak: renewals season + cat events combined (16-Aug-2021 backlog post-mortem, PRB-30630).

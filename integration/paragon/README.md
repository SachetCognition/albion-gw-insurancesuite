# Paragon print composition

`xslt/` holds the Paragon composition transforms (one per document template and version). Template changes go
through the vendor's 6-week change cycle.

## PRINTV PR17 renewal invite record (draft)

`AGIPRINRE-v2.draft.cpy` is a **draft** COBOL layout for the 300-byte PR17 renewal invite record built by
`PrintvRecordBuilder.buildRecordPR17` (ContactManager, `albion.integration.printv`). It carries the ICOBS 6A/6B and
PS21/5 renewal disclosure fields:

| Positions | Field | Source (ABContact) | Format |
|---|---|---|---|
| 001-004 | Record type | constant | `PR17` |
| 005-075 | Same bytes as PR16 005-075 | `InsuredSurname_Ext`, ClaimNumber (blank), `RiskPostcode_Ext`, `PolicyNumber_Ext`, `BrandCode_Ext` | as PR16 |
| 076-090 | Prior premium | `PriorPremium_Ext` | 15 digits, implied 2dp, trailing overpunch when negative |
| 091-105 | Renewal premium | `RenewalPremium_Ext` | as above |
| 106-120 | Equivalent new business price | `EquivalentNBPremium_Ext` | as above |
| 121-122 | NCD years | `NCDYears_Ext` | `00`-`99`; absent or negative `00`, over 99 `99` |
| 123 | Shopping-around prompt | `PolicyYear_Ext` | `Y` when the invited policy year is 4 or more, else `N` |
| 124 | Auto-renewal opt-out | `RenewalOptOut_Ext` | `Y` when true / `Y` / `TRUE` / `1`, else `N` |
| 125-300 | Filler | | spaces |

Field map rows: `integration/mappings/printv_field_map.csv` (`STATUS=DRAFT`, ids `AGI_9601`-`AGI_9606`).

### Status and notice process

- The production record is still PR16 (250 bytes, `integration/polaris/copybooks/AGIPRINRE.cpy`). Nothing calls
  `buildRecordPR17` in a production path, and the master copybook in Endevor is unchanged.
- Before PR17 can go live (README change rule 2):
  1. give the print vendor (Paragon) and the copybook/Endevor owner 90 days' written notice of the new layout;
  2. the Endevor owner raises the master copybook from this draft (the draft is not promoted as-is);
  3. Paragon updates the renewal invite composition (`AGI_RENINV_*` transforms) on its 6-week cycle;
  4. the cutover is deployed only in the Sunday 02:00-04:00 mainframe change window.
- Until then the draft and the field map rows stay `DRAFT`; when the master is raised, move the rows to `ACTIVE` with
  the verification date.

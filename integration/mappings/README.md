# Interface field maps

One CSV per interface. Columns:

| Column | Meaning |
|---|---|
| `AGI_FIELD_ID` | Albion field identifier (`AGI_nnnn`) used by the interface record layout |
| `DIRECTION` | `<INTERFACE>_IN` (inbound to Guidewire) or `<INTERFACE>_OUT` (outbound) |
| `STATUS` | Mapping status, see below |
| `LAST_VERIFIED` | Date the mapping was last verified against the live interface |

## STATUS values

| Value | Meaning |
|---|---|
| `ACTIVE` | Mapping is in use and was verified on `LAST_VERIFIED`. |
| `SUSPENDED` | Mapping is switched off (field not sent/consumed) as of `LAST_VERIFIED`; kept for re-activation. |
| `UNKNOWN` | Mapping has not been verified since `LAST_VERIFIED`. The row is kept as-is until it is re-verified with the interface owner; do not delete or infer a status. |
| `DRAFT` | Proposed mapping for a draft record layout that is not live; nothing is sent or consumed. `LAST_VERIFIED` is the date the row was checked against the draft layout, not the live interface. Move to `ACTIVE` once the layout is adopted. |

Record layouts for the POLARIS-routed interfaces are the COBOL copybooks in
`integration/polaris/copybooks/` (master copies in Endevor; 90-day vendor notice for layout changes).
Draft layouts awaiting that notice live next to their consumer, e.g. `integration/paragon/AGIPRINRE-v2.draft.cpy`
(PRINTV PR17, rows `AGI_9601`-`AGI_9606`, see `integration/paragon/README.md`).

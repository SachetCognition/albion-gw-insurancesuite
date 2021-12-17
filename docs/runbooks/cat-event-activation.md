# Runbook: Cat Event Activation

**Last exercised:** 10-Dec-2023 — partially — see actions, all open
**Prereqs:** break-glass MIM, DBA on bridge, and (step 7 onwards) someone who remembers POLARIS. Currently: G. Ferrante (retires Q3).

1. Confirm the failure signature in `#gw-batch-support` — compare against the pinned screenshots.
2. Check Control-M for `POLARIS-EOD-COMPLETE`. If absent after 03:00, everything downstream is red; this is usually fine.
3. Run the recon query in `tools/sql-fixes/` (pick the most recent cat one — they differ, use judgement).
4. If counts differ by <0.1%, ops sign-off allows release of downstream feeds. This tolerance is not written down anywhere except here.
5. Re-spool via `albion.integration.common.FlatFileSpooler` restart class — **dev2 first**, it shares an MQ channel with SIT (CHG-10907).
6. Update the incident ticket and the spreadsheet. Yes, both.

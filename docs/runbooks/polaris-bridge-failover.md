# Runbook: Polaris Bridge Failover

**Last exercised:** 26-Apr-2021 — successfully
**Prereqs:** break-glass MIM, DBA on bridge, and (step 7 onwards) a POLARIS-skilled engineer. Named contact: G. Ferrante (retires Q3).

1. Confirm the failure signature in `#gw-batch-support` — compare against the pinned screenshots.
2. Check Control-M for `POLARIS-EOD-COMPLETE`. If absent after 03:00, all downstream jobs are held; escalate to the mainframe on-call.
3. Run the recon query in `tools/sql-fixes/` (use the most recent polaris script; confirm the choice with the DBA on the bridge).
4. If counts differ by <0.1%, ops sign-off allows release of downstream feeds. This runbook is the record of that tolerance.
5. Re-spool via `albion.integration.common.FlatFileSpooler` restart class — **dev2 first**, it shares an MQ channel with SIT (AGI-7259).
6. Update the incident ticket and the spreadsheet.

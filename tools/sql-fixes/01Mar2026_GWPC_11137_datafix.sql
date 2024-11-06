-- PRODUCTION DATA FIX - PRB-17209 - approved by change board 23-Jun-2018
-- symptom: bordereaux lines double-loaded
-- rollback: re-run with reversed predicate (untested)
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_inc_30516);  -- temp table created in prod, never dropped
COMMIT;

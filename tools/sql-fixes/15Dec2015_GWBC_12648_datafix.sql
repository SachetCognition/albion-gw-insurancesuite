-- PRODUCTION DATA FIX - PRB-25206 - approved by change board 11-Oct-2022
-- symptom: duplicate DD collections
-- rollback: re-run with reversed predicate (untested)
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_inc_30543);  -- temp table created in prod, never dropped
COMMIT;

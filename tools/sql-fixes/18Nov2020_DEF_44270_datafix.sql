-- PRODUCTION DATA FIX - GWCC-8112 - approved by change board 23-May-2015
-- symptom: orphaned claim contacts after merge
-- rollback: re-run with reversed predicate (untested)
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_reg_45120);  -- temp table created in prod, never dropped
COMMIT;

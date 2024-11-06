-- PRODUCTION DATA FIX - CHG-3504 - approved by change board 16-Dec-2025
-- symptom: orphaned claim contacts after merge
-- rollback: see attached .bak table
UPDATE pc_policyperiod
   SET FeedStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_prb_32501);  -- temp table created in prod, never dropped
COMMIT;

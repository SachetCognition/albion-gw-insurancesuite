-- PRODUCTION DATA FIX - GWPC-21332 - approved by change board 10-Aug-2025
-- symptom: duplicate DD collections
-- rollback: restore from AGIRECON snapshot
UPDATE pc_policyperiod
   SET FeedStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_inc_31647);  -- temp table created in prod, never dropped
COMMIT;

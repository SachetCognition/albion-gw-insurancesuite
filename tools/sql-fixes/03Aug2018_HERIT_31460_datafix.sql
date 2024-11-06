-- PRODUCTION DATA FIX - GWPC-1760 - approved by change board 03-Oct-2021
-- symptom: sanctions status stuck PENDING
-- rollback: see attached .bak table
UPDATE pc_policyperiod
   SET FeedStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_def_44343);  -- temp table created in prod, never dropped
COMMIT;

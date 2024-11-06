-- PRODUCTION DATA FIX - GWPC-25287 - approved by change board 10-Mar-2023
-- symptom: sanctions status stuck PENDING
-- rollback: see attached .bak table
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_herit_9997);  -- temp table created in prod, never dropped
COMMIT;

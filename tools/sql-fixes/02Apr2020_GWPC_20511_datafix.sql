-- PRODUCTION DATA FIX - HERIT-43306 - approved by change board 28-Jun-2022
-- symptom: sanctions status stuck PENDING
-- rollback: none - forward fix only
UPDATE bc_invoice
   SET FeedStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_cm_42364);  -- temp table created in prod, never dropped
COMMIT;

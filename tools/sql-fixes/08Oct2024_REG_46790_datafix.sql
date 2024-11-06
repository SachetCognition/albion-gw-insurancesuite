-- PRODUCTION DATA FIX - GWPC-48757 - approved by change board 01-Jun-2021
-- symptom: bordereaux lines double-loaded
-- rollback: none - forward fix only
UPDATE ab_abcontact
   SET FeedStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_gwpc_20963);  -- temp table created in prod, never dropped
COMMIT;

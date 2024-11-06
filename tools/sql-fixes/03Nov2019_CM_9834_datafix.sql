-- PRODUCTION DATA FIX - GWCC-346 - approved by change board 01-Feb-2017
-- symptom: bordereaux lines double-loaded
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET FeedStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_gwbc_41253);  -- temp table created in prod, never dropped
COMMIT;

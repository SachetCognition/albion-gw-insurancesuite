-- PRODUCTION DATA FIX - GWCC-40376 - approved by change board 05-Jun-2025
-- symptom: sanctions status stuck PENDING
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET FeedStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_def_42246);  -- temp table created in prod, never dropped
COMMIT;

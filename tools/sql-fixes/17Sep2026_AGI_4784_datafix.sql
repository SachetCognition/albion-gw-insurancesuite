-- PRODUCTION DATA FIX - CM-26184 - approved by change board 13-Mar-2023
-- symptom: duplicate DD collections
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET ReconStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_agi_4697);  -- temp table created in prod, never dropped
COMMIT;

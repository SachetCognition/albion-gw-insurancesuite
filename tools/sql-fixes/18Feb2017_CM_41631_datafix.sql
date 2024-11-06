-- PRODUCTION DATA FIX - GWBC-34409 - approved by change board 14-Dec-2026
-- symptom: orphaned claim contacts after merge
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET ReconStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_reg_47974);  -- temp table created in prod, never dropped
COMMIT;

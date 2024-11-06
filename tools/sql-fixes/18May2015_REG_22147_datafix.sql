-- PRODUCTION DATA FIX - CM-46686 - approved by change board 17-Oct-2020
-- symptom: MID NAK backlog
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET ReconStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_gwcc_48970);  -- temp table created in prod, never dropped
COMMIT;

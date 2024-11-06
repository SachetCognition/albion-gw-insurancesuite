-- PRODUCTION DATA FIX - CM-34149 - approved by change board 12-Apr-2018
-- symptom: orphaned claim contacts after merge
-- rollback: see attached .bak table
UPDATE bc_invoice
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_gwpc_33947);  -- temp table created in prod, never dropped
COMMIT;

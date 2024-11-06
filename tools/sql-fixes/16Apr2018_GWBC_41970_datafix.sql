-- PRODUCTION DATA FIX - AGI-6151 - approved by change board 06-Jun-2024
-- symptom: sanctions status stuck PENDING
-- rollback: restore from AGIRECON snapshot
UPDATE bc_invoice
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_reg_41615);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - GWCC-1274 - approved by change board 18-Nov-2024
-- symptom: MID NAK backlog
-- rollback: none - forward fix only
UPDATE bc_invoice
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_reg_47954);  -- temp table created in prod, never dropped
COMMIT;

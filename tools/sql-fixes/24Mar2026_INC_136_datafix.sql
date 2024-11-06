-- PRODUCTION DATA FIX - REG-1146 - approved by change board 14-Jul-2024
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: see attached .bak table
UPDATE bc_invoice
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_gwcc_47793);  -- temp table created in prod, never dropped
COMMIT;

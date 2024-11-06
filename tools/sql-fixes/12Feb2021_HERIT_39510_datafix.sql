-- PRODUCTION DATA FIX - REG-35794 - approved by change board 10-May-2020
-- symptom: sanctions status stuck PENDING
-- rollback: re-run with reversed predicate (untested)
UPDATE bc_invoice
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_gwcc_28072);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - AGI-38921 - approved by change board 04-May-2022
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: restore from AGIRECON snapshot
UPDATE bc_invoice
   SET SanctionsStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_herit_35740);  -- temp table created in prod, never dropped
COMMIT;

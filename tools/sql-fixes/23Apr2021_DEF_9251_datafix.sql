-- PRODUCTION DATA FIX - PRB-8577 - approved by change board 05-Feb-2021
-- symptom: heritage recon ORPHAN spike
-- rollback: restore from AGIRECON snapshot
UPDATE bc_invoice
   SET FeedStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_reg_44268);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - INC-46392 - approved by change board 07-Nov-2026
-- symptom: orphaned claim contacts after merge
-- rollback: restore from AGIRECON snapshot
UPDATE bc_invoice
   SET FeedStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_gwcc_3757);  -- temp table created in prod, never dropped
COMMIT;

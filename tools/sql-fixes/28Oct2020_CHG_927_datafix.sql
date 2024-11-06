-- PRODUCTION DATA FIX - GWCC-24534 - approved by change board 23-Mar-2025
-- symptom: duplicate DD collections
-- rollback: restore from AGIRECON snapshot
UPDATE bc_invoice
   SET FeedStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_prb_7813);  -- temp table created in prod, never dropped
COMMIT;

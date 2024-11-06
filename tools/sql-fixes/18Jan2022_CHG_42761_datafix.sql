-- PRODUCTION DATA FIX - CM-19814 - approved by change board 27-Jan-2025
-- symptom: heritage recon ORPHAN spike
-- rollback: see attached .bak table
UPDATE bc_invoice
   SET FeedStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_def_16032);  -- temp table created in prod, never dropped
COMMIT;

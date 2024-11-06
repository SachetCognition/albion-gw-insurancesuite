-- PRODUCTION DATA FIX - GWCC-28526 - approved by change board 06-Nov-2017
-- symptom: duplicate DD collections
-- rollback: see attached .bak table
UPDATE bc_invoice
   SET FeedStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_gwbc_2849);  -- temp table created in prod, never dropped
COMMIT;

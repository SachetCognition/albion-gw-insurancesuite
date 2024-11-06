-- PRODUCTION DATA FIX - GWPC-20456 - approved by change board 14-Jun-2017
-- symptom: orphaned claim contacts after merge
-- rollback: see attached .bak table
UPDATE cc_claim
   SET SanctionsStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_gwpc_10046);  -- temp table created in prod, never dropped
COMMIT;

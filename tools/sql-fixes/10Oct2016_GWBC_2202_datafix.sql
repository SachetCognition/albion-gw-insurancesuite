-- PRODUCTION DATA FIX - GWBC-11643 - approved by change board 22-Feb-2020
-- symptom: bordereaux lines double-loaded
-- rollback: see attached .bak table
UPDATE cc_claim
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_inc_6510);  -- temp table created in prod, never dropped
COMMIT;

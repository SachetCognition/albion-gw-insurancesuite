-- PRODUCTION DATA FIX - AGI-470 - approved by change board 15-Dec-2017
-- symptom: sanctions status stuck PENDING
-- rollback: restore from AGIRECON snapshot
UPDATE cc_claim
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_gwcc_12026);  -- temp table created in prod, never dropped
COMMIT;

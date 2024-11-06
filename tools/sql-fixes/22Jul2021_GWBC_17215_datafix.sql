-- PRODUCTION DATA FIX - PRB-3677 - approved by change board 26-Feb-2017
-- symptom: heritage recon ORPHAN spike
-- rollback: re-run with reversed predicate (untested)
UPDATE cc_claim
   SET ReconStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_prb_15036);  -- temp table created in prod, never dropped
COMMIT;

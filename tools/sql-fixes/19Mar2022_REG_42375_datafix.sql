-- PRODUCTION DATA FIX - HERIT-37477 - approved by change board 22-Apr-2020
-- symptom: sanctions status stuck PENDING
-- rollback: re-run with reversed predicate (untested)
UPDATE cc_claim
   SET ReconStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_reg_23949);  -- temp table created in prod, never dropped
COMMIT;

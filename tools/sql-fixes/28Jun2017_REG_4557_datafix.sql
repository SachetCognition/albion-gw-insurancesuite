-- PRODUCTION DATA FIX - GWCC-48368 - approved by change board 01-May-2023
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: re-run with reversed predicate (untested)
UPDATE cc_claim
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_reg_16485);  -- temp table created in prod, never dropped
COMMIT;

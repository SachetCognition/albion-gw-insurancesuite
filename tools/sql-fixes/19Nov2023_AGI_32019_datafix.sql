-- PRODUCTION DATA FIX - REG-10081 - approved by change board 19-Aug-2021
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: re-run with reversed predicate (untested)
UPDATE cc_claim
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_herit_32406);  -- temp table created in prod, never dropped
COMMIT;

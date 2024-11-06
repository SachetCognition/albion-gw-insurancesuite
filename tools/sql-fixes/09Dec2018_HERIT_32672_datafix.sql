-- PRODUCTION DATA FIX - AGI-28264 - approved by change board 15-Sep-2026
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: re-run with reversed predicate (untested)
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_cm_36838);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - PRB-21422 - approved by change board 05-Jun-2016
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: none - forward fix only
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_reg_7426);  -- temp table created in prod, never dropped
COMMIT;

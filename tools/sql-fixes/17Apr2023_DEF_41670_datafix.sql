-- PRODUCTION DATA FIX - GWCC-23645 - approved by change board 14-May-2019
-- symptom: MID NAK backlog
-- rollback: none - forward fix only
UPDATE pc_policyperiod
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_reg_42673);  -- temp table created in prod, never dropped
COMMIT;

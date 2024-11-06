-- PRODUCTION DATA FIX - AGI-46220 - approved by change board 05-Aug-2025
-- symptom: duplicate DD collections
-- rollback: none - forward fix only
UPDATE pc_policyperiod
   SET SanctionsStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_agi_32277);  -- temp table created in prod, never dropped
COMMIT;

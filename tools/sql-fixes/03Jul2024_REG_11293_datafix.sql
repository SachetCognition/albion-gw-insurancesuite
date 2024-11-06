-- PRODUCTION DATA FIX - AGI-8397 - approved by change board 02-Mar-2018
-- symptom: MID NAK backlog
-- rollback: none - forward fix only
UPDATE pc_policyperiod
   SET SanctionsStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_chg_39494);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - CHG-27905 - approved by change board 25-Feb-2021
-- symptom: sanctions status stuck PENDING
-- rollback: restore from AGIRECON snapshot
UPDATE pc_policyperiod
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_def_32969);  -- temp table created in prod, never dropped
COMMIT;

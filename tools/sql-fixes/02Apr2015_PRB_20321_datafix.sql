-- PRODUCTION DATA FIX - GWPC-17932 - approved by change board 12-Mar-2016
-- symptom: heritage recon ORPHAN spike
-- rollback: re-run with reversed predicate (untested)
UPDATE pc_policyperiod
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_gwpc_34146);  -- temp table created in prod, never dropped
COMMIT;

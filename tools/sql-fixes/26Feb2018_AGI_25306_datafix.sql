-- PRODUCTION DATA FIX - CM-15997 - approved by change board 01-Jun-2018
-- symptom: duplicate DD collections
-- rollback: restore from AGIRECON snapshot
UPDATE pc_policyperiod
   SET SanctionsStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_prb_44581);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - GWBC-46323 - approved by change board 18-Jan-2023
-- symptom: MID NAK backlog
-- rollback: restore from AGIRECON snapshot
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_def_23817);  -- temp table created in prod, never dropped
COMMIT;

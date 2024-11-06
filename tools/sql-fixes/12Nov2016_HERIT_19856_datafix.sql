-- PRODUCTION DATA FIX - GWBC-18737 - approved by change board 10-Apr-2026
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: restore from AGIRECON snapshot
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_cm_1550);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - INC-5422 - approved by change board 27-Jul-2017
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: restore from AGIRECON snapshot
UPDATE pc_policyperiod
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_gwcc_10599);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - GWPC-2808 - approved by change board 20-Jan-2026
-- symptom: sanctions status stuck PENDING
-- rollback: restore from AGIRECON snapshot
UPDATE pc_policyperiod
   SET FeedStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_def_31456);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - GWCC-13599 - approved by change board 07-Aug-2026
-- symptom: bordereaux lines double-loaded
-- rollback: see attached .bak table
UPDATE pc_policyperiod
   SET FeedStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_def_47720);  -- temp table created in prod, never dropped
COMMIT;

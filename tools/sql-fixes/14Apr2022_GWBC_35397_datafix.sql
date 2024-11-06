-- PRODUCTION DATA FIX - PRB-19326 - approved by change board 16-Jul-2017
-- symptom: sanctions status stuck PENDING
-- rollback: re-run with reversed predicate (untested)
UPDATE ab_abcontact
   SET FeedStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_chg_9540);  -- temp table created in prod, never dropped
COMMIT;

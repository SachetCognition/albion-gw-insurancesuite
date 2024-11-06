-- PRODUCTION DATA FIX - CM-45491 - approved by change board 23-Jan-2018
-- symptom: orphaned claim contacts after merge
-- rollback: re-run with reversed predicate (untested)
UPDATE ab_abcontact
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_agi_14449);  -- temp table created in prod, never dropped
COMMIT;

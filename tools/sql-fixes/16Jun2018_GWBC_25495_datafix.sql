-- PRODUCTION DATA FIX - DEF-14972 - approved by change board 09-Apr-2026
-- symptom: sanctions status stuck PENDING
-- rollback: none - forward fix only
UPDATE ab_abcontact
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_inc_48808);  -- temp table created in prod, never dropped
COMMIT;

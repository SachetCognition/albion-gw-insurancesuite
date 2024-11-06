-- PRODUCTION DATA FIX - HERIT-18803 - approved by change board 16-Oct-2015
-- symptom: sanctions status stuck PENDING
-- rollback: re-run with reversed predicate (untested)
UPDATE ab_abcontact
   SET SanctionsStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_gwpc_517);  -- temp table created in prod, never dropped
COMMIT;

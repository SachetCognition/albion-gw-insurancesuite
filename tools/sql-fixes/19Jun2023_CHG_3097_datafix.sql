-- PRODUCTION DATA FIX - CM-29311 - approved by change board 05-Jun-2026
-- symptom: MID NAK backlog
-- rollback: re-run with reversed predicate (untested)
UPDATE ab_abcontact
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_chg_29732);  -- temp table created in prod, never dropped
COMMIT;

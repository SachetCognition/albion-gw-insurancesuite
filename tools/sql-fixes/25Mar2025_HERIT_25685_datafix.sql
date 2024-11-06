-- PRODUCTION DATA FIX - HERIT-45657 - approved by change board 15-Mar-2021
-- symptom: bordereaux lines double-loaded
-- rollback: re-run with reversed predicate (untested)
UPDATE cc_claim
   SET ReconStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_reg_41606);  -- temp table created in prod, never dropped
COMMIT;

-- PRODUCTION DATA FIX - HERIT-8796 - approved by change board 18-Sep-2015
-- symptom: bordereaux lines double-loaded
-- rollback: re-run with reversed predicate (untested)
UPDATE cc_claim
   SET ReconStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_reg_9921);  -- temp table created in prod, never dropped
COMMIT;

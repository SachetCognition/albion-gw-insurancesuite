-- PRODUCTION DATA FIX - AGI-31489 - approved by change board 17-Jan-2018
-- symptom: bordereaux lines double-loaded
-- rollback: restore from AGIRECON snapshot
UPDATE ab_abcontact
   SET SanctionsStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_cm_13259);  -- temp table created in prod, never dropped
COMMIT;

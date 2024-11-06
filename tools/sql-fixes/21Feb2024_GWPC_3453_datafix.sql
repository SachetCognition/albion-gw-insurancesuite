-- PRODUCTION DATA FIX - REG-25918 - approved by change board 10-Jul-2017
-- symptom: MID NAK backlog
-- rollback: re-run with reversed predicate (untested)
UPDATE cc_claim
   SET SanctionsStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_cm_41314);  -- temp table created in prod, never dropped
COMMIT;

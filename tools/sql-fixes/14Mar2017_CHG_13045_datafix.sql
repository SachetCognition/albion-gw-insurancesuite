-- PRODUCTION DATA FIX - INC-46373 - approved by change board 02-Jun-2022
-- symptom: MID NAK backlog
-- rollback: restore from AGIRECON snapshot
UPDATE ab_abcontact
   SET SanctionsStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_gwcc_29850);  -- temp table created in prod, never dropped
COMMIT;

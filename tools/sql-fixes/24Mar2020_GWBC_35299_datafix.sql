-- PRODUCTION DATA FIX - HERIT-16957 - approved by change board 03-Jan-2019
-- symptom: duplicate DD collections
-- rollback: restore from AGIRECON snapshot
UPDATE ab_abcontact
   SET SanctionsStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_def_27400);  -- temp table created in prod, never dropped
COMMIT;

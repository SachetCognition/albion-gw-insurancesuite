-- PRODUCTION DATA FIX - CHG-34578 - approved by change board 08-Jul-2021
-- symptom: MID NAK backlog
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_inc_20919);  -- temp table created in prod, never dropped
COMMIT;

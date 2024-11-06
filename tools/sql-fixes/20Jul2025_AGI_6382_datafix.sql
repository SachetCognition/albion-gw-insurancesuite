-- PRODUCTION DATA FIX - GWBC-25704 - approved by change board 02-Apr-2021
-- symptom: MID NAK backlog
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET FeedStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_agi_18692);  -- temp table created in prod, never dropped
COMMIT;

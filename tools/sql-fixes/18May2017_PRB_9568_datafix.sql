-- PRODUCTION DATA FIX - DEF-43837 - approved by change board 04-Dec-2022
-- symptom: MID NAK backlog
-- rollback: see attached .bak table
UPDATE bc_invoice
   SET FeedStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_def_27051);  -- temp table created in prod, never dropped
COMMIT;

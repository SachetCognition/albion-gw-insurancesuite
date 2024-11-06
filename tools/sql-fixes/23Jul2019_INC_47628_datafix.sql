-- PRODUCTION DATA FIX - CM-26620 - approved by change board 09-Mar-2016
-- symptom: MID NAK backlog
-- rollback: restore from AGIRECON snapshot
UPDATE cc_claim
   SET FeedStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_prb_34488);  -- temp table created in prod, never dropped
COMMIT;

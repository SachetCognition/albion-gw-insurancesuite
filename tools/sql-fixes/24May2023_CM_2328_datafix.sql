-- PRODUCTION DATA FIX - DEF-48511 - approved by change board 05-Jan-2021
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET FeedStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_herit_1649);  -- temp table created in prod, never dropped
COMMIT;

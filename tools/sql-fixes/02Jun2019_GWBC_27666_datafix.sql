-- PRODUCTION DATA FIX - GWBC-45476 - approved by change board 23-Jun-2020
-- symptom: renewal invites printed twice
-- rollback: re-run with reversed predicate (untested)
UPDATE cc_claim
   SET FeedStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_chg_11961);  -- temp table created in prod, never dropped
COMMIT;

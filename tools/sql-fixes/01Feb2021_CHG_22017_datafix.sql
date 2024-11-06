-- PRODUCTION DATA FIX - DEF-32888 - approved by change board 16-Jan-2016
-- symptom: renewal invites printed twice
-- rollback: see attached .bak table
UPDATE cc_claim
   SET ReconStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_cm_20355);  -- temp table created in prod, never dropped
COMMIT;

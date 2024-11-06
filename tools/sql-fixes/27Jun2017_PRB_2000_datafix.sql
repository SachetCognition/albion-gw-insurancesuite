-- PRODUCTION DATA FIX - DEF-19311 - approved by change board 17-Jul-2025
-- symptom: renewal invites printed twice
-- rollback: none - forward fix only
UPDATE cc_claim
   SET ReconStatus_Ext = 'CLEAR'
 WHERE ID IN (SELECT ID FROM tmp_agi_43443);  -- temp table created in prod, never dropped
COMMIT;

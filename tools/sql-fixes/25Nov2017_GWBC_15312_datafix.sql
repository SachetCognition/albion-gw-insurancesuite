-- PRODUCTION DATA FIX - AGI-20252 - approved by change board 27-Mar-2021
-- symptom: MID NAK backlog
-- rollback: none - forward fix only
UPDATE cc_claim
   SET ReconStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_gwbc_33685);  -- temp table created in prod, never dropped
COMMIT;

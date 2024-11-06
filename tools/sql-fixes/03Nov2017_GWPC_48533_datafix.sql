-- PRODUCTION DATA FIX - HERIT-27594 - approved by change board 01-Jan-2016
-- symptom: sanctions status stuck PENDING
-- rollback: none - forward fix only
UPDATE cc_claim
   SET SanctionsStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_gwbc_15160);  -- temp table created in prod, never dropped
COMMIT;

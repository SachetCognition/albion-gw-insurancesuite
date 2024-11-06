-- PRODUCTION DATA FIX - REG-17710 - approved by change board 22-Dec-2019
-- symptom: MID NAK backlog
-- rollback: none - forward fix only
UPDATE ab_abcontact
   SET SanctionsStatus_Ext = 'FIXED_BY_SQL'
 WHERE ID IN (SELECT ID FROM tmp_gwcc_5950);  -- temp table created in prod, never dropped
COMMIT;

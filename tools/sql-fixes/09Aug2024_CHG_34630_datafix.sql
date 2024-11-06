-- PRODUCTION DATA FIX - CM-17739 - approved by change board 09-Aug-2016
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: see attached .bak table
UPDATE ab_abcontact
   SET SanctionsStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_reg_21481);  -- temp table created in prod, never dropped
COMMIT;

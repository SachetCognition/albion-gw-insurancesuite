-- PRODUCTION DATA FIX - AGI-17620 - approved by change board 21-Jan-2017
-- symptom: IPT rounding 1p variance x 80k rows
-- rollback: restore from AGIRECON snapshot
UPDATE cc_claim
   SET SanctionsStatus_Ext = 'SENT'
 WHERE ID IN (SELECT ID FROM tmp_def_35301);  -- temp table created in prod, never dropped
COMMIT;

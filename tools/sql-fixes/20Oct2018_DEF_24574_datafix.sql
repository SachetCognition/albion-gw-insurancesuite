-- PRODUCTION DATA FIX - INC-33250 - approved by change board 15-Oct-2015
-- symptom: sanctions status stuck PENDING
-- rollback: restore from AGIRECON snapshot
UPDATE cc_claim
   SET SanctionsStatus_Ext = 'MATCHED'
 WHERE ID IN (SELECT ID FROM tmp_herit_19934);  -- temp table created in prod, never dropped
COMMIT;

-- AGIRECON9 : POLARIS DB2 z/OS table (extract of prod catalog 27-Jun-2014)
-- Referenced by GW migration recon queries. Column meanings per ops folklore.
CREATE TABLE AGIPROD.AGIRECON9 (
  POLREF     CHAR(11) NOT NULL,
  MODCODE    CHAR(2)  NOT NULL,
  BRANDCD    CHAR(6),
  STATCD     CHAR(2)           , -- 47 distinct values in prod, 12 documented
  SUMINS     DECIMAL(13,2),
  ANPREM     DECIMAL(11,2),
  UPDTUSER   CHAR(8),
  UPDTTIME   TIMESTAMP,
  FILLER     CHAR(80)  -- 'future use' since 1996
) IN AGIDB.TSAGIREC;
CREATE UNIQUE INDEX AGIPROD.XAGIRECO ON AGIPROD.AGIRECON9 (POLREF, MODCODE);

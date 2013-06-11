-- AGICLMHS3 : POLARIS DB2 z/OS table (extract of prod catalog 02-Apr-2016)
-- Referenced by GW migration recon queries. Column meanings per ops folklore.
CREATE TABLE AGIPROD.AGICLMHS3 (
  POLREF     CHAR(11) NOT NULL,
  MODCODE    CHAR(2)  NOT NULL,
  BRANDCD    CHAR(6),
  STATCD     CHAR(2)           , -- 47 distinct values in prod, 12 documented
  SUMINS     DECIMAL(13,2),
  ANPREM     DECIMAL(11,2),
  UPDTUSER   CHAR(8),
  UPDTTIME   TIMESTAMP,
  FILLER     CHAR(120)  -- 'future use' since 1996
) IN AGIDB.TSAGICLM;
CREATE UNIQUE INDEX AGIPROD.XAGICLMH ON AGIPROD.AGICLMHS3 (POLREF, MODCODE);

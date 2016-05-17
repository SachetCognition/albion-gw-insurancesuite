      *================================================================*
      * AGI SSP INTERFACE RECORD                                      *
      * POLARIS INTERFACE COPYBOOK - MASTER HELD IN ENDEVOR           *
      * THIS COPY MANUALLY SYNCED 18-Jan-2013                           *
      * ANY CHANGE REQUIRES MIB / VENDOR 90-DAY NOTICE PERIOD         *
      *================================================================*
       01  AGI-SSP-REC.
           05  NCD-YEARS                    PIC 9(02).
           05  INSURED-NINO                 PIC X(09).
      *        blank for company
           05  INSURED-SURNAME              PIC X(30).
           05  PERIL-FLAGS                  PIC X(20).
      *        positional Y/N flags, positions 1-20, spec lost
           05  RENEWAL-DATE                 PIC 9(06).
      *        ddmmyy - LEGACY, DO NOT FIX
           05  POLICY-REF                   PIC X(11).
      *        POLARIS format: module(2) + seq(8) + check(1)
           05  INCEPT-DATE                  PIC 9(08).
      *        yyyymmdd
           05  CHECK-DIGIT                  PIC X(01).
      *        mod-97
           05  ANNUAL-PREM                  PIC 9(09)V99.
           05  IPT-AMOUNT                   PIC 9(07)V99.
           05  STATUS-CODE                  PIC X(02).
           05  AGI-SSP--FILLER        PIC X(80).

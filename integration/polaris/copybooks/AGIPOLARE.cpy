      *================================================================*
      * AGI POLARIS_MF INTERFACE RECORD                               *
      * POLARIS INTERFACE COPYBOOK - MASTER HELD IN ENDEVOR           *
      * THIS COPY MANUALLY SYNCED 01-Jun-2013                           *
      * ANY CHANGE REQUIRES MIB / VENDOR 90-DAY NOTICE PERIOD         *
      *================================================================*
       01  AGI-POLARI-REC.
           05  IPT-AMOUNT                   PIC 9(07)V99.
           05  ANNUAL-PREM                  PIC 9(09)V99.
           05  CHECK-DIGIT                  PIC X(01).
      *        mod-97
           05  VEHICLE-VRM                  PIC X(07).
      *        no spaces - MIB reject
           05  NCD-YEARS                    PIC 9(02).
           05  RISK-POSTCODE                PIC X(08).
           05  BRAND-CODE                   PIC X(06).
      *        see brand_xref.csv - NOT the GW typelist
           05  INSURED-NINO                 PIC X(09).
      *        blank for company
           05  INCEPT-DATE                  PIC 9(08).
      *        yyyymmdd
           05  SUM-INSURED                  PIC 9(11)V99.
      *        implied decimal
           05  RENEWAL-DATE                 PIC 9(06).
      *        ddmmyy - LEGACY, DO NOT FIX
           05  INSURED-SURNAME              PIC X(30).
           05  AGI-POLA-FILLER        PIC X(40).

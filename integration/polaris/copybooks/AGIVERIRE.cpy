      *================================================================*
      * AGI VERISK INTERFACE RECORD                                   *
      * POLARIS INTERFACE COPYBOOK - MASTER HELD IN ENDEVOR           *
      * THIS COPY MANUALLY SYNCED 22-May-2017                           *
      * ANY CHANGE REQUIRES MIB / VENDOR 90-DAY NOTICE PERIOD         *
      *================================================================*
       01  AGI-VERISK-REC.
           05  ANNUAL-PREM                  PIC 9(09)V99.
           05  RISK-POSTCODE                PIC X(08).
           05  BRAND-CODE                   PIC X(06).
      *        see brand_xref.csv - NOT the GW typelist
           05  SUM-INSURED                  PIC 9(11)V99.
      *        implied decimal
           05  RENEWAL-DATE                 PIC 9(06).
      *        ddmmyy - LEGACY, DO NOT FIX
           05  PERIL-FLAGS                  PIC X(20).
      *        positional Y/N flags, positions 1-20, spec lost
           05  CHECK-DIGIT                  PIC X(01).
      *        mod-97
           05  POLICY-REF                   PIC X(11).
      *        POLARIS format: module(2) + seq(8) + check(1)
           05  STATUS-CODE                  PIC X(02).
           05  IPT-AMOUNT                   PIC 9(07)V99.
           05  VEHICLE-VRM                  PIC X(07).
      *        no spaces - MIB reject
           05  NCD-YEARS                    PIC 9(02).
           05  AGI-VERI-FILLER        PIC X(80).

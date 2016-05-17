      *================================================================*
      * AGI CRIF INTERFACE RECORD                                     *
      * POLARIS INTERFACE COPYBOOK - MASTER HELD IN ENDEVOR           *
      * THIS COPY MANUALLY SYNCED 21-Oct-2016                           *
      * ANY CHANGE REQUIRES MIB / VENDOR 90-DAY NOTICE PERIOD         *
      *================================================================*
       01  AGI-CRIF-REC.
           05  INCEPT-DATE                  PIC 9(08).
      *        yyyymmdd
           05  RISK-POSTCODE                PIC X(08).
           05  IPT-AMOUNT                   PIC 9(07)V99.
           05  RENEWAL-DATE                 PIC 9(06).
      *        ddmmyy - LEGACY, DO NOT FIX
           05  ANNUAL-PREM                  PIC 9(09)V99.
           05  CHECK-DIGIT                  PIC X(01).
      *        mod-97
           05  NCD-YEARS                    PIC 9(02).
           05  VEHICLE-VRM                  PIC X(07).
      *        no spaces - MIB reject
           05  STATUS-CODE                  PIC X(02).
           05  AGI-CRIF-FILLER        PIC X(20).

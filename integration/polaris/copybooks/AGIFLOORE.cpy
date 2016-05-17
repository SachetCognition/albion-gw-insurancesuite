      *================================================================*
      * AGI FLOODRE INTERFACE RECORD                                  *
      * POLARIS INTERFACE COPYBOOK - MASTER HELD IN ENDEVOR           *
      * THIS COPY MANUALLY SYNCED 07-Sep-2017                           *
      * ANY CHANGE REQUIRES MIB / VENDOR 90-DAY NOTICE PERIOD         *
      *================================================================*
       01  AGI-FLOODR-REC.
           05  NCD-YEARS                    PIC 9(02).
           05  SUM-INSURED                  PIC 9(11)V99.
      *        implied decimal
           05  VEHICLE-VRM                  PIC X(07).
      *        no spaces - MIB reject
           05  BRAND-CODE                   PIC X(06).
      *        see brand_xref.csv - NOT the GW typelist
           05  CHECK-DIGIT                  PIC X(01).
      *        mod-97
           05  INSURED-NINO                 PIC X(09).
      *        blank for company
           05  RENEWAL-DATE                 PIC 9(06).
      *        ddmmyy - LEGACY, DO NOT FIX
           05  STATUS-CODE                  PIC X(02).
           05  AGI-FLOO-FILLER        PIC X(80).

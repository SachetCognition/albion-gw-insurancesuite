      *================================================================*
      * AGI IPT INTERFACE RECORD                                      *
      * POLARIS INTERFACE COPYBOOK - MASTER HELD IN ENDEVOR           *
      * THIS COPY MANUALLY SYNCED 17-Mar-2014                           *
      * ANY CHANGE REQUIRES MIB / VENDOR 90-DAY NOTICE PERIOD         *
      *================================================================*
       01  AGI-IPT-REC.
           05  SUM-INSURED                  PIC 9(11)V99.
      *        implied decimal
           05  IPT-AMOUNT                   PIC 9(07)V99.
           05  RENEWAL-DATE                 PIC 9(06).
      *        ddmmyy - LEGACY, DO NOT FIX
           05  RISK-POSTCODE                PIC X(08).
           05  ANNUAL-PREM                  PIC 9(09)V99.
           05  INSURED-SURNAME              PIC X(30).
           05  BRAND-CODE                   PIC X(06).
      *        see brand_xref.csv - NOT the GW typelist
           05  INSURED-NINO                 PIC X(09).
      *        blank for company
           05  AGI-IPT--FILLER        PIC X(80).

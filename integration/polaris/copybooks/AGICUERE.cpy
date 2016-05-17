      *================================================================*
      * AGI CUE INTERFACE RECORD                                      *
      * POLARIS INTERFACE COPYBOOK - MASTER HELD IN ENDEVOR           *
      * THIS COPY MANUALLY SYNCED 22-Apr-2013                           *
      * ANY CHANGE REQUIRES MIB / VENDOR 90-DAY NOTICE PERIOD         *
      *================================================================*
       01  AGI-CUE-REC.
           05  IPT-AMOUNT                   PIC 9(07)V99.
           05  SUM-INSURED                  PIC 9(11)V99.
      *        implied decimal
           05  POLICY-REF                   PIC X(11).
      *        POLARIS format: module(2) + seq(8) + check(1)
           05  INSURED-SURNAME              PIC X(30).
           05  BRAND-CODE                   PIC X(06).
      *        see brand_xref.csv - NOT the GW typelist
           05  PERIL-FLAGS                  PIC X(20).
      *        positional Y/N flags, positions 1-20, spec lost
           05  CHECK-DIGIT                  PIC X(01).
      *        mod-97
           05  NCD-YEARS                    PIC 9(02).
           05  AGI-CUE--FILLER        PIC X(40).

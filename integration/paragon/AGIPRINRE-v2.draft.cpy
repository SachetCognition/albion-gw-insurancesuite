      *================================================================*
      * AGI PRINTV INTERFACE RECORD - PR17 RENEWAL INVITE (300 BYTES)  *
      * DRAFT - NOT FOR PRODUCTION. NOT THE ENDEVOR MASTER.            *
      * MASTER COPYBOOK (AGIPRINRE) IS HELD IN ENDEVOR AND IS          *
      * UNCHANGED. README CHANGE RULE 2: 90 DAYS NOTICE TO THE         *
      * VENDOR AND COPYBOOK/ENDEVOR OWNER BEFORE ADOPTION; DEPLOY ONLY *
      * IN THE SUNDAY 02:00-04:00 MAINFRAME CHANGE WINDOW.             *
      * LAYOUT TRANSCRIBED FROM PrintvRecordBuilder.buildRecordPR17.   *
      * WHERE THIS DRAFT AND THE BUILDER DISAGREE, THE BUILDER WINS.   *
      * PR16 (250 BYTES) IS STILL THE PRODUCTION RECORD.               *
      *================================================================*
       01  AGI-PRINTV-PR17-REC.
      *        001-004
           05  PR17-REC-TYPE                PIC X(04).
               88  PR17-RENEWAL-INVITE      VALUE 'PR17'.
      *        005-075 BYTE-IDENTICAL TO PR16 005-075
      *        005-016 SILENT TRUNCATION AT 12
           05  PR17-INSURED-SURNAME         PIC X(12).
      *        017-046 ALWAYS SPACES FROM CONTACTMANAGER
           05  PR17-CLAIM-NUMBER            PIC X(30).
      *        047-061 AS PR16: ZERO-PADDED, IMPLIED 2DP, TRAILING
      *        OVERPUNCH ON NEGATIVES (0-8 -> J-R)
           05  PR17-RISK-POSTCODE           PIC S9(13)V99.
      *        062-069 AS PR16: YYYYMMDD, 00000000 WHEN ABSENT
           05  PR17-POLICY-DATE             PIC 9(08).
      *        070-075 SEE brand_xref.csv - NOT THE GW TYPELIST
      *        UNMAPPED OR ABSENT BRAND -> 999999
           05  PR17-BRAND-CODE              PIC X(06).
      *        076-090 PREMIUM OF THE EXPIRING YEAR (ICOBS 6A)
      *        IMPLIED 2DP, TRAILING OVERPUNCH ON NEGATIVES
           05  PR17-PRIOR-PREMIUM           PIC S9(13)V99.
      *        091-105 RENEWAL PREMIUM QUOTED (ICOBS 6A)
           05  PR17-RENEWAL-PREMIUM         PIC S9(13)V99.
      *        106-120 EQUIVALENT NEW BUSINESS PRICE (PS21/5)
           05  PR17-EQUIV-NB-PREMIUM        PIC S9(13)V99.
      *        121-122 NCD YEARS, 00-99 (ABSENT OR NEGATIVE -> 00,
      *        OVER 99 -> 99)
           05  PR17-NCD-YEARS               PIC 9(02).
      *        123 SHOPPING-AROUND PROMPT (ICOBS 6B): Y FROM POLICY
      *        YEAR 4 OF THE RENEWAL BEING INVITED, ELSE N
           05  PR17-SHOPPING-AROUND-FLAG    PIC X(01).
               88  PR17-SHOPPING-AROUND     VALUE 'Y'.
      *        124 CUSTOMER OPTED OUT OF AUTOMATIC RENEWAL
           05  PR17-OPT-OUT-FLAG            PIC X(01).
               88  PR17-OPTED-OUT           VALUE 'Y'.
      *        125-300
           05  AGI-PR17-FILLER              PIC X(176).

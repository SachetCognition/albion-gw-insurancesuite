'use strict';

// Synthetic seed policies. Every value is invented for the offline demo (SYN- references, TESTPERSON surnames).
// Each policy carries the PolicyCenter PolicyPeriod fields read by the eligibility screen and the PS21/5 gate, and
// the ContactManager party fields read by the PRINTV builders, in one map.
// AnnualPremium_Ext is the renewal period's annualised premium: the PS21/5 gate input.
// RiskPostcode_Ext and PolicyNumber_Ext are read as a decimal and a date by the PRINTV layout; the synthetic party
// records leave them unset, so those slots carry the builders' zero-fill.

function policy(ref, o) {
  return {
    ref,
    heritage: false,
    product: o.product,
    renewalDate: o.renewalDate,
    fields: {
      BrandCode_Ext: o.brand,
      InsuredSurname_Ext: o.surname,
      PolicyYear_Ext: o.year,
      PriorPremium_Ext: o.prior,
      RenewalPremium_Ext: o.renewal,
      AnnualPremium_Ext: o.renewal,
      EquivalentNBPremium_Ext: o.nb,
      NCDYears_Ext: o.ncd,
      FeedStatus_Ext: o.feedStatus,
      VulnerabilityNoted_Ext: o.vulnerable ? true : null,
      RenewalOptOut_Ext: null,
      MarketingSuppressed_Ext: null,
      SanctionsHold_Ext: null,
      BereavementHold_Ext: null,
      GDPRErasurePending_Ext: null,
      RiskPostcode_Ext: null,
      PolicyNumber_Ext: null,
    },
  };
}

const JOURNEY_REF = 'SYN-REN-0004';
const BREACH_REF = 'SYN-REN-0002';
const HERITAGE_REF = 'HR12345678A';

function seedPolicies() {
  return [
    policy('SYN-REN-0001', {
      brand: 'ALBDIR', surname: 'TESTPERSON-A', year: 2, prior: '412.30', renewal: '438.10', nb: '441.00',
      ncd: 3, feedStatus: 'SENT', product: 'Private car', renewalDate: '2026-11-14',
    }),
    policy('SYN-REN-0002', {
      brand: 'ALBDIR', surname: 'TESTPERSON-B', year: 5, prior: '520.00', renewal: '610.00', nb: '575.00',
      ncd: 5, feedStatus: 'ACK', product: 'Private car', renewalDate: '2026-11-21',
    }),
    policy('SYN-REN-0003', {
      brand: 'ALBBRK', surname: 'TESTPERSON-C', year: 3, prior: '298.40', renewal: '305.20', nb: '309.00',
      ncd: 2, feedStatus: 'SENT', vulnerable: true, product: 'Home buildings and contents', renewalDate: '2026-11-28',
    }),
    policy('SYN-REN-0004', {
      brand: 'ALBDIR', surname: 'TESTPERSON-D', year: 4, prior: '389.00', renewal: '401.50', nb: '405.00',
      ncd: 4, feedStatus: 'PENDING', product: 'Private car', renewalDate: '2026-12-02',
    }),
    policy('SYN-REN-0005', {
      brand: 'RETPLS', surname: 'TESTPERSON-E', year: 1, prior: '289.99', renewal: '300.00', nb: '300.00',
      ncd: 1, feedStatus: 'SENT', product: 'Home contents', renewalDate: '2026-12-09',
    }),
    {
      ref: HERITAGE_REF,
      heritage: true,
      product: 'Heritage book (POLARIS)',
      renewalDate: null,
      fields: { BrandCode_Ext: 'HERIT', InsuredSurname_Ext: 'TESTPERSON-H' },
    },
  ];
}

module.exports = { seedPolicies, JOURNEY_REF, BREACH_REF, HERITAGE_REF };

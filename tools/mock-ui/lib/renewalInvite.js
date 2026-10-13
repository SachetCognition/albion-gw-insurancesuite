'use strict';

// String-built XML of RenewalInviteServiceV1..V4 (albion.ws.v1..v4) and the PolarisCICSGateway passthrough, per centre.
// PolicyCenter is the default; the ClaimCenter and ContactManager copies differ in the AGI-4001 text, the CICS
// transaction code and their gateway's response.

const HERITAGE_RE = /^[A-Z]{2}[0-9]{8}[A-Z]$/;
const MSG_LONG = 'Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)';
const MSG_SHORT = 'Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13)';
const GATEWAY_NS = 'http://albiongeneral.co.uk/ws/polaris/v1';

const CENTRES = {
  pc: {
    name: 'PolicyCenter',
    source: 'policycenter/config/gsrc/albion/ws/v{n}/RenewalInviteServiceV{n}.gs',
    msg: MSG_LONG,
    transactions: { 1: 'AG90', 2: 'AG29', 3: 'AG19', 4: 'AG39' },
    gateway: 'pc',
  },
  cc: {
    name: 'ClaimCenter',
    source: 'claimcenter/config/gsrc/albion/ws/v{n}/RenewalInviteServiceV{n}.gs',
    msg: MSG_SHORT,
    transactions: { 1: 'AG71', 2: 'AG89', 3: 'AG54', 4: 'AG64' },
    gateway: 'cc',
  },
  cm: {
    name: 'ContactManager',
    source: 'contactmanager/modules/configuration/gsrc/albion/ws/v{n}/RenewalInviteServiceV{n}.gs',
    msg: MSG_LONG,
    transactions: { 3: 'AG18', 4: 'AG76' },
    gateway: 'cm',
  },
};

function namespaceFor(version) {
  return `http://albiongeneral.co.uk/ws/renewalinvite/v${version}`;
}

function errorXml(code, msg) {
  return '<Error><Code>' + code + '</Code><Msg>' + msg + '</Msg></Error>';
}

function normalise(policyNumber) {
  return policyNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function isHeritageRef(policyNumber) {
  return policyNumber !== null && policyNumber !== undefined && HERITAGE_RE.test(normalise(String(policyNumber)));
}

function brandOrDefault(brand) {
  return brand === null || brand === undefined ? 'ALBDIR' : brand;
}

/** RenewalInviteServiceVn.buildResponseXml */
function buildResponseXml(version, ref, brand) {
  return '<?xml version="1.0"?>'
    + '<InviteStatusResponse xmlns="' + namespaceFor(version) + '">'
    + '<Ref>' + ref + '</Ref>'
    + '<Brand>' + brandOrDefault(brand) + '</Brand>'
    + '<Premuim>0.00</Premuim>'
    + '<Status>OK</Status>'
    + '</InviteStatusResponse>';
}

/**
 * Simulated PolarisCICSGateway.enquire(transactionCode, ref, brand) response, per centre copy:
 *  pc - enquireResponse shape; the PC copy's own heritage branch re-enters enquire(), which the simulation does not
 *       reproduce (see README, Simulated behaviour);
 *  cc - AGI-4002 unless the transaction code is AGnn, then enquireResponse;
 *  cm - enquireResponse with <Source>POLARIS</Source><Transaction>..</Transaction> for heritage refs.
 */
function gatewayEnquire(centre, transactionCode, policyNumber, brand) {
  const c = CENTRES[centre];
  if (centre === 'cc' && (transactionCode === null || !/^AG[0-9]{2}$/.test(transactionCode))) {
    return errorXml('AGI-4002', 'CICS transaction code must be AG followed by two digits');
  }
  if (policyNumber === null || policyNumber === undefined || policyNumber.length < 5) {
    return errorXml('AGI-4001', c.msg);
  }
  const ref = normalise(policyNumber);
  let sb = '<?xml version="1.0"?>'
    + '<enquireResponse xmlns="' + GATEWAY_NS + '">'
    + '<Ref>' + ref + '</Ref>'
    + '<Brand>' + brandOrDefault(brand) + '</Brand>'
    + '<Premuim>0.00</Premuim>';
  if (centre === 'cm' && HERITAGE_RE.test(ref)) {
    sb += '<Source>POLARIS</Source><Transaction>' + transactionCode + '</Transaction>';
  }
  return sb + '<Status>OK</Status>' + '</enquireResponse>';
}

function supports(centre, version) {
  const c = CENTRES[centre];
  return Boolean(c && c.transactions[version]);
}

/**
 * RenewalInviteServiceVn.getInviteStatus(policyNumber, brandCode).
 * Returns { xml, route: 'ERROR' | 'GW' | 'CICS', transaction }.
 */
function getInviteStatus(version, policyNumber, brandCode, centre = 'pc') {
  const c = CENTRES[centre];
  if (!supports(centre, version)) throw new Error(`No RenewalInviteServiceV${version} in ${centre}`);
  if (policyNumber === null || policyNumber === undefined || policyNumber.length < 5) {
    return { xml: errorXml('AGI-4001', c.msg), route: 'ERROR', transaction: null };
  }
  const norm = normalise(policyNumber);
  if (HERITAGE_RE.test(norm)) {
    const txn = c.transactions[version];
    return { xml: gatewayEnquire(c.gateway, txn, norm, brandCode), route: 'CICS', transaction: txn };
  }
  return { xml: buildResponseXml(version, norm, brandCode), route: 'GW', transaction: null };
}

module.exports = {
  CENTRES, HERITAGE_RE, MSG_LONG, MSG_SHORT, GATEWAY_NS,
  namespaceFor, errorXml, normalise, isHeritageRef, buildResponseXml, gatewayEnquire, getInviteStatus, supports,
};

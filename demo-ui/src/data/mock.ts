/**
 * MOCK DATA ONLY — nothing here is read from a live system.
 *
 * Shapes are modelled on the committed Phase 2 / Phase 3 artefacts:
 *   tools/ci/reconciliation-status.csv          (124 component x brand gate rows)
 *   docs/reconciliation/PHASE2-RECONCILIATION-STATUS.md
 *   docs/runbooks/PHASE3-CUTOVER-RUNBOOK.md, docs/runbooks/LOAD-TEST-GATES.md
 *   docs/interfaces/interface-contract-inventory.csv
 *   docs/architecture/FEEDSTATUS-STATE-MACHINE.md
 * Values are illustrative demo values for an executive walk-through.
 */

export type Brand = 'ALBDIR' | 'ALBBRK' | 'RETPLS' | 'HERIT'
export type Centre = 'cc' | 'pc' | 'bc' | 'cm'
export type GateStatus = 'GREEN' | 'SHADOW' | 'PENDING' | 'BLOCKED'
export type EnvName = 'dev/sit' | 'uat/preprod' | 'prod'

export const BRANDS: { code: Brand; label: string; note: string }[] = [
  { code: 'ALBDIR', label: 'Albion Direct', note: 'Smallest blast radius — cuts over first' },
  { code: 'ALBBRK', label: 'Albion Broker', note: 'Broker panel volumes, second wave' },
  { code: 'RETPLS', label: 'Retail Partnerships', note: 'White-label partners, third wave' },
  { code: 'HERIT', label: 'Heritage', note: 'Last — no BrandCode_Ext, silent ALBDIR default' },
]

export const CENTRES: Record<Centre, string> = {
  cc: 'ClaimCenter',
  pc: 'PolicyCenter',
  bc: 'BillingCenter',
  cm: 'ContactManager',
}

export interface GateRow {
  feature: string
  component: string
  centre: Centre
  brand: Brand
  status: GateStatus
  goldenMaster: 'GREEN'
  evidence: string
  shadowDays: number
  recordsCompared: number
  diffs: number
}

/** component -> centre, mirroring the 22 record builders + 3 cross-cutting streams. */
const COMPONENTS: { feature: string; component: string; centres: Centre[] }[] = [
  { feature: 'cutover.midrecordbuilder', component: 'MID', centres: ['bc'] },
  { feature: 'cutover.creditrecordbuilder', component: 'Credit', centres: ['bc'] },
  { feature: 'cutover.floodrerecordbuilder', component: 'Flood Re', centres: ['bc'] },
  { feature: 'cutover.iptrecordbuilder', component: 'IPT', centres: ['cc'] },
  { feature: 'cutover.aggrrecordbuilder', component: 'Aggregator', centres: ['cc'] },
  { feature: 'cutover.eltorecordbuilder', component: 'ELTO', centres: ['cc'] },
  { feature: 'cutover.reinsrecordbuilder', component: 'Reinsurance', centres: ['cc'] },
  { feature: 'cutover.sanctionsrecordbuilder', component: 'Sanctions', centres: ['cc'] },
  { feature: 'cutover.dwhrecordbuilder', component: 'DWH', centres: ['pc'] },
  { feature: 'cutover.crifrecordbuilder', component: 'CRIF', centres: ['pc'] },
  { feature: 'cutover.ssprecordbuilder', component: 'SSP', centres: ['pc'] },
  { feature: 'cutover.veriskrecordbuilder', component: 'Verisk', centres: ['pc'] },
  { feature: 'cutover.cifasrecordbuilder', component: 'CIFAS', centres: ['cm'] },
  { feature: 'cutover.cuerecordbuilder', component: 'CUE', centres: ['cm'] },
  { feature: 'cutover.dvlarecordbuilder', component: 'DVLA', centres: ['cm'] },
  { feature: 'cutover.payhubrecordbuilder', component: 'Payhub', centres: ['cm'] },
  { feature: 'cutover.printvrecordbuilder', component: 'Print Vendor', centres: ['cm'] },
  { feature: 'cutover.polarismfrecordbuilder', component: 'POLARIS MF', centres: ['cm'] },
  {
    feature: 'cutover.polarispartyrecordbuilder',
    component: 'POLARIS Party',
    centres: ['cc', 'pc', 'bc', 'cm'],
  },
  { feature: 'cutover.branddirectory', component: 'Brand Directory (3B)', centres: ['cc', 'pc', 'bc', 'cm'] },
  { feature: 'cutover.newratingengine', component: 'Unified Rating (3C)', centres: ['pc'] },
  { feature: 'cutover.feedstatus', component: 'FeedStatus (3D)', centres: ['cc', 'pc', 'bc', 'cm'] },
]

/** Deterministic pseudo-random so the demo looks identical on every run. */
function seeded(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

function statusFor(component: string, brand: Brand, r: number): GateStatus {
  if (component === 'Unified Rating (3C)' && brand === 'HERIT') return 'BLOCKED'
  const brandBias = { ALBDIR: 0.82, ALBBRK: 0.55, RETPLS: 0.3, HERIT: 0.1 }[brand]
  if (r < brandBias - 0.35) return 'GREEN'
  if (r < brandBias + 0.15) return 'SHADOW'
  return 'PENDING'
}

export const GATE_ROWS: GateRow[] = COMPONENTS.flatMap((c) =>
  c.centres.flatMap((centre) =>
    BRANDS.map(({ code: brand }) => {
      const r = seeded(`${c.feature}:${centre}:${brand}`)
      const status = statusFor(c.component, brand, r)
      const shadowDays = status === 'GREEN' ? 28 + Math.round(r * 30) : status === 'SHADOW' ? 3 + Math.round(r * 18) : 0
      return {
        feature: c.feature,
        component: c.component,
        centre,
        brand,
        status,
        shadowDays,
        goldenMaster: 'GREEN' as const,
        evidence:
          status === 'GREEN'
            ? `RECON-ARCHIVE/${centre.toUpperCase()}-${brand}-${c.component.replace(/\W+/g, '').toUpperCase()}-W${shadowDays}`
            : status === 'BLOCKED'
              ? 'blocked: HeritageRenewalInviteBatch still binds @Deprecated *_v1'
              : '',
        recordsCompared: status === 'PENDING' ? 0 : Math.round((0.4 + r) * 1_900_000),
        diffs: status === 'SHADOW' && r > 0.72 ? 1 + Math.round(r * 4) : 0,
      }
    }),
  ),
)

export const GATE_TOTALS = {
  total: GATE_ROWS.length,
  green: GATE_ROWS.filter((r) => r.status === 'GREEN').length,
  shadow: GATE_ROWS.filter((r) => r.status === 'SHADOW').length,
  pending: GATE_ROWS.filter((r) => r.status === 'PENDING').length,
  blocked: GATE_ROWS.filter((r) => r.status === 'BLOCKED').length,
}

export interface EnvGate {
  env: EnvName
  order: number
  unlocked: boolean
  bake: string
  greenRows: number
  note: string
}

export const ENV_PROMOTION: EnvGate[] = [
  {
    env: 'dev/sit',
    order: 1,
    unlocked: true,
    bake: 'One full business cycle incl. month-end',
    greenRows: GATE_TOTALS.green,
    note: 'CutoverRouter routes candidate as authoritative for the flipped brand only',
  },
  {
    env: 'uat/preprod',
    order: 2,
    unlocked: true,
    bake: 'Second bake — surfaces the 3 PROD-only typelist codes (AGI-35347)',
    greenRows: Math.round(GATE_TOTALS.green * 0.55),
    note: 'A later environment can never be enabled before every earlier one',
  },
  {
    env: 'prod',
    order: 3,
    unlocked: false,
    bake: 'Full window covering a renewal peak; MID/IPT/DWH also renewals+catastrophe',
    greenRows: 0,
    note: 'Legacy stays authoritative until the prod bake completes with zero auto-reverts',
  },
]

export interface Interfaces {
  id: string
  name: string
  centre: Centre
  transport: string
  peak: string
  copybook: string
  prefix: string
  width: number
  retry: string
}

export const INTERFACES: Interfaces[] = [
  { id: 'IF-MID-001', name: 'MID', centre: 'bc', transport: 'Nightly SFTP; PGP', peak: '~743k/day', copybook: 'AGIMIDRE.cpy', prefix: 'MI56', width: 600, retry: 'automatic x3 then manual' },
  { id: 'IF-IPT-008', name: 'IPT', centre: 'cc', transport: 'Connect:Direct', peak: '~437k/day', copybook: 'AGIIPTRE.cpy', prefix: 'IP89', width: 512, retry: 'automatic x3 then manual' },
  { id: 'IF-DWH-012', name: 'DWH', centre: 'pc', transport: 'Connect:Direct', peak: '~429k/day', copybook: 'AGIDWHRE.cpy', prefix: 'DW21', width: 300, retry: 'automatic infinite retry' },
  { id: 'IF-PAYHUB-010', name: 'Payhub', centre: 'cm', transport: 'Connect:Direct', peak: '~709k/week', copybook: 'AGIPAYHRE.cpy', prefix: 'PA15', width: 750, retry: 'automatic infinite retry' },
  { id: 'IF-POLARIS_MF-009', name: 'POLARIS MF', centre: 'cm', transport: 'Connect:Direct', peak: '~185k/month', copybook: 'AGIPOLARE.cpy', prefix: 'PO99', width: 512, retry: 'automatic infinite retry' },
  { id: 'IF-ELTO-003', name: 'ELTO', centre: 'cc', transport: 'SOAP over VPN; 8s timeout', peak: '~525k/month', copybook: 'AGIELTORE.cpy', prefix: 'EL82', width: 400, retry: 'manual retry only' },
]

export const THROUGHPUT_BASELINES = [
  { feed: 'MID', centre: 'bc', baseline: 743_000, legacy: 743_000, candidate: 802_000, cutoverMode: 761_000 },
  { feed: 'IPT', centre: 'cc', baseline: 437_000, legacy: 437_000, candidate: 468_000, cutoverMode: 449_000 },
  { feed: 'DWH', centre: 'pc', baseline: 429_000, legacy: 429_000, candidate: 455_000, cutoverMode: 436_000 },
]

export const THROUGHPUT_TREND = [
  { day: 'Mon', legacy: 712, candidate: 768, peak: 743 },
  { day: 'Tue', legacy: 726, candidate: 781, peak: 743 },
  { day: 'Wed', legacy: 735, candidate: 792, peak: 743 },
  { day: 'Thu', legacy: 741, candidate: 803, peak: 743 },
  { day: 'Fri (renewals)', legacy: 758, candidate: 826, peak: 743 },
  { day: 'Sat (cat event)', legacy: 771, candidate: 848, peak: 743 },
  { day: 'Sun', legacy: 704, candidate: 759, peak: 743 },
]

export const PARITY_TREND = [
  { week: 'W1', compared: 4.1, diffs: 9, autoReverts: 9 },
  { week: 'W2', compared: 5.4, diffs: 4, autoReverts: 4 },
  { week: 'W3', compared: 6.2, diffs: 2, autoReverts: 2 },
  { week: 'W4', compared: 6.9, diffs: 1, autoReverts: 1 },
  { week: 'W5', compared: 7.4, diffs: 0, autoReverts: 0 },
  { week: 'W6 (month-end)', compared: 9.1, diffs: 0, autoReverts: 0 },
  { week: 'W7', compared: 7.8, diffs: 0, autoReverts: 0 },
  { week: 'W8', compared: 8.0, diffs: 0, autoReverts: 0 },
]

export const ROLLBACK_DRILLS = [
  { id: 'DRILL-014', scope: 'bc / MID / ALBDIR', trigger: 'Flag off (planned drill)', detected: '—', reverted: '11 s', dataChanges: 0, deploy: 'none' },
  { id: 'DRILL-015', scope: 'cc / IPT / ALBDIR', trigger: 'Injected overpunch diff', detected: '1 record', reverted: 'per-record, inline', dataChanges: 0, deploy: 'none' },
  { id: 'DRILL-016', scope: 'cm / Payhub / ALBBRK', trigger: 'Candidate exception', detected: '3 records', reverted: 'per-record, inline', dataChanges: 0, deploy: 'none' },
  { id: 'DRILL-017', scope: 'pc / DWH / ALBDIR', trigger: 'Flag off mid-batch', detected: '—', reverted: '9 s', dataChanges: 0, deploy: 'none' },
]

export interface JourneyStep {
  title: string
  actor: string
  detail: string
  artefact?: string
  status?: string
}

export interface Journey {
  id: string
  name: string
  tagline: string
  outcome: string
  steps: JourneyStep[]
}

export const JOURNEYS: Journey[] = [
  {
    id: 'fnol',
    name: 'FNOL → Claim → POLARIS feed',
    tagline: 'Customer reports a loss at 21:04; the mainframe hears about it the same night.',
    outcome: 'Claim registered, MID + IPT fixed-width records delivered inside the regulatory window.',
    steps: [
      { title: 'First Notice of Loss', actor: 'Customer / Albion Direct', detail: 'Motor incident captured in ClaimCenter FNOL wizard; brand stamped ALBDIR.', artefact: 'ClaimCenter FNOL' },
      { title: 'Claim created', actor: 'ClaimCenter', detail: 'Claim CLM-4471902 opened, reserves set, contact matched to the Golden Party record.', artefact: 'CLM-4471902' },
      { title: 'Feed row queued', actor: 'FeedStatus_Ext', detail: 'Rule assigns FeedStatus_Ext = PENDING — one of 222 rules that write this status.', status: 'PENDING' },
      { title: 'Nightly builder run', actor: 'IptRecordBuilder / MidRecordBuilder', detail: 'Legacy builder emits the record; candidate builds the same bytes beside it under ShadowRunner.', artefact: 'AGIIPTRE.cpy · 512 bytes' },
      { title: 'Byte-exact reconciliation', actor: 'ShadowRunner', detail: 'Candidate bytes compared to legacy bytes. Any difference → ReconciliationResult + auto-revert to legacy.', status: 'MATCH' },
      { title: 'Delivered to POLARIS', actor: 'Connect:Direct / SFTP', detail: 'Fixed-width record lands on the mainframe; status moves PENDING → SENT.', status: 'SENT' },
      { title: 'Mainframe acknowledges', actor: 'POLARIS', detail: 'ACK returned and recorded. A NAK would route to the ops NAK queue with x3 automatic retry.', status: 'ACK' },
    ],
  },
  {
    id: 'renewal',
    name: 'Renewal → PS21/5 price-walk check',
    tagline: 'Regulated renewal pricing, proven identical before the new engine is trusted.',
    outcome: 'Renewal invited at a PS21/5-compliant price; any breach persisted for audit, rating output untouched.',
    steps: [
      { title: 'Renewal invited', actor: 'PolicyCenter', detail: 'Policy POL-88213 enters the renewal window 28 days out; brand ALBBRK.', artefact: 'POL-88213' },
      { title: 'Legacy rating', actor: 'Legacy engine (x2)', detail: 'Both legacy engines rate the renewal — the authoritative price for now.', artefact: '£742.18' },
      { title: 'Candidate rating', actor: 'Unified rating candidate', detail: 'New engine rates the same risk in shadow. Output compared, never used yet.', artefact: '£742.18' },
      { title: 'PS21/5 price-walk test', actor: 'Compliance control', detail: 'Renewal price compared to the equivalent new-business price for the same risk.', status: 'PASS' },
      { title: 'Breach persistence', actor: 'ComplianceBreach_Ext', detail: 'Any breach persisted side-effect-only — persistence never alters rating output.', status: 'NONE' },
      { title: 'Actuarial sign-off gate', actor: 'Human gate (3C)', detail: 'Rating cut-over additionally needs explicit actuarial sign-off; it is not automatable.', status: 'HELD' },
      { title: 'Invite issued', actor: 'Print vendor', detail: 'Renewal invite rendered and dispatched; heritage invites still run the *_v1 signatures.', artefact: 'AGIPRINRE.cpy' },
    ],
  },
  {
    id: 'payment',
    name: 'Payment → Payhub',
    tagline: 'Money moves on the legacy rails until the candidate has earned the traffic.',
    outcome: 'Collection taken, Payhub record delivered, ledger and feed status in step.',
    steps: [
      { title: 'Direct Debit due', actor: 'BillingCenter', detail: 'Instalment due on account BA-30918; BACS collection scheduled.', artefact: 'BA-30918' },
      { title: 'Payment instruction', actor: 'AGIB137D Group Payment Hub', detail: 'BACS / DD / Faster Payments instruction assembled for the payment hub.', artefact: 'AGIB137D' },
      { title: 'Payhub record built', actor: 'PayhubRecordBuilder', detail: '750-byte fixed-width record, PA15 prefix, brand in the trailing 6 bytes.', artefact: 'AGIPAYHRE.cpy · 750 bytes' },
      { title: 'Shadow comparison', actor: 'ShadowRunner', detail: 'Candidate record diffed byte-for-byte against legacy before anything leaves.', status: 'MATCH' },
      { title: 'Delivered', actor: 'Connect:Direct', detail: 'Record transmitted; FeedStatus_Ext PENDING → SENT.', status: 'SENT' },
      { title: 'Cash allocated', actor: 'BillingCenter', detail: 'Receipt applied, arrears cleared, dunning suppressed for the cycle.', status: 'ACK' },
    ],
  },
]

export const FEED_STATES = [
  { code: 'PENDING', label: 'Queued by rules', detail: 'All 29 batches select it; all 222 rules assign it. Unbounded query — 1.4M heritage rows at risk.' },
  { code: 'SENT', label: 'Delivered to POLARIS', detail: 'Written by 7 batches and 3 SQL data fixes.' },
  { code: 'ACK', label: 'Mainframe accepted', detail: 'Declared on all 14 entity extensions; no producer exists in the repository today.' },
  { code: 'NAK', label: 'Mainframe rejected', detail: 'Declared but unproduced; NAK queues are operational (Excel macro in one case).' },
  { code: 'ESCALATED', label: 'Aged out to ops', detail: 'Written by 10 age-based batches.' },
]

export const FEED_SIDE_STATES = [
  { code: 'CLEAR', detail: 'Manual SQL data fix — 6 scripts' },
  { code: 'MATCHED', detail: 'Manual SQL data fix — 5 scripts' },
  { code: 'FIXED_BY_SQL', detail: 'Provenance marker — 6 scripts' },
]

export interface ShadowRecord {
  ref: string
  brand: Brand
  legacy: string
  candidate: string
}

/** Fixed-width MID records (trimmed to 60 cols for the demo view). */
export const SHADOW_RECORDS: ShadowRecord[] = [
  { ref: 'POL-88213', brand: 'ALBDIR', legacy: 'MI56POL882130000074218000000000012994520260318ALBDIR', candidate: 'MI56POL882130000074218000000000012994520260318ALBDIR' },
  { ref: 'POL-88214', brand: 'ALBDIR', legacy: 'MI56POL882140000031050000000000009120020260318ALBDIR', candidate: 'MI56POL882140000031050000000000009120020260318ALBDIR' },
  { ref: 'POL-88215', brand: 'ALBBRK', legacy: 'MI56POL882150000118875000000000024410020260318ALBBRK', candidate: 'MI56POL882150000118875000000000024410020260318ALBBRK' },
  { ref: 'CLM-4471902', brand: 'ALBDIR', legacy: 'MI56CLM447190200000{9420000000000031877020260318ALBDIR', candidate: 'MI56CLM447190200000-9420000000000031877020260318ALBDIR' },
  { ref: 'POL-88216', brand: 'RETPLS', legacy: 'MI56POL882160000062400000000000018330020260318RETPLS', candidate: 'MI56POL882160000062400000000000018330020260318RETPLS' },
]

export const HEADLINE_STATS = [
  { label: 'Cut-over gate rows', value: '124', sub: 'component × brand, CI-enforced' },
  { label: 'Interfaces in scope', value: '18', sub: '22 record builders to POLARIS' },
  { label: 'Records diffed in shadow', value: '58.9M', sub: 'byte-exact, zero tolerance' },
  { label: 'Business changes required', value: '0', sub: 'external strings never change' },
]

export const PRINCIPLES = [
  {
    title: 'Legacy stays authoritative',
    body: 'Nothing is switched on because it looks finished. The legacy builder keeps producing the bytes that leave Albion until parity is proven over real traffic.',
  },
  {
    title: 'Parity is evidence, not opinion',
    body: 'Golden-master parity in CI plus a sustained non-prod shadow window with zero unexplained diffs. Record builders are byte-exact; only month-end IPT counts carry a documented <0.1% tolerance.',
  },
  {
    title: 'Rollback is a flag, not a project',
    body: 'Every cut-over is one feature flag per component per brand. Rollback is turning it off — no deploy, no data change, byte-invisible downstream.',
  },
  {
    title: 'Smallest blast radius first',
    body: 'ALBDIR → ALBBRK → RETPLS → HERIT, and dev/sit → uat/preprod → prod. CI refuses a later environment before every earlier one is green.',
  },
]

export const RISK_REGISTER = [
  { risk: 'Heritage rows carry no BrandCode_Ext', control: 'Pinned brandOf(null) = ALBDIR behaviour; HERIT flips last', severity: 'high' },
  { risk: 'brandMap() duplicated vs brand_xref.csv', control: 'CI cross-check csv ↔ BrandDirectoryCandidate.XREF_ROWS', severity: 'medium' },
  { risk: 'Negative overpunch digit 9 throws', control: 'Characterization fixture pinned; candidate reproduces the throw exactly', severity: 'medium' },
  { risk: 'Unbounded PENDING query (1.4M rows)', control: 'Bounded/resumable selection shipped separately, after 3D flip', severity: 'high' },
  { risk: 'Double scheduling (Control-M vs scheduler-config)', control: 'Single active scheduler per environment, individually gated', severity: 'medium' },
  { risk: '3 PROD-only typelist codes (AGI-35347)', control: 'Treated as diffs in uat/preprod bake, not surprises in prod', severity: 'low' },
]

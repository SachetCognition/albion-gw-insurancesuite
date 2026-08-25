/**
 * MOCK DATA ONLY — nothing here is read from a live system.
 *
 * Shapes and headline figures are taken from the committed Phase 2 / Phase 3A artefacts:
 *   tools/ci/reconciliation-status.csv          (124 component x brand gate rows, all GREEN_REPLAY)
 *   docs/reconciliation/PHASE2-REPLAY-EVIDENCE.md  (14,069 replay cases, 0 failures)
 *   docs/reconciliation/PHASE2-RECONCILIATION-STATUS.md
 *   docs/runbooks/PHASE3-CUTOVER-RUNBOOK.md, docs/runbooks/LOAD-TEST-GATES.md
 *   environments/dev/*.properties               (88 cut-over flags enabled in dev only)
 *   docs/interfaces/interface-contract-inventory.csv
 *   docs/architecture/FEEDSTATUS-STATE-MACHINE.md
 * Per-record counts, bake timelines and drill logs are illustrative demo values.
 */

export type Brand = 'ALBDIR' | 'ALBBRK' | 'RETPLS' | 'HERIT'
export type Centre = 'cc' | 'pc' | 'bc' | 'cm'
/** Gate statuses as defined in tools/ci/reconciliation-status.csv. */
export type GateStatus = 'GREEN' | 'GREEN_REPLAY' | 'PENDING' | 'BLOCKED'
export type EnvName = 'dev' | 'sit' | 'uat/preprod' | 'prod'
/** What the router does for a component x brand in a given environment. */
export type CellState = 'CUTOVER' | 'SHADOW' | 'LEGACY'

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
  /** Archived offline-replay evidence backing the GREEN_REPLAY row. */
  evidence: string
  /** Replay cases executed for this component x brand (offline, tolerance 0). */
  replayCases: number
  replayFailures: 0
  /** True for the 22 record builders whose dev cut-over flag is enabled. */
  devCutover: boolean
  /** Days of sustained LIVE non-prod shadow — the only thing that turns a row GREEN. */
  liveShadowDays: number
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

const CENTRE_EVIDENCE: Record<Centre, string> = {
  cc: 'tools/replay/evidence/claimcenter-builders-replay.log.gz + claimcenter-bench.log',
  pc: 'tools/replay/evidence/policycenter-builders-replay.log.gz + policycenter-bench.log',
  bc: 'tools/replay/evidence/billingcenter-builders-replay.log.gz + billingcenter-bench.log',
  cm: 'tools/replay/evidence/contactmanager-builders-replay.log.gz + contactmanager-bench.log',
}

const CENTRE_NAME: Record<Centre, string> = {
  cc: 'claimcenter',
  pc: 'policycenter',
  bc: 'billingcenter',
  cm: 'contactmanager',
}

function evidenceFor(feature: string, centre: Centre): string {
  if (feature === 'cutover.newratingengine') return 'tools/replay/evidence/policycenter-rating-replay.log.gz'
  if (feature === 'cutover.branddirectory' || feature === 'cutover.feedstatus') {
    return `tools/replay/evidence/${CENTRE_NAME[centre]}-brand-feedstatus-replay.log.gz`
  }
  return CENTRE_EVIDENCE[centre]
}

/** Streams 3B/3C/3D stay comparator-only in dev: they must not interleave with the 3A bake. */
const CONVERGENCE_FEATURES = ['cutover.branddirectory', 'cutover.newratingengine', 'cutover.feedstatus']

export const GATE_ROWS: GateRow[] = COMPONENTS.flatMap((c) =>
  c.centres.flatMap((centre) =>
    BRANDS.map(({ code: brand }) => {
      const r = seeded(`${c.feature}:${centre}:${brand}`)
      const isBuilder = !CONVERGENCE_FEATURES.includes(c.feature)
      return {
        feature: c.feature,
        component: c.component,
        centre,
        brand,
        // Phase 3A: every row carries offline replay evidence — dev only, never prod.
        status: 'GREEN_REPLAY' as const,
        goldenMaster: 'GREEN' as const,
        evidence: evidenceFor(c.feature, centre),
        replayCases: 40 + Math.round(r * 180),
        replayFailures: 0 as const,
        devCutover: isBuilder,
        liveShadowDays: 0,
        recordsCompared: isBuilder ? Math.round((0.4 + r) * 190_000) : 0,
        diffs: 0,
      }
    }),
  ),
)

export const GATE_TOTALS = {
  total: GATE_ROWS.length,
  greenReplay: GATE_ROWS.filter((r) => r.status === 'GREEN_REPLAY').length,
  green: GATE_ROWS.filter((r) => r.status === 'GREEN').length,
  pending: GATE_ROWS.filter((r) => r.status === 'PENDING').length,
  devCutover: GATE_ROWS.filter((r) => r.devCutover).length,
  devShadowOnly: GATE_ROWS.filter((r) => !r.devCutover).length,
}

/** What the router does for a row in a given environment. Only dev has flags enabled. */
export function cellState(row: GateRow, env: EnvName): CellState {
  if (env !== 'dev') return 'LEGACY'
  return row.devCutover ? 'CUTOVER' : 'SHADOW'
}

/** The evidence ladder that governs where a cut-over flag may be true. */
export const EVIDENCE_LADDER: { status: GateStatus | 'GOLDEN'; evidence: string; permits: string }[] = [
  { status: 'GOLDEN', evidence: 'Golden-master fixtures in CI', permits: 'nothing on its own — entry ticket to shadow' },
  { status: 'PENDING', evidence: 'none', permits: 'no environment' },
  { status: 'GREEN_REPLAY', evidence: 'Offline replay reconciliation + benchmark (14,069 cases, 0 failures)', permits: 'dev only' },
  { status: 'GREEN', evidence: 'Sustained live non-prod shadow window + load test', permits: 'dev → sit → uat/preprod → prod' },
]

/** Straight from docs/reconciliation/PHASE2-REPLAY-EVIDENCE.md. */
export const REPLAY_STREAMS = [
  { id: '2A', name: '22 record builders', detail: 'Byte-exact, tolerance 0, on the real legacy and candidate Gosu classes through the real ShadowRunner', cases: 5140, failures: 0 },
  { id: '2B/2D', name: 'Brand single-source + FeedStatus state machine', detail: '447 canonical brandOf() copies, all 22 brandMap() tables, 29 scanned batch consumer contracts x prior status x threshold ages', cases: 7351, failures: 0 },
  { id: '2C', name: 'Unified rating engine', detail: 'All four legacy engines vs the candidate across every pinned PS21/5 threshold, incl. the @Deprecated *_v1 signatures', cases: 1578, failures: 0 },
]

export const REPLAY_BY_CENTRE = [
  { centre: 'ClaimCenter', cases: 1380, builders: 'AGGR, ELTO, IPT, POLARIS, REINS, SANCTIONS' },
  { centre: 'BillingCenter', cases: 942, builders: 'CREDIT, FLOODRE, MID, POLARIS' },
  { centre: 'PolicyCenter', cases: 1172, builders: 'CRIF, DWH, POLARIS, SSP, VERISK' },
  { centre: 'ContactManager', cases: 1646, builders: 'CIFAS, CUE, DVLA, PAYHUB, POLARIS, POLARIS_MF, PRINTV' },
]

/** Why replay evidence can never turn a row GREEN. */
export const REPLAY_LIMITS = [
  'Entity-level behaviour: real KeyableBean entities, typelists, bundles, LastBatchRun_Ext persistence, the ComplianceBreach_Ext write path',
  'Licensed-compiler compatibility (gwb compile / GUnit) and plugin wiring',
  'Production-only data: the 3 prod-only typelist codes (AGI-35347) and real POLARIS rows',
  'Live scheduling — Control-M versus scheduler-config.xml, and the real batch windows',
  'Production-scale load: the JVM micro-benchmark is a proxy, not the load test',
]

/** Harness self-checks: mutated inputs must fail, or green means nothing. */
export const HARNESS_SELF_CHECKS = [
  { probe: 'Mutated golden fixture', expected: '1 failure — GOLDEN MISMATCH', result: 'detected' },
  { probe: 'Mutated brand mapping + escalation threshold', expected: '7 failures — SCAN-DRIFT / BREACH', result: 'detected' },
]

export interface EnvGate {
  env: EnvName
  order: number
  /** Cut-over flags actually enabled in this environment today. */
  flagsEnabled: number
  state: 'CUT OVER' | 'ON LEGACY'
  requires: string
  bake: string
  note: string
}

export const ENV_PROMOTION: EnvGate[] = [
  {
    env: 'dev',
    order: 1,
    flagsEnabled: 88,
    state: 'CUT OVER',
    requires: 'GREEN_REPLAY row + cited archived evidence',
    bake: 'In bake now — 22 builders x 4 brands, candidate authoritative',
    note: 'Legacy runs as the reverse shadow on every record: any diff auto-alerts and auto-reverts that record to legacy bytes',
  },
  {
    env: 'sit',
    order: 2,
    flagsEnabled: 0,
    state: 'ON LEGACY',
    requires: 'GREEN — live shadow window with zero unexplained diffs',
    bake: 'One full business cycle incl. month-end',
    note: 'CI fails the build if a sit cut-over flag is true while the row is only GREEN_REPLAY (negative-tested)',
  },
  {
    env: 'uat/preprod',
    order: 3,
    flagsEnabled: 0,
    state: 'ON LEGACY',
    requires: 'GREEN + every earlier environment green',
    bake: 'Second bake — surfaces the 3 prod-only typelist codes (AGI-35347)',
    note: 'Entity-level behaviour and licensed-compiler wiring get proven here — replay cannot reach them',
  },
  {
    env: 'prod',
    order: 4,
    flagsEnabled: 0,
    state: 'ON LEGACY',
    requires: 'GREEN + load test at renewal+catastrophe peak',
    bake: 'Full window covering a renewal peak; MID/IPT/DWH also renewals+catastrophe',
    note: 'prod and dr stay hard-blocked by CI while any row is short of GREEN',
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

/** Dev bake since the 3A flip: records the candidate produced, and reverse-shadow auto-reverts. */
export const DEV_BAKE = [
  { day: 'D1', records: 1.9, autoReverts: 0 },
  { day: 'D2', records: 2.1, autoReverts: 0 },
  { day: 'D3', records: 2.0, autoReverts: 0 },
  { day: 'D4', records: 2.4, autoReverts: 0 },
  { day: 'D5 (month-end)', records: 3.6, autoReverts: 0 },
  { day: 'D6', records: 2.2, autoReverts: 0 },
  { day: 'D7', records: 2.0, autoReverts: 0 },
]

/** Micro-benchmark from the *-bench.log files: 100,000 iterations per builder, same JVM. */
export const BENCH_NS_PER_OP = [
  { builder: 'MID', legacy: 3410, candidate: 3180 },
  { builder: 'IPT', legacy: 2980, candidate: 2740 },
  { builder: 'DWH', legacy: 1920, candidate: 1810 },
  { builder: 'Payhub', legacy: 3290, candidate: 3120 },
  { builder: 'POLARIS Party', legacy: 2610, candidate: 2450 },
  { builder: 'Print Vendor', legacy: 2240, candidate: 2170 },
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
  { label: 'Replay cases reconciled', value: '14,069', sub: '0 failures — real classes, tolerance 0' },
  { label: 'Gate rows on evidence', value: '124 / 124', sub: 'all GREEN_REPLAY — dev only, never prod' },
  { label: 'Cut-over flags live in dev', value: '88', sub: '22 builders × 4 brands, legacy reverse-shadowing' },
  { label: 'Business changes required', value: '0', sub: 'external strings never change' },
]

export const PHASE3A_STATE = {
  headline: 'Dev is cut over. Everything beyond dev is still legacy — on purpose.',
  replayCases: 14069,
  replayFailures: 0,
  devFlags: 88,
  greenReplayRows: 124,
  greenRows: 0,
  bullets: [
    'All 124 gate rows are GREEN_REPLAY: offline replay reconciliation ran the real legacy and candidate classes through the real ShadowRunner at tolerance 0 — 14,069 cases, 0 failures, archived under tools/replay/evidence/.',
    'That evidence is deliberately capped at dev. CI fails the build if a sit, uat, preprod or prod cut-over flag is true while the row is only GREEN_REPLAY — negative-tested, not assumed.',
    'In dev the candidate is authoritative for all 22 builders across all 4 brands, with the legacy builder running as reverse shadow: any divergent record auto-alerts and auto-reverts to legacy bytes.',
    'GREEN — and therefore promotion — still needs a sustained live non-prod shadow window plus the load test at renewal+catastrophe peak.',
  ],
}

export const PRINCIPLES = [
  {
    title: 'Legacy stays authoritative where customers are',
    body: 'Nothing is switched on because it looks finished. Every environment that touches customers still emits legacy bytes; dev is the only place the candidate is authoritative, and even there legacy runs behind it as the reverse shadow.',
  },
  {
    title: 'Evidence has grades, and grades have limits',
    body: 'GREEN_REPLAY is offline replay of the real classes — strong enough for dev, and explicitly not enough for anything else. Only a sustained live window plus the load test earns GREEN and the right to promote.',
  },
  {
    title: 'Rollback is a flag, not a project',
    body: 'Every cut-over is one feature flag per component per brand. Rollback is turning it off — no deploy, no data change, byte-invisible downstream.',
  },
  {
    title: 'Smallest blast radius first',
    body: 'ALBDIR → ALBBRK → RETPLS → HERIT, and dev → sit → uat/preprod → prod. CI refuses a later environment before every earlier one is green, and keeps prod and dr dormant.',
  },
]

export const RISK_REGISTER = [
  { risk: 'Heritage rows carry no BrandCode_Ext', control: 'Pinned brandOf(null) = ALBDIR behaviour; HERIT flips last', severity: 'high' },
  { risk: 'brandMap() duplicated vs brand_xref.csv', control: 'CI cross-check csv ↔ BrandDirectoryCandidate.XREF_ROWS', severity: 'medium' },
  { risk: 'Negative overpunch digit 9 throws', control: 'Characterization fixture pinned; candidate reproduces the throw exactly', severity: 'medium' },
  { risk: 'Unbounded PENDING query (1.4M rows)', control: 'Bounded/resumable selection shipped separately, after 3D flip', severity: 'high' },
  { risk: 'Double scheduling (Control-M vs scheduler-config)', control: 'Single active scheduler per environment, individually gated', severity: 'medium' },
  { risk: '3 PROD-only typelist codes (AGI-35347)', control: 'Out of reach of replay — surfaced in the uat/preprod bake, not in prod', severity: 'low' },
  { risk: 'Replay evidence mistaken for live parity', control: 'GREEN_REPLAY is a distinct CI status that permits dev only; prod/dr hard-blocked', severity: 'high' },
]

export type CentreCode = 'cc' | 'pc' | 'bc' | 'cm'

export interface CheckResult {
  command: string
  passed: boolean
  output: string
}

export interface DriftCheck extends CheckResult {
  typelists: number
  typecodes: number
  xrefRows: number
  serviceFiles: number
  centres: number
  keys: number
  envFiles: number
}

export interface CoherenceCheck extends CheckResult {
  totalFindings: number | null
  categories: { code: string; name: string; count: number; warning: boolean }[]
}

export interface Centre {
  code: CentreCode
  name: string
  purpose: string
  path: string
  ruleSets: number
  rules: number
  ruleFamilies: { family: string; rules: number }[]
  legacyRuleIds: string[]
  activityPatterns: number
  screens: number
  gosuClasses: number
  unitTests: number
  entityExtensions: number
  encryptedColumns: number
  pluginRegistrations: number
  encryptionPlugin: boolean
  outboundDestinations: number
  transports: string[]
}

export interface Interface {
  id: string
  name: string
  description: string
  centre: CentreCode
  copybook: string
  recordBuilder: string
  transport: string
  transportKind: string
  volume: string
  volumeK: number | null
  volumePeriod: 'day' | 'week' | 'month' | null
  approxMonthlyK: number | null
  retry: string
  recordWidth: number | null
  recordPrefix: string | null
  layout: { field: string; format: string | null; width: number | null }[]
  copybookFields: number
  samples: Record<string, number>
  specVersions: number
}

export interface BatchJob {
  job: string
  member: string
  definition: string
  area: string
  node: string
  description: string
  cadence: 'Nightly' | 'Weekly' | 'Month-end' | 'Other'
  conditions: string[]
}

export interface Journey {
  id: string
  title: string
  lineOfBusiness: string
  brands: string
  regulation: string
  steps: { title: string; detail: string }[]
  systems: { system: string; role: string }[]
  knownIssues: string
  lastVerified: string | null
  changes: { date: string; ticket: string; change: string }[]
  source: string
}

export interface RepoFacts {
  generatedAt: string
  commit: string
  commitDate: string
  checks: { drift: DriftCheck; coherence: CoherenceCheck }
  pipelineStages: string[]
  centres: Centre[]
  totals: {
    rules: number
    ruleSets: number
    activityPatterns: number
    screens: number
    gosuClasses: number
    unitTests: number
    encryptedColumns: number
    outboundDestinations: number
    copybooks: number
    fieldMaps: number
    sampleMessages: number
    runbooks: number
    sqlFixes: number
  }
  interfaces: Interface[]
  batch: {
    application: string
    jobs: BatchJob[]
    scheduledJcl: number
    onRequestJcl: number
    nodes: string[]
    externalConditions: string[]
    jobsWithJcl: number
  }
  environments: {
    environments: string[]
    templates: number
    distinctVaultTokens: number
    vaultTokenReferences: number
    encryptionKeyTokens: string[]
  }
  brands: { polarisCode: string; brand: string; description: string; notes: string }[]
  brandLabels: Record<string, string>
  journeys: Journey[]
  feedStatus: {
    source: string
    baselineConsumers: number | null
    consumers: { type: string; count: number; behaviour: string }[]
    literals: { literal: string; classification: string; use: string }[]
  }
  controls: { source: string; controls: string[]; reconciliationTolerance: string | null }
  estate: {
    source: string
    gaps: { title: string; detail: string }[]
    systemicIssues: string[]
  }
}

/*
 * Migration evidence (Phase 2 shadow run, reconciliation, Phase 3 cutover).
 * Nothing of this kind is committed yet; screens show an empty state until a JSON file
 * matching EvidenceFile is placed in src/data/evidence/. See README.md.
 */
export type Authority = 'CURRENT' | 'SHADOW' | 'NEW'

export interface ShadowRunResult {
  interfaceId: string
  brand: string
  environment: string
  windowStart: string
  windowEnd: string
  recordsCompared: number
  mismatches: number
  source: string
}

export interface ReconciliationResult {
  control: string
  environment: string
  period: string
  status: 'MATCHED' | 'BREAK'
  detail?: string
  source: string
}

export interface CutoverState {
  interfaceId: string
  brand: string
  environment: string
  authority: Authority
  since: string
  source: string
}

export interface EvidenceFile {
  shadowRuns?: ShadowRunResult[]
  reconciliation?: ReconciliationResult[]
  cutover?: CutoverState[]
}

export interface MigrationEvidence {
  sources: string[]
  shadowRuns: ShadowRunResult[]
  reconciliation: ReconciliationResult[]
  cutover: CutoverState[]
}

import type { EvidenceFile, MigrationEvidence } from './types'

// Any *.json dropped into ./evidence/ is merged here at build time, so shadow-run, reconciliation and
// cutover output can be wired in without touching the screens.
const files = import.meta.glob<EvidenceFile>('./evidence/*.json', { eager: true, import: 'default' })

export const EVIDENCE: MigrationEvidence = Object.entries(files).reduce<MigrationEvidence>(
  (acc, [path, f]) => ({
    sources: [...acc.sources, path.replace('./evidence/', 'src/data/evidence/')],
    shadowRuns: [...acc.shadowRuns, ...(f.shadowRuns ?? [])],
    reconciliation: [...acc.reconciliation, ...(f.reconciliation ?? [])],
    cutover: [...acc.cutover, ...(f.cutover ?? [])],
  }),
  { sources: [], shadowRuns: [], reconciliation: [], cutover: [] },
)

export const HAS_SHADOW = EVIDENCE.shadowRuns.length > 0
export const HAS_RECON = EVIDENCE.reconciliation.length > 0
export const HAS_CUTOVER = EVIDENCE.cutover.length > 0

export function authorityOf(interfaceId: string, brand: string, environment: string) {
  return (
    EVIDENCE.cutover.find((c) => c.interfaceId === interfaceId && c.brand === brand && c.environment === environment)
      ?.authority ?? 'CURRENT'
  )
}

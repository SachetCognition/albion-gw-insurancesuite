import raw from './repo-facts.json'
import type { CentreCode, RepoFacts } from './types'

export const FACTS = raw as RepoFacts

export const CENTRE_NAME = Object.fromEntries(FACTS.centres.map((c) => [c.code, c.name])) as Record<CentreCode, string>

export const BRANDS = Object.entries(FACTS.brandLabels).map(([code, label]) => ({
  code,
  label,
  polarisCodes: FACTS.brands.filter((b) => b.brand === code && !b.notes.startsWith('RETIRED')).map((b) => b.polarisCode),
}))

export const TRANSPORT_PLUGINS = [...new Set(FACTS.centres.flatMap((c) => c.transports))].sort()

export const MONTHLY_RECORDS_K = FACTS.interfaces.reduce((a, i) => a + (i.approxMonthlyK ?? 0), 0)

export const fmt = (n: number) => n.toLocaleString('en-GB')

export const plain = (s: string) => s.replace(/`/g, '')

export const retryPolicy = (s: string) => s.split(';').pop()?.trim() ?? s

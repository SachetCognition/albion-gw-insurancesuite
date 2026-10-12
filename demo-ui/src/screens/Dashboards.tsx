import clsx from 'clsx'
import { Bar, EmptyEvidence, Panel, ScreenHeader, Source, Stat } from '../components/ui'
import { BRANDS, CENTRE_NAME, FACTS, MONTHLY_RECORDS_K, fmt } from '../data/facts'
import { EVIDENCE, HAS_CUTOVER, HAS_RECON, HAS_SHADOW } from '../data/evidence'

const byVolume = [...FACTS.interfaces].sort((a, b) => (b.approxMonthlyK ?? 0) - (a.approxMonthlyK ?? 0))
const maxVolume = byVolume[0]?.approxMonthlyK ?? 0
const FAMILY_TONES = ['bg-gold-500', 'bg-candidate', 'bg-sky-400', 'bg-violet-400', 'bg-emerald-400', 'bg-rose-400']
const families = [...new Set(FACTS.centres.flatMap((c) => c.ruleFamilies.map((f) => f.family)))].sort()
const maxRules = Math.max(...FACTS.centres.map((c) => c.rules))

const count = <T,>(xs: T[], key: (x: T) => string) =>
  Object.entries(xs.reduce<Record<string, number>>((a, x) => ({ ...a, [key(x)]: (a[key(x)] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])
const transportMix = count(FACTS.interfaces, (i) => i.transportKind)
const cadenceMix = count(FACTS.batch.jobs, (j) => j.cadence)
const fixtureMix = Object.entries(
  FACTS.interfaces.reduce<Record<string, number>>((a, i) => {
    Object.entries(i.samples).forEach(([k, n]) => (a[k] = (a[k] ?? 0) + n))
    return a
  }, {}),
).sort((a, b) => b[1] - a[1])

const shadowCompared = EVIDENCE.shadowRuns.reduce((a, r) => a + r.recordsCompared, 0)
const shadowMismatches = EVIDENCE.shadowRuns.reduce((a, r) => a + r.mismatches, 0)
const reconBreaks = EVIDENCE.reconciliation.filter((r) => r.status === 'BREAK').length
const switched = EVIDENCE.cutover.filter((c) => c.authority === 'NEW').length

function Mix({ rows, tone = 'gold' }: { rows: [string, number][]; tone?: 'gold' | 'teal' }) {
  const max = Math.max(...rows.map((r) => r[1]))
  return (
    <div className="space-y-2.5">
      {rows.map(([k, n]) => (
        <div key={k}>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">{k.replace('_', ' ')}</span>
            <span className="tabular-nums text-white">{n}</span>
          </div>
          <div className="mt-1">
            <Bar value={n} max={max} tone={tone} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboards() {
  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="05 · Dashboards"
        title="The estate in numbers, and the scorecard for what comes next"
        lede="The top half is measured from the repository today. The bottom half is the Phase 2/3 scorecard the board will see: parity, reconciliation and cutover. It stays empty until evidence is committed."
        aside={
          <div className="panel px-5 py-4 text-left">
            <div className="eyebrow">Outbound volume</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              ≈{fmt(Math.round(MONTHLY_RECORDS_K / 1000))}M <span className="text-sm font-normal muted">records / month</span>
            </div>
            <div className="text-xs muted">across {FACTS.interfaces.length} interfaces, normalised from documented volumes</div>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel eyebrow="Interface volume" title="Approximate records per month, by interface">
          <div className="space-y-2">
            {byVolume.map((i) => (
              <div key={i.id} className="grid grid-cols-[9rem_1fr_6rem] items-center gap-3 text-xs">
                <span className="truncate text-slate-300" title={i.description}>
                  {i.name}
                  <span className="ml-1.5 text-[10px] text-slate-500">{i.centre.toUpperCase()}</span>
                </span>
                <Bar value={i.approxMonthlyK ?? 0} max={maxVolume} tone={i.volumePeriod === 'day' ? 'gold' : 'teal'} />
                <span className="text-right tabular-nums text-slate-400">{i.volume.replace('~', '≈')}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-gold-500" /> daily feed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-candidate" /> weekly or monthly feed
            </span>
          </div>
          <Source>
            volume column of <span className="font-mono">docs/interfaces/interface-contract-inventory.csv</span>; daily × 30.4,
            weekly × 4.35 for the monthly view.
          </Source>
        </Panel>

        <div className="space-y-6">
          <Panel eyebrow="Business rules" title={`${FACTS.totals.rules} rules by platform and purpose`}>
            <div className="space-y-3">
              {FACTS.centres.map((c) => (
                <div key={c.code}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="tabular-nums text-white">{c.rules}</span>
                  </div>
                  <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-white/5" style={{ width: `${(100 * c.rules) / maxRules}%` }}>
                    {c.ruleFamilies.map((f) => (
                      <div
                        key={f.family}
                        className={FAMILY_TONES[families.indexOf(f.family) % FAMILY_TONES.length]}
                        style={{ width: `${(100 * f.rules) / c.rules}%` }}
                        title={`${f.family}: ${f.rules}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-400">
              {families.map((f, i) => (
                <span key={f} className="flex items-center gap-1.5">
                  <span className={clsx('h-2.5 w-2.5 rounded-sm', FAMILY_TONES[i % FAMILY_TONES.length])} />
                  {f === 'Preupdate' ? 'Pre-update' : f === 'EventMessage' ? 'Event messaging' : f}
                </span>
              ))}
            </div>
            <Source>
              <span className="font-mono">*/config/rules/**/*.gr</span>, grouped by rule family.
            </Source>
          </Panel>

          <div className="grid grid-cols-2 gap-4">
            {FACTS.centres.map((c) => (
              <Stat key={c.code} label={`${c.name} activity patterns`} value={String(c.activityPatterns)} tone="plain" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel eyebrow="How data leaves the estate" title="Transport mix">
          <Mix rows={transportMix} />
          <Source>transport column of the interface inventory.</Source>
        </Panel>
        <Panel eyebrow="Batch schedule" title="Control-M jobs by cadence">
          <Mix rows={[...cadenceMix, ['On-request only (no schedule)', FACTS.batch.onRequestJcl]]} tone="teal" />
          <Source>
            <span className="font-mono">batch/controlm/</span> and <span className="font-mono">batch/jcl/adhoc/</span>.
          </Source>
        </Panel>
        <Panel eyebrow="Ready to test against" title={`${FACTS.totals.sampleMessages} reference messages`}>
          <Mix rows={fixtureMix} />
          <Source>
            <span className="font-mono">integration/samples/</span>, by file type.
          </Source>
        </Panel>
      </div>

      <Panel eyebrow="Engineering safety net" title="Code and tests by platform" bodyClassName="px-0 py-0">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
            <tr className="border-b border-white/5">
              {['Platform', 'Code modules', 'Unit tests', 'Screens', 'Rule sets', 'Data extensions', 'Encrypted columns'].map((h) => (
                <th key={h} className={clsx('px-6 py-3 font-medium', h !== 'Platform' && 'text-right')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FACTS.centres.map((c) => (
              <tr key={c.code} className="border-b border-white/[0.03]">
                <td className="px-6 py-2.5 text-white">{CENTRE_NAME[c.code]}</td>
                {[c.gosuClasses, c.unitTests, c.screens, c.ruleSets, c.entityExtensions, c.encryptedColumns].map((v, i) => (
                  <td key={i} className="px-6 py-2.5 text-right tabular-nums text-slate-300">
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-6 pb-4 pt-3 text-[11px] text-slate-500">
          Source: <span className="font-mono">gsrc/**/*.gs</span>, <span className="font-mono">gtest/**/*Test.gs</span>,{' '}
          <span className="font-mono">*.pcf</span>, <span className="font-mono">*.grs</span>,{' '}
          <span className="font-mono">*.etx/*.eti</span> per platform.
        </p>
      </Panel>

      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="eyebrow">Phase 2/3 scorecard</div>
          <span className="text-[11px] muted">Offline replay over synthetic cases; production results not yet available</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Parity">
            {HAS_SHADOW ? (
              <Stat label="Mismatches / records compared" value={`${fmt(shadowMismatches)} / ${fmt(shadowCompared)}`} tone="teal" />
            ) : (
              <>
                <Stat label="Offline replay: identical / cases" value={`${fmt(FACTS.migration.totals.matched)} / ${fmt(FACTS.migration.totals.compared)}`} tone="teal" />
                <p className="mt-2 text-[11px] text-slate-500">
                  Replay {FACTS.migration.status}, negative control {FACTS.migration.negativeControl}. Source: {FACTS.migration.source}
                </p>
              </>
            )}
          </Panel>
          <Panel title="Reconciliation">
            {HAS_RECON ? (
              <Stat label="Breaks / controls run" value={`${reconBreaks} / ${EVIDENCE.reconciliation.length}`} tone="teal" />
            ) : (
              <EmptyEvidence what="production reconciliation results" />
            )}
          </Panel>
          <Panel title="Cutover">
            {HAS_CUTOVER ? (
              <Stat
                label="Feeds on new code"
                value={`${switched} / ${FACTS.interfaces.length * BRANDS.length * FACTS.environments.environments.length}`}
                tone="teal"
              />
            ) : (
              <>
                <Stat label="Templates with cutover switched on" value={`${FACTS.migration.switches.cutoverFeeds} / ${FACTS.migration.switches.templates}`} tone="teal" />
                <p className="mt-2 text-[11px] text-slate-500">Committed off; enabled per environment at deploy time. Source: environments/*/*.properties.template</p>
              </>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

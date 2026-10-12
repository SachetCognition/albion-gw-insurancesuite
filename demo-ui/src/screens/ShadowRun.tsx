import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { EmptyEvidence, Panel, PlannedTag, ScreenHeader, Source, Tag } from '../components/ui'
import { BRANDS, CENTRE_NAME, FACTS, fmt } from '../data/facts'
import { EVIDENCE, HAS_RECON, HAS_SHADOW } from '../data/evidence'

const SEGMENT_TONES = ['bg-gold-500/70', 'bg-candidate/70', 'bg-sky-400/60', 'bg-violet-400/60', 'bg-emerald-400/60', 'bg-rose-400/60']

const STEPS = [
  {
    title: 'Run side by side',
    body: 'For each interface, the new record builder runs alongside the current one on the same live business events. Only the current output is sent to the partner.',
  },
  {
    title: 'Compare every record',
    body: 'Each pair of fixed-width records is compared character by character, per brand and per environment. Any difference is a mismatch; there is no partial credit.',
  },
  {
    title: 'Reconcile the totals',
    body: 'Record counts and control totals are reconciled against the downstream feed, using the same tolerance operations apply today.',
  },
  {
    title: 'Switch, and keep a way back',
    body: 'Only an interface with a clean window is switched, one brand and one environment at a time. The current builder stays warm and becomes the shadow, so a single switch reverses the change.',
  },
]

export default function ShadowRun() {
  const [id, setId] = useState('IF-MID-001')
  const iface = FACTS.interfaces.find((i) => i.id === id) ?? FACTS.interfaces[0]
  const used = iface.layout.reduce((a, f) => a + (f.width ?? 0), 0)
  const width = iface.recordWidth ?? used
  const runs = EVIDENCE.shadowRuns.filter((r) => r.interfaceId === iface.id)
  const tolerance = FACTS.controls.reconciliationTolerance

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="04 · Shadow run & cutover"
        title="Prove it on live traffic, then switch with a way back"
        lede="This is the plan for Phases 2 and 3. No interface has been shadowed or switched yet, so the results panels below are empty by design: they populate from committed shadow-run, reconciliation and cutover output, never from projections."
        aside={
          <div className="panel px-5 py-4 text-left">
            <div className="eyebrow">Status</div>
            <div className="mt-2">
              {HAS_SHADOW ? <Tag tone="teal">Shadow-run evidence loaded</Tag> : <PlannedTag />}
            </div>
            <div className="mt-2 text-xs muted">
              {HAS_SHADOW ? EVIDENCE.sources.join(', ') : 'All production traffic runs on the current code'}
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 * (i + 1) }}
            className="panel border-dashed p-5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gold-400">Step {i + 1}</span>
              <PlannedTag phase={i < 3 ? 'Phase 2' : 'Phase 3'} />
            </div>
            <div className="mt-2 text-base font-semibold text-white">{s.title}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.body}</p>
          </motion.div>
        ))}
      </div>

      <Panel
        eyebrow="What will be compared · today's record layout"
        title={`${iface.description}`}
        aside={
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="rounded-lg border border-white/10 bg-ink-800 px-3 py-1.5 text-xs text-slate-200"
          >
            {FACTS.interfaces.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} · {i.description}
              </option>
            ))}
          </select>
        }
      >
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-xs text-slate-400">
          <span>
            Platform <span className="text-white">{CENTRE_NAME[iface.centre]}</span>
          </span>
          <span>
            Record width <span className="text-white">{width}</span> characters
          </span>
          <span>
            Populated <span className="text-white">{used}</span> · padding <span className="text-white">{width - used}</span>
          </span>
          <span>
            Volume <span className="text-white">{iface.volume.replace('~', '≈')}</span>
          </span>
        </div>

        <div className="mt-4 flex h-12 w-full overflow-hidden rounded-lg border border-white/10">
          {iface.layout.map((f, i) => (
            <div
              key={f.field + i}
              className={clsx('flex items-center justify-center border-r border-ink-900/60 text-[10px] font-medium text-ink-900', SEGMENT_TONES[i % SEGMENT_TONES.length])}
              style={{ width: `${(100 * (f.width ?? 0)) / width}%` }}
              title={`${f.field}${f.format ? ` (${f.format})` : ''}: ${f.width} characters`}
            >
              <span className="truncate px-1">{f.width && f.width / width > 0.03 ? f.field : ''}</span>
            </div>
          ))}
          <div className="flex flex-1 items-center justify-center bg-white/[0.03] text-[10px] text-slate-500">padding</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {iface.layout.map((f, i) => (
            <span key={f.field + i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={clsx('h-2.5 w-2.5 rounded-sm', SEGMENT_TONES[i % SEGMENT_TONES.length])} />
              <span className="font-mono text-slate-200">{f.field}</span>
              {f.width} chars{f.format ? ` · ${f.format}` : ''}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          The mainframe layout <span className="font-mono text-slate-300">{iface.copybook}</span> defines {iface.copybookFields}{' '}
          fields; today's builder writes {Math.max(0, iface.layout.length - 1)} after the record prefix. The repository holds{' '}
          {Object.values(iface.samples).reduce((a, n) => a + n, 0)} reference messages for this interface (
          {Object.entries(iface.samples)
            .map(([k, n]) => `${n} ${k.replace('_', ' ')}`)
            .join(', ')}
          ) to seed the comparison.
        </p>
        <Source>
          <span className="font-mono">docs/interfaces/interface-contract-inventory.csv</span> (builder layout) and{' '}
          <span className="font-mono">integration/samples/</span>.
        </Source>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Phase 2 · shadow-run results" title="Records compared and mismatches" aside={HAS_SHADOW ? undefined : <PlannedTag phase="Phase 2" />}>
          {runs.length ? (
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="py-2">Brand</th>
                  <th className="py-2">Environment</th>
                  <th className="py-2">Window</th>
                  <th className="py-2 text-right">Compared</th>
                  <th className="py-2 text-right">Mismatches</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.brand + r.environment + r.windowStart} className="border-t border-white/5">
                    <td className="py-2 font-mono">{r.brand}</td>
                    <td className="py-2 font-mono">{r.environment}</td>
                    <td className="py-2 text-slate-400">
                      {r.windowStart} → {r.windowEnd}
                    </td>
                    <td className="py-2 text-right tabular-nums">{fmt(r.recordsCompared)}</td>
                    <td className={clsx('py-2 text-right tabular-nums', r.mismatches ? 'text-alert' : 'text-emerald-300')}>{fmt(r.mismatches)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyEvidence what={`shadow-run results for ${iface.name}`} />
          )}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {BRANDS.map((b) => (
              <div key={b.code} className="rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2 text-center">
                <div className="font-mono text-[11px] text-slate-300">{b.code}</div>
                <div className="text-[10px] text-slate-500">
                  {runs.filter((r) => r.brand === b.code).length ? 'results loaded' : 'not yet run'}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Phase 2 · reconciliation" title="Counts and control totals" aside={HAS_RECON ? undefined : <PlannedTag phase="Phase 2" />}>
          {HAS_RECON ? (
            <ul className="space-y-2">
              {EVIDENCE.reconciliation.map((r) => (
                <li key={r.control + r.environment + r.period} className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-800/60 px-4 py-2 text-xs">
                  <span className="text-slate-300">
                    {r.control} · <span className="font-mono">{r.environment}</span> · {r.period}
                  </span>
                  <Tag tone={r.status === 'MATCHED' ? 'green' : 'alert'}>{r.status}</Tag>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyEvidence what="reconciliation results" />
          )}
          {tolerance && (
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              The documented production rule today: downstream feeds may be released when source and downstream counts differ by
              less than <span className="font-semibold text-white">{tolerance}</span>. Phase 2 makes that an automated, recorded
              control. The register lists {FACTS.controls.controls.length} controls to automate.
            </p>
          )}
          <Source>
            <span className="font-mono">{FACTS.controls.source}</span>, control register.
          </Source>
        </Panel>
      </div>
    </div>
  )
}

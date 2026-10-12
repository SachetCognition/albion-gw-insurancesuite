import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { EmptyEvidence, Panel, PlannedTag, ScreenHeader, Source, Stat, Tag } from '../components/ui'
import { CENTRE_NAME, FACTS, fmt } from '../data/facts'
import { EVIDENCE, HAS_SHADOW } from '../data/evidence'

const SEGMENT_TONES = ['bg-gold-500/70', 'bg-candidate/70', 'bg-sky-400/60', 'bg-violet-400/60', 'bg-emerald-400/60', 'bg-rose-400/60']
const M = FACTS.migration
const WIRED = [...new Set(M.runs.flatMap((r) => r.feeds))]
const WIRED_LABEL = WIRED.map((f) => f.replace('_', ' ')).join(' and ')
const REPLAY_GREEN = M.status === 'GREEN'
const statusTone = (s: string): 'green' | 'alert' => (s === 'GREEN' ? 'green' : 'alert')

const STEPS = [
  {
    title: 'Run side by side',
    tag: 'Built · switched off',
    body: 'When switched on for a feed, the new record builder runs after the current one on the same business event. Only the current record is sent; a failure in the new code never reaches the partner.',
  },
  {
    title: 'Compare every record',
    tag: REPLAY_GREEN ? 'Proven offline' : 'Offline replay failing',
    body: 'Each pair of records is compared byte for byte. Any difference is a breach; there is no partial credit.',
  },
  {
    title: 'Reconcile the totals',
    tag: 'Built · run on demand',
    body: `A reconciliation batch on ${M.reconBatchCentres.map((c) => CENTRE_NAME[c]).join(', ')} publishes each period's counts: green only with comparisons and no breach. It is not yet on the Control-M schedule.`,
  },
  {
    title: 'Switch, and keep a way back',
    tag: 'Built · off everywhere',
    body: 'Cutover is enabled per environment at deploy time, only for a feed that is also shadow-run, and sends the new record only when it matches exactly. Rollback is clearing one setting and restarting.',
  },
]

export default function ShadowRun() {
  const [id, setId] = useState(FACTS.interfaces.find((i) => i.name === 'IPT')?.id ?? FACTS.interfaces[0].id)
  const iface = FACTS.interfaces.find((i) => i.id === id) ?? FACTS.interfaces[0]
  const used = iface.layout.reduce((a, f) => a + (f.width ?? 0), 0)
  const width = iface.recordWidth ?? used
  const tolerance = FACTS.controls.reconciliationTolerance
  const sw = M.switches

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="04 · Shadow run & cutover"
        title="Prove it, then switch with a way back"
        lede={`The shadow-run, reconciliation and cutover controls are built into the ${WIRED_LABEL} feeds and committed switched off. An offline replay over synthetic test cases shows the new record builders reproduce today's records exactly. Production shadow running has not started, so no live results are shown.`}
        aside={
          <div className="panel px-5 py-4 text-left">
            <div className="eyebrow">Offline replay</div>
            <div className="mt-2">
              <Tag tone={statusTone(M.status)}>{M.status}</Tag>
            </div>
            <div className="mt-2 text-xs muted">Synthetic test cases · not production results</div>
            <div className="text-xs muted">All production traffic runs on the current code</div>
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
            className="panel p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gold-400">{i < 3 ? 'Phase 2' : 'Phase 3'}</span>
              <Tag tone="teal">{s.tag}</Tag>
            </div>
            <div className="mt-2 text-base font-semibold text-white">{s.title}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.body}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel
          className="xl:col-span-3"
          eyebrow="Phase 2 · offline replay over synthetic test cases"
          title={`${fmt(M.totals.matched)} of ${fmt(M.totals.compared)} cases identical, ${fmt(M.totals.breaches)} breaches`}
          aside={<Tag tone={statusTone(M.status)}>{M.status}</Tag>}
        >
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="py-2">Platform</th>
                <th className="py-2">Feed</th>
                <th className="py-2 text-right">Brands</th>
                <th className="py-2 text-right">Compared</th>
                <th className="py-2 text-right">Identical</th>
                <th className="py-2 text-right">Breaches</th>
                <th className="py-2 text-right">New-code errors</th>
                <th className="py-2 text-right">Result</th>
              </tr>
            </thead>
            <tbody>
              {M.runs.map((r) => (
                <tr key={r.centre} className="border-t border-white/5">
                  <td className="py-2 text-slate-200">{CENTRE_NAME[r.centre]}</td>
                  <td className="py-2 font-mono">{r.feeds.join(', ')}</td>
                  <td className="py-2 text-right tabular-nums">{r.brands.length}</td>
                  <td className="py-2 text-right tabular-nums">{fmt(r.totals.compared)}</td>
                  <td className="py-2 text-right tabular-nums text-emerald-300">{fmt(r.totals.matched)}</td>
                  <td className={clsx('py-2 text-right tabular-nums', r.totals.breaches && 'text-alert')}>{fmt(r.totals.breaches)}</td>
                  <td className={clsx('py-2 text-right tabular-nums', r.totals.candidateErrors && 'text-alert')}>{fmt(r.totals.candidateErrors)}</td>
                  <td className="py-2 text-right">
                    <Tag tone={statusTone(r.status)}>{r.status}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 rounded-xl border border-white/5 bg-ink-800/60 px-4 py-3 text-xs leading-relaxed text-slate-400">
            <span className="mr-2">
              <Tag tone={M.negativeControl === 'RED' ? 'green' : 'alert'}>Negative control {M.negativeControl}</Tag>
            </span>
            A deliberately altered new record must be caught as a breach. It {M.negativeControl === 'RED' ? 'was' : 'was not'}, which shows
            the comparison can fail when the records differ.
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Test cases: {M.fixtures.map((f) => `${f.path.split('/').pop()} (${f.cases})`).join(', ')}. Invented values only; this is not
            production traffic. Comparison tolerance: {M.tolerance}. Generated {M.generatedAt.replace('T', ' ').replace('Z', ' UTC')}.
          </p>
          <Source>
            <span className="font-mono">{M.source}</span> ({M.schema}), format in <span className="font-mono">{M.doc}</span>.
          </Source>
        </Panel>

        <Panel className="xl:col-span-2" eyebrow="Phase 3 · cutover switch" title="Committed off in every environment">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Templates with shadow on" value={`${sw.shadowEnabled} / ${sw.templates}`} tone="teal" />
            <Stat label="Templates with cutover set" value={`${sw.cutoverFeeds} / ${sw.templates}`} tone="teal" />
          </div>
          <ul className="mt-4 space-y-2 text-xs leading-relaxed text-slate-300">
            <li>Enabled per environment at deploy time; never a committed value, so switching one environment never promotes itself.</li>
            <li>Only effective for a feed that is also shadow-run; any other combination fails the start-up check.</li>
            <li>Sends the new record only when it matches the current one exactly; otherwise the current record goes out.</li>
            <li>Rollback: clear the cutover feed list and restart. The current code is authoritative again; no code deployment.</li>
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">
            Replay cutover counters: {fmt(M.totals.cutoverCandidateEmitted)} new records sent, {fmt(M.totals.cutoverReverted)} reverted.
          </p>
          <Source>
            <span className="font-mono">environments/*/*.properties.template</span> and <span className="font-mono">{M.doc}</span>.
          </Source>
        </Panel>
      </div>

      <Panel
        eyebrow="What is compared · today's record layout"
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
          <span>{WIRED.includes(iface.name.replace(' ', '_')) ? <Tag tone="teal">Shadow controls built</Tag> : <PlannedTag phase="later feed" />}</span>
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
          ).
        </p>
        <Source>
          <span className="font-mono">docs/interfaces/interface-contract-inventory.csv</span> (builder layout) and{' '}
          <span className="font-mono">integration/samples/</span>.
        </Source>
      </Panel>

      <Panel eyebrow="Phase 2 · next" title="Production shadow run and reconciliation" aside={HAS_SHADOW ? undefined : <PlannedTag phase="Phase 2" />}>
        {HAS_SHADOW ? (
          <ul className="space-y-2">
            {EVIDENCE.shadowRuns.map((r) => (
              <li key={r.interfaceId + r.brand + r.environment + r.windowStart} className="flex justify-between text-xs text-slate-300">
                <span>
                  {r.interfaceId} · <span className="font-mono">{r.brand}</span> · {r.environment} · {r.windowStart} → {r.windowEnd}
                </span>
                <span className={r.mismatches ? 'text-alert' : 'text-emerald-300'}>
                  {fmt(r.mismatches)} / {fmt(r.recordsCompared)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyEvidence what="production shadow-run results" />
        )}
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          The gate for each feed: replay green on the release commit, a full business cycle of shadow running in the target environment
          (including a month end for IPT) with every reconciliation period green, and the feed's regression tests passing.
          {tolerance && (
            <>
              {' '}
              Count reconciliation follows today's documented rule: a difference below{' '}
              <span className="font-semibold text-white">{tolerance}</span>.
            </>
          )}
        </p>
        <Source>
          <span className="font-mono">{M.doc}</span>, Phase 3 cutover runbook; <span className="font-mono">{FACTS.controls.source}</span>.
        </Source>
      </Panel>
    </div>
  )
}

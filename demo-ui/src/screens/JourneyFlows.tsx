import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { Panel, ScreenHeader, Source, Tag } from '../components/ui'
import { FACTS, fmt, plain } from '../data/facts'

const { journeys, feedStatus } = FACTS
const PLATFORMS = new Set(FACTS.centres.map((c) => c.name))
const CONSUMER_LABEL: Record<string, string> = {
  'Gosu batch classes': 'Batch programs',
  'Rules XML': 'Business rules (baseline format)',
  'PCF files': 'Screens',
  'Entity extensions': 'Data definitions',
  'SQL data fixes': 'Manual SQL data fixes',
}

export default function JourneyFlows() {
  const [id, setId] = useState(journeys.find((j) => j.id === 'motor-fnol')?.id ?? journeys[0].id)
  const j = journeys.find((x) => x.id === id) ?? journeys[0]
  const maxConsumers = Math.max(...feedStatus.consumers.map((c) => c.count))

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="03 · Business journeys"
        title="The customer outcomes the migration must protect"
        lede={`${journeys.length} documented end-to-end journeys show which platforms and partners each customer outcome depends on, where the regulation bites, and where the process is known to fall short today. Every interface change is tested against these journeys first.`}
      />

      <div className="flex flex-wrap gap-2">
        {journeys.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setId(x.id)}
            className={clsx(
              'rounded-xl border px-4 py-2 text-left text-xs transition-colors',
              x.id === id ? 'border-gold-500/50 bg-gold-500/10 text-white' : 'border-white/5 bg-ink-700/60 text-slate-400 hover:text-slate-200',
            )}
          >
            <div className="font-medium">{x.title.split(' – ')[0]}</div>
            <div className="text-[10px] text-slate-500">{x.title.split(' – ')[1] ?? x.lineOfBusiness}</div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
          <Panel eyebrow={j.lineOfBusiness} title={j.title} aside={j.lastVerified ? `Last verified ${j.lastVerified}` : undefined}>
            <div className="flex flex-wrap gap-2">
              {j.brands.split(', ').map((b) => (
                <Tag key={b} tone="gold">
                  {b}
                </Tag>
              ))}
              {j.regulation.split(', ').map((r) => (
                <Tag key={r}>{r}</Tag>
              ))}
            </div>

            <div className="mt-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${j.steps.length}, minmax(0, 1fr))` }}>
              {j.steps.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * (i + 1) }}
                  className="relative rounded-xl border border-white/5 bg-ink-800/60 p-4"
                >
                  <div className="font-mono text-[11px] text-gold-500">{String(i + 1).padStart(2, '0')}</div>
                  <div className="mt-1 text-sm font-semibold text-white">{s.title}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{plain(s.detail)}</p>
                  {i < j.steps.length - 1 && (
                    <span className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-gold-500/60 lg:block">›</span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div>
                <div className="eyebrow">Systems touched, in order</div>
                <ol className="mt-2 space-y-1.5">
                  {j.systems.map((s, i) => (
                    <li key={s.system + i} className="flex items-start gap-3 text-xs">
                      <span
                        className={clsx(
                          'mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px]',
                          PLATFORMS.has(s.system) ? 'border-candidate/40 text-candidate' : 'border-white/10 text-slate-400',
                        )}
                      >
                        {s.system}
                      </span>
                      <span className="text-slate-400">{plain(s.role)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <div className="eyebrow text-alert/80">Known shortfall today</div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{plain(j.knownIssues) || 'None recorded.'}</p>
              </div>
              <div>
                <div className="eyebrow">Change history</div>
                <ul className="mt-2 space-y-1.5">
                  {j.changes.map((c) => (
                    <li key={c.ticket} className="text-xs">
                      <span className="font-mono text-[10px] text-slate-500">{c.date}</span>
                      <span className="ml-2 text-slate-300">{plain(c.change)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Source>
              <span className="font-mono">{j.source}</span>.
            </Source>
          </Panel>
        </motion.div>
      </AnimatePresence>

      <Panel
        eyebrow="The status field every feed depends on"
        title="One free-text status drives every outbound feed"
        aside={feedStatus.baselineConsumers ? `${fmt(feedStatus.baselineConsumers)} consumers in the documented baseline` : undefined}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm leading-relaxed text-slate-300">
              Whether a record still needs sending to a partner is held in a single text field with no enforced set of
              values. Batches, rules, screens and manual data fixes all read or write it. A replacement has to reproduce
              that behaviour exactly before it can be tightened.
            </p>
            <div className="mt-4 space-y-3">
              {feedStatus.consumers.map((c) => (
                <div key={c.type}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{CONSUMER_LABEL[c.type] ?? c.type}</span>
                    <span className="tabular-nums text-white">{c.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400" style={{ width: `${(100 * c.count) / maxConsumers}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{plain(c.behaviour)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 self-start sm:grid-cols-3">
            {feedStatus.literals.map((l) => (
              <div
                key={l.literal}
                className={clsx(
                  'rounded-lg border p-3',
                  l.classification.startsWith('Intended workflow') && 'border-emerald-400/25 bg-emerald-400/[0.05]',
                  l.classification.startsWith('Intended but') && 'border-gold-500/30 bg-gold-500/[0.05]',
                  l.classification.startsWith('Manual') && 'border-white/10 bg-white/[0.02]',
                  /incorrectly/.test(l.classification) && 'border-alert/30 bg-alert/[0.05]',
                )}
              >
                <div className="font-mono text-xs text-white">{l.literal}</div>
                <div className="mt-1 text-[10px] leading-snug text-slate-400">{l.classification}</div>
              </div>
            ))}
          </div>
        </div>
        <Source>
          <span className="font-mono">{feedStatus.source}</span>. These counts come from that document’s baseline scan,
          taken before the rules moved to native Guidewire format; today’s rule estate is {FACTS.totals.rules} rules in{' '}
          {FACTS.totals.ruleSets} rule sets.
        </Source>
      </Panel>
    </div>
  )
}

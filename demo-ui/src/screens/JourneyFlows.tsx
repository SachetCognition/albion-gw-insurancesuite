import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { Panel, ScreenHeader, Tag } from '../components/ui'
import { FEED_SIDE_STATES, FEED_STATES, INTERFACES, JOURNEYS } from '../data/mock'

export default function JourneyFlows() {
  const [{ journeyId, step }, setPosition] = useState({ journeyId: JOURNEYS[0].id, step: 0 })
  const [playing, setPlaying] = useState(true)

  const journey = JOURNEYS.find((j) => j.id === journeyId) ?? JOURNEYS[0]
  const last = journey.steps.length - 1

  const setStep = (next: number | ((s: number) => number)) =>
    setPosition((p) => ({ ...p, step: typeof next === 'function' ? next(p.step) : next }))

  const selectJourney = (id: string) => setPosition({ journeyId: id, step: 0 })

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setStep((s) => (s >= last ? 0 : s + 1)), 2600)
    return () => clearTimeout(t)
  }, [playing, step, last])

  const current = journey.steps[step]

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="03 · Business journey flows"
        title="What the customer does, and what the mainframe hears"
        lede="Three journeys carry most of Albion's business value: a loss reported, a renewal priced, a payment collected. Each one ends in a fixed-width record on POLARIS. The migration changes who builds that record — never the record."
        aside={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-xs font-medium text-gold-300 hover:bg-gold-500/20"
            >
              {playing ? '❚❚  Pause walk-through' : '▶  Play walk-through'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false)
                setStep((s) => (s >= last ? 0 : s + 1))
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
            >
              Step →
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {JOURNEYS.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => selectJourney(j.id)}
            className={clsx(
              'rounded-xl border px-4 py-3 text-left transition-colors',
              journeyId === j.id
                ? 'border-gold-500/40 bg-gold-500/10'
                : 'border-white/5 bg-ink-800/50 hover:border-white/15',
            )}
          >
            <div className={clsx('text-sm font-semibold', journeyId === j.id ? 'text-gold-300' : 'text-white')}>
              {j.name}
            </div>
            <div className="mt-0.5 max-w-md text-[11px] text-slate-400">{j.tagline}</div>
          </button>
        ))}
      </div>

      <Panel
        eyebrow={journey.name}
        title={journey.outcome}
        aside={`Step ${step + 1} of ${journey.steps.length}`}
      >
        <div className="relative mb-8 mt-1">
          <div className="absolute left-0 right-0 top-4 h-px bg-white/10" />
          <motion.div
            className="absolute left-0 top-4 h-px bg-gradient-to-r from-gold-500 to-candidate"
            animate={{ width: `${(step / last) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div className="relative flex justify-between">
            {journey.steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => {
                  setPlaying(false)
                  setStep(i)
                }}
                className="group flex w-full flex-col items-center gap-2"
              >
                <span
                  className={clsx(
                    'grid h-8 w-8 place-items-center rounded-full border text-[11px] font-semibold transition-all',
                    i < step && 'border-gold-500/50 bg-gold-500/20 text-gold-300',
                    i === step && 'scale-110 border-candidate bg-candidate/20 text-candidate shadow-glow',
                    i > step && 'border-white/10 bg-ink-800 text-slate-500',
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={clsx(
                    'hidden max-w-[9rem] text-center text-[10px] leading-tight md:block',
                    i === step ? 'text-white' : 'text-slate-500',
                  )}
                >
                  {s.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${journey.id}-${step}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"
          >
            <div className="rounded-xl border border-candidate/25 bg-candidate/[0.05] p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">{current.actor}</span>
                {current.status && <Tag tone={statusTone(current.status)}>{current.status}</Tag>}
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-white">{current.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{current.detail}</p>
              {current.artefact && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-900/70 px-3 py-2 font-mono text-xs text-gold-300">
                  {current.artefact}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {journey.steps.map((s, i) => (
                <div
                  key={s.title}
                  className={clsx(
                    'flex items-start gap-3 rounded-lg border px-4 py-2.5 text-xs transition-colors',
                    i === step ? 'border-white/15 bg-white/[0.06]' : 'border-white/5 bg-ink-800/40',
                  )}
                >
                  <span className={clsx('font-mono', i <= step ? 'text-gold-500' : 'text-slate-600')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className={i === step ? 'text-white' : 'text-slate-400'}>{s.title}</div>
                    <div className="truncate text-[10px] text-slate-500">{s.actor}</div>
                  </div>
                  {i < step && <span className="ml-auto text-emerald-400">✓</span>}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </Panel>

      <Panel
        eyebrow="FeedStatus_Ext lifecycle"
        title="One nullable varchar, 388 consumers, 29 batches"
        aside="External strings never change through the migration"
      >
        <div className="flex flex-wrap items-stretch gap-3">
          {FEED_STATES.map((s, i) => (
            <motion.div
              key={s.code}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.07 * i }}
              className="flex min-w-[13rem] flex-1 flex-col rounded-xl border border-white/5 bg-ink-800/60 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gold-300">{s.code}</span>
                {(s.code === 'ACK' || s.code === 'NAK') && <Tag tone="alert">no producer</Tag>}
              </div>
              <div className="mt-1 text-xs font-medium text-white">{s.label}</div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{s.detail}</p>
              {i < FEED_STATES.length - 1 && (
                <div className="mt-3 hidden text-gold-500/50 lg:block">↓</div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-white/5 bg-ink-900/50 p-4">
          <div className="eyebrow">Manual data-fix states written directly by SQL</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {FEED_SIDE_STATES.map((s) => (
              <span key={s.code} className="chip border-white/10 bg-white/5 text-slate-300">
                <span className="font-mono text-gold-400/80">{s.code}</span>
                <span className="text-slate-500">· {s.detail}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            The candidate reproduces every observed transition, including the ones nobody designed. Real retry state
            arrives later as its own gated change — carried separately from business status so no external string moves.
          </p>
        </div>
      </Panel>

      <Panel eyebrow="Where the journeys land" title="Fixed-width records on POLARIS" aside="18 interface contracts · 22 record builders">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4 font-medium">Interface</th>
                <th className="pb-3 pr-4 font-medium">Centre</th>
                <th className="pb-3 pr-4 font-medium">Copybook</th>
                <th className="pb-3 pr-4 font-medium">Record</th>
                <th className="pb-3 pr-4 font-medium">Transport</th>
                <th className="pb-3 pr-4 font-medium">Peak</th>
                <th className="pb-3 font-medium">Retry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {INTERFACES.map((f) => (
                <tr key={f.id}>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-white">{f.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{f.id}</div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-400">{f.centre}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-300">{f.copybook}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gold-300">
                    {f.prefix} · {f.width}b
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{f.transport}</td>
                  <td className="py-3 pr-4 text-xs tabular-nums text-slate-300">{f.peak}</td>
                  <td className="py-3 text-xs text-slate-400">{f.retry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function statusTone(status: string): 'gold' | 'teal' | 'alert' | 'green' | 'slate' {
  if (status === 'ACK' || status === 'MATCH' || status === 'PASS') return 'green'
  if (status === 'SENT') return 'teal'
  if (status === 'PENDING' || status === 'HELD') return 'gold'
  if (status === 'NAK') return 'alert'
  return 'slate'
}

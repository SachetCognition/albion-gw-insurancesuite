import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { Panel, ScreenHeader, StatusChip, Tag } from '../components/ui'
import { CELL_STYLE } from '../components/status'
import {
  BRANDS,
  CENTRES,
  ENV_PROMOTION,
  EVIDENCE_LADDER,
  GATE_ROWS,
  GATE_TOTALS,
  REPLAY_LIMITS,
  cellState,
  type Brand,
  type Centre,
  type EnvName,
  type GateRow,
} from '../data/mock'

const CENTRE_FILTERS: (Centre | 'all')[] = ['all', 'cc', 'pc', 'bc', 'cm']

export default function ControlTower() {
  const [centre, setCentre] = useState<Centre | 'all'>('all')
  const [env, setEnv] = useState<EnvName>('dev')
  const [selected, setSelected] = useState<GateRow | null>(null)

  const rows = useMemo(() => {
    const filtered = centre === 'all' ? GATE_ROWS : GATE_ROWS.filter((r) => r.centre === centre)
    const byComponent = new Map<string, GateRow[]>()
    for (const r of filtered) {
      const key = `${r.component}|${r.centre}`
      const list = byComponent.get(key) ?? []
      list.push(r)
      byComponent.set(key, list)
    }
    return [...byComponent.entries()].map(([key, list]) => ({
      key,
      component: list[0].component,
      centre: list[0].centre,
      feature: list[0].feature,
      status: list[0].status,
      byBrand: Object.fromEntries(list.map((r) => [r.brand, r])) as Record<Brand, GateRow>,
    }))
  }, [centre])

  const liveFlags = ENV_PROMOTION.find((e) => e.env === env)?.flagsEnabled ?? 0

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="02 · Migration control tower"
        title="Dev is cut over. Everything past dev is still legacy, on purpose"
        lede="All 124 component × brand rows now carry archived offline-replay evidence — status GREEN_REPLAY. That status permits the cut-over flag in dev and nowhere else, so dev runs the candidate for all 22 builders × 4 brands while sit, uat/preprod and prod stay on legacy until a live shadow window turns each row GREEN."
        aside={
          <div className="flex gap-3">
            <div className="panel px-4 py-3 text-left">
              <div className="text-2xl font-semibold tabular-nums text-gold-300">{GATE_TOTALS.greenReplay}</div>
              <div className="text-[11px] muted">rows GREEN_REPLAY</div>
            </div>
            <div className="panel px-4 py-3 text-left">
              <div className="text-2xl font-semibold tabular-nums text-candidate">{GATE_TOTALS.devCutover}</div>
              <div className="text-[11px] muted">flags live in dev</div>
            </div>
            <div className="panel px-4 py-3 text-left">
              <div className="text-2xl font-semibold tabular-nums text-emerald-300">{GATE_TOTALS.green}</div>
              <div className="text-[11px] muted">rows GREEN (live)</div>
            </div>
          </div>
        }
      />

      <Panel
        eyebrow="Environment promotion"
        title="dev → sit → uat/preprod → prod"
        aside="CI refuses out-of-order promotion"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ENV_PROMOTION.map((e, i) => (
            <motion.div
              key={e.env}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className={clsx(
                'relative rounded-xl border p-5',
                e.state === 'CUT OVER' ? 'border-candidate/30 bg-candidate/[0.06]' : 'border-white/5 bg-ink-800/50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-white">{e.env}</span>
                {e.state === 'CUT OVER' ? <Tag tone="teal">cut over</Tag> : <Tag>on legacy</Tag>}
              </div>
              <div className="mt-3 text-3xl font-semibold tabular-nums text-white">{e.flagsEnabled}</div>
              <div className="text-[11px] muted">cut-over flags enabled</div>
              <div className="mt-3 border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-400">
                <span className="text-gold-400/90">Needs:</span> {e.requires}
              </div>
              <div className="mt-2 text-xs leading-relaxed text-slate-400">
                <span className="text-gold-400/90">Bake:</span> {e.bake}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{e.note}</p>
              {i < ENV_PROMOTION.length - 1 && (
                <span className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center text-gold-500/60 xl:flex">
                  →
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Evidence ladder"
        title="What each grade of evidence is allowed to unlock"
        aside="tools/ci/verify_phase1_scaffold.py enforces this"
      >
        <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-2">
            {EVIDENCE_LADDER.map((e) => (
              <div
                key={e.status}
                className={clsx(
                  'flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3',
                  e.status === 'GREEN_REPLAY'
                    ? 'border-gold-500/30 bg-gold-500/[0.07]'
                    : e.status === 'GREEN'
                      ? 'border-emerald-400/25 bg-emerald-400/[0.06]'
                      : 'border-white/5 bg-ink-800/60',
                )}
              >
                <span className="font-mono text-xs text-white">{e.status}</span>
                <span className="min-w-0 flex-1 text-[11px] leading-relaxed text-slate-400">{e.evidence}</span>
                <span className="shrink-0 font-mono text-[11px] text-gold-300">{e.permits}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-alert/20 bg-alert/[0.05] p-4">
            <div className="eyebrow text-alert/80">What replay cannot prove</div>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-slate-400">
              {REPLAY_LIMITS.map((l) => (
                <li key={l} className="flex gap-2">
                  <span className="text-alert/70">·</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Cut-over status board"
        title="Who builds the record, per environment"
        aside={
          <div className="space-y-2">
            <div className="flex flex-wrap justify-end gap-1">
              {ENV_PROMOTION.map((e) => (
                <button
                  key={e.env}
                  type="button"
                  onClick={() => setEnv(e.env)}
                  className={clsx(
                    'rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors',
                    env === e.env ? 'bg-candidate/20 text-candidate' : 'bg-white/5 text-slate-400 hover:text-slate-200',
                  )}
                >
                  {e.env}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {CENTRE_FILTERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCentre(c)}
                  className={clsx(
                    'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                    centre === c ? 'bg-gold-500/20 text-gold-300' : 'bg-white/5 text-slate-400 hover:text-slate-200',
                  )}
                >
                  {c === 'all' ? 'All centres' : `${c.toUpperCase()} · ${CENTRES[c]}`}
                </button>
              ))}
            </div>
          </div>
        }
        bodyClassName="px-0 py-0"
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-6 py-3 text-[11px] text-slate-400">
          Showing <span className="font-mono text-white">{env}</span> ·
          <span className="font-mono text-candidate">{liveFlags}</span> cut-over flags enabled here
          {liveFlags === 0 && <span className="text-slate-500">— legacy builds every record in this environment</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-ink-800/70">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 font-medium">Component</th>
                <th className="px-3 py-3 font-medium">Centre</th>
                <th className="px-3 py-3 font-medium">Gate row</th>
                {BRANDS.map((b) => (
                  <th key={b.code} className="px-3 py-3 font-medium">
                    {b.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr key={row.key} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-3">
                    <div className="font-medium text-white">{row.component}</div>
                    <div className="font-mono text-[10px] text-slate-500">{row.feature}</div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-400">{row.centre}</td>
                  <td className="px-3 py-3">
                    <StatusChip status={row.status} />
                  </td>
                  {BRANDS.map((b) => {
                    const cell = row.byBrand[b.code]
                    const state = cellState(cell, env)
                    return (
                      <td key={b.code} className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setSelected(cell)}
                          className={clsx(
                            'w-full rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition-transform hover:scale-[1.03]',
                            CELL_STYLE[state].cls,
                          )}
                        >
                          {CELL_STYLE[state].label}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-white/5 px-6 py-4 text-[11px] text-slate-500">
          <span className={clsx('chip', CELL_STYLE.CUTOVER.cls)}>CANDIDATE</span> candidate authoritative, legacy
          reverse-shadowing
          <span className={clsx('chip', CELL_STYLE.SHADOW.cls)}>SHADOW</span> comparator only — 3B/3C/3D stay out of the
          3A bake
          <span className={clsx('chip', CELL_STYLE.LEGACY.cls)}>LEGACY</span> legacy builds the record
          <span className="ml-auto">Select a cell for evidence detail</span>
        </div>
      </Panel>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="panel w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="panel-hd">
                <div>
                  <div className="eyebrow">Gate row evidence</div>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {selected.component} · {selected.centre} · {selected.brand}
                  </h3>
                </div>
                <StatusChip status={selected.status} />
              </div>
              <div className="space-y-4 px-6 py-5 text-sm">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Flag">
                    <span className="block break-all font-mono text-xs">
                      {selected.centre === 'cc' ? 'cl' : selected.centre === 'pc' ? 'po' : selected.centre === 'bc' ? 'bi' : 'co'}
                      .feature.{selected.feature}.brand.{selected.brand}.enabled
                    </span>
                  </Field>
                  <Field label="Enabled in">
                    {selected.devCutover ? (
                      <Tag tone="teal">dev only — GREEN_REPLAY ceiling</Tag>
                    ) : (
                      <Tag>nowhere — comparator shadowing in dev</Tag>
                    )}
                  </Field>
                  <Field label="Golden master (CI)">
                    <Tag tone="green">GREEN — every fixture, full characterization matrix</Tag>
                  </Field>
                  <Field label="Offline replay">
                    {selected.replayCases.toLocaleString('en-GB')} cases ·{' '}
                    <span className="text-emerald-300">{selected.replayFailures} failures</span>
                  </Field>
                  <Field label="Live shadow window">
                    {selected.liveShadowDays > 0 ? `${selected.liveShadowDays} days sustained` : 'not started — blocks GREEN'}
                  </Field>
                  <Field label="Tolerance">byte-exact (0) · IPT month-end counts &lt;0.1%</Field>
                </dl>
                <div className="rounded-xl border border-white/5 bg-ink-800/60 p-4">
                  <div className="eyebrow">Evidence reference</div>
                  <p className="mt-2 break-all font-mono text-xs text-slate-300">{selected.evidence}</p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Durable archived replay evidence — a log grep is never accepted. This grade of evidence can never
                    turn the row GREEN, so it can never unlock an environment past dev.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-xs text-slate-300 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 min-w-0 text-slate-200">{children}</dd>
    </div>
  )
}

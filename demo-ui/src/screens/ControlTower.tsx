import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { Panel, ScreenHeader, StatusChip, Tag } from '../components/ui'
import { statusCell } from '../components/status'
import {
  BRANDS,
  CENTRES,
  ENV_PROMOTION,
  GATE_ROWS,
  GATE_TOTALS,
  type Brand,
  type Centre,
  type GateRow,
} from '../data/mock'

const CENTRE_FILTERS: (Centre | 'all')[] = ['all', 'cc', 'pc', 'bc', 'cm']

export default function ControlTower() {
  const [centre, setCentre] = useState<Centre | 'all'>('all')
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
      byBrand: Object.fromEntries(list.map((r) => [r.brand, r])) as Record<Brand, GateRow>,
    }))
  }, [centre])

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="02 · Migration control tower"
        title="Every flip has a gate, and the gate is in the build"
        lede="124 component × brand rows. A cut-over flag that enables a component for a brand fails the build unless the matching gate row is GREEN with cited shadow-window evidence, and unless every earlier environment is already green."
        aside={
          <div className="flex gap-3">
            <div className="panel px-4 py-3 text-left">
              <div className="text-2xl font-semibold tabular-nums text-emerald-300">{GATE_TOTALS.green}</div>
              <div className="text-[11px] muted">rows green</div>
            </div>
            <div className="panel px-4 py-3 text-left">
              <div className="text-2xl font-semibold tabular-nums text-candidate">{GATE_TOTALS.shadow}</div>
              <div className="text-[11px] muted">in shadow window</div>
            </div>
            <div className="panel px-4 py-3 text-left">
              <div className="text-2xl font-semibold tabular-nums text-alert">{GATE_TOTALS.blocked}</div>
              <div className="text-[11px] muted">blocked</div>
            </div>
          </div>
        }
      />

      <Panel
        eyebrow="Environment promotion"
        title="dev/sit → uat/preprod → prod"
        aside="CI refuses out-of-order promotion"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {ENV_PROMOTION.map((e, i) => (
            <motion.div
              key={e.env}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className={clsx(
                'relative rounded-xl border p-5',
                e.unlocked ? 'border-candidate/30 bg-candidate/[0.06]' : 'border-white/5 bg-ink-800/50',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white">{e.env}</span>
                {e.unlocked ? <Tag tone="teal">open</Tag> : <Tag>locked</Tag>}
              </div>
              <div className="mt-3 text-3xl font-semibold tabular-nums text-white">{e.greenRows}</div>
              <div className="text-[11px] muted">rows green in this environment</div>
              <div className="mt-3 border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-400">
                <span className="text-gold-400/90">Bake:</span> {e.bake}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{e.note}</p>
              {i < ENV_PROMOTION.length - 1 && (
                <span className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center text-gold-500/60 md:flex">
                  →
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Cut-over status board"
        title="Component × brand, per centre"
        aside={
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
        }
        bodyClassName="px-0 py-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-ink-800/70">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 font-medium">Component</th>
                <th className="px-3 py-3 font-medium">Centre</th>
                <th className="px-3 py-3 font-medium">Golden master</th>
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
                    <Tag tone="green">GREEN</Tag>
                  </td>
                  {BRANDS.map((b) => {
                    const cell = row.byBrand[b.code]
                    return (
                      <td key={b.code} className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setSelected(cell)}
                          className={clsx(
                            'w-full rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition-transform hover:scale-[1.03]',
                            statusCell(cell.status),
                          )}
                        >
                          {cell.status}
                          {cell.status === 'SHADOW' && (
                            <span className="ml-1 opacity-70">· d{cell.shadowDays}</span>
                          )}
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
          <StatusChip status="GREEN" /> parity proven, flip eligible
          <StatusChip status="SHADOW" /> window running, legacy authoritative
          <StatusChip status="PENDING" /> window not started
          <StatusChip status="BLOCKED" /> dependency outstanding
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
                    <span className="font-mono text-xs">
                      {selected.centre === 'cc' ? 'cl' : selected.centre === 'pc' ? 'po' : selected.centre === 'bc' ? 'bi' : 'co'}
                      .feature.{selected.feature.replace('cutover.', 'cutover.')}.brand.{selected.brand}.enabled
                    </span>
                  </Field>
                  <Field label="Golden master (CI)">
                    <Tag tone="green">GREEN — every fixture, full characterization matrix</Tag>
                  </Field>
                  <Field label="Shadow window">
                    {selected.shadowDays > 0 ? `${selected.shadowDays} days sustained` : 'not started'}
                  </Field>
                  <Field label="Records compared">
                    {selected.recordsCompared.toLocaleString('en-GB')}
                  </Field>
                  <Field label="Unexplained diffs">
                    <span className={selected.diffs ? 'text-alert' : 'text-emerald-300'}>{selected.diffs}</span>
                  </Field>
                  <Field label="Tolerance">byte-exact (0) · IPT month-end counts &lt;0.1%</Field>
                </dl>
                <div className="rounded-xl border border-white/5 bg-ink-800/60 p-4">
                  <div className="eyebrow">Evidence reference</div>
                  <p className="mt-2 break-words font-mono text-xs text-slate-300">
                    {selected.evidence || 'none — cut-over flag must stay off'}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Durable ReconciliationResult archive reference. A log grep is never accepted as evidence.
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
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-200">{children}</dd>
    </div>
  )
}

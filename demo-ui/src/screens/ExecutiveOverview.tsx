import { motion } from 'framer-motion'
import { Panel, ScreenHeader, Stat, Tag } from '../components/ui'
import {
  BRANDS,
  ENV_PROMOTION,
  EVIDENCE_LADDER,
  GATE_TOTALS,
  HARNESS_SELF_CHECKS,
  HEADLINE_STATS,
  PHASE3A_STATE,
  PRINCIPLES,
  REPLAY_LIMITS,
  REPLAY_STREAMS,
  RISK_REGISTER,
} from '../data/mock'

const PHASES = [
  { id: 'P0', name: 'Baseline', body: 'Interface inventory, tolerances, state machine written down. What the estate actually does today.', state: 'done' },
  { id: 'P1', name: 'Scaffold', body: 'Candidate implementations behind flags, golden-master fixtures pinned from production bytes.', state: 'done' },
  { id: 'P2', name: 'Shadow & replay', body: 'Candidate reconciled against legacy at tolerance 0 — 14,069 offline replay cases, 0 failures.', state: 'done' },
  { id: 'P3A', name: 'Dev cut-over', body: 'Candidate authoritative in dev for 22 builders × 4 brands, legacy running as reverse shadow.', state: 'active' },
  { id: 'P3B', name: 'Promotion', body: 'sit → uat/preprod → prod, each gated on a live shadow window plus the load test.', state: 'next' },
  { id: 'P4', name: 'Retirement', body: 'Legacy builders removed only after every brand is green through a full prod bake.', state: 'future' },
]

export default function ExecutiveOverview() {
  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="01 · Executive overview"
        title="Replacing the engine without stopping the car"
        lede="Albion's Guidewire estate talks to a POLARIS mainframe through 22 fixed-width record builders across four brands. We are replacing them one component at a time behind flags. Dev now runs the new code with the old code watching every record; sit, uat/preprod and prod stay on the old code until a live window proves parity there too — and it is one switch back if it ever does not."
        aside={
          <div className="panel px-5 py-4 text-left">
            <div className="eyebrow">Migration posture</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-candidate" />
              <span className="text-lg font-semibold text-white">Phase 3A — dev cut over</span>
            </div>
            <div className="mt-1 text-xs muted">Legacy authoritative in every environment beyond dev</div>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {HEADLINE_STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Stat label={s.label} value={s.value} sub={s.sub} tone={i === 3 ? 'teal' : 'gold'} />
          </motion.div>
        ))}
      </div>

      <Panel
        eyebrow="Where we got to this week"
        title={PHASE3A_STATE.headline}
        aside="Phase 3A · dev only"
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
          <ol className="space-y-3">
            {PHASE3A_STATE.bullets.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex gap-4 rounded-xl border border-white/5 bg-ink-800/60 p-4"
              >
                <span className="font-mono text-xs text-gold-500">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-sm leading-relaxed text-slate-300">{b}</p>
              </motion.li>
            ))}
          </ol>

          <div className="space-y-4">
            <div className="rounded-xl border border-gold-500/25 bg-gold-500/[0.06] p-5">
              <div className="eyebrow text-gold-400/90">GREEN_REPLAY vs GREEN</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Two different words, deliberately. Replay proves the code produces identical bytes; only a live window
                proves the platform does. CI knows the difference and refuses to let the weaker evidence travel.
              </p>
              <div className="mt-4 space-y-2">
                {EVIDENCE_LADDER.map((e) => (
                  <div key={e.status} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px]">
                    <span className="w-28 shrink-0 font-mono text-white">{e.status}</span>
                    <span className="min-w-0 flex-1 text-slate-400">{e.evidence}</span>
                    <span className="font-mono text-gold-300">{e.permits}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {REPLAY_STREAMS.map((s) => (
                <div key={s.id} className="rounded-xl border border-white/5 bg-ink-800/60 p-4">
                  <div className="font-mono text-[11px] text-candidate">Stream {s.id}</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {s.cases.toLocaleString('en-GB')}
                  </div>
                  <div className="text-[11px] muted">cases · {s.failures} failures</div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-white/5 pt-5 lg:grid-cols-2">
          <div>
            <div className="eyebrow text-alert/80">What replay cannot prove — so prod stays gated</div>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-400">
              {REPLAY_LIMITS.map((l) => (
                <li key={l} className="flex gap-2">
                  <span className="text-alert/70">·</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow">Green means something — the harness was made to fail</div>
            <div className="mt-2 space-y-2">
              {HARNESS_SELF_CHECKS.map((h) => (
                <div key={h.probe} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/5 bg-ink-800/60 px-4 py-2.5 text-xs">
                  <span className="text-slate-300">{h.probe}</span>
                  <span className="text-slate-500">→ {h.expected}</span>
                  <Tag tone="green">{h.result}</Tag>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Mutated fixtures and mutated brand mappings were both caught, then restored — a green run that cannot go
              red is not evidence.
            </p>
          </div>
        </div>
      </Panel>

      <Panel eyebrow="The story in one line" title="Zero business detriment, proven not promised">
        <div className="grid gap-6 lg:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className="rounded-xl border border-white/5 bg-ink-800/60 p-5"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-gold-500">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-base font-semibold text-white">{p.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Programme shape" title="Six steps, every one of them reversible" aside="Phase 3A in flight">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * i }}
              className={
                'relative overflow-hidden rounded-xl border p-4 ' +
                (p.state === 'active'
                  ? 'border-candidate/40 bg-candidate/5'
                  : p.state === 'done'
                    ? 'border-emerald-400/20 bg-emerald-400/5'
                    : 'border-white/5 bg-ink-800/50')
              }
            >
              {p.state === 'active' && (
                <span className="absolute inset-x-0 top-0 h-px w-1/3 animate-pulseline bg-candidate/70" />
              )}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500">{p.id}</span>
                {p.state === 'done' && <Tag tone="green">complete</Tag>}
                {p.state === 'active' && <Tag tone="teal">in flight</Tag>}
                {p.state === 'next' && <Tag tone="gold">gated</Tag>}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-white">{p.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Panel eyebrow="Sequencing" title="Blast radius, smallest first">
          <ol className="space-y-3">
            {BRANDS.map((b, i) => (
              <li key={b.code} className="flex items-start gap-4 rounded-xl border border-white/5 bg-ink-800/50 p-4">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gold-500/30 bg-gold-500/10 font-mono text-xs text-gold-400">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-white">{b.code}</span>
                    <span className="text-sm text-slate-300">{b.label}</span>
                    {b.code === 'HERIT' && <Tag tone="alert">last</Tag>}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{b.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Environment order is enforced in CI on top of brand order: dev → sit → uat/preprod → prod. A later
            environment cannot be enabled before every earlier one is green, and prod and dr stay dormant while any row
            is short of GREEN.
          </p>
        </Panel>

        <Panel
          eyebrow="Where we are"
          title="Gate position across 124 rows"
          aside={`${GATE_TOTALS.greenReplay} on replay evidence · ${GATE_TOTALS.green} live green`}
        >
          <div className="space-y-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-ink-800">
              {[
                { n: GATE_TOTALS.green, cls: 'bg-emerald-400' },
                { n: GATE_TOTALS.greenReplay, cls: 'bg-gold-500' },
                { n: GATE_TOTALS.pending, cls: 'bg-slate-600' },
              ].map((seg, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: `${(seg.n / GATE_TOTALS.total) * 100}%` }}
                  transition={{ delay: 0.15 * i, duration: 0.7, ease: 'easeOut' }}
                  className={seg.cls}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              {[
                ['GREEN_REPLAY', GATE_TOTALS.greenReplay, 'text-gold-300'],
                ['GREEN (live)', GATE_TOTALS.green, 'text-emerald-300'],
                ['Cut over in dev', GATE_TOTALS.devCutover, 'text-candidate'],
                ['Comparator only', GATE_TOTALS.devShadowOnly, 'text-slate-400'],
              ].map(([label, n, cls]) => (
                <div key={String(label)} className="rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2">
                  <div className={`text-xl font-semibold tabular-nums ${cls}`}>{n as number}</div>
                  <div className="muted">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              {ENV_PROMOTION.map((e) => (
                <div key={e.env} className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-800/50 px-4 py-3">
                  <span className="font-mono text-xs text-gold-500">{e.order}</span>
                  <span className="font-mono text-sm font-medium text-white">{e.env}</span>
                  {e.state === 'CUT OVER' ? <Tag tone="teal">cut over</Tag> : <Tag>on legacy</Tag>}
                  <span className="ml-auto text-xs tabular-nums text-slate-400">{e.flagsEnabled} flags on</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Known risks, named controls" title="Nothing on this list is a surprise">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4 font-medium">Risk carried from the legacy estate</th>
                <th className="pb-3 pr-4 font-medium">Control</th>
                <th className="pb-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RISK_REGISTER.map((r) => (
                <tr key={r.risk} className="align-top">
                  <td className="py-3 pr-4 text-slate-200">{r.risk}</td>
                  <td className="py-3 pr-4 text-slate-400">{r.control}</td>
                  <td className="py-3">
                    <Tag tone={r.severity === 'high' ? 'alert' : r.severity === 'medium' ? 'gold' : 'slate'}>
                      {r.severity}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

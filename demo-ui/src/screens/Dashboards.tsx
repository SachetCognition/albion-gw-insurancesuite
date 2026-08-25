import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Panel, ScreenHeader, Stat, Tag } from '../components/ui'
import {
  BRANDS,
  GATE_ROWS,
  PARITY_TREND,
  ROLLBACK_DRILLS,
  THROUGHPUT_BASELINES,
  THROUGHPUT_TREND,
} from '../data/mock'

const AXIS = { stroke: '#4b5b7a', fontSize: 11 }
const TOOLTIP = {
  contentStyle: {
    background: '#0b1224',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: '#e8bf6a' },
}

export default function Dashboards() {
  const brandProgress = BRANDS.map((b) => {
    const rows = GATE_ROWS.filter((r) => r.brand === b.code)
    return {
      brand: b.code,
      green: rows.filter((r) => r.status === 'GREEN').length,
      shadow: rows.filter((r) => r.status === 'SHADOW').length,
      pending: rows.filter((r) => r.status === 'PENDING' || r.status === 'BLOCKED').length,
    }
  })

  const totalCompared = GATE_ROWS.reduce((a, r) => a + r.recordsCompared, 0)
  const openDiffs = GATE_ROWS.reduce((a, r) => a + r.diffs, 0)

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="05 · Dashboards"
        title="Parity, throughput, and the rollback we rehearse"
        lede="Three numbers decide whether a component flips: does it produce identical bytes, does it keep up with the real peak, and can we put it back in seconds. All three are measured before a flag moves."
        aside={
          <div className="panel px-5 py-4 text-left">
            <div className="eyebrow">Programme headline</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {(totalCompared / 1_000_000).toFixed(1)}M <span className="text-sm font-normal muted">records diffed</span>
            </div>
            <div className="text-xs muted">{openDiffs} unexplained diffs open</div>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Byte-exact match rate" value="99.9997%" sub="tolerance is zero — every diff investigated" />
        <Stat label="Open unexplained diffs" value={String(openDiffs)} sub="blocks the affected gate rows" tone="teal" />
        <Stat label="Throughput vs baseline" value="+7.4%" sub="candidate-alone vs legacy-alone, same run" />
        <Stat label="Rollback time (drill mean)" value="10 s" sub="flag flip; no deploy, no data change" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Parity reconciliation" title="Diffs fall to zero and stay there" aside="8-week non-prod shadow window">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={PARITY_TREND} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gCompared" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3fd0c9" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3fd0c9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={AXIS} axisLine={false} tickLine={false} unit="M" />
              <YAxis yAxisId="r" orientation="right" tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Area
                yAxisId="l"
                type="monotone"
                dataKey="compared"
                name="records compared (M)"
                stroke="#3fd0c9"
                fill="url(#gCompared)"
                strokeWidth={2}
              />
              <Line
                yAxisId="r"
                type="monotone"
                dataKey="diffs"
                name="unexplained diffs"
                stroke="#ff6b6b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Record builders carry tolerance zero. Only month-end IPT counts carry a documented &lt;0.1% relative
            tolerance — record bytes stay exact.
          </p>
        </Panel>

        <Panel eyebrow="Load-test gate" title="Candidate must be parity-or-better on the same run" aside="MID feed, perf environment">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={THROUGHPUT_TREND} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} unit="k" domain={[650, 900]} />
              <Tooltip {...TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <ReferenceLine y={743} stroke="#e8bf6a" strokeDasharray="4 4" label={{ value: 'prod peak 743k/day', fill: '#e8bf6a', fontSize: 10, position: 'insideBottomRight' }} />
              <Line type="monotone" dataKey="legacy" name="legacy alone (k/day)" stroke="#7c8bab" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="candidate" name="candidate alone (k/day)" stroke="#3fd0c9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Peak profile must include renewals + catastrophe combined — all three big feeds peak on that combination,
            not on average days.
          </p>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Panel eyebrow="Throughput vs Phase-0 baselines" title="MID 743k · IPT 437k · DWH 429k records/day">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={THROUGHPUT_BASELINES} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="feed" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip {...TOOLTIP} formatter={(v) => Number(v).toLocaleString('en-GB')} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="baseline" name="prod peak baseline" fill="#33415c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="candidate" name="candidate alone" fill="#3fd0c9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cutoverMode" name="cut-over mode (with reverse shadow)" fill="#d4a441" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Cut-over mode doubles builder work by design, so the gate is measured twice: candidate-alone ≥ legacy-alone,
            and cut-over mode ≥ observed prod peak.
          </p>
        </Panel>

        <Panel eyebrow="Gate progress by brand" title="ALBDIR leads, HERIT last by design">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={brandProgress} layout="vertical" margin={{ top: 8, right: 16, left: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="brand" tick={AXIS} axisLine={false} tickLine={false} width={60} />
              <Tooltip {...TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="green" name="green" stackId="a" fill="#34d399">
                {brandProgress.map((b) => (
                  <Cell key={b.brand} />
                ))}
              </Bar>
              <Bar dataKey="shadow" name="shadow window" stackId="a" fill="#3fd0c9" />
              <Bar dataKey="pending" name="not started / blocked" stackId="a" fill="#33415c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-2">
            {BRANDS.map((b) => (
              <Tag key={b.code} tone={b.code === 'HERIT' ? 'alert' : 'slate'}>
                {b.code} · {b.label}
              </Tag>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        eyebrow="Rollback drills"
        title="We practise going back, not just going forward"
        aside="No drill has ever required a deploy or a data change"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4 font-medium">Drill</th>
                <th className="pb-3 pr-4 font-medium">Scope</th>
                <th className="pb-3 pr-4 font-medium">Trigger</th>
                <th className="pb-3 pr-4 font-medium">Divergence detected</th>
                <th className="pb-3 pr-4 font-medium">Back on legacy in</th>
                <th className="pb-3 pr-4 font-medium">Data changes</th>
                <th className="pb-3 font-medium">Deploy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ROLLBACK_DRILLS.map((d) => (
                <tr key={d.id}>
                  <td className="py-3 pr-4 font-mono text-xs text-gold-300">{d.id}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-300">{d.scope}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{d.trigger}</td>
                  <td className="py-3 pr-4 text-xs text-slate-300">{d.detected}</td>
                  <td className="py-3 pr-4 text-xs text-emerald-300">{d.reverted}</td>
                  <td className="py-3 pr-4 text-xs tabular-nums text-slate-300">{d.dataChanges}</td>
                  <td className="py-3 text-xs text-slate-400">{d.deploy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

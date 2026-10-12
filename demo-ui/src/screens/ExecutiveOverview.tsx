import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Panel, PlannedTag, ScreenHeader, Source, Stat, Tag } from '../components/ui'
import { BRANDS, FACTS, MONTHLY_RECORDS_K, TRANSPORT_PLUGINS, fmt, plain } from '../data/facts'
import { HAS_CUTOVER, HAS_RECON, HAS_SHADOW } from '../data/evidence'

const { totals, checks, environments: env, batch } = FACTS
const encryptedIn = FACTS.centres.filter((c) => c.encryptionPlugin).length

const HEADLINES = [
  { label: 'Core platforms', value: String(FACTS.centres.length), sub: FACTS.centres.map((c) => c.name).join(' · ') },
  {
    label: 'External interfaces',
    value: String(FACTS.interfaces.length),
    sub: `≈${fmt(Math.round(MONTHLY_RECORDS_K / 1000))}M records a month to regulators, partners and the mainframe`,
  },
  { label: 'Business rules', value: fmt(totals.rules), sub: `${totals.ruleSets} rule sets in native Guidewire format` },
  { label: 'Activity patterns', value: String(totals.activityPatterns), sub: 'Work-queue templates held as managed data' },
  {
    label: 'Scheduled batch jobs',
    value: String(batch.jobs.length),
    sub: `${batch.onRequestJcl} further mainframe jobs run on request only`,
  },
  {
    label: 'Environments',
    value: String(env.environments.length),
    sub: `${env.distinctVaultTokens} credentials and keys held in the vault`,
  },
]

const FOUNDATION = [
  `One brand definition shared by all ${checks.drift.centres} platforms: ${checks.drift.typecodes} brand codes and ${checks.drift.serviceFiles} shared configuration services, proven identical on every build.`,
  `${fmt(totals.rules)} business rules in ${totals.ruleSets} rule sets now live in Guidewire's own rule format, so they can be read, tested and changed like product configuration.`,
  `${TRANSPORT_PLUGINS.length} outbound connectors are registered as standard Guidewire plugins across the ${FACTS.centres.length} platforms.`,
  `${totals.activityPatterns} activity patterns are loaded as managed data and checked against the code that raises them.`,
  `${env.templates} configuration templates across ${env.environments.length} environments: no passwords or keys in files, ${env.distinctVaultTokens} values resolved from CyberArk at deploy time.`,
  `National Insurance numbers and customer bank details are encrypted at rest (AES-256); the encryption service is registered in ${encryptedIn} of ${FACTS.centres.length} platforms.`,
  `Every change runs a ${FACTS.pipelineStages.length}-stage release pipeline: brand drift, estate coherence, compile, unit tests and code-quality gate. A failure stops the release.`,
]

type PhaseState = 'done' | 'evidence' | 'planned'
const PHASES: { id: string; name: string; body: string; state: PhaseState }[] = [
  {
    id: 'Phase 1',
    name: 'Make the estate safe to change',
    body: 'Configuration, rules, connectors, secrets and encryption brought under one controlled, checked build.',
    state: 'done',
  },
  {
    id: 'Phase 2',
    name: 'Shadow run and reconcile',
    body: 'New interface code runs alongside the current code on real traffic; every outbound record and control total is compared before anything is switched.',
    state: HAS_SHADOW || HAS_RECON ? 'evidence' : 'planned',
  },
  {
    id: 'Phase 3',
    name: 'Controlled cutover',
    body: 'Switch one interface, one brand, one environment at a time, with the current code kept warm so any switch can be reversed immediately.',
    state: HAS_CUTOVER ? 'evidence' : 'planned',
  },
  {
    id: 'Phase 4',
    name: 'Retire legacy dependencies',
    body: 'Remove superseded record builders and mainframe hand-offs once every brand has run cleanly in production.',
    state: 'planned',
  },
]

export default function ExecutiveOverview() {
  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="01 · Executive overview"
        title="Modernising the engine while it keeps running"
        lede={`Albion's claims, policy, billing and customer platforms exchange data with ${FACTS.interfaces.length} regulators, partners and the POLARIS mainframe. The foundation work is complete and enforced on every release. The next step is to prove new interface code against live traffic before any customer, partner or regulator sees a change.`}
        aside={
          <div className="panel px-5 py-4 text-left">
            <div className="eyebrow">Programme position</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-lg font-semibold text-white">Phase 1 complete</span>
            </div>
            <div className="mt-1 text-xs muted">Phase 2 shadow run is next · no traffic switched</div>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {HEADLINES.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * (i + 1) }}>
            <Stat label={s.label} value={s.value} sub={s.sub} tone={i % 2 ? 'teal' : 'gold'} />
          </motion.div>
        ))}
      </div>

      <Panel eyebrow="Roadmap" title="Four phases, each gated on evidence">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * (i + 1) }}
              className={clsx(
                'rounded-xl border p-5',
                p.state === 'done' && 'border-emerald-400/30 bg-emerald-400/[0.06]',
                p.state === 'evidence' && 'border-candidate/30 bg-candidate/[0.06]',
                p.state === 'planned' && 'border-dashed border-white/10 bg-ink-800/50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-gold-400">{p.id}</span>
                {p.state === 'done' && <Tag tone="green">In place</Tag>}
                {p.state === 'evidence' && <Tag tone="teal">Evidence loaded</Tag>}
                {p.state === 'planned' && <PlannedTag phase="next" />}
              </div>
              <div className="mt-2 text-base font-semibold text-white">{p.name}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel eyebrow="Phase 1 · in place today" title="What the foundation already delivers">
          <ol className="space-y-3">
            {FOUNDATION.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * (i + 1) }}
                className="flex gap-4 rounded-xl border border-white/5 bg-ink-800/60 p-4"
              >
                <span className="font-mono text-xs text-gold-500">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-sm leading-relaxed text-slate-300">{b}</p>
              </motion.li>
            ))}
          </ol>
          <Source>
            counts computed from the platform configuration, <span className="font-mono">environments/</span>,{' '}
            <span className="font-mono">Jenkinsfile</span> and the brand drift check.
          </Source>
        </Panel>

        <div className="space-y-6">
          <Panel eyebrow="Release gates · run at this commit" title="The estate checks itself on every change">
            <div className="space-y-3">
              {[
                {
                  name: 'Brand consistency',
                  what: `${checks.drift.typelists} brand lists, ${checks.drift.xrefRows} mainframe brand mappings, ${checks.drift.serviceFiles} shared services and ${checks.drift.keys} settings in ${checks.drift.envFiles} environment files agree`,
                  check: checks.drift,
                  result: checks.drift.passed ? 'OK' : 'FAILED',
                },
                {
                  name: 'Estate coherence',
                  what: 'Every rule, screen, plugin, activity pattern and batch job references something that exists',
                  check: checks.coherence,
                  result: `${checks.coherence.totalFindings ?? '?'} findings`,
                },
              ].map((g) => (
                <div key={g.name} className="rounded-xl border border-white/5 bg-ink-800/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{g.name}</div>
                    <Tag tone={g.check.passed ? 'green' : 'alert'}>{g.result}</Tag>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{g.what}</p>
                  <div className="mt-2 truncate font-mono text-[10px] text-slate-500" title={g.check.output}>
                    $ {g.check.command}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {FACTS.pipelineStages.map((s, i) => (
                <span key={s} className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-[10px] text-slate-400">
                  <span className="mr-1 font-mono text-gold-500/70">{i + 1}</span>
                  {s}
                </span>
              ))}
            </div>
            <Source>
              both checks executed by the fact collector at commit {FACTS.commit}; stage list from{' '}
              <span className="font-mono">Jenkinsfile</span>. Compile and unit-test stages run in the licensed Guidewire
              build, not in this briefing.
            </Source>
          </Panel>

          <Panel eyebrow="Brands in scope" title={`${BRANDS.length} brands, one definition`}>
            <div className="grid grid-cols-2 gap-3">
              {BRANDS.map((b) => (
                <div key={b.code} className="rounded-xl border border-white/5 bg-ink-800/60 p-4">
                  <div className="text-sm font-semibold text-white">{b.label}</div>
                  <div className="mt-1 font-mono text-[11px] text-gold-400">{b.code}</div>
                  <div className="mt-1 text-[11px] muted">Mainframe codes {b.polarisCodes.join(', ')}</div>
                </div>
              ))}
            </div>
            <Source>
              <span className="font-mono">integration/polaris/mappings/brand_xref.csv</span> (retired codes excluded).
            </Source>
          </Panel>
        </div>
      </div>

      <Panel eyebrow="Why the next phases matter" title="Structural risks recorded in the estate overview">
        <div className="grid gap-3 md:grid-cols-2">
          {FACTS.estate.systemicIssues.map((s, i) => (
            <div key={s} className="flex gap-3 rounded-xl border border-white/5 bg-ink-800/60 p-4">
              <span className="font-mono text-xs text-alert/80">R{i + 1}</span>
              <p className="text-sm leading-relaxed text-slate-300">{plain(s)}</p>
            </div>
          ))}
        </div>
        <Source>
          <span className="font-mono">{FACTS.estate.source}</span>, “Known systemic issues”.
        </Source>
      </Panel>
    </div>
  )
}

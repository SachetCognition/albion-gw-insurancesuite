import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Bar, Panel, PlannedTag, ScreenHeader, Source, Stat, Tag } from '../components/ui'
import { BRANDS, CENTRE_NAME, FACTS, fmt, retryPolicy } from '../data/facts'
import { EVIDENCE, HAS_CUTOVER, authorityOf } from '../data/evidence'
import type { Authority } from '../data/types'

const { batch, environments: env } = FACTS
const CADENCES = ['Nightly', 'Weekly', 'Month-end'] as const
const AUTHORITY_STYLE: Record<Authority, { label: string; cls: string }> = {
  CURRENT: { label: 'Current code', cls: 'bg-legacy/25 border-legacy/40' },
  SHADOW: { label: 'Shadow run', cls: 'bg-gold-500/30 border-gold-500/50' },
  NEW: { label: 'New code', cls: 'bg-candidate/40 border-candidate/60' },
}
const maxRules = Math.max(...FACTS.centres.map((c) => c.rules))

export default function ControlTower() {
  const [envName, setEnvName] = useState<string>(env.environments.includes('dev') ? 'dev' : env.environments[0])
  const [selected, setSelected] = useState<string>(FACTS.interfaces[0].id)
  const iface = FACTS.interfaces.find((i) => i.id === selected) ?? FACTS.interfaces[0]
  const builderFields = Math.max(0, iface.layout.length - 1)

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="02 · Estate control tower"
        title="Everything that has to keep working, in one view"
        lede="The four platforms, every external interface, the batch schedule that drives them and the environments they run in, read directly from the repository. The cutover columns show who is producing each feed today; they change only when cutover evidence is committed."
        aside={
          <div className="panel px-5 py-4 text-left">
            <div className="eyebrow">Traffic switched to new code</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {EVIDENCE.cutover.filter((c) => c.authority === 'NEW').length}
              <span className="text-sm font-normal muted"> of {FACTS.interfaces.length * BRANDS.length} interface × brand feeds</span>
            </div>
            <div className="text-xs muted">{HAS_CUTOVER ? 'from committed cutover evidence' : 'no cutover evidence committed'}</div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FACTS.centres.map((c, i) => (
          <motion.div key={c.code} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * (i + 1) }}>
            <div className="panel h-full p-5">
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-semibold text-white">{c.name}</div>
                <span className="font-mono text-[11px] text-gold-400">{FACTS.interfaces.filter((x) => x.centre === c.code).length} interfaces</span>
              </div>
              <p className="mt-1 text-xs muted">{c.purpose}</p>
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Business rules</span>
                  <span className="tabular-nums text-white">
                    {c.rules} <span className="muted">in {c.ruleSets} sets</span>
                  </span>
                </div>
                <Bar value={c.rules} max={maxRules} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {[
                  ['Activity patterns', c.activityPatterns],
                  ['Screens', c.screens],
                  ['Code modules', c.gosuClasses],
                  ['Unit tests', c.unitTests],
                  ['Data extensions', c.entityExtensions],
                  ['Encrypted columns', c.encryptedColumns],
                  ['Outbound channels', c.outboundDestinations],
                  ['Connector plugins', c.transports.length],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-white/5 pb-1">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="tabular-nums text-slate-200">{fmt(Number(v))}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        ))}
      </div>

      <Panel
        eyebrow="Interface register · cutover position"
        title={`${FACTS.interfaces.length} external interfaces × ${BRANDS.length} brands`}
        aside={
          <div className="flex flex-wrap items-center justify-end gap-1">
            <span className="mr-1">Environment</span>
            {env.environments.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEnvName(e)}
                className={clsx(
                  'rounded-md px-2 py-0.5 font-mono text-[11px]',
                  envName === e ? 'bg-gold-500/20 text-gold-300' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {e}
              </button>
            ))}
          </div>
        }
        bodyClassName="px-0 py-0"
      >
        <div className="grid xl:grid-cols-[1.7fr_1fr]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 font-medium">Interface</th>
                  <th className="px-3 py-3 font-medium">Platform</th>
                  <th className="px-3 py-3 font-medium">Volume</th>
                  {BRANDS.map((b) => (
                    <th key={b.code} className="px-1 py-3 text-center font-mono font-medium" title={b.label}>
                      {b.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FACTS.interfaces.map((i) => (
                  <tr
                    key={i.id}
                    onClick={() => setSelected(i.id)}
                    className={clsx(
                      'cursor-pointer border-b border-white/[0.03] transition-colors',
                      selected === i.id ? 'bg-gold-500/[0.07]' : 'hover:bg-white/[0.02]',
                    )}
                  >
                    <td className="px-6 py-2">
                      <div className="font-medium text-white">{i.name}</div>
                      <div className="text-[11px] text-slate-500">{i.description}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-400">{CENTRE_NAME[i.centre]}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-slate-300">{i.volume.replace('~', '≈')}</td>
                    {BRANDS.map((b) => {
                      const a = authorityOf(i.id, b.code, envName)
                      return (
                        <td key={b.code} className="px-1 py-2">
                          <div
                            className={clsx('mx-auto h-4 w-8 rounded border', AUTHORITY_STYLE[a].cls)}
                            title={`${i.name} · ${b.label} · ${envName}: ${AUTHORITY_STYLE[a].label}`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center gap-4 px-6 py-3 text-[11px] text-slate-400">
              {Object.entries(AUTHORITY_STYLE).map(([k, s]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className={clsx('h-3 w-5 rounded border', s.cls)} />
                  {s.label}
                </span>
              ))}
              {!HAS_CUTOVER && <PlannedTag phase="Phase 3 cutover" />}
            </div>
          </div>

          <div className="border-t border-white/5 p-6 xl:border-l xl:border-t-0">
            <div className="eyebrow">{iface.id}</div>
            <div className="mt-1 text-lg font-semibold text-white">{iface.description}</div>
            <dl className="mt-4 space-y-2 text-xs">
              {[
                ['Owning platform', CENTRE_NAME[iface.centre]],
                ['Transport', iface.transport],
                ['Volume', iface.volume.replace('~', '≈')],
                ['Error handling', retryPolicy(iface.retry)],
                ['Record width', iface.recordWidth ? `${iface.recordWidth} characters, fixed width` : '—'],
                ['Mainframe layout', iface.copybook],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/5 pb-1.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right text-slate-200">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-xl border border-alert/25 bg-alert/[0.05] p-4">
              <div className="eyebrow text-alert/80">Why this needs a shadow run</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                The mainframe layout defines <span className="font-semibold text-white">{iface.copybookFields} fields</span>; the
                code that builds the record today writes <span className="font-semibold text-white">{builderFields}</span> and pads
                the rest. Production behaviour, not the document, is the specification — so replacements must be proven
                against live output.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {Object.entries(iface.samples).map(([k, n]) => (
                <Tag key={k} tone={k === 'good' ? 'green' : k === 'prod_incident' ? 'alert' : 'slate'}>
                  {n} {k.replace('_', ' ')} sample{n === 1 ? '' : 's'}
                </Tag>
              ))}
            </div>
            <Source>
              <span className="font-mono">docs/interfaces/interface-contract-inventory.csv</span> and{' '}
              <span className="font-mono">integration/samples/{iface.name.toLowerCase().replace(' ', '_')}/</span>. Cutover
              cells: {HAS_CUTOVER ? EVIDENCE.sources.join(', ') : 'no cutover evidence committed, so every feed shows current code'}.
            </Source>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          eyebrow="Batch schedule · Control-M"
          title={`${batch.jobs.length} scheduled jobs on ${batch.nodes.length} batch servers`}
          aside={`${batch.onRequestJcl} on-request jobs not scheduled`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {CADENCES.map((cad) => {
              const jobs = batch.jobs.filter((j) => j.cadence === cad)
              return (
                <div key={cad}>
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm font-semibold text-white">{cad}</div>
                    <span className="font-mono text-xs text-gold-400">{jobs.length}</span>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {jobs.map((j) => (
                      <li key={j.job} className="rounded-lg border border-white/5 bg-ink-800/60 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-candidate">{j.job}</span>
                          <span className="text-[10px] text-slate-500">{j.area}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] leading-snug text-slate-400">{j.description}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          <Source>
            <span className="font-mono">batch/controlm/*.xml</span> ({batch.jobsWithJcl} of {batch.jobs.length} jobs matched to a
            scheduled JCL member in <span className="font-mono">batch/jcl/</span>; on-request members in{' '}
            <span className="font-mono">batch/jcl/adhoc/</span>).
          </Source>
        </Panel>

        <Panel eyebrow="Environments" title={`${env.environments.length} environments, no secrets in files`}>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Config templates" value={String(env.templates)} sub={`${env.templates / env.environments.length} per environment`} tone="plain" />
            <Stat label="Vault references" value={fmt(env.vaultTokenReferences)} sub={`${env.distinctVaultTokens} distinct secrets`} tone="teal" />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {env.environments.map((e) => (
              <span key={e} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-slate-300">
                {e}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Database, mainframe, partner and encryption credentials are placeholders resolved from CyberArk at deploy time,
            including {env.encryptionKeyTokens.length} encryption-key entries covering current, retired and key-identifier
            values for each protected data domain.
          </p>
          <Source>
            <span className="font-mono">environments/*/*.template</span>.
          </Source>
        </Panel>
      </div>
    </div>
  )
}

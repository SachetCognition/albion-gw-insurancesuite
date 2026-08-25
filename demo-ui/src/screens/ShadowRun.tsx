import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { Panel, ScreenHeader, Tag } from '../components/ui'
import { SHADOW_RECORDS } from '../data/mock'

type Verdict = 'MATCH' | 'MISMATCH'

interface Processed {
  ref: string
  brand: string
  verdict: Verdict
  emitted: 'legacy' | 'candidate'
  reverted: boolean
}

const TICK_MS = 1500

function firstDifference(a: string, b: string): number | undefined {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) return i
  }
  return undefined
}

export default function ShadowRun() {
  const [index, setIndex] = useState(0)
  const [running, setRunning] = useState(true)
  const [log, setLog] = useState<Processed[]>([])

  const record = SHADOW_RECORDS[index % SHADOW_RECORDS.length]
  const mismatchAt = firstDifference(record.legacy, record.candidate)
  const mismatch = mismatchAt !== undefined

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => {
      setLog((l) =>
        [
          {
            ref: record.ref,
            brand: record.brand,
            verdict: (mismatch ? 'MISMATCH' : 'MATCH') as Verdict,
            emitted: 'legacy' as const,
            reverted: mismatch,
          },
          ...l,
        ].slice(0, 8),
      )
      setIndex((i) => i + 1)
    }, TICK_MS)
    return () => clearTimeout(t)
  }, [running, index, mismatch, record])

  const reset = useCallback(() => {
    setIndex(0)
    setLog([])
    setRunning(true)
  }, [])

  const jumpToMismatch = useCallback(() => {
    const i = SHADOW_RECORDS.findIndex((r) => firstDifference(r.legacy, r.candidate) !== undefined)
    const r = SHADOW_RECORDS[i]
    setRunning(false)
    setIndex(i)
    setLog((l) =>
      [{ ref: r.ref, brand: r.brand, verdict: 'MISMATCH' as Verdict, emitted: 'legacy' as const, reverted: true }, ...l].slice(0, 8),
    )
  }, [])

  const stats = useMemo(() => {
    const compared = log.length
    const diffs = log.filter((l) => l.verdict === 'MISMATCH').length
    return { compared, diffs, reverts: diffs, emittedByCandidate: 0 }
  }, [log])

  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="04 · Shadow run & auto-revert"
        title="The safety net that makes cut-over boring"
        lede="In shadow, the candidate builds every record beside the legacy builder and the two byte strings are compared. Legacy bytes are what leave Albion. After cut-over the comparison keeps running in reverse: a divergent candidate record auto-reverts to legacy bytes, per record, with no deploy and no data change."
        aside={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-xs font-medium text-gold-300 hover:bg-gold-500/20"
            >
              {running ? '❚❚  Pause stream' : '▶  Resume stream'}
            </button>
            <button
              type="button"
              onClick={jumpToMismatch}
              className="rounded-lg border border-alert/40 bg-alert/10 px-4 py-2 text-xs font-medium text-alert hover:bg-alert/20"
            >
              Simulate mismatch
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Records compared (session)" value={stats.compared.toLocaleString('en-GB')} tone="plain" />
        <MiniStat label="Diffs detected" value={String(stats.diffs)} tone={stats.diffs ? 'alert' : 'green'} />
        <MiniStat label="Auto-reverts to legacy" value={String(stats.reverts)} tone={stats.reverts ? 'gold' : 'green'} />
        <MiniStat label="Divergent bytes emitted" value="0" tone="green" />
      </div>

      <Panel
        eyebrow="Byte-exact reconciliation"
        title={`Comparing ${record.ref} · brand ${record.brand}`}
        aside={
          mismatch ? `Difference at byte ${(mismatchAt ?? 0) + 1} — negative overpunch` : 'Byte-for-byte identical'
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ByteLane
            title="Legacy builder"
            subtitle="Authoritative — these bytes leave Albion"
            bytes={record.legacy}
            mismatchAt={mismatchAt}
            tone="legacy"
          />
          <ByteLane
            title="Candidate builder"
            subtitle={mismatch ? 'Divergent — discarded, legacy re-emitted' : 'Shadow — proving parity'}
            bytes={record.candidate}
            mismatchAt={mismatchAt}
            tone="candidate"
          />
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex w-full items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-500">comparator</span>
            <div className="relative h-px flex-1 overflow-hidden bg-white/10">
              <span
                className={clsx(
                  'absolute inset-y-0 w-1/4 animate-pulseline',
                  mismatch ? 'bg-alert/70' : 'bg-candidate/70',
                )}
              />
            </div>
            <Tag tone={mismatch ? 'alert' : 'green'}>{mismatch ? 'MISMATCH' : 'MATCH'}</Tag>
          </div>

          <AnimatePresence mode="wait">
            {mismatch ? (
              <motion.div
                key="revert"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full rounded-xl border border-alert/40 bg-alert/[0.07] p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-alert/50 bg-alert/15 text-alert">!</span>
                  <h3 className="text-base font-semibold text-white">Auto-revert to legacy — record level, instant</h3>
                  <Tag tone="alert">ReconciliationResult raised</Tag>
                </div>
                <ol className="mt-4 grid gap-3 text-xs md:grid-cols-4">
                  {[
                    `Candidate output differs at byte ${(mismatchAt ?? 0) + 1} (negative overpunch encoding).`,
                    'Structured ReconciliationResult persisted — the auto-alert, not a log line.',
                    'Legacy bytes emitted for this record. Nothing divergent leaves the estate.',
                    'Gate row cannot go GREEN; the shadow window restarts its clock.',
                  ].map((s, i) => (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 * i }}
                      className="rounded-lg border border-white/5 bg-ink-900/60 p-3 text-slate-300"
                    >
                      <span className="mr-2 font-mono text-alert">{i + 1}</span>
                      {s}
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            ) : (
              <motion.div
                key="match"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5 text-sm text-slate-300"
              >
                Identical bytes. The comparison is recorded as evidence toward the shadow window; the customer, the
                broker, and the mainframe see exactly what they saw yesterday.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel eyebrow="Live comparison log" title="Most recent records" aside="mock stream">
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {log.map((l, i) => (
                <motion.div
                  key={`${l.ref}-${log.length - i}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={clsx(
                    'flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5 text-xs',
                    l.verdict === 'MISMATCH'
                      ? 'border-alert/30 bg-alert/[0.06]'
                      : 'border-white/5 bg-ink-800/50',
                  )}
                >
                  <span className="font-mono text-slate-300">{l.ref}</span>
                  <span className="font-mono text-[10px] text-slate-500">{l.brand}</span>
                  <Tag tone={l.verdict === 'MISMATCH' ? 'alert' : 'green'}>{l.verdict}</Tag>
                  <span className="ml-auto text-slate-400">
                    emitted: <span className="text-legacy">legacy</span>
                  </span>
                  {l.reverted && <Tag tone="gold">auto-reverted</Tag>}
                </motion.div>
              ))}
            </AnimatePresence>
            {log.length === 0 && <p className="text-xs muted">Stream paused — press resume.</p>}
          </div>
        </Panel>

        <Panel eyebrow="How the router behaves" title="ShadowRunner and CutoverRouter">
          <div className="space-y-3 text-sm">
            {[
              {
                mode: 'Phase 2 — shadow',
                body: 'Legacy authoritative. Candidate runs on every record; output compared and thrown away. Diffs become ReconciliationResult records.',
                tone: 'teal' as const,
              },
              {
                mode: 'Phase 3 — cut over (flag on, one brand)',
                body: 'Candidate authoritative for that brand only. Legacy still runs on every record as the reverse shadow; any diff or candidate exception auto-reverts that record to legacy bytes.',
                tone: 'gold' as const,
              },
              {
                mode: 'Rollback',
                body: 'Same flag set to false. No deploy, no data change, byte-invisible downstream because the bytes were identical throughout the bake.',
                tone: 'green' as const,
              },
              {
                mode: 'Retirement',
                body: 'Legacy builder deleted only after every brand of that builder is green in prod through its full bake, as its own reviewed change.',
                tone: 'slate' as const,
              },
            ].map((m) => (
              <div key={m.mode} className="rounded-xl border border-white/5 bg-ink-800/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone={m.tone}>{m.mode}</Tag>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{m.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: 'plain' | 'green' | 'alert' | 'gold' }) {
  return (
    <div className="panel px-5 py-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div
        className={clsx(
          'mt-2 text-3xl font-semibold tabular-nums',
          tone === 'plain' && 'text-white',
          tone === 'green' && 'text-emerald-300',
          tone === 'alert' && 'text-alert',
          tone === 'gold' && 'text-gold-400',
        )}
      >
        {value}
      </div>
    </div>
  )
}

function ByteLane({
  title,
  subtitle,
  bytes,
  mismatchAt,
  tone,
}: {
  title: string
  subtitle: string
  bytes: string
  mismatchAt?: number
  tone: 'legacy' | 'candidate'
}) {
  return (
    <div
      className={clsx(
        'rounded-xl border p-5',
        tone === 'legacy' ? 'border-legacy/30 bg-legacy/[0.06]' : 'border-candidate/30 bg-candidate/[0.06]',
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className={clsx('text-[10px] uppercase tracking-wider', tone === 'legacy' ? 'text-legacy' : 'text-candidate')}>
          {tone === 'legacy' ? 'legacy' : 'candidate'}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-[3px] font-mono text-[11px]">
        {bytes.split('').map((ch, i) => (
          <motion.span
            key={`${i}-${ch}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.006 * i }}
            className={clsx(
              'grid h-6 w-[18px] place-items-center rounded-[3px] border',
              mismatchAt === i
                ? 'border-alert bg-alert/25 text-white'
                : 'border-white/5 bg-ink-900/70 text-slate-300',
            )}
          >
            {ch === ' ' ? '·' : ch}
          </motion.span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
        <span>prefix MI56</span>
        <span>·</span>
        <span>{bytes.length} bytes shown of 600</span>
        <span>·</span>
        <span>brand in trailing 6 bytes</span>
      </div>
    </div>
  )
}

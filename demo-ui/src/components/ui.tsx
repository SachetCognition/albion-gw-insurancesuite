import type { ReactNode } from 'react'
import clsx from 'clsx'
import { FACTS } from '../data/facts'

export function Panel({
  title,
  eyebrow,
  aside,
  className,
  bodyClassName,
  children,
}: {
  title?: string
  eyebrow?: string
  aside?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <section className={clsx('panel', className)}>
      {(title || eyebrow || aside) && (
        <header className="panel-hd">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            {title && <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>}
          </div>
          {aside && <div className="shrink-0 text-right text-xs muted">{aside}</div>}
        </header>
      )}
      <div className={clsx('px-6 py-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function Stat({
  label,
  value,
  sub,
  tone = 'gold',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'gold' | 'teal' | 'plain'
}) {
  return (
    <div className="panel h-full px-5 py-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div
        className={clsx(
          'mt-2 text-3xl font-semibold tabular-nums',
          tone === 'gold' && 'text-gold-400',
          tone === 'teal' && 'text-candidate',
          tone === 'plain' && 'text-white',
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs muted">{sub}</div>}
    </div>
  )
}

export function Tag({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'gold' | 'teal' | 'alert' | 'green' }) {
  return (
    <span
      className={clsx(
        'chip',
        tone === 'slate' && 'border-white/10 bg-white/5 text-slate-300',
        tone === 'gold' && 'border-gold-500/40 bg-gold-500/10 text-gold-400',
        tone === 'teal' && 'border-candidate/40 bg-candidate/10 text-candidate',
        tone === 'alert' && 'border-alert/40 bg-alert/10 text-alert',
        tone === 'green' && 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
      )}
    >
      {children}
    </span>
  )
}

export function PlannedTag({ phase = 'Phase 2/3' }: { phase?: string }) {
  return (
    <span className="chip border-dashed border-gold-500/50 bg-transparent text-gold-300">
      Planned · {phase}
    </span>
  )
}

export function SourceBadge() {
  return (
    <span className="chip border-emerald-400/30 bg-emerald-400/10 text-emerald-300" title={`Generated ${FACTS.generatedAt}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
      Repository facts · {FACTS.commit} · {FACTS.commitDate}
    </span>
  )
}

export function Source({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[11px] leading-relaxed text-slate-500">Source: {children}</p>
}

export function EmptyEvidence({ what, className }: { what: string; className?: string }) {
  return (
    <div className={clsx('rounded-xl border border-dashed border-white/10 bg-ink-800/40 px-5 py-6 text-center', className)}>
      <div className="text-sm font-medium text-slate-300">No {what} committed yet</div>
      <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-slate-500">
        This panel fills in automatically when results are added to <span className="font-mono">demo-ui/src/data/evidence/</span>.
        Nothing is shown until then.
      </p>
    </div>
  )
}

export function Bar({ value, max, tone = 'gold' }: { value: number; max: number; tone?: 'gold' | 'teal' | 'slate' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={clsx(
          'h-full rounded-full',
          tone === 'gold' && 'bg-gradient-to-r from-gold-600 to-gold-400',
          tone === 'teal' && 'bg-gradient-to-r from-candidate/50 to-candidate',
          tone === 'slate' && 'bg-slate-500',
        )}
        style={{ width: `${max ? Math.max(2, (100 * value) / max) : 0}%` }}
      />
    </div>
  )
}

export function ScreenHeader({
  eyebrow,
  title,
  lede,
  aside,
}: {
  eyebrow: string
  title: string
  lede: string
  aside?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-3xl">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">{lede}</p>
      </div>
      {aside}
    </div>
  )
}

import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { GateStatus } from '../data/mock'
import { STATUS_STYLE } from './status'

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
    <div className="panel px-5 py-4">
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

export function StatusChip({ status }: { status: GateStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={clsx('chip', s.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
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

export function DemoBadge() {
  return (
    <span className="chip border-gold-500/40 bg-gold-500/10 text-gold-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
      MOCK DEMO DATA
    </span>
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

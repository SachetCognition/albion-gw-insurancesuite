import type { GateStatus } from '../data/mock'

export const STATUS_STYLE: Record<GateStatus, { cls: string; label: string }> = {
  GREEN: { cls: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300', label: 'GREEN' },
  SHADOW: { cls: 'border-candidate/40 bg-candidate/10 text-candidate', label: 'SHADOW' },
  PENDING: { cls: 'border-slate-500/30 bg-slate-500/10 text-slate-400', label: 'PENDING' },
  BLOCKED: { cls: 'border-alert/40 bg-alert/10 text-alert', label: 'BLOCKED' },
}

export function statusCell(status: GateStatus): string {
  return STATUS_STYLE[status].cls
}

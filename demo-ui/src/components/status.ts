import type { CellState, GateStatus } from '../data/mock'

export const STATUS_STYLE: Record<GateStatus, { cls: string; label: string }> = {
  GREEN: { cls: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300', label: 'GREEN' },
  GREEN_REPLAY: { cls: 'border-gold-500/40 bg-gold-500/10 text-gold-300', label: 'GREEN_REPLAY' },
  PENDING: { cls: 'border-slate-500/30 bg-slate-500/10 text-slate-400', label: 'PENDING' },
  BLOCKED: { cls: 'border-alert/40 bg-alert/10 text-alert', label: 'BLOCKED' },
}

export const CELL_STYLE: Record<CellState, { cls: string; label: string }> = {
  CUTOVER: { cls: 'border-candidate/40 bg-candidate/10 text-candidate', label: 'CANDIDATE' },
  SHADOW: { cls: 'border-gold-500/30 bg-gold-500/[0.07] text-gold-300', label: 'SHADOW' },
  LEGACY: { cls: 'border-slate-500/30 bg-slate-500/10 text-slate-400', label: 'LEGACY' },
}

export function statusCell(status: GateStatus): string {
  return STATUS_STYLE[status].cls
}

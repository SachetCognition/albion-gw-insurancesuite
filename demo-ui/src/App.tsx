import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { DemoBadge } from './components/ui'
import ExecutiveOverview from './screens/ExecutiveOverview'
import ControlTower from './screens/ControlTower'
import JourneyFlows from './screens/JourneyFlows'
import ShadowRun from './screens/ShadowRun'
import Dashboards from './screens/Dashboards'

const SCREENS = [
  { id: 'overview', label: 'Executive Overview', num: '01', Component: ExecutiveOverview },
  { id: 'control-tower', label: 'Migration Control Tower', num: '02', Component: ControlTower },
  { id: 'journeys', label: 'Business Journeys', num: '03', Component: JourneyFlows },
  { id: 'shadow', label: 'Shadow Run & Auto-Revert', num: '04', Component: ShadowRun },
  { id: 'dashboards', label: 'Dashboards', num: '05', Component: Dashboards },
] as const

export default function App() {
  const [active, setActive] = useState<string>(() => window.location.hash.replace('#', '') || 'overview')

  useEffect(() => {
    window.location.hash = active
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.replace('#', '')
      if (SCREENS.some((s) => s.id === id)) setActive(id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = SCREENS.findIndex((s) => s.id === active)
      if (e.key === 'ArrowRight' && i < SCREENS.length - 1) setActive(SCREENS[i + 1].id)
      if (e.key === 'ArrowLeft' && i > 0) setActive(SCREENS[i - 1].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const Current = SCREENS.find((s) => s.id === active)?.Component ?? ExecutiveOverview

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-900/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-6 py-3">
          <div className="flex items-center gap-3">
            <Crest />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-white">
                ALBION <span className="text-gold-400">GENERAL INSURANCE</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                Guidewire strangler migration
              </div>
            </div>
          </div>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {SCREENS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={clsx(
                  'group relative rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  active === s.id ? 'text-white' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                <span className="mr-1.5 font-mono text-[10px] text-gold-500/70">{s.num}</span>
                {s.label}
                {active === s.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-[7px] h-[2px] rounded-full bg-gold-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="ml-auto lg:ml-0">
            <DemoBadge />
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 lg:hidden">
          {SCREENS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={clsx(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs',
                active === s.id ? 'bg-gold-500/15 text-gold-300' : 'text-slate-400',
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Current />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mx-auto max-w-[1600px] px-6 pb-10">
        <div className="gold-rule" />
        <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
          Demonstration front-end. Every figure on every screen is hard-coded mock data shaped after the
          committed Phase 2 / Phase 3 artefacts in this repository. No Guidewire environment, mainframe, or
          production system is connected. Use ← / → to move between screens.
        </p>
      </footer>
    </div>
  )
}

function Crest() {
  return (
    <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-gold-500/30 bg-gradient-to-br from-gold-500/25 to-transparent">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2.5 4.5 5.5v6c0 4.6 3.1 8.6 7.5 10 4.4-1.4 7.5-5.4 7.5-10v-6L12 2.5Z" />
        <path d="M8.6 12.2l2.4 2.4 4.4-4.6" />
      </svg>
    </div>
  )
}

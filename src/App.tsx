import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import ThemePicker from './ThemePicker'
import AddModal from './AddModal'
import { useApp } from './store'
import { CONFIG } from './config'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Reviewers from './pages/Reviewers'
import CalendarPage from './pages/CalendarPage'
import Events from './pages/Events'
import Announcements from './pages/Announcements'
import TeacherAccess from './TeacherAccess'

// [route, emoji, full label, short label for the mobile bar]
const NAV = [
  ['/', '🏠', 'Home', 'Home'],
  ['/tasks', '📋', 'Tasks', 'Tasks'],
  ['/performance', '🎯', 'Performance', 'Perf.'],
  ['/reviewers', '📚', 'Reviewers', 'Reviews'],
  ['/calendar', '🗓️', 'Calendar', 'Cal.'],
  ['/events', '🎉', 'Events', 'Events'],
  ['/announcements', '📢', 'Announcements', 'News'],
] as const

function Shell() {
  const loc = useLocation()
  const { q, setQ, setAdding, teacher } = useApp()
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  useEffect(() => { if (searchOpen) inputRef.current?.focus() }, [searchOpen])

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 lg:pb-0">
      <header className="sticky top-0 z-30">
        {/* Utility bar */}
        <div className="bg-slate-950 text-slate-200">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 text-xs sm:gap-4 sm:px-4 sm:text-sm">
            <span className="truncate">🎓 {CONFIG.section}</span>
            <div className="ml-auto flex items-center gap-4">
              <Link to="/announcements" className="hidden font-medium hover:text-white sm:inline">📢 Announcements</Link>
              <button aria-label="Search (Ctrl K)" onClick={() => setSearchOpen((s) => !s)} className="flex items-center gap-2 hover:text-white">
                🔍 <kbd className="hidden rounded border border-slate-600 px-1.5 text-xs md:inline">Ctrl K</kbd>
              </button>
              <Link to="/announcements" aria-label="Announcements" className="hover:text-white">🔔</Link>
              <ThemePicker />
            </div>
          </div>
        </div>

        {/* Main navbar */}
        <div className="border-b border-ink/15 bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:gap-6 sm:px-4">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-lg sm:h-10 sm:w-10 sm:text-xl">📋</span>
              <span>
                <span className="block font-display text-base font-bold leading-tight text-primary sm:text-lg">{CONFIG.appName}</span>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-accent">{CONFIG.tagline}</span>
              </span>
            </Link>
            <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
              {NAV.map(([to, , label]) => (
                <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `relative py-1 text-sm font-semibold transition-colors ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`}>
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-1 h-0.5 rounded bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {teacher && <button onClick={() => setAdding(true)} className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-onp sm:px-4 sm:text-sm">＋ Add</button>}
              <Link to="/tasks" className="rounded-md bg-accent px-3 py-2 text-xs font-bold text-onp sm:px-4 sm:text-sm">⏰ My tasks</Link>
              <Link to="/calendar" className="hidden rounded-md bg-ink px-4 py-2 text-sm font-bold text-bg sm:block">🗓️ Calendar</Link>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-ink/15 bg-card">
              <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
                <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search tasks, reviewers, events"
                  aria-label="Search" className="flex-1 rounded-md border border-ink/20 bg-bg px-3 py-2 text-sm placeholder:text-muted" />
                <button onClick={() => { setQ(''); setSearchOpen(false) }} className="text-sm text-muted hover:text-ink">Close</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <Routes location={loc}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks kind="tasks" />} />
              <Route path="/performance" element={<Tasks kind="performanceTasks" />} />
              <Route path="/reviewers" element={<Reviewers />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/events" element={<Events />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="*" element={<p className="py-20 text-center text-xl">🧭 Page not found. <NavLink to="/" className="text-primary underline">Go home</NavLink></p>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
        <footer className="mt-12 border-t border-ink/15 pt-6 text-center text-sm text-muted">
          <p>{CONFIG.teacher} · {CONFIG.section} · <a className="underline" href={`mailto:${CONFIG.contact}`}>{CONFIG.contact}</a></p>
          <div className="mt-3 text-xs"><TeacherAccess /></div>
        </footer>
      </main>

      {teacher && <motion.button whileHover={{ scale: 1.08, rotate: 90 }} whileTap={{ scale: 0.92 }} onClick={() => setAdding(true)} aria-label="Add a reminder"
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent pb-1 text-4xl leading-none text-onp shadow-lg lg:bottom-8 lg:right-8">+</motion.button>}
      {teacher && <AddModal />}

      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t border-ink/15 bg-card lg:hidden">
        {NAV.map(([to, emoji, , short]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `py-2 text-center text-[10px] ${isActive ? 'font-bold text-primary' : 'text-muted'}`}>
            <div className="text-base">{emoji}</div>{short}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
export default function App() { return <HashRouter><Shell /></HashRouter> }

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from './store'
import { CONFIG } from './config'
import type { Announcement } from './types'

interface Slide { id: string; eyebrow: string; title: string; highlight: string; body: string; cta: string; to: string }
const TILES = ['🎓', '📚', '✏️']

export default function Hero({ announcements }: { announcements: Announcement[] }) {
  const today = new Date().toLocaleDateString('en-PH', { dateStyle: 'full', timeZone: CONFIG.timezone })
  const slides: Slide[] = [
    { id: 'welcome', eyebrow: today, title: 'Welcome back!', highlight: CONFIG.section,
      body: 'Everything for class in one place: tasks, reviewers, events and more.', cta: 'See my tasks', to: '/tasks' },
    ...announcements.filter((a) => a.pinned).map((a) => ({
      id: a.id, eyebrow: `Pinned · ${a.createdAt}`, title: a.title, highlight: 'Announcement',
      body: a.body, cta: 'All announcements', to: '/announcements',
    })),
  ]
  const n = slides.length
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const { setAdding, teacher } = useApp()
  const i = idx % n
  const cur = slides[i]
  const go = (d: number) => setIdx((x) => (((x + d) % n) + n) % n)

  useEffect(() => {
    if (paused || n < 2) return
    const t = setInterval(() => setIdx((x) => (x + 1) % n), 6000)
    return () => clearInterval(t)
  }, [paused, n])

  return (
    <section aria-roledescription="carousel" aria-label="Highlights" className="relative grid overflow-hidden rounded-2xl border border-ink/15 bg-card md:grid-cols-[1fr_1.15fr]">
      <div className="relative flex min-h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary/50 px-14 py-8">
        <span aria-hidden className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
        <span aria-hidden className="absolute -bottom-16 right-0 h-52 w-52 rounded-full bg-accent/50" />
        <div className="relative flex items-center gap-3">
          {TILES.map((e, k) => (
            <motion.div key={e} animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: k * 0.4, ease: 'easeInOut' }}
              className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl shadow-lg backdrop-blur ${k === 1 ? '-mt-6' : k === 2 ? 'mt-6' : ''}`}>
              {e}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col justify-center py-8 pl-8 pr-16 pb-16 md:py-10 md:pl-10 md:pr-16">
        <AnimatePresence mode="wait">
          <motion.div key={cur.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{cur.eyebrow}</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">{cur.title}</h2>
            <p className="mt-3 inline-block bg-accent px-3 py-1 font-display text-lg font-bold uppercase text-onp">{cur.highlight}</p>
            <p className="mt-4 max-w-md text-muted">{cur.body}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to={cur.to} className="rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-onp transition-transform hover:-translate-y-0.5 active:scale-95">
                {cur.cta}
              </Link>
              {teacher && (
                <button onClick={() => setAdding(true)} className="rounded-full border border-ink/25 px-5 py-3 text-sm font-bold uppercase tracking-wide transition-colors hover:border-primary hover:text-primary">
                  ＋ Add reminder
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-ink/5 px-3 py-1.5">
          {slides.map((s, k) => (
            <button key={s.id} aria-label={`Show slide ${k + 1}`} onClick={() => setIdx(k)}
              className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-accent' : 'w-2 bg-muted/60'}`} />
          ))}
          <button aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused(!paused)} className="ml-1 text-xs text-muted hover:text-ink">
            {paused ? '▶' : '❚❚'}
          </button>
        </div>
      </div>

      {n > 1 && (
        <>
          <button aria-label="Previous slide" onClick={() => go(-1)} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-ink px-2.5 py-1.5 text-bg shadow-md">‹</button>
          <button aria-label="Next slide" onClick={() => go(1)} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-ink px-2.5 py-1.5 text-bg shadow-md">›</button>
        </>
      )}
    </section>
  )
}

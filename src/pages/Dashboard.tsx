import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../Hero'
import { useApp, useData } from '../store'
import { Empty, Skeleton, TaskCard, item, list } from '../ui'
import { dateParts, countdown, parse } from '../utils'

const Head = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-3 flex items-center gap-2 border-l-4 border-accent pl-3 font-display text-xl font-semibold">{children}</h2>
)

export default function Dashboard() {
  const { data, isLoading, error } = useData()
  const { done } = useApp()
  if (isLoading) return <Skeleton />
  if (error || !data) return <Empty emoji="😕" text="Could not load reminders. Check that public/reminders.json is valid JSON." />

  const now = Date.now()
  const open = [...data.tasks, ...data.performanceTasks]
    .filter((t) => !done.includes(t.id))
    .sort((a, b) => +parse(a.dueAt) - +parse(b.dueAt))
  const soon = open.filter((t) => +parse(t.dueAt) < now + 7 * 864e5)
  const urgent = open.filter((t) => { const m = +parse(t.dueAt) - now; return m >= 0 && m < 2 * 864e5 })
  const upcoming = data.events.filter((e) => +parse(e.startsAt) >= now).sort((a, b) => +parse(a.startsAt) - +parse(b.startsAt))
  const newReviewers = data.reviewers.filter((r) =>
    r.files?.some((f) => f.uploadedAt && now - +parse(f.uploadedAt) < 14 * 864e5)).length
  const stats = [
    { to: '/tasks', icon: '📋', n: soon.length, label: 'due this week' },
    { to: '/events', icon: '🎉', n: upcoming.length, label: 'upcoming events' },
    { to: '/reviewers', icon: '📚', n: newReviewers, label: 'new reviewers' },
  ]

  return (
    <div className="space-y-6">
      <Hero announcements={data.announcements} />

      {urgent.length > 0 && (
        <div role="alert" className="rounded-lg bg-accent p-3 font-medium text-onp">
          ⏰ Due today or tomorrow: {urgent.map((t) => t.title).join(', ')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="flex items-center gap-4 rounded-xl border border-ink/15 bg-card p-4 transition-colors hover:border-primary/60">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink/5 text-2xl">{s.icon}</span>
            <span>
              <span className="block font-display text-3xl font-bold text-primary">{s.n}</span>
              <span className="text-sm text-muted">{s.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <Head>⏰ Due soon</Head>
          {soon.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink/25 p-10 text-center">
              <div className="text-4xl">🎉</div>
              <p className="mt-2 font-semibold">You're all caught up</p>
              <p className="text-sm text-muted">Nothing is due in the next 7 days.</p>
            </div>
          ) : (
            <motion.ul variants={list} initial="h" animate="s" className="space-y-2">
              {soon.map((t) => <TaskCard key={t.id} t={t} subs={data.subjects} />)}
            </motion.ul>
          )}
        </section>

        <section>
          <Head>🎉 Upcoming events</Head>
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink/25 p-10 text-center">
              <div className="text-4xl">🗓️</div>
              <p className="mt-2 font-semibold">No upcoming events</p>
            </div>
          ) : (
            <motion.ul variants={list} initial="h" animate="s" className="space-y-2">
              {upcoming.slice(0, 4).map((e) => {
                const d = dateParts(e.startsAt)
                return (
                  <motion.li key={e.id} variants={item}>
                    <Link to="/events" className="flex items-center gap-3 rounded-xl border border-ink/15 bg-card p-3 transition-colors hover:border-primary/60">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                        <span className="font-display font-bold leading-none">{d.day}</span><span className="text-xs">{d.mon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{e.title}</p>
                        <p className="text-sm text-muted">{countdown(e.startsAt, 'Starts').label}</p>
                      </div>
                    </Link>
                  </motion.li>
                )
              })}
            </motion.ul>
          )}
        </section>
      </div>
    </div>
  )
}

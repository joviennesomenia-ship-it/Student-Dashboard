import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useData } from '../store'
import { Empty, Skeleton, Tabs, Title, cardCls } from '../ui'
import { dayKey, downloadIcs, fmt, hasDate, parse } from '../utils'

const TYPE = { task: ['📋', 'bg-primary'], pt: ['🎯', 'bg-accent'], event: ['🎉', 'bg-emerald-600'] } as const
interface Entry { id: string; title: string; at: string; type: keyof typeof TYPE; description?: string }
const pad = (n: number) => String(n).padStart(2, '0')

export default function CalendarPage() {
  const { data, isLoading } = useData()
  const [m, setM] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [view, setView] = useState('month')
  const [selected, setSelected] = useState<string>(dayKey(new Date()))
  const entries = useMemo<Entry[]>(() => !data ? [] : [
    ...data.tasks.map((t) => ({ id: t.id, title: t.title, at: t.dueAt, type: 'task' as const, description: t.description })),
    ...data.performanceTasks.map((t) => ({ id: t.id, title: t.title, at: t.dueAt, type: 'pt' as const, description: t.description })),
    ...data.events.map((e) => ({ id: e.id, title: e.title, at: e.startsAt, type: 'event' as const, description: e.description })),
  ].filter((e) => hasDate(e.at)).sort((a, b) => +parse(a.at) - +parse(b.at)), [data])
  if (isLoading || !data) return <Skeleton />
  const by = (k: string) => entries.filter((e) => dayKey(parse(e.at)) === k)
  const y = m.getFullYear(), mo = m.getMonth()
  const cells = [...Array(m.getDay()).fill(0), ...Array.from({ length: new Date(y, mo + 1, 0).getDate() }, (_, i) => i + 1)] as number[]
  const row = (e: Entry) => (
    <li key={e.id} className="flex items-center gap-2 py-1.5">
      <span className={`h-3 w-3 rounded-full ${TYPE[e.type][1]}`} /><span className="font-medium">{TYPE[e.type][0]} {e.title}</span>
      <span className="text-sm text-muted">{fmt(e.at)}</span>
      <button onClick={() => downloadIcs([e])} className="ml-auto text-sm text-muted underline">.ics</button>
    </li>
  )
  return (
    <>
      <Title>🗓️ Calendar</Title>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Tabs id="cal-tab" value={view} onChange={setView} items={[['month', 'Month'], ['agenda', 'Agenda']]} />
        <button onClick={() => downloadIcs(entries)} className="mb-4 ml-auto rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-onp">📎 Add all to my calendar</button>
      </div>
      <p className="mb-3 flex gap-4 text-sm">{Object.entries(TYPE).map(([k, [e, c]]) => <span key={k} className="flex items-center gap-1"><span className={`h-3 w-3 rounded-full ${c}`} />{e} {k === 'pt' ? 'Performance task' : k === 'task' ? 'Task' : 'Event'}</span>)}</p>
      {view === 'agenda' ? (
        entries.length ? <ul className={`${cardCls} divide-y divide-ink/10`}>{entries.map(row)}</ul> : <Empty text="Nothing scheduled." />
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <button aria-label="Previous month" className="rounded-full bg-card px-3 py-1 ring-1 ring-ink/15" onClick={() => setM(new Date(y, mo - 1, 1))}>◀</button>
            <h2 className="w-44 text-center text-lg font-semibold">{m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <button aria-label="Next month" className="rounded-full bg-card px-3 py-1 ring-1 ring-ink/15" onClick={() => setM(new Date(y, mo + 1, 1))}>▶</button>
            <button className="ml-2 rounded-full bg-ink/10 px-3 py-1 text-sm" onClick={() => { const d = new Date(); setM(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(dayKey(d)) }}>Today</button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${y}-${mo}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="text-center text-xs text-muted">{d}</div>)}
              {cells.map((d, i) => {
                if (!d) return <div key={i} />
                const k = `${y}-${pad(mo + 1)}-${pad(d)}`
                const es = by(k)
                return (
                  <button key={k} onClick={() => setSelected(k)} aria-label={`${k}, ${es.length} items`}
                    className={`min-h-14 rounded-lg bg-card p-1 text-left text-sm ring-1 ${selected === k ? 'ring-2 ring-primary' : 'ring-ink/10'} ${k === dayKey(new Date()) ? 'font-bold text-primary' : ''}`}>
                    {d}<div className="mt-1 flex flex-wrap gap-0.5">{es.map((e) => <span key={e.id} className={`h-2 w-2 rounded-full ${TYPE[e.type][1]}`} />)}</div>
                  </button>
                )
              })}
            </motion.div>
          </AnimatePresence>
          <div className={`${cardCls} mt-4`}>
            <h3 className="font-semibold">{selected}</h3>
            {by(selected).length ? <ul>{by(selected).map(row)}</ul> : <p className="text-sm text-muted">Nothing scheduled this day.</p>}
          </div>
        </>
      )}
    </>
  )
}

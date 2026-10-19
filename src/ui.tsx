import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { useApp } from './store'
import DeleteShared from './DeleteShared'
import { COLORS, asset, countdown, dateParts, downloadIcs, fmt, hasDate, taskSubjects } from './utils'
import type { Subject, Task } from './types'

export const list = { h: {}, s: { transition: { staggerChildren: 0.04 } } }
export const item = { h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0 } }
export const cardCls = 'rounded-lg border border-ink/15 bg-card p-4 transition-colors hover:border-primary/60'

export const Skeleton = () => (
  <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-ink/10" />)}</div>
)
export const Empty = ({ emoji = '🎈', text }: { emoji?: string; text: string }) => (
  <div className="rounded-lg border border-dashed border-ink/25 p-10 text-center text-muted"><div className="text-4xl">{emoji}</div><p className="mt-2">{text}</p></div>
)
export const Title = ({ children }: { children: ReactNode }) => <h1 className="mb-5 font-display text-3xl font-semibold tracking-tight">{children}</h1>
export const Badge = ({ tone, children }: { tone: string; children: ReactNode }) => (
  <span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold ${tone}`}>{children}</span>
)
export function Tabs({ id, items, value, onChange }: { id: string; items: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="tablist" className="mb-5 flex flex-wrap gap-x-5 border-b border-ink/15">
      {items.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={`relative pb-2 text-sm font-medium transition-colors ${value === k ? 'text-ink' : 'text-muted hover:text-ink'}`}>
          {label}
          {value === k && <motion.span layoutId={id} className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
        </button>
      ))}
    </div>
  )
}
function CheckBtn({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.8 }} onClick={onClick} aria-pressed={on} aria-label={on ? 'Mark not done' : 'Mark done'}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${on ? 'border-primary bg-primary' : 'border-ink/30 hover:border-primary'}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-onp" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M5 12l5 5 9-10" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} />
      </svg>
    </motion.button>
  )
}
export function TaskCard({ t, subs }: { t: Task; subs: Subject[] }) {
  const { done, toggle, removeMine } = useApp()
  const [open, setOpen] = useState(false)
  const ts = taskSubjects(t, subs)
  const s = ts[0] // first subject sets the colour stripe
  const isDone = done.includes(t.id)
  const c = countdown(t.dueAt)
  const dt = dateParts(t.dueAt)
  const mine = t.id.startsWith('me-') 
  return (
    <motion.li layout variants={item} className={`overflow-hidden rounded-lg border bg-card transition-colors ${isDone ? 'border-ink/10' : 'border-ink/15 hover:border-primary/60'}`}
      style={{ boxShadow: `inset 4px 0 0 ${COLORS[s?.color ?? 'blue'] ?? COLORS.blue}` }}>
      <div className="flex items-center gap-3 py-3 pl-5 pr-3">
        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md ${isDone ? 'bg-ink/10 text-muted' : c.urgent ? 'bg-accent text-onp' : 'bg-primary/10 text-primary'}`}>
          <span className="font-display text-xl font-bold leading-none">{dt.day}</span><span className="text-xs font-medium">{dt.mon}</span>
        </div>
        <button className="min-w-0 flex-1 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span className={`block truncate font-semibold ${isDone ? 'text-muted line-through' : ''}`}>{t.title}</span>
          <span className="block truncate text-sm text-muted">{ts.map((x) => `${x.emoji} ${x.name}`).join(' + ')}{mine ? ' · Mine' : ''} · {isDone ? 'Done' : c.label}</span>
        </button>
        {t.priority === 'High' && !isDone && <Badge tone="bg-accent/15 text-accent">High</Badge>}
        <CheckBtn on={isDone} onClick={() => toggle(t.id)} />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-2 border-t border-ink/10 py-3 pl-5 pr-3 text-sm">
              {t.description && <p>{t.description}</p>}
              {t.rubric && <p className="rounded bg-ink/5 p-2"><b>Rubric:</b> {t.rubric}</p>}
              {t.files?.map((f) => (
                <a key={f.url} href={asset(f.url)} target="_blank" rel="noreferrer" download className="block font-medium text-primary underline">
                  📎 {f.name}{f.size ? ` (${f.size})` : ''}
                </a>
              ))}
              <p className="text-muted">{hasDate(t.dueAt) ? 'Due ' : ''}{fmt(t.dueAt)}{t.priority ? ` · ${t.priority} priority` : ''}</p>
              <div className="flex flex-wrap gap-4 font-medium">
                {t.links?.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-primary underline">🔗 {l.label}</a>)}
                <button onClick={() => downloadIcs([{ id: t.id, title: t.title, at: t.dueAt, description: t.description }])} className="text-primary underline">🗓️ Add to calendar</button>
                {!mine && <DeleteShared id={t.id} />}
                {mine && <button onClick={() => removeMine(t.id)} className="text-accent underline">🗑️ Remove</button>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

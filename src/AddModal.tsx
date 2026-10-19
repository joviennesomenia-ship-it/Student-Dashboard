import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useApp, useData, type Mine } from './store'
import { Tabs } from './ui'
import { COLORS } from './utils'
import { CONFIG } from './config'
import type { Announcement, Subject } from './types'

const inp = 'w-full rounded-md border border-ink/20 bg-bg px-3 py-2 text-sm'
const COLOR_NAMES = Object.keys(COLORS)
const PREFIX = { tasks: 'task-', performanceTasks: 'pt-', events: 'ev-', subjects: 'sub-', announcements: 'ann-' } as const

export default function AddModal() {
  const { adding, setAdding, addMine, mine, removeMine } = useApp()
  const { data } = useData()
  const [kind, setKind] = useState<Mine['kind']>('tasks')
  const [title, setTitle] = useState('')
  const [at, setAt] = useState('')
  const [desc, setDesc] = useState('')
  const [sub, setSub] = useState('')
  const [pri, setPri] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [emoji, setEmoji] = useState('📘')
  const [color, setColor] = useState('blue')
  const [pinned, setPinned] = useState(true)
  const [msg, setMsg] = useState('')
  const isSubject = kind === 'subjects'
  const isAnn = kind === 'announcements'

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setAdding(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [setAdding])

  const valid = isSubject ? title.trim() !== ''
    : isAnn ? title.trim() !== '' && desc.trim() !== ''
    : title.trim() !== '' && at !== ''
  const mySubjects = mine.filter((m) => m.kind === 'subjects').map((m) => m.item as Subject)
  const myAnns = mine.filter((m) => m.kind === 'announcements').map((m) => m.item as Announcement)

  const build = (prefix: string): Mine['item'] => {
    const id = `${prefix}${Date.now()}`
    if (isSubject) return { id, name: title.trim(), emoji: emoji.trim() || '📘', color }
    if (isAnn) {
      const createdAt = new Date().toLocaleDateString('en-CA', { timeZone: CONFIG.timezone })
      return { id, title: title.trim(), body: desc.trim(), pinned, createdAt }
    }
    const when = at.length === 16 ? `${at}:00` : at
    return kind === 'events'
      ? { id, title: title.trim(), startsAt: when, location: '', description: desc }
      : { id, title: title.trim(), description: desc, subjectId: sub || data?.subjects[0]?.id || '', dueAt: when, priority: pri }
  }
  const reset = () => { setTitle(''); setDesc(''); setAt(''); setMsg('') }
  const save = () => { addMine({ kind, item: build('me-') }); reset(); if (!isSubject && !isAnn) setAdding(false) }
  const copy = async () => {
    const o = build(PREFIX[kind])
    await navigator.clipboard.writeText(`${JSON.stringify(o, null, 2)},`)
    setMsg(`✅ Copied. Paste it inside the "${kind}" list in reminders.json.`)
  }

  return (
    <AnimatePresence>
      {adding && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAdding(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <motion.div role="dialog" aria-modal="true" aria-label="Add" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }} onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-card p-5 shadow-2xl">
            <h2 className="mb-3 font-display text-xl font-semibold">Add to class</h2>
            <Tabs id="add-kind" value={kind} onChange={(v) => { setKind(v as Mine['kind']); setMsg('') }}
              items={[['tasks', '📋 Task'], ['performanceTasks', '🎯 Perf. task'], ['events', '🎉 Event'], ['announcements', '📢 Announcement'], ['subjects', '📘 Subject']]} />

            <div className="space-y-3">
              <input autoFocus className={inp} value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={isSubject ? 'Subject name (e.g. History)' : isAnn ? 'Announcement title' : 'Title'}
                aria-label={isSubject ? 'Subject name' : isAnn ? 'Announcement title' : 'Title'} />

              {isSubject && (
                <div className="flex gap-2">
                  <input className={`${inp} w-20 text-center text-lg`} value={emoji} maxLength={4} onChange={(e) => setEmoji(e.target.value)} aria-label="Emoji" />
                  <select className={inp} value={color} onChange={(e) => setColor(e.target.value)} aria-label="Color">
                    {COLOR_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {isAnn && (
                <>
                  <textarea className={inp} rows={3} placeholder="Message to the class" value={desc} onChange={(e) => setDesc(e.target.value)} aria-label="Message" />
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input type="checkbox" className="h-4 w-4 accent-primary" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                    📌 Pin to the home slideshow
                  </label>
                </>
              )}

              {!isSubject && !isAnn && (
                <>
                  <input type="datetime-local" className={inp} value={at} onChange={(e) => setAt(e.target.value)} aria-label="Date and time" />
                  {kind !== 'events' && (
                    <div className="flex gap-2">
                      <select className={inp} value={sub} onChange={(e) => setSub(e.target.value)} aria-label="Subject">
                        {data?.subjects.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
                      </select>
                      <select className={inp} value={pri} onChange={(e) => setPri(e.target.value as typeof pri)} aria-label="Priority">
                        <option>Low</option><option>Medium</option><option>High</option>
                      </select>
                    </div>
                  )}
                  <textarea className={inp} rows={2} placeholder="Notes (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} aria-label="Notes" />
                </>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button disabled={!valid} onClick={save} className="flex-1 rounded-md bg-primary py-2 font-semibold text-onp disabled:opacity-40">
                {isSubject ? 'Add subject' : isAnn ? 'Post on this device' : 'Add to my list'}
              </button>
              <button disabled={!valid} onClick={copy} className="flex-1 rounded-md border border-ink/25 py-2 font-semibold disabled:opacity-40">Copy for teacher</button>
            </div>
            <p className="mt-3 text-xs text-muted" aria-live="polite">
              {msg || '"My list" is saved on this device only. "Copy for teacher" makes the entry to paste into reminders.json for the whole class.'}
            </p>

            {(isSubject || isAnn) && (isSubject ? mySubjects.length > 0 : myAnns.length > 0) && (
              <div className="mt-4 border-t border-ink/15 pt-3">
                <p className="mb-2 text-xs font-semibold text-muted">Added on this device</p>
                <ul className="space-y-1">
                  {(isSubject ? mySubjects.map((s) => ({ id: s.id, label: `${s.emoji} ${s.name}` })) : myAnns.map((a) => ({ id: a.id, label: a.title }))).map((row) => (
                    <li key={row.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{row.label}</span>
                      <button onClick={() => removeMine(row.id)} className="ml-3 shrink-0 text-xs text-accent underline">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

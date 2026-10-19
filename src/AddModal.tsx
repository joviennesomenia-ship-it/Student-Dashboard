import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useApp, useData, type Mine } from './store'
import { Tabs } from './ui'
import { COLORS } from './utils'
import { CONFIG } from './config'
import { addToClass, uploadFile } from './github'
import type { Announcement, Subject, Term } from './types'

type AddKind = Mine['kind'] | 'reviewers'
const inp = 'w-full rounded-md border border-ink/20 bg-bg px-3 py-2 text-sm'
const COLOR_NAMES = Object.keys(COLORS)
const PREFIX: Record<AddKind, string> = { tasks: 'task-', performanceTasks: 'pt-', events: 'ev-', subjects: 'sub-', announcements: 'ann-', reviewers: 'rev-' }
const TERMS: Term[] = ['Term 1', 'Term 2', 'Term 3']
const MAX_FILE = 20 * 1024 * 1024
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: CONFIG.timezone })
const fmtSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export default function AddModal() {
  const { adding, setAdding, addMine, mine, removeMine, gh } = useApp()
  const { data } = useData()
  const [kind, setKind] = useState<AddKind>('tasks')
  const [title, setTitle] = useState('')
  const [at, setAt] = useState('')
  const [desc, setDesc] = useState('')
  const [sub, setSub] = useState('')
  const [pri, setPri] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [emoji, setEmoji] = useState('📘')
  const [color, setColor] = useState('blue')
  const [pinned, setPinned] = useState(true)
  const [term, setTerm] = useState<Term>('Term 1')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const isSubject = kind === 'subjects'
  const isAnn = kind === 'announcements'
  const isRev = kind === 'reviewers'

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setAdding(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [setAdding])

  const effSub = sub || data?.subjects[0]?.id || ''
  const valid = isSubject ? title.trim() !== ''
    : isAnn ? title.trim() !== '' && desc.trim() !== ''
    : isRev ? title.trim() !== '' && effSub !== '' && (file !== null || linkUrl.trim() !== '')
    : title.trim() !== '' && at !== ''
  const mySubjects = mine.filter((m) => m.kind === 'subjects').map((m) => m.item as Subject)
  const myAnns = mine.filter((m) => m.kind === 'announcements').map((m) => m.item as Announcement)

  const build = (prefix: string): Mine['item'] => {
    const id = `${prefix}${Date.now()}`
    if (isSubject) return { id, name: title.trim(), emoji: emoji.trim() || '📘', color }
    if (isAnn) return { id, title: title.trim(), body: desc.trim(), pinned, createdAt: today() }
    const when = at.length === 16 ? `${at}:00` : at
    return kind === 'events'
      ? { id, title: title.trim(), startsAt: when, location: '', description: desc }
      : { id, title: title.trim(), description: desc, subjectId: effSub, dueAt: when, priority: pri }
  }
  const reset = () => {
    setTitle(''); setDesc(''); setAt(''); setLinkLabel(''); setLinkUrl(''); setFile(null)
    if (fileRef.current) fileRef.current.value = ''
    setMsg('')
  }
  const save = () => {
    if (kind === 'reviewers') return
    addMine({ kind, item: build('me-') })
    reset()
    if (!isSubject && !isAnn) setAdding(false)
  }
  const copy = async () => {
    if (kind === 'reviewers') return
    const o = build(PREFIX[kind])
    await navigator.clipboard.writeText(`${JSON.stringify(o, null, 2)},`)
    setMsg(`✅ Copied. Paste it inside the "${kind}" list in reminders.json.`)
  }

  const publishReviewer = async () => {
    const stamp = Date.now()
    const rev: Record<string, unknown> = { id: `rev-${stamp}`, title: title.trim(), description: desc.trim(), subjectId: effSub, term }
    if (file) {
      if (file.size > MAX_FILE) throw new Error('That file is over 20 MB. Upload it to Google Drive and add the link instead.')
      const fname = `${stamp}-${file.name.replace(/[^\w.-]+/g, '_')}`
      await uploadFile(gh, `public/files/${fname}`, file)
      rev.files = [{ name: file.name, url: `files/${fname}`, size: fmtSize(file.size), uploadedAt: today() }]
    }
    if (linkUrl.trim()) rev.links = [{ label: linkLabel.trim() || 'Link', url: linkUrl.trim() }]
    await addToClass('reviewers', rev as { id: string }, gh)
  }

  const publish = async () => {
    if (!gh.repo || !gh.token) { setMsg('Set up ⚙️ Class settings in the footer first (one time).'); return }
    setBusy(true); setMsg('')
    try {
      if (kind === 'reviewers') await publishReviewer()
      else await addToClass(kind, build(PREFIX[kind]) as { id: string }, gh)
      reset()
      setMsg('✅ Published. Students will see it after the site rebuilds (about 1–2 minutes).')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Something went wrong.')
    }
    setBusy(false)
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
            <Tabs id="add-kind" value={kind} onChange={(v) => { setKind(v as AddKind); setMsg('') }}
              items={[['tasks', '📋 Task'], ['performanceTasks', '🎯 Perf. task'], ['events', '🎉 Event'], ['reviewers', '📚 Reviewer'], ['announcements', '📢 Announcement'], ['subjects', '📘 Subject']]} />

            <div className="space-y-3">
              <input autoFocus className={inp} value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={isSubject ? 'Subject name (e.g. History)' : isAnn ? 'Announcement title' : isRev ? 'Reviewer title (e.g. Photosynthesis Notes)' : 'Title'}
                aria-label="Title" />

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

              {isRev && (
                <>
                  <div className="flex gap-2">
                    <select className={inp} value={effSub} onChange={(e) => setSub(e.target.value)} aria-label="Subject">
                      {data?.subjects.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
                    </select>
                    <select className={inp} value={term} onChange={(e) => setTerm(e.target.value as Term)} aria-label="Term">
                      {TERMS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <textarea className={inp} rows={2} placeholder="Short description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} aria-label="Description" />
                  <div className="rounded-md border border-dashed border-ink/25 p-3">
                    <label className="block text-sm font-medium">📎 Attach a file (PDF, Word, PowerPoint or image, up to 20 MB)
                      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" />
                    </label>
                    {file && <p className="mt-1 text-xs text-muted">Selected: {file.name} ({fmtSize(file.size)})</p>}
                  </div>
                  <div className="flex gap-2">
                    <input className={`${inp} w-2/5`} placeholder="Link label" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} aria-label="Link label" />
                    <input className={inp} placeholder="🔗 Link URL (optional)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} aria-label="Link URL" />
                  </div>
                  <p className="text-xs text-muted">Add a file, a link, or both.</p>
                </>
              )}

              {!isSubject && !isAnn && !isRev && (
                <>
                  <input type="datetime-local" className={inp} value={at} onChange={(e) => setAt(e.target.value)} aria-label="Date and time" />
                  {kind !== 'events' && (
                    <div className="flex gap-2">
                      <select className={inp} value={effSub} onChange={(e) => setSub(e.target.value)} aria-label="Subject">
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

            <button disabled={!valid || busy} onClick={publish} className="mt-4 w-full rounded-md bg-accent py-2.5 font-semibold text-onp disabled:opacity-40">
              {busy ? 'Publishing…' : '📤 Publish to class'}
            </button>
            {!isRev && (
              <div className="mt-2 flex gap-2">
                <button disabled={!valid} onClick={save} className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-onp disabled:opacity-40">
                  {isSubject ? 'Add on this device' : isAnn ? 'Post on this device' : 'Add to my list'}
                </button>
                <button disabled={!valid} onClick={copy} className="flex-1 rounded-md border border-ink/25 py-2 text-sm font-semibold disabled:opacity-40">Copy for teacher</button>
              </div>
            )}
            <p className="mt-3 text-xs text-muted" aria-live="polite">
              {msg || '"Publish to class" adds it for everyone. "On this device" is only for you.'}
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

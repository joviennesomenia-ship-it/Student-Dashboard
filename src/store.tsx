import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Announcement, Data, EventItem, Subject, Task } from './types'
import type { GhSettings } from './github'

export function useLS<T>(key: string, init: T) {
  const [v, set] = useState<T>(() => {
    try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* storage unavailable */ } }, [key, v])
  return [v, set] as const
}
export interface EditTarget { kind: 'tasks' | 'performanceTasks'; item: Task }
export interface Mine { kind: 'tasks' | 'performanceTasks' | 'events' | 'subjects' | 'announcements'; item: Task | EventItem | Subject | Announcement }
interface Ctx {
  done: string[]; toggle: (id: string) => void; q: string; setQ: (s: string) => void
  mine: Mine[]; addMine: (m: Mine) => void; removeMine: (id: string) => void
  adding: boolean; setAdding: (b: boolean) => void
  teacher: boolean; setTeacher: (b: boolean) => void
  gh: GhSettings; setGh: (g: GhSettings) => void
  hidden: string[]; hideId: (id: string) => void
  editTarget: EditTarget | null; setEditTarget: (t: EditTarget | null) => void
}
const C = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(C)

export function AppProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useLS<string[]>('done', [])
  const [mine, setMine] = useLS<Mine[]>('mine', [])
  const [teacher, setTeacher] = useLS<boolean>('teacher', false)
  const [gh, setGh] = useLS<GhSettings>('gh', { repo: '', token: '' })
  const [hidden, setHidden] = useLS<string[]>('hidden', [])
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)
  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  const addMine = (m: Mine) => setMine((x) => [...x, m])
  const removeMine = (id: string) => setMine((x) => x.filter((m) => m.item.id !== id))
  const hideId = (id: string) => setHidden((h) => (h.includes(id) ? h : [...h, id]))
  return (
    <C.Provider value={{ done, toggle, q, setQ, mine, addMine, removeMine, adding, setAdding, teacher, setTeacher, gh, setGh, hidden, hideId, editTarget, setEditTarget }}>
      {children}
    </C.Provider>
  )
}

export function useData() {
  const { mine, hidden } = useApp()
  const r = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}reminders.json`, { cache: 'no-cache' })
      if (!res.ok) throw new Error('Could not load reminders.json')
      return (await res.json()) as Data
    },
  })
  const data = useMemo<Data | undefined>(() => {
    if (!r.data) return undefined
    const hide = new Set(hidden)
    const keep = <T extends { id: string }>(xs: T[]) => xs.filter((x) => !hide.has(x.id))
    const pick = <T,>(k: Mine['kind']) => mine.filter((m) => m.kind === k).map((m) => m.item as T)
    return {
      ...r.data,
      subjects: [...keep(r.data.subjects), ...pick<Subject>('subjects')],
      tasks: [...keep(r.data.tasks), ...pick<Task>('tasks')],
      performanceTasks: [...keep(r.data.performanceTasks), ...pick<Task>('performanceTasks')],
      reviewers: keep(r.data.reviewers),
      events: [...keep(r.data.events), ...pick<EventItem>('events')],
      announcements: [...keep(r.data.announcements), ...pick<Announcement>('announcements')],
    }
  }, [r.data, mine, hidden])
  return { data, isLoading: r.isLoading, error: r.error }
}

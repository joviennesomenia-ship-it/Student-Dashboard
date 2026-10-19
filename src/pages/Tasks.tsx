import { motion } from 'framer-motion'
import { useState } from 'react'
import { useApp, useData } from '../store'
import { Empty, Skeleton, TaskCard, Title, list } from '../ui'
import { match, parse } from '../utils'

const sel = 'rounded-lg bg-card px-3 py-2 text-sm ring-1 ring-ink/15'
export default function Tasks({ kind }: { kind: 'tasks' | 'performanceTasks' }) {
  const { data, isLoading } = useData()
  const { done, q } = useApp()
  const [sub, setSub] = useState('')
  const [pri, setPri] = useState('')
  const [st, setSt] = useState('open')
  if (isLoading || !data) return <Skeleton />
  const rows = data[kind]
    .filter((t) => (!sub || t.subjectId === sub) && (!pri || t.priority === pri) && (st === 'all' || (st === 'done') === done.includes(t.id)) && match(q, t.title, t.description))
    .sort((a, b) => +parse(a.dueAt) - +parse(b.dueAt))
  return (
    <>
      <Title>{kind === 'tasks' ? '📋 Tasks' : '🎯 Performance Tasks'}</Title>
      <div className="mb-4 flex flex-wrap gap-2">
        <select aria-label="Subject" className={sel} value={sub} onChange={(e) => setSub(e.target.value)}>
          <option value="">All subjects</option>{data.subjects.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
        </select>
        {kind === 'tasks' && (
          <select aria-label="Priority" className={sel} value={pri} onChange={(e) => setPri(e.target.value)}>
            <option value="">Any priority</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
        )}
        <select aria-label="Status" className={sel} value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="open">Not done</option><option value="done">✅ Done</option><option value="all">All</option>
        </select>
      </div>
      {rows.length === 0 ? <Empty text="No matching items." /> : (
        <motion.ul key={`${sub}${pri}${st}${q}`} variants={list} initial="h" animate="s" className="space-y-2">
          {rows.map((t) => <TaskCard key={t.id} t={t} subs={data.subjects} />)}
        </motion.ul>
      )}
    </>
  )
}

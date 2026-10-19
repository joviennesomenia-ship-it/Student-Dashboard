import { motion } from 'framer-motion'
import { useState } from 'react'
import { useApp, useData } from '../store'
import { Empty, Skeleton, Tabs, Title, cardCls, item, list } from '../ui'
import { asset, match } from '../utils'

const icon = (n: string) => ({ pdf: '📕', doc: '📘', docx: '📘', ppt: '📙', pptx: '📙', png: '🖼️', jpg: '🖼️', jpeg: '🖼️' })[n.split('.').pop()?.toLowerCase() ?? ''] ?? '📎'
export default function Reviewers() {
  const { data, isLoading } = useData()
  const { q } = useApp()
  const [sub, setSub] = useState('all')
  if (isLoading || !data) return <Skeleton />
  const rows = data.reviewers.filter((r) => (sub === 'all' || r.subjectId === sub) && match(q, r.title, r.description, r.tag))
  return (
    <>
      <Title>📚 Reviewers</Title>
      <Tabs id="rev-tab" value={sub} onChange={setSub} items={[['all', 'All'], ...data.subjects.map((s) => [s.id, `${s.emoji} ${s.name}`] as [string, string])]} />
      {rows.length === 0 ? <Empty emoji="📚" text="No reviewers here yet." /> : (
        <motion.ul key={sub + q} variants={list} initial="h" animate="s" className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <motion.li key={r.id} variants={item} whileHover={{ y: -2 }} className={cardCls}>
              <div className="flex justify-between gap-2"><h3 className="text-lg font-semibold">{r.title}</h3>{r.tag && <span className="h-fit rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">{r.tag}</span>}</div>
              <p className="text-sm">{r.description}</p>
              <ul className="mt-3 space-y-1">
                {r.files?.map((f) => (
                  <li key={f.url}><a href={asset(f.url)} target="_blank" rel="noreferrer" download className="text-sm font-medium text-primary underline">{icon(f.name)} {f.name}</a>
                    <span className="text-xs text-muted"> {f.size} {f.uploadedAt && `· uploaded ${f.uploadedAt}`}</span></li>
                ))}
                {r.links?.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary underline">🔗 {l.label}</a></li>)}
              </ul>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  )
}

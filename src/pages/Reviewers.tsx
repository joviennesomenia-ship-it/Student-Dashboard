import { motion } from 'framer-motion'
import { useState } from 'react'
import DeleteShared from '../DeleteShared'
import { useApp, useData } from '../store'
import { Empty, Skeleton, Tabs, Title, cardCls, item, list } from '../ui'
import { asset, match } from '../utils'

const icon = (n: string) => ({ pdf: '📕', doc: '📘', docx: '📘', ppt: '📙', pptx: '📙', png: '🖼️', jpg: '🖼️', jpeg: '🖼️' })[n.split('.').pop()?.toLowerCase() ?? ''] ?? '📎'

export default function Reviewers() {
  const { data, isLoading } = useData()
  const { q } = useApp()
  const [sub, setSub] = useState('all')
  const [term, setTerm] = useState('all')
  if (isLoading || !data) return <Skeleton />
  const rows = data.reviewers.filter((r) =>
    (sub === 'all' || r.subjectId === sub) && (term === 'all' || r.term === term) && match(q, r.title, r.description, r.tag))
  return (
    <>
      <Title>📚 Reviewers</Title>
      <Tabs id="rev-tab" value={sub} onChange={setSub} items={[['all', 'All'], ...data.subjects.map((s) => [s.id, `${s.emoji} ${s.name}`] as [string, string])]} />
      <Tabs id="term-tab" value={term} onChange={setTerm} items={[['all', 'All terms'], ['Term 1', 'Term 1'], ['Term 2', 'Term 2'], ['Term 3', 'Term 3']]} />
      {rows.length === 0 ? <Empty emoji="📚" text="No reviewers here yet." /> : (
        <motion.ul key={sub + term + q} variants={list} initial="h" animate="s" className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <motion.li key={r.id} variants={item} whileHover={{ y: -2 }} className={cardCls}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold">{r.title}</h3>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {r.term && <span className="rounded bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">{r.term}</span>}
                  {r.tag && <span className="rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">{r.tag}</span>}
                </div>
              </div>
              {r.description && <p className="text-sm">{r.description}</p>}
              <ul className="mt-3 space-y-1">
                {r.files?.map((f) => (
                  <li key={f.url}>
                    <a href={asset(f.url)} target="_blank" rel="noreferrer" download className="text-sm font-medium text-primary underline">{icon(f.name)} {f.name}</a>
                    <span className="text-xs text-muted"> {f.size} {f.uploadedAt && `· uploaded ${f.uploadedAt}`}</span>
                  </li>
                ))}
                {r.links?.map((l) => (
                  <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary underline">🔗 {l.label}</a></li>
                ))}
              </ul>
              <DeleteShared id={r.id} className="mt-3" />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  )
}

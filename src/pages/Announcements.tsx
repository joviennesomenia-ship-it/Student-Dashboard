import { motion } from 'framer-motion'
import DeleteShared from '../DeleteShared'
import { useApp, useData } from '../store'
import { Badge, Empty, Skeleton, Title, cardCls, item, list } from '../ui'

export default function Announcements() {
  const { data, isLoading } = useData()
  const { mine, removeMine, teacher } = useApp()
  if (isLoading || !data) return <Skeleton />
  const myIds = new Set(mine.filter((m) => m.kind === 'announcements').map((m) => m.item.id))
  const rows = [...data.announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return (
    <>
      <Title>📢 Announcements</Title>
      {rows.length === 0 ? <Empty emoji="📢" text="No announcements yet." /> : (
        <motion.ul variants={list} initial="h" animate="s" className="space-y-3">
          {rows.map((a) => (
            <motion.li key={a.id} variants={item} className={`${cardCls} border-l-4 ${a.pinned ? 'border-l-accent' : 'border-l-ink/20'}`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{a.title}</h3>
                {a.pinned && <Badge tone="bg-accent/15 text-accent">Pinned</Badge>}
              </div>
              <p className="mt-1 text-sm">{a.body}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>{a.createdAt}</span>
                {teacher && myIds.has(a.id) && (
                  <button onClick={() => removeMine(a.id)} className="font-medium text-accent underline">🗑️ Remove</button>
                )}
                {!myIds.has(a.id) && <DeleteShared id={a.id} />}
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  )
}

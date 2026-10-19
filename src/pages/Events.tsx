import { motion } from 'framer-motion'
import { useState } from 'react'
import { useApp, useData } from '../store'
import { Badge, Empty, Skeleton, Tabs, Title, cardCls, item, list } from '../ui'
import { countdown, downloadIcs, fmt, match, parse } from '../utils'
import DeleteShared from '../DeleteShared'

export default function Events() {
  const { data, isLoading } = useData()
  const { q } = useApp()
  const [tab, setTab] = useState('up')
  if (isLoading || !data) return <Skeleton />
  const now = Date.now()
  const rows = data.events.filter((e) => (tab === 'up') === (+parse(e.startsAt) >= now) && match(q, e.title, e.description, e.location))
    .sort((a, b) => (tab === 'up' ? 1 : -1) * (+parse(a.startsAt) - +parse(b.startsAt)))
  return (
    <>
      <Title>🎉 Events</Title>
      <Tabs id="ev-tab" value={tab} onChange={setTab} items={[['up', 'Upcoming'], ['arch', 'Archive']]} />
      {rows.length === 0 ? <Empty emoji="🎉" text="No events to show." /> : (
        <motion.ul key={tab + q} variants={list} initial="h" animate="s" className="grid gap-3 md:grid-cols-2">
          {rows.map((e) => (
            <motion.li key={e.id} variants={item} whileHover={{ y: -2 }} className={cardCls}>
              <div className="flex justify-between gap-2"><h3 className="text-lg font-semibold">{e.title}</h3>{tab === 'up' && <Badge tone={countdown(e.startsAt, 'Starts').tone}>{countdown(e.startsAt, 'Starts').label}</Badge>}</div>
              <p className="text-sm text-muted">{fmt(e.startsAt)} {e.location && `· 📍 ${e.location}`}</p>
              <p className="mt-1">{e.description}</p>
              <button onClick={() => downloadIcs([{ id: e.id, title: e.title, at: e.startsAt, description: e.description }])} className="mt-2 text-sm text-muted underline hover:text-ink">🗓️ Add to calendar</button>
              {!e.id.startsWith('me-') && <DeleteShared id={e.id} className="mt-2" />}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  )
}

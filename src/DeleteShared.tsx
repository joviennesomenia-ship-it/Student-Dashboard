import { useState } from 'react'
import { deleteFromClass } from './github'
import { useApp } from './store'

// Deletes an item from the shared reminders.json. Only renders in teacher mode.
export default function DeleteShared({ id, className = '' }: { id: string; className?: string }) {
  const { teacher, gh, hideId } = useApp()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  if (!teacher) return null

  const del = async () => {
    if (!window.confirm('Delete this from the class list? Students will stop seeing it after the site rebuilds (about 1–2 minutes).')) return
    setBusy(true); setErr('')
    try {
      await deleteFromClass(id, gh)
      hideId(id) // hide right away on this device
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      setBusy(false)
    }
  }
  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <button onClick={del} disabled={busy} className="font-medium text-accent underline disabled:opacity-50">
        {busy ? 'Deleting…' : '🗑️ Delete from class'}
      </button>
      {err && <span className="text-xs text-accent">{err}</span>}
    </span>
  )
}

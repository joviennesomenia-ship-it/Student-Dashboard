import { useState, type FormEvent } from 'react'
import { CONFIG } from './config'
import { useApp } from './store'
import { sha256 } from './utils'

const inp = 'w-full rounded-md border border-ink/20 bg-bg px-3 py-2 text-sm'

function Settings({ onClose }: { onClose: () => void }) {
  const { gh, setGh } = useApp()
  const [repo, setRepo] = useState(gh.repo)
  const [token, setToken] = useState(gh.token)
  const save = () => { setGh({ repo: repo.trim(), token: token.trim() }); onClose() }
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div role="dialog" aria-modal="true" aria-label="Class settings" onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-card p-5 text-left shadow-2xl">
        <h2 className="font-display text-xl font-semibold">⚙️ Class settings</h2>
        <p className="mt-2 text-sm text-muted">Only needed to delete items that the whole class sees. Everything else works without it.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">GitHub repo (owner/name)
            <input className={`${inp} mt-1`} value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="your-username/class-reminders" /></label>
          <label className="block text-sm font-medium">Access token
            <input type="password" className={`${inp} mt-1`} value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" /></label>
        </div>
        <details className="mt-3 text-xs text-muted">
          <summary className="cursor-pointer font-medium">How to make a token</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>On GitHub, go to Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.</li>
            <li>Under Repository access, choose "Only select repositories" and pick your class repo.</li>
            <li>Under Repository permissions, set Contents to "Read and write".</li>
            <li>Generate the token, copy it, and paste it here.</li>
          </ol>
        </details>
        <p className="mt-3 text-xs text-accent">Only enter a token on your own computer. Anyone with it can change your repo.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-ink/25 px-4 py-2 text-sm font-semibold">Cancel</button>
          <button onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-onp">Save</button>
        </div>
      </div>
    </div>
  )
}

export default function TeacherAccess() {
  const { teacher, setTeacher, setAdding } = useApp()
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if ((await sha256(pin)) === CONFIG.teacherPinHash) {
      setTeacher(true); setOpen(false); setPin(''); setErr('')
    } else {
      setErr('Wrong PIN')
    }
  }
  const signOut = () => { setTeacher(false); setAdding(false); setSettingsOpen(false) }

  if (teacher) return (
    <span className="inline-flex flex-wrap items-center justify-center gap-3">
      <button onClick={() => setSettingsOpen(true)} className="underline hover:text-ink">⚙️ Class settings</button>
      <button onClick={signOut} className="underline hover:text-ink">🔓 Teacher mode · Sign out</button>
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </span>
  )
  if (!open) return <button onClick={() => setOpen(true)} className="underline hover:text-ink">🔒 Teacher sign-in</button>
  return (
    <form onSubmit={submit} className="inline-flex flex-wrap items-center justify-center gap-2">
      <input type="password" autoFocus value={pin} placeholder="Teacher PIN" aria-label="Teacher PIN"
        onChange={(e) => { setPin(e.target.value); setErr('') }}
        className="w-36 rounded border border-ink/25 bg-bg px-2 py-1 text-sm" />
      <button type="submit" className="font-medium underline hover:text-ink">Enter</button>
      <button type="button" onClick={() => { setOpen(false); setPin(''); setErr('') }} className="hover:text-ink">Cancel</button>
      {err && <span className="text-accent">{err}</span>}
    </form>
  )
}

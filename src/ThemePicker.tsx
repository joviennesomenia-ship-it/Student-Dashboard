import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { THEMES, themeVars } from './themes'
import { useLS } from './store'

interface Saved { name: string; p: string; a: string; custom: boolean }
export default function ThemePicker() {
  const [open, setOpen] = useState(false)
  const [t, setT] = useLS<Saved>('theme', {
    name: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'classic', p: '#2563eb', a: '#dc2626', custom: false,
  })
  useEffect(() => {
    // Older saved themes used the name "custom"; treat those as Classic with custom colours
    const name = t.name === 'custom' ? 'classic' : t.name
    const custom = t.custom || t.name === 'custom'
    const v = themeVars(name, custom ? t.p : undefined, custom ? t.a : undefined)
    Object.entries(v).forEach(([k, val]) => document.documentElement.style.setProperty(`--${k}`, val))
  }, [t])
  return (
    <div className="relative">
      <button aria-label="🎨 Themes" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-md border border-ink/20 bg-card px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">🎨</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-12 z-40 w-64 rounded-xl bg-card p-4 shadow-xl ring-1 ring-ink/15">
            <p className="mb-2 font-semibold">🎨 Themes</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([k, v]) => (
                <button key={k} onClick={() => setT({ ...t, name: k })} aria-pressed={t.name === k}
                  className={`flex items-center gap-2 rounded-lg p-2 text-left text-sm ring-1 ${t.name === k ? 'ring-2 ring-primary' : 'ring-ink/15'}`}>
                  <span className="h-4 w-4 rounded-full" style={{ background: `rgb(${themeVars(k).primary})` }} />{v.label}
                </button>
              ))}
            </div>
            <p className="mb-1 mt-3 text-sm font-medium">Custom colours</p>
            <p className="mb-2 text-xs text-muted">These change the main and accent colours. The background comes from the theme above.</p>
            <div className="flex items-center gap-3 text-sm">
              <label>Main <input type="color" value={t.p} onChange={(e) => setT({ ...t, custom: true, p: e.target.value })} className="block h-8 w-14" /></label>
              <label>Accent <input type="color" value={t.a} onChange={(e) => setT({ ...t, custom: true, a: e.target.value })} className="block h-8 w-14" /></label>
            </div>
            {t.custom && (
              <button onClick={() => setT({ ...t, custom: false })} className="mt-2 text-xs text-muted underline hover:text-ink">Use the theme's own colours</button>
            )}
            <div className="mt-3 rounded-lg bg-primary p-2 text-center text-sm text-onp">Live preview <span className="rounded bg-accent px-1.5 text-white">Urgent</span></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

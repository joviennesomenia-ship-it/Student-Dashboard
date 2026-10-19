import { CONFIG } from './config'
export const parse = (s: string) => {
  if (/[zZ]$|[+-]\d\d:\d\d$/.test(s)) return new Date(s)
  return new Date((s.length === 10 ? s + 'T00:00:00' : s) + CONFIG.utcOffset)
}
const tz = { timeZone: CONFIG.timezone }
export const fmt = (s: string) => parse(s).toLocaleString('en-PH', { ...tz, dateStyle: 'medium', timeStyle: 'short' })
export const dayKey = (d: Date) => d.toLocaleDateString('en-CA', tz)
export const match = (q: string, ...f: (string | undefined)[]) => !q || f.join(' ').toLowerCase().includes(q.toLowerCase())
export const asset = (u: string) => (/^https?:/.test(u) ? u : import.meta.env.BASE_URL + u)
export const COLORS: Record<string, string> = {
  blue: '#2563eb', green: '#15803d', red: '#dc2626', purple: '#7c3aed', orange: '#c2410c', teal: '#0f766e', pink: '#FFB6C1', yellow: '#FFC000',
}
export function countdown(s: string, verb: 'Due' | 'Starts' = 'Due') {
  const ms = parse(s).getTime() - Date.now()
  const d = Math.ceil(ms / 864e5)
  if (ms < 0) return { label: verb === 'Due' ? 'Overdue' : 'Ended', tone: 'bg-accent text-white', urgent: true }
  if (ms < 864e5) return { label: `${verb} today`, tone: 'bg-accent text-white', urgent: true }
  if (d <= 7) return { label: `${verb} in ${d} day${d > 1 ? 's' : ''}`, tone: 'bg-amber-200 text-amber-950', urgent: false }
  return { label: `${verb} in ${d} days`, tone: 'bg-primary/15 text-primary', urgent: false }
}
interface IcsItem { id: string; title: string; at: string; description?: string }
export function downloadIcs(items: IcsItem[]) {
  const z = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const body = items.map((i) => ['BEGIN:VEVENT', `UID:${i.id}@class-reminders`, `DTSTAMP:${z(new Date())}`,
    `DTSTART:${z(parse(i.at))}`, `SUMMARY:${i.title}`, `DESCRIPTION:${(i.description ?? '').replace(/\n/g, '\\n')}`, 'END:VEVENT'].join('\r\n')).join('\r\n')
  const blob = new Blob([`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Class Reminders//EN\r\n${body}\r\nEND:VCALENDAR`], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = 'reminders.ics'; a.click(); URL.revokeObjectURL(a.href)
}
export const dateParts = (s: string) => {
  const d = parse(s)
  return { day: d.toLocaleDateString('en-US', { ...tz, day: 'numeric' }), mon: d.toLocaleDateString('en-US', { ...tz, month: 'short' }) }
}

export async function sha256(s: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

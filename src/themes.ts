const base = { primary: '37 99 235', accent: '220 38 38', bg: '243 244 246', card: '255 255 255', text: '17 24 39', muted: '75 85 99', onp: '255 255 255' }
type T = typeof base
export const THEMES: Record<string, { label: string } & Partial<T>> = {
  classic: { label: 'Classic' },
  ocean: { label: 'Ocean', primary: '3 105 161', accent: '13 118 110', bg: '240 249 255' },
  forest: { label: 'Forest', primary: '21 128 61', accent: '180 83 9', bg: '240 253 244' },
  sunset: { label: 'Sunset', primary: '194 65 12', accent: '190 24 93', bg: '255 247 237' },
  purple: { label: 'Royal Purple', primary: '109 40 217', accent: '190 24 93', bg: '250 245 255' },
  graphite: { label: 'Graphite', primary: '51 65 85', accent: '185 28 28', bg: '241 245 249' },
  dark: { label: 'Dark', primary: '96 165 250', accent: '248 113 113', bg: '15 23 42', card: '30 41 59', text: '241 245 249', muted: '148 163 184', onp: '15 23 42' },
}
export const themeVars = (name: string, p?: string, a?: string): T => {
  const v = { ...base, ...(THEMES[name] ?? {}) } as T
  if (name === 'custom' && p && a) {
    const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
    const [r, g, b] = rgb(p)
    v.primary = rgb(p).join(' '); v.accent = rgb(a).join(' ')
    v.onp = 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '17 24 39' : '255 255 255'
  }
  return v
}

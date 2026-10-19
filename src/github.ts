// Edits files in the class repo on GitHub using the teacher's token.
// Runs entirely in the browser; no server is involved.
export interface GhSettings { repo: string; token: string }
export type ListName = 'subjects' | 'tasks' | 'performanceTasks' | 'events' | 'announcements' | 'reviewers'
const KEYS: ListName[] = ['subjects', 'tasks', 'performanceTasks', 'events', 'announcements', 'reviewers']

const decodeB64 = (s: string) => {
  const bin = atob(s.replace(/\s/g, ''))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}
const encodeText = (s: string) => {
  let bin = ''
  new TextEncoder().encode(s).forEach((b) => { bin += String.fromCharCode(b) })
  return btoa(bin)
}
const encodeBytes = (bytes: Uint8Array) => {
  let bin = ''
  const CH = 0x8000
  for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode(...bytes.subarray(i, i + CH))
  return btoa(bin)
}

function check(gh: GhSettings) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(gh.repo)) throw new Error('Set the repo (owner/name) in ⚙️ Class settings first.')
  if (!gh.token) throw new Error('Add your access token in ⚙️ Class settings first.')
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${gh.token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}
function explain(status: number) {
  if (status === 401 || status === 403) return 'GitHub rejected the token. Check it has Contents read and write access to this repo.'
  if (status === 404) return 'Not found on GitHub. Check the repo name in Class settings.'
  return `GitHub error ${status}.`
}

// Loads reminders.json, applies `change`, and commits it. Retries once if the file changed meanwhile.
async function updateReminders(gh: GhSettings, message: string, change: (json: Record<string, unknown>) => void): Promise<void> {
  const headers = check(gh)
  const url = `https://api.github.com/repos/${gh.repo}/contents/public/reminders.json`
  for (let attempt = 0; attempt < 2; attempt++) {
    const get = await fetch(url, { headers, cache: 'no-store' })
    if (!get.ok) throw new Error(explain(get.status) + ' while loading the list.')
    const file = (await get.json()) as { content: string; sha: string }
    const json = JSON.parse(decodeB64(file.content)) as Record<string, unknown>
    change(json)
    const put = await fetch(url, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, content: encodeText(JSON.stringify(json, null, 2) + '\n'), sha: file.sha }),
    })
    if (put.status === 409) continue
    if (!put.ok) throw new Error(explain(put.status) + ' while saving.')
    return
  }
  throw new Error('The list changed while saving. Please try again.')
}

export function deleteFromClass(id: string, gh: GhSettings): Promise<void> {
  return updateReminders(gh, `Remove ${id} from reminders`, (json) => {
    let found = false
    for (const k of KEYS) {
      const list = json[k]
      if (Array.isArray(list) && list.some((x: { id?: string }) => x.id === id)) {
        json[k] = list.filter((x: { id?: string }) => x.id !== id)
        found = true
      }
    }
    if (!found) throw new Error('That item is not in reminders.json.')
  })
}

export function addToClass(list: ListName, item: { id: string }, gh: GhSettings): Promise<void> {
  return updateReminders(gh, `Add ${item.id} to ${list}`, (json) => {
    const arr = json[list]
    if (!Array.isArray(arr)) throw new Error(`reminders.json has no "${list}" list.`)
    arr.push(item)
  })
}

// Uploads a file into the repo at `path` (for example public/files/name.pdf).
export async function uploadFile(gh: GhSettings, path: string, file: File, message = `Upload ${file.name}`): Promise<void> {
  const headers = check(gh)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const res = await fetch(`https://api.github.com/repos/${gh.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: encodeBytes(bytes) }),
  })
  if (!res.ok) throw new Error(explain(res.status) + ' while uploading the file.')
}

// Replaces one item in a list, keeping the id. `change` receives the existing item and returns the new one.
export function updateInClass(list: ListName, id: string, change: (old: Record<string, unknown>) => Record<string, unknown>, gh: GhSettings): Promise<void> {
  return updateReminders(gh, `Update ${id} in ${list}`, (json) => {
    const arr = json[list]
    if (!Array.isArray(arr)) throw new Error(`reminders.json has no "${list}" list.`)
    const i = arr.findIndex((x: { id?: string }) => x.id === id)
    if (i < 0) throw new Error('That item is not in reminders.json.')
    arr[i] = change(arr[i])
  })
}

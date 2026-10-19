// Deletes an item from public/reminders.json on GitHub using the teacher's token.
// Runs entirely in the browser; no server is involved.
export interface GhSettings { repo: string; token: string }
const KEYS = ['subjects', 'tasks', 'performanceTasks', 'reviewers', 'events', 'announcements'] as const

const decodeB64 = (s: string) => {
  const bin = atob(s.replace(/\s/g, ''))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}
const encodeB64 = (s: string) => {
  let bin = ''
  new TextEncoder().encode(s).forEach((b) => { bin += String.fromCharCode(b) })
  return btoa(bin)
}

export async function deleteFromClass(id: string, gh: GhSettings): Promise<void> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(gh.repo)) throw new Error('Enter the repo as owner/name in Class settings.')
  if (!gh.token) throw new Error('Add your access token in Class settings.')
  const url = `https://api.github.com/repos/${gh.repo}/contents/public/reminders.json`
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${gh.token}`, 'X-GitHub-Api-Version': '2022-11-28' }

  for (let attempt = 0; attempt < 2; attempt++) {
    const get = await fetch(url, { headers, cache: 'no-store' })
    if (get.status === 401 || get.status === 403) throw new Error('GitHub rejected the token. Check it has Contents read and write access to this repo.')
    if (get.status === 404) throw new Error('reminders.json was not found. Check the repo name in Class settings.')
    if (!get.ok) throw new Error(`GitHub error ${get.status} while loading the list.`)
    const file = (await get.json()) as { content: string; sha: string }
    const json = JSON.parse(decodeB64(file.content)) as Record<string, unknown>

    let found = false
    for (const k of KEYS) {
      const list = json[k]
      if (Array.isArray(list) && list.some((x: { id?: string }) => x.id === id)) {
        json[k] = list.filter((x: { id?: string }) => x.id !== id)
        found = true
      }
    }
    if (!found) throw new Error('That item is not in reminders.json.')

    const put = await fetch(url, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Remove ${id} from reminders`, content: encodeB64(JSON.stringify(json, null, 2) + '\n'), sha: file.sha }),
    })
    if (put.status === 409) continue // file changed meanwhile; reload and retry
    if (!put.ok) throw new Error(`GitHub error ${put.status} while saving.`)
    return
  }
  throw new Error('The list changed while saving. Please try again.')
}

# 🎓 Class Reminders

A free, backend-free student reminder website (React 18 + TypeScript + Vite + Tailwind + Framer Motion). All official content lives in **`public/reminders.json`**. Students' checkmarks and theme choices are saved only in their own browser (localStorage).

## Run locally
**Windows shortcut:** double-click `start.bat`. It checks for Node.js, installs everything, and starts the site (or builds it). Or use the commands below.

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build for production
```bash
npm run build      # outputs to dist/
npm run preview
```

## Deploy to GitHub Pages (automatic)
The included workflow (`.github/workflows/deploy.yml`) builds and publishes the site every time you push to `main`. You only do this once:

1. Create a new repository on GitHub (public, see the note below), for example `class-reminders`.
2. Upload the **contents** of this folder to it (not the folder itself). Drag and drop works on the repo page, or use `git push`. Files like `node_modules` are excluded by `.gitignore`.
3. Go to **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**. Do this before the first upload finishes, or the first run will fail with a message about Pages not being enabled. If that happens, set it and then click **Actions → Deploy to GitHub Pages → Re-run jobs**.
4. Go to the **Actions** tab and wait for the green check (about 2 minutes the first time).
5. Your site is at `https://<your-username>.github.io/<repo-name>/`.

After that, every change you make on GitHub (including edits to `reminders.json`) redeploys automatically.

**Repo visibility:** GitHub Pages on a free account requires a public repo. A private repo needs a paid GitHub plan.

## Teacher guide: updating reminders (no coding tools needed)
1. On GitHub.com open **`public/reminders.json`** and click the ✏️ pencil icon.
2. Copy an existing entry, paste it below, change the text, and keep the commas between entries.
3. Click **Commit changes**. The site updates in about a minute.

Rules:
- Every `id` must be unique (`task-5`, `ev-4`, ...). `subjectId` must match a subject's `id`.
- Dates look like `2026-11-01T23:59:00` (Philippine time). Event times use `startsAt`.
- To remove something, delete its whole `{ ... }` block.
- Files: upload PDFs/DOCX to `public/files/` and set the file `url` to `files/yourfile.pdf`. Or paste a Google Drive / YouTube link in `links`.
- If the site shows "Could not load reminders", the JSON has a typo (usually a missing comma). Paste it into jsonlint.com to find it.
- Change your name, section, contact or timezone in `src/config.ts`.

Shapes: tasks `{id,title,description,subjectId,dueAt,priority:"Low|Medium|High",links}`; performanceTasks add `rubric`; reviewers `{id,title,description,subjectId,tag,files:[{name,url,size,uploadedAt}],links:[{label,url}]}`; events `{id,title,startsAt,location,description}`; announcements `{id,title,body,pinned,createdAt}`.

## Structure
`src/pages` (screens) · `src/ui.tsx` (shared components) · `src/store.tsx` (data + localStorage) · `src/themes.ts` · `src/utils.ts` · `src/types.ts` · `src/config.ts`

## The + button
The round **+** (bottom right) lets anyone add a personal reminder that is saved on their own device only. It also has **Copy for teacher**, which makes a ready-to-paste entry for `reminders.json` so you can publish it to the whole class.

## Teacher mode (who can see the + buttons)
The + buttons, "Add" buttons and Remove links for device-added items only appear in **Teacher mode**. Click **🔒 Teacher sign-in** in the footer and enter the PIN.

- **Default PIN:** `teacher2026`. Change it before sharing the site.
- **To set your own PIN:** run this in a terminal and paste the output into `teacherPinHash` in `src/config.ts`:
  - Mac/Linux: `printf '%s' yourpin | sha256sum`
  - Windows PowerShell: `[BitConverter]::ToString((New-Object Security.Cryptography.SHA256Managed).ComputeHash([Text.Encoding]::UTF8.GetBytes('yourpin'))).Replace('-','').ToLower()`
- Use a PIN of at least 8 characters. Short PINs can be guessed by anyone who reads the hash.

**Important limit:** this is a deterrent, not real security. The site is a static page, so a determined student can read the source code or change the page in their browser's developer tools. Students still cannot change the official list, because `reminders.json` can only be edited through your GitHub account. For stronger protection, you would need a login service, which this project does not include.

## Deleting items the whole class sees
Items in `reminders.json` can be deleted from the website in Teacher mode: announcements, tasks, performance tasks and events show a **🗑️ Delete from class** link.

One-time setup:
1. Sign in with the teacher PIN, then click **⚙️ Class settings** in the footer.
2. Enter your repo as `owner/name`, for example `juanfamily/class-reminders`.
3. Create a GitHub fine-grained token (the form has step-by-step instructions): access only to this repo, with **Contents: Read and write**. Paste it in and click Save.

The token is saved only in that browser. Students never see it. Deleting makes a commit to `reminders.json`, and the site updates after about 1–2 minutes.

Subjects and reviewers can't be deleted from the site yet. Remove them in `reminders.json` on GitHub.

## Adding for the whole class (easiest way)
Sign in to teacher mode, click **＋ Add**, fill in the form, and click **📤 Publish to class**. The item is saved to `reminders.json` on GitHub for you, and students see it after the site rebuilds (about 1–2 minutes). This uses the token from **⚙️ Class settings**, so set that up first. **Copy for teacher** still works if you'd rather paste it yourself.

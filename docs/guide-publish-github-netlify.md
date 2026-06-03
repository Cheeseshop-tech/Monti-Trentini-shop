# Guide: Publish to GitHub + Deploy to Netlify

**Goal:** get this project online as a live website, and set it up so future changes
publish automatically.

**Time:** ~10–15 minutes the first time. **Cost:** free.

**You'll need:** a GitHub account and a Netlify account (both free — steps below).
The project is already a git repo with all changes committed, so we're just publishing it.

---

## Part A — Put the code on GitHub

We'll use **GitHub Desktop** (a clickable app — no terminal needed).

### A1. Install GitHub Desktop & sign in
1. Go to **https://desktop.github.com** → **Download for macOS** → install → open it.
2. If you don't have a GitHub account yet, click **Create your free account** and follow
   the prompts, then come back and sign in to GitHub Desktop.

### A2. Add this project
1. In GitHub Desktop: **File → Add Local Repository…**
2. Click **Choose…** and select this folder:
   `/Users/richardposada/Downloads/design_handoff_shopify_storefront`
3. Click **Add Repository**. (It already contains commits, so GitHub Desktop will just
   open it — you won't be asked to "create" anything.)

### A3. Publish it to GitHub
1. Click **Publish repository** (top-right button).
2. Fill in:
   - **Name:** `monti-trentini-storefront` (or whatever you like)
   - **Keep this code private:** ✅ leave checked (uncheck only if you want it public)
3. Click **Publish repository**.

✅ **Check it worked:** click **Repository → View on GitHub** (or visit github.com) — you
should see all your files listed.

---

## Part B — Deploy on Netlify

### B1. Create a Netlify account
1. Go to **https://netlify.com** → **Sign up**.
2. Choose **Sign up with GitHub** (easiest — it connects the two automatically).

### B2. Import the repo
1. On your Netlify dashboard: **Add new site → Import an existing project**.
2. Choose **Deploy with GitHub** → authorize Netlify if asked.
3. Find and select your **`monti-trentini-storefront`** repo.

### B3. Confirm settings & deploy
Netlify reads our `netlify.toml`, so these should be pre-filled — just confirm:
- **Build command:** *(empty — leave blank)*
- **Publish directory:** `design`

Click **Deploy site**. Wait ~30–60 seconds for the status to go from "Building" to
**"Published."**

### B4. Open your live site
1. Click the site URL Netlify gives you (e.g. `https://random-name-123.netlify.app`).
2. It will redirect to the storefront — you should see the Shop page with real cheese
   photos. 🎉

### B5 (optional). Nicer site name
**Site configuration → Change site name** → set something like `monti-trentini` →
your URL becomes `https://monti-trentini.netlify.app`.

---

## The everyday loop (after first publish)

Whenever you (or Claude) change a file:

1. **Save** the file.
2. In **GitHub Desktop**, you'll see the changes listed on the left. At the bottom-left,
   type a short **Summary** (e.g. "Open on shop page") and click **Commit to main**.
3. Click **Push origin** (top bar).
4. **Netlify auto-deploys** within ~1 minute. Watch progress under your site's
   **Deploys** tab; when it says "Published," refresh the live URL.

That's it — edit → commit → push → it's live.

---

## Good-to-know / gotchas

- **Secrets never get committed.** The `.gitignore` excludes `.env*` files, so API keys
  can't be pushed by accident. Never paste a secret into a tracked file.
- **Images come from Cloudinary** (absolute URLs), so they work the same on Netlify with
  no extra setup.
- **No build step.** This is a static site; if Netlify ever asks for a build command,
  leave it empty (publish directory stays `design`).
- **Macs protect the Downloads folder.** That only affects some automated tools; GitHub
  Desktop and Netlify work fine with the project where it is.
- **Rotate the Cloudinary key** you exposed earlier: Cloudinary → Settings → API Keys →
  generate a new one, disable the old. Doesn't affect the live site.

---

## If something goes wrong

- **Netlify shows the file list instead of the site** → the root redirect didn't apply;
  open `https://YOURSITE.netlify.app/ui_kits/shopify-store/` directly, and confirm
  `netlify.toml` is in the repo root.
- **Images are blank/gradient only** → Cloudinary cloud name or upload issue; the site
  falls back to local photos, so check `design/ui_kits/shopify-store/images.jsx`.
- **Push rejected** → in GitHub Desktop click **Fetch origin** first, then push again.
- **Stuck?** Reopen this folder with Claude Code and describe what you see.

---

## 📝 Field notes (fill in as you actually do it)

> Buttons move and get renamed. When the guide above doesn't match the screen, write
> down **what you really saw** here, with the date. Next time, trust this section first.

**Date I did this:** ____________  ·  **Tool versions/looked like:** ____________

| Step | What the guide said | What it was ACTUALLY called / where it really was |
|------|---------------------|---------------------------------------------------|
| GitHub Desktop: add repo | "File → Add Local Repository…" | |
| GitHub Desktop: publish | "Publish repository" button (top-right) | |
| Netlify: start import | "Add new site → Import an existing project" | |
| Netlify: connect GitHub | "Deploy with GitHub" | |
| Netlify: publish dir field | "Publish directory: `design`" | |
| Netlify: where deploy status shows | "Deploys tab → Published" | |
| Netlify: rename site | "Site configuration → Change site name" | |
| Anything surprising | — | |

**Screenshots:** drop any into `docs/screenshots/` and reference them here, e.g.
`![netlify import](screenshots/netlify-import.png)`.

> 💡 Tip: I (Claude) can watch your screen while you do this and fill this table in for
> you from what's *actually* there — just say "capture as I go" and I'll record the real
> button names and paths into this guide.

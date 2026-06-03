# 🚀 Workflow: design folder → launch-ready URL on a web host

Reusable field notes for taking a **static design/site folder** and getting it to a
**live, auto-deploying URL**. Written from the Monti Trentini storefront build, but the
shape applies to any static site (plain HTML/CSS/JS, or React-from-CDN with no build step).

> **Mental model:**
> ```
>   your Mac (folder)   →   GitHub (cloud backup + history)   →   Netlify (live URL)
>   edit → git commit       git push  →  stored every version     auto-deploy on push
> ```

---

## 0 · Prereqs (one time)
- A **GitHub** account and a **Netlify** account (both free). Sign up for Netlify *with
  GitHub* so they're already connected.
- The folder is (or will become) a **git repo**: `git init` if it isn't one yet.
- Decide the **publish directory** — the folder the host serves as the site root.

---

## 1 · Make the folder a clean, servable site

The #1 thing that breaks static deploys: **relative asset paths**. The host serves a
*publish directory*; every `<link>`, `<script>`, `<img src>` must resolve relative to
wherever `index.html` actually sits once deployed.

Two ways to handle it:

- **A. Publish the folder as-is + redirect.** If your `index.html` lives in a subfolder
  and references assets like `../../style.css`, publish the *parent* folder and add a
  redirect so the site root lands on the entry page. Use a **302** (not a 200 rewrite) so
  the browser URL updates and relative paths resolve. Our `netlify.toml`:
  ```toml
  [build]
    publish = "design"          # folder served as root
    # no build command — static files served as-is
  [[redirects]]
    from = "/"
    to = "/ui_kits/shopify-store/"
    status = 302
  ```
- **B. Flatten into a `dist/`.** A small build script copies the entry `index.html` to the
  top level and rewrites `../../` asset paths so everything resolves from the root. Cleaner
  URL, and required for drag-and-drop deploys. See `scripts/build_dist.py` for the pattern.

> **Static = no build command.** If the site is just files (incl. React + Babel from a
> CDN), leave the host's **build command empty**. You only need a build command for
> frameworks that compile (Vite, Next, etc.).

**Sanity-check locally before deploying:**
```bash
python3 -m http.server 8123        # from the publish dir (or repo root)
# open the entry URL and confirm CSS/images/JS all load (check the console for 404s)
```

---

## 2 · Put the code on GitHub

**GUI (no terminal):** GitHub Desktop → *File → Add Local Repository…* → pick the folder →
**Publish repository** (choose private/public).

**Terminal:**
```bash
git add -A && git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### ⚠️ Gotchas hit for real
- **Creating a repo ≠ uploading your files.** If no remote is set / nothing is pushed, the
  host has nothing to serve and the URL 404s. **Order that works:** push code to GitHub
  *first*, then point the host at the repo.
- **Repo already has commits** (e.g. an earlier web upload, or an auto-created README)?
  `git push` is rejected ("fetch first"). Either:
  - **Merge:** `git fetch origin` → `git merge origin/main --allow-unrelated-histories`
    (keeps both histories; may leave duplicate files to clean up), or
  - **Overwrite:** `git push --force` (makes the remote exactly match local — use only
    when the remote content is disposable).
- **Auth:** GitHub no longer accepts your account password on push. Use a **Personal
  Access Token** or the browser sign-in popup. macOS keychain (`credential.helper =
  osxkeychain`) remembers it after the first time.

---

## 3 · Connect the host for auto-deploy (Netlify)

1. **app.netlify.com** → **Add new project** → **Import an existing project**.
   *(Button is "Add new project," not "Add new site.")*
2. **Deploy with GitHub** → authorize. If your repo isn't listed, **Configure the Netlify
   app on GitHub** and grant access (incl. the **org**, if the repo lives under one).
3. Pick the repo + branch (`main`).
4. Build settings (auto-filled from `netlify.toml` if present — just confirm):
   - **Build command:** *empty* (static site)
   - **Publish directory:** your publish dir (e.g. `design`)
5. **Deploy.** Wait ~30–60s: **Building → Published**.

**From now on, every `git push` to `main` auto-deploys.** That's the whole loop:
```
edit → git commit → git push → host rebuilds → live URL updated
```

### Already deployed once via drag-and-drop?
**Netlify Drop** (`app.netlify.com/drop`, drag the flattened `dist/` folder) is the fastest
way to a first URL with **no GitHub** — but you get a random name, **no auto-deploy**, and
the root `netlify.toml` redirect is bypassed. To upgrade an existing Drop site to
auto-deploy without making a new site: **Site configuration → Build & deploy → Continuous
deployment → Link to existing repository** → GitHub → pick the repo.

---

## 4 · Verify it actually deploys

Push a tiny, harmless change (e.g. an HTML comment) and confirm a **new deploy** appears in
the host's **Deploys** tab with your commit message/hash, going Building → Published. Then
revert it. (That revert push doubles as a second confirmation.)

---

## 5 · Tidy up & name it
- **Rename the site** for a clean URL: **Site configuration → Project details → Manage
  project name and thumbnail**. Names are **lowercase, alphanumeric + hyphens only**
  (spaces/caps not allowed) → `<name>.netlify.app`. Must be globally unique.
  - ⚠️ **Browser autofill can hijack the name field.** When clearing it, **triple-click to
    select the field text and type the replacement** — avoid page-level `Cmd+A`, which can
    drop focus and let autofill insert a stale value. **Read the URL preview in the dialog
    before clicking Save.**
- **Delete dead sites** (failed imports, old Drop sites): **Site configuration → Danger
  zone → Delete site.**

---

## 6 · Security pass
- **Never commit secrets.** Keep API keys/secrets in **environment variables**, not in the
  repo (e.g. uploader reads `CLOUDINARY_URL` from the env). `grep` the repo for any key
  string before/after publishing.
- **If a secret was ever exposed on screen or in a screenshot, rotate it.** Disabling a key
  in the provider console (reversible) neutralizes it; deleting is permanent. Public asset
  *delivery* URLs (e.g. Cloudinary images) don't need the secret, so this won't break a
  live site.

---

## TL;DR checklist
- [ ] Site folder serves cleanly (relative paths resolve) — tested on `localhost`
- [ ] `netlify.toml` (publish dir, empty build cmd, redirect if needed)
- [ ] Pushed to GitHub `main` (remote set; auth via PAT/keychain)
- [ ] Netlify project linked to the repo → first deploy **Published**
- [ ] Auto-deploy verified with a test push
- [ ] Site renamed; dead sites deleted
- [ ] No secrets in the repo; any exposed key rotated

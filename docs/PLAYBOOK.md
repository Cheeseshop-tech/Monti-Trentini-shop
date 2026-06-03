# 📓 Build Playbook — Monti Trentini Storefront

A running reference of every process completed on this project, so you never have to
re-figure-out the steps. Add a new entry each time we finish a process.

> **How to use:** each process is either a full guide in `docs/` or a pointer to where
> it's already documented. When we complete something new, we add a row + a guide here.

> ⚠️ **Capture reality, not just instructions.** Web tools (GitHub, Netlify, Cloudinary…)
> redesign their UIs and rename buttons often, so any written step can go stale. Each
> guide ends with a **📝 Field notes** section — as you actually do it, jot down *what
> the button was really called, where it actually was, and the date.* Your dated notes
> are the source of truth; the steps above them are just the starting map.
>
> **When a step doesn't match what's on screen:** (1) look for a synonym — "Publish/Push/
> Deploy/Import/Add" often swap; (2) use the page's own **search** (Cloudinary & GitHub
> settings both have one); (3) check **Settings/⚙️** menus; (4) screenshot it and add it
> to Field notes so it's right next time.

---

## Processes completed

| # | Process | Where the steps live |
|---|---------|----------------------|
| 1 | **Turn a price-list spreadsheet into storefront data** (xlsx → JSON → JSX) | `README.md` § "Data pipeline" + `scripts/build_catalog.py`, `scripts/build_data_jsx.py` |
| 2 | **Upload product photos to Cloudinary by SKU code** | `scripts/README_cloudinary.md` + `scripts/upload_to_cloudinary.py` |
| 3 | **Publish to GitHub + deploy to Netlify** | [`docs/guide-publish-github-netlify.md`](guide-publish-github-netlify.md) |
| 4 | **Make an edit and redeploy** (the day-to-day loop) | [`docs/guide-publish-github-netlify.md`](guide-publish-github-netlify.md) § "The everyday loop" |
| 5 | **Design folder → launch-ready URL** (reusable, generalized workflow notes) | [`docs/workflow-design-to-live-url.md`](workflow-design-to-live-url.md) |

---

## Vocabulary (the words that trip everyone up)

- **Git** — a tool that tracks every version of your files locally.
- **Repository ("repo")** — your project folder, tracked by git.
- **Commit** — a saved snapshot of your changes, with a message describing them.
- **Push** — uploading your commits from your computer to GitHub.
- **GitHub** — a website that stores your repo online (backup + sharing + history).
- **Netlify** — a service that takes your GitHub repo and serves it as a live website,
  automatically re-publishing every time you push.
- **Deploy** — Netlify building/publishing the current version to the live URL.
- **Static site** — a website that's just files (HTML/CSS/JS), no server to run. Ours is
  static, which is why Netlify needs no "build command."

---

## The mental model (how it all connects)

```
  your Mac (this folder)         GitHub (cloud backup)        Netlify (live website)
  ─────────────────────          ────────────────────         ─────────────────────
  edit files                →    git push  →  stored      →   auto-deploy → public URL
  git commit (snapshot)          (every version kept)         (re-runs on each push)
```

You edit locally → commit → push to GitHub → Netlify notices and redeploys. That's the
whole cycle, forever.

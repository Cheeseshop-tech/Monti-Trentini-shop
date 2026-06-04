# 🎓 My deploy pipeline — working knowledge

> A tutorial I worked through, in my own words, so I can manage the whole
> "edit → live URL" process by hand and understand *why* each step works.
> Date: 2026-06-03.

## The one-line mental model

**Factory → Warehouse → Delivery.**

```
  [1] My Mac            [2] GitHub             [3] Netlify
  the FACTORY           the WAREHOUSE          DELIVERY to visitors
  build + save history  cloud copy of history  serves files to browsers
        │                     │                      │
        │ ── git push ──────► │ ── auto-deploy ────► │ ── URL ──► visitor
        │   (truck 1)         │   (truck 2, automatic)
```

Two trucks: `git push` carries boxes **factory → warehouse**; Netlify carries them
**warehouse → customer**. The second truck runs *by itself* once the link is set up.

---

## Stage 1 — My Mac (git): packing boxes for the history shelf

**Big idea:** git is a save system that snapshots my *whole folder* and keeps every
snapshot forever. Each snapshot = a **commit** = a labeled save-point I can return to.
(A plain ⌘S just overwrites one file — the old version is gone. A commit **preserves a
state I can go back to.**)

| Command | What I'm doing | "...to enable that" |
|---|---|---|
| *(edit files)* | change things in the factory | — |
| `git add -A` | **put the changed files in the box** | choose what's in this snapshot |
| `git commit -m "..."` | **seal + label + shelve the box** | save a returnable state; `-m` = the label |

**Key realization:** after `commit`, my work is **still only on my computer.** Packed and
labeled, ready to ship — but it hasn't shipped yet.

---

## Stage 2 — GitHub (push): shipping boxes to the cloud warehouse

**Big idea:** GitHub is just another computer holding a *copy* of my history shelf, online.

| Command | What I'm doing | "...to enable that" |
|---|---|---|
| `git remote add origin <url>` | **save the warehouse's shipping address** under the nickname `origin` | do it **once**; every push reuses it |
| `git push` | **drive the truck** — send my committed boxes up to GitHub | the cloud copy now matches my Mac |

**Key realization:** the address is saved once, so after that shipping is just `git push`.

**Gotcha I hit:** if the warehouse already has boxes my Mac doesn't, push is rejected
("fetch first"). Fix: `git fetch` then `git merge` (or `--allow-unrelated-histories` for
two separate histories), then push.

---

## Stage 3 — Netlify (serve): delivering files to visitors

**Big idea:** a web host is a computer that's always on; its whole job is — *when a
browser asks for a URL, hand back a file.* "Deploying" = putting my folder on it.

- **Publish directory** = *"this one folder is the front door — start looking here."*
  We set it to `design/`. (Static site = files served as-is, so **build command is empty**.)
- **The redirect** = fixes a mismatch: the host looks for the home page in `design/`, but
  my `index.html` actually lives deeper at `design/ui_kits/shopify-store/`. The redirect
  forwards visitors from where the host looks → to where the page really is.
  ```toml
  [[redirects]]
    from = "/"
    to   = "/ui_kits/shopify-store/"
    status = 302
  ```
- **Why `302` (deeper layer):** a `../` path is counted from whatever URL is in the
  **address bar**. A `302` updates the address bar to the real location, so the relative
  `../../` asset links count from the right starting point and find their files. (The
  alt approach, `build_dist.py`, flattens everything to the root so no climbing is needed.)

**The link = the automation.** What makes warehouse → delivery *automatic* is **linking the
GitHub repo to the Netlify site** (Netlify → Build & deploy → Continuous deployment → Link
to existing repository). Before the link: manual drag-and-drop. After: every push
auto-deploys. (Under the hood GitHub pings Netlify via a webhook/API — but the *link* is
the thing I set up.)

---

## 🧠 Quiz myself (cover the answers)

1. What does a `commit` keep that ⌘S throws away? → *a returnable history of states, not just the latest file.*
2. After I `commit`, where is my code? → *only on my Mac, until I push.*
3. Why run `git remote add origin` only once? → *it saves the shipping address; `push` reuses it.*
4. What makes Netlify deploy automatically on every push? → *the repo↔site link (Continuous deployment).*
5. Why did the site need a redirect? → *the home page is nested in `ui_kits/shopify-store/`, not in the publish-dir root.*
6. Why a `302` and not a 200 rewrite? → *302 updates the address bar so relative `../` paths count from the true location.*

## The everyday loop (the whole thing, by hand)
```
edit  →  git add -A  →  git commit -m "..."  →  git push
                                                   └─► GitHub → Netlify auto-deploys → live URL
```

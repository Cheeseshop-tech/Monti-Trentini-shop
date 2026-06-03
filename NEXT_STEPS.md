# Next steps — push to GitHub & deploy to Netlify

The project is already a local git repo with everything committed. You just need to
publish it and connect Netlify. ~10 minutes.

---

## 1 · Push to GitHub

### Easiest — GitHub Desktop (no terminal)
1. Install **GitHub Desktop** (desktop.github.com) and sign in.
2. **File → Add Local Repository…** → choose this folder:
   `/Users/richardposada/Downloads/design_handoff_shopify_storefront`
3. Click **Publish repository** (top right).
   - Name it e.g. `monti-trentini-storefront`.
   - "Keep this code private" — leave checked (private) unless you want it public.
   - Publish.

### Or — terminal (if you have a GitHub repo URL)
1. Create a new **empty** repo on github.com (no README/license).
2. In Terminal, from the project folder:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOU>/<REPO>.git
   git push -u origin main
   ```

---

## 2 · Deploy on Netlify — ✅ DONE (auto-deploy live, 2026-06-03)

GitHub repo: **`Cheeseshop-tech/Monti-Trentini-shop`**, deployed by Netlify site
**`mt-e-comm`** → live at **`mt-e-comm.netlify.app`** (renamed 2026-06-03 from the
original `comforting-puppy-b2f75a`). Linked via *Site configuration → Build & deploy →
Continuous deployment → Link to existing repository*. Settings (from `netlify.toml`):
**Build command:** empty · **Publish directory:** `design`.

**Every `git push` to `main` now auto-deploys** — no more manual Netlify Drop.
Verified working on 2026-06-03 with a test commit.

---

## 3 · Security — rotate the Cloudinary key — ✅ DONE (2026-06-03)

The exposed key **`954375434365952`** (cloud `sofcvmwa`) was **disabled** in the
Cloudinary console (Settings → API Keys → toggle Active → off → confirm "Disable").
Verified Disabled after reload. This neutralizes the secret that was visible on screen.
The storefront is unaffected (images deliver via public URLs, no secret needed). Other
active keys (`Root`, `mediaflows`) remain for any future uploads; disabling is reversible.

> Note: the secret was never committed to the repo — `scripts/upload_to_cloudinary.py`
> reads it from the `CLOUDINARY_URL` env var, so nothing in git needed scrubbing.

---

## Where things stand (done)
- ✅ Real 2026-03 USD catalog wired in (34 products / 71 SKUs), wholesale-first
- ✅ Product photos live on Cloudinary (cloud `sofcvmwa`, `monti/<SKU>`)
- ✅ Local git repo committed; `netlify.toml`, `.gitignore`, README guide in place
- ✅ Pushed to GitHub (`Cheeseshop-tech/Monti-Trentini-shop`) + Netlify auto-deploy on push

## To resume editing later
Open this folder with Claude Code and say what you want changed. Loop:
`edit → git commit → git push → Netlify auto-deploys`. Quick cosmetic changes
(accent colour, announcement, retail/wholesale start) can be done live in the
in-app **Tweaks panel**.

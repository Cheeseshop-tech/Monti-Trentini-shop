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

## 2 · Deploy on Netlify

1. Go to **netlify.com** → log in → **Add new site → Import an existing project**.
2. Choose **GitHub**, authorize, and pick your repo.
3. Build settings (most are auto-filled from `netlify.toml`):
   - **Build command:** leave EMPTY
   - **Publish directory:** `design`
4. **Deploy site.**
5. Open the site URL — it redirects to the storefront, with real Cloudinary photos.

Every `git push` after this auto-deploys. (In GitHub Desktop you push via **Commit
to main** → **Push origin**.)

---

## 3 · Security — rotate the Cloudinary key

During image setup, the Cloudinary API secret was visible on screen. Regenerate it:
**Cloudinary → Settings → API Keys → Generate New API Key**, then disable the old
active key (`954375434365952`). This does NOT affect the storefront — images are
already delivered and don't need the secret.

---

## Where things stand (done)
- ✅ Real 2026-03 USD catalog wired in (34 products / 71 SKUs), wholesale-first
- ✅ Product photos live on Cloudinary (cloud `sofcvmwa`, `monti/<SKU>`)
- ✅ Local git repo committed; `netlify.toml`, `.gitignore`, README guide in place

## To resume editing later
Open this folder with Claude Code and say what you want changed. Loop:
`edit → git commit → git push → Netlify auto-deploys`. Quick cosmetic changes
(accent colour, announcement, retail/wholesale start) can be done live in the
in-app **Tweaks panel**.

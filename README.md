# Handoff: Monti Trentini Shopify Storefront (B2C + B2B) with live pricing & inventory

## Overview
This package hands off a **high-fidelity storefront design** for Monti Trentini (Casa Finco) — a unified Shopify store serving both **retail (B2C)** and **wholesale (B2B)** customers. It covers the shop (collection + product detail), a real shopping cart (drawer + cart page), a blog/Journal, recipes, a social/press wall, and a wholesale account with trade pricing.

The **primary engineering goal** for this handoff: replace the design's hard-coded sample catalogue with **accurate, live pricing and inventory**, fed by your **price-list creator** (the source of truth for retail + wholesale prices) and confirmed against **real-time inventory** before a customer can buy. See **§ Pricing & Inventory Integration** below — that is the heart of this work.

---

## Running, editing & deploying (current build · 2026-06)

> Since the original handoff, the prototype has been wired to the **real 2026-03 Monti Trentini USA price list** as a **wholesale-first storefront** (USD, $/lb, case formats, availability) with **live product photos on Cloudinary**. This section is the practical guide for running and shipping it. The detailed visual spec follows further down.

### View it locally
```bash
cd design && python3 -m http.server 8123
# then open http://localhost:8123/ui_kits/shopify-store/index.html
```
(Or just double-click `design/ui_kits/shopify-store/index.html`.)

### Data pipeline — source of truth → storefront
```
2026 03 Price list ALL PRODUCTS.xlsx        (master price list, 71 SKUs)
   │  extracted →
   ▼
data/products_master.json                   71 flat SKUs (USD, parsed, availability)
   │  scripts/build_catalog.py →
   ▼
data/trade_catalog.json                      34 products, each with format variants
   │  scripts/build_data_jsx.py →
   ▼
design/ui_kits/shopify-store/trade-data.jsx  overlays STORE_DATA.products + sets USD
```
- To change prices/specs: edit the source, then regenerate:
  ```bash
  python3 scripts/build_catalog.py && python3 scripts/build_data_jsx.py
  ```
- `trade-data.jsx` is a **non-destructive overlay** — it replaces `STORE_DATA.products` while the original `data.jsx` still provides recipes/journal/social.

### Product images (Cloudinary)
- Served from Cloudinary cloud **`sofcvmwa`**, public IDs **`monti/<SKU>`**, configured in `design/ui_kits/shopify-store/images.jsx`.
- Each `<img>` sits over the brand gradient and **falls back to a local copy** (`design/assets/products/<SKU>.jpg`) if a CDN image is ever missing.
- To (re)upload packshots by SKU code: run `scripts/upload_to_cloudinary.py` (interactive; see `scripts/README_cloudinary.md`). **Never commit API secrets** — `.gitignore` excludes `.env*`.

### Deploy (Netlify)
- Static site, **no build step**. `netlify.toml` publishes `design/` and 302-redirects `/` → the storefront.
- In Netlify: **Import an existing project** → pick this GitHub repo → leave build command empty (publish dir `design` comes from `netlify.toml`) → deploy. Every push auto-deploys.

### Edit loop
`edit locally (with Claude Code) → git commit → git push → Netlify auto-deploys`. Small cosmetic tweaks (accent colour, announcement copy, retail/wholesale start mode) can also be changed live via the in-app **Tweaks panel**.

### Key paths
| Path | What |
|---|---|
| `design/ui_kits/shopify-store/` | the storefront prototype (components + `trade-data.jsx` + `images.jsx`) |
| `data/` | `products_master.json`, `trade_catalog.json` (generated catalog data) |
| `scripts/` | `build_catalog.py`, `build_data_jsx.py`, `upload_to_cloudinary.py` (+ its README) |
| `integration_reference.html` | one-page visual reference of the two codebases & integration plan |

---

## About the design files
The files in `design/` are **design references created in HTML/React-via-Babel** — a prototype showing the intended look, layout and behaviour. They are **not production code to ship**. The task is to **recreate these designs in the target environment** — a real Shopify theme (Liquid + Online Store 2.0, or a Hydrogen/React storefront) — using Shopify's data model and your existing infra. Treat the HTML as the visual + interaction spec, not the implementation.

Open `design/ui_kits/shopify-store/index.html` in a browser to explore the working prototype (click the nav, add to cart, open the drawer, toggle wholesale from the footer).

## Fidelity
**High-fidelity.** Final colours, typography, spacing, and interactions are intended to be matched closely. Recreate pixel-for-pixel using the brand tokens in `design/colors_and_type.css`. Brand fonts are **Cora** (editorial italic serif) and **Futura PT** (geometric sans), both delivered via **Adobe Fonts (Typekit kit `med2peg`)**. If the production domain can't use that kit, publish a new Adobe Fonts web project for those families; the CSS already lists **Lora** / **Jost** as offline fallbacks.

---

## Screens / views
The prototype is a single-page app with a `view` router (`home · collection · product · cart · recipes · recipe · blog · article · wholesale`). In production each becomes a Shopify template/route.

### 1. Header (global) — `Shell.jsx › StoreHeader`
- **Announcement bar**: full-width Forest Green (`#064E22`) strip, Futura PT 700 uppercase 12px cream text, centered. Copy swaps to a wholesale message when in trade mode.
- **Nav row**: argyle pattern background (faint forest diamonds on cream — see `.mt-argyle`), max-width 1280, 12×28px padding. Three-column grid: logo (46px tall, left) · nav links (center) · action icons (right).
- **Nav links**: Futura PT 700, 15px, uppercase, +0.04em. Active = Forest Green, inactive = Italia Green (`#009640`). Labels: Shop · Recipes · Journal · Wholesale.
- **Actions**: search, account (user / briefcase icon when trade), cart (bag) — Lucide line icons, ~21px, Forest Green. Cart shows a red count badge (`#CE2B37`).

### 2. Home — `Home.jsx › StoreHome`
- **Hero**: full-bleed alpine photo, forest protection scrim (linear-gradient to `rgba(6,78,34,.8)` at bottom), min-height 600. Eyebrow (mint) → H1 Cora italic 700 ~76px cream → italic sub → two CTAs ("Shop the cheeses" solid, "Wholesale & trade" outline cream).
- **Values strip**: 3-up grid, mint circular icon (56px) + Cora italic 26px title + Futura 15px description.
- **Featured collection**: section header (eyebrow + Cora italic 42px title) + "View all" outline button; 4-up `ProductCard` grid.
- **Heritage split**: 50/50 — photo left, Forest Green panel right with Cora italic 48px headline + mint body + outline CTA.
- **Recipes teaser** (3-up), **Social feed** (compact), **Journal teaser** (3-up).

### 3. Collection / PLP — `Catalog.jsx › CollectionPage`
- Centered head (eyebrow + Cora italic 52px "The cheeses of the mountain.") + italic intro.
- **Filter chips**: pill buttons (Futura 700 13px uppercase), active = Forest fill + cream text; derived from product `range`.
- **Product grid**: 4 columns, 22px gap.

### 4. Product card — `Catalog.jsx › ProductCard`
- Casa Paper (`#FAF9F5`) card, 18px radius, soft green-tinted shadow.
- 4:3 gradient thumbnail (placeholder) with a cream pill **badge** top-left and a **quick-add** solid button that fades in on hover.
- Body: range label (Italia Green 11px uppercase) · Cora italic 22px name · weight · **PriceTag**.

### 5. Product detail / PDP — `Catalog.jsx › ProductPage`
- Back link → 2-col grid: square gradient image (24px radius) | details.
- Details: range · Cora italic 46px name · **PriceTag (big)** · italic blurb · **spec row** (Origin / Ageing / Format with Lucide icons) · **buy row** (qty stepper in a pill + full-width "Add to cart · {total}" solid button) · assurance row (truck / award / leaf).
- "Pairs well with" → related `ProductCard` grid.

### 6. Cart drawer — `Cart.jsx › CartDrawer`
- Fixed right slide-out, `min(440px, 92vw)`, cream, opens on add-to-cart and on cart-icon click. Scrim behind.
- Header (Cora italic 23px "Your cart (n)" + close). **Free-shipping progress** bar (mint band, fills toward €60 retail / €250 trade). Line items (70px thumb, range, name, weight, qty stepper, remove, line price). Footer: subtotal + "Checkout · {subtotal}" + continue shopping.
- **Note:** in the prototype the drawer opens **instantly** (the preview iframe throttles CSS transitions). In production, re-enable a `transform: translateX()` transition with `.35s` ease for the slide.

### 7. Cart page — `Cart.jsx › CartPage`
- Two columns: line list | sticky **order summary** (subtotal, shipping, trade flag, total, secure-checkout button, payment note).

### 8. Recipes — `Content.jsx › RecipeIndex / RecipeDetail`
- Index: centered head + 2-up recipe cards (16:9 gradient thumb, kicker pill, Cora italic title, time/level meta).
- Detail: back link → hero band → title + meta → method steps (numbered mint badges) + sticky **"Made with" buy-card** (product thumb, name, PriceTag, add-to-cart).

### 9. Journal / blog — `Content.jsx › BlogIndex / BlogArticle`
- Index: featured post (split card) + 2-up post grid (16:9 thumb, category, Cora italic title, excerpt, date · read time).
- Article: back link, category + meta, Cora italic 44px title, hero band, italic lead + body paragraphs + a pull-quote (Pasture Sage left border).

### 10. Social / press wall — `Content.jsx › SocialFeed`
- Centered head + 4-up square tile grid. Tiles are Instagram-style (gradient/photo, hover overlay with caption + heart count) or **press** (award badge top-left, e.g. "World Cheese Awards 2025"). `compact` prop renders 6 tiles for the home section.

### 11. Wholesale / B2B — `Wholesale.jsx › WholesalePage`
- **Logged-out**: 2-col — left value prop (Cora italic 60px "Stock the mountain." + 4 benefit items: trade pricing, 48h delivery, private label, net-30) — right **trade login card** (business email + password → "Sign in to wholesale" → sets trade mode).
- **Logged-in (trade mode)**: account header ("Buongiorno, Ristorante Dolomiti.", account #, net-30), stat chips, **Quick reorder** (2-up, "+6" buttons), and a **Trade price list table**: Product · Format · Retail (struck-through) · Trade · "Add ×6".

---

## Interactions & behavior
- **Routing**: `onNav(view, arg)` sets `view` + an optional id (product/recipe/article) and scrolls to top.
- **Add to cart**: `cart.add(id, qty)` increments or inserts a line and opens the drawer.
- **Quantity**: steppers call `cart.setQty(id, qty)`; qty 0 removes the line. `cart.remove(id)`, `cart.clear()` also exist.
- **Wholesale toggle**: footer "Shop as wholesale" or the trade login flips `wholesale`, which (a) swaps the announcement bar, (b) shows trade prices everywhere via `PriceTag`, (c) changes free-shipping threshold (€60 → €250).
- **Hover**: product quick-add fades up; nav links shift Forest↔Italia Green; cards lift subtly.
- **Animations**: gentle, ~200–350ms ease, no bounces. Reduced-motion friendly.

## State management
Prototype keeps it all client-side (`store-core.jsx › useCartState`): `items: [{id, qty}]`, `open` (drawer), plus `view`, `arg`, `wholesale` in `App`. **In production, replace this with Shopify's cart** (Storefront API cart or AJAX `/cart` for themes) and derive `wholesale`/trade pricing from the **logged-in B2B customer + company location** (see below). Cart line prices and availability must come from Shopify, not local state.

## Design tokens
All in `design/colors_and_type.css`. Key values:
- **Colors** — Forest `#064E22`, Italia Green `#009640`, Pasture Sage `#70C883`, Alpine Mint `#C8E2C5`, Heritage Cream `#FFFBDC`, Casa Paper `#FAF9F5`, Stone Charcoal `#716A6A`, Mountain Ink `#141413`, Italia Red `#CE2B37` (logo ribbon only).
- **Type** — `--font-display` Cora italic (display/body), `--font-ui` Futura PT (UI/buttons/nav, 700 uppercase +0.04em), `--font-ui-bold` Futura PT Bold (stats).
- **Radii** — 6 / 12 / 20 / 999 (pill). **Shadows** — soft `0 1px 3px ink/6%`, card `0 12px 32px forest/8%` (green-tinted). **Spacing** — 8 / 16 / 24 / 40 / 64 / 96.

## Assets
- `design/assets/logo/MontiTrentini_Logo.png` — oval badge (cow + mountain wordmark), use on light.
- `design/assets/logo/logoquadrato.png` — badge for dark/forest backgrounds.
- `design/assets/logo/favicon_192.jpg` — favicon.
- `design/assets/img/hero_mainbanner.jpg` — alpine-cow hero (the only real photo; reused as a lifestyle placeholder).
- **Icons**: Lucide (CDN) at ~1.6 stroke — substitution; the brand has no published icon set. The cow emblem is the only proprietary mark.
- **Product imagery is placeholder** (brand-green gradients). In production, **all imagery is served from the Cloudinary image catalog** — see § Cloudinary Image Catalog Integration. Supply the Cloudinary cloud name + folder convention, real packshots, and recipe/lifestyle photos.

## Files
- `design/ui_kits/shopify-store/index.html` — app shell + router + cart provider + tweaks.
- `design/ui_kits/shopify-store/data.jsx` — **the sample catalogue to replace** (`window.STORE_DATA`).
- `design/ui_kits/shopify-store/store-core.jsx` — cart context, `money()` formatter, Lucide `Icon`.
- `Shell.jsx · Home.jsx · Catalog.jsx · Cart.jsx · Content.jsx · Wholesale.jsx` — views/components.
- `design/colors_and_type.css` — brand tokens (import first).
- `design/ui_kits/shopify-store/README.md` — kit-level notes.

---

## § Pricing & Inventory Integration (the core task)

The prototype's catalogue lives in `data.jsx` as plain objects:

```js
{ id, name, range, price /* retail € */, wholesale /* trade € */, weight,
  grad /* placeholder image */, badge, blurb, tags, age, milk, featured }
```

Goal: make **`price`, `wholesale`, and availability** come from real systems — your **price-list creator** for prices and **Shopify inventory** for stock — and **confirm both at the moment of add-to-cart and at checkout**.

### Recommended Shopify mapping
1. **Catalogue → Shopify products/variants.** Each cheese = a product; weight/format options = variants. The prototype's `range`, `badge`, `age`, `milk` map to product type / tags / metafields (`custom.range`, `custom.ageing`, `custom.milk`).
2. **Retail price** = the variant price (from the price-list creator, synced via the **Admin API** `productVariantsBulkUpdate` or a price feed).
3. **Wholesale price** = Shopify **B2B**: model trade customers as **Companies** with **company locations**, and attach a **Catalog + Price List** (fixed prices or % adjustments) per company/location. The storefront shows trade prices automatically when a B2B customer is logged in and a company location is selected — this replaces the prototype's `wholesale` boolean. (Requires Shopify Plus for native B2B; otherwise use a wholesale app or a discount/markets approach.)
4. **Price-list creator integration.** Treat it as the **source of truth** for both retail and trade prices. Sync direction: price-list creator → Shopify (push), on a schedule or webhook. Keep an idempotent sync keyed by SKU. Surface the list version/date so merchandisers can confirm what's live. If the creator also defines **min order quantities / case packs** (the prototype's "+6"/min-order €250), push those as variant metafields and enforce them in cart validation.
5. **Inventory confirmation.** Read live stock via the **Storefront API** (`variant.availableForSale`, `quantityAvailable`) to gate the UI (disable add-to-cart / show "Made to order" / "Back in {date}"), and **re-validate at add-to-cart and checkout** against the Admin API inventory levels so two shoppers can't oversell the last wheel. For chilled/seasonal items (e.g. alpeggio), consider per-location inventory and a "ships in 48h" rule.

### UI hooks already in the design (wire these to real data)
- `PriceTag` (`Catalog.jsx`) renders retail vs trade with strikethrough → bind to Shopify variant price + B2B price-list price.
- The **wholesale price-list table** (`Wholesale.jsx`) is exactly the price-list creator's output → render from the live price list, with a "confirmed / version" indicator.
- **Quick reorder "+6"** and **min-order €250** → enforce case packs + minimum via cart validation; block checkout until met.
- Add a **stock state** to each `ProductCard` / PDP (in-stock / low / made-to-order / out) — the design currently assumes in-stock; add a badge + disabled button styles using the existing token system (Pasture Sage for "low", Stone Charcoal for "out").

### Suggested build order
1. Stand up the Shopify theme/Hydrogen project and import the brand tokens + fonts.
2. Recreate the static views (Home, PLP, PDP, cart, content) against Shopify product data.
3. Wire the **price-list creator → Shopify** sync (retail first, then B2B price lists).
4. Add **inventory reads** + UI states, then **add-to-cart / checkout re-validation**.
5. Connect the **Cloudinary image catalog** (§ below) so every product/recipe/tile pulls real imagery.
6. Turn on **B2B (companies, catalogs, price lists)** and replace the `wholesale` boolean with real customer context.

> A developer who wasn't in this conversation should be able to implement from this README alone. Ask the design owner for: the real product list (SKUs, weights, retail + wholesale prices), product/recipe photography, the price-list creator's API/export format, the Cloudinary cloud name + folder/naming convention, and confirmation of Shopify plan (Plus enables native B2B).

---

## § Cloudinary Image Catalog Integration

The prototype uses **brand-green gradient placeholders** (the `grad` field on each product/recipe/social item) and reuses the one alpine-cow photo. In production, **all imagery comes from Cloudinary** — product packshots, recipe photos, lifestyle/social tiles, and the hero.

### Mapping
- Replace the `grad` placeholder on each catalogue item with a Cloudinary **`publicId`** (and an `alt`). The components that render `grad` today — `ProductCard`, `ProductPage` (`pdpImage`), recipe thumbs, journal thumbs, and `SocialTile` — should render an `<img>`/background from a Cloudinary URL instead.
- **Source of truth & sync:** key Cloudinary assets by **SKU / handle** so the catalogue sync (price-list creator → Shopify) and the image catalog line up. Two viable models:
  1. **Cloudinary is the DAM, Shopify holds references** — store the `publicId` (or full delivery URL) in a product/variant **metafield** (`custom.cloudinary_id`, `custom.cloudinary_gallery` as a list) and read it on the storefront. Recommended — keeps Shopify the single read surface for the frontend.
  2. **Direct Cloudinary fetch** — the storefront builds URLs from a known `cloudName` + folder convention (e.g. `monti-trentini/products/{sku}`, `/recipes/{slug}`, `/social/{id}`). Simpler, but needs a strict naming convention.

### Folder / naming convention (suggested)
```
monti-trentini/
  products/{sku}/main          # primary packshot (square)
  products/{sku}/lifestyle     # optional secondary
  recipes/{slug}/hero          # 16:9
  social/{id}                  # 1:1 instagram/press tiles
  brand/hero-altopiano         # full-bleed hero
```

### Delivery & transformations
Use Cloudinary's URL transformations to serve right-sized, optimized images (don't ship originals):
- **Auto format + quality**: `f_auto,q_auto`.
- **Responsive sizing** per slot — match the design's aspect ratios:
  - Product card thumb **4:3** → `c_fill,ar_4:3,w_600`
  - PDP image **1:1** → `c_fill,ar_1:1,w_1000`
  - Recipe thumb **16:9** → `c_fill,ar_16:9,w_800`
  - Social tile **1:1** → `c_fill,ar_1:1,w_500`
  - Hero **full-bleed** → `c_fill,w_2000,g_auto` (use `g_auto` for smart cropping on the cow/landscape)
- Serve **`dpr_auto`** + `srcset`/`sizes` (or `w_auto`) for retina.
- Example URL: `https://res.cloudinary.com/<cloudName>/image/upload/f_auto,q_auto,c_fill,ar_1:1,w_1000/monti-trentini/products/asiago-fresco/main.jpg`

### Implementation notes
- Add a tiny `cldUrl(publicId, { ar, w, g })` helper that composes the transformation string — replaces the `grad` background on the placeholder elements. Keep the **brand-green gradient as the loading/fallback background** behind each `<img>` so empty/slow images still look on-brand.
- Preserve the design's **rounded corners + green-tinted shadow** on the image container; let the `<img>` fill it (`object-fit: cover`).
- For art direction, Cloudinary **named transformations** (e.g. `t_mt_card`, `t_mt_pdp`) centralize the rules so merchandisers don't hand-edit URLs.
- If you prefer not to call Cloudinary at runtime, you can also **sync Cloudinary → Shopify Files** and use Shopify image CDN; but native Cloudinary delivery keeps one DAM and richer transforms. Either way, keep `publicId` as the join key.
- **Upload/governance**: new photography is uploaded to Cloudinary (folders above), tagged by SKU; an admin-side sync writes `publicId`s onto the matching Shopify products. Optionally use Cloudinary's **Shopify connector/app** to automate this.

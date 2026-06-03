# Monti Trentini — Shopify Storefront UI Kit

A high-fidelity, click-through recreation of a **Shopify e-commerce storefront** for Monti Trentini, supporting both **B2C retail** and **B2B wholesale** in one store. Built entirely on the brand system (`colors_and_type.css`, real Cora + Futura PT). It is a cosmetic prototype — cart logic is real (add / qty / remove / totals) but nothing is wired to a live Shopify backend.

## Run
Open `index.html`. Loads React/Babel + Lucide + the brand CSS, then mounts the components.

## What it demonstrates
- **Unified B2C + B2B** — one store; wholesale unlocks trade pricing, min-order, quick reorder and a price list after login. Toggle retail/wholesale from the footer (or the "Start as" tweak).
- **Shopping cart** — add to cart, slide-out **cart drawer** with free-shipping progress, quantity steppers, and a full **cart page** with order summary.
- **Blog (Journal)** — index + article with pull-quotes.
- **Recipes** — index + recipe detail with a "made with" product buy-card.
- **Social / press wall** — Instagram-style grid mixed with award mentions (World Cheese Awards, Caseus Veneti).
- **Tweaks** — accent colour, start mode (retail/wholesale), social-feed toggle, announcement-bar copy.

## Pages / routes (`view` state in `index.html`)
`home · collection · product · cart · recipes · recipe · blog · article · wholesale`

## Components
| File | Exports | Role |
|---|---|---|
| `data.jsx` | `window.STORE_DATA` | Products (EUR + wholesale prices), recipes, posts, social. |
| `store-core.jsx` | `CartCtx`, `useCartState`, `money`, `Icon`, `Eyebrow` | Cart context, € formatter, Lucide icon helper. |
| `Shell.jsx` | `StoreHeader`, `StoreFooter` | Announcement bar, nav, cart button, footer + mode toggle. |
| `Home.jsx` | `StoreHome` | Hero, values, featured shop, heritage split, recipes, social, journal. |
| `Catalog.jsx` | `CollectionPage`, `ProductPage`, `ProductCard`, `PriceTag` | PLP with filters + PDP with add-to-cart. |
| `Cart.jsx` | `CartDrawer`, `CartPage` | Slide-out drawer + full cart/summary. |
| `Content.jsx` | `BlogIndex`, `BlogArticle`, `RecipeIndex`, `RecipeDetail`, `SocialFeed` | Editorial + social. |
| `Wholesale.jsx` | `WholesalePage` | B2B login + account dashboard, reorder, trade price list. |
| `tweaks-shell.jsx` | Tweaks panel shell | Host-protocol wiring + controls. |

## Conventions & notes
- Icons: **Lucide** (thin line) — the brand has no published icon set (substitution, flagged in root README). The cow emblem is the only proprietary mark.
- Product thumbnails are **brand-green gradient placeholders**; the alpine-cow photo is reused for lifestyle/hero tiles. Drop in real packshots + recipe/lifestyle photography to finish.
- Cart drawer toggles **instantly** (no slide transition): the preview iframe throttles CSS transitions; instant is reliable. Re-enable a `transform` transition for production if desired.
- Prices are illustrative EUR; swap `data.jsx` for the real catalogue. In production these map to Shopify products/variants and the cart to Shopify's AJAX cart / Storefront API.

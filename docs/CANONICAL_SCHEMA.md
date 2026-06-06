# Canonical Schema — the shared pricing & inventory contract

**Status:** draft v1.1 · **Owner:** CheeseShopTECH · **Date:** 2026-06-06

This is the single source of **pricing truth and inventory truth** for one client's goods and
services. The internal **Price-List Creator** (proforma/quoting) and the **e-commerce
storefront** both read it, and any future client plugs into it. Get this right and everything
else (file vs. backend, per-client source formats, which app renders what) swaps around it.

```
messy client source  →  [adapter]  →  CANONICAL  →  pricing-core  →  proforma + storefront
   (any shape)          per-client    (this doc)     shared logic     (projections)
```

The rule that makes it reusable: **client-specific mess is only ever allowed inside an
adapter.** The canonical files below always look the same, no matter whose data it is.

---

## The most important idea: two pricing contexts

Pricing is NOT one number. There are two worlds, and they stay separate:

| | **Proforma / Quote** (calculator) | **Storefront** (website) |
|---|---|---|
| How price is set | **computed up** from FOB cost | **published fixed** price |
| Formula | `FOB × (1 + classOfTrade%) ± custom%` | everyday price, or active promo |
| Volume | pallet / container / lb brackets | n/a (fixed) |
| Who adjusts | rep, per quote | owner, as costs move / for campaigns |
| Reads field | `cost.fob` + tiers + breaks | `list` + active `campaign` |

The catalog stores **both** on each SKU so neither context contaminates the other:
`cost.fob` drives quotes; `list` drives the website. A promo never leaks into a quote; a
quote markup never shows on the website.

---

## The one join key

Everything references a SKU **`code`** (string). Catalog SKUs, inventory lots, campaign
targets, and images all key on it. It's the only identifier that crosses app boundaries.
Never reuse or mutate a `code` — retire it instead.

---

## Documents (per client, in `clients/<clientId>/`)

| File | Answers | Required? | Changes |
|---|---|---|---|
| `client.config.json` | who + the pricing RULES (tiers, volume breaks, fees) | yes | rarely |
| `catalog.json` | what we sell + FOB cost + published prices + specs | yes | per price list |
| `inventory.json` | what's in stock + **what's in transit** (lots, expiry, ETA) | optional | often |
| `campaigns.json` | active promotions overriding website prices | optional | per campaign |
| `commitments.json` | standing customer pulls / regular plans (v1.2) | optional | per plan |
| `movement.json` | historical sold + **missed** sales; planning signal (v1.2) | optional | monthly |

---

## 1 · `client.config.json` — brand + pricing RULES

The levers, not the numbers-per-product. **Tiers, volume breaks, and fee types live here**, so
each client can have a totally different structure with zero app-code change.

```json
{
  "schemaVersion": "1.1",
  "clientId": "monti-trentini",

  "brand": {
    "name": "Monti Trentini",
    "tagline": "Italian Alpine Cheese · since 1925",
    "accent": "#009640",
    "logo": "monti/brand/logo"
  },

  "currency": "USD",

  "images": { "provider": "cloudinary", "cloud": "sofcvmwa", "folder": "monti" },

  "pricing": {
    "costBasis": "FOB SEAFRIGO",
    "defaultTier": "foodservice",

    "tiers": [
      { "id": "foodservice", "label": "Foodservice",          "adjustPct": 22, "public": false },
      { "id": "importer",    "label": "Importer / Distributor","adjustPct": 15, "public": false },
      { "id": "retail",      "label": "Direct to Retail",      "adjustPct": 35, "public": true  },
      { "id": "specialty",   "label": "Specialty Retail",      "adjustPct": 28, "public": true  }
    ],

    "volumeBreaks": [
      { "id": "under1500",  "label": "Under 1,500 lb", "maxLb": 1500, "adjustPct": 0  },
      { "id": "over1500",   "label": "1,500 lb +",     "minLb": 1500, "adjustPct": -5 },
      { "id": "pallet",     "label": "Full pallet",    "unit": "pallet", "adjustPct": -8  },
      { "id": "container",  "label": "Full container", "unit": "container", "adjustPct": -12 }
    ],

    "freight": {
      "thresholdLb": 1500,
      "delivered": {
        "atOrAboveThreshold": { "perLb": 0.30 },
        "belowThreshold": { "truckingFlat": 300, "truckingVariable": true, "processingFlat": 135 }
      }
    },
    "fees": [
      { "id": "trucking",   "label": "Trucking",       "scope": "order", "default": 0, "perLb": false },
      { "id": "processing", "label": "Processing fee", "scope": "order", "default": 0, "perLb": false }
    ]
  }
}
```

**How a proforma price is computed (the dropdowns + override):**
1. Start at `cost.fob` for the SKU (the FOB SEAFRIGO price-list number).
2. Apply the selected **class-of-trade** tier `adjustPct` (the quick-pick dropdown).
3. Optionally apply the selected **volume break** `adjustPct` (pallet / container / lb).
4. Apply the rep's **custom %** (free field, + or −) — the escape hatch for any one-off.
   → this is the **merchandise $/lb**, and it is the WHOLE $/lb. Nothing else touches it.
5. Freight + handling are **separate LINE ITEMS** on the proforma — never folded into $/lb.

> **The engine does NOT own pricing strategy.** The price list is HQ/Stefano's numbers. Class-of-
> trade only applies to **DIRECT sales** — when Monti sells direct, it absorbs the distributor's
> margin but deliberately holds **market value** to protect the channel. So the real tiers are:
> **Wholesale/Distributor = 0% (base list)** · **Direct to Retail = +15%** · **Direct to Consumer
> = +35%** (over the e-comm baseline). A distributor sale is just base price + delivery/minimum/fees.
> (Numbers provisional pending Stefano review after the first team review.)

### Freight & handling are LINE ITEMS, volume-gated at 1,500 lb

The $/lb is merchandise only. Freight/handling always appear as their own lines on the proforma
(so the customer sees the breakdown). The lines flip on order weight + pickup/delivered:

| Scenario | Line items added |
|---|---|
| **Pickup** (EXW SEAFRIGO) | none — customer collects |
| **Delivered, order ≥ 1,500 lb** | **Trucking = $0.30/lb × order lbs** (one computed line) |
| **Delivered, order < 1,500 lb** | **Trucking = $300** (or real going rate by distance) **+ Processing = $135** |

The `under1500 / over1500` volume breaks share this same 1,500 lb threshold. `truckingVariable:
true` means $300 is a baseline the rep overrides with the actual distance-based rate.

> **To confirm:** (a) does `Processing $135` apply ONLY below 1,500 lb, or on all delivered
> orders? (b) Above 1,500 lb, can a customer still pick up at $0 (vs delivered)?
> Encoded as: processing below-threshold-only; pickup always available.

---

## 2 · `catalog.json` — products, SKUs, cost, published prices, specs

A **product** (a cheese) groups one or more **SKUs** (formats/packings). Each SKU carries
**both** pricing sides: `cost.fob` (drives quotes) and `list` (drives the website).

```json
{
  "schemaVersion": "1.1",
  "clientId": "monti-trentini",
  "source": "2026 03 Price list ALL PRODUCTS.xlsx",
  "priceList": "2026-03",

  "products": [
    {
      "id": "asiago-fresco-dop",
      "name": "Asiago Fresco DOP",
      "category": "Asiago PDO",
      "marketing": {
        "blurb": "Aged 30-40 days. Mountain milk from the Trentino Alps.",
        "badge": "PDO", "tags": ["PDO", "Mild"],
        "age": "aged 30-40 days", "milk": "Mountain milk",
        "featured": true, "grad": "linear-gradient(145deg, #C8E2C5, #064E22)"
      },
      "skus": [
        {
          "code": "02005",
          "packing": "Whole Wheel, 28-30 lbs",
          "image": "02005",
          "unit": "lb",

          "cost":  { "fob": 5.83 },

          "list":  { "retail": 13.90, "wholesale": 9.70 },

          "pack": {
            "piecesPerCase": 1, "netLb": 30.0, "grossLb": 32.0,
            "palletTiHi": "6 x 8", "casesPerPallet": 48, "shelfDays": 360
          },
          "availability": "in_stock"
        }
      ]
    }
  ]
}
```

**Field rules**
- `cost.fob` — the FOB SEAFRIGO price-list number. **The quote side computes up from this.**
  Stored once; tier/volume/custom prices are always *computed*, never stored.
- `list` — the **published website prices**, per audience: `{ retail, wholesale }`. Set and
  hand-adjusted as costs move. A `null` audience means "not sold to that audience online."
- `unit` ∈ `"lb" | "case" | "each"` — defines how qty becomes a line total (see pricing-core).
- `image` — Cloudinary public ID relative to `images.folder` (`"02005"` → `monti/02005`).
- `pack.netLb` required when `unit: "lb"` (needed for weight-based line totals).
- `marketing` optional; storefront degrades gracefully, calculator ignores it.

---

## 3 · `inventory.json` — stock + lots (the wholesale driver)

Keyed by SKU `code`. This is the **inventory source of truth** — most important for wholesale,
where opportunities are multiple cases / pallets. Mirrors the calculator's FIFO/expiry model.

```json
{
  "schemaVersion": "1.1",
  "clientId": "monti-trentini",
  "lastUpdated": "2026-05-25",
  "skus": {
    "02005": {
      "casesAvail": 48,
      "comment": "Italian ops note",
      "lots": [
        { "lotNum": "1261846", "receiptDate": "2026-04-01", "cases": 14,
          "reserved": 6, "expDate": "2027-03-26", "comment": "6x cheese imports 84355" }
      ]
    }
  }
}
```

- ISO `YYYY-MM-DD` dates (portable, not JS `Date`).
- `casesAvail` = Σ `(cases − reserved)` across lots; adapter computes it.
- FIFO allocation (earliest `expDate` first) lives in pricing-core, not the data.
- **Overstock signal:** high `casesAvail` + near `expDate` is exactly what feeds an
  overstock **campaign** (below).

---

## 4 · `campaigns.json` — promotions (optional, time-bound)

Promotions are how website prices change: **new-item launches** and **overstock moves**. A
campaign overrides `list` prices for matching SKUs during its window. It never touches `cost.fob`
or quotes.

```json
{
  "schemaVersion": "1.1",
  "clientId": "monti-trentini",
  "campaigns": [
    {
      "id": "asiago-launch-2026-06",
      "label": "New: Asiago Stagionato",
      "kind": "new_item",
      "startDate": "2026-06-10", "endDate": "2026-07-10",
      "applies": { "skus": ["02005"] },
      "override": { "audience": "retail", "mode": "price", "value": 11.90 },
      "badge": "Launch price"
    },
    {
      "id": "overstock-grana-2026-06",
      "label": "Overstock — Grana Padano",
      "kind": "overstock",
      "startDate": "2026-06-06", "endDate": "2026-06-30",
      "applies": { "category": "Grana Padano" },
      "override": { "audience": "wholesale", "mode": "pct", "value": -10 },
      "badge": "Clearance"
    }
  ]
}
```

- `applies` targets by `skus[]` or `category`.
- `override.mode` ∈ `"price"` (set absolute) | `"pct"` (delta off `list`).
- `override.audience` ∈ `"retail" | "wholesale"` (or omit for both).
- Storefront resolves price as: **active campaign override → else `list`**.

---

# v1.2 additions — in-transit inventory, commitments & the movement report

The calculator *captures* container traffic and standing commitments as ETA-strings and
free-text Italian notes; v1.2 *structures* them so they can drive a **Detailed Inventory
Movement Report** — demand vs. supply over time, per SKU and per customer, with YoY growth
and missed-sales factored in. Wholesale-first; this is the planning brain.

## 5 · `inventory.json` lots gain a supply status (in-transit / on the water)

Replaces the old "ETA 05/14" string smuggled into a date field. A lot is now explicitly
on-hand or arriving, with a real ETA.

```json
"lots": [
  { "lotNum": "1261846", "status": "on_hand", "receiptDate": "2026-04-01",
    "cases": 14, "reserved": 6, "expDate": "2027-03-26", "comment": "..." },
  { "lotNum": "PENDING-7781", "status": "in_transit", "eta": "2026-05-14",
    "container": "MSCU1234567", "cases": 600, "reserved": 0, "expDate": null,
    "comment": "Selected via container" }
]
```

- `status` ∈ `"on_hand" | "in_transit"`. On-hand rolls into `casesAvail`; in-transit rolls
  into a new `casesInTransit` (kept separate — you can't ship what's on the water).
- `eta` is an ISO date (the arrival), replacing the free-text ETA hack.
- `container` (optional) ties the lot to a vessel/booking for traffic tracking.

## 6 · `commitments.json` — standing customer pulls (forward-looking)

Per-customer regular plans, structured out of the Italian ops notes ("Greg 15 cs/month",
"DeKalb 30/mo; next container if <50"). Drives baseline demand + reorder triggers.

```json
{
  "schemaVersion": "1.2",
  "clientId": "monti-trentini",
  "commitments": [
    {
      "id": "greg-02005-monthly",
      "customer": "Greg",
      "skuCode": "02005",
      "cadence": "monthly",
      "casesPerPeriod": 15,
      "status": "active",
      "startDate": "2026-01-01",
      "reorderTrigger": { "belowCases": 50 },
      "note": "Greg monthly plan; monitoring",
      "noteIt": "15x greg piano mensile, monitoriamo"
    }
  ]
}
```

- `cadence` ∈ `"weekly" | "monthly" | "quarterly" | "on_order"`.
- `reorderTrigger.belowCases` — when on-hand drops below this, flag a pull / next container.
- `noteIt` keeps the original Italian; `note` the English — same IT/EN model as today.

## 7 · `movement.json` — the historical ledger (sold + **missed**)

Monthly buckets of what actually moved per SKU × customer, **including demand we couldn't
fill**. Missed sales are the key addition — projections must plan for true demand, not just
fulfilled demand.

```json
{
  "schemaVersion": "1.2",
  "clientId": "monti-trentini",
  "grain": "month",
  "records": [
    { "period": "2025-05", "skuCode": "02005", "customer": "Greg", "soldCases": 12, "missedCases": 0 },
    { "period": "2026-05", "skuCode": "02005", "customer": "Greg", "soldCases": 15, "missedCases": 3,
      "note": "short — stockout, Greg wanted 18" }
  ],
  "planningSignal": [
    { "skuCode": "02005", "suggestedUsa": 50, "suggestedIta": 40, "confirmed": 48 }
  ]
}
```

- `soldCases` = fulfilled; `missedCases` = demand lost to stockout/decline. `trueDemand = sold + missed`.
- `period` = `YYYY-MM`. YoY compares same SKU/customer across 12-month spans.
- `planningSignal` carries the inventory sheet's **Suggested Qty USA / ITA / Confirmed** columns.

### History is GENERATED BY THIS BUILD (capture-on-finalize) — decided 2026-06-06

There is no backfill. `movement.json` starts empty and accumulates from go-live. Two capture
points get built into the workflow:
1. **Sold** — finalizing/exporting a draft order appends `{period, skuCode, customer, soldCases}`.
   The quote flow already has every value; it just doesn't record it yet.
2. **Missed** — the allocation engine already computes per-line shortfalls; a one-click "log as
   missed" turns a shortfall into a `missedCases` record (rep confirms).

Until enough months accrue, the Movement Report runs **commitment-driven** (parsed notes), then
shifts to real run-rate + YoY as captured data fills in. **Implication:** movement is
append-heavy, multi-user, accumulating — it's the feature most likely to pull the single
read-point toward a real backend (Netlify Blobs / Supabase). Start by appending exportable
records; keep the write-point clean for that swap.

### Reality check — Monti source file observed 2026-06-04 (110 SKUs)

What the live `Availability of items and pending orders.xlsx` actually contains, and how it maps:

- **Suggested/Confirmed columns: EMPTY (0 of 110).** `planningSignal` is aspirational — keep the
  field, but don't expect data. Forward signal lives in the **comments**, not these columns.
- **Commitments come from the Italian notes** (94/110 filled), parsed by the adapter. Real examples:
  `"Cowbell monthly plan 50x, average purchase TONY 10x"` → Cowbell 50/mo + Tony ~10/mo;
  `"lo comprano solo Cowbell e Dekalb, 18? prossimo container?"` → buyers + reorder trigger;
  `"prodotto senza mercato, ultimo movimento 2015"` → dead SKU (status inactive).
- **No per-SKU sold/qty history exists in the file.** True run-rate / YoY can't be backfilled —
  must be captured going forward. `movement.records` starts accumulating from go-live.
- **Pending-orders sheet = a year of order-HEADER history** (224 orders, 34 customers,
  2025-07 → 2026-07; columns: Delivery Date, PO, Customer, Note, Status). No SKU/qty per line, so
  it yields **customer cadence** (Baldor 30/yr, Cowbell 18…), not per-SKU demand.
- **`Status: "Canceled"` (7 rows) = the first structured missed-sales seed** — adapter maps canceled
  POs → early `missedCases` signal until real capture exists.
- **In-transit:** `ETA 6/12` strings in the lot **Receipt Date** column (28 rows) → adapter sets
  lot `status:"in_transit"`, parses `eta`. (Confirms the v1.2 status+eta model.)
- **Adapter gotchas:** Lot# arrives as float (`1282616.0`), comma-joined multiples
  (`"090525233, 030625232"`), or alphanumeric (`LS6064F`) — normalize to string. `Net Available`
  is lbs. Expiration is `mm/dd/yyyy` text. Row 0 holds `Updated on:` → `lastUpdated`. ~61 SKUs
  have no lot rows (rollup/zero only).

## The Movement Report (a computed view — `forecast-core`)

Not stored; derived from the four sources above. This is the report itself.

```js
trueDemand(sku, customer, period)        // soldCases + missedCases
runRate(sku, customer, months=6)         // trailing avg of trueDemand → baseline
yoyGrowth(sku, customer)                 // last 12 mo vs prior 12 mo, per customer
projectedDemand(sku, period)             // max(active commitment, runRate × (1+yoyGrowth)),
                                         //   summed across customers, blended w/ planningSignal
projectedSupply(sku, asOf)               // casesAvail + in_transit arriving by `eta`
coverageGap(sku, horizonMonths)          // projectedDemand − projectedSupply over the horizon
                                         //   → reorder qty + recommended container timing
```

**Per-SKU report row:** on-hand · in-transit (next ETA) · committed/mo · run-rate · YoY % ·
missed (lost) · projected need (horizon) · **gap → pull/container recommendation** · notes (context).

---

## The pricing-core contract (the shared brain)

Pure functions, no DOM, no client names. Both apps import these. This is your reusable code.

```js
// ——— Proforma / quote side ———
// $/lb is MERCHANDISE ONLY — class-of-trade margin. Freight/handling are never in here.
quoteUnitPrice(sku, { tierId, volumeId, customPct }, config) {
  const fob   = sku.cost.fob;
  const tier  = config.pricing.tiers.find(t => t.id === tierId)?.adjustPct ?? 0;
  const vol   = config.pricing.volumeBreaks.find(v => v.id === volumeId)?.adjustPct ?? 0;
  const extra = customPct ?? 0;
  return round2( fob * (1 + (tier + vol + extra) / 100) );
}

quoteLineTotal(sku, qty, opts, config) {       // qty = cases (lb/case) or pieces (each)
  const price = quoteUnitPrice(sku, opts, config);
  return sku.unit === "lb" ? price * qty * sku.pack.netLb : price * qty;
}

// Freight + handling as ORDER-LEVEL LINE ITEMS (volume-gated). Returns an array of
// {id,label,amount} the proforma lists separately — they never touch $/lb.
freightLines(orderLbs, { basis, truckingOverride }, config) {
  const fr = config.pricing.freight;
  if (basis !== "delivered") return [];                              // pickup: no lines
  if (orderLbs >= fr.thresholdLb)
    return [{ id: "trucking", label: "Trucking (delivered, ≥1,500 lb)",
              amount: round2(fr.delivered.atOrAboveThreshold.perLb * orderLbs) }];   // $0.30/lb × lbs
  const b = fr.delivered.belowThreshold;
  return [
    { id: "trucking",   label: "Trucking (flat / going rate)", amount: truckingOverride ?? b.truckingFlat },
    { id: "processing", label: "Processing & handling",        amount: b.processingFlat },
  ];
}
// proforma total = Σ quoteLineTotal (merchandise) + Σ freightLines.amount

// ——— Storefront side ———
listPrice(sku, audience, campaigns, today) {   // active campaign override → else sku.list
  const c = activeCampaignFor(sku, audience, campaigns, today);
  if (!c) return sku.list[audience];
  return c.override.mode === "price" ? c.override.value
                                     : round2(sku.list[audience] * (1 + c.override.value/100));
}

// ——— Inventory ———
allocate(code, requestedCases, inventory)      // FIFO by earliest expDate → { allocated, shortfall }
```

`round2` = 2 decimals. Currency symbol from `config.currency` at render time, never stored.

---

## The single read-point (what makes the backend swappable)

Both apps get data through ONE function. Today it reads JSON from git (free, versioned). The
day you outgrow it, you change *only this function* to hit Netlify Blobs / Supabase — nothing
else in either app changes.

```js
async function getClientData(clientId) {
  // v1: fetch the JSON files from /clients/<clientId>/
  // v2 (later): same return shape, sourced from a backend
  return { config, catalog, inventory, campaigns, commitments, movement };
}
```

---

## Adapter contract (per client)

The only client-specific code. **Input:** whatever the client sends (Excel, CSV, API, PDF).
**Output:** valid `catalog.json` (+ `inventory.json` / `campaigns.json` if they have them).
Onboarding a new client = write one adapter; engine/storefront/calculator never change.

---

## Validation rules (must pass before publish)

1. Every `sku.code` is unique across the catalog.
2. Every SKU has a positive `cost.fob`.
3. `list` audiences are numbers or `null` (never strings / negatives).
4. `unit: "lb"` SKUs have numeric `pack.netLb > 0`.
5. Every `tierId` / `volumeId` referenced exists in `client.config`.
6. `inventory.json` and `campaigns.json` SKU/category targets all exist in `catalog.json`.
7. All dates ISO `YYYY-MM-DD`; campaign `endDate ≥ startDate`.
8. `schemaVersion` major matches the app's supported version.

---

## How existing files map (non-destructive)

Current files become **projections generated from** the canonical — nothing is replaced:

| Existing file | Becomes |
|---|---|
| storefront `trade-data.jsx` | generated from `catalog.json` (`list`) + `campaigns.json` |
| storefront `trade_catalog.json` | superseded by `catalog.json` |
| calculator `data/products.js` | generated from `catalog.json` (`cost.fob` + specs) |
| calculator class-of-trade list | generated from `client.config` `tiers` + `volumeBreaks` |
| calculator fee fields | generated from `client.config` `fees` |
| calculator `data/inventory-data.js` | generated from `inventory.json` |
| Cloudinary `monti/<code>` | unchanged — `image` field + `images.folder` |

---

## Resolved decisions (2026-06-06)

- [x] **Single FOB base + trucking fee.** One `cost.fob` per SKU (FOB SEAFRIGO). The old
  delivered column is dropped; delivered pricing is quoted as **FOB + a trucking fee line**.
- [x] **Additive percentages.** A quote stacks `tier% + volumeBreak% + custom%`, applied to
  FOB once. (E.g. retail +35, full container −12, custom −3 → +20% net.)
- [x] **Both web audiences — wholesale leads.** The site has a real wholesale mode AND a retail
  shop. `list: { retail, wholesale }` stays. **Wholesale is the established ~$7M/yr core
  business → its path (proforma + wholesale-online) is priority #1; DTC/retail is the new bet.**
- [x] **Placeholder %s for now.** `client.config` is seeded with illustrative tier/volume
  numbers; the real class-of-trade card gets dropped in later (one-file edit, no code change).

## Still to gather

- [ ] **Real class-of-trade % card** — actual foodservice / importer / retail / specialty %s
  and pallet/container/lb-bracket discounts, to replace the placeholders in `client.config`.

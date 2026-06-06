# Channel pricing research — Italian/specialty cheese (US)

Compiled 2026-06-06 from public sources. Purpose: ground Monti Trentini's **class-of-trade
tiers** (the placeholders in `client.config.json`) in real channel economics, and list the
live data sources to track. All figures are industry ranges — treat as calibration, not gospel.

---

## 1. The margin stack — manufacturer → consumer (specialty food)

Each link takes a cut off a base price. Typical specialty-food ranges:

| Link | Typical take | Notes |
|---|---|---|
| **Broker** | 5–7% | Commission for placement; often skipped if importer sells direct |
| **Importer / Distributor** | 15–30% | Specialty distributors 20–30%; broadline foodservice thinner (5–20% on commodities) + listing/handling/shrink fees |
| **Retailer** | 30–50% | Big grocery ~30%; specialty/gourmet shops ~50% (often **keystone** = 100% markup = 50% margin) |
| **Manufacturer target** | 30–60% | Margin a producer wants *before* sending into distribution |

**Worked logic:** a distributor "may add ~40% markup before selling to retailers; the retailer
then takes 30% (big grocery) to 50% (high-end shop)." Stack those and a landed cost can roughly
**2×–3× to the shelf**.

---

## 2. Gross margin by CHANNEL (what each channel keeps)

| Channel | Gross margin | Mechanics |
|---|---|---|
| **Foodservice (operator/restaurant)** | ~70% GP on the menu | But the **distributor→operator** margin is only ~5–20%; operators buy near cost+ |
| **Retail through distribution** | Retailer 35.5% (supermarket dairy avg) → 50–60% (artisan/specialty) | Distributor margin sits *underneath* the retailer's |
| **Retail direct (own shop / farmers market)** | 50–60%+ | No distributor in the middle; producer captures the retail margin |
| **DTC e-commerce** | 40–60% GP, **captures ~100% of retail value** | Highest gross, but new costs: cold-chain shipping, fulfillment labor, platform |

Specialty/artisan cheese sits in the **50–60%** retail band (vs 30–40% for commodity) because
buyers pay up for provenance — directly relevant to the "Product of the Mountains" positioning.

---

## 3. Foodservice pricing mechanics (the complex one)

- **Broadline distributors** = Sysco, US Foods, Performance Food Group (one-stop, thousands of SKUs).
- **Deviated pricing + bill-backs:** the operator pays a contracted price; the distributor delivers
  at that price, then **bills the manufacturer back** the difference vs. its normal price. So the
  manufacturer funds the deal, not the distributor.
- **GPO contracts** (group purchasing orgs) = a deviated price **+ a rebate**, negotiated by the GPO.
- **Class-of-trade allowances** literally began as **"bid" allowances** for schools/hospitals/govt,
  then got extended to all customer classes — this is the historical root of "class of trade" pricing.
- On top of margin: **listing fees, handling fees, shrink/damage fees.**

→ Implication for Monti: foodservice pricing is rarely a clean "+X%". It's a contract price the
distributor deviates to, with manufacturer-funded bill-backs. The proforma's flat class-of-trade %
is the *quote*; real foodservice deals layer deviations/rebates on top.

---

## 4. DTC e-commerce benchmarks (the new channel for Monti)

Real players: **Murray's Cheese, igourmet, Di Bruno Bros** (550–1,000+ SKUs each).
- **Cheese clubs** (the proven DTC format): **$65–$108 per delivery, shipping included**, 3/6/12-mo terms.
- **Cold-chain shipping economics:** insulated box + cold packs **$5–8/box**; expedited 1–2 day
  **$15–25**. These eat the DTC gross-margin advantage if not priced in.
- Model trade-off: DTC captures ~100% of retail value but adds e-com platform, cut-&-wrap labor,
  packaging, and postage. Most specialty players bundle shipping into the price (club model) to hide it.

---

## 5. Real wholesale price anchors

- **Grana Padano PDO wholesale (Italy):** ~**€9.74–€11.69/kg**, avg **~€10.55/kg** (Jan–Feb 2026,
  CLAL, set by the Milano-Monza-Brianza-Lodi Chamber of Commerce) ≈ **~$5.1–5.2/lb ex-works**.
- For reference, Monti's FOB SEAFRIGO base is ~**$5.83/lb** (pickup) — in the same ballpark, which
  sanity-checks the catalog's cost basis.
- Retail of the same cheeses online runs **$15–30+/lb** (Zabar's, Gourmet Wholesaler, igourmet) —
  i.e. roughly **3–5× the wholesale/FOB base** at the consumer shelf.

---

## 6. Live data sources to track

| Source | What it gives | URL |
|---|---|---|
| **CLAL.it** | THE authority — weekly/monthly **wholesale & retail price series** for Grana, Parmigiano, etc., plus export data | clal.it/en (sections: conf_grana, conf_parmigiano, export_grana) |
| Wikifarmer Market | Bulk wholesale price ranges by cheese | wikifarmer.com/market |
| USDA Dairy Market News | US wholesale/import dairy pricing | ams.usda.gov |
| Gourmet Food Marketplace / GFI | Specialty distributor catalogs + retail margin guidance | gourmetfoodmarketplace.com, gfifoods.com |
| Trade pubs | Restaurant Business, Foodservice Director (GPO/deviated-pricing mechanics) | restaurantbusinessonline.com |

> **Note:** the user already has **`GFISupplierPolicies Guidelines-Feb2025_R3.pdf`** on disk —
> GFI is a real Monti channel partner (appears in the pending-orders customers). That PDF likely
> contains GFI's actual margin/fee terms — the single most accurate input for the real tier card.

---

## 7. How this maps to Monti's class-of-trade tiers

Current placeholders in `client.config.json` vs. what the research suggests (markup over FOB):

| Monti tier | Placeholder | Research-grounded range (markup on FOB) | Rationale |
|---|---|---|---|
| Importer / Distributor | +15% | **+15–30%** | They resell down-channel; thinnest because they add their own margin |
| Foodservice | +22% | **+5–20% (contract)** + bill-backs/rebates | Real deals are deviated, not flat — quote high, deviate down |
| Direct to Retail | +35% | **set so the retailer can keystone** (they want 30–50%) | Price to let the shop double it |
| Specialty Retail | +28% | similar, leaning higher | Specialty shops carry 50–60% margin |
| (DTC / retail list) | — | **3–5× FOB** at shelf | The `list.retail` price, once set |

**Takeaway for the review:** the placeholder tiers are directionally reasonable but the *foodservice*
one especially should reflect that real foodservice pricing is contract-deviated, not a flat add. The
**GFI supplier PDF + CLAL price series** are the two real inputs to lock the actual numbers.

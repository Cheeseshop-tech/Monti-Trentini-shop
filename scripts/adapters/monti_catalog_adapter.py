#!/usr/bin/env python3
"""
Monti Trentini — catalog adapter
================================
Builds canonical catalog.json (docs/CANONICAL_SCHEMA.md v1.2) from:
  - data/trade_catalog.json   (authoritative: 34 products / 71 SKUs + FOB pricing)
  - design/ui_kits/shopify-store/trade-data.jsx  (marketing copy: blurb/badge/grad/...)

Decisions baked in (see schema "Resolved decisions"):
  - cost.fob = the price-list pickupLb (FOB SEAFRIGO). deliveryLb is NOT stored as a base —
    the delivered premium becomes a trucking fee (client.config). We report the observed premium.
  - list.{retail,wholesale} = null  (published prices are hand-set; DTC is new, not set yet).

NON-DESTRUCTIVE: only writes clients/monti-trentini/catalog.json (+ a console report).
Run:  python3 scripts/adapters/monti_catalog_adapter.py
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT  = ROOT / "clients" / "monti-trentini" / "catalog.json"
TRADE_CATALOG = ROOT / "data" / "trade_catalog.json"
TRADE_JSX     = ROOT / "design" / "ui_kits" / "shopify-store" / "trade-data.jsx"

def extract_products_array(jsx_text):
    """Pull the `const products = [ ... ]` JSON array out of the jsx via string-aware
    bracket matching (robust to nested arrays/objects)."""
    i = jsx_text.find("const products")
    if i < 0: return []
    start = jsx_text.find("[", i)
    if start < 0: return []
    depth, in_str, esc = 0, False, False
    for j in range(start, len(jsx_text)):
        ch = jsx_text[j]
        if in_str:
            if esc: esc = False
            elif ch == "\\": esc = True
            elif ch == '"': in_str = False
            continue
        if ch == '"': in_str = True
        elif ch == "[": depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                try:    return json.loads(jsx_text[start:j+1])
                except Exception: return []
    return []

def main():
    tc = json.loads(TRADE_CATALOG.read_text())
    marketing_by_id = {}
    if TRADE_JSX.exists():
        for m in extract_products_array(TRADE_JSX.read_text()):
            marketing_by_id[m.get("id")] = m

    products = []
    premiums = []   # delivered - pickup, to report the trucking-fee baseline
    list_set = list_unset = sku_count = 0

    for p in tc["products"]:
        mk = marketing_by_id.get(p["id"], {})
        product = {
            "id": p["id"],
            "name": p["name"],
            "category": mk.get("range") or p.get("aging") or p["name"],
            "marketing": {
                "blurb":   mk.get("blurb", ""),
                "badge":   mk.get("badge", ""),
                "tags":    mk.get("tags", []),
                "age":     mk.get("age", p.get("aging", "")),
                "milk":    mk.get("milk", ""),
                "featured": bool(mk.get("featured", False)),
                "grad":    mk.get("grad", ""),
            },
            "skus": [],
        }
        for f in p["formats"]:
            sku_count += 1
            fob = f.get("pickupLb")
            dlv = f.get("deliveryLb")
            if isinstance(fob, (int, float)) and isinstance(dlv, (int, float)):
                premiums.append(round(dlv - fob, 2))
            # published prices not set yet → null (to be filled by the owner)
            list_unset += 1
            product["skus"].append({
                "code": str(f["code"]),
                "packing": f.get("packing", ""),
                "image": str(f["code"]),
                "unit": "lb",
                "cost": {"fob": fob},
                "list": {"retail": None, "wholesale": None},
                "pack": {
                    "piecesPerCase": f.get("piecesPerCase"),
                    "netLb": f.get("netLb"),
                    "grossLb": f.get("grossLb"),
                    "palletTiHi": f.get("palletTiHi"),
                    "casesPerPallet": f.get("casesPerPallet"),
                    "shelfDays": f.get("shelfDays"),
                },
                "availability": f.get("availability") or p.get("availability", "in_stock"),
            })
        products.append(product)

    catalog = {
        "schemaVersion": "1.2",
        "clientId": "monti-trentini",
        "source": tc.get("source"),
        "priceList": tc.get("priceList"),
        "products": products,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, indent=2, ensure_ascii=False))

    # ---- report ----
    from collections import Counter
    pc = Counter(premiums)
    print(f"✓ catalog.json — {len(products)} products / {sku_count} SKUs")
    print(f"  cost.fob populated from pickupLb (FOB SEAFRIGO)")
    print(f"  list.retail / list.wholesale = null on all {list_unset} SKUs (published prices not set — DTC is new)")
    if premiums:
        common = pc.most_common(3)
        print(f"  observed delivered−pickup premium (→ trucking-fee baseline): "
              f"{', '.join(f'${p}/lb ×{n}' for p,n in common)}")
    miss_mk = sum(1 for p in products if not marketing_by_id.get(p['id']))
    print(f"  marketing copy matched for {len(products)-miss_mk}/{len(products)} products"
          + (f" ({miss_mk} missing)" if miss_mk else ""))

if __name__ == "__main__":
    main()

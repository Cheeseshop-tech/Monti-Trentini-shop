#!/usr/bin/env python3
"""
Emit the storefront data overlay from the grouped trade catalog.

  data/trade_catalog.json
        |
        v
  design/ui_kits/shopify-store/trade-data.jsx   (sets window.STORE_DATA.products + USD)

Non-destructive: the original data.jsx still provides recipes/journal/social/HERO;
this overlay only replaces `products` and switches the currency to USD. Load it
AFTER data.jsx in index.html.

Run:  python3 scripts/build_data_jsx.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "data", "trade_catalog.json")
OUT  = os.path.join(ROOT, "design", "ui_kits", "shopify-store", "trade-data.jsx")

GRADS = [
    ("#C8E2C5", "#064E22"), ("#70C883", "#064E22"), ("#E3F0E1", "#009640"),
    ("#FFFBDC", "#70C883"), ("#C8E2C5", "#009640"), ("#70C883", "#141413"),
    ("#064E22", "#141413"), ("#FFFBDC", "#064E22"),
]
FEATURED = {"asiago-fresco-dop", "asiago-vecchio-dop", "alpeggio-cheese",
            "grana-padano", "parmigiano-reggiano-pdo", "sharp-provolone"}

def rng(name):
    n = name.lower()
    if "asiago" in n: return "Asiago"
    if "provolone" in n: return "Provolone"
    if "grana padano" in n: return "Grana Padano"
    if "parmigiano" in n: return "Parmigiano"
    if "pecorino" in n or "ricotta" in n: return "Pecorino & Sheep"
    if "caciotta" in n: return "Caciotta"
    if "fioretto" in n: return "Fioretto"
    if any(k in n for k in ("piemontese", "toma", "bra", "raschera", "castelmagno")): return "Piemontesi"
    return "Alpine & Specialty"

def badge(p):
    nm = p["name"].upper()
    if p["availability"] == "preorder": return "Pre-order"
    if p["availability"] == "unavailable": return "Limited"
    if "DOP" in nm or "PDO" in nm: return "PDO"
    return "Mountain"

def blurb(p):
    if p["aging"]:
        a = p["aging"][0].upper() + p["aging"][1:]
        return f"{a}. Mountain milk from the Trentino Alps, made and aged in our own plants in Grigno."
    return "From the Trentino mountains — made and aged in our own plants in Grigno."

def fmt_num(x):
    return f"{x:g}" if x is not None else "?"

def weight_summary(formats):
    n = len(formats)
    nets = [f["netLb"] for f in formats if f["netLb"] is not None]
    lo, hi = (min(nets), max(nets)) if nets else (None, None)
    span = fmt_num(lo) if lo == hi else f"{fmt_num(lo)}–{fmt_num(hi)}"
    return f"{n} format{'s' if n != 1 else ''} · {span} lb/case"

def build():
    cat = json.load(open(SRC, encoding="utf-8"))
    products = []
    for i, p in enumerate(cat["products"]):
        exw = [f["pickupLb"] for f in p["formats"] if f["pickupLb"] is not None]
        dly = [f["deliveryLb"] for f in p["formats"] if f["deliveryLb"] is not None]
        f0 = p["formats"][0]
        a, b = GRADS[i % len(GRADS)]
        products.append({
            "id": p["id"], "name": p["name"], "range": rng(p["name"]),
            "price": min(exw), "priceMax": max(exw),
            "delivered": min(dly), "deliveredMax": max(dly),
            "unit": "lb", "multi": len(p["formats"]) > 1,
            # image: primary-format SKU code; productImage() resolves to Cloudinary or local jpg
            "image": f0["code"],
            # representative case for cart math (cases × caseLb × $/lb):
            "caseLb": f0["netLb"], "caseLabel": f0["packing"],
            # back-compat field used by ProductPage strikethrough/PriceTag wholesale path:
            "wholesale": min(exw),
            "weight": weight_summary(p["formats"]),
            "grad": f"linear-gradient(145deg, {a}, {b})",
            "badge": badge(p), "blurb": blurb(p),
            "age": p["aging"] or "—", "milk": "Mountain milk",
            "availability": p["availability"], "featured": p["id"] in FEATURED,
            "formats": p["formats"],
        })
    body = json.dumps(products, ensure_ascii=False, indent=2)
    js = (
        "// AUTO-GENERATED from data/trade_catalog.json by scripts/build_data_jsx.py — do not edit by hand.\n"
        "// Non-destructive overlay: replaces STORE_DATA.products with the real 2026-03 trade catalog\n"
        "// (USD, $/lb, format variants, availability) and switches currency to USD.\n"
        "(function () {\n"
        '  window.STORE_CURRENCY = "USD";\n'
        f"  const products = {body};\n"
        "  if (window.STORE_DATA) { window.STORE_DATA.products = products; }\n"
        '  else { window.STORE_DATA = { products, recipes: [], posts: [], social: [], HERO: "" }; }\n'
        "  window.TRADE_CATALOG = products;\n"
        "})();\n"
    )
    open(OUT, "w", encoding="utf-8").write(js)
    return products

if __name__ == "__main__":
    ps = build()
    print(f"WROTE {OUT}")
    print(f"{len(ps)} products · ranges:", sorted(set(p['range'] for p in ps)))
    print("featured:", [p['id'] for p in ps if p['featured']])
    print("non-stock:", [(p['id'], p['availability']) for p in ps if p['availability'] != 'in_stock'])

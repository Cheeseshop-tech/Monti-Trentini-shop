#!/usr/bin/env python3
"""
Build the grouped trade catalog from the flat master price list.

  data/products_master.json   (71 flat SKUs, from extract_master.py)
        |
        v
  data/trade_catalog.json     (products grouped by cheese, each with format variants)

Grouping rule: each category line in the source spreadsheet is one product;
its SKUs become format variants (whole wheel, 1/4 wheel, etc.). A small
OVERRIDES map fixes source-data artifacts (doubled words, a section header that
swept up a SKU, and the two Grana Padano aging tiers that share a base name).

Run:  python3 scripts/build_catalog.py
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "data", "products_master.json")
OUT  = os.path.join(ROOT, "data", "trade_catalog.json")

# Overrides keyed by the CLEANED category string (availability phrases stripped).
# Use to correct source artifacts. slug is optional (auto-derived otherwise).
OVERRIDES = {
    "MILD PROVOLONE PROVOLONE":               {"name": "Mild Provolone"},
    "I FORMAGGI DOP PIEMONTESI":              {"name": "Toma Piemontese DOP", "slug": "toma-piemontese-dop"},
    "ALPEGGIO CHEESE, aged min.10 monts":     {"name": "Alpeggio Cheese", "aging": "aged min. 10 months"},
    "GRANA PADANO, aged min. 12 to 16 months":{"name": "Grana Padano",         "slug": "grana-padano",         "aging": "aged min. 12–16 months"},
    "GRANA PADANO, aged min. 16 to 20 months":{"name": "Grana Padano Riserva", "slug": "grana-padano-riserva", "aging": "aged min. 16–20 months"},
    "CACIOTTA CHEESE basket rind Vacuum Packed":               {"name": "Caciotta (Basket Rind)",        "slug": "caciotta-basket-rind"},
    "CACIOTTA CHEESE basket rind smaller shape Vacuum Packed": {"name": "Caciotta (Basket Rind, Small)", "slug": "caciotta-basket-rind-small"},
    "PECORINO SICILIANO PRIMOSALE Monti Trentino selection":   {"name": "Pecorino Siciliano Primosale",  "slug": "pecorino-siciliano-primosale"},
    "Ricotta Salata Saporita Monti Trentini":                  {"name": "Ricotta Salata Saporita",       "slug": "ricotta-salata-saporita"},
}

ACRONYMS = {"DOP", "PDO", "IGP"}
SMALL    = {"with", "and", "of", "the", "in", "a", "for", "della", "di", "del"}

def clean_cat(c):
    c = re.sub(r'\s*(NOT AVAILABLE.*|AVAILABLE IF PRE-?ORDERED.*)', '', c, flags=re.I)
    return re.sub(r'\s+', ' ', c).strip().rstrip(',').strip()

def split_name_aging(c):
    m = re.split(r',\s*(aged.*)$', c, maxsplit=1, flags=re.I)
    if len(m) >= 2 and m[1]:
        return m[0].strip().rstrip(','), m[1].strip()
    return c.strip().rstrip(','), None

def titlecase(s):
    out = []
    for i, w in enumerate(s.split()):
        wu, lw = w.upper(), w.lower()
        if wu in ACRONYMS:
            out.append(wu)
        elif i > 0 and lw in SMALL:                 # keep connecting words lowercase
            out.append(lw)
        elif w.startswith("(") and len(w) > 1:      # (drunken) -> (Drunken)
            out.append("(" + w[1:2].upper() + w[2:].lower())
        elif "/" in w:                              # TENERO/SOFT
            out.append("/".join(p.capitalize() for p in w.split("/")))
        else:
            out.append(w[:1].upper() + w[1:].lower() if w.isupper() else w[:1].upper() + w[1:])
    return " ".join(out)

def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def build():
    data = json.load(open(SRC, encoding="utf-8"))
    prods = data["products"]
    groups, order, seen_slugs = {}, [], set()

    for p in prods:
        key = clean_cat(p["category"])
        ov = OVERRIDES.get(key, {})
        if key not in groups:
            auto_name, auto_aging = split_name_aging(key)
            name  = ov.get("name", titlecase(auto_name))
            aging = ov.get("aging", auto_aging)
            slug  = ov.get("slug", slugify(name))
            base, n = slug, 2
            while slug in seen_slugs:        # guarantee unique ids
                slug = f"{base}-{n}"; n += 1
            seen_slugs.add(slug)
            groups[key] = {"id": slug, "name": name, "aging": aging,
                           "availability": p["availability"], "formats": []}
            order.append(key)
        groups[key]["formats"].append({
            "code": p["code"], "packing": p["packing"], "piecesPerCase": p["piecesPerCase"],
            "netLb": p["netLb"], "grossLb": p["grossLb"], "palletTiHi": p["palletTiHi"],
            "casesPerPallet": p["casesPerPallet"], "shelfDays": p["shelfDays"],
            "pickupLb": p["pickupLb"], "deliveryLb": p["deliveryLb"],
        })

    cat = [groups[k] for k in order]
    out = {"source": data["source"], "priceList": data["priceList"], "currency": "USD",
           "productCount": len(cat), "skuCount": len(prods), "products": cat}
    json.dump(out, open(OUT, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    return out

if __name__ == "__main__":
    out = build()
    print(f"WROTE {OUT}")
    print(f"{out['productCount']} products from {out['skuCount']} SKUs\n")
    dupes = len(set(p["id"] for p in out["products"])) != out["productCount"]
    assert not dupes, "duplicate product ids!"
    for g in out["products"]:
        lo = min(f["pickupLb"] for f in g["formats"]); hi = max(f["pickupLb"] for f in g["formats"])
        pr = f"${lo:.2f}" if lo == hi else f"${lo:.2f}-${hi:.2f}"
        flag = "" if g["availability"] == "in_stock" else f"[{g['availability'].upper()}]"
        print(f"{g['id']:30} {g['name'][:30]:30} {len(g['formats'])}fmt {pr:>14}  {(g['aging'] or '')[:20]:20} {flag}")

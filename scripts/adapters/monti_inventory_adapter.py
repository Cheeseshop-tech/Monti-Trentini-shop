#!/usr/bin/env python3
"""
Monti Trentini — inventory adapter
==================================
Turns the live "Availability of items and pending orders.xlsx" into the
canonical schema (docs/CANONICAL_SCHEMA.md v1.2):

  - clients/monti-trentini/inventory.json   (on_hand + in_transit lots, ETA parsed)
  - clients/monti-trentini/commitments.json  (parsed from the Italian ops notes)
  - clients/monti-trentini/_adapter_report.md (what parsed cleanly vs needs review)

NON-DESTRUCTIVE: only writes the three files above. Reads the xlsx; never edits it.
This is the ONLY client-specific code — the canonical output looks the same for any client.

Run:  python3 scripts/adapters/monti_inventory_adapter.py
"""
import json, re, datetime, sys, os
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl required:  pip3 install openpyxl")

ROOT = Path(__file__).resolve().parents[2]
OUT  = ROOT / "clients" / "monti-trentini"
SRC  = OUT / "source" / "Availability of items and pending orders-2026-06-04.xlsx"
CLIENT_ID = "monti-trentini"
SCHEMA = "1.2"

# ---- translation map reused from the calculator (IT -> EN), best-effort ----
def load_translations():
    f = Path("/Users/richardposada/Documents/Claude/Projects/Custom price list creator image dev/data/translations.js")
    m = {}
    if not f.exists():
        return m
    txt = f.read_text(encoding="utf-8", errors="ignore")
    # crude but safe: capture "key": "value" pairs
    for k, v in re.findall(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', txt):
        m[k.strip().lower()] = v
    return m

TRANS = load_translations()

def translate(it):
    if not it: return ""
    return TRANS.get(str(it).strip().lower(), "")

# ---------- value normalizers (handle the real-data gotchas) ----------
def norm_lotnum(v):
    if v is None: return ""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v).strip()

def to_iso(v):
    """Excel date / mm/dd/yyyy text -> ISO yyyy-mm-dd, else None."""
    if v is None or v == "": return None
    if isinstance(v, datetime.datetime):
        return v.date().isoformat()
    if isinstance(v, datetime.date):
        return v.isoformat()
    s = str(v).strip()
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', s)        # mm/dd/yyyy
    if m: return f"{int(m.group(3)):04d}-{int(m.group(1)):02d}-{int(m.group(2)):02d}"
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})', s)              # already ISO
    if m: return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    return None

def parse_eta(v, ref_year, ref_date):
    """'ETA 6/12' -> ISO date, inferring the year from the file's update date."""
    if not isinstance(v, str): return None
    m = re.search(r'eta\s*(\d{1,2})/(\d{1,2})', v, re.I)
    if not m: return None
    mo, dy = int(m.group(1)), int(m.group(2))
    try:
        d = datetime.date(ref_year, mo, dy)
    except ValueError:
        return None
    if ref_date and d < ref_date:      # ETA before the file date => next year
        d = datetime.date(ref_year + 1, mo, dy)
    return d.isoformat()

def num(v):
    if v in (None, ""): return 0
    try: return float(v)
    except (TypeError, ValueError): return 0

# ======================================================================
def main():
    wb = openpyxl.load_workbook(SRC, data_only=True, read_only=True)
    inv_ws = wb["Current Inventory + Reservation"]
    rows = list(inv_ws.iter_rows(values_only=True))

    # row 0 metadata: "Updated on:" + date
    updated_iso = None
    for c in rows[0]:
        iso = to_iso(c)
        if iso: updated_iso = iso; break
    ref_date = datetime.date.fromisoformat(updated_iso) if updated_iso else datetime.date(2026, 6, 4)
    ref_year = ref_date.year

    data = rows[2:]   # skip metadata row + header row

    skus = {}   # code -> sku dict
    def ensure(code, name=""):
        code = str(code).strip()
        if code not in skus:
            skus[code] = {"code": code, "name": name or "", "casesAvail": 0,
                          "casesInTransit": 0, "comment": "", "commentEn": "", "lots": []}
        return skus[code]

    master_count = lot_count = in_transit_count = 0

    for r in data:
        # ---- MASTER side: cols 0..6 ----
        if r[0] not in (None, ""):
            master_count += 1
            s = ensure(r[0], r[1])
            if r[1]: s["name"] = str(r[1])
            cases = num(r[2])
            if cases: s["casesAvail"] = int(cases)
            if r[6] not in (None, ""):
                s["comment"] = str(r[6]).strip()
                s["commentEn"] = translate(r[6])

        # ---- LOT side: cols 8..16 ----
        if len(r) > 8 and r[8] not in (None, ""):
            lot_count += 1
            s = ensure(r[8], r[9])
            receipt_raw = r[11]
            eta = parse_eta(receipt_raw, ref_year, ref_date)
            status = "in_transit" if eta else "on_hand"
            if status == "in_transit": in_transit_count += 1
            lot = {
                "lotNum":   norm_lotnum(r[10]),
                "status":   status,
                "receiptDate": None if eta else to_iso(receipt_raw),
                "eta":      eta,
                "cases":    int(num(r[12])),
                "reserved": int(num(r[13])),
                "netAvailLb": float(r[15]) if isinstance(r[15], (int, float)) else None,
                "expDate":  to_iso(r[16]),
                "comment":  str(r[14]).strip() if r[14] not in (None, "") else "",
            }
            s["lots"].append(lot)

    # ---- rollups: sort lots by expiry; split on_hand vs in_transit ----
    for s in skus.values():
        s["lots"].sort(key=lambda l: (l["expDate"] or "9999-99-99"))
        on_hand = sum((l["cases"] - l["reserved"]) for l in s["lots"] if l["status"] == "on_hand")
        in_tr   = sum(l["cases"] for l in s["lots"] if l["status"] == "in_transit")
        s["casesInTransit"] = in_tr
        if not s["casesAvail"] and on_hand:   # recompute only if master was blank
            s["casesAvail"] = on_hand

    inventory = {
        "schemaVersion": SCHEMA,
        "clientId": CLIENT_ID,
        "lastUpdated": updated_iso,
        "source": SRC.name,
        "skus": skus,
    }

    # ================= COMMITMENTS from the Italian notes =================
    KNOWN = ["Cowbell","DeKalb","De Kalb","ACE Endico","Ace Endico","Baldor","Selected",
             "Tony","Greg","Alma","Lettieri","Veroni","Creminelli","Levoni","Musco","GFI",
             "Gordon","SK Food","JVM","KeHE","Di Palo","Tama","Detwiler","Stefano","TJ"]
    # collapse spelling variants to one canonical name
    CANON = {"de kalb": "DeKalb", "dekalb": "DeKalb",
             "ace endico": "ACE Endico"}
    def canon(name):
        return CANON.get(name.lower(), name)
    def find_named(low):
        seen, out = set(), []
        for c in KNOWN:
            if c.lower() in low:
                cn = canon(c)
                if cn not in seen:
                    seen.add(cn)
                    out.append((low.index(c.lower()), cn))
        return [n for _, n in sorted(out)]
    commitments, needs_review = [], []

    for code, s in skus.items():
        note = s["comment"]
        if not note: continue
        en = s["commentEn"] or note
        low = note.lower()
        rec = {"skuCode": code, "note": note, "noteEn": s["commentEn"], "_source": "master comment"}

        # dead / no-market product
        if re.search(r'senza mercato|no market', low):
            yrm = re.search(r'(?:ultimo movimento|last movement)\s*(\d{4})', low)
            commitments.append({**rec, "id": f"{code}-inactive", "kind": "inactive",
                                "status": "inactive",
                                "lastMovementYear": int(yrm.group(1)) if yrm else None})
            continue

        # monthly plan with a quantity:  "... monthly plan 50x", "piano mensile 50x", "50x ... mensile"
        qty = None
        mqty = re.search(r'(\d{1,3})\s*x?\s*(?:per )?(?:month|mese|mensile|monthly)', low) \
            or re.search(r'(?:monthly plan|piano mensile)\s*(\d{1,3})', low)
        if mqty: qty = int(mqty.group(1))

        # which customers are named? (canonical, deduped, in order of appearance)
        named = find_named(low)

        # reorder trigger:  "<33?", "18?", "drop <50"
        mt = re.search(r'<\s*(\d{1,3})', low) or re.search(r'\b(\d{1,3})\?\s*$', note.strip())
        trigger = int(mt.group(1)) if mt else None

        if qty and named:
            commitments.append({**rec, "id": f"{code}-{named[0].lower().replace(' ','')}-monthly",
                                "kind": "standing_plan", "status": "active",
                                "customer": named[0], "cadence": "monthly", "casesPerPeriod": qty,
                                "alsoBuy": named[1:], "reorderBelowCases": trigger})
        elif qty or trigger or named:
            # partial signal — capture but flag for human confirmation
            needs_review.append({**rec, "guess": {"customer": named[0] if named else None,
                                  "casesPerPeriod": qty, "reorderBelowCases": trigger,
                                  "alsoBuy": named[1:] if len(named) > 1 else []}})
        else:
            needs_review.append({**rec, "guess": {}})

    commitments_doc = {
        "schemaVersion": SCHEMA, "clientId": CLIENT_ID,
        "generatedFrom": SRC.name,
        "commitments": commitments,
        "_needsReview": needs_review,
    }

    # ===================== PENDING ORDERS (cadence + missed seed) ==========
    po_ws = wb["Pending orders"]
    po_rows = [r for r in list(po_ws.iter_rows(values_only=True))[1:]
               if any(x not in (None, "") for x in r[:5])]
    from collections import Counter
    cadence = Counter(str(r[2]).strip() for r in po_rows if r[2] not in (None, ""))
    canceled = [{"date": to_iso(r[0]), "po": str(r[1]), "customer": str(r[2]),
                 "note": str(r[3]) if r[3] else ""} for r in po_rows
                if str(r[4]).strip().lower() == "canceled"]

    # ----------------------------- WRITE -----------------------------
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "inventory.json").write_text(json.dumps(inventory, indent=2, ensure_ascii=False))
    (OUT / "commitments.json").write_text(json.dumps(commitments_doc, indent=2, ensure_ascii=False))

    # ---- report for eyeballing ----
    on_hand_skus = sum(1 for s in skus.values() if s["casesAvail"] > 0)
    transit_skus = sum(1 for s in skus.values() if s["casesInTransit"] > 0)
    total_lots = sum(len(s["lots"]) for s in skus.values())
    rpt = []
    rpt.append(f"# Monti adapter report — generated from {SRC.name}\n")
    rpt.append(f"- Source updated on: **{updated_iso}**")
    rpt.append(f"- SKUs: **{len(skus)}**  ·  master rows {master_count}  ·  lot rows {lot_count}")
    rpt.append(f"- Lots: **{total_lots}**  ·  in-transit lots (ETA parsed): **{in_transit_count}**")
    rpt.append(f"- SKUs with on-hand stock: **{on_hand_skus}**  ·  with in-transit: **{transit_skus}**")
    rpt.append(f"\n## Commitments parsed from notes")
    rpt.append(f"- Auto-extracted (confident): **{len(commitments)}**")
    rpt.append(f"- Flagged for review: **{len(needs_review)}**")
    rpt.append(f"\n### Confident commitments")
    for c in commitments[:40]:
        if c["kind"] == "standing_plan":
            rpt.append(f"- `{c['skuCode']}` **{c['customer']} {c['casesPerPeriod']}/mo**"
                       f"{' (also: '+', '.join(c['alsoBuy'])+')' if c.get('alsoBuy') else ''}"
                       f"{' · reorder <'+str(c['reorderBelowCases']) if c.get('reorderBelowCases') else ''}"
                       f"  ← _{c['note'][:50]}_")
        else:
            rpt.append(f"- `{c['skuCode']}` **INACTIVE**"
                       f"{' (last '+str(c['lastMovementYear'])+')' if c.get('lastMovementYear') else ''}"
                       f"  ← _{c['note'][:50]}_")
    rpt.append(f"\n### Needs review (sample)")
    for c in needs_review[:25]:
        g = c.get("guess", {})
        hint = ", ".join(f"{k}={v}" for k, v in g.items() if v)
        rpt.append(f"- `{c['skuCode']}` {('['+hint+'] ') if hint else ''}← _{c['note'][:60]}_")
    rpt.append(f"\n## Pending orders → customer cadence (orders in file)")
    for cust, n in cadence.most_common(12):
        rpt.append(f"- {cust}: {n}")
    rpt.append(f"\n## Canceled POs (missed-sale seed): {len(canceled)}")
    for c in canceled:
        rpt.append(f"- {c['date']} · {c['customer']} · {c['po']}")
    (OUT / "_adapter_report.md").write_text("\n".join(rpt))

    # console summary
    print(f"✓ inventory.json   — {len(skus)} SKUs, {total_lots} lots, {in_transit_count} in-transit")
    print(f"✓ commitments.json — {len(commitments)} confident, {len(needs_review)} need review")
    print(f"✓ _adapter_report.md")
    print(f"\nWrote to {OUT}")

if __name__ == "__main__":
    main()

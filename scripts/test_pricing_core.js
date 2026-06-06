/* Test harness for core/pricing-core.js — runs real Monti canonical data through the engine.
   Expects globals CONFIG, CATALOG, INVENTORY (injected) and PricingCore (from the core module).
   Run via: scripts/run_pricing_tests.sh  (concatenates JSON + core + this, executes in JXA). */
var PC = (typeof PricingCore !== "undefined") ? PricingCore : globalThis.PricingCore;

function sku(code) {
  for (var p of CATALOG.products) for (var s of p.skus) if (s.code === code) return s;
  throw new Error("SKU not found: " + code);
}
var pass = 0, fail = 0;
function eq(label, got, want) {
  var ok = Math.abs(Number(got) - Number(want)) < 0.005;
  console.log((ok ? "  PASS " : "  FAIL ") + label + "  → got " + got + (ok ? "" : "  (want " + want + ")"));
  ok ? pass++ : fail++;
}
function money(n) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

var asiago = sku("02005");           // FOB 5.83, netLb 30
console.log("\n=== SKU 02005 Asiago Fresco — FOB $" + asiago.cost.fob + "/lb, " + asiago.pack.netLb + " lb/case ===");

// --- unit price by tier (merchandise only) ---
console.log("\n[1] Merchandise $/lb by class-of-trade (FOB 5.83):");
eq("importer +15%",   PC.quoteUnitPrice(asiago, { tierId: "importer" },   CONFIG), 6.70);
eq("retail +35%",     PC.quoteUnitPrice(asiago, { tierId: "retail" },     CONFIG), 7.87);
eq("foodservice +22%",PC.quoteUnitPrice(asiago, { tierId: "foodservice" },CONFIG), 7.11);

// --- additive stacking: container -12 + importer +15 + custom -3 = 0% ---
console.log("\n[2] Additive %: importer+15, full container-12, custom-3 → net 0 → $/lb = FOB:");
eq("net 0% = FOB", PC.quoteUnitPrice(asiago, { tierId: "importer", volumeId: "container", customPct: -3 }, CONFIG), 5.83);

// --- freight gating: PICKUP vs DELIVERED, under vs over 1,500 lb ---
console.log("\n[3] Freight line items (volume-gated at 1,500 lb):");
var pickup40   = PC.quoteOrder([{ sku: asiago, cases: 40 }], { tierId: "importer", basis: "pickup" }, CONFIG);
var deliv40    = PC.quoteOrder([{ sku: asiago, cases: 40 }], { tierId: "importer", basis: "delivered" }, CONFIG); // 1200 lb < 1500
var deliv60    = PC.quoteOrder([{ sku: asiago, cases: 60 }], { tierId: "importer", basis: "delivered" }, CONFIG); // 1800 lb >= 1500
eq("pickup 40cs → 0 freight lines",        pickup40.freight.length, 0);
eq("pickup 40cs grand = merch",            pickup40.grandTotal, 8040.00);
eq("deliv 40cs (1200lb) freight lines",    deliv40.freight.length, 2);          // trucking + processing
eq("deliv 40cs trucking $300",             deliv40.freight[0].amount, 300);
eq("deliv 40cs processing $135",           deliv40.freight[1].amount, 135);
eq("deliv 40cs grand = 8040+435",          deliv40.grandTotal, 8475.00);
eq("deliv 60cs (1800lb) freight lines",    deliv60.freight.length, 1);          // $0.30/lb only
eq("deliv 60cs trucking 0.30×1800=540",    deliv60.freight[0].amount, 540.00);
eq("deliv 60cs grand = 12060+540",         deliv60.grandTotal, 12600.00);

// --- FIFO allocation against real stock (on_hand only; in_transit excluded) ---
console.log("\n[4] FIFO allocation — 02005, request 40 cases:");
var alloc = PC.allocate("02005", 40, INVENTORY);
console.log("    on-hand lots: " + INVENTORY.skus["02005"].lots.filter(l=>l.status==="on_hand").map(l=>l.lotNum+"("+(l.cases-l.reserved)+")").join(", ")
            + " | in-transit excluded: " + INVENTORY.skus["02005"].lots.filter(l=>l.status==="in_transit").map(l=>l.lotNum).join(", "));
eq("allocated from on-hand",   alloc.totalAllocated, 7);
eq("shortfall",                alloc.shortfall, 33);
eq("did NOT pull in-transit",  alloc.allocated.every(a => a.cases > 0) && alloc.allocated.length, 1);

// --- listPrice: null when unset, campaign override when present ---
console.log("\n[5] Storefront listPrice (published prices not set yet → null):");
eq("retail null (no list)", PC.listPrice(asiago, "retail", { campaigns: [] }, "2026-06-06") === null ? 1 : 0, 1);
var camp = { campaigns: [{ id:"promo", startDate:"2026-06-01", endDate:"2026-06-30",
              applies:{ skus:["02005"] }, override:{ audience:"retail", mode:"price", value:11.90 } }] };
var withList = Object.assign({}, asiago, { list: { retail: 13.90, wholesale: 9.70 } });
eq("campaign price override → 11.90", PC.listPrice(withList, "retail", camp, "2026-06-15"), 11.90);
eq("outside window → base 13.90",     PC.listPrice(withList, "retail", camp, "2026-07-15"), 13.90);

// --- sample proforma printout (delivered, 60 cases, importer) ---
console.log("\n=== SAMPLE PROFORMA — 60 cs Asiago 02005, Importer tier, DELIVERED ===");
console.log("  " + deliv60.lines.map(l => l.cases + "cs × " + l.lbs + "lb @ " + money(l.unitPrice) + "/lb = " + money(l.lineTotal)).join("\n  "));
console.log("  Merchandise subtotal: " + money(deliv60.merchSubtotal) + "   (" + deliv60.totalLbs + " lb)");
deliv60.freight.forEach(f => console.log("  + " + f.label + ": " + money(f.amount)));
console.log("  GRAND TOTAL: " + money(deliv60.grandTotal));

console.log("\n──────────── " + pass + " passed, " + fail + " failed ────────────");

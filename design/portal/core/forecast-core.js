/* ============================================================
   forecast-core — the Detailed Inventory Movement Report engine
   ------------------------------------------------------------
   Pure functions. Turns canonical data into demand-vs-supply projections:
     demand  = max(standing commitments, captured run-rate) × horizon
     supply  = on-hand + in-transit (arriving by ETA)
     gap     = demand − supply  → reorder / next-container recommendation

   History is captured by THIS build (movement records: sold + missed).
   Until it accrues, projections run commitment-driven and self-heal over time.
   Contract: docs/CANONICAL_SCHEMA.md (v1.2).
   ============================================================ */
(function (global) {
  "use strict";

  const round1 = n => Math.round(Number(n) * 10) / 10;
  const cadenceToMonthly = { weekly: 4.33, monthly: 1, quarterly: 1 / 3, on_order: 0 };

  // --- demand from standing commitments (normalize cadence → cases/month) ---
  function committedMonthly(commitments, code) {
    const list = (commitments && commitments.commitments) || [];
    let m = 0;
    for (const c of list) {
      if (c.skuCode !== code || c.kind !== "standing_plan" || c.status === "inactive") continue;
      const factor = cadenceToMonthly[c.cadence] != null ? cadenceToMonthly[c.cadence] : 1;
      m += (Number(c.casesPerPeriod) || 0) * factor;
    }
    return round1(m);
  }

  // --- captured movement → trueDemand (sold + missed) buckets by month ---
  function demandByPeriod(movement, code) {
    const recs = (movement && movement.records) || movement || [];
    const out = {};
    for (const r of recs) {
      if (r.skuCode !== code) continue;
      out[r.period] = (out[r.period] || 0) + (Number(r.soldCases) || 0) + (Number(r.missedCases) || 0);
    }
    return out;
  }

  // --- trailing run-rate (avg monthly trueDemand over the window) ---
  function runRate(movement, code, months) {
    months = months || 6;
    const byP = demandByPeriod(movement, code);
    const periods = Object.keys(byP).sort().slice(-months);
    if (!periods.length) return null;                         // no history yet
    const total = periods.reduce((s, p) => s + byP[p], 0);
    return round1(total / periods.length);
  }

  // --- YoY growth: last 12 mo vs prior 12 mo (null until enough history) ---
  function yoyGrowth(movement, code) {
    const byP = demandByPeriod(movement, code);
    const ps = Object.keys(byP).sort();
    if (ps.length < 13) return null;
    const last12 = ps.slice(-12).reduce((s, p) => s + byP[p], 0);
    const prior12 = ps.slice(-24, -12).reduce((s, p) => s + byP[p], 0);
    if (!prior12) return null;
    return Math.round((last12 / prior12 - 1) * 100);
  }

  function onHand(inventory, code)   { const s = inventory.skus[code]; return s ? (s.casesAvail || 0) : 0; }
  function inTransit(inventory, code){ const s = inventory.skus[code]; return s ? (s.casesInTransit || 0) : 0; }
  function nextEta(inventory, code)  { const s = inventory.skus[code]; if (!s) return null;
    return (s.lots || []).filter(l => l.status === "in_transit" && l.eta).map(l => l.eta).sort()[0] || null; }

  /* The full per-SKU movement-report row. */
  function coverage(code, data, horizonMonths) {
    horizonMonths = horizonMonths || 3;
    const { commitments, inventory, movement, config } = data;
    const committed = committedMonthly(commitments, code);
    const rr = runRate(movement, code, 6);
    const monthly = Math.max(committed, rr || 0);             // demand signal: plan or run-rate
    const demand = round1(monthly * horizonMonths);
    const oh = onHand(inventory, code), it = inTransit(inventory, code);
    const supply = oh + it;
    const gap = round1(demand - supply);
    const reorderCs = Math.max(0, gap);
    return {
      code, committedMonthly: committed, runRate: rr, yoy: yoyGrowth(movement, code),
      monthly: round1(monthly), horizonMonths, demand,
      onHand: oh, inTransit: it, nextEta: nextEta(inventory, code), supply,
      gap, reorder: gap > 0, reorderCases: reorderCs,
      // recommend a container pull when the gap is large relative to monthly demand
      flagContainer: monthly > 0 && reorderCs >= monthly * 2,
      hasSignal: committed > 0 || rr != null,
    };
  }

  /* Build the whole report (sorted: biggest coverage gaps first). */
  function report(codes, data, horizonMonths) {
    return codes.map(c => coverage(c, data, horizonMonths))
                .sort((a, b) => (b.reorder - a.reorder) || (b.gap - a.gap));
  }

  const ForecastCore = { committedMonthly, demandByPeriod, runRate, yoyGrowth,
    onHand, inTransit, nextEta, coverage, report };
  if (typeof module !== "undefined" && module.exports) module.exports = ForecastCore;
  global.ForecastCore = ForecastCore;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));

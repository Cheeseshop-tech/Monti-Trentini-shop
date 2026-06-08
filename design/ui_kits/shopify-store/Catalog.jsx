// Catalog — ProductCard, CollectionPage (PLP), ProductPage (PDP).
function PriceTag({ p, wholesale, big }) {
  // Trade store: price is $/lb (EXW NJ). Show "from" when the product has
  // multiple case formats at different rates.
  const unit = p.unit ? `/${p.unit}` : "";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      {p.multi && <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: big ? 14 : 11, color: "var(--mt-charcoal)" }}>from</span>}
      <span style={{ fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: big ? 30 : 18, color: "var(--mt-forest)" }}>
        {window.money(p.price)}<span style={{ fontSize: big ? 15 : 12, fontWeight: 500, color: "var(--mt-charcoal)" }}>{unit}</span>
      </span>
      <span style={ctStyles.tradeTag}>EXW NJ</span>
    </div>
  );
}

function ProductCard({ p, onNav, wholesale }) {
  const cart = React.useContext(window.CartCtx);
  const [hover, setHover] = React.useState(false);
  const mobile = window.useIsMobile();
  const show = hover || mobile;   // touch devices have no hover — keep Add visible (audit HIGH)
  const sold = p.availability === "unavailable";
  const pre = p.availability === "preorder";
  return (
    <article style={ctStyles.card} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ ...ctStyles.thumb, background: p.grad }} onClick={() => onNav("product", p.id)}>
        {p.image && <img alt={p.name} {...window.productImgProps(p.image, { w: 600 })} />}
        <span style={{ ...ctStyles.badge, position: "relative", zIndex: 1 }}>{p.badge}</span>
        {p.availability && p.availability !== "in_stock" &&
          <span style={{ ...ctStyles.stockChip, ...(sold ? ctStyles.stockOut : ctStyles.stockPre) }}>{sold ? "Unavailable" : "Pre-order"}</span>}
        <button className="mt-btn mt-btn--solid" disabled={sold}
          style={{ ...ctStyles.quickAdd, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(8px)", ...(sold ? { filter: "grayscale(1)", cursor: "not-allowed" } : {}) }}
          onClick={(e) => { e.stopPropagation(); if (!sold) cart.add(p.id); }}>
          {sold ? "Unavailable" : pre ? "Pre-order · add" : "Add a case"}
        </button>
      </div>
      <div style={ctStyles.cardBody}>
        <div style={ctStyles.range}>{p.range}</div>
        <h3 style={ctStyles.cardName} onClick={() => onNav("product", p.id)}>{p.name}</h3>
        <div style={ctStyles.weight}>{p.weight}</div>
        <div style={{ marginTop: 10 }}><PriceTag p={p} wholesale={wholesale} /></div>
      </div>
    </article>
  );
}

function CollectionPage({ onNav, wholesale }) {
  const { products } = window.STORE_DATA;
  const ranges = ["All", ...Array.from(new Set(products.map((p) => p.range)))];
  const [filter, setFilter] = React.useState("All");
  const shown = filter === "All" ? products : products.filter((p) => p.range === filter);
  const mobile = window.useIsMobile();
  const narrow = window.useIsMobile(480);
  const gridCols = narrow ? "1fr" : (mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)");
  return (
    <main>
      <div style={{ ...ctStyles.plpHead, ...(mobile ? ctStyles.plpHeadMobile : {}) }}>
        <Eyebrow>Shop · 50+ cheeses, 300 references</Eyebrow>
        <h1 style={{ ...ctStyles.plpTitle, ...(mobile ? ctStyles.plpTitleMobile : {}) }}>The cheeses of the mountain.</h1>
        <p style={{ ...ctStyles.plpIntro, ...(mobile ? ctStyles.plpIntroMobile : {}) }}>Milk processing, cheese making, aging and packaging — all in our own plants in Grigno.</p>
      </div>
      <div style={{ ...ctStyles.plpBody, ...(mobile ? ctStyles.plpBodyMobile : {}) }}>
        <div style={ctStyles.filters}>
          {ranges.map((r) => (
            <button key={r} onClick={() => setFilter(r)}
              style={{ ...ctStyles.chip, ...(filter === r ? ctStyles.chipOn : {}) }}>{r}</button>
          ))}
        </div>
        <div style={{ ...ctStyles.grid, gridTemplateColumns: gridCols, ...(mobile ? { gap: 14 } : {}) }}>
          {shown.map((p) => <ProductCard key={p.id} p={p} onNav={onNav} wholesale={wholesale} />)}
        </div>
      </div>
    </main>
  );
}

function ProductPage({ id, onNav, wholesale }) {
  const { products } = window.STORE_DATA;
  const p = products.find((x) => x.id === id) || products[0];
  const cart = React.useContext(window.CartCtx);
  const [qty, setQty] = React.useState(1);
  const related = products.filter((x) => x.id !== p.id && (x.range === p.range || x.featured)).slice(0, 4);
  const formats = p.formats || [];
  const sold = p.availability === "unavailable";
  const pre = p.availability === "preorder";
  const shelf = formats[0] && formats[0].shelfDays ? `${formats[0].shelfDays} days` : "—";
  const mobile = window.useIsMobile();
  const narrow = window.useIsMobile(480);
  const relCols = narrow ? "1fr" : (mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)");
  window.useLucide();
  return (
    <main style={{ ...ctStyles.pdpWrap, ...(mobile ? ctStyles.pdpWrapMobile : {}) }}>
      <button style={ctStyles.back} onClick={() => onNav("collection")}><Icon name="arrow-left" size={16} /> Back to shop</button>
      <div style={{ ...ctStyles.pdpGrid, ...(mobile ? ctStyles.pdpGridMobile : {}) }}>
        <div style={{ ...ctStyles.pdpImage, background: p.grad, overflow: "hidden" }}>
          {p.image && <img alt={p.name} {...window.productImgProps(p.image, { w: 900 })} />}
          <span style={{ ...ctStyles.badge, position: "relative", zIndex: 1 }}>{p.badge}</span>
          {p.availability && p.availability !== "in_stock" &&
            <span style={{ ...ctStyles.stockChip, ...(sold ? ctStyles.stockOut : ctStyles.stockPre) }}>{sold ? "Unavailable" : "Pre-order"}</span>}
        </div>
        <div>
          <div style={ctStyles.range}>{p.range}</div>
          <h1 style={{ ...ctStyles.pdpTitle, ...(mobile ? ctStyles.pdpTitleMobile : {}) }}>{p.name}</h1>
          <div style={{ margin: "14px 0 18px" }}><PriceTag p={p} wholesale={wholesale} big /></div>
          <p style={{ ...ctStyles.pdpBlurb, ...(mobile ? ctStyles.pdpBlurbMobile : {}) }}>{p.blurb}</p>
          {p.availability && p.availability !== "in_stock" && (
            <div style={{ ...ctStyles.availBanner, ...(sold ? ctStyles.availBannerOut : ctStyles.availBannerPre) }}>
              <Icon name={sold ? "x-circle" : "clock"} size={16} />
              {sold ? "Not currently available (FDA restriction)." : "Available to pre-order — allocated by order."}
            </div>
          )}
          <div style={{ ...ctStyles.specs, ...(mobile ? ctStyles.specsMobile : {}) }}>
            <Spec icon="mountain" label="Origin" value={p.milk} />
            <Spec icon="clock" label="Ageing" value={p.age} />
            <Spec icon="calendar" label="Shelf life" value={shelf} />
          </div>
          <div style={ctStyles.buyRow}>
            <div style={ctStyles.qty}>
              <button style={ctStyles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}><Icon name="minus" size={16} /></button>
              <span style={ctStyles.qtyNum}>{qty}</span>
              <button style={ctStyles.qtyBtn} onClick={() => setQty((q) => q + 1)}><Icon name="plus" size={16} /></button>
            </div>
            <button className="mt-btn mt-btn--solid mt-btn--lg" disabled={sold}
              style={{ flex: 1, justifyContent: "center", ...(sold ? { filter: "grayscale(1)", cursor: "not-allowed" } : {}) }}
              onClick={() => { if (!sold) cart.add(p.id, qty); }}>
              {sold ? "Unavailable" : `${pre ? "Pre-order" : "Add"} · ${qty} ${qty === 1 ? "case" : "cases"}`}
            </button>
          </div>
          <div style={ctStyles.assurance} className="row-icons">
            <span><Icon name="truck" size={15} /> EXW Elizabeth NJ · delivered min 150 lb</span>
            <span><Icon name="award" size={15} /> Product of the Mountains</span>
          </div>
        </div>
      </div>

      <div style={ctStyles.fmtWrap}>
        <h2 style={{ ...ctStyles.fmtTitle, ...(mobile ? ctStyles.fmtTitleMobile : {}) }}>Formats &amp; trade pricing</h2>
        {mobile ? (
          <div style={ctStyles.fmtCards}>
            {formats.map((f) => <FormatCard key={f.code} f={f} />)}
          </div>
        ) : (
          <div style={ctStyles.fmtTable}>
            <div style={{ ...ctStyles.fmtRow, ...ctStyles.fmtHead }}>
              <span>Item</span><span>Format</span><span style={{ textAlign: "right" }}>Net lb/cs</span><span style={{ textAlign: "right" }}>Pcs/cs</span>
              <span style={{ textAlign: "right" }}>EXW $/lb</span><span style={{ textAlign: "right" }}>Delivered $/lb</span><span style={{ textAlign: "right" }}>Cs/pallet</span><span style={{ textAlign: "right" }}>Shelf</span>
            </div>
            {formats.map((f) => (
              <div key={f.code} style={ctStyles.fmtRow}>
                <span style={ctStyles.fmtCode}>{f.code}</span>
                <span style={ctStyles.fmtName}>{f.packing}</span>
                <span style={ctStyles.fmtNum}>{f.netLb}</span>
                <span style={ctStyles.fmtNum}>{f.piecesPerCase}</span>
                <span style={{ ...ctStyles.fmtNum, fontWeight: 700, color: "var(--mt-forest)" }}>{window.money(f.pickupLb)}</span>
                <span style={ctStyles.fmtNum}>{window.money(f.deliveryLb)}</span>
                <span style={ctStyles.fmtNum}>{f.casesPerPallet}</span>
                <span style={ctStyles.fmtNum}>{f.shelfDays}d</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={ctStyles.relWrap}>
        <h2 style={ctStyles.relTitle}>Pairs well with</h2>
        <div style={{ ...ctStyles.grid, gridTemplateColumns: relCols, ...(mobile ? { gap: 14 } : {}) }}>
          {related.map((r) => <ProductCard key={r.id} p={r} onNav={onNav} wholesale={wholesale} />)}
        </div>
      </div>
    </main>
  );
}

function Spec({ icon, label, value }) {
  return (
    <div style={ctStyles.spec}>
      <span style={ctStyles.specIcon}><Icon name={icon} size={17} /></span>
      <div><div style={ctStyles.specLabel}>{label}</div><div style={ctStyles.specValue}>{value}</div></div>
    </div>
  );
}

// Mobile replacement for the 8-column trade table (audit CRITICAL #4): one card per
// format showing code, packing and EXW $/lb, with the secondary columns behind a toggle.
function FmtKV({ k, v }) {
  return (
    <div style={ctStyles.fmtKV}><span style={ctStyles.fmtKVk}>{k}</span><span style={ctStyles.fmtKVv}>{v}</span></div>
  );
}
function FormatCard({ f }) {
  const [open, setOpen] = React.useState(false);
  window.useLucide();
  return (
    <div style={ctStyles.fmtCard}>
      <div style={ctStyles.fmtCardTop}>
        <div style={{ minWidth: 0 }}>
          <div style={ctStyles.fmtName}>{f.packing}</div>
          <div style={ctStyles.fmtCardCode}>Item {f.code}</div>
        </div>
        <div style={ctStyles.fmtCardPrice}>
          {window.money(f.pickupLb)}<span style={ctStyles.fmtCardUnit}>/lb EXW</span>
        </div>
      </div>
      <button style={ctStyles.fmtDetailsBtn} onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={15} /> {open ? "Hide details" : "Details"}
      </button>
      {open && (
        <div style={ctStyles.fmtDetailGrid}>
          <FmtKV k="Net lb/cs" v={f.netLb} />
          <FmtKV k="Pcs/cs" v={f.piecesPerCase} />
          <FmtKV k="Delivered $/lb" v={window.money(f.deliveryLb)} />
          <FmtKV k="Cs/pallet" v={f.casesPerPallet} />
          <FmtKV k="Shelf" v={f.shelfDays + "d"} />
        </div>
      )}
    </div>
  );
}

const ctStyles = {
  card: { background: "var(--mt-paper)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column" },
  thumb: { aspectRatio: "4 / 3", position: "relative", cursor: "pointer", display: "flex", alignItems: "flex-start", padding: 14, overflow: "hidden" },
  badge: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-forest)", background: "var(--mt-cream)", padding: "6px 11px", borderRadius: 999 },
  stockChip: { position: "absolute", top: 14, right: 14, fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 10px", borderRadius: 999 },
  stockOut: { background: "#7b1f24", color: "#fff" },
  stockPre: { background: "#d8a847", color: "#3a2c05" },
  quickAdd: { position: "absolute", left: 14, right: 14, bottom: 14, justifyContent: "center", transition: "opacity .2s ease, transform .2s ease" },
  cardBody: { padding: "16px 18px 20px" },
  range: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-italia-green)" },
  cardName: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 22, color: "var(--mt-forest)", margin: "5px 0 4px", cursor: "pointer", lineHeight: 1.15 },
  weight: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--mt-charcoal)" },
  tradeTag: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#fff", background: "var(--mt-italia-green)", padding: "3px 8px", borderRadius: 999 },
  plpHead: { maxWidth: 1280, margin: "0 auto", padding: "56px 28px 8px", textAlign: "center" },
  plpTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 52, color: "var(--mt-forest)", margin: "8px 0 0", letterSpacing: "-0.01em" },
  plpIntro: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 21, color: "var(--mt-charcoal)", margin: "14px auto 0", maxWidth: 580 },
  plpBody: { maxWidth: 1280, margin: "0 auto", padding: "32px 28px 88px" },
  filters: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 },
  chip: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", padding: "9px 18px", borderRadius: 999, border: "1.5px solid var(--mt-forest-12)", background: "transparent", color: "var(--mt-forest)", cursor: "pointer" },
  chipOn: { background: "var(--mt-forest)", color: "var(--mt-cream)", borderColor: "var(--mt-forest)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 },
  pdpWrap: { maxWidth: 1280, margin: "0 auto", padding: "28px 28px 88px" },
  back: { display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--mt-italia-green)", marginBottom: 20 },
  pdpGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" },
  pdpImage: { aspectRatio: "1 / 1", borderRadius: 24, position: "relative", padding: 22, boxShadow: "var(--shadow-card)" },
  pdpTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 46, color: "var(--mt-forest)", margin: "6px 0 0", lineHeight: 1.05 },
  pdpBlurb: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 21, lineHeight: 1.45, color: "var(--mt-forest)", margin: "0 0 26px" },
  specs: { display: "flex", gap: 28, padding: "20px 0", borderTop: "1px solid var(--mt-forest-12)", borderBottom: "1px solid var(--mt-forest-12)", marginBottom: 24 },
  spec: { display: "flex", gap: 11, alignItems: "center" },
  specIcon: { color: "var(--mt-italia-green)", display: "flex" },
  specLabel: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--mt-charcoal)" },
  specValue: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 16, color: "var(--mt-forest)" },
  buyRow: { display: "flex", gap: 14, alignItems: "stretch", marginBottom: 18 },
  qty: { display: "flex", alignItems: "center", border: "2px solid var(--mt-forest)", borderRadius: 999, padding: "0 6px" },
  qtyBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--mt-forest)", padding: 10, display: "flex" },
  qtyNum: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 17, color: "var(--mt-forest)", minWidth: 26, textAlign: "center" },
  assurance: { display: "flex", gap: 22, flexWrap: "wrap", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--mt-charcoal)" },
  relWrap: { marginTop: 72 },
  relTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 32, color: "var(--mt-forest)", marginBottom: 24 },
  availBanner: { display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13.5, padding: "11px 15px", borderRadius: 12, margin: "0 0 22px" },
  availBannerPre: { background: "#f6eccf", color: "#a8801f" },
  availBannerOut: { background: "#f3dcdd", color: "#7b1f24" },
  fmtWrap: { marginTop: 64 },
  fmtTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 30, color: "var(--mt-forest)", marginBottom: 18 },
  fmtTable: { background: "var(--mt-paper)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-card)" },
  fmtRow: { display: "grid", gridTemplateColumns: "0.7fr 2.2fr 0.9fr 0.7fr 0.9fr 1.1fr 0.9fr 0.7fr", gap: 10, padding: "13px 20px", borderBottom: "1px solid var(--mt-forest-12)", alignItems: "center" },
  fmtHead: { background: "var(--mt-forest)", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--mt-cream)" },
  fmtNum: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13.5, color: "var(--mt-forest)", textAlign: "right" },
  fmtCode: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 12.5, color: "var(--mt-charcoal)" },
  fmtName: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 15, color: "var(--mt-forest)" },

  // --- Mobile overrides (audit Phase 1/2) ---
  plpHeadMobile: { padding: "28px 18px 4px" },
  plpTitleMobile: { fontSize: 30 },
  plpIntroMobile: { fontSize: 16, marginTop: 10 },
  plpBodyMobile: { padding: "20px 16px 64px" },
  pdpWrapMobile: { padding: "18px 16px 64px" },
  pdpGridMobile: { gridTemplateColumns: "1fr", gap: 22 },
  pdpTitleMobile: { fontSize: 32 },
  pdpBlurbMobile: { fontSize: 17, margin: "0 0 20px" },
  specsMobile: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fmtTitleMobile: { fontSize: 24 },
  fmtCards: { display: "flex", flexDirection: "column", gap: 12 },
  fmtCard: { background: "var(--mt-paper)", borderRadius: 14, padding: "14px 16px", boxShadow: "var(--shadow-card)" },
  fmtCardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  fmtCardCode: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mt-charcoal)", marginTop: 2 },
  fmtCardPrice: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 20, color: "var(--mt-forest)", whiteSpace: "nowrap", flex: "none" },
  fmtCardUnit: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, color: "var(--mt-charcoal)", marginLeft: 3 },
  fmtDetailsBtn: { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--mt-italia-green)", padding: "10px 0 4px", minHeight: 40 },
  fmtDetailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", paddingTop: 10, marginTop: 6, borderTop: "1px solid var(--mt-forest-12)" },
  fmtKV: { display: "flex", justifyContent: "space-between", gap: 8 },
  fmtKVk: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12.5, color: "var(--mt-charcoal)" },
  fmtKVv: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 13, color: "var(--mt-forest)" },
};
// assurance spans get icon gap
ctStyles.assuranceSpan = {};

Object.assign(window, { ProductCard, CollectionPage, ProductPage, PriceTag });

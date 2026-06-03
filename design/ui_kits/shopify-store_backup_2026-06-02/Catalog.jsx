// Catalog — ProductCard, CollectionPage (PLP), ProductPage (PDP).
function PriceTag({ p, wholesale, big }) {
  const price = wholesale ? p.wholesale : p.price;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: big ? 30 : 18, color: "var(--mt-forest)" }}>{window.money(price)}</span>
      {wholesale && <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: big ? 15 : 12, color: "var(--mt-charcoal)", textDecoration: "line-through" }}>{window.money(p.price)}</span>}
      {wholesale && <span style={ctStyles.tradeTag}>Trade</span>}
    </div>
  );
}

function ProductCard({ p, onNav, wholesale }) {
  const cart = React.useContext(window.CartCtx);
  const [hover, setHover] = React.useState(false);
  return (
    <article style={ctStyles.card} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ ...ctStyles.thumb, background: p.grad }} onClick={() => onNav("product", p.id)}>
        <span style={ctStyles.badge}>{p.badge}</span>
        <button className="mt-btn mt-btn--solid" style={{ ...ctStyles.quickAdd, opacity: hover ? 1 : 0, transform: hover ? "translateY(0)" : "translateY(8px)" }}
          onClick={(e) => { e.stopPropagation(); cart.add(p.id); }}>
          Add to cart
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
  return (
    <main>
      <div style={ctStyles.plpHead}>
        <Eyebrow>Shop · 50+ cheeses, 300 references</Eyebrow>
        <h1 style={ctStyles.plpTitle}>The cheeses of the mountain.</h1>
        <p style={ctStyles.plpIntro}>Milk processing, cheese making, aging and packaging — all in our own plants in Grigno.</p>
      </div>
      <div style={ctStyles.plpBody}>
        <div style={ctStyles.filters}>
          {ranges.map((r) => (
            <button key={r} onClick={() => setFilter(r)}
              style={{ ...ctStyles.chip, ...(filter === r ? ctStyles.chipOn : {}) }}>{r}</button>
          ))}
        </div>
        <div style={ctStyles.grid}>
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
  window.useLucide();
  return (
    <main style={ctStyles.pdpWrap}>
      <button style={ctStyles.back} onClick={() => onNav("collection")}><Icon name="arrow-left" size={16} /> Back to shop</button>
      <div style={ctStyles.pdpGrid}>
        <div style={{ ...ctStyles.pdpImage, background: p.grad }}>
          <span style={ctStyles.badge}>{p.badge}</span>
        </div>
        <div>
          <div style={ctStyles.range}>{p.range}</div>
          <h1 style={ctStyles.pdpTitle}>{p.name}</h1>
          <div style={{ margin: "14px 0 18px" }}><PriceTag p={p} wholesale={wholesale} big /></div>
          <p style={ctStyles.pdpBlurb}>{p.blurb}</p>
          <div style={ctStyles.specs}>
            <Spec icon="mountain" label="Origin" value={p.milk} />
            <Spec icon="clock" label="Ageing" value={p.age} />
            <Spec icon="package" label="Format" value={p.weight} />
          </div>
          <div style={ctStyles.buyRow}>
            <div style={ctStyles.qty}>
              <button style={ctStyles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}><Icon name="minus" size={16} /></button>
              <span style={ctStyles.qtyNum}>{qty}</span>
              <button style={ctStyles.qtyBtn} onClick={() => setQty((q) => q + 1)}><Icon name="plus" size={16} /></button>
            </div>
            <button className="mt-btn mt-btn--solid mt-btn--lg" style={{ flex: 1, justifyContent: "center" }} onClick={() => cart.add(p.id, qty)}>
              Add to cart · {window.money((wholesale ? p.wholesale : p.price) * qty)}
            </button>
          </div>
          <div style={ctStyles.assurance} className="row-icons">
            <span><Icon name="truck" size={15} /> Ships chilled in 48h</span>
            <span><Icon name="award" size={15} /> PDO certified</span>
            <span><Icon name="leaf" size={15} /> Mountain milk</span>
          </div>
        </div>
      </div>
      <div style={ctStyles.relWrap}>
        <h2 style={ctStyles.relTitle}>Pairs well with</h2>
        <div style={ctStyles.grid}>
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

const ctStyles = {
  card: { background: "var(--mt-paper)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column" },
  thumb: { aspectRatio: "4 / 3", position: "relative", cursor: "pointer", display: "flex", alignItems: "flex-start", padding: 14, overflow: "hidden" },
  badge: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-forest)", background: "var(--mt-cream)", padding: "6px 11px", borderRadius: 999 },
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
};
// assurance spans get icon gap
ctStyles.assuranceSpan = {};

Object.assign(window, { ProductCard, CollectionPage, ProductPage, PriceTag });

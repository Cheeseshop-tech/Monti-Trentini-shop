// Wholesale — B2B login + account dashboard (trade pricing, reorder, price list).
function WholesalePage({ wholesale, onLogin, onNav }) {
  const { products } = window.STORE_DATA;
  const cart = React.useContext(window.CartCtx);
  window.useLucide();

  if (!wholesale) {
    const benefits = [
      ["percent", "Trade pricing", "Up to 30% off retail across the full PDO range."],
      ["truck", "48h chilled delivery", "Reliable cold chain across the EU, min. order €250."],
      ["tag", "Private label", "Custom production & packaging under your own brand."],
      ["file-text", "One invoice, net 30", "Consolidated ordering for restaurants & retail."],
    ];
    return (
      <main style={whStyles.loginWrap}>
        <div style={whStyles.loginCopy}>
          <Eyebrow>Wholesale · Food service · Private label</Eyebrow>
          <h1 style={whStyles.h1}>Stock the mountain.</h1>
          <p style={whStyles.intro}>Trade access to 50+ cheeses and 300 references — made, aged and packed in our own plants in Grigno. For restaurants, retailers and distributors.</p>
          <div style={whStyles.benefits}>
            {benefits.map(([ic, t, d]) => (
              <div key={t} style={whStyles.benefit}>
                <span style={whStyles.benefitIcon}><Icon name={ic} size={20} /></span>
                <div><div style={whStyles.benefitT}>{t}</div><div style={whStyles.benefitD}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={whStyles.loginCard}>
          <h2 style={whStyles.loginTitle}>Trade login</h2>
          <p style={whStyles.loginSub}>Access your account and trade pricing.</p>
          <label style={whStyles.label}>Business email</label>
          <input style={whStyles.input} placeholder="orders@yourrestaurant.it" />
          <label style={whStyles.label}>Password</label>
          <input style={whStyles.input} type="password" placeholder="••••••••" />
          <button className="mt-btn mt-btn--solid mt-btn--lg" style={{ width: "100%", justifyContent: "center", marginTop: 18 }} onClick={onLogin}>
            <Icon name="briefcase" size={16} /> Sign in to wholesale
          </button>
          <div style={whStyles.divider}><span>New customer?</span></div>
          <button className="mt-btn" style={{ width: "100%", justifyContent: "center" }} onClick={onLogin}>Apply for a trade account</button>
        </div>
      </main>
    );
  }

  // Logged-in account
  const reorder = products.slice(0, 4);
  return (
    <main style={whStyles.acctWrap}>
      <div style={whStyles.acctHead}>
        <div>
          <Eyebrow>Wholesale account</Eyebrow>
          <h1 style={whStyles.acctTitle}>Buongiorno, Ristorante Dolomiti.</h1>
          <p style={whStyles.acctSub}>Trade pricing active · Net 30 · Account #MT-4471</p>
        </div>
        <div style={whStyles.acctStats}>
          <div style={whStyles.acctStat}><div style={whStyles.statN}>30%</div><div style={whStyles.statL}>avg. trade saving</div></div>
          <div style={whStyles.acctStat}><div style={whStyles.statN}>€250</div><div style={whStyles.statL}>min. order</div></div>
        </div>
      </div>

      <h2 style={whStyles.secTitle}>Quick reorder</h2>
      <div style={whStyles.reorderGrid}>
        {reorder.map((p) => (
          <div key={p.id} style={whStyles.reorderCard}>
            <div style={{ ...whStyles.reorderThumb, background: p.grad }} />
            <div style={{ flex: 1 }}>
              <div style={whStyles.reorderName}>{p.name}</div>
              <div style={whStyles.reorderPrice}>{window.money(p.wholesale)} <span style={whStyles.reorderUnit}>/ {p.weight}</span></div>
            </div>
            <button className="mt-btn mt-btn--solid" style={{ flex: "none" }} onClick={() => cart.add(p.id, 6)}>+6</button>
          </div>
        ))}
      </div>

      <div style={whStyles.priceListHead}>
        <h2 style={whStyles.secTitle}>Trade price list</h2>
        <button className="mt-btn" onClick={() => onNav("collection")}>Browse full catalogue</button>
      </div>
      <div style={whStyles.table}>
        <div style={{ ...whStyles.trow, ...whStyles.thead }}>
          <span>Product</span><span>Format</span><span style={{ textAlign: "right" }}>Retail</span><span style={{ textAlign: "right" }}>Trade</span><span></span>
        </div>
        {products.map((p) => (
          <div key={p.id} style={whStyles.trow}>
            <span style={whStyles.tName}>{p.name}</span>
            <span style={whStyles.tCell}>{p.weight}</span>
            <span style={{ ...whStyles.tCell, textAlign: "right", textDecoration: "line-through", opacity: 0.6 }}>{window.money(p.price)}</span>
            <span style={{ ...whStyles.tCell, textAlign: "right", fontWeight: 700, color: "var(--mt-italia-green)" }}>{window.money(p.wholesale)}</span>
            <span style={{ textAlign: "right" }}><button style={whStyles.addMini} onClick={() => cart.add(p.id, 6)}>Add ×6</button></span>
          </div>
        ))}
      </div>
    </main>
  );
}

const whStyles = {
  loginWrap: { maxWidth: 1280, margin: "0 auto", padding: "64px 28px 96px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 64, alignItems: "center" },
  loginCopy: {},
  h1: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 60, color: "var(--mt-forest)", margin: "8px 0 0", letterSpacing: "-0.01em" },
  intro: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, lineHeight: 1.45, color: "var(--mt-charcoal)", margin: "16px 0 32px", maxWidth: 520 },
  benefits: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 },
  benefit: { display: "flex", gap: 13, alignItems: "flex-start" },
  benefitIcon: { flex: "none", width: 42, height: 42, borderRadius: 12, background: "var(--mt-mint)", color: "var(--mt-forest)", display: "flex", alignItems: "center", justifyContent: "center" },
  benefitT: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 19, color: "var(--mt-forest)" },
  benefitD: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13.5, lineHeight: 1.4, color: "var(--mt-charcoal)", marginTop: 3 },
  loginCard: { background: "var(--mt-paper)", borderRadius: 24, padding: "36px 36px 40px", boxShadow: "var(--shadow-card)" },
  loginTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 30, color: "var(--mt-forest)" },
  loginSub: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--mt-charcoal)", margin: "6px 0 24px" },
  label: { display: "block", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mt-forest)", margin: "16px 0 7px" },
  input: { width: "100%", boxSizing: "border-box", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 15, padding: "13px 16px", borderRadius: 12, border: "1px solid var(--mt-forest-12)", background: "var(--mt-cream)", color: "var(--mt-forest)", outline: "none" },
  divider: { textAlign: "center", margin: "22px 0 16px", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-charcoal)" },
  acctWrap: { maxWidth: 1180, margin: "0 auto", padding: "48px 28px 96px" },
  acctHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, paddingBottom: 32, borderBottom: "1px solid var(--mt-forest-12)", marginBottom: 40 },
  acctTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 42, lineHeight: 1.05, color: "var(--mt-forest)", margin: "8px 0 0" },
  acctSub: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--mt-charcoal)", marginTop: 14 },
  acctStats: { display: "flex", gap: 18 },
  acctStat: { background: "var(--mt-mint)", borderRadius: 16, padding: "16px 22px", textAlign: "center" },
  statN: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 30, color: "var(--mt-forest)" },
  statL: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 11.5, color: "var(--mt-forest)", marginTop: 2 },
  secTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 30, color: "var(--mt-forest)", margin: "0 0 20px" },
  reorderGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 48 },
  reorderCard: { display: "flex", alignItems: "center", gap: 14, background: "var(--mt-paper)", borderRadius: 16, padding: 14, boxShadow: "var(--shadow-soft)" },
  reorderThumb: { width: 58, height: 58, borderRadius: 12, flex: "none" },
  reorderName: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 19, color: "var(--mt-forest)" },
  reorderPrice: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 15, color: "var(--mt-italia-green)", marginTop: 2 },
  reorderUnit: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, color: "var(--mt-charcoal)" },
  priceListHead: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  table: { background: "var(--mt-paper)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-card)", marginTop: 18 },
  trow: { display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr", gap: 12, padding: "16px 24px", borderBottom: "1px solid var(--mt-forest-12)", alignItems: "center" },
  thead: { background: "var(--mt-forest)", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mt-cream)" },
  tName: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 18, color: "var(--mt-forest)" },
  tCell: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--mt-forest)" },
  addMini: { background: "var(--mt-forest)", color: "var(--mt-cream)", border: "none", borderRadius: 999, padding: "8px 14px", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" },
};

window.WholesalePage = WholesalePage;

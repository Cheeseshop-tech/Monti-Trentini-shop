// Cart — slide-out drawer + full cart page.
function lineItems(cart, products, wholesale) {
  return cart.items.map((it) => {
    const p = products.find((x) => x.id === it.id);
    const unit = wholesale ? p.wholesale : p.price;     // $/lb (EXW)
    const caseLb = p.caseLb || 1;                         // net lb per case
    // Trade math: cases × case weight × $/lb. (qty represents cases.)
    return { ...p, qty: it.qty, unit, caseLb, line: unit * caseLb * it.qty };
  });
}

function CartDrawer({ onNav, wholesale }) {
  const cart = React.useContext(window.CartCtx);
  const { products } = window.STORE_DATA;
  window.useLucide();
  const lines = lineItems(cart, products, wholesale);
  const subtotal = lines.reduce((s, l) => s + l.line, 0);
  const threshold = wholesale ? 250 : 60;
  const toFree = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);

  return (
    <React.Fragment>
      <div className={"cart-scrim" + (cart.open ? " is-open" : "")} style={cStyles.scrim} onClick={() => cart.setOpen(false)} />
      <aside className={"cart-drawer" + (cart.open ? " is-open" : "")} style={cStyles.drawer}>
        <div style={cStyles.drawerHead}>
          <span style={cStyles.drawerTitle}>Your cart {cart.count > 0 && `(${cart.count})`}</span>
          <button style={cStyles.close} onClick={() => cart.setOpen(false)}><Icon name="x" size={20} /></button>
        </div>

        {lines.length === 0 ? (
          <div style={cStyles.empty}>
            <Icon name="shopping-bag" size={40} style={{ color: "var(--mt-sage)" }} />
            <p style={cStyles.emptyText}>Your cart is empty.</p>
            <button className="mt-btn mt-btn--solid" onClick={() => { cart.setOpen(false); onNav("collection"); }}>Discover our cheeses</button>
          </div>
        ) : (
          <React.Fragment>
            <div style={cStyles.freeBar}>
              <div style={cStyles.freeText}>
                {toFree > 0 ? <span>{window.money(toFree)} away from free shipping</span> : <span><Icon name="check" size={14} /> Free shipping unlocked</span>}
              </div>
              <div style={cStyles.track}><div style={{ ...cStyles.fill, width: pct + "%" }} /></div>
            </div>
            <div style={cStyles.lines}>
              {lines.map((l) => <CartLine key={l.id} l={l} cart={cart} wholesale={wholesale} />)}
            </div>
            <div style={cStyles.foot}>
              <div style={cStyles.subRow}><span>Subtotal</span><span style={cStyles.subVal}>{window.money(subtotal)}</span></div>
              <p style={cStyles.taxNote}>Shipping & taxes calculated at checkout.</p>
              <button className="mt-btn mt-btn--solid mt-btn--lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => { cart.setOpen(false); onNav("cart"); }}>Checkout · {window.money(subtotal)}</button>
              <button style={cStyles.continueBtn} onClick={() => { cart.setOpen(false); onNav("collection"); }}>Continue shopping</button>
            </div>
          </React.Fragment>
        )}
      </aside>
    </React.Fragment>
  );
}

function CartLine({ l, cart, wholesale }) {
  return (
    <div style={cStyles.line}>
      <div style={{ ...cStyles.lineThumb, background: l.grad, position: "relative", overflow: "hidden" }}>
        {l.image && <img alt={l.name} {...window.productImgProps(l.image, { w: 160 })} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={cStyles.lineRange}>{l.range}</div>
        <div style={cStyles.lineName}>{l.name}</div>
        <div style={cStyles.lineWeight}>{l.weight}</div>
        <div style={cStyles.lineCtrl}>
          <div style={cStyles.qtyMini}>
            <button style={cStyles.qtyMiniBtn} onClick={() => cart.setQty(l.id, l.qty - 1)}><Icon name="minus" size={13} /></button>
            <span style={cStyles.qtyMiniNum}>{l.qty}</span>
            <button style={cStyles.qtyMiniBtn} onClick={() => cart.setQty(l.id, l.qty + 1)}><Icon name="plus" size={13} /></button>
          </div>
          <button style={cStyles.removeBtn} onClick={() => cart.remove(l.id)}>Remove</button>
        </div>
      </div>
      <div style={cStyles.linePrice}>{window.money(l.line)}</div>
    </div>
  );
}

function CartPage({ onNav, wholesale }) {
  const cart = React.useContext(window.CartCtx);
  const { products } = window.STORE_DATA;
  window.useLucide();
  const lines = lineItems(cart, products, wholesale);
  const subtotal = lines.reduce((s, l) => s + l.line, 0);
  const shipping = subtotal === 0 ? 0 : (subtotal >= (wholesale ? 250 : 60) ? 0 : 6.9);
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <main style={cStyles.pageEmpty}>
        <Icon name="shopping-bag" size={48} style={{ color: "var(--mt-sage)" }} />
        <h1 style={cStyles.pageTitle}>Your cart is empty.</h1>
        <button className="mt-btn mt-btn--solid mt-btn--lg" onClick={() => onNav("collection")}>Discover our cheeses</button>
      </main>
    );
  }
  return (
    <main style={cStyles.page}>
      <h1 style={cStyles.pageTitle}>Your cart</h1>
      <div style={cStyles.pageGrid}>
        <div style={cStyles.pageLines}>
          {lines.map((l) => (
            <div key={l.id} style={cStyles.pageLine}>
              <div style={{ ...cStyles.pageThumb, background: l.grad, position: "relative", overflow: "hidden" }}>
                {l.image && <img alt={l.name} {...window.productImgProps(l.image, { w: 240 })} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={cStyles.lineRange}>{l.range}</div>
                <div style={cStyles.pageName}>{l.name}</div>
                <div style={cStyles.lineWeight}>{l.caseLb} lb/case · {window.money(l.unit)}/lb · {l.qty} {l.qty === 1 ? "case" : "cases"}</div>
                <div style={cStyles.lineCtrl}>
                  <div style={cStyles.qtyMini}>
                    <button style={cStyles.qtyMiniBtn} onClick={() => cart.setQty(l.id, l.qty - 1)}><Icon name="minus" size={13} /></button>
                    <span style={cStyles.qtyMiniNum}>{l.qty}</span>
                    <button style={cStyles.qtyMiniBtn} onClick={() => cart.setQty(l.id, l.qty + 1)}><Icon name="plus" size={13} /></button>
                  </div>
                  <button style={cStyles.removeBtn} onClick={() => cart.remove(l.id)}>Remove</button>
                </div>
              </div>
              <div style={cStyles.pagePrice}>{window.money(l.line)}</div>
            </div>
          ))}
        </div>
        <aside style={cStyles.summary}>
          <h2 style={cStyles.sumTitle}>Order summary</h2>
          <div style={cStyles.sumRow}><span>Subtotal</span><span>{window.money(subtotal)}</span></div>
          <div style={cStyles.sumRow}><span>Shipping</span><span>{shipping === 0 ? "Free" : window.money(shipping)}</span></div>
          {wholesale && <div style={cStyles.sumRow}><span>Pricing</span><span style={{ color: "var(--mt-italia-green)", fontWeight: 700 }}>Trade</span></div>}
          <div style={cStyles.sumRule} />
          <div style={cStyles.sumTotal}><span>Total</span><span>{window.money(total)}</span></div>
          <button className="mt-btn mt-btn--solid mt-btn--lg" style={{ width: "100%", justifyContent: "center", marginTop: 18 }}>
            <Icon name="lock" size={16} /> Checkout securely
          </button>
          <div style={cStyles.payNote}>Powered by Shopify · Visa · Mastercard · PayPal</div>
        </aside>
      </div>
    </main>
  );
}

const cStyles = {
  scrim: { position: "fixed", inset: 0, background: "rgba(20,20,19,0.4)", zIndex: 50 },
  drawer: { position: "fixed", top: 0, right: 0, bottom: 0, width: "min(440px, 92vw)", background: "var(--mt-cream)", zIndex: 51, boxShadow: "-20px 0 60px rgba(6,78,34,0.18)", display: "flex", flexDirection: "column" },
  drawerHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--mt-forest-12)" },
  drawerTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 23, color: "var(--mt-forest)", whiteSpace: "nowrap" },
  close: { background: "none", border: "none", cursor: "pointer", color: "var(--mt-forest)", padding: 4, display: "flex" },
  empty: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 30 },
  emptyText: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, color: "var(--mt-charcoal)" },
  freeBar: { padding: "14px 24px", background: "var(--mt-mint)" },
  freeText: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--mt-forest)", marginBottom: 9, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
  track: { height: 6, background: "rgba(6,78,34,0.15)", borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%", background: "var(--mt-italia-green)", borderRadius: 999, transition: "width .3s ease" },
  lines: { flex: 1, overflowY: "auto", padding: "8px 24px" },
  line: { display: "flex", gap: 14, padding: "18px 0", borderBottom: "1px solid var(--mt-forest-12)" },
  lineThumb: { width: 70, height: 70, borderRadius: 12, flex: "none" },
  lineRange: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--mt-italia-green)" },
  lineName: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 18, color: "var(--mt-forest)", lineHeight: 1.15, margin: "2px 0" },
  lineWeight: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, color: "var(--mt-charcoal)" },
  lineCtrl: { display: "flex", alignItems: "center", gap: 14, marginTop: 10 },
  qtyMini: { display: "flex", alignItems: "center", border: "1.5px solid var(--mt-forest-12)", borderRadius: 999, padding: "0 4px" },
  qtyMiniBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--mt-forest)", padding: 7, display: "flex" },
  qtyMiniNum: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 14, color: "var(--mt-forest)", minWidth: 20, textAlign: "center" },
  removeBtn: { background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, color: "var(--mt-charcoal)", textDecoration: "underline" },
  linePrice: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 16, color: "var(--mt-forest)", flex: "none" },
  foot: { padding: "20px 24px", borderTop: "1px solid var(--mt-forest-12)", background: "var(--mt-paper)" },
  subRow: { display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 15, color: "var(--mt-forest)", textTransform: "uppercase", letterSpacing: "0.03em" },
  subVal: { fontFamily: "var(--font-ui-bold)" },
  taxNote: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, color: "var(--mt-charcoal)", margin: "6px 0 16px" },
  continueBtn: { width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--mt-forest)", marginTop: 12, padding: 6 },
  page: { maxWidth: 1120, margin: "0 auto", padding: "48px 28px 88px" },
  pageEmpty: { maxWidth: 1120, margin: "0 auto", padding: "100px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" },
  pageTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 44, color: "var(--mt-forest)", marginBottom: 28 },
  pageGrid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 40, alignItems: "start" },
  pageLines: { display: "flex", flexDirection: "column" },
  pageLine: { display: "flex", gap: 20, padding: "22px 0", borderBottom: "1px solid var(--mt-forest-12)", alignItems: "center" },
  pageThumb: { width: 96, height: 96, borderRadius: 14, flex: "none" },
  pageName: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 22, color: "var(--mt-forest)", margin: "2px 0 3px" },
  pagePrice: { fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 19, color: "var(--mt-forest)" },
  summary: { background: "var(--mt-paper)", borderRadius: 20, padding: "28px 28px 30px", boxShadow: "var(--shadow-card)", position: "sticky", top: 120 },
  sumTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 24, color: "var(--mt-forest)", marginBottom: 18 },
  sumRow: { display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 15, color: "var(--mt-forest)", padding: "7px 0" },
  sumRule: { height: 1, background: "var(--mt-forest-12)", margin: "12px 0" },
  sumTotal: { display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 20, color: "var(--mt-forest)" },
  payNote: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 11.5, color: "var(--mt-charcoal)", textAlign: "center", marginTop: 14 },
};

Object.assign(window, { CartDrawer, CartPage });

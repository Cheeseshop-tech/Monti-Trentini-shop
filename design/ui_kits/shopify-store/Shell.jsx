// Store shell — announcement bar, header (nav, search, account, cart), footer.
function StoreHeader({ view, onNav, wholesale }) {
  const cart = React.useContext(window.CartCtx);
  const mobile = window.useIsMobile(1024);   // collapse nav below 1024px (audit CRITICAL #1)
  const [menuOpen, setMenuOpen] = React.useState(false);
  window.useLucide();
  const links = [
    { id: "collection", label: "Shop" },
    { id: "recipes", label: "Recipes" },
    { id: "blog", label: "Journal" },
    { id: "wholesale", label: "Wholesale" },
  ];
  const goto = (id) => { setMenuOpen(false); onNav(id); };
  return (
    <div style={shStyles.stickyWrap}>
      <div style={shStyles.announce}>
        <span style={{ ...shStyles.announceText, ...(mobile ? shStyles.announceTextMobile : {}) }}>
          {wholesale ? "Trade pricing active \u2014 EXW Elizabeth NJ \u00B7 delivered min 150 lb" : (window.STORE_ANNOUNCE || "Product of the Mountains \u00B7 Italian Alpine Cheese \u00B7 since 1925")}
        </span>
      </div>
      <header className="mt-argyle" style={shStyles.header}>
        <div style={{ ...shStyles.inner, ...(mobile ? shStyles.innerMobile : {}) }}>
          <a style={shStyles.brand} onClick={() => onNav("home")}>
            <img src="../../assets/logo/MontiTrentini_Logo.png" alt="Monti Trentini" style={shStyles.logo} />
          </a>
          {!mobile && (
            <nav style={shStyles.nav}>
              {links.map((l) => (
                <a key={l.id} onClick={() => onNav(l.id)}
                   style={{ ...shStyles.link, color: view === l.id ? "var(--mt-forest)" : "var(--mt-italia-green)" }}>
                  {l.label}
                </a>
              ))}
            </nav>
          )}
          <div style={shStyles.actions}>
            {!mobile && (
              <button style={shStyles.iconBtn} title="Search" onClick={() => onNav("collection")}><Icon name="search" /></button>
            )}
            {!mobile && (
              <button style={shStyles.iconBtn} title={wholesale ? "Wholesale account" : "Account"} onClick={() => onNav("wholesale")}>
                <Icon name={wholesale ? "briefcase" : "user"} />
              </button>
            )}
            <button style={shStyles.cartBtn} title="Cart" onClick={() => cart.setOpen(true)}>
              <Icon name="shopping-bag" />
              {cart.count > 0 && <span style={shStyles.badge}>{cart.count}</span>}
            </button>
            {mobile && (
              <button style={shStyles.iconBtn} title="Menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                <Icon name="menu" />
              </button>
            )}
          </div>
        </div>
      </header>

      {mobile && menuOpen && (
        <div style={shStyles.menuScrim} onClick={() => setMenuOpen(false)}>
          <div style={shStyles.menuPanel} onClick={(e) => e.stopPropagation()}>
            <div style={shStyles.menuHead}>
              <span style={shStyles.menuTitle}>Menu</span>
              <button style={shStyles.iconBtn} aria-label="Close menu" onClick={() => setMenuOpen(false)}><Icon name="x" /></button>
            </div>
            {links.map((l) => (
              <a key={l.id} style={{ ...shStyles.menuLink, color: view === l.id ? "var(--mt-forest)" : "var(--mt-italia-green)" }}
                 onClick={() => goto(l.id)}>{l.label}</a>
            ))}
            <a style={shStyles.menuLink} onClick={() => goto("collection")}>Search</a>
            <a style={shStyles.menuLink} onClick={() => goto("wholesale")}>{wholesale ? "Wholesale account" : "Account"}</a>
          </div>
        </div>
      )}
    </div>
  );
}

function StoreFooter({ onNav, onToggleWholesale, wholesale }) {
  const mobile = window.useIsMobile();
  window.useLucide();
  return (
    <footer style={shStyles.footer}>
      <div style={{ ...shStyles.footInner, ...(mobile ? shStyles.footInnerMobile : {}) }}>
        <div style={{ maxWidth: 360 }}>
          <img src="../../assets/logo/logoquadrato.png" alt="Monti Trentini" style={{ height: 64, marginBottom: 16 }} />
          <div style={shStyles.mantra}>Happiness has plenty of shapes — Monti Trentini brings them on your table.</div>
          <div style={{ ...shStyles.signup, ...(mobile ? shStyles.signupMobile : {}) }}>
            <input style={shStyles.signupInput} placeholder="Email for recipes & news" />
            <button className="mt-btn mt-btn--accent" style={{ flex: "none" }}>Join</button>
          </div>
        </div>
        <div style={{ ...shStyles.footCols, ...(mobile ? shStyles.footColsMobile : {}) }}>
          <FootCol head="Shop" items={[["Asiago PDO","collection"],["Grana Padano","collection"],["Provolone","collection"],["Gift boxes","collection"]]} onNav={onNav} />
          <FootCol head="Explore" items={[["Recipes","recipes"],["Journal","blog"],["Sustainability","blog"],["Our story","blog"]]} onNav={onNav} />
          <FootCol head="Trade" items={[["Wholesale login","wholesale"],["Private label","wholesale"],["Food service","wholesale"],["Contact","wholesale"]]} onNav={onNav} />
        </div>
      </div>
      <div style={{ ...shStyles.footBar, ...(mobile ? shStyles.footBarMobile : {}) }}>
        <span style={shStyles.payoff}>Casa Finco — casari dal 1925 · Grigno, Trentino, Italy</span>
        <button onClick={onToggleWholesale} style={shStyles.modeToggle}>
          <Icon name="repeat" size={14} /> {wholesale ? "Switch to retail" : "Shop as wholesale"}
        </button>
      </div>
    </footer>
  );
}

function FootCol({ head, items, onNav }) {
  return (
    <div style={shStyles.footCol}>
      <div style={shStyles.footHead}>{head}</div>
      {items.map(([label, v]) => <a key={label} style={shStyles.footLink} onClick={() => onNav(v)}>{label}</a>)}
    </div>
  );
}

const shStyles = {
  stickyWrap: { position: "sticky", top: 0, zIndex: 40 },
  announce: { background: "var(--mt-forest)", textAlign: "center", padding: "8px 16px" },
  announceText: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-cream)" },
  header: { borderBottom: "1px solid var(--mt-forest-12)" },
  inner: { maxWidth: 1280, margin: "0 auto", padding: "12px 28px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 20 },
  innerMobile: { gridTemplateColumns: "auto 1fr", padding: "8px 16px", gap: 12 },
  announceTextMobile: { fontSize: 10.5, letterSpacing: "0.05em" },
  menuScrim: { position: "fixed", inset: 0, background: "rgba(20,20,19,0.45)", zIndex: 60, display: "flex", justifyContent: "flex-end" },
  menuPanel: { width: "min(320px, 86vw)", height: "100%", background: "var(--mt-cream)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 2, boxShadow: "-20px 0 60px rgba(6,78,34,0.18)" },
  menuHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  menuTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 22, color: "var(--mt-forest)" },
  menuLink: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--mt-italia-green)", padding: "13px 6px", borderBottom: "1px solid var(--mt-forest-12)", cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" },
  brand: { display: "flex", alignItems: "center", cursor: "pointer", justifySelf: "start" },
  logo: { height: 46, width: "auto", display: "block" },
  nav: { display: "flex", gap: 28, justifySelf: "center" },
  link: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", transition: "color .2s" },
  actions: { display: "flex", gap: 6, alignItems: "center", justifySelf: "end" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--mt-forest)", padding: 9, borderRadius: 999, display: "flex", fontSize: 21 },
  cartBtn: { position: "relative", background: "none", border: "none", cursor: "pointer", color: "var(--mt-forest)", padding: 9, borderRadius: 999, display: "flex", fontSize: 21 },
  badge: { position: "absolute", top: 2, right: 2, background: "var(--mt-italia-red)", color: "#fff", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, minWidth: 17, height: 17, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" },
  footer: { background: "var(--mt-forest)", color: "var(--mt-cream)", marginTop: 0 },
  footInner: { maxWidth: 1280, margin: "0 auto", padding: "64px 28px 36px", display: "flex", justifyContent: "space-between", gap: 56, flexWrap: "wrap" },
  mantra: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 24, lineHeight: 1.3, color: "var(--mt-cream)" },
  signup: { display: "flex", gap: 10, marginTop: 22 },
  signupInput: { flex: 1, fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, padding: "12px 16px", borderRadius: 999, border: "1px solid rgba(255,251,220,0.3)", background: "rgba(255,251,220,0.08)", color: "var(--mt-cream)", outline: "none" },
  footCols: { display: "flex", gap: 56, flexWrap: "wrap" },
  footInnerMobile: { flexDirection: "column", gap: 36, padding: "44px 20px 28px" },
  signupMobile: { flexDirection: "column", gap: 12 },
  footColsMobile: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 },
  footBarMobile: { flexDirection: "column", alignItems: "flex-start", gap: 14, padding: "18px 20px" },
  footCol: { display: "flex", flexDirection: "column", gap: 11 },
  footHead: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mt-sage)", marginBottom: 3 },
  footLink: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--mt-cream)", opacity: 0.85, textDecoration: "none", cursor: "pointer" },
  footBar: { borderTop: "1px solid rgba(255,251,220,0.18)", maxWidth: 1280, margin: "0 auto", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  payoff: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 16, color: "var(--mt-cream)" },
  modeToggle: { display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,251,220,0.1)", border: "1px solid rgba(255,251,220,0.28)", color: "var(--mt-cream)", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", padding: "9px 16px", borderRadius: 999, cursor: "pointer" },
};

Object.assign(window, { StoreHeader, StoreFooter });

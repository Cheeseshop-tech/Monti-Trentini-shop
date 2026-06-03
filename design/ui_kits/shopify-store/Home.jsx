// Home — storefront homepage assembling hero, featured shop, values, recipes, social, journal.
function StoreHome({ onNav, wholesale, showSocial }) {
  const { products, recipes, posts, HERO } = window.STORE_DATA;
  const featured = products.filter((p) => p.featured).slice(0, 4);
  window.useLucide();
  return (
    <main>
      {/* Hero */}
      <section style={hmStyles.hero}>
        <div style={hmStyles.heroPhoto} />
        <div style={hmStyles.heroScrim} />
        <div style={hmStyles.heroInner}>
          <Eyebrow color="var(--mt-mint)" style={{ letterSpacing: "0.16em" }}>Product of the Mountains · since 1925</Eyebrow>
          <h1 style={hmStyles.heroH1}>High level of happiness.</h1>
          <p style={hmStyles.heroSub}>Italian Alpine cheese, made at altitude in the Trentino mountains. Milk from the neighbourhood, delivered to your door.</p>
          <div style={hmStyles.heroCta}>
            <button className="mt-btn mt-btn--solid mt-btn--lg" onClick={() => onNav("collection")}>Shop the cheeses</button>
            <button className="mt-btn mt-btn--lg" style={{ borderColor: "var(--mt-cream)", color: "var(--mt-cream)" }} onClick={() => onNav("wholesale")}>Wholesale & trade</button>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section style={hmStyles.values}>
        {[["mountain", "Made above 600 m", "The regulated \u201CProduct of the Mountains\u201D label — milk collected and processed in the Alps."],
          ["heart-handshake", "Four generations", "A family of casari since 1925. People are the heart and mind of the dairy."],
          ["sprout", "Short supply chain", "Milk only from our neighbourhood, within 90 km of Grigno."]].map(([ic, t, d]) => (
          <div key={t} style={hmStyles.value}>
            <span style={hmStyles.valueIcon}><Icon name={ic} size={24} /></span>
            <div style={hmStyles.valueT}>{t}</div>
            <div style={hmStyles.valueD}>{d}</div>
          </div>
        ))}
      </section>

      {/* Featured collection */}
      <section style={hmStyles.section}>
        <div style={hmStyles.secHead}>
          <div>
            <Eyebrow>The shop</Eyebrow>
            <h2 style={hmStyles.secTitle}>Our most-loved wheels.</h2>
          </div>
          <button className="mt-btn" onClick={() => onNav("collection")}>View all cheeses</button>
        </div>
        <div style={hmStyles.prodGrid}>
          {featured.map((p) => <ProductCard key={p.id} p={p} onNav={onNav} wholesale={wholesale} />)}
        </div>
      </section>

      {/* Editorial split — heritage */}
      <section style={hmStyles.split}>
        <div style={{ ...hmStyles.splitPhoto, backgroundImage: `url('${HERO}')` }} />
        <div style={hmStyles.splitBody}>
          <Eyebrow color="var(--mt-sage)">A hundred-year long story</Eyebrow>
          <h2 style={hmStyles.splitH2}>We do everything at home.</h2>
          <p style={hmStyles.splitText}>Milk processing, cheese making, aging and packaging — all in our own plants. Every wheel traceable, every collaboration long-running.</p>
          <button className="mt-btn mt-btn--lg" style={{ borderColor: "var(--mt-cream)", color: "var(--mt-cream)" }} onClick={() => onNav("blog")}>Read our story</button>
        </div>
      </section>

      {/* Recipes teaser */}
      <section style={hmStyles.section}>
        <div style={hmStyles.secHead}>
          <div><Eyebrow>Recipes</Eyebrow><h2 style={hmStyles.secTitle}>Bring it to the table.</h2></div>
          <button className="mt-btn" onClick={() => onNav("recipes")}>All recipes</button>
        </div>
        <div style={hmStyles.recipeRow}>
          {recipes.slice(0, 3).map((r) => (
            <article key={r.id} style={hmStyles.recipeCard} onClick={() => onNav("recipe", r.id)}>
              <div style={{ ...hmStyles.recipeThumb, background: r.grad }}><span style={hmStyles.recipeKicker}>{r.kicker}</span></div>
              <h3 style={hmStyles.recipeTitle}>{r.title}</h3>
              <div style={hmStyles.recipeMeta}><span><Icon name="clock" size={13} /> {r.time}</span><span>{r.level}</span></div>
            </article>
          ))}
        </div>
      </section>

      {/* Social feed */}
      {showSocial !== false && <SocialFeed compact />}

      {/* Journal teaser */}
      <section style={hmStyles.section}>
        <div style={hmStyles.secHead}>
          <div><Eyebrow>The Journal</Eyebrow><h2 style={hmStyles.secTitle}>From the dairy.</h2></div>
          <button className="mt-btn" onClick={() => onNav("blog")}>Read the Journal</button>
        </div>
        <div style={hmStyles.journalRow}>
          {posts.slice(0, 3).map((p) => (
            <article key={p.id} style={hmStyles.journalCard} onClick={() => onNav("article", p.id)}>
              <div style={{ ...hmStyles.journalThumb, background: p.grad }} />
              <span style={hmStyles.cat}>{p.cat}</span>
              <h3 style={hmStyles.journalTitle}>{p.title}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const hmStyles = {
  hero: { position: "relative", minHeight: 600, display: "flex", alignItems: "flex-end", overflow: "hidden" },
  heroPhoto: { position: "absolute", inset: 0, background: "url('../../assets/img/hero_mainbanner.jpg') center 28%/cover" },
  heroScrim: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,78,34,0.15) 0%, rgba(6,78,34,0) 35%, rgba(6,78,34,0.8) 100%)" },
  heroInner: { position: "relative", maxWidth: 1280, width: "100%", margin: "0 auto", padding: "0 28px 72px" },
  heroH1: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 76, lineHeight: 1.0, color: "var(--mt-cream)", margin: "12px 0 0", letterSpacing: "-0.015em", maxWidth: 720 },
  heroSub: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: "var(--mt-cream)", opacity: 0.94, margin: "18px 0 0", maxWidth: 520 },
  heroCta: { display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" },
  values: { maxWidth: 1280, margin: "0 auto", padding: "64px 28px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 },
  value: { textAlign: "center" },
  valueIcon: { display: "inline-flex", width: 56, height: 56, borderRadius: 999, background: "var(--mt-mint)", color: "var(--mt-forest)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  valueT: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 26, color: "var(--mt-forest)" },
  valueD: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 15, lineHeight: 1.5, color: "var(--mt-charcoal)", margin: "8px auto 0", maxWidth: 320 },
  section: { maxWidth: 1280, margin: "0 auto", padding: "40px 28px 56px" },
  secHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30, flexWrap: "wrap", gap: 16 },
  secTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 42, color: "var(--mt-forest)", margin: "6px 0 0", letterSpacing: "-0.01em" },
  prodGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 },
  split: { display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 460, margin: "40px 0" },
  splitPhoto: { backgroundSize: "cover", backgroundPosition: "center" },
  splitBody: { background: "var(--mt-forest)", color: "var(--mt-cream)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 72px" },
  splitH2: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 48, lineHeight: 1.05, color: "var(--mt-cream)", margin: "10px 0 18px" },
  splitText: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, lineHeight: 1.45, color: "var(--mt-mint)", margin: "0 0 30px", maxWidth: 440 },
  recipeRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 },
  recipeCard: { cursor: "pointer" },
  recipeThumb: { aspectRatio: "4 / 3", borderRadius: 18, padding: 16, display: "flex", alignItems: "flex-start", marginBottom: 14, boxShadow: "var(--shadow-soft)" },
  recipeKicker: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-forest)", background: "var(--mt-cream)", padding: "5px 11px", borderRadius: 999 },
  recipeTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 24, color: "var(--mt-forest)", margin: "0 0 8px", lineHeight: 1.1 },
  recipeMeta: { display: "flex", gap: 16, fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--mt-italia-green)" },
  journalRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26 },
  journalCard: { cursor: "pointer" },
  journalThumb: { aspectRatio: "16 / 10", borderRadius: 18, marginBottom: 14, boxShadow: "var(--shadow-soft)" },
  cat: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-italia-green)" },
  journalTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 25, lineHeight: 1.12, color: "var(--mt-forest)", margin: "8px 0 0" },
};

window.StoreHome = StoreHome;

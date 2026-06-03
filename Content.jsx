// Content — Blog (index + article), Recipes (index + detail), Social/press feed.

function SocialFeed({ compact }) {
  const { social } = window.STORE_DATA;
  window.useLucide();
  const items = compact ? social.slice(0, 6) : social.concat(social).slice(0, 8);
  return (
    <section style={{ ...soStyles.wrap, padding: compact ? "84px 28px" : "56px 28px 96px" }}>
      <div style={soStyles.head}>
        <Eyebrow>#MontiTrentini · brand references</Eyebrow>
        <h2 style={soStyles.title}>Storie felici — happy stories.</h2>
        <p style={soStyles.sub}>Follow the mountain on Instagram, and the awards that keep finding our wheels.</p>
      </div>
      <div style={soStyles.grid}>
        {items.map((s, i) => <SocialTile key={i} s={s} />)}
      </div>
    </section>
  );
}

function SocialTile({ s }) {
  const [hover, setHover] = React.useState(false);
  const bg = s.kind === "photo" ? { backgroundImage: `url('${s.src}')`, backgroundSize: "cover", backgroundPosition: "center" } : { background: s.grad };
  return (
    <div style={soStyles.tile} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ ...soStyles.tileBg, ...bg }} />
      {s.award && <span style={soStyles.awardBadge}><Icon name="award" size={14} /> {s.source}</span>}
      <div style={{ ...soStyles.tileOver, opacity: hover ? 1 : 0 }}>
        <Icon name={s.kind === "press" ? "trophy" : "instagram"} size={18} style={{ color: "#fff" }} />
        <p style={soStyles.tileCap}>{s.caption}</p>
        {s.kind === "post" && <span style={soStyles.likes}><Icon name="heart" size={13} /> {s.likes}</span>}
        {s.kind === "press" && <span style={soStyles.likes}>{s.source}</span>}
      </div>
    </div>
  );
}

function RecipeIndex({ onNav }) {
  const { recipes } = window.STORE_DATA;
  window.useLucide();
  return (
    <main style={coStyles.main}>
      <div style={coStyles.pageHead}>
        <Eyebrow>Recipes</Eyebrow>
        <h1 style={coStyles.pageTitle}>Bring the mountain to your table.</h1>
        <p style={coStyles.pageIntro}>Simple ways with our cheeses — from a quick crostini to a slow Sunday risotto.</p>
      </div>
      <div style={coStyles.recipeGrid}>
        {recipes.map((r) => (
          <article key={r.id} style={coStyles.recipeCard} onClick={() => onNav("recipe", r.id)}>
            <div style={{ ...coStyles.recipeThumb, background: r.grad }}>
              <span style={coStyles.recipeKicker}>{r.kicker}</span>
            </div>
            <div style={coStyles.recipeBody}>
              <h3 style={coStyles.recipeTitle}>{r.title}</h3>
              <p style={coStyles.recipeIntro}>{r.intro}</p>
              <div style={coStyles.recipeMeta}><span><Icon name="clock" size={14} /> {r.time}</span><span><Icon name="bar-chart-2" size={14} /> {r.level}</span></div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function RecipeDetail({ id, onNav, wholesale }) {
  const { recipes, products } = window.STORE_DATA;
  const r = recipes.find((x) => x.id === id) || recipes[0];
  const pairProduct = products.find((p) => p.id === r.pairs);
  const cart = React.useContext(window.CartCtx);
  window.useLucide();
  const steps = [
    "Bring the cheese to room temperature so its full alpine aroma opens up.",
    "Prepare your base — toast, simmer or roast as the dish needs.",
    "Add the Monti Trentini cheese generously and let it melt or shave over the top.",
    "Finish with a drizzle of good oil or alpine honey, and serve warm.",
  ];
  return (
    <main style={coStyles.articleWrap}>
      <button style={coStyles.back} onClick={() => onNav("recipes")}><Icon name="arrow-left" size={16} /> All recipes</button>
      <div style={{ ...coStyles.articleHero, background: r.grad }}>
        <span style={coStyles.recipeKicker}>{r.kicker}</span>
      </div>
      <div style={coStyles.articleHead}>
        <h1 style={coStyles.articleTitle}>{r.title}</h1>
        <div style={coStyles.recipeMeta}><span><Icon name="clock" size={15} /> {r.time}</span><span><Icon name="bar-chart-2" size={15} /> {r.level}</span><span><Icon name="users" size={15} /> Serves 4</span></div>
      </div>
      <div style={coStyles.recipeLayout}>
        <div>
          <p style={coStyles.lead}>{r.intro}</p>
          <h2 style={coStyles.h2}>Method</h2>
          <ol style={coStyles.steps}>
            {steps.map((s, i) => <li key={i} style={coStyles.step}><span style={coStyles.stepNum}>{i + 1}</span><span>{s}</span></li>)}
          </ol>
        </div>
        {pairProduct && (
          <aside style={coStyles.pairCard}>
            <div style={coStyles.pairLabel}>Made with</div>
            <div style={{ ...coStyles.pairThumb, background: pairProduct.grad }} />
            <div style={coStyles.pairName}>{pairProduct.name}</div>
            <div style={{ margin: "6px 0 14px" }}><PriceTag p={pairProduct} wholesale={wholesale} /></div>
            <button className="mt-btn mt-btn--solid" style={{ width: "100%", justifyContent: "center" }} onClick={() => cart.add(pairProduct.id)}>Add to cart</button>
          </aside>
        )}
      </div>
    </main>
  );
}

function BlogIndex({ onNav }) {
  const { posts } = window.STORE_DATA;
  window.useLucide();
  const [feat, ...rest] = posts;
  return (
    <main style={coStyles.main}>
      <div style={coStyles.pageHead}>
        <Eyebrow>The Journal</Eyebrow>
        <h1 style={coStyles.pageTitle}>A hundred-year long story.</h1>
        <p style={coStyles.pageIntro}>Notes from the dairy — heritage, territory and the meaning of "Product of the Mountains."</p>
      </div>
      <article style={coStyles.featPost} onClick={() => onNav("article", feat.id)}>
        <div style={{ ...coStyles.featThumb, background: feat.grad }} />
        <div style={coStyles.featBody}>
          <span style={coStyles.cat}>{feat.cat}</span>
          <h2 style={coStyles.featTitle}>{feat.title}</h2>
          <p style={coStyles.featExcerpt}>{feat.excerpt}</p>
          <div style={coStyles.postMeta}>{feat.date} · {feat.read} read</div>
        </div>
      </article>
      <div style={coStyles.postGrid}>
        {rest.map((p) => (
          <article key={p.id} style={coStyles.postCard} onClick={() => onNav("article", p.id)}>
            <div style={{ ...coStyles.postThumb, background: p.grad }} />
            <span style={coStyles.cat}>{p.cat}</span>
            <h3 style={coStyles.postTitle}>{p.title}</h3>
            <p style={coStyles.postExcerpt}>{p.excerpt}</p>
            <div style={coStyles.postMeta}>{p.date} · {p.read} read</div>
          </article>
        ))}
      </div>
    </main>
  );
}

function BlogArticle({ id, onNav }) {
  const { posts } = window.STORE_DATA;
  const p = posts.find((x) => x.id === id) || posts[0];
  window.useLucide();
  return (
    <main style={coStyles.articleWrap}>
      <button style={coStyles.back} onClick={() => onNav("blog")}><Icon name="arrow-left" size={16} /> The Journal</button>
      <div style={coStyles.articleMeta}><span style={coStyles.cat}>{p.cat}</span><span style={coStyles.postMeta}>{p.date} · {p.read} read</span></div>
      <h1 style={coStyles.articleTitle}>{p.title}</h1>
      <div style={{ ...coStyles.articleHero, background: p.grad, marginTop: 24 }} />
      <div style={coStyles.articleBody}>
        <p style={coStyles.lead}>{p.excerpt}</p>
        {p.body.map((para, i) => <p key={i} style={coStyles.para}>{para}</p>)}
        <div style={coStyles.pull}>"You cannot make good cheese without happy stories."</div>
      </div>
    </main>
  );
}

const soStyles = {
  wrap: { background: "var(--mt-paper)" },
  head: { maxWidth: 1280, margin: "0 auto", textAlign: "center" },
  title: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 44, color: "var(--mt-forest)", margin: "8px 0 0" },
  sub: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, color: "var(--mt-charcoal)", margin: "12px auto 0", maxWidth: 560 },
  grid: { maxWidth: 1280, margin: "40px auto 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  tile: { position: "relative", aspectRatio: "1 / 1", borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-soft)" },
  tileBg: { position: "absolute", inset: 0 },
  awardBadge: { position: "absolute", top: 12, left: 12, display: "inline-flex", alignItems: "center", gap: 5, background: "var(--mt-cream)", color: "var(--mt-forest)", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", padding: "5px 10px", borderRadius: 999, zIndex: 2 },
  tileOver: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,78,34,0) 35%, rgba(6,78,34,0.82) 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18, gap: 6, transition: "opacity .25s ease" },
  tileCap: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 16, lineHeight: 1.2, color: "var(--mt-cream)", margin: 0 },
  likes: { display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--mt-mint)" },
  main: { maxWidth: 1280, margin: "0 auto", padding: "56px 28px 96px" },
  pageHead: { textAlign: "center", marginBottom: 44 },
  pageTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 52, lineHeight: 1.06, color: "var(--mt-forest)", margin: "8px 0 0", letterSpacing: "-0.01em" },
  pageIntro: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 21, color: "var(--mt-charcoal)", margin: "20px auto 0", maxWidth: 580 },
  recipeGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 26 },
  recipeCard: { background: "var(--mt-paper)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-card)", cursor: "pointer", display: "flex", flexDirection: "column" },
  recipeThumb: { aspectRatio: "16 / 9", padding: 18, display: "flex", alignItems: "flex-start" },
  recipeKicker: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-forest)", background: "var(--mt-cream)", padding: "6px 12px", borderRadius: 999 },
  recipeBody: { padding: "22px 26px 26px" },
  recipeTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 28, color: "var(--mt-forest)", margin: "0 0 8px", lineHeight: 1.1 },
  recipeIntro: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 17, lineHeight: 1.4, color: "var(--mt-charcoal)", margin: "0 0 16px" },
  recipeMeta: { display: "flex", gap: 20, fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--mt-italia-green)" },
  articleWrap: { maxWidth: 820, margin: "0 auto", padding: "32px 28px 96px" },
  back: { display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--mt-italia-green)", marginBottom: 24 },
  articleHero: { aspectRatio: "21 / 9", borderRadius: 20, position: "relative", padding: 20, display: "flex", alignItems: "flex-start", boxShadow: "var(--shadow-card)" },
  articleHead: { margin: "28px 0" },
  articleTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 44, lineHeight: 1.08, color: "var(--mt-forest)", margin: "10px 0 0", letterSpacing: "-0.01em" },
  recipeLayout: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 44, alignItems: "start", marginTop: 8 },
  lead: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, fontSize: 24, lineHeight: 1.5, color: "var(--mt-forest)", margin: "0 0 28px" },
  h2: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 28, color: "var(--mt-forest)", margin: "0 0 16px" },
  steps: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 },
  step: { display: "flex", gap: 14, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 19, lineHeight: 1.4, color: "var(--mt-forest)" },
  stepNum: { flex: "none", width: 30, height: 30, borderRadius: 999, background: "var(--mt-mint)", color: "var(--mt-forest)", fontFamily: "var(--font-ui-bold)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", fontStyle: "normal" },
  pairCard: { background: "var(--mt-paper)", borderRadius: 20, padding: 24, boxShadow: "var(--shadow-card)", position: "sticky", top: 120 },
  pairLabel: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-italia-green)", marginBottom: 12 },
  pairThumb: { aspectRatio: "1 / 1", borderRadius: 14, marginBottom: 14 },
  pairName: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 22, color: "var(--mt-forest)" },
  featPost: { display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0, background: "var(--mt-paper)", borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow-card)", cursor: "pointer", marginBottom: 32 },
  featThumb: { minHeight: 320 },
  featBody: { padding: "44px 44px" },
  cat: { fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt-italia-green)" },
  featTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 34, lineHeight: 1.1, color: "var(--mt-forest)", margin: "10px 0 14px" },
  featExcerpt: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 19, lineHeight: 1.45, color: "var(--mt-charcoal)", margin: "0 0 18px" },
  postMeta: { fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--mt-charcoal)" },
  postGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 26 },
  postCard: { cursor: "pointer" },
  postThumb: { aspectRatio: "16 / 9", borderRadius: 18, marginBottom: 16, boxShadow: "var(--shadow-soft)" },
  postTitle: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 26, lineHeight: 1.12, color: "var(--mt-forest)", margin: "8px 0 8px" },
  postExcerpt: { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 17, lineHeight: 1.4, color: "var(--mt-charcoal)", margin: "0 0 10px" },
  articleMeta: { display: "flex", alignItems: "center", gap: 14, marginBottom: 6 },
  articleBody: { marginTop: 32 },
  para: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, fontSize: 20, lineHeight: 1.6, color: "var(--mt-forest)", margin: "0 0 22px" },
  pull: { fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 30, lineHeight: 1.25, color: "var(--mt-italia-green)", borderLeft: "3px solid var(--mt-sage)", paddingLeft: 24, margin: "36px 0" },
};

const coStyles = soStyles;

Object.assign(window, { SocialFeed, RecipeIndex, RecipeDetail, BlogIndex, BlogArticle });
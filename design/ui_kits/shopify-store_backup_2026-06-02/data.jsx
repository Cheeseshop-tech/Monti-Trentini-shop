// Store data — products, recipes, blog, social/press. Sets window.STORE_DATA.
// Prices in EUR. Product imagery uses brand-green gradient placeholders until
// real packshots arrive (the one alpine photo is reused for lifestyle tiles).
(function () {
  const HERO = "../../assets/img/hero_mainbanner.jpg";
  const g = (a, b) => `linear-gradient(145deg, ${a}, ${b})`;

  const products = [
    { id: "asiago-fresco", name: "Asiago PDO Fresco", range: "Asiago PDO", price: 13.9, wholesale: 9.7, weight: "500 g wedge",
      grad: g("#C8E2C5", "#064E22"), badge: "Product of the Mountains",
      blurb: "Aged at least 30 days, from 11–15 kg wheels. Sweet, milky, made only with milk collected above 600 m.",
      tags: ["PDO", "Mild"], age: "30+ days", milk: "Mountain raw milk", featured: true },
    { id: "asiago-stagionato", name: "Aged Asiago PDO", range: "Asiago PDO", price: 18.5, wholesale: 13.2, weight: "500 g wedge",
      grad: g("#70C883", "#064E22"), badge: "Product of the Mountains",
      blurb: "Aged 3–9 months, 8–10 kg wheels. Deeper, nutty, with a firm alpine character.",
      tags: ["PDO", "Aged"], age: "3–9 months", milk: "Mountain raw milk", featured: true },
    { id: "grana-padano", name: "Grana Padano PDO", range: "Grana Padano PDO", price: 16.9, wholesale: 11.9, weight: "600 g",
      grad: g("#E3F0E1", "#009640"), badge: "PDO",
      blurb: "Slow tradition, locally sourced mountain milk. A classic hard cheese, grainy and savoury.",
      tags: ["PDO", "Hard"], age: "16 months", milk: "Mountain milk", featured: true },
    { id: "provolone", name: "Provolone Valpadana PDO", range: "Provolone", price: 12.4, wholesale: 8.6, weight: "500 g",
      grad: g("#FFFBDC", "#70C883"), badge: "Pasta filata",
      blurb: "Stretched-curd, made within 90 km of the dairy. Available dolce or piccante.",
      tags: ["PDO", "Stretched"], age: "Dolce / Piccante", milk: "Mountain milk", featured: true },
    { id: "caciotta", name: "Caciotta Trentina", range: "Caciotta", price: 9.9, wholesale: 6.8, weight: "400 g",
      grad: g("#C8E2C5", "#009640"), badge: "Soft",
      blurb: "Soft to semi-hard, artisanal. Gentle and creamy, an everyday table cheese.",
      tags: ["Soft"], age: "20 days", milk: "Mountain milk", featured: false },
    { id: "provola-affumicata", name: "Smoked Provola", range: "Paste filate", price: 8.5, wholesale: 5.9, weight: "300 g",
      grad: g("#70C883", "#141413"), badge: "Pasta filata",
      blurb: "Naturally smoked stretched-curd. Supple, with a warm, woodsy finish.",
      tags: ["Smoked", "Stretched"], age: "Fresh", milk: "Mountain milk", featured: false },
    { id: "alpeggio", name: "Asiago d'Alpeggio Reserve", range: "Asiago PDO", price: 24.0, wholesale: 17.4, weight: "500 g wedge",
      grad: g("#064E22", "#141413"), badge: "Alpeggio",
      blurb: "Our highest tier — milk from summer alpine pasture (malga). Floral, complex, rare.",
      tags: ["PDO", "Reserve"], age: "12+ months", milk: "Alpeggio milk", featured: true },
    { id: "gift-box", name: "Mountain Selection Gift Box", range: "Gifts", price: 45.0, wholesale: 33.0, weight: "4 cheeses + honey",
      grad: g("#FFFBDC", "#064E22"), badge: "Gift",
      blurb: "A curated board: Asiago Fresco, Aged Asiago, Grana Padano and Provolone, with alpine honey.",
      tags: ["Gift"], age: "Assorted", milk: "Mountain milk", featured: false },
  ];

  const recipes = [
    { id: "asiago-crostini", title: "Asiago & pear crostini", time: "15 min", level: "Easy", pairs: "asiago-fresco",
      grad: g("#C8E2C5", "#064E22"), kicker: "Antipasto",
      intro: "Sweet pear, a drizzle of alpine honey and a shaving of young Asiago on toasted country bread." },
    { id: "grana-risotto", title: "Grana Padano risotto alla Trentina", time: "35 min", level: "Medium", pairs: "grana-padano",
      grad: g("#E3F0E1", "#009640"), kicker: "Primo",
      intro: "A slow, mountain-style risotto finished with a generous fold of grated Grana Padano." },
    { id: "provolone-peppers", title: "Provolone-stuffed peppers", time: "45 min", level: "Medium", pairs: "provolone",
      grad: g("#FFFBDC", "#70C883"), kicker: "Secondo",
      intro: "Sweet peppers baked until soft, filled with melting Provolone Valpadana and herbs." },
    { id: "fonduta", title: "Alpine fonduta", time: "25 min", level: "Easy", pairs: "alpeggio",
      grad: g("#064E22", "#141413"), kicker: "To share",
      intro: "A warm pool of melted mountain cheese for dipping bread, potatoes and crisp vegetables." },
  ];

  const posts = [
    { id: "hundred-years", title: "A hundred-year long story does not happen by chance", date: "May 2026", read: "6 min",
      cat: "Heritage", grad: g("#70C883", "#064E22"),
      excerpt: "From grandfather Florindo's first wheels in Gallio, 1925, to a modern dairy in Grigno — guided by family, respect of territory and quality.",
      body: ["The opening chapter of our history is written in 1925 by grandfather Florindo, who starts working as a cheese maker in Gallio, on the Asiago plateau.",
             "From small dairy to modern industry — a mountain of innovations, guided by strong values: family, respect of territory, quality. The cheese-maker is both heart and mind of the dairy.",
             "Today our milk still comes only from our neighborhood, within 90 km of Grigno — the Trentino mountains, the Asiago plateau and the near Veneto valleys."] },
    { id: "product-of-mountains", title: "What \u201CProduct of the Mountains\u201D really means", date: "Apr 2026", read: "4 min",
      cat: "Origin", grad: g("#C8E2C5", "#009640"),
      excerpt: "It is a regulated EU label, not a slogan: milk collected and processed above 600 m. We are one of very few dairies to make Asiago PDO this way all year round.",
      body: ["To carry the label, Asiago must be produced only with milk collected and transformed in the mountains, above 600 metres above sea level.",
             "Caseificio Finco sits in Enego, at 800 m. The whole supply chain happens in the mountains to respect tradition and preserve the flavours of flowers and grass.",
             "An authentic product of the mountain: two ingredients — uncontaminated nature and great cheesemaking tradition."] },
    { id: "malga", title: "Inside the malga: a summer on alpine pasture", date: "Mar 2026", read: "5 min",
      cat: "Territory", grad: g("#FFFBDC", "#70C883"),
      excerpt: "Where cows graze in the Dolomites' shades, on fresh herbs rich in fragrance and flavour. A look at alpeggio season.",
      body: ["Every day we collect milk from territories covered in woods, grazeland and alpine meadows — the natural, healthy environment where cows live and grow.",
             "Here they eat fresh herbs, rich in fragrance and flavour. We work in synergy with farmers to protect animal welfare.",
             "The result is alpeggio milk: floral, complex, and the foundation of our highest-tier cheeses."] },
  ];

  const social = [
    { kind: "post", handle: "@montitrentini", grad: g("#C8E2C5", "#064E22"), caption: "Morning on the altopiano \u2014 milk from the neighbourhood.", likes: 412 },
    { kind: "press", source: "World Cheese Awards 2025", grad: g("#064E22", "#141413"), caption: "Asiago PDO — awarded at the World Cheese Awards 2025.", award: true },
    { kind: "photo", src: HERO, caption: "Where cows graze in the Dolomites' shades." },
    { kind: "post", handle: "@montitrentini", grad: g("#70C883", "#009640"), caption: "Storie felici — happy stories make good cheese.", likes: 287 },
    { kind: "press", source: "Caseus Veneti 2025", grad: g("#E3F0E1", "#009640"), caption: "Recognised again at Caseus Veneti 2025.", award: true },
    { kind: "post", handle: "@montitrentini", grad: g("#FFFBDC", "#70C883"), caption: "Aged 3–9 months. Patience tastes like this.", likes: 356 },
  ];

  window.STORE_DATA = { products, recipes, posts, social, HERO };
})();

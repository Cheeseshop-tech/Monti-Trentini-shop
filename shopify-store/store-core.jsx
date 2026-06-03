// Store core — cart context, money formatter, Lucide icon helper, small atoms.
window.CartCtx = React.createContext(null);

window.money = function (n, currency) {
  const cur = currency || (window.STORE_CURRENCY || "USD");
  const sym = { EUR: "\u20AC", GBP: "\u00A3", USD: "$" }[cur] || "$";
  const v = (Math.round(n * 100) / 100).toFixed(2);
  return `${sym}${v}`;
};

// Lucide icon — wraps <i data-lucide> in a span whose font-size drives the
// replaced <svg> (sized 1em via global CSS), so per-icon size survives createIcons().
function Icon({ name, size = 20, style }) {
  return (
    <span style={{ fontSize: size, lineHeight: 0, display: "inline-flex", verticalAlign: "middle", ...style }}>
      <i data-lucide={name} />
    </span>
  );
}
window.Icon = Icon;

// Refresh hook — call inside components that render icons
window.useLucide = function () {
  React.useEffect(() => {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  });
};

// Cart provider (used by App)
window.useCartState = function () {
  const [items, setItems] = React.useState([]); // {id, qty}
  const [open, setOpen] = React.useState(false);
  const add = (id, qty = 1) => {
    setItems((p) => {
      const f = p.find((x) => x.id === id);
      if (f) return p.map((x) => (x.id === id ? { ...x, qty: x.qty + qty } : x));
      return [...p, { id, qty }];
    });
    setOpen(true);
  };
  const setQty = (id, qty) => setItems((p) => qty <= 0 ? p.filter((x) => x.id !== id) : p.map((x) => x.id === id ? { ...x, qty } : x));
  const remove = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((s, x) => s + x.qty, 0);
  return { items, open, setOpen, add, setQty, remove, clear, count };
};

window.Eyebrow = function ({ children, color, style }) {
  return <div className="mt-eyebrow" style={{ color: color || "var(--accent)", ...style }}>{children}</div>;
};

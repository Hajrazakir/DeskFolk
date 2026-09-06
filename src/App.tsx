import { useContext, useEffect, useMemo, useState, createContext } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Route, Switch, useLocation, useParams, useSearchParams } from "wouter";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Heart,
  AtSign,
  Menu,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { CATEGORIES, CATEGORY_INFO, money, PRODUCTS, type CartItem, type Order, type Product } from "@/lib/store";

type StoreContextValue = {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toast: string | null;
  notify: (message: string) => void;
  lastOrder: Order | null;
  placeOrder: (details: { customerName: string; email: string; address: string }) => Order;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readStorage("deskfolk-cart", []));
  const [lastOrder, setLastOrder] = useState<Order | null>(() => readStorage("deskfolk-last-order", null));
  const [toast, setToast] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => readStorage("deskfolk-wishlist", []));

  useEffect(() => { localStorage.setItem("deskfolk-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("deskfolk-wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(null), 2800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  const notify = (message: string) => setToast(message);
  const toggleWishlist = (productId: string) => {
    setWishlist((current) => {
      if (current.includes(productId)) { notify("Removed from your wishlist"); return current.filter((id) => id !== productId); }
      notify("Saved to your wishlist");
      return [...current, productId];
    });
  };
  const addToCart = (productId: string, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      const product = PRODUCTS.find((item) => item.id === productId);
      if (!product) return current;
      if (existing) return current.map((item) => item.productId === productId ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item);
      return [...current, { productId, quantity: Math.min(product.stock, quantity) }];
    });
    notify(quantity > 1 ? `${quantity} items added to your bag` : "Added to your bag");
  };
  const updateQuantity = (productId: string, quantity: number) => {
    const product = PRODUCTS.find((item) => item.id === productId);
    if (!product) return;
    if (quantity <= 0) setCart((current) => current.filter((item) => item.productId !== productId));
    else setCart((current) => current.map((item) => item.productId === productId ? { ...item, quantity: Math.min(product.stock, quantity) } : item));
  };
  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
    notify("Item removed from your bag");
  };
  const clearCart = () => {
    setCart([]);
    setLastOrder(null);
    localStorage.removeItem("deskfolk-last-order");
  };
  const placeOrder = (details: { customerName: string; email: string; address: string }) => {
    const order: Order = {
      id: `DF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      items: cart,
      total: cart.reduce((sum, item) => sum + (PRODUCTS.find((p) => p.id === item.productId)?.price ?? 0) * item.quantity, 0),
      ...details,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    clearCart();
    setLastOrder(order);
    localStorage.setItem("deskfolk-last-order", JSON.stringify(order));
    return order;
  };

  return <StoreContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, toast, notify, lastOrder, placeOrder, wishlist, toggleWishlist }}>{children}</StoreContext.Provider>;
}

function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}

function Header() {
  const [location, navigate] = useLocation();
  const { cart, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const links = [{ href: "/", label: "Home" }, { href: "/store", label: "Shop all" }];

  useEffect(() => { setMenuOpen(false); }, [location]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(searchValue.trim() ? `/store?q=${encodeURIComponent(searchValue.trim())}` : "/store");
  };

  return (
    <>
      <div className="announce-bar" aria-label="Site announcement">
        <div className="announce-track">
          <span>FREE SHIPPING ON ORDERS OVER $100</span>
          <span>NEW FINDS ADDED EVERY WEEK</span>
          <span>EVERY PIECE IS ONE OF ONE</span>
          <span>FREE SHIPPING ON ORDERS OVER $100</span>
          <span>NEW FINDS ADDED EVERY WEEK</span>
        </div>
      </div>
      <header className="top-nav">
        <Link href="/" className="logo" data-testid="link-home">
          <span className="logo-mark"><Package size={17} strokeWidth={2.5} /></span>
          <span>deskfolk<span className="logo-caption">secondhand décor & jewelry</span></span>
        </Link>
        <nav className="main-nav" aria-label="Primary navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className={`nav-link ${location === link.href ? "active" : ""}`} data-testid={`link-nav-${link.label.replace(" ", "-")}`}>{link.label}</Link>)}
        </nav>
        <form className="nav-search" onSubmit={submitSearch} role="search">
          <Search size={14} />
          <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search decor, jewelry, lighting…" aria-label="Search products" data-testid="input-nav-search" />
        </form>
        <div className="nav-actions">
          <Link href="/store" className="wishlist-button" aria-label="Wishlist" data-testid="link-wishlist">
            <Heart size={18} />
            {wishlist.length > 0 && <span className="cart-count" data-testid="text-wishlist-count">{wishlist.length}</span>}
          </Link>
          <Link href="/cart" className="cart-button" aria-label="Open shopping bag" data-testid="link-cart">
            <ShoppingBag size={18} />
            {itemCount > 0 && <span className="cart-count" data-testid="text-cart-count">{itemCount}</span>}
          </Link>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" data-testid="button-toggle-menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
      {menuOpen && <nav className="mobile-menu" aria-label="Mobile navigation">
        <form className="nav-search nav-search-mobile" onSubmit={submitSearch} role="search">
          <Search size={14} />
          <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search…" aria-label="Search products" />
        </form>
        {links.map((link) => <Link key={link.href} href={link.href} className="nav-link" data-testid={`link-mobile-${link.label.replace(" ", "-")}`}>{link.label}</Link>)}
      </nav>}
    </>
  );
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return <div className="toast" role="status" data-testid="status-toast"><CheckCircle2 size={16} color="#bed8ce" />{toast}</div>;
}

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const saved = wishlist.includes(product.id);
  const discount = product.originalPrice ? Math.round(100 - (product.price / product.originalPrice) * 100) : 0;
  return (
    <div className="product-card" style={{ animationDelay: `${index * 55}ms` }} data-testid={`card-product-${product.id}`}>
      <Link href={`/products/${product.id}`} className="product-visual-link">
        <div className={`product-visual ${product.visual}`} data-testid={`visual-product-${product.id}`}>
          <div className="product-badges">
            {product.featured && <span className="featured-tag">Deskfolk pick</span>}
            {discount > 0 && <span className="discount-tag">-{discount}%</span>}
          </div>
          <img src={`${product.image}?auto=format&fit=crop&w=600&q=80`} alt={product.name} loading="lazy" />
          <button
            type="button"
            className={`wishlist-heart ${saved ? "active" : ""}`}
            onClick={(event) => { event.preventDefault(); toggleWishlist(product.id); }}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart size={15} fill={saved ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            className="quick-add"
            onClick={(event) => { event.preventDefault(); addToCart(product.id, 1); }}
            data-testid={`button-quick-add-${product.id}`}
          >
            <ShoppingBag size={13} /> Quick add
          </button>
        </div>
      </Link>
      <Link href={`/products/${product.id}`} className="product-body-link">
        <div className="product-body">
          <div className="product-top-row"><span className="product-category">{product.category}</span><span className="condition-tag">{product.condition}</span></div>
          <div className="product-name" data-testid={`text-product-name-${product.id}`}>{product.name}</div>
          <div className="product-bottom">
            <span className="price-group"><span className="price" data-testid={`text-price-${product.id}`}>{money(product.price)}</span>{product.originalPrice && <span className="price-original">{money(product.originalPrice)}</span>}</span>
            <span className="rating"><Star size={11} fill="currentColor" /> {product.rating}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function HomePage() {
  const featured = PRODUCTS.filter((product) => product.featured).slice(0, 4);
  const { notify } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const submitNewsletter = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim() && email.includes("@")) { setSubscribed(true); notify("You're on the list. Welcome to deskfolk."); }
  };
  return (
    <main>
      <section className="home-hero">
        <div className="container hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">Curated secondhand, since day one</span>
            <h1 className="display hero-title">Old things, worn in just right.</h1>
            <p>Deskfolk collects secondhand home décor and vintage jewelry with a bit of history in them — chosen piece by piece from estate sales, thrift runs, and other people's forgotten drawers.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/store" data-testid="link-hero-shop">Browse the collection</Link>
              <a href="#why-deskfolk" className="text-link" data-testid="link-hero-story">Why we do it this way</a>
            </div>
            <div className="hero-trust-row">
              <span><ShieldCheck size={14} /> Authenticity checked</span>
              <span><RotateCcw size={14} /> 14-day returns</span>
              <span><Truck size={14} /> Ships in 2 days</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Photo of a curated shelf of secondhand décor">
            <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80" alt="A curated shelf of secondhand décor and jewelry" />
            <span className="hero-art-sticker">NOTHING<br />FROM A<br />WAREHOUSE</span>
          </div>
        </div>
      </section>
      <div className="marquee" aria-label="Deskfolk values">
        <div className="marquee-track"><span>CHOSEN BY HAND <b>/</b></span><span>NO TWO PIECES ALIKE <b>/</b></span><span>ONCE IT'S GONE, IT'S GONE <b>/</b></span><span>CHOSEN BY HAND <b>/</b></span><span>NO TWO PIECES ALIKE <b>/</b></span><span>ONCE IT'S GONE, IT'S GONE <b>/</b></span></div>
      </div>
      <section className="section category-section">
        <div className="container">
          <div className="home-section-head">
            <div><span className="eyebrow">Browse by category</span><h2 className="display section-title">Shop the shelf.</h2></div>
            <div className="section-subtitle">Four small categories, all hand-picked. No overstock, no filler — just what came in this round.</div>
          </div>
          <div className="category-grid">
            {(Object.keys(CATEGORY_INFO) as Array<keyof typeof CATEGORY_INFO>).map((category) => (
              <Link key={category} href={`/store?category=${category}`} className="category-tile" data-testid={`link-category-${category.toLowerCase()}`}>
                <img src={`${CATEGORY_INFO[category].image}?auto=format&fit=crop&w=500&q=80`} alt={category} />
                <div className="category-tile-copy"><strong>{category}</strong><span>{CATEGORY_INFO[category].count}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="home-section-head">
            <div><span className="eyebrow">Fresh on the shelf</span><h2 className="display section-title">This week's finds</h2></div>
            <div className="section-subtitle">A short list of pieces we'd happily keep on our own shelf. Nothing here gets restocked once it sells.</div>
          </div>
          <div className="product-grid">{featured.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
          <div style={{ textAlign: "center", marginTop: 30 }}><Link className="text-link" href="/store" data-testid="link-home-view-all">See the full shelf</Link></div>
        </div>
      </section>
      <section className="section" id="why-deskfolk">
        <div className="container">
          <div className="manifesto">
            <div><h2 className="display">Every piece has already lived a life.</h2></div>
            <div className="manifesto-copy">
              <p>Deskfolk started as a habit of buying one too many nice things at estate sales. Now it's a small shop for people who'd rather own something with a past than a barcode. If a piece has a chip, a scratch, or a bit of tarnish, we tell you — that's part of what you're buying.</p>
              <div className="mini-points">
                <div className="mini-point"><b>Sourced with care</b>Hand-picked from estate sales, thrift runs, and forgotten drawers — not a wholesale catalog.</div>
                <div className="mini-point"><b>Honest condition</b>Wear gets noted, not hidden. What you see in the photo is what arrives.</div>
                <div className="mini-point"><b>One of a kind</b>Each listing is a single piece. Once it sells, that exact one is gone.</div>
                <div className="mini-point"><b>Gently packed</b>Wrapped like it matters, because to whoever owned it before you, it did.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="newsletter">
        <div className="container">
          <h2 className="display">{subscribed ? "See you in the next note." : "New finds, once in a while."}</h2>
          <p>{subscribed ? "Your inbox is now a little more interesting." : "We'll email you when something good comes in. No drops, no daily noise."}</p>
          {!subscribed && <form className="newsletter-form" onSubmit={submitNewsletter}><input aria-label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required data-testid="input-newsletter-email" /><button className="button button-coral" type="submit" data-testid="button-newsletter-submit">Sign me up</button></form>}
        </div>
      </section>
    </main>
  );
}

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
] as const;

function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(() => {
    const fromUrl = searchParams.get("category");
    return (CATEGORIES as readonly string[]).includes(fromUrl ?? "") ? (fromUrl as (typeof CATEGORIES)[number]) : "All";
  });
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["id"]>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    if (fromUrl && (CATEGORIES as readonly string[]).includes(fromUrl)) setCategory(fromUrl as (typeof CATEGORIES)[number]);
    const q = searchParams.get("q");
    if (q) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCategory = (next: (typeof CATEGORIES)[number]) => {
    setCategory(next);
    const params = new URLSearchParams(searchParams);
    if (next === "All") params.delete("category"); else params.set("category", next);
    setSearchParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const list = PRODUCTS.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      return matchesCategory && (!term || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(term));
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    return sorted;
  }, [category, search, sort]);

  return (
    <main className="page"><div className="container">
      <div className="page-heading"><div><h1 className="display">The whole shelf.</h1></div><p>Eight pieces, each one bought secondhand and sold once. Once something sells, it's off the shelf for good.</p></div>
      <div className="store-tools">
        <div className="search-wrap"><Search size={16} /><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the shelf..." aria-label="Search products" data-testid="input-product-search" /></div>
        <button className="filter-toggle" onClick={() => setFiltersOpen((open) => !open)} data-testid="button-toggle-filters"><SlidersHorizontal size={14} /> Filters</button>
        <div className="sort-wrap">
          <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort products" data-testid="select-sort">
            {SORT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          <ChevronDown size={13} />
        </div>
      </div>
      <div className={`store-layout ${filtersOpen ? "filters-open" : ""}`}>
        <aside className="filter-sidebar">
          <div className="filter-group">
            <h3>Category</h3>
            <div className="filter-list">{CATEGORIES.map((item) => <button key={item} className={`filter-option ${category === item ? "active" : ""}`} onClick={() => updateCategory(item)} data-testid={`button-filter-${item.toLowerCase()}`}>{item}<span>{item === "All" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === item).length}</span></button>)}</div>
          </div>
          <div className="filter-group">
            <h3>Condition</h3>
            <div className="filter-list filter-list-static">{["Like new", "Excellent", "Very good", "Good"].map((cond) => <span key={cond} className="filter-static-row"><Tag size={11} /> {cond}</span>)}</div>
          </div>
          <div className="filter-note"><ShieldCheck size={14} /> Every condition rating is set by us in person, not the previous owner.</div>
        </aside>
        <div className="store-results">
          <div className="results-count" data-testid="text-results-count">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}{category !== "All" ? ` in ${category}` : ""}</div>
          {filtered.length > 0 ? <div className="product-grid">{filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="empty-state"><Search size={27} /><h2>No objects found</h2><p>Try a different word or clear the category filter.</p><button className="button button-soft" onClick={() => { setSearch(""); updateCategory("All"); }} data-testid="button-clear-filters">Clear filters</button></div>}
        </div>
      </div>
    </div></main>
  );
}

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find((item) => item.id === id);
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  if (!product) return <NotFound />;
  const saved = wishlist.includes(product.id);
  const related = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  return (
    <main className="page"><div className="container">
      <div className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/store">Shop all</Link><span>/</span><Link href={`/store?category=${product.category}`}>{product.category}</Link><span>/</span><span className="breadcrumb-current">{product.name}</span>
      </div>
      <div className="detail-layout">
        <div className={`detail-visual ${product.visual}`} data-testid={`visual-detail-${product.id}`}><img src={`${product.image}?auto=format&fit=crop&w=1200&q=80`} alt={product.name} /></div>
        <div className="detail-content">
          <div className="eyebrow">{product.category}</div>
          <h1 className="display" data-testid="text-detail-name">{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-price-row">
            <span className="detail-price" data-testid="text-detail-price">{money(product.price)}</span>
            {product.originalPrice && <span className="detail-price-original">{money(product.originalPrice)}</span>}
            <span className="rating"><Star size={12} fill="currentColor" /> {product.rating} / 5</span>
          </div>
          <div className="condition-row"><Tag size={13} /> Condition: <strong>{product.condition}</strong><span className="stock">· {product.stock} in stock</span></div>
          <div className="quantity-row">
            <div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" data-testid="button-detail-minus"><Minus size={14} /></button><span data-testid="text-detail-quantity">{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Increase quantity" data-testid="button-detail-plus"><Plus size={14} /></button></div>
            <span style={{ color: "var(--muted-foreground)", fontSize: 11 }}>Choose quantity</span>
          </div>
          <div className="detail-actions">
            <button className="button button-coral" onClick={() => addToCart(product.id, quantity)} disabled={product.stock < 1} data-testid="button-add-to-cart">Add to bag <ShoppingBag size={15} /></button>
            <button className={`button button-outline ${saved ? "saved" : ""}`} onClick={() => toggleWishlist(product.id)} data-testid="button-detail-wishlist"><Heart size={15} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button>
          </div>
          <div className="trust-badge-row">
            <span><ShieldCheck size={15} /> Condition verified</span>
            <span><RotateCcw size={15} /> 14-day returns</span>
            <span><CreditCard size={15} /> Secure checkout</span>
          </div>
          <div className="detail-note"><ShieldCheck size={17} /><span>Condition described as honestly as we can manage, wrapped with care, and a 14-day window to send it back if it isn't right.</span></div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="related-section">
          <div className="home-section-head"><div><h2 className="display section-title">More {product.category.toLowerCase()}</h2></div></div>
          <div className="product-grid">{related.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div>
        </section>
      )}
    </div></main>
  );
}

function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, notify, placeOrder, lastOrder } = useStore();
  const [form, setForm] = useState({ customerName: "", email: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const items = cart.map((item) => ({ ...item, product: PRODUCTS.find((product) => product.id === item.productId)! })).filter((item) => item.product);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 0 && subtotal < 100 ? 6 : 0;
  const total = subtotal + shipping;
  const onChange = (field: keyof typeof form, value: string) => { setForm((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: "" })); };
  const submitOrder = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.customerName.trim()) nextErrors.customerName = "Please add your name.";
    if (!form.email.includes("@")) nextErrors.email = "Enter a valid email.";
    if (!form.address.trim()) nextErrors.address = "Please add a delivery address.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    placeOrder(form);
  };
  if (lastOrder && cart.length === 0) return <main className="page"><div className="container"><div className="confirmation"><div className="confirmation-mark"><Check size={28} /></div><div className="eyebrow">Order confirmed</div><h1 className="display">Found a good home.</h1><p>Thanks, {lastOrder.customerName.split(" ")[0]}. We've got your order and will send a note to {lastOrder.email} once it's wrapped and on its way.</p><div className="order-number" data-testid="text-order-number">{lastOrder.id}</div><br /><Link className="button button-primary" href="/store" data-testid="link-confirmation-shop">Keep browsing</Link></div></div></main>;
  if (!items.length) return <main className="page"><div className="container"><div className="page-heading"><div><h1 className="display">Your bag is quiet.</h1></div></div><div className="empty-state"><ShoppingBag size={30} /><h2>Nothing here yet</h2><p>The good stuff is waiting when you are.</p><Link className="button button-coral" href="/store" data-testid="link-empty-cart-shop">Browse the shelf</Link></div></div></main>;
  return (
    <main className="page"><div className="container">
      <div className="page-heading"><div><h1 className="display">Your bag.</h1></div><p>{items.length} {items.length === 1 ? "piece" : "pieces"} selected. We pack from a small studio, by hand.</p></div>
      <div className="cart-layout">
        <section className="cart-panel"><div className="panel-heading"><h2>Selected pieces</h2><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span><button className="button button-quiet" onClick={() => { clearCart(); notify("Your bag has been cleared"); }} data-testid="button-clear-cart">Clear bag</button></div></div>
          {items.map(({ product, quantity }) => <div className="cart-row" key={product.id} data-testid={`row-cart-${product.id}`}><div className={`cart-row-visual ${product.visual}`}><img src={`${product.image}?auto=format&fit=crop&w=200&q=80`} alt={product.name} /></div><div className="cart-row-copy"><strong>{product.name}</strong><span>{product.category} / {money(product.price)} each</span></div><div className="cart-row-right"><div className="qty-control"><button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label={`Decrease ${product.name}`} data-testid={`button-cart-minus-${product.id}`}><Minus size={12} /></button><span data-testid={`text-cart-quantity-${product.id}`}>{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label={`Increase ${product.name}`} data-testid={`button-cart-plus-${product.id}`}><Plus size={12} /></button></div><span className="cart-row-price">{money(product.price * quantity)}</span><button className="remove-button" onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`} data-testid={`button-remove-${product.id}`}><Trash2 size={15} /></button></div></div>)}
        </section>
        <section className="checkout-panel"><div className="panel-heading"><h2>Checkout</h2><span>secure & simple</span></div>
          <div className="summary-lines"><div className="summary-line"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="summary-line"><span>Shipping</span><strong>{shipping === 0 ? "Free" : money(shipping)}</strong></div></div><div className="summary-total"><span>Total</span><strong data-testid="text-cart-total">{money(total)}</strong></div>
          <form className="checkout-form" onSubmit={submitOrder} noValidate>
            <div className="field"><label htmlFor="customer-name">Name</label><input id="customer-name" value={form.customerName} onChange={(event) => onChange("customerName", event.target.value)} placeholder="Your full name" data-testid="input-checkout-name" />{errors.customerName && <span className="field-error">{errors.customerName}</span>}</div>
            <div className="field"><label htmlFor="customer-email">Email</label><input id="customer-email" type="email" value={form.email} onChange={(event) => onChange("email", event.target.value)} placeholder="you@example.com" data-testid="input-checkout-email" />{errors.email && <span className="field-error">{errors.email}</span>}</div>
            <div className="field"><label htmlFor="customer-address">Delivery address</label><textarea id="customer-address" value={form.address} onChange={(event) => onChange("address", event.target.value)} placeholder="Where should we send it?" data-testid="input-checkout-address" />{errors.address && <span className="field-error">{errors.address}</span>}</div>
            <div className="checkout-note"><Truck size={15} /><span>Free shipping on orders over $100. Most pieces leave the studio within two working days.</span></div>
            <button className="button button-coral" type="submit" data-testid="button-place-order">Place order <ArrowRight size={15} /></button>
          </form>
        </section>
      </div>
    </div></main>
  );
}

function NotFound() {
  return <main className="page"><div className="container"><div className="empty-state"><Package size={30} /><h2>That page wandered off.</h2><p>The object you are looking for is not in this collection.</p><Link className="button button-primary" href="/" data-testid="link-not-found-home">Back home</Link></div></div></main>;
}

function Footer() {
  const { notify } = useStore();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo" data-testid="link-footer-home"><span className="logo-mark"><Package size={17} strokeWidth={2.5} /></span><span>deskfolk</span></Link>
          <p>Secondhand home décor and vintage jewelry, chosen one piece at a time. Nothing warehouse-bought, nothing restocked.</p>
          <div className="footer-socials">
            <button type="button" aria-label="Instagram" onClick={() => notify("Follow us @deskfolk — link coming soon")} data-testid="button-social-instagram"><AtSign size={16} /></button>
          </div>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link href="/store">Shop all</Link>
          <Link href="/store?category=Decor">Decor</Link>
          <Link href="/store?category=Jewelry">Jewelry</Link>
          <Link href="/store?category=Lighting">Lighting</Link>
          <Link href="/store?category=Textiles">Textiles</Link>
        </div>
        <div className="footer-col">
          <h4>Help</h4>
          <button type="button" onClick={() => notify("Shipping: most orders leave within 2 working days")}>Shipping</button>
          <button type="button" onClick={() => notify("Returns: 14-day return window on every order")}>Returns</button>
          <button type="button" onClick={() => notify("Every condition rating is checked by us before it's listed")}>Condition guide</button>
          <button type="button" onClick={() => notify("Reach us any time at hello@deskfolk.example")}>Contact us</button>
        </div>
        <div className="footer-col footer-col-trust">
          <h4>Why deskfolk</h4>
          <span><ShieldCheck size={14} /> Condition verified by us</span>
          <span><RotateCcw size={14} /> 14-day returns</span>
          <span><CreditCard size={14} /> Secure checkout</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 deskfolk / secondhand décor & jewelry.</span>
        <span>Small shop. One shelf at a time.</span>
      </div>
    </footer>
  );
}

function AppShell() {
  return <div className="site-shell"><Header /><Switch><Route path="/" component={HomePage} /><Route path="/store" component={StorePage} /><Route path="/products/:id" component={ProductPage} /><Route path="/cart" component={CartPage} /><Route component={NotFound} /></Switch><Footer /><Toast /></div>;
}

function App() {
  return <StoreProvider><AppShell /></StoreProvider>;
}

export default App;
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type Watch = {
  id: string;
  brand: string;
  model: string;
  ref: string;
  category: string;
  price: number;
  condition: string;
  year: string;
  box: boolean;
  papers: boolean;
  description: string;
  status: string;
  images: string[];
  featured: boolean;
  dial_color?: string;
  case_material?: string;
  bracelet_material?: string;
  case_size?: string;
  movement?: string;
  material?: string;
  gemstone?: string;
  color?: string;
  hardware?: string;
  size?: string;
  serial_number?: string;
};

// Fallback placeholder image
const placeholder = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=85";

const getImg = (w: Watch) => w.images?.[0] || placeholder;
const isVideo = (url: string) => /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url);

const heroSlides = [
  { img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&q=85", headline: "Where Time", subheadline: "Becomes Art", sub: "Premium Watches & Fine Jewellery" },
  { img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1600&q=85", headline: "Crafted for the", subheadline: "Discerning Few", sub: "By Appointment Only — Hyderabad, Telangana, India" },
  { img: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=1600&q=85", headline: "A Legacy", subheadline: "On Your Wrist", sub: "Opening June 25, 2026" },
];

type CartItem = { watch: Watch; qty: number };
type PageType = "home" | "watches" | "jewellery" | "bags" | "accessories" | "sell" | "trade" | "contact" | "wishlist" | "cart" | "checkout" | "product" | "booking";
type DropdownItem = { label: string; page?: PageType; href?: string };

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [slide, setSlide] = useState(0);
  const [page, setPage] = useState<PageType>("home");
  const [filterBrand, setFilterBrand] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", email: "", interest: "Buying a Watch", notes: "" });
  const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [allWatches, setAllWatches] = useState<Watch[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const navRef = useRef<HTMLElement>(null);

  // Fetch all products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("products")
          .select("*")
          .eq("status", "available")
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });
        if (!error && data) setAllWatches(data);
      } catch (e) {
        console.error("Failed to fetch products:", e);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { document.body.style.overflow = (menuOpen || cartOpen || searchOpen) ? "hidden" : ""; }, [menuOpen, cartOpen, searchOpen]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch booked slots when booking page is open and month changes
  useEffect(() => {
    if (page !== "booking") return;
    const fetchBookedSlots = async () => {
      setSlotsLoading(true);
      try {
        const month = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
        const res = await fetch(`/api/booking?month=${month}`);
        const data = await res.json();
        setBookedSlots(data.bookings || []);
      } catch {
        setBookedSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchBookedSlots();
  }, [page, calMonth, calYear]);

  const goTo = (p: PageType, watch?: Watch) => {
    if (p === "product" && watch) { setSelectedWatch(watch); setActiveImgIdx(0); }
    setPage(p); setMenuOpen(false); setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleWishlist = (id: string) =>
    setWishlist(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);

  const addToCart = (watch: Watch) => {
    setCart(prev => {
      const ex = prev.find(i => i.watch.id === watch.id);
      if (ex) return prev.map(i => i.watch.id === watch.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { watch, qty: 1 }];
    });
    setAddedId(watch.id);
    setTimeout(() => setAddedId(null), 1800);
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.watch.id !== id));
  const cartTotal = cart.reduce((s, i) => s + i.watch.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const brands = ["All", ...Array.from(new Set(allWatches.map(w => w.brand))).sort()];
  const filteredWatches = filterBrand === "All" ? allWatches.filter(w => w.category === "watches") : allWatches.filter(w => w.brand === filterBrand && w.category === "watches");
  const searchResults = searchQuery.trim().length > 1
    ? allWatches.filter(w =>
        `${w.brand} ${w.model} ${w.ref} ${w.condition}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const featuredWatches = allWatches.filter(w => w.featured).length > 0
    ? allWatches.filter(w => w.featured)
    : allWatches.slice(0, 8);

  const [watchIdx, setWatchIdx] = useState(0);
  const watchesPerPage = 4;
  const totalWatchPages = Math.ceil(featuredWatches.length / watchesPerPage);
  const visibleWatches = featuredWatches.slice(watchIdx * watchesPerPage, (watchIdx + 1) * watchesPerPage);
  useEffect(() => {
    const id = setInterval(() => setWatchIdx(p => (p + 1) % totalWatchPages), 4000);
    return () => clearInterval(id);
  }, [totalWatchPages]);

  const shopItems: DropdownItem[] = [
    { label: "All Watches", page: "watches" },
    { label: "Jewellery", page: "jewellery" },
    { label: "Bags", page: "bags" },
    { label: "Accessories", page: "accessories" },
    { label: "New Arrivals", page: "watches" },
  ];
  const sellItems = [
    { label: "How It Works", page: "sell" as PageType },
  ];
  const tradeItems = [
    { label: "How It Works", page: "trade" as PageType },
  ];

  const WatchCard = ({ w, showEnquire = false }: { w: Watch; showEnquire?: boolean }) => (
    <div className="watch-card">
      <div className="watch-img-wrap" onClick={() => goTo("product", w)}>
        <img src={getImg(w)} alt={`${w.brand} ${w.model}`} />
        <span className={`watch-status${w.status === "Sold" ? " sold" : ""}`}>{w.status}</span>
        <button className="wishlist-btn" onClick={e => { e.stopPropagation(); toggleWishlist(w.id); }}>
          {wishlist.includes(w.id) ? "♥" : "♡"}
        </button>
        {addedId === w.id && <div className="added-toast">Added to cart ✓</div>}
      </div>
      <span className="watch-brand">{w.brand}</span>
      <span className="watch-model" onClick={() => goTo("product", w)} style={{cursor:"pointer"}}>{w.model}</span>
      <span className="watch-ref">{w.ref}</span>
      <span className="watch-price">{fmt(w.price)}</span>
      <div className="card-actions">
        <button className="btn-cart" onClick={() => addToCart(w)}>Add to Cart</button>
        {showEnquire && <a href={`mailto:info@chronovian.com?subject=Enquiry: ${w.brand} ${w.model}`} className="enquire-btn">Enquire</a>}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #B8935A; --gold-light: #D4AA78;
          --black: #0A0A0A; --gray-mid: #6B6B6B; --gray-light: #ADADAD;
          --gray-pale: #F5F3F0; --white: #FFFFFF; --border: rgba(0,0,0,0.09);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--white); color: var(--black); font-family: 'Jost', sans-serif; font-weight: 300; overflow-x: hidden; }

        /* NAV */
        nav { position: sticky; top: 0; z-index: 200; background: rgba(255,255,255,0.97); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); padding: 0 2.5rem; height: 62px; display: flex; align-items: center; justify-content: space-between; transition: box-shadow 0.3s; }
        nav.scrolled { box-shadow: 0 1px 16px rgba(0,0,0,0.07); }
        .nav-left, .nav-right { display: flex; align-items: center; gap: 1.75rem; flex: 1; }
        .nav-right { justify-content: flex-end; }
        .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 400; letter-spacing: 0.22em; color: var(--black); text-transform: uppercase; cursor: pointer; white-space: nowrap; flex-shrink: 0; background: none; border: none; }
        .nav-icon-btn { background: none; border: none; cursor: pointer; color: var(--black); font-size: 1rem; display: flex; align-items: center; transition: color 0.2s; text-decoration: none; position: relative; }
        .nav-icon-btn:hover { color: var(--gold); }
        .nav-badge { position: absolute; top: -6px; right: -8px; background: var(--gold); color: white; font-size: 0.45rem; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 500; }
        .nav-link { font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); text-decoration: none; background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 300; transition: color 0.2s; white-space: nowrap; padding: 0; }
        .nav-link:hover, .nav-link.active { color: var(--gold); }

        /* DROPDOWN */
        .nav-dropdown-wrap { position: relative; display: flex; align-items: center; }
        .nav-dropdown-trigger { font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 300; transition: color 0.2s; display: flex; align-items: center; gap: 0.35rem; padding: 0; white-space: nowrap; height: 62px; }
        .nav-dropdown-trigger:hover, .nav-dropdown-trigger.open { color: var(--gold); }
        .nav-dropdown-trigger svg { transition: transform 0.25s; }
        .nav-dropdown-trigger.open svg { transform: rotate(180deg); }
        .nav-dropdown { position: absolute; top: 62px; left: 50%; transform: translateX(-50%) translateY(-6px); background: white; border: 1px solid var(--border); border-top: 2px solid var(--gold); min-width: 200px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); opacity: 0; pointer-events: none; transition: opacity 0.2s, transform 0.2s; z-index: 300; }
        .nav-dropdown.open { opacity: 1; pointer-events: all; transform: translateX(-50%) translateY(0); }
        .nav-dropdown-item { display: block; width: 100%; padding: 0.85rem 1.5rem; font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--black); text-decoration: none; background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 300; text-align: left; transition: color 0.2s, background 0.2s; border-bottom: 1px solid var(--border); white-space: nowrap; }
        .nav-dropdown-item:last-child { border-bottom: none; }
        .nav-dropdown-item:hover { color: var(--gold); background: var(--gray-pale); }

        /* MOBILE */
        .mobile-hamburger { display: none; background: none; border: none; cursor: pointer; flex-direction: column; gap: 5px; padding: 6px; }
        .mobile-hamburger span { display: block; width: 20px; height: 1px; background: var(--black); transition: all 0.3s; }
        .mobile-hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .mobile-hamburger.open span:nth-child(2) { opacity: 0; }
        .mobile-hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
        .mobile-menu { display: none; position: fixed; inset: 0; top: 62px; background: var(--white); z-index: 150; flex-direction: column; padding: 1.5rem; overflow-y: auto; border-top: 1px solid var(--border); }
        .mobile-menu.open { display: flex; }
        .mobile-section { border-bottom: 1px solid var(--border); }
        .mobile-section-trigger { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 300; color: var(--black); background: none; border: none; cursor: pointer; width: 100%; }
        .mobile-section-trigger svg { transition: transform 0.25s; }
        .mobile-section-trigger.open svg { transform: rotate(180deg); }
        .mobile-sub { display: none; flex-direction: column; padding-bottom: 0.75rem; }
        .mobile-sub.open { display: flex; }
        .mobile-sub-item { padding: 0.55rem 1rem; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray-mid); background: none; border: none; cursor: pointer; text-align: left; font-family: 'Jost', sans-serif; text-decoration: none; transition: color 0.2s; }
        .mobile-sub-item:hover { color: var(--gold); }
        .mobile-plain { display: block; padding: 1rem 0; font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 300; color: var(--black); text-decoration: none; background: none; border: none; border-bottom: 1px solid var(--border); cursor: pointer; text-align: left; width: 100%; transition: color 0.2s; }
        .mobile-plain:hover { color: var(--gold); }
        @media (max-width: 900px) {
          .nav-left .nav-dropdown-wrap, .nav-left .nav-link, .nav-right .nav-link { display: none; }
          .nav-right .nav-icon-btn { display: none; }
          .mobile-hamburger { display: flex !important; }
          .nav-right .nav-icon-btn.always-show { display: flex; }
          #mobile-search-btn { display: flex !important; }
        }

        /* LOADING SKELETON */
        .skeleton { background: linear-gradient(90deg, #f0ede9 25%, #e8e4df 50%, #f0ede9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-card { display: flex; flex-direction: column; gap: 0.75rem; }
        .skeleton-img { aspect-ratio: 3/4; border-radius: 0; }
        .skeleton-line { height: 12px; border-radius: 2px; }

        /* SEARCH OVERLAY */
        .search-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.98); backdrop-filter: blur(12px); z-index: 500; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
        .search-overlay.open { opacity: 1; pointer-events: all; }
        .search-overlay-header { padding: 1.5rem 2.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 1.25rem; }
        .search-input-wrap { flex: 1; display: flex; align-items: center; gap: 1rem; }
        .search-input-icon { color: var(--gray-mid); flex-shrink: 0; }
        .search-input { flex: 1; font-family: 'Playfair Display', serif; font-size: clamp(1.2rem, 3vw, 1.8rem); font-weight: 300; border: none; outline: none; background: none; color: var(--black); }
        .search-input::placeholder { color: var(--gray-light); }
        .search-close { background: none; border: none; cursor: pointer; color: var(--gray-mid); font-size: 1.5rem; line-height: 1; padding: 0.25rem; transition: color 0.2s; flex-shrink: 0; }
        .search-close:hover { color: var(--black); }
        .search-body { flex: 1; overflow-y: auto; padding: 2rem 2.5rem; }
        .search-hint { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray-light); text-align: center; margin-top: 3rem; }
        .search-count { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray-mid); margin-bottom: 2rem; }
        .search-results-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .search-no-results { text-align: center; padding: 3rem 0; }
        .search-no-results p { font-size: 0.82rem; color: var(--gray-mid); margin-top: 0.5rem; }
        .search-quick-brands { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 2rem; }
        .search-quick-label { font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray-light); margin-bottom: 0.75rem; display: block; }
        .search-brand-pill { padding: 0.5rem 1.25rem; border: 1px solid var(--border); background: none; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--black); transition: all 0.2s; }
        .search-brand-pill:hover { background: var(--black); color: white; border-color: var(--black); }
        @media (max-width: 768px) { .search-results-grid { grid-template-columns: repeat(2, 1fr); } .search-overlay-header { padding: 1.25rem; } .search-body { padding: 1.5rem; } }
        .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 400; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        .cart-overlay.open { opacity: 1; pointer-events: all; }
        .cart-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 420px; max-width: 100vw; background: white; z-index: 401; transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; }
        .cart-drawer.open { transform: translateX(0); }
        .cart-drawer-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .cart-drawer-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 400; letter-spacing: 0.08em; }
        .cart-close { background: none; border: none; cursor: pointer; font-size: 1.4rem; color: var(--gray-mid); line-height: 1; padding: 0; }
        .cart-items { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .cart-item { display: flex; gap: 1rem; align-items: flex-start; }
        .cart-item-img { width: 72px; height: 88px; object-fit: cover; background: var(--gray-pale); flex-shrink: 0; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-brand { font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 0.2rem; }
        .cart-item-model { font-family: 'Playfair Display', serif; font-size: 0.9rem; display: block; margin-bottom: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cart-item-price { font-size: 0.82rem; color: var(--black); font-weight: 400; display: block; margin-bottom: 0.5rem; }
        .cart-item-remove { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-mid); background: none; border: 1px solid var(--border); cursor: pointer; padding: 0.3rem 0.65rem; transition: all 0.2s; font-family: 'Jost', sans-serif; }
        .cart-item-remove:hover { color: #c0392b; border-color: #c0392b; background: #fff5f5; }
        .cart-empty { text-align: center; padding: 3rem 0; color: var(--gray-mid); font-size: 0.82rem; }
        .cart-footer { padding: 1.5rem; border-top: 1px solid var(--border); }
        .cart-subtotal { display: flex; justify-content: space-between; margin-bottom: 1.25rem; }
        .cart-subtotal-label { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray-mid); }
        .cart-subtotal-value { font-family: 'Playfair Display', serif; font-size: 1.1rem; }
        .cart-cta { display: flex; flex-direction: column; gap: 0.6rem; }

        /* HERO */
        .hero { position: relative; height: calc(100svh - 62px); min-height: 500px; overflow: hidden; background: #111; }
        .hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease; }
        .hero-slide.active { opacity: 1; }
        .hero-slide img { width: 100%; height: 100%; object-fit: cover; opacity: 0.72; }
        .hero-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%); }
        .hero-content { position: absolute; bottom: 3.5rem; left: 3rem; right: 3rem; color: white; }
        .hero-eyebrow { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.65); margin-bottom: 1rem; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 6vw, 5.5rem); font-weight: 300; line-height: 1.1; margin-bottom: 0.4rem; }
        .hero-title em { font-style: italic; color: #D4AA78; }
        .hero-sub { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-top: 0.75rem; }
        .hero-dots { position: absolute; bottom: 2rem; right: 3rem; display: flex; gap: 0.5rem; }
        .hero-dot { width: 20px; height: 1px; background: rgba(255,255,255,0.35); cursor: pointer; transition: background 0.3s, width 0.3s; border: none; padding: 0; }
        .hero-dot.active { background: white; width: 36px; }

        /* SECTIONS */
        .section-header { text-align: center; margin-bottom: 3rem; }
        .section-eyebrow { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.75rem; display: block; }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 300; line-height: 1.25; }
        .section-title em { font-style: italic; }
        .gold-rule { width: 32px; height: 1px; background: var(--gold); margin: 1.25rem auto 0; }

        /* WATCH CARDS */
        .featured { padding: 5rem 2.5rem; max-width: 1300px; margin: 0 auto; }
        .featured-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .watch-card { cursor: default; }
        .watch-img-wrap { position: relative; overflow: hidden; background: var(--gray-pale); aspect-ratio: 3/4; margin-bottom: 1rem; cursor: pointer; }
        .watch-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .watch-card:hover .watch-img-wrap img { transform: scale(1.04); }
        .watch-status { position: absolute; top: 1rem; left: 1rem; font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.3rem 0.7rem; background: white; color: var(--black); }
        .watch-status.sold { background: var(--black); color: white; }
        .watch-brand { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.25rem; display: block; }
        .watch-model { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 400; color: var(--black); display: block; margin-bottom: 0.2rem; }
        .watch-ref { font-size: 0.65rem; color: var(--gray-mid); display: block; margin-bottom: 0.4rem; }
        .watch-price { font-size: 0.88rem; font-weight: 400; color: var(--black); display: block; margin-bottom: 0.75rem; letter-spacing: 0.02em; }
        .wishlist-btn { position: absolute; top: 1rem; right: 1rem; background: white; border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; transition: transform 0.2s; z-index: 2; }
        .wishlist-btn:hover { transform: scale(1.15); }
        .added-toast { position: absolute; bottom: 0; left: 0; right: 0; background: var(--gold); color: white; text-align: center; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.5rem; }
        .card-actions { display: flex; flex-direction: column; gap: 0.5rem; }
        .btn-cart { width: 100%; padding: 0.65rem; font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase; background: var(--black); color: white; border: 1px solid var(--black); cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; }
        .btn-cart:hover { background: var(--gold); border-color: var(--gold); }
        .enquire-btn { display: block; width: 100%; padding: 0.6rem; font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase; background: none; border: 1px solid var(--border); color: var(--black); cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; text-align: center; text-decoration: none; }
        .enquire-btn:hover { border-color: var(--gold); color: var(--gold); }
        .featured-footer { text-align: center; margin-top: 3rem; }

        /* WATCHES PAGE */
        .watches-page { padding: 4rem 2.5rem; max-width: 1300px; margin: 0 auto; }
        .watches-page-header { margin-bottom: 3rem; }
        .filter-bar { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
        .filter-btn { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.6rem 1.5rem; border: 1px solid var(--border); background: none; cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; color: var(--black); }
        .filter-btn.active, .filter-btn:hover { background: var(--black); color: white; border-color: var(--black); }
        .watches-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }

        /* PRODUCT PAGE */
        .product-page { padding: 3rem 2.5rem; max-width: 1200px; margin: 0 auto; }
        .product-breadcrumb { font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-light); margin-bottom: 2.5rem; display: flex; gap: 0.5rem; align-items: center; }
        .product-breadcrumb button { background: none; border: none; cursor: pointer; color: var(--gray-light); font-family: 'Jost', sans-serif; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; transition: color 0.2s; padding: 0; }
        .product-breadcrumb button:hover { color: var(--gold); }
        .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; }
        .product-gallery { display: flex; flex-direction: column; gap: 1rem; }
        .product-img-main video { width: 100%; height: 100%; object-fit: cover; }
        .product-img-main { aspect-ratio: 3/4; background: var(--gray-pale); overflow: hidden; position: relative; cursor: zoom-in; }
        .product-img-main img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .product-img-main:hover img { transform: scale(1.03); }
        .gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); background: white; border: none; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s; z-index: 2; }
        .gallery-nav:hover { background: var(--gold); color: white; }
        .gallery-nav-prev { left: 0.75rem; }
        .gallery-nav-next { right: 0.75rem; }
        .gallery-counter { position: absolute; bottom: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.5); color: white; font-size: 0.6rem; letter-spacing: 0.1em; padding: 0.25rem 0.6rem; }
        .product-thumbs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem; }
        .product-thumbs::-webkit-scrollbar { height: 2px; }
        .product-thumbs::-webkit-scrollbar-track { background: var(--gray-pale); }
        .product-thumbs::-webkit-scrollbar-thumb { background: var(--gold); }
        .product-thumb { width: 64px; height: 72px; flex-shrink: 0; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; background: var(--gray-pale); }
        .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .product-thumb.active { border-color: var(--gold); }
        .product-thumb:hover { border-color: var(--gray-light); }
        .product-info { display: flex; flex-direction: column; gap: 1.25rem; }
        .product-brand { font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); }
        .product-model { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 2.5vw, 2.2rem); font-weight: 300; line-height: 1.2; }
        .product-ref { font-size: 0.72rem; color: var(--gray-mid); }
        .product-price { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 300; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1rem 0; }
        .product-desc { font-size: 0.82rem; line-height: 2; color: var(--gray-mid); }
        .product-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem 1.5rem; }
        .product-spec { display: flex; flex-direction: column; gap: 0.2rem; padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
        .product-spec-label { font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray-light); }
        .product-spec-value { font-size: 0.8rem; color: var(--black); }
        .product-actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; }
        .btn-buynow { width: 100%; padding: 1rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; background: var(--gold); color: white; border: none; cursor: pointer; font-family: 'Jost', sans-serif; transition: background 0.2s; }
        .btn-buynow:hover { background: var(--gold-light); }
        .btn-addcart { width: 100%; padding: 1rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; background: var(--black); color: white; border: 1px solid var(--black); cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; }
        .btn-addcart:hover { background: white; color: var(--black); }
        .btn-enquire-full { width: 100%; padding: 1rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; background: none; color: var(--black); border: 1px solid var(--border); cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; text-align: center; text-decoration: none; display: block; }
        .btn-enquire-full:hover { border-color: var(--gold); color: var(--gold); }
        .product-wishlist { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-mid); transition: color 0.2s; padding: 0; }
        .product-wishlist:hover { color: var(--gold); }

        /* CART PAGE */
        .cart-page { padding: 4rem 2.5rem; max-width: 1200px; margin: 0 auto; min-height: 60vh; }
        .cart-page-grid { display: grid; grid-template-columns: 1fr 360px; gap: 4rem; margin-top: 3rem; }
        .cart-page-items { display: flex; flex-direction: column; gap: 0; }
        .cart-page-item { display: grid; grid-template-columns: 100px 1fr auto; gap: 1.5rem; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid var(--border); }
        .cart-page-img { aspect-ratio: 3/4; object-fit: cover; background: var(--gray-pale); width: 100%; }
        .cart-page-info { display: flex; flex-direction: column; gap: 0.4rem; }
        .cart-page-remove { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-mid); background: none; border: 1px solid var(--border); cursor: pointer; font-family: 'Jost', sans-serif; margin-top: 0.5rem; padding: 0.35rem 0.75rem; transition: all 0.2s; width: fit-content; }
        .cart-page-remove:hover { color: #c0392b; border-color: #c0392b; background: #fff5f5; }
        .cart-page-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
        .cart-page-price { font-family: 'Playfair Display', serif; font-size: 1rem; white-space: nowrap; }
        .cart-page-remove-icon { background: none; border: none; cursor: pointer; color: var(--gray-light); padding: 0.4rem; transition: color 0.2s; display: flex; align-items: center; }
        .cart-page-remove-icon:hover { color: #c0392b; }
        .order-summary { background: var(--gray-pale); padding: 2rem; height: fit-content; position: sticky; top: 80px; }
        .summary-title { font-family: 'Playfair Display', serif; font-size: 1rem; margin-bottom: 1.5rem; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--gray-mid); margin-bottom: 0.75rem; }
        .summary-total { display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 0.5rem; font-weight: 400; }
        .summary-total-label { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; }
        .summary-total-value { font-family: 'Playfair Display', serif; font-size: 1.2rem; }
        .cart-empty-page { text-align: center; padding: 5rem 0; }
        .cart-empty-page p { color: var(--gray-mid); font-size: 0.82rem; margin: 1rem 0 2rem; }

        /* CHECKOUT PAGE */
        .checkout-page { padding: 4rem 2.5rem; max-width: 1100px; margin: 0 auto; }
        .checkout-grid { display: grid; grid-template-columns: 1fr 380px; gap: 4rem; margin-top: 3rem; }
        .checkout-section { margin-bottom: 2.5rem; }
        .checkout-section-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 400; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .form-label { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray-mid); }
        .form-input, .form-select, .form-textarea { background: var(--gray-pale); border: 1px solid var(--border); padding: 0.85rem 1rem; font-family: 'Jost', sans-serif; font-size: 0.8rem; color: var(--black); outline: none; transition: border-color 0.2s; width: 100%; font-weight: 300; }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--gold); }
        .delivery-options { display: flex; flex-direction: column; gap: 0.75rem; }
        .delivery-option { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; border: 1px solid var(--border); cursor: pointer; transition: border-color 0.2s; }
        .delivery-option.selected { border-color: var(--gold); background: #fdf9f4; }
        .delivery-option input { accent-color: var(--gold); }
        .delivery-option-info { flex: 1; }
        .delivery-option-name { font-size: 0.78rem; font-weight: 400; }
        .delivery-option-sub { font-size: 0.65rem; color: var(--gray-mid); margin-top: 0.15rem; }
        .delivery-option-price { font-size: 0.78rem; font-weight: 400; }
        .payment-methods { display: flex; flex-direction: column; gap: 0.75rem; }
        .payment-method { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; border: 1px solid var(--border); cursor: pointer; transition: border-color 0.2s; }
        .payment-method.selected { border-color: var(--gold); background: #fdf9f4; }
        .payment-method input { accent-color: var(--gold); }
        .payment-method-label { font-size: 0.78rem; }
        .payment-method-badges { display: flex; gap: 0.4rem; margin-left: auto; }
        .pm-badge { padding: 0.15rem 0.5rem; border-radius: 3px; font-size: 0.5rem; font-weight: 500; }
        .checkout-summary { background: var(--gray-pale); padding: 2rem; height: fit-content; position: sticky; top: 80px; }
        .checkout-item-row { display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid var(--border); }
        .checkout-item-img { width: 60px; height: 72px; object-fit: cover; background: white; flex-shrink: 0; }
        .checkout-item-info { flex: 1; }
        .checkout-item-brand { font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); display: block; }
        .checkout-item-model { font-family: 'Playfair Display', serif; font-size: 0.82rem; display: block; }
        .checkout-item-price { font-size: 0.75rem; font-weight: 400; white-space: nowrap; }
        .place-order-btn { width: 100%; padding: 1.1rem; font-size: 0.6rem; letter-spacing: 0.22em; text-transform: uppercase; background: var(--gold); color: white; border: none; cursor: pointer; font-family: 'Jost', sans-serif; transition: background 0.2s; margin-top: 1.5rem; }
        .place-order-btn:hover { background: var(--gold-light); }
        .secure-note { font-size: 0.58rem; color: var(--gray-light); text-align: center; margin-top: 0.75rem; letter-spacing: 0.1em; }

        /* ORDER SUCCESS */
        .order-success { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2.5rem; gap: 1.25rem; }
        .order-success-icon { font-size: 3rem; margin-bottom: 0.5rem; }

        /* PLACEHOLDER PAGES */
        .placeholder-page { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2.5rem; gap: 1.5rem; }
        .placeholder-page p { font-size: 0.82rem; color: var(--gray-mid); line-height: 1.9; max-width: 440px; }

        /* SELL / TRADE */
        .sell-page { padding: 5rem 2.5rem; max-width: 900px; margin: 0 auto; }
        .sell-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin: 3rem 0; }
        .sell-step { text-align: center; padding: 2rem 1.5rem; border: 1px solid var(--border); }
        .sell-step-num { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: var(--gold); opacity: 0.5; display: block; margin-bottom: 1rem; }
        .sell-step h3 { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 400; margin-bottom: 0.6rem; }
        .sell-step p { font-size: 0.75rem; color: var(--gray-mid); line-height: 1.8; }

        /* WISHLIST */
        .wishlist-page { padding: 4rem 2.5rem; max-width: 1300px; margin: 0 auto; min-height: 60vh; }
        .wishlist-empty { text-align: center; padding: 5rem 0; }
        .wishlist-empty p { font-size: 0.82rem; color: var(--gray-mid); margin-top: 1rem; }

        /* CATEGORIES */
        .categories { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: #ddd; }
        .cat-card { position: relative; overflow: hidden; aspect-ratio: 16/10; cursor: pointer; }
        .cat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .cat-card:hover img { transform: scale(1.04); }
        .cat-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65) 100%); }
        .cat-content { position: absolute; bottom: 2rem; left: 2rem; color: white; }
        .cat-tag { font-size: 0.55rem; letter-spacing: 0.25em; text-transform: uppercase; color: #D4AA78; display: block; margin-bottom: 0.4rem; }
        .cat-name { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 300; display: block; margin-bottom: 0.75rem; }
        .cat-link { font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 1px; }
        .cat-card:hover .cat-link { color: #D4AA78; }

        /* ABOUT */
        .about-strip { padding: 5rem 2.5rem; max-width: 700px; margin: 0 auto; text-align: center; }
        .about-body { font-size: 0.88rem; line-height: 2; color: var(--gray-mid); margin: 1.5rem 0 2.5rem; }

        /* PILLARS */
        .pillars { background: var(--black); padding: 5rem 2.5rem; }
        .pillars-inner { max-width: 1100px; margin: 0 auto; }
        .pillars-inner .section-title { color: white; }
        .pillars-inner .section-eyebrow { color: #D4AA78; }
        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.08); margin-top: 3rem; }
        .pillar { padding: 2.5rem 2rem; background: var(--black); transition: background 0.3s; }
        .pillar:hover { background: #111; }
        .pillar-num { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--gold); opacity: 0.4; display: block; margin-bottom: 1.25rem; }
        .pillar-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 400; color: white; margin-bottom: 0.75rem; }
        .pillar-body { font-size: 0.75rem; line-height: 1.9; color: rgba(255,255,255,0.45); }

        /* CONTACT */
        .contact-page { min-height: 80vh; padding: 5rem 2.5rem; max-width: 900px; margin: 0 auto; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3.5rem; }
        .contact-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: flex-start; }
        .contact-item-icon { font-size: 1rem; color: var(--gold); flex-shrink: 0; margin-top: 2px; }
        .contact-item-text { font-size: 0.8rem; line-height: 1.7; color: var(--gray-mid); }
        .contact-item-text a { color: var(--black); text-decoration: none; transition: color 0.2s; }
        .contact-item-text a:hover { color: var(--gold); }
        .contact-item-label { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray-light); display: block; margin-bottom: 0.25rem; }
        .contact-form { display: flex; flex-direction: column; gap: 1rem; }

        /* BOOKING PAGE */
        .booking-page { padding: 4rem 2.5rem; max-width: 1000px; margin: 0 auto; }
        .booking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3.5rem; }
        .calendar-wrap { user-select: none; }
        .calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .calendar-month { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 400; }
        .calendar-nav { background: none; border: 1px solid var(--border); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--black); transition: all 0.2s; }
        .calendar-nav:hover { background: var(--black); color: white; border-color: var(--black); }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .calendar-day-name { text-align: center; font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray-light); padding: 0.5rem 0; }
        .calendar-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; color: var(--black); background: none; font-family: 'Jost', sans-serif; font-weight: 300; }
        .calendar-day:hover:not(.disabled):not(.past) { border-color: var(--gold); color: var(--gold); }
        .calendar-day.selected { background: var(--gold); color: white; border-color: var(--gold); }
        .calendar-day.today { border-color: var(--border); font-weight: 500; }
        .calendar-day.disabled, .calendar-day.past { color: var(--gray-light); cursor: default; pointer-events: none; }
        .calendar-day.empty { pointer-events: none; }
        .time-slots { margin-top: 2rem; }
        .time-slots-label { font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray-mid); margin-bottom: 1rem; display: block; }
        .time-slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
        .time-slot { padding: 0.6rem; font-size: 0.65rem; letter-spacing: 0.08em; border: 1px solid var(--border); background: none; cursor: pointer; font-family: 'Jost', sans-serif; color: var(--black); transition: all 0.2s; text-align: center; }
        .time-slot:hover:not(.unavailable) { border-color: var(--gold); color: var(--gold); }
        .time-slot.selected { background: var(--gold); color: white; border-color: var(--gold); }
        .time-slot.unavailable { background: var(--gray-pale); color: var(--gray-light); cursor: not-allowed; border-color: var(--border); text-decoration: line-through; }
        .booking-form { display: flex; flex-direction: column; gap: 1rem; }
        .booking-selected-slot { background: var(--gray-pale); border-left: 3px solid var(--gold); padding: 0.85rem 1.25rem; margin-bottom: 0.5rem; }
        .booking-selected-slot-label { font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 0.25rem; }
        .booking-selected-slot-value { font-family: 'Playfair Display', serif; font-size: 0.95rem; }
        .booking-success { text-align: center; padding: 3rem 0; }
        .booking-success-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 1.5rem; }
        @media (max-width: 768px) { .booking-grid { grid-template-columns: 1fr; gap: 2.5rem; } .time-slots-grid { grid-template-columns: repeat(4, 1fr); } }
        .btn-outline { display: inline-block; border: 1px solid var(--black); color: var(--black); text-decoration: none; padding: 0.8rem 2.5rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; transition: all 0.3s; background: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 300; }
        .btn-outline:hover { background: var(--black); color: white; }
        .btn-gold { display: inline-block; background: var(--gold); color: white; text-decoration: none; padding: 0.8rem 2.5rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; transition: background 0.3s; border: none; cursor: pointer; font-family: 'Jost', sans-serif; }
        .btn-gold:hover { background: var(--gold-light); }

        /* PAYMENT STRIP */
        .payment-strip { background: var(--gray-pale); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .payment-label { font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gray-light); }
        .payment-badge { padding: 0.3rem 0.7rem; border-radius: 3px; font-size: 0.58rem; font-weight: 500; letter-spacing: 0.04em; }

        /* FOOTER */
        footer { background: var(--gray-pale); border-top: 1px solid var(--border); padding: 3.5rem 2.5rem 2rem; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
        .footer-brand { font-family: 'Playfair Display', serif; font-size: 1.1rem; letter-spacing: 0.2em; color: var(--black); text-transform: uppercase; display: block; margin-bottom: 0.75rem; }
        .footer-tagline { font-size: 0.72rem; line-height: 1.8; color: var(--gray-mid); max-width: 220px; }
        .footer-col-title { font-size: 0.55rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--black); margin-bottom: 1.25rem; display: block; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.65rem; }
        .footer-links a, .footer-links button { color: var(--gray-mid); text-decoration: none; font-size: 0.75rem; transition: color 0.2s; background: none; border: none; cursor: pointer; padding: 0; text-align: left; font-family: 'Jost', sans-serif; font-weight: 300; }
        .footer-links a:hover, .footer-links button:hover { color: var(--gold); }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 1rem; }
        .footer-copy { font-size: 0.62rem; color: var(--gray-light); }
        .footer-social { display: flex; gap: 1.5rem; }
        .footer-social a { font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-mid); text-decoration: none; transition: color 0.2s; }
        .footer-social a:hover { color: var(--gold); }
        .whatsapp-fab { position: fixed; bottom: 1.5rem; right: 1.5rem; height: 48px; padding: 0 1.25rem; border-radius: 24px; background: #25D366; display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: white; box-shadow: 0 4px 16px rgba(37,211,102,0.35); z-index: 100; transition: transform 0.2s, box-shadow 0.2s; }
        .whatsapp-fab:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,211,102,0.45); }

        @media (max-width: 768px) {
          .featured-grid, .watches-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .categories { grid-template-columns: 1fr; }
          .pillars-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          .contact-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .hero-content { left: 1.5rem; right: 1.5rem; bottom: 2.5rem; }
          nav { padding: 0 1.25rem; }
          .sell-steps { grid-template-columns: 1fr; }
          .product-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .product-thumbs { gap: 0.4rem; }
          .cart-page-grid { grid-template-columns: 1fr; }
          .checkout-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .cart-drawer { width: 100vw; }
        }
      `}</style>

      {/* SEARCH OVERLAY */}
      <div className={`search-overlay${searchOpen ? " open" : ""}`}>
        <div className="search-overlay-header">
          <div className="search-input-wrap">
            <svg className="search-input-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              placeholder="Search by brand, model or reference…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus={searchOpen}
            />
          </div>
          <button className="search-close" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>×</button>
        </div>
        <div className="search-body">
          {searchQuery.trim().length === 0 && (
            <div>
              <span className="search-quick-label">Browse by brand</span>
              <div className="search-quick-brands">
                {["Rolex", "Audemars Piguet", "Patek Philippe"].map(b => (
                  <button key={b} className="search-brand-pill" onClick={() => {
                    setSearchOpen(false); setSearchQuery("");
                    setFilterBrand(b); goTo("watches");
                  }}>{b}</button>
                ))}
                <button className="search-brand-pill" onClick={() => {
                  setSearchOpen(false); setSearchQuery(""); goTo("watches");
                }}>All Watches</button>
              </div>
            </div>
          )}
          {searchQuery.trim().length > 1 && searchResults.length > 0 && (
            <div>
              <p className="search-count">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"</p>
              <div className="search-results-grid">
                {searchResults.map(w => (
                  <div className="watch-card" key={w.id}>
                    <div className="watch-img-wrap" onClick={() => { setSearchOpen(false); setSearchQuery(""); goTo("product", w); }}>
                      <img src={getImg(w)} alt={w.model} />
                      <span className="watch-status">{w.status}</span>
                      <button className="wishlist-btn" onClick={e => { e.stopPropagation(); toggleWishlist(w.id); }}>
                        {wishlist.includes(w.id) ? "♥" : "♡"}
                      </button>
                    </div>
                    <span className="watch-brand">{w.brand}</span>
                    <span className="watch-model" onClick={() => { setSearchOpen(false); setSearchQuery(""); goTo("product", w); }} style={{cursor:"pointer"}}>{w.model}</span>
                    <span className="watch-ref">{w.ref}</span>
                    <span className="watch-price">{fmt(w.price)}</span>
                    <div className="card-actions">
                      <button className="btn-cart" onClick={() => { addToCart(w); setSearchOpen(false); setSearchQuery(""); }}>Add to Cart</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {searchQuery.trim().length > 1 && searchResults.length === 0 && (
            <div className="search-no-results">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p>No results for "{searchQuery}"</p>
              <p style={{marginTop:"0.5rem",fontSize:"0.72rem"}}>Try searching by brand name, model, or reference number.</p>
            </div>
          )}
        </div>
      </div>

      {/* CART DRAWER */}
      <div className={`cart-overlay${cartOpen ? " open" : ""}`} onClick={() => setCartOpen(false)} />
      <div className={`cart-drawer${cartOpen ? " open" : ""}`}>
        <div className="cart-drawer-header">
          <span className="cart-drawer-title">Your Cart ({cartCount})</span>
          <button className="cart-close" onClick={() => setCartOpen(false)}>×</button>
        </div>
        <div className="cart-items">
          {cart.length === 0
            ? <div className="cart-empty">Your cart is empty</div>
            : cart.map(item => (
              <div className="cart-item" key={item.watch.id}>
                <img className="cart-item-img" src={getImg(item.watch)} alt={item.watch.model} />
                <div className="cart-item-info">
                  <span className="cart-item-brand">{item.watch.brand}</span>
                  <span className="cart-item-model">{item.watch.model}</span>
                  <span className="cart-item-price">{fmt(item.watch.price)}</span>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.watch.id)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Remove
                  </button>
                </div>
              </div>
            ))
          }
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span className="cart-subtotal-label">Subtotal</span>
              <span className="cart-subtotal-value">{fmt(cartTotal)}</span>
            </div>
            <div className="cart-cta">
              <button className="btn-gold" style={{width:"100%",textAlign:"center"}} onClick={() => { setCartOpen(false); goTo("checkout"); }}>Proceed to Checkout</button>
              <button className="btn-outline" style={{width:"100%",textAlign:"center"}} onClick={() => { setCartOpen(false); goTo("cart"); }}>View Cart</button>
            </div>
          </div>
        )}
      </div>

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""} ref={navRef}>
        <div className="nav-left">
          <button className={`mobile-hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
          <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} style={{display:"none",padding:"0 0.25rem"}} id="mobile-search-btn">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          {([
            { key: "shop", label: "Shop Now", items: shopItems },
            { key: "selltrade", label: "Sell / Trade", items: [
              { label: "Sell — How It Works", page: "sell" as PageType },
              { label: "Trade — How It Works", page: "trade" as PageType },
            ] as DropdownItem[] },
          ]).map(dd => (
            <div className="nav-dropdown-wrap" key={dd.key} onMouseEnter={() => setActiveDropdown(dd.key)} onMouseLeave={() => setActiveDropdown(null)}>
              <button className={`nav-dropdown-trigger${activeDropdown === dd.key ? " open" : ""}`}>
                {dd.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div className={`nav-dropdown${activeDropdown === dd.key ? " open" : ""}`}>
                {dd.items.map(item => (
                  "href" in item
                    ? <a key={item.label} className="nav-dropdown-item" href={item.href}>{item.label}</a>
                    : <button key={item.label} className="nav-dropdown-item" onClick={() => goTo(item.page!)}>{item.label}</button>
                ))}
              </div>
            </div>
          ))}
          <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} title="Search" style={{padding:"0 0.25rem"}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>

        <button className="nav-logo" onClick={() => goTo("home")}>Chronovian</button>

        <div className="nav-right">
          <button className={`nav-link${page === "contact" ? " active" : ""}`} onClick={() => goTo("contact")}>Contact</button>
          <button className={`nav-link${page === "booking" ? " active" : ""}`} onClick={() => goTo("booking")}>Book Appointment</button>
          <button className="nav-icon-btn always-show" onClick={() => goTo("wishlist")} title="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
          </button>
          <button className="nav-icon-btn always-show" onClick={() => setCartOpen(true)} title="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {([
          { key: "shop", label: "Shop Now", items: shopItems },
          { key: "selltrade", label: "Sell / Trade", items: [
            { label: "Sell — How It Works", page: "sell" as PageType },
            { label: "Trade — How It Works", page: "trade" as PageType },
          ] as DropdownItem[] },
        ]).map(dd => (
          <div className="mobile-section" key={dd.key}>
            <button className={`mobile-section-trigger${mobileExpanded === dd.key ? " open" : ""}`} onClick={() => setMobileExpanded(mobileExpanded === dd.key ? null : dd.key)}>
              {dd.label}
              <svg width="12" height="7" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className={`mobile-sub${mobileExpanded === dd.key ? " open" : ""}`}>
              {dd.items.map(item => (
                "href" in item
                  ? <a key={item.label} className="mobile-sub-item" href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
                  : <button key={item.label} className="mobile-sub-item" onClick={() => goTo(item.page!)}>{item.label}</button>
              ))}
            </div>
          </div>
        ))}
        <button className="mobile-plain" onClick={() => goTo("contact")}>Contact</button>
        <button className="mobile-plain" onClick={() => goTo("booking")}>Book Appointment</button>
        <button className="mobile-plain" onClick={() => { setMenuOpen(false); goTo("wishlist"); }}>Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</button>
        <button className="mobile-plain" onClick={() => { setMenuOpen(false); setCartOpen(true); }}>Cart {cartCount > 0 && `(${cartCount})`}</button>
      </div>

      {/* PRODUCT PAGE */}
      {page === "product" && selectedWatch && (
        <main>
          <div className="product-page">
            <div className="product-breadcrumb">
              <button onClick={() => goTo("home")}>Home</button>
              <span>›</span>
              <button onClick={() => goTo("watches")}>Watches</button>
              <span>›</span>
              <span style={{color:"var(--black)"}}>{selectedWatch.model}</span>
            </div>
            <div className="product-grid">
              <div className="product-gallery">
                <div className="product-img-main">
                  {(() => {
                    const currentMedia = selectedWatch.images?.[activeImgIdx] || getImg(selectedWatch);
                    return isVideo(currentMedia)
                      ? <video key={currentMedia} src={currentMedia} controls autoPlay muted playsInline style={{width:"100%",height:"100%",objectFit:"cover"}} />
                      : <img src={currentMedia} alt={`${selectedWatch.model} ${activeImgIdx + 1}`} />;
                  })()}
                  {selectedWatch.images?.length > 1 && (
                    <>
                      <button className="gallery-nav gallery-nav-prev" onClick={() => setActiveImgIdx(i => (i - 1 + selectedWatch.images.length) % selectedWatch.images.length)}>‹</button>
                      <button className="gallery-nav gallery-nav-next" onClick={() => setActiveImgIdx(i => (i + 1) % selectedWatch.images.length)}>›</button>
                      <span className="gallery-counter">{activeImgIdx + 1} / {selectedWatch.images.length}</span>
                    </>
                  )}
                </div>
                {selectedWatch.images?.length > 1 && (
                  <div className="product-thumbs">
                    {selectedWatch.images.map((media, i) => (
                      <div key={i} className={`product-thumb${activeImgIdx === i ? " active" : ""}`} onClick={() => setActiveImgIdx(i)}>
                        {isVideo(media)
                          ? <div style={{width:"100%",height:"100%",background:"#0A0A0A",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"1.2rem"}}>▶</div>
                          : <img src={media} alt={`${selectedWatch.model} view ${i + 1}`} />
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="product-info">
                <span className="product-brand">{selectedWatch.brand}</span>
                <h1 className="product-model">{selectedWatch.model}</h1>
                <span className="product-ref">{selectedWatch.ref}</span>
                <div className="product-price">{fmt(selectedWatch.price)}</div>
                <p className="product-desc">{selectedWatch.description}</p>
                <div className="product-specs">
                  {[
                    { label: "Condition", value: selectedWatch.condition },
                    { label: "Year", value: selectedWatch.year },
                    { label: "Box", value: selectedWatch.box ? "Included" : "Not included" },
                    { label: "Papers", value: selectedWatch.papers ? "Included" : "Not included" },
                    { label: "Status", value: selectedWatch.status },
                    { label: "Reference", value: selectedWatch.ref },
                    ...(selectedWatch.case_size ? [{ label: "Case Size", value: selectedWatch.case_size }] : []),
                    ...(selectedWatch.movement ? [{ label: "Movement", value: selectedWatch.movement }] : []),
                    ...(selectedWatch.dial_color ? [{ label: "Dial", value: selectedWatch.dial_color }] : []),
                    ...(selectedWatch.case_material ? [{ label: "Case", value: selectedWatch.case_material }] : []),
                    ...(selectedWatch.bracelet_material ? [{ label: "Bracelet", value: selectedWatch.bracelet_material }] : []),
                    ...(selectedWatch.material ? [{ label: "Material", value: selectedWatch.material }] : []),
                    ...(selectedWatch.gemstone ? [{ label: "Gemstone", value: selectedWatch.gemstone }] : []),
                    ...(selectedWatch.color ? [{ label: "Colour", value: selectedWatch.color }] : []),
                    ...(selectedWatch.hardware ? [{ label: "Hardware", value: selectedWatch.hardware }] : []),
                  ].filter(s => s.value).map(s => (
                    <div className="product-spec" key={s.label}>
                      <span className="product-spec-label">{s.label}</span>
                      <span className="product-spec-value">{s.value}</span>
                    </div>
                  ))}
                </div>
                <div className="product-actions">
                  <button className="btn-buynow" onClick={() => { addToCart(selectedWatch); setCartOpen(false); goTo("checkout"); }}>Buy Now</button>
                  <button className="btn-addcart" onClick={() => addToCart(selectedWatch)}>Add to Cart</button>
                  <a className="btn-enquire-full" href={`mailto:info@chronovian.com?subject=Enquiry: ${selectedWatch.brand} ${selectedWatch.model}`}>Enquire About This Watch</a>
                  <button className="product-wishlist" onClick={() => toggleWishlist(selectedWatch.id)}>
                    {wishlist.includes(selectedWatch.id) ? "♥ Saved to Wishlist" : "♡ Save to Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* WATCHES PAGE */}
      {page === "watches" && (
        <main>
          <div className="watches-page">
            <div className="watches-page-header">
              <span className="section-eyebrow">Our Collection</span>
              <h1 className="section-title">Watches</h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
              <div className="filter-bar">
                {brands.map(b => (
                  <button key={b} className={`filter-btn${filterBrand === b ? " active" : ""}`} onClick={() => setFilterBrand(b)}>{b}</button>
                ))}
              </div>
            </div>
            <div className="watches-grid">
              {productsLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div className="skeleton-card" key={i}>
                      <div className="skeleton skeleton-img" />
                      <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "40%" }} />
                    </div>
                  ))
                : filteredWatches.length === 0
                  ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem 0", color: "var(--gray-mid)", fontSize: "0.82rem" }}>
                      No watches available in this category yet.
                    </div>
                  : filteredWatches.map(w => <WatchCard key={w.id} w={w} showEnquire />)
              }
            </div>
          </div>
        </main>
      )}

      {/* CART PAGE */}
      {page === "cart" && (
        <main>
          <div className="cart-page">
            <span className="section-eyebrow">Your Selection</span>
            <h1 className="section-title">Shopping Cart</h1>
            <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
            {cart.length === 0
              ? <div className="cart-empty-page">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  <p>Your cart is empty.</p>
                  <button className="btn-outline" onClick={() => goTo("watches")}>Browse Watches</button>
                </div>
              : <div className="cart-page-grid">
                  <div className="cart-page-items">
                    {cart.map(item => (
                      <div className="cart-page-item" key={item.watch.id}>
                        <img className="cart-page-img" src={getImg(item.watch)} alt={item.watch.model} />
                        <div className="cart-page-info">
                          <span className="watch-brand">{item.watch.brand}</span>
                          <span className="watch-model">{item.watch.model}</span>
                          <span className="watch-ref">{item.watch.ref}</span>
                          <span style={{fontSize:"0.72rem",color:"var(--gray-mid)"}}>Condition: {item.watch.condition} · {item.watch.year}</span>
                          <button className="cart-page-remove" onClick={() => removeFromCart(item.watch.id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            Remove from cart
                          </button>
                        </div>
                        <div className="cart-page-right">
                          <span className="cart-page-price">{fmt(item.watch.price)}</span>
                          <button className="cart-page-remove-icon" onClick={() => removeFromCart(item.watch.id)} title="Remove">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-summary">
                    <div className="summary-title">Order Summary</div>
                    {cart.map(item => (
                      <div className="summary-row" key={item.watch.id}>
                        <span>{item.watch.model}</span>
                        <span>{fmt(item.watch.price)}</span>
                      </div>
                    ))}
                    <div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
                    <div className="summary-total">
                      <span className="summary-total-label">Total</span>
                      <span className="summary-total-value">{fmt(cartTotal)}</span>
                    </div>
                    <button className="btn-gold" style={{width:"100%",marginTop:"1.5rem",textAlign:"center"}} onClick={() => goTo("checkout")}>Proceed to Checkout</button>
                    <button className="btn-outline" style={{width:"100%",marginTop:"0.75rem",textAlign:"center"}} onClick={() => goTo("watches")}>Continue Shopping</button>
                  </div>
                </div>
            }
          </div>
        </main>
      )}

      {/* CHECKOUT PAGE */}
      {page === "checkout" && (
        <main>
          {orderPlaced
            ? <div className="order-success">
                <div className="order-success-icon">✓</div>
                <span className="section-eyebrow">Order Confirmed</span>
                <h1 className="section-title">Thank You for Your <em>Order</em></h1>
                <div className="gold-rule" />
                <p style={{fontSize:"0.82rem",color:"var(--gray-mid)",lineHeight:2,maxWidth:"440px",textAlign:"center"}}>Your order has been received. A Chronovian advisor will contact you within 24 hours to confirm details and arrange secure delivery or in-store collection.</p>
                <button className="btn-outline" onClick={() => { setOrderPlaced(false); setCart([]); goTo("home"); }}>Return Home</button>
              </div>
            : <div className="checkout-page">
                <span className="section-eyebrow">Secure Checkout</span>
                <h1 className="section-title">Complete Your <em>Order</em></h1>
                <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
                <div className="checkout-grid">
                  <div>
                    {/* CONTACT */}
                    <div className="checkout-section">
                      <div className="checkout-section-title">Contact Information</div>
                      <div className="form-row">
                        <div className="form-group"><label className="form-label">First Name</label><input className="form-input" type="text" placeholder="First name" /></div>
                        <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" type="text" placeholder="Last name" /></div>
                      </div>
                      <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="your@email.com" /></div>
                      <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" placeholder="+91 00000 00000" /></div>
                    </div>
                    {/* DELIVERY */}
                    <div className="checkout-section">
                      <div className="checkout-section-title">Delivery Method</div>
                      {[
                        { id: "home", name: "Home Delivery", sub: "Insured courier — 3 to 5 business days", price: "₹500" },
                        { id: "store", name: "In-Store Collection", sub: "Hyderabad boutique — by appointment only", price: "Free" },
                      ].map(opt => (
                        <div className="delivery-option selected" key={opt.id} style={{marginBottom:"0.5rem"}}>
                          <input type="radio" name="delivery" defaultChecked={opt.id === "home"} />
                          <div className="delivery-option-info">
                            <div className="delivery-option-name">{opt.name}</div>
                            <div className="delivery-option-sub">{opt.sub}</div>
                          </div>
                          <span className="delivery-option-price">{opt.price}</span>
                        </div>
                      ))}
                    </div>
                    {/* ADDRESS */}
                    <div className="checkout-section">
                      <div className="checkout-section-title">Shipping Address</div>
                      <div className="form-group"><label className="form-label">Address Line 1</label><input className="form-input" type="text" placeholder="House / flat / street" /></div>
                      <div className="form-group"><label className="form-label">Address Line 2</label><input className="form-input" type="text" placeholder="Area / locality (optional)" /></div>
                      <div className="form-row">
                        <div className="form-group"><label className="form-label">City</label><input className="form-input" type="text" placeholder="City" /></div>
                        <div className="form-group"><label className="form-label">PIN Code</label><input className="form-input" type="text" placeholder="PIN code" /></div>
                      </div>
                      <div className="form-group"><label className="form-label">State</label><select className="form-select"><option>Telangana</option><option>Andhra Pradesh</option><option>Maharashtra</option><option>Karnataka</option><option>Tamil Nadu</option><option>Delhi</option><option>Other</option></select></div>
                    </div>
                    {/* PAYMENT */}
                    <div className="checkout-section">
                      <div className="checkout-section-title">Payment Method</div>
                      <div className="payment-methods">
                        {[
                          { id: "upi", label: "UPI", badges: [{label:"UPI",bg:"#5F259F"},{label:"GPay",bg:"#4285F4"},{label:"PhonePe",bg:"#5F259F"}] },
                          { id: "card", label: "Credit / Debit Card", badges: [{label:"VISA",bg:"#1A1F71"},{label:"MC",bg:"#EB001B"},{label:"RuPay",bg:"#007A3D"}] },
                          { id: "netbanking", label: "Net Banking / NEFT", badges: [{label:"NEFT",bg:"#eee",color:"#333"}] },
                          { id: "emi", label: "EMI", badges: [{label:"EMI",bg:"#eee",color:"#333"}] },
                        ].map(pm => (
                          <div className="payment-method" key={pm.id} style={{marginBottom:"0.5rem"}}>
                            <input type="radio" name="payment" defaultChecked={pm.id === "upi"} />
                            <span className="payment-method-label">{pm.label}</span>
                            <div className="payment-method-badges">
                              {pm.badges.map(b => <span key={b.label} className="pm-badge" style={{background:b.bg,color:(b as any).color||"white"}}>{b.label}</span>)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p style={{fontSize:"0.65rem",color:"var(--gray-light)",marginTop:"1.25rem",lineHeight:1.7}}>Payment gateway integration coming soon. Placing this order will be confirmed by a Chronovian advisor who will arrange payment securely.</p>
                    </div>
                  </div>

                  {/* ORDER SUMMARY */}
                  <div className="checkout-summary">
                    <div className="summary-title">Order Summary</div>
                    {cart.map(item => (
                      <div className="checkout-item-row" key={item.watch.id}>
                        <img className="checkout-item-img" src={getImg(item.watch)} alt={item.watch.model} />
                        <div className="checkout-item-info">
                          <span className="checkout-item-brand">{item.watch.brand}</span>
                          <span className="checkout-item-model">{item.watch.model}</span>
                          <span style={{fontSize:"0.6rem",color:"var(--gray-light)"}}>{item.watch.ref}</span>
                        </div>
                        <span className="checkout-item-price">{fmt(item.watch.price)}</span>
                      </div>
                    ))}
                    <div style={{marginTop:"1rem"}}>
                      <div className="summary-row"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
                      <div className="summary-row"><span>Shipping</span><span>₹500</span></div>
                      <div className="summary-row"><span>Insurance</span><span>Included</span></div>
                    </div>
                    <div className="summary-total" style={{marginTop:"0.75rem"}}>
                      <span className="summary-total-label">Total</span>
                      <span className="summary-total-value">{fmt(cartTotal + 500)}</span>
                    </div>
                    <button className="place-order-btn" onClick={() => setOrderPlaced(true)}>Place Order</button>
                    <p className="secure-note">🔒 SSL Secured · All transactions encrypted</p>
                  </div>
                </div>
              </div>
          }
        </main>
      )}

      {/* JEWELLERY PAGE */}
      {page === "jewellery" && (
        <main>
          <div className="watches-page">
            <div className="watches-page-header">
              <span className="section-eyebrow">Fine Jewellery</span>
              <h1 className="section-title">Jewellery <em>Collection</em></h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
            </div>
            <div className="watches-grid">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div className="skeleton-card" key={i}>
                      <div className="skeleton skeleton-img" />
                      <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                    </div>
                  ))
                : allWatches.filter(w => w.category === "jewellery").length === 0
                  ? <div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem 0"}}>
                      <span className="section-eyebrow">Coming Soon</span>
                      <p style={{fontSize:"0.82rem",color:"var(--gray-mid)",marginTop:"1rem",lineHeight:1.9}}>Our jewellery collection is being curated. Contact us to enquire about specific pieces.</p>
                      <a href="mailto:enquiries@chronovian.com?subject=Jewellery Enquiry" className="btn-gold" style={{display:"inline-block",marginTop:"1.5rem"}}>Enquire Now</a>
                    </div>
                  : allWatches.filter(w => w.category === "jewellery").map(w => <WatchCard key={w.id} w={w} showEnquire />)
              }
            </div>
          </div>
        </main>
      )}

      {/* BAGS PAGE */}
      {page === "bags" && (
        <main>
          <div className="watches-page">
            <div className="watches-page-header">
              <span className="section-eyebrow">Luxury Bags</span>
              <h1 className="section-title">Bags <em>Collection</em></h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
            </div>
            <div className="watches-grid">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div className="skeleton-card" key={i}>
                      <div className="skeleton skeleton-img" />
                      <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                    </div>
                  ))
                : allWatches.filter(w => w.category === "bags").length === 0
                  ? <div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem 0"}}>
                      <span className="section-eyebrow">Coming Soon</span>
                      <p style={{fontSize:"0.82rem",color:"var(--gray-mid)",marginTop:"1rem",lineHeight:1.9}}>Our bags collection is being curated. Contact us to enquire about specific pieces.</p>
                      <a href="mailto:enquiries@chronovian.com?subject=Bags Enquiry" className="btn-gold" style={{display:"inline-block",marginTop:"1.5rem"}}>Enquire Now</a>
                    </div>
                  : allWatches.filter(w => w.category === "bags").map(w => <WatchCard key={w.id} w={w} showEnquire />)
              }
            </div>
          </div>
        </main>
      )}

      {/* ACCESSORIES PAGE */}
      {page === "accessories" && (
        <main>
          <div className="watches-page">
            <div className="watches-page-header">
              <span className="section-eyebrow">Luxury Accessories</span>
              <h1 className="section-title">Accessories <em>Collection</em></h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
            </div>
            <div className="watches-grid">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div className="skeleton-card" key={i}>
                      <div className="skeleton skeleton-img" />
                      <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                    </div>
                  ))
                : allWatches.filter(w => w.category === "accessories").length === 0
                  ? <div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem 0"}}>
                      <span className="section-eyebrow">Coming Soon</span>
                      <p style={{fontSize:"0.82rem",color:"var(--gray-mid)",marginTop:"1rem",lineHeight:1.9}}>Our accessories collection is being curated. Contact us to enquire about specific pieces.</p>
                      <a href="mailto:enquiries@chronovian.com?subject=Accessories Enquiry" className="btn-gold" style={{display:"inline-block",marginTop:"1.5rem"}}>Enquire Now</a>
                    </div>
                  : allWatches.filter(w => w.category === "accessories").map(w => <WatchCard key={w.id} w={w} showEnquire />)
              }
            </div>
          </div>
        </main>
      )}

      {/* SELL PAGE */}
      {page === "sell" && (
        <main><div className="sell-page">
          <span className="section-eyebrow">Sell Your Watch</span>
          <h1 className="section-title">Turn Your Timepiece <em>Into Capital</em></h1>
          <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
          <div className="sell-steps">
            {[
              { num: "01", title: "Submit Details", body: "Share photos and information about your watch. Our specialists will evaluate it confidentially." },
              { num: "02", title: "Get a Valuation", body: "We provide a competitive offer based on current market conditions within 24 hours." },
              { num: "03", title: "Get Paid", body: "Accept our offer and receive payment promptly. We handle all the logistics." },
            ].map(s => (
              <div className="sell-step" key={s.num}><span className="sell-step-num">{s.num}</span><h3>{s.title}</h3><p>{s.body}</p></div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:"2rem"}}>
            <a href="mailto:info@chronovian.com?subject=Sell My Watch" className="btn-gold" style={{marginRight:"1rem"}}>Start Selling</a>
            <a href="https://wa.me/910000000000" target="_blank" className="btn-outline">WhatsApp Us</a>
          </div>
        </div></main>
      )}

      {/* TRADE PAGE */}
      {page === "trade" && (
        <main><div className="sell-page">
          <span className="section-eyebrow">Trade Your Watch</span>
          <h1 className="section-title">Trade Up to Something <em>Extraordinary</em></h1>
          <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
          <div className="sell-steps">
            {[
              { num: "01", title: "Share Your Watch", body: "Tell us about the watch you'd like to trade. We assess its current market value fairly." },
              { num: "02", title: "Choose Your Next", body: "Browse our collection and select the timepiece you wish to acquire. We handle the difference." },
              { num: "03", title: "Complete the Trade", body: "A seamless, secure exchange — your trusted advisor guides you through every step." },
            ].map(s => (
              <div className="sell-step" key={s.num}><span className="sell-step-num">{s.num}</span><h3>{s.title}</h3><p>{s.body}</p></div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:"2rem"}}>
            <a href="mailto:info@chronovian.com?subject=Trade Enquiry" className="btn-gold" style={{marginRight:"1rem"}}>Start a Trade</a>
            <a href="https://wa.me/910000000000" target="_blank" className="btn-outline">WhatsApp Us</a>
          </div>
        </div></main>
      )}

      {/* WISHLIST PAGE */}
      {page === "wishlist" && (
        <main><div className="wishlist-page">
          <span className="section-eyebrow">Your Selections</span>
          <h1 className="section-title">Wishlist</h1>
          <div className="gold-rule" style={{margin:"1.25rem 0 2rem"}} />
          {wishlist.length === 0
            ? <div className="wishlist-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <p>Your wishlist is empty. Browse our collection and save the pieces that speak to you.</p>
                <button className="btn-outline" style={{marginTop:"1.5rem"}} onClick={() => goTo("watches")}>Browse Watches</button>
              </div>
            : <div className="watches-grid">
                {allWatches.filter(w => wishlist.includes(w.id)).map(w => <WatchCard key={w.id} w={w} showEnquire />)}
              </div>
          }
        </div></main>
      )}

      {/* CONTACT PAGE */}
      {page === "contact" && (
        <main><div className="contact-page">
          <div style={{textAlign:"left"}}>
            <span className="section-eyebrow">Get in Touch</span>
            <h1 className="section-title">Contact <em>Chronovian</em></h1>
            <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
          </div>
          <div className="contact-grid">
            <div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:"1.1rem",marginBottom:"1.5rem"}}>We'd love to hear from you</h3>
              {[
                { icon: "✉️", label: "Email", content: <a href="mailto:info@chronovian.com">info@chronovian.com</a> },
                { icon: "💬", label: "WhatsApp", content: <a href="https://wa.me/910000000000" target="_blank">+91 00000 00000</a> },
                { icon: "📍", label: "Location", content: "Hyderabad, Telangana — Address on appointment confirmation" },
                { icon: "🕐", label: "Hours", content: "By appointment only · Monday–Saturday: 10am–7pm" },
              ].map(item => (
                <div className="contact-item" key={item.label}>
                  <span className="contact-item-icon">{item.icon}</span>
                  <div className="contact-item-text">
                    <span className="contact-item-label">{item.label}</span>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:"1.1rem",marginBottom:"1.5rem"}}>Send an Enquiry</h3>
              <form className="contact-form" onSubmit={async e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = {
                  name: (form.elements.namedItem('name') as HTMLInputElement).value,
                  email: (form.elements.namedItem('email') as HTMLInputElement).value,
                  type: (form.elements.namedItem('type') as HTMLSelectElement).value,
                  message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
                };
                try {
                  await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                  form.reset();
                  alert('Thank you — we\'ll be in touch shortly.');
                } catch {
                  alert('Something went wrong. Please email us directly at enquiries@chronovian.com');
                }
              }}>
                <div className="form-group"><label className="form-label">Full Name</label><input name="name" className="form-input" type="text" placeholder="Your name" required /></div>
                <div className="form-group"><label className="form-label">Email</label><input name="email" className="form-input" type="email" placeholder="your@email.com" required /></div>
                <div className="form-group">
                  <label className="form-label">Enquiry Type</label>
                  <select name="type" className="form-select">
                    <option>Book an Appointment</option><option>Watch Enquiry</option><option>Jewellery Enquiry</option><option>Sell My Watch</option><option>Trade Enquiry</option><option>General Enquiry</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Message</label><textarea name="message" className="form-textarea" placeholder="Tell us how we can help..." /></div>
                <button type="submit" className="btn-gold">Send Enquiry</button>
              </form>
            </div>
          </div>
        </div></main>
      )}

      {/* BOOKING PAGE */}
      {page === "booking" && (() => {
        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        const timeSlots = ["10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];
        const today = new Date();
        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); setSelectedDate(null); setSelectedTime(null); };
        const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); setSelectedDate(null); setSelectedTime(null); };
        const isPast = (d: number) => new Date(calYear, calMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isWeekend = (d: number) => { const day = new Date(calYear, calMonth, d).getDay(); return day === 0; }; // closed Sundays
        const dateStr = (d: number) => `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const displayDate = selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" }) : null;

        return (
          <main>
            <div className="booking-page">
              <span className="section-eyebrow">Private Appointment</span>
              <h1 className="section-title">Book a <em>Viewing</em></h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />

              {bookingDone ? (
                <div className="booking-success" style={{marginTop:"3rem"}}>
                  <div className="booking-success-icon">✓</div>
                  <span className="section-eyebrow">Appointment Confirmed</span>
                  <h2 className="section-title" style={{marginTop:"0.5rem"}}>We'll See You <em>Soon</em></h2>
                  <div className="gold-rule" />
                  <p style={{fontSize:"0.82rem",color:"var(--gray-mid)",lineHeight:2,maxWidth:"420px",margin:"1.5rem auto"}}>
                    Your appointment has been received. A Chronovian advisor will confirm your booking via email and WhatsApp within a few hours.
                  </p>
                  <button className="btn-outline" onClick={() => { setBookingDone(false); setSelectedDate(null); setSelectedTime(null); goTo("home"); }}>Return Home</button>
                </div>
              ) : (
                <div className="booking-grid">
                  {/* CALENDAR */}
                  <div className="calendar-wrap">
                    <div className="calendar-header">
                      <button className="calendar-nav" onClick={prevMonth}>‹</button>
                      <span className="calendar-month">{monthNames[calMonth]} {calYear}</span>
                      <button className="calendar-nav" onClick={nextMonth}>›</button>
                    </div>
                    <div className="calendar-grid">
                      {dayNames.map(d => <div key={d} className="calendar-day-name">{d}</div>)}
                      {Array.from({length: firstDay}).map((_, i) => <div key={`e-${i}`} className="calendar-day empty" />)}
                      {Array.from({length: daysInMonth}).map((_, i) => {
                        const d = i + 1;
                        const ds = dateStr(d);
                        const past = isPast(d);
                        const weekend = isWeekend(d);
                        const isSelected = selectedDate === ds;
                        const isToday = today.getDate() === d && today.getMonth() === calMonth && today.getFullYear() === calYear;
                        return (
                          <button
                            key={d}
                            className={`calendar-day${isSelected ? " selected" : ""}${isToday ? " today" : ""}${past || weekend ? " past" : ""}`}
                            onClick={() => { if (!past && !weekend) { setSelectedDate(ds); setSelectedTime(null); }}}
                          >{d}</button>
                        );
                      })}
                    </div>
                    <p style={{fontSize:"0.6rem",color:"var(--gray-light)",marginTop:"1rem",letterSpacing:"0.1em"}}>
                      Open Monday–Saturday · Sundays closed · By appointment only
                    </p>

                    {/* TIME SLOTS */}
                    {selectedDate && (
                      <div className="time-slots">
                        <span className="time-slots-label">
                          {slotsLoading ? "Checking availability..." : `Available times for ${displayDate}`}
                        </span>
                        <div className="time-slots-grid">
                          {timeSlots.map(t => {
                            const isBooked = bookedSlots.some(s => s.date === displayDate && s.time === t);
                            const isSelected = selectedTime === t;
                            return (
                              <button
                                key={t}
                                className={`time-slot${isSelected ? " selected" : ""}${isBooked ? " unavailable" : ""}`}
                                onClick={() => { if (!isBooked) setSelectedTime(t); }}
                                disabled={isBooked || slotsLoading}
                                title={isBooked ? "This slot is already booked" : t}
                              >
                                {isBooked ? "Booked" : t}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOOKING FORM */}
                  <div>
                    {selectedDate && selectedTime && (
                      <div className="booking-selected-slot">
                        <span className="booking-selected-slot-label">Your selected slot</span>
                        <span className="booking-selected-slot-value">{displayDate} · {selectedTime}</span>
                      </div>
                    )}
                    <form className="booking-form" onSubmit={async e => {
                      e.preventDefault();
                      if (!selectedDate || !selectedTime) return;
                      setBookingLoading(true);
                      setBookingError(null);
                      try {
                        const res = await fetch('/api/booking', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...bookingForm,
                            date: displayDate,
                            time: selectedTime,
                          }),
                        });
                        if (res.status === 409) {
                          setBookingError('This slot was just booked by someone else. Please choose another time.');
                          setSelectedTime(null);
                          // Refresh booked slots
                          const month = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
                          const slotsRes = await fetch(`/api/booking?month=${month}`);
                          const slotsData = await slotsRes.json();
                          setBookedSlots(slotsData.bookings || []);
                          return;
                        }
                        if (!res.ok) throw new Error('Failed');
                        // Refresh slots so the booked slot shows as unavailable
                        const month2 = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
                        const slotsRes2 = await fetch(`/api/booking?month=${month2}`);
                        const slotsData2 = await slotsRes2.json();
                        setBookedSlots(slotsData2.bookings || []);
                        setBookingDone(true);
                      } catch {
                        setBookingError('Something went wrong. Please try again or WhatsApp us directly.');
                      } finally {
                        setBookingLoading(false);
                      }
                    }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" type="text" placeholder="Your full name" required value={bookingForm.name} onChange={e => setBookingForm(f => ({...f, name: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone / WhatsApp</label>
                        <input className="form-input" type="tel" placeholder="+91 00000 00000" required value={bookingForm.phone} onChange={e => setBookingForm(f => ({...f, phone: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="your@email.com" required value={bookingForm.email} onChange={e => setBookingForm(f => ({...f, email: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">I'm interested in</label>
                        <select className="form-select" value={bookingForm.interest} onChange={e => setBookingForm(f => ({...f, interest: e.target.value}))}>
                          <option>Buying a Watch</option>
                          <option>Selling a Watch</option>
                          <option>Trading a Watch</option>
                          <option>Fine Jewellery</option>
                          <option>General Enquiry</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Additional Notes</label>
                        <textarea className="form-textarea" placeholder="Any specific pieces you're interested in, or other details…" style={{minHeight:"90px"}} value={bookingForm.notes} onChange={e => setBookingForm(f => ({...f, notes: e.target.value}))} />
                      </div>
                      {bookingError && <p style={{fontSize:"0.75rem",color:"#c0392b",lineHeight:1.6}}>{bookingError}</p>}
                      <button
                        type="submit"
                        className="btn-gold"
                        style={{width:"100%", opacity: (selectedDate && selectedTime && !bookingLoading) ? 1 : 0.45, cursor: (selectedDate && selectedTime && !bookingLoading) ? "pointer" : "not-allowed"}}
                        disabled={!selectedDate || !selectedTime || bookingLoading}
                      >
                        {bookingLoading ? "Sending…" : selectedDate && selectedTime ? "Confirm Appointment" : "Select a Date & Time First"}
                      </button>
                      <p style={{fontSize:"0.6rem",color:"var(--gray-light)",textAlign:"center",letterSpacing:"0.1em"}}>
                        A Chronovian advisor will confirm within a few hours via WhatsApp &amp; email
                      </p>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </main>
        );
      })()}

      {/* HOME PAGE */}
      {page === "home" && (
        <main>
          <section className="hero">
            {heroSlides.map((s, i) => (
              <div key={i} className={`hero-slide${slide === i ? " active" : ""}`}>
                <img src={s.img} alt={s.headline} />
              </div>
            ))}
            <div className="hero-gradient" />
            <div className="hero-content">
              <p className="hero-eyebrow">Est. 2026 — By Appointment Only</p>
              <h1 className="hero-title">{heroSlides[slide].headline}<br /><em>{heroSlides[slide].subheadline}</em></h1>
              <p className="hero-sub">{heroSlides[slide].sub}</p>
            </div>
            <div className="hero-dots">
              {heroSlides.map((_, i) => (
                <button key={i} className={`hero-dot${slide === i ? " active" : ""}`} onClick={() => setSlide(i)} />
              ))}
            </div>
          </section>

          <section className="featured" id="featured">
            <div className="section-header">
              <span className="section-eyebrow">Our Collection</span>
              <h2 className="section-title">Featured <em>Timepieces</em></h2>
              <div className="gold-rule" />
            </div>
            <div className="featured-grid">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div className="skeleton-card" key={i}>
                      <div className="skeleton skeleton-img" />
                      <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "40%" }} />
                    </div>
                  ))
                : visibleWatches.map(w => <WatchCard key={`${watchIdx}-${w.id}`} w={w} />)
              }
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:"0.5rem",margin:"2rem 0 1rem"}}>
              {Array.from({length: totalWatchPages}).map((_, i) => (
                <button key={i} onClick={() => setWatchIdx(i)} style={{width: watchIdx===i?"28px":"10px", height:"3px", background: watchIdx===i?"var(--gold)":"rgba(0,0,0,0.15)", border:"none", cursor:"pointer", transition:"all 0.3s", padding:0}} />
              ))}
            </div>
            <div className="featured-footer">
              <button className="btn-outline" onClick={() => goTo("watches")}>View All Watches</button>
            </div>
          </section>

          <section className="categories" id="collections">
            {[
              { img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80", tag: "Haute Horlogerie", name: "Watches", action: () => goTo("watches") },
              { img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80", tag: "Fine Jewellery", name: "Jewellery", action: () => goTo("jewellery") },
            ].map(cat => (
              <div className="cat-card" key={cat.name} onClick={cat.action}>
                <img src={cat.img} alt={cat.name} />
                <div className="cat-overlay" />
                <div className="cat-content">
                  <span className="cat-tag">{cat.tag}</span>
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-link">Explore →</span>
                </div>
              </div>
            ))}
          </section>

          <section className="about-strip">
            <span className="section-eyebrow">Our Philosophy</span>
            <h2 className="section-title">A Sanctuary for the <em>Extraordinary</em></h2>
            <div className="gold-rule" />
            <p className="about-body">Chronovian is not merely a store — it is a curated sanctuary for those who understand that true luxury is measured in provenance, craftsmanship, and the singular joy of owning something exceptional. Every piece is hand-selected for its heritage, artistry, and investment potential.</p>
            <button className="btn-outline" onClick={() => goTo("booking")}>Schedule a Private Viewing</button>
          </section>

          <section className="pillars">
            <div className="pillars-inner">
              <div className="section-header">
                <span className="section-eyebrow">The Chronovian Difference</span>
                <h2 className="section-title">Why Our Clients <em>Choose</em> Us</h2>
              </div>
              <div className="pillars-grid">
                {[
                  { num: "01", title: "Absolute Privacy", body: "Every visit is conducted with the utmost discretion. Your collection, your story — kept entirely confidential." },
                  { num: "02", title: "Curated Excellence", body: "Each piece is individually authenticated and selected to meet our uncompromising standards of provenance and artistry." },
                  { num: "03", title: "Personal Service", body: "Your dedicated advisor guides you through every acquisition — from discovery to delivery — ensuring a seamless journey." },
                ].map(p => (
                  <div className="pillar" key={p.num}>
                    <span className="pillar-num">{p.num}</span>
                    <h3 className="pillar-title">{p.title}</h3>
                    <p className="pillar-body">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PAYMENT STRIP */}
      <div className="payment-strip">
        <span className="payment-label">Secure Payments</span>
        {[
          { label: "UPI", bg: "#5F259F", color: "white" },
          { label: "GPay", bg: "#4285F4", color: "white" },
          { label: "PhonePe", bg: "#5F259F", color: "white" },
          { label: "Paytm", bg: "#00BAF2", color: "white" },
          { label: "VISA", bg: "#1A1F71", color: "white" },
          { label: "MC", bg: "#EB001B", color: "white" },
          { label: "RuPay", bg: "#007A3D", color: "white" },
          { label: "NEFT", bg: "#eee", color: "#333" },
          { label: "EMI", bg: "#eee", color: "#333" },
        ].map(pm => (
          <span key={pm.label} className="payment-badge" style={{background:pm.bg, color:pm.color}}>{pm.label}</span>
        ))}
        <span style={{fontSize:"0.6rem",color:"var(--gray-light)"}}>🔒 SSL Secured</span>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <span className="footer-brand">Chronovian</span>
              <p className="footer-tagline">A sanctuary for extraordinary timepieces and fine jewellery. By appointment only — Hyderabad, Telangana, India.</p>
            </div>
            <div>
              <span className="footer-col-title">Collections</span>
              <ul className="footer-links">
                <li><button onClick={() => goTo("watches")}>Watches</button></li>
                <li><button onClick={() => goTo("jewellery")}>Jewellery</button></li>
                <li><button onClick={() => goTo("bags")}>Bags</button></li>
                <li><button onClick={() => goTo("accessories")}>Accessories</button></li>
              </ul>
            </div>
            <div>
              <span className="footer-col-title">Visit Us</span>
              <ul className="footer-links">
                <li><button onClick={() => goTo("booking")}>Book Appointment</button></li>
                <li><button onClick={() => goTo("contact")}>Contact Us</button></li>
                <li><a href="https://wa.me/910000000000" target="_blank">WhatsApp</a></li>
              </ul>
            </div>
            <div>
              <span className="footer-col-title">Company</span>
              <ul className="footer-links">
                <li><button onClick={() => goTo("contact")}>About Chronovian</button></li>
                <li><button onClick={() => goTo("sell")}>Sell Your Watch</button></li>
                <li><button onClick={() => goTo("trade")}>Trade Your Watch</button></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 Chronovian. All rights reserved.</p>
            <div className="footer-social">
              <a href="https://instagram.com/chronovian" target="_blank">Instagram</a>
              <a href="https://wa.me/910000000000" target="_blank">WhatsApp</a>
              <a href="#">Facebook</a>
            </div>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/910000000000" target="_blank" className="whatsapp-fab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.531 5.855L.057 23.169a.75.75 0 0 0 .92.92l5.355-1.484A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.731 9.731 0 0 1-4.964-1.355l-.355-.212-3.686 1.021 1.03-3.596-.232-.371A9.722 9.722 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
        <span style={{fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",fontWeight:400}}>WhatsApp Us</span>
      </a>
    </>
  );
}

"use client";

import { useEffect, useState, useRef, FormEvent, MouseEvent as ReactMouseEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let _supabase: ReturnType<typeof createClient<Database>> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
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
  weight?: string;
  color?: string;
  hardware?: string;
  size?: string;
  serial_number?: string;
  collection?: string;
  series?: string;
  calibre?: string;
  case_thickness?: string;
  case_shape?: string;
  case_back?: string;
  glass_material?: string;
  strap_colour?: string;
  clasp_type?: string;
  buckle_clasp_material?: string;
  gender?: string;
  water_resistance?: string;
  warranty_period?: string;
  warranty_register_url?: string;
  country_of_origin?: string;
  created_at?: string;
  sort_order?: number | null;
};

const CATEGORY_FACETS: Record<string, { key: string; label: string }[]> = {
  watches: [
    { key: "brand", label: "Brand" },
    { key: "dial_color", label: "Dial Colour" },
    { key: "case_size", label: "Case Size" },
    { key: "case_material", label: "Case Material" },
    { key: "bracelet_material", label: "Strap Material" },
    { key: "movement", label: "Movement" },
    { key: "gender", label: "Gender" },
    { key: "case_shape", label: "Case Shape" },
    { key: "collection", label: "Collection" },
  ],
  jewellery: [
    { key: "brand", label: "Brand" },
    { key: "material", label: "Material" },
    { key: "gemstone", label: "Gemstone" },
  ],
  bags: [
    { key: "brand", label: "Brand" },
    { key: "color", label: "Colour" },
    { key: "hardware", label: "Hardware" },
    { key: "size", label: "Size" },
  ],
  accessories: [
    { key: "brand", label: "Brand" },
  ],
};

const SORT_LABELS: Record<string, string> = {
  curated: "Featured",
  "price-desc": "Price – High to Low",
  "price-asc": "Price – Low to High",
  new: "New Arrivals",
};

const PRICE_BUCKETS = [
  { label: "Under ₹1 Lakh", min: 0, max: 99999 },
  { label: "₹1L – ₹5L", min: 100000, max: 499999 },
  { label: "₹5L – ₹10L", min: 500000, max: 999999 },
  { label: "₹10L – ₹20L", min: 1000000, max: 1999999 },
  { label: "₹20L – ₹50L", min: 2000000, max: 4999999 },
  { label: "₹50L and Above", min: 5000000, max: Infinity },
];

const CASE_SIZE_BUCKETS = [
  { label: "Under 26mm", min: 0, max: 25.99 },
  { label: "26mm – 30mm", min: 26, max: 30.99 },
  { label: "31mm – 35mm", min: 31, max: 35.99 },
  { label: "36mm – 40mm", min: 36, max: 40.99 },
  { label: "41mm – 45mm", min: 41, max: 45.99 },
  { label: "46mm and Above", min: 46, max: Infinity },
];

const parseSizeMM = (val?: string): number | null => {
  if (!val) return null;
  const match = val.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

// Fallback placeholder image
const placeholder = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=85";

const getImg = (w: Watch) => w.images?.[0] || placeholder;
const isVideo = (url: string) => /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url);

type HeroBanner = {
  id: string;
  image_url: string;
  headline: string;
  subheadline: string;
  tagline: string;
  sort_order: number;
  active: boolean;
};

type CartItem = { watch: Watch; qty: number };
type OrderItem = { id: string; brand: string; model: string; ref: string; price: number; qty: number; image: string };
type Order = {
  id: string;
  created_at: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  status: string;
  delivery_method: string;
  address: string;
  payment_method: string;
};
type MyBooking = { id: string; date: string; time: string; interest: string; notes: string; status: string; name: string; phone: string; email: string };
type Address = { id: string; user_id: string; label: string; address_line1: string; address_line2: string; city: string; state: string; pin: string; is_default: boolean; created_at: string };
type PageType = "home" | "watches" | "jewellery" | "bags" | "accessories" | "sell" | "trade" | "contact" | "wishlist" | "cart" | "checkout" | "product" | "booking" | "account";
type DropdownItem = { label: string; page?: PageType; href?: string };

const CURRENCY_META: Record<string, { symbol: string; label: string; locale: string; flag: string }> = {
  INR: { symbol: "₹", label: "Indian Rupee", locale: "en-IN", flag: "🇮🇳" },
  USD: { symbol: "$", label: "US Dollar", locale: "en-US", flag: "🇺🇸" },
  EUR: { symbol: "€", label: "Euro", locale: "de-DE", flag: "🇪🇺" },
  GBP: { symbol: "£", label: "British Pound", locale: "en-GB", flag: "🇬🇧" },
  AED: { symbol: "د.إ", label: "UAE Dirham", locale: "ar-AE", flag: "🇦🇪" },
  SGD: { symbol: "S$", label: "Singapore Dollar", locale: "en-SG", flag: "🇸🇬" },
  AUD: { symbol: "A$", label: "Australian Dollar", locale: "en-AU", flag: "🇦🇺" },
  CAD: { symbol: "C$", label: "Canadian Dollar", locale: "en-CA", flag: "🇨🇦" },
  CHF: { symbol: "Fr.", label: "Swiss Franc", locale: "de-CH", flag: "🇨🇭" },
  JPY: { symbol: "¥", label: "Japanese Yen", locale: "ja-JP", flag: "🇯🇵" },
  HKD: { symbol: "HK$", label: "Hong Kong Dollar", locale: "en-HK", flag: "🇭🇰" },
  CNY: { symbol: "¥", label: "Chinese Yuan", locale: "zh-CN", flag: "🇨🇳" },
  SAR: { symbol: "﷼", label: "Saudi Riyal", locale: "ar-SA", flag: "🇸🇦" },
  QAR: { symbol: "ر.ق", label: "Qatari Riyal", locale: "ar-QA", flag: "🇶🇦" },
  KWD: { symbol: "د.ك", label: "Kuwaiti Dinar", locale: "ar-KW", flag: "🇰🇼" },
  MYR: { symbol: "RM", label: "Malaysian Ringgit", locale: "ms-MY", flag: "🇲🇾" },
  THB: { symbol: "฿", label: "Thai Baht", locale: "th-TH", flag: "🇹🇭" },
  ZAR: { symbol: "R", label: "South African Rand", locale: "en-ZA", flag: "🇿🇦" },
  NZD: { symbol: "NZ$", label: "New Zealand Dollar", locale: "en-NZ", flag: "🇳🇿" },
  OMR: { symbol: "ر.ع.", label: "Omani Rial", locale: "ar-OM", flag: "🇴🇲" },
};

// Maps country codes (from IP geolocation) to a default currency
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  IN: "INR", US: "USD", GB: "GBP", AE: "AED", SG: "SGD", AU: "AUD", CA: "CAD",
  CH: "CHF", JP: "JPY", HK: "HKD", CN: "CNY", SA: "SAR", QA: "QAR", KW: "KWD",
  MY: "MYR", TH: "THB", ZA: "ZAR", NZ: "NZD", OM: "OMR",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", IE: "EUR", PT: "EUR",
  AT: "EUR", BE: "EUR", FI: "EUR", GR: "EUR",
};

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [slide, setSlide] = useState(0);
  const [page, setPage] = useState<PageType>("home");
  const [filtersOpenMap, setFiltersOpenMap] = useState<Record<string, boolean>>({ watches: true, jewellery: true, bags: true, accessories: true });
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 9;
  const [expandedFacet, setExpandedFacet] = useState<string | null>(null);
  const [activeFacets, setActiveFacets] = useState<Record<string, string[]>>({});
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<"curated" | "price-desc" | "price-asc" | "new">("curated");
  const defaultSortRef = useRef<"curated" | "price-desc" | "price-asc" | "new">("curated");
  const [sortOpen, setSortOpen] = useState(false);
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
  const [zoomOpen, setZoomOpen] = useState(false);
  const [magnifyActive, setMagnifyActive] = useState(false);
  const [magnifyPos, setMagnifyPos] = useState({ x: 50, y: 50 });
  useEffect(() => { if (!zoomOpen) setMagnifyActive(false); }, [zoomOpen]);
  const [allWatches, setAllWatches] = useState<Watch[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<HeroBanner[]>([]);
  const [catImages, setCatImagesState] = useState<Record<string, string>>({
    watches: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90",
    jewellery: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=90",
    bags: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90",
  });
  const [currency, setCurrency] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ INR: 1 });
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  // Checkout form (now controlled so we can actually save orders)
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    addressLine1: "", addressLine2: "", city: "", pin: "", state: "Telangana",
    delivery: "home", payment: "upi",
  });
  const [checkoutSaving, setCheckoutSaving] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Account page
  const [accountTab, setAccountTab] = useState<"profile" | "addresses" | "orders" | "bookings">("profile");
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [pwForm, setPwForm] = useState({ password: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);
  const [myAddresses, setMyAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: "Home", address_line1: "", address_line2: "", city: "", state: "Telangana", pin: "" });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Auth: load current session + subscribe to changes
  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const resetAuthForm = () => { setAuthForm({ name: "", email: "", password: "" }); setAuthError(null); setAuthMessage(null); };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setAuthSubmitting(true);
    const sb = getSupabase();
    try {
      if (authMode === "signup") {
        if (!authForm.name.trim()) throw new Error("Please enter your name.");
        if (authForm.password.length < 6) throw new Error("Password must be at least 6 characters.");
        const { data, error } = await sb.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: { data: { full_name: authForm.name } },
        });
        if (error) throw error;
        if (data.session) {
          setAuthModalOpen(false);
          resetAuthForm();
        } else {
          setAuthMessage("Check your email to confirm your account before signing in.");
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
        if (error) throw error;
        setAuthModalOpen(false);
        resetAuthForm();
      }
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong. Please try again.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const sb = getSupabase();
    await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  };

  const handleSignOut = async () => {
    const sb = getSupabase();
    await sb.auth.signOut();
    setAccountDropdownOpen(false);
  };

  // Prefill checkout contact fields from logged-in user, and load their saved addresses
  useEffect(() => {
    if (user && page === "checkout") {
      setCheckoutForm(f => ({
        ...f,
        email: f.email || user.email || "",
        firstName: f.firstName || (user.user_metadata?.full_name || "").split(" ")[0] || "",
        lastName: f.lastName || (user.user_metadata?.full_name || "").split(" ").slice(1).join(" ") || "",
      }));
      fetchMyAddresses(user.id);
    }
  }, [user, page]);

  // Auto-apply the default (or first) saved address once addresses load at checkout
  useEffect(() => {
    if (page === "checkout" && myAddresses.length > 0 && !selectedAddressId) {
      applyAddressToCheckout(myAddresses.find(a => a.is_default) || myAddresses[0]);
    }
  }, [myAddresses, page]);

  // Prefill profile form + fetch orders/bookings/addresses when opening the account page
  useEffect(() => {
    if (!user || !user.email || page !== "account") return;
    const userEmail = user.email;
    setProfileForm({ full_name: user.user_metadata?.full_name || "", phone: (user.user_metadata as any)?.phone || "" });

    const sb = getSupabase();

    (async () => {
      setOrdersLoading(true);
      try {
        const { data, error } = await sb.from("orders").select("*").or(`user_id.eq.${user.id},customer_email.eq.${userEmail}`).order("created_at", { ascending: false });
        if (!error && data) setMyOrders(data as unknown as Order[]);
      } finally {
        setOrdersLoading(false);
      }
    })();

    (async () => {
      setMyBookingsLoading(true);
      try {
        const { data, error } = await sb.from("bookings").select("*").eq("email", userEmail).order("id", { ascending: false });
        if (!error && data) setMyBookings(data as unknown as MyBooking[]);
      } finally {
        setMyBookingsLoading(false);
      }
    })();

    fetchMyAddresses(user.id);
  }, [user, page]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileError(null); setProfileMessage(null); setProfileSaving(true);
    try {
      const sb = getSupabase();
      const { error } = await sb.auth.updateUser({ data: { full_name: profileForm.full_name, phone: profileForm.phone } });
      if (error) throw error;
      setProfileMessage("Profile updated.");
    } catch (err: any) {
      setProfileError(err.message || "Could not update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null); setPwMessage(null);
    if (pwForm.password.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    if (pwForm.password !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    setPwSaving(true);
    try {
      const sb = getSupabase();
      const { error } = await sb.auth.updateUser({ password: pwForm.password });
      if (error) throw error;
      setPwMessage("Password updated.");
      setPwForm({ password: "", confirm: "" });
    } catch (err: any) {
      setPwError(err.message || "Could not update password.");
    } finally {
      setPwSaving(false);
    }
  };

  const fetchMyAddresses = async (uid: string) => {
    setAddressesLoading(true);
    try {
      const sb = getSupabase();
      const { data, error } = await sb.from("addresses").select("*").eq("user_id", uid)
        .order("is_default", { ascending: false }).order("created_at", { ascending: false });
      if (!error && data) setMyAddresses(data as unknown as Address[]);
    } finally {
      setAddressesLoading(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({ label: "Home", address_line1: "", address_line2: "", city: "", state: "Telangana", pin: "" });
    setEditingAddressId(null);
    setAddressError(null);
  };

  const handleEditAddress = (addr: Address) => {
    setAddressForm({ label: addr.label, address_line1: addr.address_line1, address_line2: addr.address_line2 || "", city: addr.city, state: addr.state, pin: addr.pin });
    setEditingAddressId(addr.id);
    setAddressError(null);
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressError(null);
    const f = addressForm;
    if (!f.address_line1 || !f.city || !f.pin) { setAddressError("Please fill in all required fields."); return; }
    setAddressSaving(true);
    try {
      const sb = getSupabase();
      if (editingAddressId) {
        const { error } = await (sb.from("addresses") as any).update({
          label: f.label, address_line1: f.address_line1, address_line2: f.address_line2 || null,
          city: f.city, state: f.state, pin: f.pin,
        }).eq("id", editingAddressId);
        if (error) throw error;
      } else {
        const { error } = await sb.from("addresses").insert([{
          user_id: user.id, label: f.label, address_line1: f.address_line1,
          address_line2: f.address_line2 || null, city: f.city, state: f.state, pin: f.pin,
          is_default: myAddresses.length === 0,
        }]);
        if (error) throw error;
      }
      await fetchMyAddresses(user.id);
      setShowAddressForm(false);
      resetAddressForm();
    } catch (err: any) {
      setAddressError(err.message || "Could not save address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    if (typeof window !== "undefined" && !window.confirm("Delete this address?")) return;
    const sb = getSupabase();
    await sb.from("addresses").delete().eq("id", id);
    await fetchMyAddresses(user.id);
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return;
    const sb = getSupabase();
    await (sb.from("addresses") as any).update({ is_default: false }).eq("user_id", user.id);
    await (sb.from("addresses") as any).update({ is_default: true }).eq("id", id);
    await fetchMyAddresses(user.id);
  };

  const applyAddressToCheckout = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setCheckoutForm(f => ({ ...f, addressLine1: addr.address_line1, addressLine2: addr.address_line2 || "", city: addr.city, state: addr.state, pin: addr.pin }));
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    const f = checkoutForm;
    if (!f.firstName || !f.lastName || !f.email || !f.phone || !f.addressLine1 || !f.city || !f.pin) {
      setCheckoutError("Please fill in all required fields.");
      return;
    }
    setCheckoutSaving(true);
    try {
      const sb = getSupabase();
      const items: OrderItem[] = cart.map(item => ({
        id: item.watch.id, brand: item.watch.brand, model: item.watch.model,
        ref: item.watch.ref, price: item.watch.price, qty: item.qty, image: getImg(item.watch),
      }));
      const address = `${f.addressLine1}${f.addressLine2 ? ", " + f.addressLine2 : ""}, ${f.city}, ${f.state} ${f.pin}`;
      const { error } = await sb.from("orders").insert([{
        user_id: user?.id ?? null,
        customer_name: `${f.firstName} ${f.lastName}`,
        customer_email: f.email,
        customer_phone: f.phone,
        items: items as unknown as Database["public"]["Tables"]["orders"]["Insert"]["items"],
        total: cartTotal + 500,
        status: "Pending",
        delivery_method: f.delivery,
        address,
        payment_method: f.payment,
      }]);
      if (error) throw error;
      setOrderPlaced(true);
    } catch (err: any) {
      setCheckoutError(err.message || "Something went wrong placing your order. Please try again.");
    } finally {
      setCheckoutSaving(false);
    }
  };

  // Fetch cached exchange rates from Supabase
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const sb = getSupabase();
        const { data } = await sb.from("exchange_rates").select("*").eq("id", 1).single();
        if (data?.rates) {
          setExchangeRates(data.rates);
          setRatesUpdatedAt(data.updated_at);
        }
      } catch (e) {
        console.error("Failed to fetch exchange rates:", e);
      }
    };
    fetchRates();
  }, []);

  // Auto-detect currency from user's location (once, on first load)
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("chronovian_currency") : null;
    if (saved && CURRENCY_META[saved]) {
      setCurrency(saved);
      return;
    }
    const detectLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const detected = COUNTRY_TO_CURRENCY[data.country_code];
        if (detected && CURRENCY_META[detected]) setCurrency(detected);
      } catch {
        // Silently fall back to INR if detection fails
      }
    };
    detectLocation();
  }, []);

  const changeCurrency = (code: string) => {
    setCurrency(code);
    setCurrencyDropdownOpen(false);
    if (typeof window !== "undefined") localStorage.setItem("chronovian_currency", code);
  };

  // Convert a price (stored in INR) to the selected currency and format it
  const fmtPrice = (priceInr: number) => {
    const rate = exchangeRates[currency] || (currency === "INR" ? 1 : null);
    const meta = CURRENCY_META[currency] || CURRENCY_META.INR;
    if (rate === null || rate === undefined) {
      return "₹" + priceInr.toLocaleString("en-IN");
    }
    const converted = priceInr * rate;
    // JPY and a few others don't use decimals
    const decimals = ["JPY", "KRW"].includes(currency) ? 0 : 0;
    const formatted = converted.toLocaleString(meta.locale, { maximumFractionDigits: decimals });
    return `${meta.symbol}${formatted}`;
  };

  // Fetch all products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("products")
          .select("*")
          .eq("status", "available")
          .order("sort_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false });
        if (!error && data) setAllWatches(data as unknown as Watch[]);
      } catch (e) {
        console.error("Failed to fetch products:", e);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Load the default product sort configured by the admin panel
  useEffect(() => {
    (async () => {
      try {
        const sb = getSupabase();
        const { data } = await sb.from("site_settings").select("value").eq("key", "default_sort").maybeSingle();
        const val = (data as any)?.value;
        if (val === "curated" || val === "price-desc" || val === "price-asc" || val === "new") {
          defaultSortRef.current = val;
          setSortBy(val);
        }
      } catch {
        // Setting not configured yet — keep the built-in default
      }
    })();
  }, []);

  // If the URL has ?product=<id>, open that product directly (used when a product is opened in a new tab)
  useEffect(() => {
    if (allWatches.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");
    if (productId) {
      const found = allWatches.find(w => w.id === productId);
      if (found) {
        setSelectedWatch(found);
        setActiveImgIdx(0);
        setPage("product");
      }
    }
  }, [allWatches]);

  // Fetch hero banners from Supabase
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("hero_banners")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) setHeroSlides(data);
      } catch (e) {
        console.error("Failed to fetch hero banners:", e);
      }
    };
    fetchBanners();

    // Fetch category images
    const fetchCatImages = async () => {
      try {
        const sb = getSupabase();
        const { data } = await sb.from("category_images").select("*");
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((row: any) => { if (row.image_url) map[row.id] = row.image_url; });
          if (Object.keys(map).length > 0) setCatImagesState(prev => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error("Failed to fetch category images:", e);
      }
    };
    fetchCatImages();
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const currentIsVideo = isVideo(heroSlides[slide]?.image_url || "");
    const duration = currentIsVideo ? 9000 : 5000;
    const id = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), duration);
    return () => clearInterval(id);
  }, [heroSlides.length, slide]);
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

  const openProductInNewTab = (w: Watch) => {
    const url = `${window.location.origin}${window.location.pathname}?product=${w.id}`;
    window.open(url, "_blank");
  };

  // Reset filter selections whenever the category changes, so selections don't leak between categories
  const isFiltersOpen = (category: string) => filtersOpenMap[category] ?? true;
  const toggleFiltersOpen = (category: string) => setFiltersOpenMap(prev => ({ ...prev, [category]: !(prev[category] ?? true) }));
  const closeFilters = (category: string) => setFiltersOpenMap(prev => ({ ...prev, [category]: false }));

  const prevCategoryRef = useRef<string | null>(null);
  const skipNextFacetResetRef = useRef(false);
  useEffect(() => {
    const isListingPage = ["watches", "jewellery", "bags", "accessories"].includes(page);
    if (isListingPage) {
      if (prevCategoryRef.current !== null && prevCategoryRef.current !== page && !skipNextFacetResetRef.current) {
        setActiveFacets({});
        setPriceMin("");
        setPriceMax("");
        setSortBy(defaultSortRef.current);
        setExpandedFacet(null);
      }
      skipNextFacetResetRef.current = false;
      prevCategoryRef.current = page;
    }
    setCurrentPage(1);
  }, [page]);

  // Reset to page 1 whenever filters or sort change, so you never land on an empty page
  useEffect(() => { setCurrentPage(1); }, [activeFacets, priceMin, priceMax, sortBy]);

  const getFacetOptions = (categoryWatches: Watch[], key: string): string[] => {
    const values = categoryWatches.map(w => (w as any)[key]).filter((v): v is string => !!v && v.trim() !== "");
    return Array.from(new Set(values)).sort();
  };

  const toggleFacetValue = (key: string, value: string) => {
    setActiveFacets(prev => {
      const current = prev[key] || [];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      const updated = { ...prev, [key]: next };
      if (next.length === 0) delete updated[key];
      return updated;
    });
  };

  const clearAllFilters = () => {
    setActiveFacets({});
    setPriceMin("");
    setPriceMax("");
  };

  const activeFilterCount = Object.values(activeFacets).reduce((n, arr) => n + arr.length, 0) + (priceMin ? 1 : 0) + (priceMax ? 1 : 0);

  const matchesFacets = (w: Watch) =>
    Object.entries(activeFacets).every(([key, values]) => {
      if (!values.length) return true;
      if (key === "case_size_bucket") {
        const mm = parseSizeMM(w.case_size);
        if (mm === null) return false;
        return values.some(label => {
          const bucket = CASE_SIZE_BUCKETS.find(b => b.label === label);
          return bucket && mm >= bucket.min && mm <= bucket.max;
        });
      }
      return values.includes((w as any)[key]);
    });

  const inPriceRange = (w: Watch) => {
    const min = priceMin ? parseInt(priceMin) : -Infinity;
    const max = priceMax ? parseInt(priceMax) : Infinity;
    return w.price >= min && w.price <= max;
  };

  const sortWatchList = (list: Watch[]) => {
    const arr = [...list];
    if (sortBy === "price-desc") arr.sort((a, b) => b.price - a.price);
    else if (sortBy === "price-asc") arr.sort((a, b) => a.price - b.price);
    else if (sortBy === "new") arr.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    else {
      // "curated" — the manual order set by dragging in the admin panel.
      // Products never manually ordered (null sort_order) fall to the end, newest first.
      arr.sort((a, b) => {
        const ao = a.sort_order, bo = b.sort_order;
        const aHas = ao !== null && ao !== undefined;
        const bHas = bo !== null && bo !== undefined;
        if (aHas && bHas) return (ao as number) - (bo as number);
        if (aHas) return -1;
        if (bHas) return 1;
        return (b.created_at || "").localeCompare(a.created_at || "");
      });
    }
    return arr;
  };

  const getCategoryList = (category: string) => {
    let list = allWatches.filter(w => w.category === category);
    list = list.filter(w => matchesFacets(w) && inPriceRange(w));
    return sortWatchList(list);
  };

  const renderPagination = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) return null;
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return (
      <div className="pagination">
        <button className="pagination-arrow" disabled={currentPage === 1} onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>‹</button>
        {pages.map((p, i) => p === "..."
          ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
          : <button key={p} className={`pagination-num${currentPage === p ? " active" : ""}`} onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{p}</button>
        )}
        <button className="pagination-arrow" disabled={currentPage === totalPages} onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>›</button>
      </div>
    );
  };

  const renderFiltersToggle = (category: string) => (
    <label className="filters-switch-wrap" onClick={() => toggleFiltersOpen(category)}>
      <span className="filters-switch-label">Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
      <span className={`filters-switch${isFiltersOpen(category) ? " on" : ""}`}>
        <span className="filters-switch-knob" />
      </span>
    </label>
  );

  const renderSortControl = () => (
    <div className="sort-dropdown-wrap">
      <button className="sort-trigger" onClick={() => setSortOpen(o => !o)}>
        Sort By: <strong>{SORT_LABELS[sortBy]}</strong> <span className="sort-caret">⌄</span>
      </button>
      {sortOpen && (
        <div className="sort-menu">
          {(["curated", "price-desc", "price-asc", "new"] as const).map(opt => (
            <button key={opt} className={`sort-option${sortBy === opt ? " active" : ""}`} onClick={() => { setSortBy(opt); setSortOpen(false); }}>{SORT_LABELS[opt]}</button>
          ))}
        </div>
      )}
    </div>
  );

  const renderFilterSidebar = (category: string) => {
    const facets = CATEGORY_FACETS[category] || [];
    const baseList = allWatches.filter(w => w.category === category);
    const categoryPrices = baseList.map(w => w.price).filter(p => typeof p === "number" && !isNaN(p));
    const priceBoundMin = categoryPrices.length ? Math.min(...categoryPrices) : 0;
    const priceBoundMax = categoryPrices.length ? Math.max(...categoryPrices) : 10000000;
    return (
      <>
        <div className="filters-sidebar-overlay" onClick={() => closeFilters(category)} />
        <aside className="filters-sidebar">
        <div className="filters-sidebar-header">
          <span className="filters-sidebar-title">Filters</span>
          <button className="filters-sidebar-close" onClick={() => closeFilters(category)}>×</button>
        </div>
        {activeFilterCount > 0 && <button className="filters-clear-btn" onClick={clearAllFilters}>Clear All Filters ({activeFilterCount})</button>}
        <div className="facet-accordion">
          <div className="facet-item">
            <button className="facet-header" onClick={() => setExpandedFacet(f => f === "price" ? null : "price")}>
              <span>Price</span><span className="facet-toggle-icon">{expandedFacet === "price" ? "−" : "+"}</span>
            </button>
            {expandedFacet === "price" && (
              <div className="facet-body">
                <div className="price-slider-wrap">
                  <input type="range" min={priceBoundMin} max={priceBoundMax} value={priceMin || priceBoundMin} onChange={e => setPriceMin(e.target.value)} className="price-slider" />
                  <input type="range" min={priceBoundMin} max={priceBoundMax} value={priceMax || priceBoundMax} onChange={e => setPriceMax(e.target.value)} className="price-slider" />
                </div>
                <div className="price-range-inputs">
                  <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                  <span>–</span>
                  <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                </div>
                <div className="price-bucket-list">
                  {PRICE_BUCKETS.map(b => (
                    <label key={b.label} className="facet-checkbox">
                      <input
                        type="checkbox"
                        checked={priceMin === String(b.min) && priceMax === String(b.max === Infinity ? priceBoundMax : b.max)}
                        onChange={() => { setPriceMin(String(b.min)); setPriceMax(String(b.max === Infinity ? priceBoundMax : b.max)); }}
                      />
                      <span>{b.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          {facets.map(f => {
            if (f.key === "case_size") {
              const relevantSizes = baseList.map(w => parseSizeMM(w.case_size)).filter((v): v is number => v !== null);
              const bucketsWithData = CASE_SIZE_BUCKETS.filter(b => relevantSizes.some(mm => mm >= b.min && mm <= b.max));
              if (bucketsWithData.length === 0) return null;
              return (
                <div className="facet-item" key={f.key}>
                  <button className="facet-header" onClick={() => setExpandedFacet(cur => cur === f.key ? null : f.key)}>
                    <span>{f.label}</span><span className="facet-toggle-icon">{expandedFacet === f.key ? "−" : "+"}</span>
                  </button>
                  {expandedFacet === f.key && (
                    <div className="facet-body">
                      {bucketsWithData.map(b => (
                        <label key={b.label} className="facet-checkbox">
                          <input type="checkbox" checked={(activeFacets["case_size_bucket"] || []).includes(b.label)} onChange={() => toggleFacetValue("case_size_bucket", b.label)} />
                          <span>{b.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            const options = getFacetOptions(baseList, f.key);
            if (options.length === 0) return null;
            return (
              <div className="facet-item" key={f.key}>
                <button className="facet-header" onClick={() => setExpandedFacet(cur => cur === f.key ? null : f.key)}>
                  <span>{f.label}</span><span className="facet-toggle-icon">{expandedFacet === f.key ? "−" : "+"}</span>
                </button>
                {expandedFacet === f.key && (
                  <div className="facet-body">
                    {options.map(opt => (
                      <label key={opt} className="facet-checkbox">
                        <input type="checkbox" checked={(activeFacets[f.key] || []).includes(opt)} onChange={() => toggleFacetValue(f.key, opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
      </>
    );
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

  const filteredWatches = getCategoryList("watches");
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

  const sellItems = [
    { label: "How It Works", page: "sell" as PageType },
  ];
  const tradeItems = [
    { label: "How It Works", page: "trade" as PageType },
  ];

  const WatchCard = ({ w, showEnquire = false, hoverCart = false }: { w: Watch; showEnquire?: boolean; hoverCart?: boolean }) => (
    <div className="watch-card">
      <div className="watch-img-wrap" onClick={() => openProductInNewTab(w)}>
        <img src={getImg(w)} alt={`${w.brand} ${w.model}`} />
        <span className={`watch-status${w.status === "Sold" ? " sold" : ""}`}>{w.status}</span>
        <button className={`wishlist-btn${wishlist.includes(w.id) ? " active" : ""}`} onClick={e => { e.stopPropagation(); toggleWishlist(w.id); }}>
          {wishlist.includes(w.id) ? "♥" : "♡"}
        </button>
        {addedId === w.id && <div className="added-toast">Added to cart ✓</div>}
      </div>
      <span className="watch-brand">{w.brand}</span>
      <span className="watch-model" onClick={() => openProductInNewTab(w)} style={{cursor:"pointer"}}>{w.model}</span>
      <span className="watch-ref">{w.ref}</span>
      <span className="watch-price">{fmtPrice(w.price)}</span>
      <div className={`card-actions${hoverCart ? " card-actions-hover" : ""}`}>
        <button className="btn-cart" onClick={() => addToCart(w)}>Add to Cart</button>
        {showEnquire && <a href={`mailto:info@chronovian.com?subject=Enquiry: ${w.brand} ${w.model}`} className="enquire-btn">Enquire</a>}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Jost:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #9A7340; --gold-light: #B8935A;
          --burgundy: #6E1F2E; --burgundy-light: #8A2E40;
          --black: #0A0A0A; --gray-mid: #6B6B6B; --gray-light: #ADADAD;
          --gray-pale: #F5F3F0; --white: #FFFFFF; --border: rgba(0,0,0,0.09);
        }
        html { scroll-behavior: smooth; font-size: 17px; }
        body { background: var(--white); color: var(--black); font-family: 'Jost', sans-serif; font-weight: 400; overflow-x: hidden; }

        /* TOP BAR (frozen) */
        .topbar { position: sticky; top: 0; z-index: 210; background: rgba(255,255,255,0.97); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); padding: 0 2rem; height: 72px; display: flex; align-items: center; justify-content: space-between; transition: box-shadow 0.3s; }
        .topbar.scrolled { box-shadow: 0 1px 16px rgba(0,0,0,0.07); }
        .topbar-side { display: flex; align-items: center; gap: 1.4rem; flex: 1; }
        .topbar-side.right { justify-content: flex-end; }
        .nav-logo { font-family: 'Marcellus', serif; font-size: 1.5rem; font-weight: 400; letter-spacing: 0.22em; color: var(--black); text-transform: uppercase; cursor: pointer; white-space: nowrap; flex-shrink: 0; background: none; border: none; }
        .nav-icon-btn { background: none; border: none; cursor: pointer; color: var(--black); font-size: 1rem; display: flex; align-items: center; transition: color 0.2s; text-decoration: none; position: relative; }
        .nav-icon-btn:hover { color: var(--gold); }
        .nav-badge { position: absolute; top: -6px; right: -8px; background: var(--gold); color: white; font-size: 0.45rem; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 500; }
        .nav-link { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--black); text-decoration: none; background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 500; transition: color 0.2s; white-space: nowrap; padding: 0; }
        .nav-link:hover, .nav-link.active { color: var(--gold); }

        /* CATEGORY BAR (scrolls away) */
        .categorybar { background: white; border-bottom: 1px solid var(--border); padding: 0 2rem; height: 50px; display: flex; align-items: center; justify-content: center; gap: 2.25rem; }

        /* DROPDOWN */
        .nav-dropdown-wrap { position: relative; display: flex; align-items: center; }
        .nav-dropdown-wrap::after { content: ""; position: absolute; top: 100%; left: -20px; right: -20px; height: 32px; }
        .nav-dropdown-trigger { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--black); background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 500; transition: color 0.2s; display: flex; align-items: center; gap: 0.3rem; padding: 0; white-space: nowrap; height: 50px; }
        .nav-dropdown-trigger:hover, .nav-dropdown-trigger.open { color: var(--gold); }
        .nav-dropdown-trigger svg { transition: transform 0.25s; }
        .nav-dropdown-trigger.open svg { transform: rotate(180deg); }
        .nav-dropdown { position: absolute; top: 50px; left: 50%; transform: translateX(-50%) translateY(-6px); background: white; border: 1px solid var(--border); border-top: 2px solid var(--gold); min-width: 200px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); opacity: 0; pointer-events: none; transition: opacity 0.2s, transform 0.2s; z-index: 300; }
        .nav-dropdown.open { opacity: 1; pointer-events: all; transform: translateX(-50%) translateY(0); }
        .nav-dropdown-item { display: block; width: 100%; padding: 0.85rem 1.5rem; font-size: 0.74rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--black); text-decoration: none; background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 400; text-align: left; transition: color 0.2s, background 0.2s; border-bottom: 1px solid var(--border); white-space: nowrap; }
        .nav-dropdown-item:last-child { border-bottom: none; }
        .nav-dropdown-item:hover { color: var(--gold); background: var(--gray-pale); }

        /* MOBILE */
        .mobile-hamburger { display: none; background: none; border: none; cursor: pointer; flex-direction: column; gap: 5px; padding: 6px; }
        .mobile-hamburger span { display: block; width: 20px; height: 1px; background: var(--black); transition: all 0.3s; }
        .mobile-hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .mobile-hamburger.open span:nth-child(2) { opacity: 0; }
        .mobile-hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
        .mobile-menu { display: none; position: fixed; inset: 0; top: 72px; background: var(--white); z-index: 150; flex-direction: column; padding: 1.5rem; overflow-y: auto; border-top: 1px solid var(--border); }
        .mobile-menu.open { display: flex; }
        .mobile-section { border-bottom: 1px solid var(--border); }
        .mobile-section-trigger { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; font-family: 'Marcellus', serif; font-size: 1.1rem; font-weight: 300; color: var(--black); background: none; border: none; cursor: pointer; width: 100%; }
        .mobile-section-trigger svg { transition: transform 0.25s; }
        .mobile-section-trigger.open svg { transform: rotate(180deg); }
        .mobile-sub { display: none; flex-direction: column; padding-bottom: 0.75rem; }
        .mobile-sub.open { display: flex; }
        .mobile-sub-item { padding: 0.55rem 1rem; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray-mid); background: none; border: none; cursor: pointer; text-align: left; font-family: 'Jost', sans-serif; text-decoration: none; transition: color 0.2s; }
        .mobile-sub-item:hover { color: var(--gold); }
        .mobile-plain { display: block; padding: 1rem 0; font-family: 'Marcellus', serif; font-size: 1.1rem; font-weight: 300; color: var(--black); text-decoration: none; background: none; border: none; border-bottom: 1px solid var(--border); cursor: pointer; text-align: left; width: 100%; transition: color 0.2s; }
        .mobile-plain:hover { color: var(--gold); }
        @media (max-width: 900px) {
          .categorybar { display: none; }
          .topbar-side .nav-link { display: none; }
          .mobile-hamburger { display: flex !important; }
          .topbar-side .nav-icon-btn:not(.always-show) { display: none; }
          .topbar-side .nav-icon-btn.always-show { display: flex; }
          .currency-trigger { font-size: 0.65rem; padding: 0; }
          #mobile-search-btn { display: flex !important; }
        }

        /* LOADING SKELETON */
        .skeleton { background: linear-gradient(90deg, #f0ede9 25%, #e8e4df 50%, #f0ede9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-card { display: flex; flex-direction: column; gap: 0.75rem; }
        .skeleton-img { aspect-ratio: 3/4; border-radius: 0; }
        .skeleton-line { height: 12px; border-radius: 2px; }

        /* CURRENCY MODAL */
        .currency-wrap { position: relative; display: flex; align-items: center; }
        .currency-trigger { font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--black); background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 500; padding: 0; display: flex; align-items: center; gap: 0.3rem; transition: color 0.2s; white-space: nowrap; }
        .currency-trigger:hover { color: var(--gold); }
        .currency-trigger svg { transition: transform 0.25s; flex-shrink: 0; }
        .currency-trigger.open svg { transform: rotate(180deg); }
        .currency-modal-overlay { position: fixed; inset: 0; background: rgba(10,10,10,0.5); z-index: 600; display: flex; align-items: flex-start; justify-content: center; padding: 6vh 1rem; opacity: 0; pointer-events: none; transition: opacity 0.2s; overflow-y: auto; }

        /* IMAGE ZOOM MODAL */
        .zoom-overlay { position: fixed; inset: 0; background: #0A0A0A; z-index: 700; display: flex; align-items: center; justify-content: center; padding: 4vh 2rem; opacity: 0; pointer-events: none; transition: opacity 0.25s; cursor: zoom-out; }
        .zoom-overlay.open { opacity: 1; pointer-events: auto; }
        .zoom-img { max-width: 100%; max-height: 92vh; object-fit: contain; cursor: default; display: block; }
        .zoom-img-wrap { position: relative; max-width: 100%; max-height: 92vh; cursor: zoom-in; }
        .zoom-img-wrap .zoom-img { max-height: 92vh; }
        .zoom-magnifier { position: absolute; inset: 0; background-repeat: no-repeat; background-size: 220%; pointer-events: none; }
        .zoom-close { position: fixed; top: 1.5rem; right: 2rem; background: none; border: none; color: white; font-size: 2.5rem; line-height: 1; cursor: pointer; z-index: 701; }
        .zoom-nav { position: fixed; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; width: 48px; height: 48px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; z-index: 701; }
        .zoom-nav:hover { background: rgba(255,255,255,0.2); }
        .zoom-nav-prev { left: 2rem; }
        .zoom-nav-next { right: 2rem; }
        .zoom-counter { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.7); font-size: 0.7rem; letter-spacing: 0.1em; z-index: 701; }
        @media (max-width: 600px) { .zoom-overlay { padding: 2vh 1rem; } .zoom-close { top: 1rem; right: 1rem; font-size: 2rem; } .zoom-nav { width: 38px; height: 38px; font-size: 1.2rem; } .zoom-nav-prev { left: 0.75rem; } .zoom-nav-next { right: 0.75rem; } }
        .currency-modal-overlay.open { opacity: 1; pointer-events: all; }
        .currency-modal { background: white; width: 100%; max-width: 760px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); transform: translateY(-10px); transition: transform 0.25s; }
        .currency-modal-overlay.open .currency-modal { transform: translateY(0); }
        .currency-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid var(--border); }
        .currency-modal-title { font-family: 'Marcellus', serif; font-size: 1.1rem; font-weight: 400; }
        .currency-modal-close { background: none; border: none; cursor: pointer; font-size: 1.4rem; color: var(--gray-mid); line-height: 1; padding: 0.25rem; transition: color 0.2s; }
        .currency-modal-close:hover { color: var(--black); }
        .currency-modal-body { padding: 1.5rem 2rem 2rem; }
        .currency-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem 1rem; }
        .currency-cell { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 0.5rem; background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; text-align: left; transition: background 0.15s; border-radius: 2px; }
        .currency-cell:hover { background: var(--gray-pale); }
        .currency-cell.active .currency-cell-code { color: var(--gold); font-weight: 600; }
        .currency-cell-flag { font-size: 1.3rem; flex-shrink: 0; line-height: 1; }
        .currency-cell-text { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
        .currency-cell-code { font-size: 0.82rem; font-weight: 500; color: var(--black); display: flex; align-items: center; gap: 0.4rem; }
        .currency-cell-symbol { font-size: 0.65rem; color: var(--gray-light); background: var(--gray-pale); padding: 0.05rem 0.35rem; border-radius: 2px; }
        .currency-updated-note { padding: 1rem 2rem; font-size: 0.65rem; color: var(--gray-light); border-top: 1px solid var(--border); letter-spacing: 0.05em; text-align: center; }
        @media (max-width: 640px) { .currency-grid { grid-template-columns: repeat(2, 1fr); } .currency-modal-header, .currency-modal-body { padding-left: 1.25rem; padding-right: 1.25rem; } }
        .auth-modal { background: white; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
        .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.7rem; background: white; border: 1px solid var(--border); padding: 0.8rem 1rem; font-family: 'Jost', sans-serif; font-size: 0.75rem; font-weight: 500; color: var(--black); cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .google-btn:hover { border-color: var(--gray-mid); background: var(--gray-pale); }
        .auth-divider { display: flex; align-items: center; text-align: center; margin: 1.25rem 0; color: var(--gray-light); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; }
        .auth-divider::before, .auth-divider::after { content: ""; flex: 1; border-bottom: 1px solid var(--border); }
        .auth-divider span { padding: 0 0.75rem; }
        .auth-error { background: #fdecea; color: #b3261e; font-size: 0.72rem; padding: 0.7rem 0.9rem; margin-bottom: 0.9rem; line-height: 1.4; }
        .auth-message { background: #eefaf0; color: #1e7a34; font-size: 0.72rem; padding: 0.7rem 0.9rem; margin-bottom: 0.9rem; line-height: 1.4; }
        .auth-toggle { text-align: center; margin-top: 1.25rem; font-size: 0.75rem; color: var(--gray-mid); }
        .auth-toggle button { background: none; border: none; color: var(--gold); cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.75rem; font-weight: 500; text-decoration: underline; padding: 0; }
        .account-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--gold); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 500; font-family: 'Jost', sans-serif; }
        .account-dropdown { right: 0; left: auto; min-width: 200px; transform: translateY(-6px); }
        .account-dropdown.open { transform: translateY(0); }
        .account-dropdown-name { padding: 0.9rem 1.25rem 0.2rem; font-size: 0.8rem; font-weight: 500; color: var(--black); }
        .account-dropdown-email { padding: 0 1.25rem 0.8rem; font-size: 0.68rem; color: var(--gray-mid); border-bottom: 1px solid var(--border); margin-bottom: 0.4rem; }

        /* SEARCH OVERLAY */
        .search-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.98); backdrop-filter: blur(12px); z-index: 500; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
        .search-overlay.open { opacity: 1; pointer-events: all; }
        .search-overlay-header { padding: 1.5rem 2.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 1.25rem; }
        .search-input-wrap { flex: 1; display: flex; align-items: center; gap: 1rem; }
        .search-input-icon { color: var(--gray-mid); flex-shrink: 0; }
        .search-input { flex: 1; font-family: 'Marcellus', serif; font-size: clamp(1.2rem, 3vw, 1.8rem); font-weight: 300; border: none; outline: none; background: none; color: var(--black); }
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
        .search-brand-pill:hover { background: var(--burgundy); color: white; border-color: var(--burgundy); }
        @media (max-width: 768px) { .search-results-grid { grid-template-columns: repeat(2, 1fr); } .search-overlay-header { padding: 1.25rem; } .search-body { padding: 1.5rem; } }
        .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 400; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        .cart-overlay.open { opacity: 1; pointer-events: all; }
        .cart-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 420px; max-width: 100vw; background: white; z-index: 401; transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; }
        .cart-drawer.open { transform: translateX(0); }
        .cart-drawer-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .cart-drawer-title { font-family: 'Marcellus', serif; font-size: 1.1rem; font-weight: 400; letter-spacing: 0.08em; }
        .cart-close { background: none; border: none; cursor: pointer; font-size: 1.4rem; color: var(--gray-mid); line-height: 1; padding: 0; }
        .cart-items { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .cart-item { display: flex; gap: 1rem; align-items: flex-start; }
        .cart-item-img { width: 72px; height: 88px; object-fit: cover; background: var(--gray-pale); flex-shrink: 0; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-brand { font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 0.2rem; }
        .cart-item-model { font-family: 'Marcellus', serif; font-size: 0.9rem; display: block; margin-bottom: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cart-item-price { font-size: 0.82rem; color: var(--black); font-weight: 600; display: block; margin-bottom: 0.5rem; }
        .cart-item-remove { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-mid); background: none; border: 1px solid var(--border); cursor: pointer; padding: 0.3rem 0.65rem; transition: all 0.2s; font-family: 'Jost', sans-serif; }
        .cart-item-remove:hover { color: #c0392b; border-color: #c0392b; background: #fff5f5; }
        .cart-empty { text-align: center; padding: 3rem 0; color: var(--gray-mid); font-size: 0.82rem; }
        .cart-footer { padding: 1.5rem; border-top: 1px solid var(--border); }
        .cart-subtotal { display: flex; justify-content: space-between; margin-bottom: 1.25rem; }
        .cart-subtotal-label { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray-mid); }
        .cart-subtotal-value { font-family: 'Jost', sans-serif; font-size: 1.1rem; font-weight: 600; }
        .cart-cta { display: flex; flex-direction: column; gap: 0.6rem; }

        /* HERO */
        .hero { position: relative; height: 60vh; min-height: 420px; max-height: 620px; overflow: hidden; background: #111; }
        .hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease; }
        .hero-slide.active { opacity: 1; }
        .hero-slide img, .hero-slide video { width: 100%; height: 100%; object-fit: cover; opacity: 0.72; }
        .hero-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%); }
        .hero-content { position: absolute; bottom: 3.5rem; left: 3rem; right: 3rem; color: white; }
        .hero-eyebrow { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.65); margin-bottom: 1rem; }
        .hero-title { font-family: 'Marcellus', serif; font-size: clamp(2.8rem, 6vw, 5.5rem); font-weight: 300; line-height: 1.1; margin-bottom: 0.4rem; }
        .hero-title em { font-style: italic; color: #D4AA78; }
        .hero-sub { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-top: 0.75rem; }
        .hero-dots { position: absolute; bottom: 2rem; right: 3rem; display: flex; gap: 0.5rem; }
        .hero-dot { width: 20px; height: 1px; background: rgba(255,255,255,0.35); cursor: pointer; transition: background 0.3s, width 0.3s; border: none; padding: 0; }
        .hero-dot.active { background: white; width: 36px; }

        /* SECTIONS */
        .section-header { text-align: center; margin-bottom: 3rem; }
        .section-eyebrow { font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.75rem; display: block; font-weight: 500; }
        .section-title { font-family: 'Marcellus', serif; font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 300; line-height: 1.25; }
        .section-title em { font-style: italic; }
        .gold-rule { width: 32px; height: 1px; background: var(--gold); margin: 1.25rem auto 0; }

        /* WATCH CARDS */
        .featured { padding: 5rem 2.5rem; max-width: 1300px; margin: 0 auto; }
        .featured-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; align-items: start; }
        .watch-card { cursor: default; display: flex; flex-direction: column; height: 100%; }
        .watch-img-wrap { position: relative; overflow: hidden; background: var(--gray-pale); aspect-ratio: 3/4; margin-bottom: 1rem; cursor: pointer; }
        .watch-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .watch-card:hover .watch-img-wrap img { transform: scale(1.04); }
        .watch-status { position: absolute; top: 1rem; left: 1rem; font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.3rem 0.7rem; background: var(--burgundy); color: white; }
        .watch-status.sold { background: var(--black); color: white; }
        .watch-brand { font-size: 0.82rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.25rem; display: block; font-weight: 500; }
        .watch-model { font-family: 'Marcellus', serif; font-size: 1rem; font-weight: 400; color: var(--black); display: block; margin-bottom: 0.2rem; min-height: 2.5em; line-height: 1.25em; }
        .watch-ref { font-size: 0.78rem; color: var(--gray-mid); display: block; margin-bottom: 0.4rem; }
        .watch-price { font-size: 1rem; font-weight: 600; color: var(--black); display: block; margin-bottom: 0.75rem; letter-spacing: 0.01em; }
        .wishlist-btn { position: absolute; top: 1rem; right: 1rem; background: white; border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; transition: transform 0.2s; z-index: 2; color: var(--black); }
        .wishlist-btn:hover { transform: scale(1.15); }
        .wishlist-btn.active { color: var(--burgundy); }
        .added-toast { position: absolute; bottom: 0; left: 0; right: 0; background: var(--gold); color: white; text-align: center; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.5rem; }
        .card-actions { display: flex; flex-direction: column; gap: 0.5rem; margin-top: auto; }
        .card-actions-hover { opacity: 0; max-height: 0; overflow: hidden; margin-top: 0; transition: opacity 0.25s ease, max-height 0.25s ease, margin-top 0.25s ease; }
        .watch-card:hover .card-actions-hover { opacity: 1; max-height: 100px; margin-top: auto; }
        @media (hover: none) { .card-actions-hover { opacity: 1; max-height: 100px; margin-top: auto; } }
        .btn-cart { width: 100%; padding: 0.65rem; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; background: var(--burgundy); color: white; border: 1px solid var(--burgundy); cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 500; transition: all 0.2s; }
        .btn-cart:hover { background: var(--burgundy-light); border-color: var(--burgundy-light); }
        .enquire-btn { display: block; width: 100%; padding: 0.6rem; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; background: none; border: 1px solid var(--burgundy); color: var(--burgundy); cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 500; transition: all 0.2s; text-align: center; text-decoration: none; }
        .enquire-btn:hover { background: var(--burgundy); color: white; }
        .enquire-btn:hover { border-color: var(--gold); color: var(--gold); }
        .featured-footer { text-align: center; margin-top: 3rem; }

        /* WATCHES PAGE */
        .watches-page { padding: 4rem 2.5rem; max-width: 1300px; margin: 0 auto; }
        .watches-page-header { margin-bottom: 3rem; }

        /* LISTING LAYOUT WITH FILTER SIDEBAR */
        .listing-layout { display: grid; grid-template-columns: 260px 1fr; gap: 3rem; margin-top: 2rem; align-items: start; transition: grid-template-columns 0.2s; }
        .listing-layout.filters-collapsed { grid-template-columns: 1fr; }
        .listing-main { min-width: 0; }
        .listing-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); }
        .filters-switch-wrap { display: flex; align-items: center; gap: 0.7rem; cursor: pointer; user-select: none; }
        .filters-switch-label { font-family: 'Jost', sans-serif; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; color: var(--black); }
        .filters-switch { position: relative; width: 38px; height: 21px; background: var(--border); border-radius: 11px; transition: background 0.2s; flex-shrink: 0; }
        .filters-switch.on { background: var(--burgundy); }
        .filters-switch-knob { position: absolute; top: 2px; left: 2px; width: 17px; height: 17px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .filters-switch.on .filters-switch-knob { transform: translateX(17px); }
        .sort-dropdown-wrap { position: relative; }
        .sort-trigger { background: none; border: none; font-family: 'Jost', sans-serif; font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gray-mid); cursor: pointer; padding: 0; }
        .sort-trigger strong { color: var(--black); font-weight: 500; }
        .sort-caret { font-size: 0.9rem; margin-left: 0.2rem; }
        .sort-menu { position: absolute; top: calc(100% + 0.75rem); right: 0; background: white; border: 1px solid var(--border); border-top: 2px solid var(--gold); min-width: 220px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); z-index: 50; }
        .sort-option { display: block; width: 100%; text-align: left; padding: 0.85rem 1.25rem; background: none; border: none; border-bottom: 1px solid var(--border); font-family: 'Jost', sans-serif; font-size: 0.72rem; color: var(--gray-mid); cursor: pointer; transition: background 0.15s, color 0.15s; }
        .sort-option:last-child { border-bottom: none; }
        .sort-option:hover { background: var(--gray-pale); color: var(--black); }
        .sort-option.active { color: var(--gold); font-weight: 500; }

        /* FILTER SIDEBAR (persistent on desktop when on, drawer on mobile) */
        .filters-sidebar { position: sticky; top: 90px; align-self: start; }
        .filters-sidebar-header { display: none; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .filters-sidebar-title { font-family: 'Jost', sans-serif; font-size: 0.9rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
        .filters-sidebar-close { background: none; border: none; font-size: 1.8rem; line-height: 1; cursor: pointer; color: var(--black); }
        .filters-sidebar-overlay { display: none; }
        .filters-clear-btn { display: block; background: none; border: none; color: var(--burgundy); font-family: 'Jost', sans-serif; font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: underline; cursor: pointer; padding: 0; margin-bottom: 1.25rem; }
        .facet-accordion { display: flex; flex-direction: column; }
        .facet-item { border-bottom: 1px solid var(--border); }
        .facet-item:first-child { border-top: 1px solid var(--border); }
        .facet-header { width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: none; padding: 1rem 0.25rem; font-family: 'Jost', sans-serif; font-size: 0.78rem; font-weight: 500; color: var(--black); cursor: pointer; text-align: left; }
        .facet-toggle-icon { color: var(--gray-mid); font-size: 1rem; }
        .facet-body { padding: 0 0.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .facet-checkbox { display: flex; align-items: center; gap: 0.6rem; font-size: 0.78rem; color: var(--gray-mid); cursor: pointer; }
        .facet-checkbox input { accent-color: var(--gold); width: 15px; height: 15px; cursor: pointer; }
        .price-range-inputs { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
        .price-range-inputs input { width: 100px; padding: 0.6rem 0.75rem; border: 1px solid var(--border); font-family: 'Jost', sans-serif; font-size: 0.78rem; background: white; }
        .price-range-inputs span { color: var(--gray-light); }
        .price-slider-wrap { position: relative; height: 28px; margin-bottom: 0.5rem; }
        .price-slider { position: absolute; top: 10px; left: 0; width: 100%; -webkit-appearance: none; appearance: none; background: none; pointer-events: none; height: 8px; margin: 0; }
        .price-slider::-webkit-slider-runnable-track { height: 2px; background: var(--border); }
        .price-slider::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: var(--gold); cursor: pointer; margin-top: -7px; border: 2px solid white; box-shadow: 0 0 0 1px var(--gold); }
        .price-slider::-moz-range-track { height: 2px; background: var(--border); }
        .price-slider::-moz-range-thumb { pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: var(--gold); cursor: pointer; border: 2px solid white; box-shadow: 0 0 0 1px var(--gold); }
        .price-bucket-list { display: flex; flex-direction: column; gap: 0.7rem; padding-top: 0.5rem; border-top: 1px solid var(--border); }

        @media (max-width: 900px) {
          .listing-layout { grid-template-columns: 1fr; }
          .listing-layout.filters-collapsed { grid-template-columns: 1fr; }
          .filters-sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(10,10,10,0.5); z-index: 400; }
          .filters-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 85%; max-width: 340px; background: white; z-index: 401; padding: 1.75rem; overflow-y: auto; }
          .filters-sidebar-header { display: flex; }
        }
        @media (max-width: 600px) { .listing-toolbar { flex-direction: row; justify-content: space-between; } .sort-menu { left: 0; right: auto; width: 100%; } }
        .watches-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; align-items: start; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 3rem; }
        .pagination-arrow { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border); color: var(--black); font-size: 1.1rem; cursor: pointer; transition: all 0.2s; }
        .pagination-arrow:hover:not(:disabled) { background: var(--burgundy); color: white; border-color: var(--burgundy); }
        .pagination-arrow:disabled { opacity: 0.3; cursor: default; }
        .pagination-num { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid transparent; color: var(--gray-mid); font-family: 'Jost', sans-serif; font-size: 0.82rem; cursor: pointer; transition: all 0.2s; }
        .pagination-num:hover { color: var(--black); }
        .pagination-num.active { background: var(--burgundy); color: white; }
        .pagination-ellipsis { color: var(--gray-light); padding: 0 0.25rem; }

        /* PRODUCT PAGE */
        .product-page { padding: 3rem 2.5rem; max-width: 1200px; margin: 0 auto; }
        .product-breadcrumb { font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-light); margin-bottom: 2.5rem; display: flex; gap: 0.5rem; align-items: center; }
        .product-breadcrumb button { background: none; border: none; cursor: pointer; color: var(--gray-light); font-family: 'Jost', sans-serif; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; transition: color 0.2s; padding: 0; }
        .product-breadcrumb button:hover { color: var(--gold); }
        .product-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 5rem; align-items: start; }
        .product-gallery { display: flex; flex-direction: row; gap: 1rem; width: 100%; position: sticky; top: 90px; align-self: start; }
        .product-img-main { flex: 1; min-width: 0; aspect-ratio: 3/4; background: var(--gray-pale); overflow: hidden; position: relative; cursor: zoom-in; }
        .product-img-main img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .product-img-main video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .product-img-main:hover img { transform: scale(1.03); }
        .gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); background: white; border: none; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s; z-index: 2; }
        .gallery-nav:hover { background: var(--gold); color: white; }
        .gallery-nav-prev { left: 0.75rem; }
        .gallery-nav-next { right: 0.75rem; }
        .gallery-counter { position: absolute; bottom: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.5); color: white; font-size: 0.6rem; letter-spacing: 0.1em; padding: 0.25rem 0.6rem; }
        .product-thumbs { display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; max-height: 560px; flex-shrink: 0; }
        .product-thumbs::-webkit-scrollbar { width: 2px; }
        .product-thumbs::-webkit-scrollbar-track { background: var(--gray-pale); }
        .product-thumbs::-webkit-scrollbar-thumb { background: var(--gold); }
        .product-thumb { width: 64px; height: 72px; flex-shrink: 0; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; background: var(--gray-pale); }
        .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .product-thumb.active { border-color: var(--gold); }
        .product-thumb:hover { border-color: var(--gray-light); }
        .product-info { display: flex; flex-direction: column; gap: 1.25rem; }
        .product-brand { font-size: clamp(1.5rem, 2.2vw, 2rem); letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); font-weight: 500; line-height: 1.2; }
        .product-model { font-family: 'Marcellus', serif; font-size: 1rem; font-weight: 400; line-height: 1.4; color: var(--black); }
        .product-ref { font-size: 0.72rem; color: var(--gray-mid); }
        .product-price-row { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; padding: 1rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .product-price { font-family: 'Jost', sans-serif; font-size: 1.8rem; font-weight: 600; }
        .product-price-tax-note { font-size: 0.62rem; color: var(--gray-light); letter-spacing: 0.04em; }
        .product-cta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .btn-contact-us { padding: 1rem; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; background: var(--burgundy); color: white; border: 1px solid var(--burgundy); cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; text-align: center; text-decoration: none; display: block; }
        .btn-contact-us:hover { background: var(--burgundy-light); }
        .btn-buy-online { padding: 1rem; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; background: white; color: var(--black); border: 1px solid var(--black); cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; text-align: center; }
        .btn-buy-online:hover { background: var(--burgundy); color: white; }
        .product-secondary-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .btn-addcart-sm { flex: 1; padding: 0.75rem; font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase; background: none; color: var(--black); border: 1px solid var(--border); cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; }
        .btn-addcart-sm:hover { border-color: var(--gold); color: var(--gold); }
        .product-wishlist { display: flex; align-items: center; gap: 0.4rem; background: none; border: 1px solid var(--border); cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-mid); transition: all 0.2s; padding: 0.75rem 1rem; }
        .product-wishlist:hover { border-color: var(--gold); color: var(--gold); }
        .product-desc { font-size: 0.82rem; line-height: 2; color: var(--gray-mid); }
        @media (max-width: 600px) { .product-cta-row { grid-template-columns: 1fr; } }

        /* FULL SPECIFICATION */
        .full-spec-section { margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--border); }
        .similar-products-section { margin-top: 4rem; padding-top: 3rem; border-top: 1px solid var(--border); }
        .you-may-like-title { font-family: 'Jost', sans-serif; font-size: 1.1rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); margin-bottom: 2rem; }
        .similar-products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; align-items: start; }
        @media (max-width: 768px) { .similar-products-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; } }
        .full-spec-eyebrow { display: block; font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 1.5rem; }
        .full-spec-top-row { display: flex; flex-wrap: wrap; gap: 1.25rem 2rem; padding-bottom: 1.25rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); }
        .full-spec-top-item { flex: 0 1 160px; display: flex; flex-direction: column; gap: 0.3rem; }
        .full-spec-columns { display: flex; align-items: flex-start; gap: 3rem; }
        .full-spec-col-stack { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.75rem; }
        .full-spec-col { }
        .full-spec-col-title { display: block; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); font-weight: 500; padding-bottom: 0.6rem; margin-bottom: 0.9rem; border-bottom: 1px solid var(--border); }
        .full-spec-row { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.85rem; }
        .full-spec-label { font-size: 0.68rem; color: var(--gray-light); }
        .full-spec-value { font-size: 0.8rem; color: var(--black); font-weight: 500; }
        .full-spec-link { font-size: 0.7rem; color: var(--gold); text-decoration: underline; }
        @media (max-width: 600px) { .full-spec-top-item { flex-basis: 45%; } .full-spec-columns { flex-direction: column; gap: 1.75rem; } }

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
        .cart-page-price { font-family: 'Jost', sans-serif; font-size: 1rem; font-weight: 600; white-space: nowrap; }
        .cart-page-remove-icon { background: none; border: none; cursor: pointer; color: var(--gray-light); padding: 0.4rem; transition: color 0.2s; display: flex; align-items: center; }
        .cart-page-remove-icon:hover { color: #c0392b; }
        .order-summary { background: var(--gray-pale); padding: 2rem; height: fit-content; position: sticky; top: 80px; }
        .summary-title { font-family: 'Marcellus', serif; font-size: 1rem; margin-bottom: 1.5rem; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--gray-mid); margin-bottom: 0.75rem; }
        .summary-total { display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 0.5rem; font-weight: 400; }
        .summary-total-label { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; }
        .summary-total-value { font-family: 'Jost', sans-serif; font-size: 1.2rem; font-weight: 600; }
        .cart-empty-page { text-align: center; padding: 5rem 0; }
        .cart-empty-page p { color: var(--gray-mid); font-size: 0.82rem; margin: 1rem 0 2rem; }

        /* CHECKOUT PAGE */
        .checkout-page { padding: 4rem 2.5rem; max-width: 1100px; margin: 0 auto; }
        .checkout-grid { display: grid; grid-template-columns: 1fr 380px; gap: 4rem; margin-top: 3rem; }
        .checkout-section { margin-bottom: 2.5rem; }
        .checkout-section-title { font-family: 'Marcellus', serif; font-size: 1rem; font-weight: 400; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
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
        .delivery-option-price { font-size: 0.78rem; font-weight: 600; }
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
        .checkout-item-model { font-family: 'Marcellus', serif; font-size: 0.82rem; display: block; }
        .checkout-item-price { font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .place-order-btn { width: 100%; padding: 1.1rem; font-size: 0.6rem; letter-spacing: 0.22em; text-transform: uppercase; background: var(--gold); color: white; border: none; cursor: pointer; font-family: 'Jost', sans-serif; transition: background 0.2s; margin-top: 1.5rem; }
        .place-order-btn:hover { background: var(--gold-light); }
        .secure-note { font-size: 0.58rem; color: var(--gray-light); text-align: center; margin-top: 0.75rem; letter-spacing: 0.1em; }

        /* ACCOUNT PAGE */
        .account-page { padding: 4rem 2.5rem; max-width: 1100px; margin: 0 auto; min-height: 60vh; }
        .account-grid { display: grid; grid-template-columns: 220px 1fr; gap: 2.5rem; align-items: start; }
        .account-sidebar { display: flex; flex-direction: column; position: sticky; top: 90px; border: 1px solid var(--border); }
        .account-tab { text-align: left; background: none; border: none; border-bottom: 1px solid var(--border); padding: 1rem 1.25rem; font-family: 'Jost', sans-serif; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-mid); cursor: pointer; transition: color 0.2s, background 0.2s; }
        .account-tab:last-child { border-bottom: none; }
        .account-tab:hover { color: var(--black); background: var(--gray-pale); }
        .account-tab.active { color: var(--gold); background: var(--gray-pale); border-left: 2px solid var(--gold); padding-left: calc(1.25rem - 2px); }
        .account-content { display: flex; flex-direction: column; gap: 1.5rem; }
        .empty-state { padding: 3rem 1rem; text-align: center; color: var(--gray-mid); font-size: 0.82rem; }
        .order-list { display: flex; flex-direction: column; gap: 1.25rem; }
        .order-card { border: 1px solid var(--border); }
        .order-card-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: var(--gray-pale); border-bottom: 1px solid var(--border); }
        .order-card-id { display: block; font-size: 0.8rem; font-weight: 500; color: var(--black); }
        .order-card-date { display: block; font-size: 0.68rem; color: var(--gray-mid); margin-top: 0.2rem; }
        .order-status { font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.35rem 0.75rem; background: white; border: 1px solid var(--border); color: var(--gray-mid); }
        .order-status-pending { color: #b3821e; border-color: #f0dca6; background: #fef8ec; }
        .order-status-confirmed, .order-status-completed { color: #1e7a34; border-color: #b7e3c2; background: #eefaf0; }
        .order-status-cancelled { color: #b3261e; border-color: #f3c6c2; background: #fdecea; }
        .order-card-items { padding: 0.5rem 1.25rem; }
        .order-card-footer { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--gray-mid); }
        @media (max-width: 768px) { .account-grid { grid-template-columns: 1fr; } .account-sidebar { position: static; flex-direction: row; flex-wrap: wrap; } .account-tab { flex: 1; text-align: center; border-bottom: 1px solid var(--border); } }

        /* ADDRESSES */
        .address-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
        .address-card { border: 1px solid var(--border); padding: 1.1rem 1.25rem; }
        .address-card-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; }
        .address-card-label { font-size: 0.85rem; font-weight: 500; color: var(--black); }
        .address-default-badge { font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: white; padding: 0.2rem 0.55rem; }
        .address-card-body { font-size: 0.78rem; color: var(--gray-mid); line-height: 1.7; margin-bottom: 0.9rem; }
        .address-card-actions { display: flex; gap: 1.25rem; }
        .address-action-btn { background: none; border: none; padding: 0; font-family: 'Jost', sans-serif; font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold); cursor: pointer; text-decoration: underline; }
        .address-action-btn:hover { color: var(--gold-light); }
        .address-action-danger { color: #b3261e; }
        .address-action-danger:hover { color: #d0433a; }
        .address-chip-row { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 1.25rem; }
        .address-chip { background: white; border: 1px solid var(--border); padding: 0.55rem 1rem; font-family: 'Jost', sans-serif; font-size: 0.68rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--gray-mid); cursor: pointer; transition: border-color 0.2s, color 0.2s, background 0.2s; }
        .address-chip:hover { border-color: var(--gold); color: var(--black); }
        .address-chip.active { border-color: var(--gold); background: var(--gray-pale); color: var(--gold); }

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
        .sell-step-num { font-family: 'Marcellus', serif; font-size: 2.5rem; color: var(--gold); opacity: 0.5; display: block; margin-bottom: 1rem; }
        .sell-step h3 { font-family: 'Marcellus', serif; font-size: 1rem; font-weight: 400; margin-bottom: 0.6rem; }
        .sell-step p { font-size: 0.75rem; color: var(--gray-mid); line-height: 1.8; }

        /* WISHLIST */
        .wishlist-page { padding: 4rem 2.5rem; max-width: 1300px; margin: 0 auto; min-height: 60vh; }
        .wishlist-empty { text-align: center; padding: 5rem 0; }
        .wishlist-empty p { font-size: 0.82rem; color: var(--gray-mid); margin-top: 1rem; }

        /* CATEGORIES */
        .categories { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; padding: 4rem 2.5rem; max-width: 1300px; margin: 0 auto; }
        .cat-card { cursor: pointer; display: flex; flex-direction: column; }
        .cat-img-wrap { position: relative; overflow: hidden; aspect-ratio: 4/5; background: var(--gray-pale); }
        .cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; display: block; }
        .cat-card:hover .cat-img-wrap img { transform: scale(1.04); }
        .cat-text { padding: 1rem 0 0.5rem; border-bottom: 2px solid var(--black); margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; }
        .cat-name { font-family: 'Jost', sans-serif; font-size: 0.95rem; font-weight: 500; letter-spacing: 0.05em; color: var(--black); text-transform: none; }
        .cat-arrow { font-size: 1rem; color: var(--black); transition: transform 0.2s; }
        .cat-card:hover .cat-arrow { transform: translateX(4px); }
        .cat-eyebrow { font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.35rem; display: block; font-weight: 500; }
        @media (max-width: 768px) { .categories { grid-template-columns: 1fr; gap: 2rem; padding: 2.5rem 1.5rem; } }

        /* ABOUT */
        .about-strip { padding: 5rem 2.5rem; max-width: 700px; margin: 0 auto; text-align: center; }
        .about-body { font-size: 0.88rem; line-height: 2; color: var(--gray-mid); margin: 1.5rem 0 2.5rem; }

        /* PILLARS */
        .pillars { background: #2A1216; padding: 5rem 2.5rem; }
        .pillars-inner { max-width: 1100px; margin: 0 auto; }
        .pillars-inner .section-title { color: white; }
        .pillars-inner .section-eyebrow { color: #D4AA78; }
        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.08); margin-top: 3rem; }
        .pillar { padding: 2.5rem 2rem; background: #2A1216; transition: background 0.3s; }
        .pillar:hover { background: #351A1F; }
        .pillar-num { font-family: 'Marcellus', serif; font-size: 2rem; color: var(--gold); opacity: 0.5; display: block; margin-bottom: 1.25rem; }
        .pillar-title { font-family: 'Marcellus', serif; font-size: 1.1rem; font-weight: 400; color: white; margin-bottom: 0.75rem; }
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
        .calendar-month { font-family: 'Marcellus', serif; font-size: 1.1rem; font-weight: 400; }
        .calendar-nav { background: none; border: 1px solid var(--border); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--black); transition: all 0.2s; }
        .calendar-nav:hover { background: var(--burgundy); color: white; border-color: var(--burgundy); }
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
        .booking-selected-slot-value { font-family: 'Marcellus', serif; font-size: 0.95rem; }
        .booking-success { text-align: center; padding: 3rem 0; }
        .booking-success-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 1.5rem; }
        @media (max-width: 768px) { .booking-grid { grid-template-columns: 1fr; gap: 2.5rem; } .time-slots-grid { grid-template-columns: repeat(4, 1fr); } }
        .btn-outline { display: inline-block; border: 1px solid var(--black); color: var(--black); text-decoration: none; padding: 0.8rem 2.5rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; transition: all 0.3s; background: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 300; }
        .btn-outline:hover { background: var(--burgundy); color: white; }
        .btn-gold { display: inline-block; background: var(--gold); color: white; text-decoration: none; padding: 0.8rem 2.5rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; transition: background 0.3s; border: none; cursor: pointer; font-family: 'Jost', sans-serif; }
        .btn-gold:hover { background: var(--gold-light); }

        /* FOOTER */
        footer { background: var(--gray-pale); border-top: 1px solid var(--border); padding: 5rem 2.5rem 2.5rem; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
        .footer-brand { font-family: 'Marcellus', serif; font-size: 1.3rem; letter-spacing: 0.2em; color: var(--black); text-transform: uppercase; display: block; margin-bottom: 1rem; }
        .footer-tagline { font-size: 0.82rem; line-height: 1.9; color: var(--gray-mid); max-width: 240px; }
        .footer-col-title { font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--black); margin-bottom: 1.5rem; display: block; font-weight: 600; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.85rem; }
        .footer-links a, .footer-links button { color: var(--gray-mid); text-decoration: none; font-size: 0.88rem; transition: color 0.2s; background: none; border: none; cursor: pointer; padding: 0; text-align: left; font-family: 'Jost', sans-serif; font-weight: 400; }
        .footer-links a:hover, .footer-links button:hover { color: var(--gold); }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 1rem; }
        .footer-copy { font-size: 0.75rem; color: var(--gray-mid); }
        .footer-social { display: flex; gap: 1.5rem; }
        .footer-social a { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray-mid); text-decoration: none; transition: color 0.2s; font-weight: 500; }
        .footer-social a:hover { color: var(--gold); }
        .whatsapp-fab { position: fixed; bottom: 1.5rem; right: 1.5rem; height: 48px; padding: 0 1.25rem; border-radius: 24px; background: #25D366; display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: white; box-shadow: 0 4px 16px rgba(37,211,102,0.35); z-index: 100; transition: transform 0.2s, box-shadow 0.2s; }
        .whatsapp-fab:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,211,102,0.45); }

        @media (max-width: 768px) {
          .featured-grid, .watches-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .pillars-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          .contact-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .hero-content { left: 1.5rem; right: 1.5rem; bottom: 3.5rem; }
          .hero-title { font-size: clamp(2.2rem, 9vw, 3.2rem); }
          .hero-dots { bottom: 1.25rem; right: 1.5rem; }
          .hero-eyebrow { font-size: 0.52rem; margin-bottom: 0.6rem; }
          .hero-sub { font-size: 0.62rem; margin-top: 0.5rem; }
          .topbar, .categorybar { padding: 0 1.1rem; }
          .topbar-side.right { gap: 0.9rem; }
          .topbar-side { gap: 0.75rem; }
          .topbar { height: 64px; }
          .nav-logo { font-size: 1.25rem; letter-spacing: 0.14em; }
          .mobile-menu { top: 64px; }
          .sell-steps { grid-template-columns: 1fr; }
          .product-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .product-gallery { flex-direction: column-reverse; position: static; }
          .product-thumbs { flex-direction: row; gap: 0.4rem; max-height: none; overflow-x: auto; overflow-y: hidden; }
          .cart-page-grid { grid-template-columns: 1fr; }
          .checkout-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .cart-drawer { width: 100vw; }
        }
      `}</style>

      {/* IMAGE ZOOM MODAL */}
      {selectedWatch && (() => {
        const zoomMedia = selectedWatch.images?.[activeImgIdx] || getImg(selectedWatch);
        const handleMagnifyMove = (e: ReactMouseEvent<HTMLDivElement>) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setMagnifyPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
        };
        return (
          <div className={`zoom-overlay${zoomOpen ? " open" : ""}`} onClick={() => setZoomOpen(false)}>
            <button className="zoom-close" onClick={() => setZoomOpen(false)}>×</button>
            {isVideo(zoomMedia)
              ? <video src={zoomMedia} controls autoPlay muted playsInline className="zoom-img" onClick={e => e.stopPropagation()} />
              : (
                <div
                  className="zoom-img-wrap"
                  onClick={e => e.stopPropagation()}
                  onMouseMove={handleMagnifyMove}
                  onMouseEnter={() => setMagnifyActive(true)}
                  onMouseLeave={() => setMagnifyActive(false)}
                >
                  <img src={zoomMedia} alt={selectedWatch.model} className="zoom-img" />
                  {magnifyActive && (
                    <div
                      className="zoom-magnifier"
                      style={{ backgroundImage: `url(${zoomMedia})`, backgroundPosition: `${magnifyPos.x}% ${magnifyPos.y}%` }}
                    />
                  )}
                </div>
              )
            }
            {selectedWatch.images?.length > 1 && (
              <>
                <button className="zoom-nav zoom-nav-prev" onClick={e => { e.stopPropagation(); setMagnifyActive(false); setActiveImgIdx(i => (i - 1 + selectedWatch.images.length) % selectedWatch.images.length); }}>‹</button>
                <button className="zoom-nav zoom-nav-next" onClick={e => { e.stopPropagation(); setMagnifyActive(false); setActiveImgIdx(i => (i + 1) % selectedWatch.images.length); }}>›</button>
                <span className="zoom-counter">{activeImgIdx + 1} / {selectedWatch.images.length}</span>
              </>
            )}
          </div>
        );
      })()}

      {/* AUTH MODAL */}
      <div className={`currency-modal-overlay${authModalOpen ? " open" : ""}`} onClick={() => setAuthModalOpen(false)}>
        <div className="auth-modal" onClick={e => e.stopPropagation()}>
          <div className="currency-modal-header">
            <span className="currency-modal-title">{authMode === "login" ? "Welcome Back" : "Create Account"}</span>
            <button className="currency-modal-close" onClick={() => setAuthModalOpen(false)}>×</button>
          </div>
          <div className="currency-modal-body">
            <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.02l7.73 6c4.51-4.18 7.09-10.36 7.09-17.49z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>
            <div className="auth-divider"><span>or</span></div>
            <form onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="Your name" required value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="your@email.com" required value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" required minLength={6} value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              {authError && <div className="auth-error">{authError}</div>}
              {authMessage && <div className="auth-message">{authMessage}</div>}
              <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: "0.5rem" }} disabled={authSubmitting}>
                {authSubmitting ? "Please wait…" : authMode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
            <div className="auth-toggle">
              {authMode === "login" ? (
                <>Don't have an account? <button type="button" onClick={() => { setAuthMode("signup"); setAuthError(null); setAuthMessage(null); }}>Sign Up</button></>
              ) : (
                <>Already have an account? <button type="button" onClick={() => { setAuthMode("login"); setAuthError(null); setAuthMessage(null); }}>Sign In</button></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CURRENCY MODAL */}
      <div className={`currency-modal-overlay${currencyDropdownOpen ? " open" : ""}`} onClick={() => setCurrencyDropdownOpen(false)}>
        <div className="currency-modal" onClick={e => e.stopPropagation()}>
          <div className="currency-modal-header">
            <span className="currency-modal-title">Select Currency</span>
            <button className="currency-modal-close" onClick={() => setCurrencyDropdownOpen(false)}>×</button>
          </div>
          <div className="currency-modal-body">
            <div className="currency-grid">
              {Object.keys(CURRENCY_META).map(code => (
                <button key={code} className={`currency-cell${currency === code ? " active" : ""}`} onClick={() => changeCurrency(code)}>
                  <span className="currency-cell-flag">{CURRENCY_META[code].flag}</span>
                  <div className="currency-cell-text">
                    <span className="currency-cell-code">{code} <span className="currency-cell-symbol">{CURRENCY_META[code].symbol}</span></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {ratesUpdatedAt && (
            <div className="currency-updated-note">
              Exchange rates updated {new Date(ratesUpdatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
        </div>
      </div>

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
                    skipNextFacetResetRef.current = true;
                    setActiveFacets({ brand: [b] }); goTo("watches");
                  }}>{b}</button>
                ))}
                <button className="search-brand-pill" onClick={() => {
                  setSearchOpen(false); setSearchQuery(""); setActiveFacets({}); goTo("watches");
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
                    <div className="watch-img-wrap" onClick={() => { setSearchOpen(false); setSearchQuery(""); openProductInNewTab(w); }}>
                      <img src={getImg(w)} alt={w.model} />
                      <span className="watch-status">{w.status}</span>
                      <button className={`wishlist-btn${wishlist.includes(w.id) ? " active" : ""}`} onClick={e => { e.stopPropagation(); toggleWishlist(w.id); }}>
                        {wishlist.includes(w.id) ? "♥" : "♡"}
                      </button>
                    </div>
                    <span className="watch-brand">{w.brand}</span>
                    <span className="watch-model" onClick={() => { setSearchOpen(false); setSearchQuery(""); openProductInNewTab(w); }} style={{cursor:"pointer"}}>{w.model}</span>
                    <span className="watch-ref">{w.ref}</span>
                    <span className="watch-price">{fmtPrice(w.price)}</span>
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
                  <span className="cart-item-price">{fmtPrice(item.watch.price)}</span>
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
              <span className="cart-subtotal-value">{fmtPrice(cartTotal)}</span>
            </div>
            <div className="cart-cta">
              <button className="btn-gold" style={{width:"100%",textAlign:"center"}} onClick={() => { setCartOpen(false); goTo("checkout"); }}>Proceed to Checkout</button>
              <button className="btn-outline" style={{width:"100%",textAlign:"center"}} onClick={() => { setCartOpen(false); goTo("cart"); }}>View Cart</button>
            </div>
          </div>
        )}
      </div>

      {/* TOP BAR (frozen) */}
      <nav className={`topbar${scrolled ? " scrolled" : ""}`} ref={navRef}>
        <div className="topbar-side">
          <button className={`mobile-hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
          <button className="nav-icon-btn always-show" onClick={() => setSearchOpen(true)} title="Search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button className={`nav-link${page === "contact" ? " active" : ""}`} onClick={() => goTo("contact")}>Contact</button>
          <button className={`nav-link${page === "booking" ? " active" : ""}`} onClick={() => goTo("booking")}>Book Appointment</button>
        </div>

        <button className="nav-logo" onClick={() => goTo("home")}>Chronovian</button>

        <div className="topbar-side right">
          <div className="nav-dropdown-wrap" onMouseEnter={() => user && setAccountDropdownOpen(true)} onMouseLeave={() => setAccountDropdownOpen(false)}>
            <button
              className="nav-icon-btn always-show"
              title={user ? "My Account" : "Sign In / Sign Up"}
              onClick={() => { if (user) setAccountDropdownOpen(o => !o); else { setAuthMode("login"); resetAuthForm(); setAuthModalOpen(true); } }}
            >
              {user ? (
                <span className="account-avatar">{(user.user_metadata?.full_name || user.email || "?").charAt(0).toUpperCase()}</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
            </button>
            {user && (
              <div className={`nav-dropdown account-dropdown${accountDropdownOpen ? " open" : ""}`}>
                <div className="account-dropdown-name">{user.user_metadata?.full_name || "Welcome"}</div>
                <div className="account-dropdown-email">{user.email}</div>
                <button className="nav-dropdown-item" onClick={() => { setAccountDropdownOpen(false); goTo("account"); }}>My Account</button>
                <button className="nav-dropdown-item" onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
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

      {/* CATEGORY BAR (scrolls away) */}
      <div className="categorybar">
        <button className={`nav-link${page === "watches" ? " active" : ""}`} onClick={() => goTo("watches")}>Watches</button>
        <button className={`nav-link${page === "jewellery" ? " active" : ""}`} onClick={() => goTo("jewellery")}>Jewellery</button>
        <button className={`nav-link${page === "bags" ? " active" : ""}`} onClick={() => goTo("bags")}>Bags</button>
        <button className={`nav-link${page === "accessories" ? " active" : ""}`} onClick={() => goTo("accessories")}>Accessories</button>
        {([
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
        <div className="currency-wrap">
          <button className="currency-trigger" onClick={() => setCurrencyDropdownOpen(true)}>
            <span style={{fontSize:"0.9rem"}}>{CURRENCY_META[currency]?.flag}</span> {currency}
            <svg width="9" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>


      {/* MOBILE MENU */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <button className="mobile-plain" onClick={() => goTo("watches")}>Watches</button>
        <button className="mobile-plain" onClick={() => goTo("jewellery")}>Jewellery</button>
        <button className="mobile-plain" onClick={() => goTo("bags")}>Bags</button>
        <button className="mobile-plain" onClick={() => goTo("accessories")}>Accessories</button>
        {([
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
        {user ? (
          <>
            <button className="mobile-plain" onClick={() => { setMenuOpen(false); goTo("account"); }}>My Account</button>
            <button className="mobile-plain" onClick={() => { setMenuOpen(false); handleSignOut(); }}>Sign Out</button>
          </>
        ) : (
          <button className="mobile-plain" onClick={() => { setMenuOpen(false); setAuthMode("login"); resetAuthForm(); setAuthModalOpen(true); }}>Sign In / Sign Up</button>
        )}
        <button className="mobile-plain" onClick={() => { setMenuOpen(false); goTo("wishlist"); }}>Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</button>
        <button className="mobile-plain" onClick={() => { setMenuOpen(false); setCartOpen(true); }}>Cart {cartCount > 0 && `(${cartCount})`}</button>
        <div style={{padding:"1rem 0"}}>
          <span style={{fontSize:"0.55rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--gray-mid)",display:"block",marginBottom:"0.75rem"}}>Currency</span>
          <select className="form-select" value={currency} onChange={e => changeCurrency(e.target.value)} style={{width:"100%"}}>
            {Object.keys(CURRENCY_META).map(code => (
              <option key={code} value={code}>{CURRENCY_META[code].symbol} {CURRENCY_META[code].label} ({code})</option>
            ))}
          </select>
        </div>
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
                <div className="product-img-main">
                  {(() => {
                    const currentMedia = selectedWatch.images?.[activeImgIdx] || getImg(selectedWatch);
                    return isVideo(currentMedia)
                      ? <video key={currentMedia} src={currentMedia} controls autoPlay muted playsInline style={{width:"100%",height:"100%",objectFit:"cover"}} />
                      : <img src={currentMedia} alt={`${selectedWatch.model} ${activeImgIdx + 1}`} onClick={() => setZoomOpen(true)} />;
                  })()}
                  {selectedWatch.images?.length > 1 && (
                    <>
                      <button className="gallery-nav gallery-nav-prev" onClick={() => setActiveImgIdx(i => (i - 1 + selectedWatch.images.length) % selectedWatch.images.length)}>‹</button>
                      <button className="gallery-nav gallery-nav-next" onClick={() => setActiveImgIdx(i => (i + 1) % selectedWatch.images.length)}>›</button>
                      <span className="gallery-counter">{activeImgIdx + 1} / {selectedWatch.images.length}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="product-info">
                <span className="product-brand">{selectedWatch.brand}</span>
                <h1 className="product-model">{selectedWatch.model}</h1>
                <span className="product-ref">Model No: {selectedWatch.ref}</span>

                <div className="product-price-row">
                  <span className="product-price">{fmtPrice(selectedWatch.price)}</span>
                  <span className="product-price-tax-note">*Inclusive of all taxes</span>
                </div>

                <div className="product-cta-row">
                  <a className="btn-contact-us" href={`mailto:enquiries@chronovian.com?subject=Enquiry: ${selectedWatch.brand} ${selectedWatch.model}`}>Contact Us</a>
                  <button className="btn-buy-online" onClick={() => { addToCart(selectedWatch); setCartOpen(false); goTo("checkout"); }}>Buy Online</button>
                </div>

                <div className="product-secondary-row">
                  <button className="btn-addcart-sm" onClick={() => addToCart(selectedWatch)}>Add to Cart</button>
                  <button className="product-wishlist" onClick={() => toggleWishlist(selectedWatch.id)}>
                    {wishlist.includes(selectedWatch.id) ? "♥ Saved" : "♡ Save to Wishlist"}
                  </button>
                </div>

                {selectedWatch.description && <p className="product-desc">{selectedWatch.description}</p>}

                {(() => {
                  const cat = selectedWatch.category;
                  const specColumns = [
                    { title: "Details", rows: [
                      { label: "Condition", value: selectedWatch.condition },
                      { label: "Purchase Year", value: selectedWatch.year },
                      { label: "Watch Box", value: selectedWatch.box ? "Included" : "Not included" },
                      { label: "Papers", value: selectedWatch.papers ? "Included" : "Not included" },
                      { label: "Status", value: selectedWatch.status },
                    ]},
                    ...(cat === "watches" ? [
                      { title: "Movement", rows: [
                        { label: "Movement", value: selectedWatch.movement },
                        { label: "Calibre", value: selectedWatch.calibre },
                      ]},
                      { title: "Case", rows: [
                        { label: "Case Size", value: selectedWatch.case_size },
                        { label: "Case Thickness", value: selectedWatch.case_thickness },
                        { label: "Case Shape", value: selectedWatch.case_shape },
                        { label: "Case Material", value: selectedWatch.case_material },
                        { label: "Case Back", value: selectedWatch.case_back },
                        { label: "Glass Material", value: selectedWatch.glass_material },
                      ]},
                      { title: "Dial", rows: [
                        { label: "Dial Colour", value: selectedWatch.dial_color },
                      ]},
                      { title: "Strap", rows: [
                        { label: "Strap Material", value: selectedWatch.bracelet_material },
                        { label: "Strap Colour", value: selectedWatch.strap_colour },
                        { label: "Clasp Type", value: selectedWatch.clasp_type },
                        { label: "Buckle/Clasp Material", value: selectedWatch.buckle_clasp_material },
                      ]},
                      { title: "Other", rows: [
                        { label: "Precious Stone", value: selectedWatch.gemstone },
                        { label: "Gender", value: selectedWatch.gender },
                        { label: "Water Resistance (M)", value: selectedWatch.water_resistance },
                        { label: "Warranty Period", value: selectedWatch.warranty_period, link: selectedWatch.warranty_register_url },
                        { label: "Country Of Origin", value: selectedWatch.country_of_origin },
                      ]},
                    ] : []),
                    ...(cat === "jewellery" ? [
                      { title: "Jewellery", rows: [
                        { label: "Material", value: selectedWatch.material },
                        { label: "Gemstone", value: selectedWatch.gemstone },
                        { label: "Weight", value: selectedWatch.weight },
                      ]},
                    ] : []),
                    ...(cat === "bags" ? [
                      { title: "Bag", rows: [
                        { label: "Colour", value: selectedWatch.color },
                        { label: "Hardware", value: selectedWatch.hardware },
                        { label: "Size", value: selectedWatch.size },
                      ]},
                    ] : []),
                  ].map(col => ({ ...col, rows: col.rows.filter(r => r.value) })).filter(col => col.rows.length > 0);

                  const topRow = [
                    { label: "Brand", value: selectedWatch.brand },
                    { label: "Collection", value: selectedWatch.collection },
                    { label: "Series", value: selectedWatch.series },
                    { label: "Model No", value: selectedWatch.ref },
                  ].filter(r => r.value);

                  if (specColumns.length === 0 && topRow.length === 0) return null;

                  return (
                    <div className="full-spec-section">
                      <span className="full-spec-eyebrow">Full Specification</span>
                      {topRow.length > 0 && (
                        <div className="full-spec-top-row">
                          {topRow.map(r => (
                            <div key={r.label} className="full-spec-top-item">
                              <span className="full-spec-label">{r.label}</span>
                              <span className="full-spec-value">{r.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {specColumns.length > 0 && (() => {
                        // Distribute groups into 2 independent vertical stacks, balanced by row count,
                        // so a short group (e.g. Movement) never gets stretched to match a taller
                        // neighbour (e.g. Details) — each stack simply ends at its own natural height.
                        const stacks: (typeof specColumns)[] = [[], []];
                        const stackWeights = [0, 0];
                        specColumns.forEach(col => {
                          const target = stackWeights[0] <= stackWeights[1] ? 0 : 1;
                          stacks[target].push(col);
                          stackWeights[target] += col.rows.length + 1;
                        });
                        return (
                          <div className="full-spec-columns">
                            {stacks.filter(s => s.length > 0).map((stack, si) => (
                              <div className="full-spec-col-stack" key={si}>
                                {stack.map(col => (
                                  <div className="full-spec-col" key={col.title}>
                                    <span className="full-spec-col-title">{col.title}</span>
                                    {col.rows.map(r => (
                                      <div className="full-spec-row" key={r.label}>
                                        <span className="full-spec-label">{r.label}</span>
                                        <span className="full-spec-value">
                                          {r.value}
                                          {(r as any).link && <><br /><a href={(r as any).link} target="_blank" rel="noopener noreferrer" className="full-spec-link">Register here</a></>}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            </div>

            {(() => {
              const similar = allWatches.filter(w => w.brand === selectedWatch.brand && w.id !== selectedWatch.id).slice(0, 4);
              if (similar.length === 0) return null;
              return (
                <div className="similar-products-section">
                  <span className="section-eyebrow">More From {selectedWatch.brand}</span>
                  <h2 className="you-may-like-title">You May Also Like</h2>
                  <div className="similar-products-grid">
                    {similar.map(w => <WatchCard key={w.id} w={w} />)}
                  </div>
                </div>
              );
            })()}
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
            </div>
            <div className={`listing-layout${isFiltersOpen("watches") ? "" : " filters-collapsed"}`}>
              {isFiltersOpen("watches") && renderFilterSidebar("watches")}
              <div className="listing-main">
                <div className="listing-toolbar">
                  {renderFiltersToggle("watches")}
                  {renderSortControl()}
                </div>
                <div className="watches-grid">
                  {productsLoading
                    ? Array.from({ length: 9 }).map((_, i) => (
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
                      : filteredWatches.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE).map(w => <WatchCard key={w.id} w={w} showEnquire />)
                  }
                </div>
                {!productsLoading && renderPagination(filteredWatches.length)}
              </div>
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
                          <span className="cart-page-price">{fmtPrice(item.watch.price)}</span>
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
                        <span>{fmtPrice(item.watch.price)}</span>
                      </div>
                    ))}
                    <div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
                    <div className="summary-total">
                      <span className="summary-total-label">Total</span>
                      <span className="summary-total-value">{fmtPrice(cartTotal)}</span>
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
                <button className="btn-outline" onClick={() => { setOrderPlaced(false); setCart([]); setCheckoutForm({ firstName: "", lastName: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", pin: "", state: "Telangana", delivery: "home", payment: "upi" }); setSelectedAddressId(null); goTo("home"); }}>Return Home</button>
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
                        <div className="form-group"><label className="form-label">First Name</label><input className="form-input" type="text" placeholder="First name" required value={checkoutForm.firstName} onChange={e => setCheckoutForm(f => ({ ...f, firstName: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" type="text" placeholder="Last name" required value={checkoutForm.lastName} onChange={e => setCheckoutForm(f => ({ ...f, lastName: e.target.value }))} /></div>
                      </div>
                      <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="your@email.com" required value={checkoutForm.email} onChange={e => setCheckoutForm(f => ({ ...f, email: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" placeholder="+91 00000 00000" required value={checkoutForm.phone} onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    </div>
                    {/* DELIVERY */}
                    <div className="checkout-section">
                      <div className="checkout-section-title">Delivery Method</div>
                      {[
                        { id: "home", name: "Home Delivery", sub: "Insured courier — 3 to 5 business days", price: "₹500" },
                        { id: "store", name: "In-Store Collection", sub: "Hyderabad boutique — by appointment only", price: "Free" },
                      ].map(opt => (
                        <div className={`delivery-option${checkoutForm.delivery === opt.id ? " selected" : ""}`} key={opt.id} style={{marginBottom:"0.5rem",cursor:"pointer"}} onClick={() => setCheckoutForm(f => ({ ...f, delivery: opt.id }))}>
                          <input type="radio" name="delivery" checked={checkoutForm.delivery === opt.id} onChange={() => setCheckoutForm(f => ({ ...f, delivery: opt.id }))} />
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
                      {user && myAddresses.length > 0 && (
                        <div className="address-chip-row">
                          {myAddresses.map(addr => (
                            <button type="button" key={addr.id} className={`address-chip${selectedAddressId === addr.id ? " active" : ""}`} onClick={() => applyAddressToCheckout(addr)}>
                              {addr.label}{addr.is_default && " ★"}
                            </button>
                          ))}
                          <button type="button" className={`address-chip${selectedAddressId === null ? " active" : ""}`} onClick={() => { setSelectedAddressId(null); setCheckoutForm(f => ({ ...f, addressLine1: "", addressLine2: "", city: "", state: "Telangana", pin: "" })); }}>+ New Address</button>
                        </div>
                      )}
                      <div className="form-group"><label className="form-label">Address Line 1</label><input className="form-input" type="text" placeholder="House / flat / street" required value={checkoutForm.addressLine1} onChange={e => setCheckoutForm(f => ({ ...f, addressLine1: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Address Line 2</label><input className="form-input" type="text" placeholder="Area / locality (optional)" value={checkoutForm.addressLine2} onChange={e => setCheckoutForm(f => ({ ...f, addressLine2: e.target.value }))} /></div>
                      <div className="form-row">
                        <div className="form-group"><label className="form-label">City</label><input className="form-input" type="text" placeholder="City" required value={checkoutForm.city} onChange={e => setCheckoutForm(f => ({ ...f, city: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">PIN Code</label><input className="form-input" type="text" placeholder="PIN code" required value={checkoutForm.pin} onChange={e => setCheckoutForm(f => ({ ...f, pin: e.target.value }))} /></div>
                      </div>
                      <div className="form-group"><label className="form-label">State</label>
                        <select className="form-select" value={checkoutForm.state} onChange={e => setCheckoutForm(f => ({ ...f, state: e.target.value }))}>
                          <option>Telangana</option><option>Andhra Pradesh</option><option>Maharashtra</option><option>Karnataka</option><option>Tamil Nadu</option><option>Delhi</option><option>Other</option>
                        </select>
                      </div>
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
                          <div className="payment-method" key={pm.id} style={{marginBottom:"0.5rem",cursor:"pointer"}} onClick={() => setCheckoutForm(f => ({ ...f, payment: pm.id }))}>
                            <input type="radio" name="payment" checked={checkoutForm.payment === pm.id} onChange={() => setCheckoutForm(f => ({ ...f, payment: pm.id }))} />
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
                        <span className="checkout-item-price">{fmtPrice(item.watch.price)}</span>
                      </div>
                    ))}
                    <div style={{marginTop:"1rem"}}>
                      <div className="summary-row"><span>Subtotal</span><span>{fmtPrice(cartTotal)}</span></div>
                      <div className="summary-row"><span>Shipping</span><span>₹500</span></div>
                      <div className="summary-row"><span>Insurance</span><span>Included</span></div>
                    </div>
                    <div className="summary-total" style={{marginTop:"0.75rem"}}>
                      <span className="summary-total-label">Total</span>
                      <span className="summary-total-value">{fmtPrice(cartTotal + 500)}</span>
                    </div>
                    {checkoutError && <div className="auth-error" style={{marginTop:"1rem"}}>{checkoutError}</div>}
                    <button className="place-order-btn" onClick={handlePlaceOrder} disabled={checkoutSaving}>{checkoutSaving ? "Placing Order…" : "Place Order"}</button>
                    <p className="secure-note">🔒 SSL Secured · All transactions encrypted</p>
                  </div>
                </div>
              </div>
          }
        </main>
      )}

      {/* ACCOUNT PAGE */}
      {page === "account" && (
        <main>
          <div className="account-page">
            <span className="section-eyebrow">Your Chronovian</span>
            <h1 className="section-title">My <em>Account</em></h1>
            <div className="gold-rule" style={{margin:"1.25rem 0 2.5rem"}} />

            {authLoading ? (
              <div className="empty-state">Loading…</div>
            ) : !user ? (
              <div className="empty-state">
                <p style={{marginBottom:"1.5rem"}}>Please sign in to view your account.</p>
                <button className="btn-gold" onClick={() => { setAuthMode("login"); resetAuthForm(); setAuthModalOpen(true); }}>Sign In</button>
              </div>
            ) : (
              <div className="account-grid">
                <div className="account-sidebar">
                  <button className={`account-tab${accountTab === "profile" ? " active" : ""}`} onClick={() => setAccountTab("profile")}>Profile</button>
                  <button className={`account-tab${accountTab === "addresses" ? " active" : ""}`} onClick={() => setAccountTab("addresses")}>My Addresses {myAddresses.length > 0 && `(${myAddresses.length})`}</button>
                  <button className={`account-tab${accountTab === "orders" ? " active" : ""}`} onClick={() => setAccountTab("orders")}>My Orders {myOrders.length > 0 && `(${myOrders.length})`}</button>
                  <button className={`account-tab${accountTab === "bookings" ? " active" : ""}`} onClick={() => setAccountTab("bookings")}>My Bookings {myBookings.length > 0 && `(${myBookings.length})`}</button>
                  <button className="account-tab" onClick={handleSignOut}>Sign Out</button>
                </div>

                <div className="account-content">
                  {accountTab === "profile" && (
                    <>
                      <div className="checkout-section">
                        <div className="checkout-section-title">Profile Details</div>
                        <form onSubmit={handleUpdateProfile}>
                          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" type="text" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={user.email || ""} disabled style={{opacity:0.6,cursor:"not-allowed"}} /></div>
                          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" placeholder="+91 00000 00000" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} /></div>
                          {profileError && <div className="auth-error">{profileError}</div>}
                          {profileMessage && <div className="auth-message">{profileMessage}</div>}
                          <button type="submit" className="btn-gold" disabled={profileSaving}>{profileSaving ? "Saving…" : "Save Changes"}</button>
                        </form>
                      </div>

                      <div className="checkout-section">
                        <div className="checkout-section-title">Change Password</div>
                        <form onSubmit={handleChangePassword}>
                          <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="••••••••" minLength={6} value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} /></div>
                          <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="••••••••" minLength={6} value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
                          {pwError && <div className="auth-error">{pwError}</div>}
                          {pwMessage && <div className="auth-message">{pwMessage}</div>}
                          <button type="submit" className="btn-outline" disabled={pwSaving}>{pwSaving ? "Updating…" : "Update Password"}</button>
                        </form>
                      </div>
                    </>
                  )}

                  {accountTab === "addresses" && (
                    <div className="checkout-section">
                      <div className="checkout-section-title" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>Saved Addresses</span>
                        {!showAddressForm && <button className="btn-outline" style={{padding:"0.5rem 1.1rem",fontSize:"0.6rem"}} onClick={() => { resetAddressForm(); setShowAddressForm(true); }}>+ Add Address</button>}
                      </div>

                      {addressesLoading ? (
                        <div className="empty-state">Loading your addresses…</div>
                      ) : (
                        <>
                          {myAddresses.length === 0 && !showAddressForm && (
                            <div className="empty-state"><p>You don't have any saved addresses yet.</p></div>
                          )}
                          {myAddresses.length > 0 && (
                            <div className="address-list">
                              {myAddresses.map(addr => (
                                <div className="address-card" key={addr.id}>
                                  <div className="address-card-header">
                                    <span className="address-card-label">{addr.label}</span>
                                    {addr.is_default && <span className="address-default-badge">Default</span>}
                                  </div>
                                  <div className="address-card-body">
                                    {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}<br />
                                    {addr.city}, {addr.state} {addr.pin}
                                  </div>
                                  <div className="address-card-actions">
                                    {!addr.is_default && <button className="address-action-btn" onClick={() => handleSetDefaultAddress(addr.id)}>Set as Default</button>}
                                    <button className="address-action-btn" onClick={() => handleEditAddress(addr)}>Edit</button>
                                    <button className="address-action-btn address-action-danger" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {showAddressForm && (
                        <form onSubmit={handleSaveAddress} style={{marginTop:"1.5rem", paddingTop: myAddresses.length > 0 ? "1.5rem" : 0, borderTop: myAddresses.length > 0 ? "1px solid var(--border)" : "none"}}>
                          <div className="form-group">
                            <label className="form-label">Label</label>
                            <select className="form-select" value={addressForm.label} onChange={e => setAddressForm(f => ({ ...f, label: e.target.value }))}>
                              <option>Home</option><option>Work</option><option>Gift Recipient</option><option>Other</option>
                            </select>
                          </div>
                          <div className="form-group"><label className="form-label">Address Line 1</label><input className="form-input" type="text" placeholder="House / flat / street" required value={addressForm.address_line1} onChange={e => setAddressForm(f => ({ ...f, address_line1: e.target.value }))} /></div>
                          <div className="form-group"><label className="form-label">Address Line 2</label><input className="form-input" type="text" placeholder="Area / locality (optional)" value={addressForm.address_line2} onChange={e => setAddressForm(f => ({ ...f, address_line2: e.target.value }))} /></div>
                          <div className="form-row">
                            <div className="form-group"><label className="form-label">City</label><input className="form-input" type="text" placeholder="City" required value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">PIN Code</label><input className="form-input" type="text" placeholder="PIN code" required value={addressForm.pin} onChange={e => setAddressForm(f => ({ ...f, pin: e.target.value }))} /></div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">State</label>
                            <select className="form-select" value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))}>
                              <option>Telangana</option><option>Andhra Pradesh</option><option>Maharashtra</option><option>Karnataka</option><option>Tamil Nadu</option><option>Delhi</option><option>Other</option>
                            </select>
                          </div>
                          {addressError && <div className="auth-error">{addressError}</div>}
                          <div style={{display:"flex",gap:"0.75rem"}}>
                            <button type="submit" className="btn-gold" disabled={addressSaving}>{addressSaving ? "Saving…" : editingAddressId ? "Update Address" : "Save Address"}</button>
                            <button type="button" className="btn-outline" onClick={() => { setShowAddressForm(false); resetAddressForm(); }}>Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {accountTab === "orders" && (
                    ordersLoading ? <div className="empty-state">Loading your orders…</div>
                    : myOrders.length === 0 ? (
                      <div className="empty-state">
                        <p style={{marginBottom:"1.5rem"}}>You haven't placed any orders yet.</p>
                        <button className="btn-outline" onClick={() => goTo("watches")}>Browse Watches</button>
                      </div>
                    ) : (
                      <div className="order-list">
                        {myOrders.map(order => (
                          <div className="order-card" key={order.id}>
                            <div className="order-card-header">
                              <div>
                                <span className="order-card-id">Order #{order.id.slice(0, 8)}</span>
                                <span className="order-card-date">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                              </div>
                              <span className={`order-status order-status-${order.status.toLowerCase()}`}>{order.status}</span>
                            </div>
                            <div className="order-card-items">
                              {(order.items || []).map((it, idx) => (
                                <div className="checkout-item-row" key={idx}>
                                  <img className="checkout-item-img" src={it.image} alt={it.model} />
                                  <div className="checkout-item-info">
                                    <span className="checkout-item-brand">{it.brand}</span>
                                    <span className="checkout-item-model">{it.model}</span>
                                    <span style={{fontSize:"0.6rem",color:"var(--gray-light)"}}>{it.ref} · Qty {it.qty}</span>
                                  </div>
                                  <span className="checkout-item-price">{fmtPrice(it.price)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="order-card-footer">
                              <span>{order.delivery_method === "store" ? "In-Store Collection" : "Home Delivery"}</span>
                              <span className="summary-total-value">{fmtPrice(order.total)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {accountTab === "bookings" && (
                    myBookingsLoading ? <div className="empty-state">Loading your appointments…</div>
                    : myBookings.length === 0 ? (
                      <div className="empty-state">
                        <p style={{marginBottom:"1.5rem"}}>You don't have any appointments booked yet.</p>
                        <button className="btn-outline" onClick={() => goTo("booking")}>Book an Appointment</button>
                      </div>
                    ) : (
                      <div className="order-list">
                        {myBookings.map(b => (
                          <div className="order-card" key={b.id}>
                            <div className="order-card-header">
                              <div>
                                <span className="order-card-id">{b.date}</span>
                                <span className="order-card-date">{b.time}</span>
                              </div>
                              <span className={`order-status order-status-${(b.status || "pending").toLowerCase()}`}>{b.status || "Pending"}</span>
                            </div>
                            <div style={{padding:"1rem 1.25rem",fontSize:"0.78rem",color:"var(--gray-mid)",lineHeight:1.8}}>
                              <div><strong style={{color:"var(--black)"}}>Interest:</strong> {b.interest}</div>
                              {b.notes && <div><strong style={{color:"var(--black)"}}>Notes:</strong> {b.notes}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      )}
      {page === "jewellery" && (
        <main>
          <div className="watches-page">
            <div className="watches-page-header">
              <span className="section-eyebrow">Fine Jewellery</span>
              <h1 className="section-title">Jewellery</h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
            </div>
            <div className={`listing-layout${isFiltersOpen("jewellery") ? "" : " filters-collapsed"}`}>
              {isFiltersOpen("jewellery") && renderFilterSidebar("jewellery")}
              <div className="listing-main">
                <div className="listing-toolbar">
                  {renderFiltersToggle("jewellery")}
                  {renderSortControl()}
                </div>
                {(() => {
                  const jewelleryList = getCategoryList("jewellery");
                  return (
                    <>
                      <div className="watches-grid">
                        {productsLoading
                          ? Array.from({ length: 9 }).map((_, i) => (
                              <div className="skeleton-card" key={i}>
                                <div className="skeleton skeleton-img" />
                                <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                                <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                              </div>
                            ))
                          : jewelleryList.length === 0
                            ? <div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem 0"}}>
                                <span className="section-eyebrow">{allWatches.filter(w => w.category === "jewellery").length === 0 ? "Coming Soon" : "No Matches"}</span>
                                <p style={{fontSize:"0.82rem",color:"var(--gray-mid)",marginTop:"1rem",lineHeight:1.9}}>{allWatches.filter(w => w.category === "jewellery").length === 0 ? "Our jewellery collection is being curated. Contact us to enquire about specific pieces." : "No pieces match your current filters."}</p>
                                <a href="mailto:enquiries@chronovian.com?subject=Jewellery Enquiry" className="btn-gold" style={{display:"inline-block",marginTop:"1.5rem"}}>Enquire Now</a>
                              </div>
                            : jewelleryList.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE).map(w => <WatchCard key={w.id} w={w} showEnquire />)
                        }
                      </div>
                      {!productsLoading && renderPagination(jewelleryList.length)}
                    </>
                  );
                })()}
              </div>
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
              <h1 className="section-title">Bags</h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
            </div>
            <div className={`listing-layout${isFiltersOpen("bags") ? "" : " filters-collapsed"}`}>
              {isFiltersOpen("bags") && renderFilterSidebar("bags")}
              <div className="listing-main">
                <div className="listing-toolbar">
                  {renderFiltersToggle("bags")}
                  {renderSortControl()}
                </div>
                {(() => {
                  const bagsList = getCategoryList("bags");
                  return (
                    <>
                      <div className="watches-grid">
                        {productsLoading
                          ? Array.from({ length: 9 }).map((_, i) => (
                              <div className="skeleton-card" key={i}>
                                <div className="skeleton skeleton-img" />
                                <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                                <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                              </div>
                            ))
                          : bagsList.length === 0
                            ? <div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem 0"}}>
                                <span className="section-eyebrow">{allWatches.filter(w => w.category === "bags").length === 0 ? "Coming Soon" : "No Matches"}</span>
                                <p style={{fontSize:"0.82rem",color:"var(--gray-mid)",marginTop:"1rem",lineHeight:1.9}}>{allWatches.filter(w => w.category === "bags").length === 0 ? "Our bags collection is being curated. Contact us to enquire about specific pieces." : "No bags match your current filters."}</p>
                                <a href="mailto:enquiries@chronovian.com?subject=Bags Enquiry" className="btn-gold" style={{display:"inline-block",marginTop:"1.5rem"}}>Enquire Now</a>
                              </div>
                            : bagsList.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE).map(w => <WatchCard key={w.id} w={w} showEnquire />)
                        }
                      </div>
                      {!productsLoading && renderPagination(bagsList.length)}
                    </>
                  );
                })()}
              </div>
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
              <h1 className="section-title">Accessories</h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
            </div>
            <div className={`listing-layout${isFiltersOpen("accessories") ? "" : " filters-collapsed"}`}>
              {isFiltersOpen("accessories") && renderFilterSidebar("accessories")}
              <div className="listing-main">
                <div className="listing-toolbar">
                  {renderFiltersToggle("accessories")}
                  {renderSortControl()}
                </div>
                {(() => {
                  const accessoriesList = getCategoryList("accessories");
                  return (
                    <>
                      <div className="watches-grid">
                        {productsLoading
                          ? Array.from({ length: 9 }).map((_, i) => (
                              <div className="skeleton-card" key={i}>
                                <div className="skeleton skeleton-img" />
                                <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                                <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                              </div>
                            ))
                          : accessoriesList.length === 0
                            ? <div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem 0"}}>
                                <span className="section-eyebrow">{allWatches.filter(w => w.category === "accessories").length === 0 ? "Coming Soon" : "No Matches"}</span>
                                <p style={{fontSize:"0.82rem",color:"var(--gray-mid)",marginTop:"1rem",lineHeight:1.9}}>{allWatches.filter(w => w.category === "accessories").length === 0 ? "Our accessories collection is being curated. Contact us to enquire about specific pieces." : "No accessories match your current filters."}</p>
                                <a href="mailto:enquiries@chronovian.com?subject=Accessories Enquiry" className="btn-gold" style={{display:"inline-block",marginTop:"1.5rem"}}>Enquire Now</a>
                              </div>
                            : accessoriesList.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE).map(w => <WatchCard key={w.id} w={w} showEnquire />)
                        }
                      </div>
                      {!productsLoading && renderPagination(accessoriesList.length)}
                    </>
                  );
                })()}
              </div>
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
              <h3 style={{fontFamily:"'Marcellus',serif",fontWeight:400,fontSize:"1.1rem",marginBottom:"1.5rem"}}>We'd love to hear from you</h3>
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
              <h3 style={{fontFamily:"'Marcellus',serif",fontWeight:400,fontSize:"1.1rem",marginBottom:"1.5rem"}}>Send an Enquiry</h3>
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
              <div key={s.id} className={`hero-slide${slide === i ? " active" : ""}`}>
                {isVideo(s.image_url)
                  ? <video src={s.image_url} autoPlay muted loop playsInline />
                  : <img src={s.image_url} alt={s.headline} />
                }
              </div>
            ))}
            <div className="hero-gradient" />
            <div className="hero-content">
              <p className="hero-eyebrow">Est. 2026 — By Appointment Only</p>
              <h1 className="hero-title">{heroSlides[slide]?.headline}<br /><em>{heroSlides[slide]?.subheadline}</em></h1>
              <p className="hero-sub">{heroSlides[slide]?.tagline}</p>
            </div>
            <div className="hero-dots">
              {heroSlides.map((s, i) => (
                <button key={s.id} className={`hero-dot${slide === i ? " active" : ""}`} onClick={() => setSlide(i)} />
              ))}
            </div>
          </section>

          <section className="featured" id="featured">
            <div className="section-header">
              <span className="section-eyebrow" style={{fontSize:"1rem", letterSpacing:"0.25em"}}>Our Collection</span>
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
                : visibleWatches.map(w => <WatchCard key={`${watchIdx}-${w.id}`} w={w} hoverCart />)
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
            <div style={{gridColumn:"1/-1", marginBottom:"1.5rem", textAlign:"center"}}>
              <span className="section-eyebrow" style={{fontSize:"1rem", letterSpacing:"0.25em"}}>Our Categories</span>
              <div className="gold-rule" style={{margin:"1rem auto 0"}} />
            </div>
            {[
              { img: catImages.watches, tag: "Haute Horlogerie", name: "Watches", action: () => goTo("watches") },
              { img: catImages.jewellery, tag: "Fine Jewellery", name: "Jewellery", action: () => goTo("jewellery") },
              { img: catImages.bags, tag: "Luxury Accessories", name: "Bags", action: () => goTo("bags") },
            ].map(cat => (
              <div className="cat-card" key={cat.name} onClick={cat.action}>
                <div className="cat-img-wrap">
                  <img src={cat.img} alt={cat.name} />
                </div>
                <div className="cat-text">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-arrow">→</span>
                </div>
              </div>
            ))}
          </section>

          <section className="about-strip">
            <span className="section-eyebrow" style={{fontSize:"1rem", letterSpacing:"0.25em"}}>Our Philosophy</span>
            <h2 className="section-title" style={{fontSize:"clamp(1.4rem, 2.5vw, 2rem)"}}>A Sanctuary for the <em>Extraordinary</em></h2>
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

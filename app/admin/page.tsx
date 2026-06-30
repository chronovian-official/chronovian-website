"use client";

import { useState, useEffect, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type Product = {
  id?: string;
  brand: string;
  model: string;
  ref: string;
  category: string;
  subcategory: string;
  price: number;
  condition: string;
  year: string;
  box: boolean;
  papers: boolean;
  description: string;
  status: string;
  images: string[];
  dial_color: string;
  case_material: string;
  bracelet_material: string;
  case_size: string;
  movement: string;
  material: string;
  gemstone: string;
  weight: string;
  color: string;
  hardware: string;
  size: string;
  serial_number: string;
  featured: boolean;
};

const emptyProduct: Product = {
  brand: "", model: "", ref: "", category: "watches", subcategory: "",
  price: 0, condition: "Excellent", year: "", box: false, papers: false,
  description: "", status: "available", images: [],
  dial_color: "", case_material: "", bracelet_material: "", case_size: "", movement: "",
  material: "", gemstone: "", weight: "",
  color: "", hardware: "", size: "",
  serial_number: "", featured: false,
};

type Banner = {
  id?: string;
  image_url: string;
  headline: string;
  subheadline: string;
  tagline: string;
  sort_order: number;
  active: boolean;
};

const emptyBanner: Banner = {
  image_url: "", headline: "", subheadline: "", tagline: "", sort_order: 0, active: true,
};

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "chronovian2026";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<"products" | "bookings" | "orders" | "banners" | "homepage">("products");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerForm, setBannerForm] = useState<Banner>(emptyBanner);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [draggedBannerId, setDraggedBannerId] = useState<string | null>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [catImages, setCatImages] = useState<Record<string, string>>({ watches: "", jewellery: "", bags: "" });
  const [catUploading, setCatUploading] = useState<string | null>(null);
  const catFileRefs = { watches: useRef<HTMLInputElement>(null), jewellery: useRef<HTMLInputElement>(null), bags: useRef<HTMLInputElement>(null) };
  const [form, setForm] = useState<Product>(emptyProduct);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [lastProduct, setLastProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (authed) { fetchProducts(); fetchBookings(); fetchOrders(); fetchBanners(); fetchCategoryImages(); }
  }, [authed]);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchProducts = async () => {
    const sb = getClient();
    const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
    if (error) showMsg("Failed to fetch products: " + error.message, "error");
    else setProducts(data || []);
  };

  const fetchBookings = async () => {
    const sb = getClient();
    const { data } = await sb.from("bookings").select("*").order("created_at", { ascending: false });
    setBookings(data || []);
  };

  const fetchOrders = async () => {
    const sb = getClient();
    const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const fetchBanners = async () => {
    const sb = getClient();
    const { data, error } = await sb.from("hero_banners").select("*").order("sort_order", { ascending: true });
    if (error) showMsg("Failed to fetch banners: " + error.message, "error");
    else setBanners(data || []);
  };

  const fetchCategoryImages = async () => {
    const sb = getClient();
    const { data } = await sb.from("category_images").select("*");
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((row: any) => { map[row.id] = row.image_url; });
      setCatImages(prev => ({ ...prev, ...map }));
    }
  };

  const handleCatImageUpload = async (category: string, files: FileList) => {
    if (!files[0]) return;
    setCatUploading(category);
    const sb = getClient();
    const file = files[0];
    const ext = file.name.split(".").pop();
    const fileName = `category-${category}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("product-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) { showMsg("Upload failed: " + error.message, "error"); setCatUploading(null); return; }
    const { data: { publicUrl } } = sb.storage.from("product-images").getPublicUrl(fileName);
    await sb.from("category_images").upsert({ id: category, image_url: publicUrl, updated_at: new Date().toISOString() });
    setCatImages(prev => ({ ...prev, [category]: publicUrl }));
    showMsg(`${category.charAt(0).toUpperCase() + category.slice(1)} image updated!`);
    setCatUploading(null);
  };

  const handleBannerImageUpload = async (files: FileList) => {
    if (!files[0]) return;
    setBannerUploading(true);
    const sb = getClient();
    const file = files[0];
    const ext = file.name.split(".").pop();
    const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await sb.storage.from("product-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      showMsg("Upload failed: " + error.message, "error");
    } else {
      const { data: { publicUrl } } = sb.storage.from("product-images").getPublicUrl(fileName);
      setBannerForm(f => ({ ...f, image_url: publicUrl }));
      showMsg("Banner image uploaded successfully");
    }
    setBannerUploading(false);
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.image_url || !bannerForm.headline) {
      showMsg("Image and headline are required.", "error");
      return;
    }
    setBannerSaving(true);
    const sb = getClient();
    const { id, ...payload } = bannerForm;
    let error;
    if (editingBanner) {
      ({ error } = await sb.from("hero_banners").update(payload).eq("id", editingBanner));
    } else {
      const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.sort_order)) + 1 : 0;
      ({ error } = await sb.from("hero_banners").insert({ ...payload, sort_order: nextOrder }));
    }
    setBannerSaving(false);
    if (error) { showMsg("Error: " + error.message, "error"); return; }
    showMsg(editingBanner ? "Banner updated!" : "Banner added!");
    setShowBannerForm(false);
    setEditingBanner(null);
    setBannerForm(emptyBanner);
    fetchBanners();
  };

  const handleEditBanner = (b: Banner) => {
    setBannerForm({ ...b });
    setEditingBanner(b.id!);
    setShowBannerForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Delete this banner slide?")) return;
    const sb = getClient();
    const { error } = await sb.from("hero_banners").delete().eq("id", id);
    if (error) showMsg("Delete failed: " + error.message, "error");
    else { showMsg("Banner deleted."); fetchBanners(); }
  };

  const handleToggleBannerActive = async (id: string, current: boolean) => {
    const sb = getClient();
    await sb.from("hero_banners").update({ active: !current }).eq("id", id);
    fetchBanners();
  };

  const handleBannerDragStart = (id: string) => setDraggedBannerId(id);

  const handleBannerDrop = async (targetId: string) => {
    if (!draggedBannerId || draggedBannerId === targetId) { setDraggedBannerId(null); return; }
    const draggedIdx = banners.findIndex(b => b.id === draggedBannerId);
    const targetIdx = banners.findIndex(b => b.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) { setDraggedBannerId(null); return; }

    const reordered = [...banners];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    // Reassign sort_order sequentially and persist
    const updates = reordered.map((b, i) => ({ ...b, sort_order: i }));
    setBanners(updates);
    setDraggedBannerId(null);

    const sb = getClient();
    await Promise.all(updates.map(b => sb.from("hero_banners").update({ sort_order: b.sort_order }).eq("id", b.id!)));
    showMsg("Banner order updated.");
  };

  const isVideo = (url: string) => /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url);

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const sb = getClient();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from("product-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error) {
        showMsg("Upload failed: " + error.message, "error");
      } else {
        const { data: { publicUrl } } = sb.storage.from("product-images").getPublicUrl(fileName);
        urls.push(publicUrl);
      }
    }
    if (urls.length > 0) {
      setForm(f => ({ ...f, images: [...f.images, ...urls] }));
      showMsg(`${urls.length} file${urls.length > 1 ? "s" : ""} uploaded successfully`);
    }
    setUploading(false);
  };

  const removeImage = async (url: string) => {
    setForm(f => ({ ...f, images: f.images.filter(i => i !== url) }));
  };

  const handleSave = async () => {
    if (!form.brand || !form.model || !form.price) {
      showMsg("Brand, model and price are required.", "error");
      return;
    }
    setSaving(true);
    const sb = getClient();
    const { id, ...payload } = form;
    let error;
    if (editing) {
      ({ error } = await sb.from("products").update(payload).eq("id", editing));
    } else {
      ({ error } = await sb.from("products").insert(payload));
    }
    setSaving(false);
    if (error) { showMsg("Error: " + error.message, "error"); return; }
    setLastProduct(form);
    showMsg(editing ? "Product updated successfully!" : "Product added successfully!");
    setShowForm(false);
    setEditing(null);
    setForm(emptyProduct);
    fetchProducts();
  };

  const handleEdit = (p: Product) => {
    setForm({ ...p });
    setEditing(p.id!);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicate = (p: Product) => {
    const { id, ...rest } = p;
    setForm({ ...rest, model: rest.model + " (Copy)", images: [], status: "available" });
    setEditing(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    showMsg("Duplicated — update the details and save as new product.");
  };

  const handleCopyFromLast = () => {
    if (!lastProduct) return;
    const { id, ...rest } = lastProduct as any;
    setForm({ ...rest, model: "", ref: "", images: [], serial_number: "", status: "available" });
    showMsg("Copied from last entry — update the unique details and save.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const sb = getClient();
    const { error } = await sb.from("products").delete().eq("id", id);
    if (error) showMsg("Delete failed: " + error.message, "error");
    else { showMsg("Product deleted."); fetchProducts(); }
  };

  const handleStatusToggle = async (id: string, current: string) => {
    const sb = getClient();
    const newStatus = current === "available" ? "sold" : "available";
    await sb.from("products").update({ status: newStatus }).eq("id", id);
    fetchProducts();
  };

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F3F0", fontFamily: "sans-serif" }}>
        <div style={{ background: "white", padding: "3rem", width: "380px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Chronovian</h1>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B8935A", marginBottom: "2rem" }}>Admin Panel</p>
          <input type="password" placeholder="Enter admin password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (password === ADMIN_PASSWORD ? setAuthed(true) : showMsg("Incorrect password", "error"))}
            style={{ width: "100%", padding: "0.85rem 1rem", border: "1px solid #E5E3E0", fontSize: "0.85rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }}
          />
          <button onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : showMsg("Incorrect password", "error")}
            style={{ width: "100%", padding: "0.85rem", background: "#B8935A", color: "white", border: "none", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "sans-serif" }}>
            Enter
          </button>
          {msg && <p style={{ color: msg.type === "error" ? "#c0392b" : "#2e7d32", fontSize: "0.75rem", marginTop: "0.75rem" }}>{msg.text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3F0", fontFamily: "sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ai { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E3E0; background: white; font-size: 0.82rem; outline: none; transition: border-color 0.2s; font-weight: 300; font-family: sans-serif; }
        .ai:focus { border-color: #B8935A; }
        .as { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E3E0; background: white; font-size: 0.82rem; outline: none; cursor: pointer; font-family: sans-serif; }
        .al { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6B6B6B; display: block; margin-bottom: 0.4rem; }
        .ab { padding: 0.65rem 1.25rem; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; border: none; cursor: pointer; font-family: sans-serif; transition: all 0.2s; white-space: nowrap; }
        .ab-gold { background: #B8935A; color: white; } .ab-gold:hover { background: #D4AA78; }
        .ab-black { background: #0A0A0A; color: white; } .ab-black:hover { background: #333; }
        .ab-out { background: none; border: 1px solid #E5E3E0; color: #0A0A0A; } .ab-out:hover { border-color: #0A0A0A; }
        .ab-red { background: none; border: 1px solid #E5E3E0; color: #c0392b; } .ab-red:hover { background: #fff5f5; border-color: #c0392b; }
        .ab-blue { background: none; border: 1px solid #3498db; color: #3498db; } .ab-blue:hover { background: #ebf5fb; }
        .fg { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .fg3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .sd { font-size: 0.58rem; letter-spacing: 0.25em; text-transform: uppercase; color: #B8935A; margin: 1.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #E5E3E0; }
        .pr { background: white; padding: 1.25rem 1.5rem; display: grid; grid-template-columns: 80px 1fr auto; gap: 1.5rem; align-items: center; border-bottom: 1px solid #F0EDE9; }
        .pr:last-child { border-bottom: none; }
        .sb { padding: 0.25rem 0.75rem; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 2px; }
        .sb-av { background: #e8f5e9; color: #2e7d32; } .sb-sold { background: #ffebee; color: #c62828; } .sb-res { background: #fff3e0; color: #e65100; }
        .tab { padding: 0.75rem 1.5rem; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; border: none; cursor: pointer; font-family: sans-serif; background: none; color: #6B6B6B; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab.active { color: #B8935A; border-bottom-color: #B8935A; }
        .cb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #0A0A0A; cursor: pointer; }
        .ig { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin-top: 1rem; }
        .it { position: relative; aspect-ratio: 1; background: #F5F3F0; overflow: hidden; border: 1px solid #E5E3E0; }
        .it img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ir { position: absolute; top: 4px; right: 4px; background: white; border: none; width: 22px; height: 22px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.2); border-radius: 50%; }
        .ua { border: 2px dashed #E5E3E0; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.2s; background: white; }
        .ua:hover { border-color: #B8935A; background: #fdf9f4; }
        .msg-success { background: #e8f5e9; border: 1px solid #c8e6c9; padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.82rem; color: #2e7d32; border-radius: 2px; }
        .msg-error { background: #fff5f5; border: 1px solid #ffcdd2; padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.82rem; color: #c62828; border-radius: 2px; }
        .banner-row { background: white; padding: 1rem 1.25rem; display: grid; grid-template-columns: 28px 140px 1fr auto; gap: 1.25rem; align-items: center; border-bottom: 1px solid #F0EDE9; cursor: grab; transition: opacity 0.2s, background 0.2s; }
        .banner-row:last-child { border-bottom: none; }
        .banner-row.dragging { opacity: 0.4; }
        .banner-row.inactive { opacity: 0.5; }
        .banner-drag-handle { color: #C8C5C0; font-size: 1.1rem; line-height: 1; text-align: center; user-select: none; }
        .banner-thumb { width: 140px; height: 78px; object-fit: cover; background: #F5F3F0; border: 1px solid #E5E3E0; }
        .banner-info-headline { font-family: Georgia, serif; font-size: 1rem; margin-bottom: 0.15rem; }
        .banner-info-sub { font-size: 0.78rem; color: #6B6B6B; margin-bottom: 0.2rem; }
        .banner-info-tagline { font-size: 0.65rem; color: #ADADAD; }
      `}</style>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #E5E3E0", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: "1rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Chronovian Admin</span>
          <div>
            {(["products", "banners", "homepage", "bookings", "orders"] as const).map(t => (
              <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>
        <button className="ab ab-out" onClick={() => setAuthed(false)}>Sign Out</button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {msg && <div className={msg.type === "error" ? "msg-error" : "msg-success"}>{msg.text}</div>}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", fontWeight: 400 }}>Products</h2>
                <p style={{ fontSize: "0.72rem", color: "#6B6B6B", marginTop: "0.25rem" }}>
                  {products.length} total · {products.filter(p => p.status === "available").length} available · {products.filter(p => p.status === "sold").length} sold
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {lastProduct && !showForm && (
                  <button className="ab ab-blue" onClick={handleCopyFromLast}>Copy from Last Entry</button>
                )}
                <button className="ab ab-gold" onClick={() => { setForm(emptyProduct); setEditing(null); setShowForm(!showForm); }}>
                  {showForm ? "Cancel" : "+ Add Product"}
                </button>
              </div>
            </div>

            {/* FORM */}
            {showForm && (
              <div style={{ background: "white", padding: "2rem", marginBottom: "2rem", border: "1px solid #E5E3E0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem", fontWeight: 400 }}>{editing ? "Edit Product" : "Add New Product"}</h3>
                  {lastProduct && !editing && (
                    <button className="ab ab-blue" onClick={handleCopyFromLast}>Copy from Last Entry</button>
                  )}
                </div>

                <p className="sd">Basic Information</p>
                <div className="fg">
                  <div><label className="al">Brand *</label><input className="ai" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. Rolex" /></div>
                  <div><label className="al">Model *</label><input className="ai" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. Submariner" /></div>
                </div>
                <div className="fg">
                  <div>
                    <label className="al">Category *</label>
                    <select className="as" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="watches">Watches</option>
                      <option value="jewellery">Jewellery</option>
                      <option value="bags">Bags</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div><label className="al">Subcategory</label><input className="ai" value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} placeholder="e.g. Dress Watch, Ring, Tote" /></div>
                </div>
                <div className="fg">
                  <div><label className="al">Model No</label><input className="ai" value={form.ref} onChange={e => setForm(f => ({ ...f, ref: e.target.value }))} placeholder="e.g. 126610LN" /></div>
                  <div><label className="al">Serial Number</label><input className="ai" value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} /></div>
                </div>
                <div className="fg">
                  <div><label className="al">Price (₹) *</label><input className="ai" type="number" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} placeholder="e.g. 1250000" /></div>
                  <div>
                    <label className="al">Status</label>
                    <select className="as" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                      <option value="consignment">Consignment</option>
                    </select>
                  </div>
                </div>
                <div className="fg">
                  <div>
                    <label className="al">Condition</label>
                    <select className="as" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                      <option>New</option><option>Mint</option><option>Excellent</option><option>Very Good</option><option>Good</option><option>Fair</option>
                    </select>
                  </div>
                  <div><label className="al">Year</label><input className="ai" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="e.g. 2022" /></div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label className="al">Description</label>
                  <textarea className="ai" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description of the piece..." style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <label className="cb"><input type="checkbox" checked={form.box} onChange={e => setForm(f => ({ ...f, box: e.target.checked }))} /> Box included</label>
                  <label className="cb"><input type="checkbox" checked={form.papers} onChange={e => setForm(f => ({ ...f, papers: e.target.checked }))} /> Papers included</label>
                  <label className="cb"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> Featured on homepage</label>
                </div>

                {form.category === "watches" && (
                  <>
                    <p className="sd">Watch Details</p>
                    <div className="fg3">
                      <div><label className="al">Dial Colour</label><input className="ai" value={form.dial_color} onChange={e => setForm(f => ({ ...f, dial_color: e.target.value }))} placeholder="e.g. Black" /></div>
                      <div><label className="al">Case Material</label><input className="ai" value={form.case_material} onChange={e => setForm(f => ({ ...f, case_material: e.target.value }))} placeholder="e.g. Stainless Steel" /></div>
                      <div><label className="al">Bracelet</label><input className="ai" value={form.bracelet_material} onChange={e => setForm(f => ({ ...f, bracelet_material: e.target.value }))} placeholder="e.g. Oyster" /></div>
                    </div>
                    <div className="fg">
                      <div><label className="al">Case Size</label><input className="ai" value={form.case_size} onChange={e => setForm(f => ({ ...f, case_size: e.target.value }))} placeholder="e.g. 41mm" /></div>
                      <div><label className="al">Movement</label><input className="ai" value={form.movement} onChange={e => setForm(f => ({ ...f, movement: e.target.value }))} placeholder="e.g. Automatic Cal. 3235" /></div>
                    </div>
                  </>
                )}

                {form.category === "jewellery" && (
                  <>
                    <p className="sd">Jewellery Details</p>
                    <div className="fg3">
                      <div><label className="al">Material</label><input className="ai" value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="e.g. 18ct Gold" /></div>
                      <div><label className="al">Gemstone</label><input className="ai" value={form.gemstone} onChange={e => setForm(f => ({ ...f, gemstone: e.target.value }))} placeholder="e.g. Diamond" /></div>
                      <div><label className="al">Weight</label><input className="ai" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="e.g. 12g" /></div>
                    </div>
                  </>
                )}

                {form.category === "bags" && (
                  <>
                    <p className="sd">Bag Details</p>
                    <div className="fg3">
                      <div><label className="al">Colour</label><input className="ai" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="e.g. Black" /></div>
                      <div><label className="al">Hardware</label><input className="ai" value={form.hardware} onChange={e => setForm(f => ({ ...f, hardware: e.target.value }))} placeholder="e.g. Gold" /></div>
                      <div><label className="al">Size</label><input className="ai" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. Mini / Medium" /></div>
                    </div>
                  </>
                )}

                <p className="sd">Product Images & Videos</p>
                <div className="ua" onClick={() => fileRef.current?.click()}>
                  <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: "none" }}
                    onChange={e => { if (e.target.files && e.target.files.length > 0) handleImageUpload(e.target.files); }} />
                  {uploading
                    ? <p style={{ fontSize: "0.82rem", color: "#6B6B6B" }}>⏳ Uploading files...</p>
                    : <div>
                        <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📷 🎥</p>
                        <p style={{ fontSize: "0.82rem", color: "#6B6B6B" }}>Click to upload images or videos</p>
                        <p style={{ fontSize: "0.65rem", color: "#ADADAD", marginTop: "0.25rem" }}>JPG, PNG, WEBP, MP4, MOV — multiple files supported. First file = primary.</p>
                      </div>
                  }
                </div>

                {form.images.length > 0 && (
                  <div>
                    <p style={{ fontSize: "0.65rem", color: "#6B6B6B", margin: "0.75rem 0 0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{form.images.length} file{form.images.length > 1 ? "s" : ""} uploaded</p>
                    <div className="ig">
                      {form.images.map((url, i) => (
                        <div className="it" key={i}>
                          {isVideo(url)
                            ? <video src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
                            : <img src={url} alt={`Product image ${i + 1}`} onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f5f3f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23adadad' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E"; }} />
                          }
                          <button className="ir" onClick={() => removeImage(url)} title="Remove">×</button>
                          {i === 0 && <span style={{ position: "absolute", bottom: 4, left: 4, background: "#B8935A", color: "white", fontSize: "0.45rem", padding: "2px 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Primary</span>}
                          {isVideo(url) && <span style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.6)", color: "white", fontSize: "0.7rem", padding: "2px 6px" }}>▶</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
                  <button className="ab ab-out" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyProduct); }}>Cancel</button>
                  <button className="ab ab-gold" onClick={handleSave} disabled={saving || uploading}>
                    {saving ? "Saving..." : uploading ? "Uploading..." : editing ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </div>
            )}

            {/* PRODUCTS LIST */}
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {products.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>No products yet. Add your first product above.</div>
                : products.map(p => (
                  <div className="pr" key={p.id}>
                    <div style={{ width: 80, height: 96, background: "#F5F3F0", overflow: "hidden", flexShrink: 0, border: "1px solid #E5E3E0" }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.model} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>📷</div>
                      }
                    </div>
                    <div>
                      <span style={{ fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#B8935A" }}>{p.brand}</span>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", margin: "0.2rem 0" }}>{p.model}</div>
                      <div style={{ fontSize: "0.65rem", color: "#6B6B6B", marginBottom: "0.4rem" }}>{p.ref} · {p.condition} · {p.year}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{fmt(p.price)}</span>
                        <span className={`sb sb-${p.status === "available" ? "av" : p.status === "reserved" ? "res" : "sold"}`}>{p.status}</span>
                        <span style={{ fontSize: "0.6rem", color: "#ADADAD", textTransform: "uppercase", letterSpacing: "0.1em" }}>{p.category}</span>
                        {p.featured && <span style={{ fontSize: "0.6rem", color: "#B8935A", textTransform: "uppercase", letterSpacing: "0.1em" }}>★ Featured</span>}
                        <span style={{ fontSize: "0.6rem", color: "#ADADAD" }}>{p.images?.length || 0} photo{(p.images?.length || 0) !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button className="ab ab-out" onClick={() => handleStatusToggle(p.id!, p.status)}>
                        {p.status === "available" ? "Mark Sold" : "Mark Available"}
                      </button>
                      <button className="ab ab-blue" onClick={() => handleDuplicate(p)}>Duplicate</button>
                      <button className="ab ab-black" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="ab ab-red" onClick={() => handleDelete(p.id!)}>Delete</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* BANNERS TAB */}
        {tab === "banners" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", fontWeight: 400 }}>Homepage Banners</h2>
                <p style={{ fontSize: "0.72rem", color: "#6B6B6B", marginTop: "0.25rem" }}>
                  {banners.length} slide{banners.length !== 1 ? "s" : ""} · {banners.filter(b => b.active).length} active · Drag rows to reorder
                </p>
              </div>
              <button className="ab ab-gold" onClick={() => { setBannerForm(emptyBanner); setEditingBanner(null); setShowBannerForm(!showBannerForm); }}>
                {showBannerForm ? "Cancel" : "+ Add Banner Slide"}
              </button>
            </div>

            {/* BANNER FORM */}
            {showBannerForm && (
              <div style={{ background: "white", padding: "2rem", marginBottom: "2rem", border: "1px solid #E5E3E0" }}>
                <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem", fontWeight: 400, marginBottom: "1.5rem" }}>{editingBanner ? "Edit Banner Slide" : "Add New Banner Slide"}</h3>

                <p className="sd">Banner Image</p>
                <div className="ua" onClick={() => bannerFileRef.current?.click()}>
                  <input ref={bannerFileRef} type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => { if (e.target.files && e.target.files.length > 0) handleBannerImageUpload(e.target.files); }} />
                  {bannerUploading
                    ? <p style={{ fontSize: "0.82rem", color: "#6B6B6B" }}>⏳ Uploading image...</p>
                    : bannerForm.image_url
                      ? <img src={bannerForm.image_url} alt="Banner preview" style={{ maxWidth: "100%", maxHeight: "220px", objectFit: "contain" }} />
                      : <div>
                          <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🖼️</p>
                          <p style={{ fontSize: "0.82rem", color: "#6B6B6B" }}>Click to upload a banner image</p>
                          <p style={{ fontSize: "0.65rem", color: "#ADADAD", marginTop: "0.25rem" }}>Recommended: wide landscape image, 1600px+ width</p>
                        </div>
                  }
                </div>
                {bannerForm.image_url && (
                  <button className="ab ab-out" style={{ marginTop: "0.75rem" }} onClick={() => setBannerForm(f => ({ ...f, image_url: "" }))}>Remove Image</button>
                )}

                <p className="sd">Text Overlay</p>
                <div className="form-group"><label className="al">Headline *</label><input className="ai" value={bannerForm.headline} onChange={e => setBannerForm(f => ({ ...f, headline: e.target.value }))} placeholder="e.g. Where Time" /></div>
                <div className="form-group"><label className="al">Subheadline</label><input className="ai" value={bannerForm.subheadline} onChange={e => setBannerForm(f => ({ ...f, subheadline: e.target.value }))} placeholder="e.g. Becomes Art (shown in italics)" /></div>
                <div className="form-group"><label className="al">Tagline</label><input className="ai" value={bannerForm.tagline} onChange={e => setBannerForm(f => ({ ...f, tagline: e.target.value }))} placeholder="e.g. Premium Watches & Fine Jewellery" /></div>

                <label className="cb" style={{ marginTop: "0.5rem" }}>
                  <input type="checkbox" checked={bannerForm.active} onChange={e => setBannerForm(f => ({ ...f, active: e.target.checked }))} /> Active (visible on homepage)
                </label>

                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
                  <button className="ab ab-out" onClick={() => { setShowBannerForm(false); setEditingBanner(null); setBannerForm(emptyBanner); }}>Cancel</button>
                  <button className="ab ab-gold" onClick={handleSaveBanner} disabled={bannerSaving || bannerUploading}>
                    {bannerSaving ? "Saving..." : bannerUploading ? "Uploading..." : editingBanner ? "Update Banner" : "Add Banner"}
                  </button>
                </div>
              </div>
            )}

            {/* BANNERS LIST */}
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {banners.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>No banner slides yet. Add your first slide above.</div>
                : banners.map(b => (
                  <div
                    key={b.id}
                    className={`banner-row${draggedBannerId === b.id ? " dragging" : ""}${!b.active ? " inactive" : ""}`}
                    draggable
                    onDragStart={() => handleBannerDragStart(b.id!)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleBannerDrop(b.id!)}
                  >
                    <span className="banner-drag-handle" title="Drag to reorder">⠿</span>
                    {b.image_url
                      ? <img className="banner-thumb" src={b.image_url} alt={b.headline} />
                      : <div className="banner-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>🖼️</div>
                    }
                    <div>
                      <div className="banner-info-headline">{b.headline} {b.subheadline && <em>{b.subheadline}</em>}</div>
                      {b.tagline && <div className="banner-info-sub">{b.tagline}</div>}
                      <div className="banner-info-tagline">Position {b.sort_order + 1} {!b.active && "· Inactive"}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button className="ab ab-out" onClick={() => handleToggleBannerActive(b.id!, b.active)}>
                        {b.active ? "Deactivate" : "Activate"}
                      </button>
                      <button className="ab ab-black" onClick={() => handleEditBanner(b)}>Edit</button>
                      <button className="ab ab-red" onClick={() => handleDeleteBanner(b.id!)}>Delete</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* HOMEPAGE TAB */}
        {tab === "homepage" && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", fontWeight: 400 }}>Homepage Category Images</h2>
              <p style={{ fontSize: "0.72rem", color: "#6B6B6B", marginTop: "0.25rem" }}>Upload the images shown in the "Our Collections" section on the homepage</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
              {(["watches", "jewellery", "bags"] as const).map(cat => (
                <div key={cat} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ background: "white", border: "1px solid #E5E3E0", overflow: "hidden", aspectRatio: "4/5", position: "relative" }}>
                    {catImages[cat]
                      ? <img src={catImages[cat]} alt={cat} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "#F5F3F0" }}>
                          <span style={{ fontSize: "2rem" }}>📷</span>
                          <span style={{ fontSize: "0.72rem", color: "#ADADAD" }}>No image uploaded</span>
                        </div>
                    }
                    {catUploading === cat && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", color: "#6B6B6B" }}>
                        ⏳ Uploading...
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B8935A", marginBottom: "0.5rem" }}>
                      {cat === "watches" ? "Haute Horlogerie" : cat === "jewellery" ? "Fine Jewellery" : "Luxury Accessories"}
                    </p>
                    <p style={{ fontFamily: "Georgia,serif", fontSize: "1rem", marginBottom: "0.75rem" }}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </p>
                    <input
                      ref={catFileRefs[cat]}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => { if (e.target.files && e.target.files.length > 0) handleCatImageUpload(cat, e.target.files); }}
                    />
                    <button
                      className="ab ab-gold"
                      style={{ width: "100%" }}
                      onClick={() => catFileRefs[cat].current?.click()}
                      disabled={catUploading === cat}
                    >
                      {catImages[cat] ? "Replace Image" : "Upload Image"}
                    </button>
                    {catImages[cat] && (
                      <button
                        className="ab ab-out"
                        style={{ width: "100%", marginTop: "0.5rem" }}
                        onClick={async () => {
                          const sb = getClient();
                          await sb.from("category_images").upsert({ id: cat, image_url: "", updated_at: new Date().toISOString() });
                          setCatImages(prev => ({ ...prev, [cat]: "" }));
                          showMsg(`${cat} image removed.`);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "2rem", padding: "1rem 1.5rem", background: "#F5F3F0", borderLeft: "3px solid #B8935A", fontSize: "0.78rem", color: "#6B6B6B", lineHeight: 1.7 }}>
              💡 Tip: Use portrait-oriented images (taller than wide) for best results. Minimum recommended size: 800 × 1000px. The client's own product photography works best here.
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === "bookings" && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", fontWeight: 400, marginBottom: "1.5rem" }}>Bookings ({bookings.length})</h2>
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {bookings.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>No bookings yet.</div>
                : bookings.map(b => (
                  <div key={b.id} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F0EDE9", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1.5rem", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", marginBottom: "0.25rem" }}>{b.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6B6B6B" }}>{b.email}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6B6B6B" }}>{b.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>{b.date}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B6B6B" }}>{b.time}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#6B6B6B" }}>{b.interest}</div>
                      {b.notes && <div style={{ fontSize: "0.65rem", color: "#ADADAD", marginTop: "0.2rem" }}>{b.notes}</div>}
                    </div>
                    <span className={`sb ${b.status === "confirmed" ? "sb-av" : "sb-res"}`}>{b.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", fontWeight: 400, marginBottom: "1.5rem" }}>Orders ({orders.length})</h2>
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {orders.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>No orders yet.</div>
                : orders.map(o => (
                  <div key={o.id} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F0EDE9", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1.5rem", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", marginBottom: "0.25rem" }}>{o.customer_name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6B6B6B" }}>{o.customer_email}</div>
                    </div>
                    <div style={{ fontSize: "0.82rem" }}>{fmt(o.total)}</div>
                    <div style={{ fontSize: "0.72rem", color: "#6B6B6B" }}>{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <span className={`sb ${o.status === "paid" ? "sb-av" : "sb-res"}`}>{o.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

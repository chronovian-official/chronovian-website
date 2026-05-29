"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "chronovian2026";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<"products" | "bookings" | "orders">("products");
  const [form, setForm] = useState<Product>(emptyProduct);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authed) {
      fetchProducts();
      fetchBookings();
      fetchOrders();
    }
  }, [authed]);

  const fetchProducts = async () => {
    const { data } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const fetchBookings = async () => {
    const { data } = await supabaseAdmin.from("bookings").select("*").order("created_at", { ascending: false });
    setBookings(data || []);
  };

  const fetchOrders = async () => {
    const { data } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabaseAdmin.storage.from("product-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (!error) {
        const { data: { publicUrl } } = supabaseAdmin.storage.from("product-images").getPublicUrl(fileName);
        urls.push(publicUrl);
      }
    }
    setForm(f => ({ ...f, images: [...f.images, ...urls] }));
    setUploading(false);
  };

  const removeImage = (url: string) => {
    setForm(f => ({ ...f, images: f.images.filter(i => i !== url) }));
  };

  const handleSave = async () => {
    if (!form.brand || !form.model || !form.price) {
      setMsg("Brand, model and price are required.");
      return;
    }
    setSaving(true);
    const payload = { ...form };
    let error;
    if (editing) {
      ({ error } = await supabaseAdmin.from("products").update(payload).eq("id", editing));
    } else {
      ({ error } = await supabaseAdmin.from("products").insert(payload));
    }
    setSaving(false);
    if (error) { setMsg("Error: " + error.message); return; }
    setMsg(editing ? "Product updated!" : "Product added!");
    setShowForm(false);
    setEditing(null);
    setForm(emptyProduct);
    fetchProducts();
    setTimeout(() => setMsg(null), 3000);
  };

  const handleEdit = (p: Product) => {
    setForm(p);
    setEditing(p.id!);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabaseAdmin.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const handleStatusToggle = async (id: string, current: string) => {
    const newStatus = current === "available" ? "sold" : "available";
    await supabaseAdmin.from("products").update({ status: newStatus }).eq("id", id);
    fetchProducts();
  };

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F3F0", fontFamily: "'Jost', sans-serif" }}>
        <div style={{ background: "white", padding: "3rem", width: "380px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Chronovian</h1>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B8935A", marginBottom: "2rem" }}>Admin Panel</p>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
            style={{ width: "100%", padding: "0.85rem 1rem", border: "1px solid #E5E3E0", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box" }}
          />
          <button
            onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : setMsg("Incorrect password")}
            style={{ width: "100%", padding: "0.85rem", background: "#B8935A", color: "white", border: "none", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
          >Enter</button>
          {msg && <p style={{ color: "#c0392b", fontSize: "0.75rem", marginTop: "0.75rem" }}>{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3F0", fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .admin-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E3E0; background: white; font-family: 'Jost', sans-serif; font-size: 0.82rem; outline: none; transition: border-color 0.2s; font-weight: 300; }
        .admin-input:focus { border-color: #B8935A; }
        .admin-select { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E3E0; background: white; font-family: 'Jost', sans-serif; font-size: 0.82rem; outline: none; cursor: pointer; }
        .admin-label { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6B6B6B; display: block; margin-bottom: 0.4rem; }
        .admin-btn { padding: 0.65rem 1.5rem; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; border: none; cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; }
        .admin-btn-gold { background: #B8935A; color: white; }
        .admin-btn-gold:hover { background: #D4AA78; }
        .admin-btn-black { background: #0A0A0A; color: white; }
        .admin-btn-black:hover { background: #333; }
        .admin-btn-outline { background: none; border: 1px solid #E5E3E0; color: #0A0A0A; }
        .admin-btn-outline:hover { border-color: #0A0A0A; }
        .admin-btn-red { background: none; border: 1px solid #E5E3E0; color: #c0392b; }
        .admin-btn-red:hover { background: #fff5f5; border-color: #c0392b; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .section-divider { font-size: 0.58rem; letter-spacing: 0.25em; text-transform: uppercase; color: #B8935A; margin: 1.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #E5E3E0; }
        .product-row { background: white; padding: 1.25rem 1.5rem; display: grid; grid-template-columns: 72px 1fr auto; gap: 1.5rem; align-items: center; border-bottom: 1px solid #F0EDE9; }
        .product-row:last-child { border-bottom: none; }
        .status-badge { padding: 0.25rem 0.75rem; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 2px; }
        .status-available { background: #e8f5e9; color: #2e7d32; }
        .status-sold { background: #ffebee; color: #c62828; }
        .tab { padding: 0.75rem 1.5rem; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; border: none; cursor: pointer; font-family: 'Jost', sans-serif; background: none; color: #6B6B6B; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab.active { color: #B8935A; border-bottom-color: #B8935A; }
        .checkbox-wrap { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #0A0A0A; cursor: pointer; }
        .image-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-top: 0.75rem; }
        .image-thumb { position: relative; aspect-ratio: 1; background: #F5F3F0; overflow: hidden; }
        .image-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .image-remove { position: absolute; top: 4px; right: 4px; background: white; border: none; width: 22px; height: 22px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
        .upload-area { border: 2px dashed #E5E3E0; padding: 2rem; text-align: center; cursor: pointer; transition: border-color 0.2s; }
        .upload-area:hover { border-color: #B8935A; }
      `}</style>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #E5E3E0", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "1rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Chronovian Admin</span>
          <div style={{ display: "flex", borderBottom: "none" }}>
            {(["products", "bookings", "orders"] as const).map(t => (
              <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>
        <button className="admin-btn admin-btn-outline" onClick={() => setAuthed(false)}>Sign Out</button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {msg && (
          <div style={{ background: msg.startsWith("Error") ? "#fff5f5" : "#e8f5e9", border: `1px solid ${msg.startsWith("Error") ? "#ffcdd2" : "#c8e6c9"}`, padding: "0.85rem 1.25rem", marginBottom: "1.5rem", fontSize: "0.82rem", color: msg.startsWith("Error") ? "#c62828" : "#2e7d32" }}>
            {msg}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", fontWeight: 400 }}>Products</h2>
                <p style={{ fontSize: "0.72rem", color: "#6B6B6B", marginTop: "0.25rem" }}>{products.length} total · {products.filter(p => p.status === "available").length} available · {products.filter(p => p.status === "sold").length} sold</p>
              </div>
              <button className="admin-btn admin-btn-gold" onClick={() => { setForm(emptyProduct); setEditing(null); setShowForm(!showForm); }}>
                {showForm ? "Cancel" : "+ Add Product"}
              </button>
            </div>

            {/* ADD / EDIT FORM */}
            {showForm && (
              <div style={{ background: "white", padding: "2rem", marginBottom: "2rem", border: "1px solid #E5E3E0" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 400, marginBottom: "1.5rem" }}>{editing ? "Edit Product" : "Add New Product"}</h3>

                <div className="section-divider">Basic Information</div>
                <div className="form-grid" style={{ marginBottom: "1rem" }}>
                  <div><label className="admin-label">Brand *</label><input className="admin-input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. Rolex" /></div>
                  <div><label className="admin-label">Model *</label><input className="admin-input" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. Submariner" /></div>
                </div>
                <div className="form-grid" style={{ marginBottom: "1rem" }}>
                  <div>
                    <label className="admin-label">Category *</label>
                    <select className="admin-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="watches">Watches</option>
                      <option value="jewellery">Jewellery</option>
                      <option value="bags">Bags</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div><label className="admin-label">Subcategory</label><input className="admin-input" value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} placeholder="e.g. Dress Watch, Ring, Tote" /></div>
                </div>
                <div className="form-grid" style={{ marginBottom: "1rem" }}>
                  <div><label className="admin-label">Reference / SKU</label><input className="admin-input" value={form.ref} onChange={e => setForm(f => ({ ...f, ref: e.target.value }))} placeholder="e.g. Ref. 126610LN" /></div>
                  <div><label className="admin-label">Serial Number</label><input className="admin-input" value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} /></div>
                </div>
                <div className="form-grid" style={{ marginBottom: "1rem" }}>
                  <div><label className="admin-label">Price (₹) *</label><input className="admin-input" type="number" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} placeholder="e.g. 1250000" /></div>
                  <div>
                    <label className="admin-label">Status</label>
                    <select className="admin-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                      <option value="consignment">Consignment</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid" style={{ marginBottom: "1rem" }}>
                  <div>
                    <label className="admin-label">Condition</label>
                    <select className="admin-select" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                      <option>Mint</option>
                      <option>Excellent</option>
                      <option>Very Good</option>
                      <option>Good</option>
                      <option>Fair</option>
                      <option>New</option>
                    </select>
                  </div>
                  <div><label className="admin-label">Year</label><input className="admin-input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="e.g. 2022" /></div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label className="admin-label">Description</label>
                  <textarea className="admin-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description of the piece..." style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
                  <label className="checkbox-wrap"><input type="checkbox" checked={form.box} onChange={e => setForm(f => ({ ...f, box: e.target.checked }))} /> Box included</label>
                  <label className="checkbox-wrap"><input type="checkbox" checked={form.papers} onChange={e => setForm(f => ({ ...f, papers: e.target.checked }))} /> Papers included</label>
                  <label className="checkbox-wrap"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> Featured on homepage</label>
                </div>

                {/* Watch specific */}
                {form.category === "watches" && (
                  <>
                    <div className="section-divider">Watch Details</div>
                    <div className="form-grid-3" style={{ marginBottom: "1rem" }}>
                      <div><label className="admin-label">Dial Colour</label><input className="admin-input" value={form.dial_color} onChange={e => setForm(f => ({ ...f, dial_color: e.target.value }))} placeholder="e.g. Black" /></div>
                      <div><label className="admin-label">Case Material</label><input className="admin-input" value={form.case_material} onChange={e => setForm(f => ({ ...f, case_material: e.target.value }))} placeholder="e.g. Stainless Steel" /></div>
                      <div><label className="admin-label">Bracelet</label><input className="admin-input" value={form.bracelet_material} onChange={e => setForm(f => ({ ...f, bracelet_material: e.target.value }))} placeholder="e.g. Oyster" /></div>
                    </div>
                    <div className="form-grid" style={{ marginBottom: "1rem" }}>
                      <div><label className="admin-label">Case Size</label><input className="admin-input" value={form.case_size} onChange={e => setForm(f => ({ ...f, case_size: e.target.value }))} placeholder="e.g. 41mm" /></div>
                      <div><label className="admin-label">Movement</label><input className="admin-input" value={form.movement} onChange={e => setForm(f => ({ ...f, movement: e.target.value }))} placeholder="e.g. Automatic" /></div>
                    </div>
                  </>
                )}

                {/* Jewellery specific */}
                {form.category === "jewellery" && (
                  <>
                    <div className="section-divider">Jewellery Details</div>
                    <div className="form-grid-3" style={{ marginBottom: "1rem" }}>
                      <div><label className="admin-label">Material</label><input className="admin-input" value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="e.g. 18ct Gold" /></div>
                      <div><label className="admin-label">Gemstone</label><input className="admin-input" value={form.gemstone} onChange={e => setForm(f => ({ ...f, gemstone: e.target.value }))} placeholder="e.g. Diamond" /></div>
                      <div><label className="admin-label">Weight</label><input className="admin-input" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="e.g. 12g" /></div>
                    </div>
                  </>
                )}

                {/* Bag specific */}
                {form.category === "bags" && (
                  <>
                    <div className="section-divider">Bag Details</div>
                    <div className="form-grid-3" style={{ marginBottom: "1rem" }}>
                      <div><label className="admin-label">Colour</label><input className="admin-input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="e.g. Black" /></div>
                      <div><label className="admin-label">Hardware</label><input className="admin-input" value={form.hardware} onChange={e => setForm(f => ({ ...f, hardware: e.target.value }))} placeholder="e.g. Gold" /></div>
                      <div><label className="admin-label">Size</label><input className="admin-input" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. Mini / Medium" /></div>
                    </div>
                  </>
                )}

                {/* Images */}
                <div className="section-divider">Product Images</div>
                <div className="upload-area" onClick={() => fileRef.current?.click()}>
                  <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => e.target.files && handleImageUpload(e.target.files)} />
                  {uploading
                    ? <p style={{ fontSize: "0.78rem", color: "#6B6B6B" }}>Uploading...</p>
                    : <div>
                        <p style={{ fontSize: "0.78rem", color: "#6B6B6B", margin: 0 }}>Click to upload images</p>
                        <p style={{ fontSize: "0.65rem", color: "#ADADAD", margin: "0.25rem 0 0" }}>JPG, PNG, WEBP — multiple files supported</p>
                      </div>
                  }
                </div>
                {form.images.length > 0 && (
                  <div className="image-grid">
                    {form.images.map((url, i) => (
                      <div className="image-thumb" key={i}>
                        <img src={url} alt={`Product ${i + 1}`} />
                        <button className="image-remove" onClick={() => removeImage(url)}>×</button>
                        {i === 0 && <span style={{ position: "absolute", bottom: 4, left: 4, background: "#B8935A", color: "white", fontSize: "0.45rem", padding: "2px 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Primary</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
                  <button className="admin-btn admin-btn-outline" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyProduct); }}>Cancel</button>
                  <button className="admin-btn admin-btn-gold" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Update Product" : "Add Product"}</button>
                </div>
              </div>
            )}

            {/* PRODUCTS LIST */}
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {products.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>No products yet. Add your first product above.</div>
                : products.map(p => (
                  <div className="product-row" key={p.id}>
                    <div style={{ width: 72, height: 88, background: "#F5F3F0", overflow: "hidden", flexShrink: 0 }}>
                      {p.images?.[0] && <img src={p.images[0]} alt={p.model} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div>
                      <span style={{ fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#B8935A" }}>{p.brand}</span>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", margin: "0.2rem 0" }}>{p.model}</div>
                      <div style={{ fontSize: "0.65rem", color: "#6B6B6B", marginBottom: "0.4rem" }}>{p.ref} · {p.condition} · {p.year}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 400 }}>{fmt(p.price)}</span>
                        <span className={`status-badge status-${p.status}`}>{p.status}</span>
                        <span style={{ fontSize: "0.6rem", color: "#ADADAD", textTransform: "uppercase", letterSpacing: "0.1em" }}>{p.category}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button className="admin-btn admin-btn-outline" onClick={() => handleStatusToggle(p.id!, p.status)}>
                        {p.status === "available" ? "Mark Sold" : "Mark Available"}
                      </button>
                      <button className="admin-btn admin-btn-black" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="admin-btn admin-btn-red" onClick={() => handleDelete(p.id!)}>Delete</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === "bookings" && (
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", fontWeight: 400, marginBottom: "1.5rem" }}>Bookings ({bookings.length})</h2>
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {bookings.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>No bookings yet.</div>
                : bookings.map(b => (
                  <div key={b.id} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F0EDE9", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1.5rem", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", marginBottom: "0.25rem" }}>{b.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6B6B6B" }}>{b.email} · {b.phone}</div>
                      <div style={{ fontSize: "0.65rem", color: "#ADADAD", marginTop: "0.2rem" }}>{b.interest}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 400 }}>{b.date}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B6B6B" }}>{b.time}</div>
                      {b.notes && <div style={{ fontSize: "0.65rem", color: "#ADADAD", marginTop: "0.2rem" }}>{b.notes}</div>}
                    </div>
                    <span className={`status-badge status-${b.status === "confirmed" ? "available" : "sold"}`}>{b.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", fontWeight: 400, marginBottom: "1.5rem" }}>Orders ({orders.length})</h2>
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {orders.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>No orders yet.</div>
                : orders.map(o => (
                  <div key={o.id} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F0EDE9", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1.5rem", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", marginBottom: "0.25rem" }}>{o.customer_name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6B6B6B" }}>{o.customer_email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 400 }}>{fmt(o.total)}</div>
                      <div style={{ fontSize: "0.65rem", color: "#ADADAD", marginTop: "0.2rem" }}>{new Date(o.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                    <span className={`status-badge status-${o.status === "paid" ? "available" : "sold"}`}>{o.status}</span>
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

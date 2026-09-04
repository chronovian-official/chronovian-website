"use client";

import { useState, useEffect, useRef, RefObject } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

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
  sort_order?: number | null;
  created_at?: string;
  collection: string;
  series: string;
  calibre: string;
  case_thickness: string;
  case_shape: string;
  case_back: string;
  glass_material: string;
  strap_colour: string;
  clasp_type: string;
  buckle_clasp_material: string;
  gender: string;
  water_resistance: string;
  warranty_period: string;
  warranty_register_url: string;
  country_of_origin: string;
};

const emptyProduct: Product = {
  brand: "", model: "", ref: "", category: "watches", subcategory: "",
  price: 0, condition: "Excellent", year: "", box: false, papers: false,
  description: "", status: "available", images: [],
  dial_color: "", case_material: "", bracelet_material: "", case_size: "", movement: "",
  material: "", gemstone: "", weight: "",
  color: "", hardware: "", size: "",
  serial_number: "", featured: false,
  collection: "", series: "", calibre: "", case_thickness: "", case_shape: "",
  case_back: "", glass_material: "", strap_colour: "", clasp_type: "",
  buckle_clasp_material: "", gender: "", water_resistance: "",
  warranty_period: "", warranty_register_url: "", country_of_origin: "",
};

// Excel column definitions — order here is the order columns appear in the spreadsheet.
// "id" must stay first and must never be manually edited by whoever fills in the sheet:
// blank id = new product on import, an id matching an existing product = update that product.
type ExcelCol = { key: string; label: string; kind?: "bool" | "images" | "number" };
const EXCEL_COLUMNS: ExcelCol[] = [
  { key: "id", label: "ID (leave blank for new product — do not edit)" },
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "ref", label: "Reference / Model No" },
  { key: "category", label: "Category (watches/jewellery/bags/accessories)" },
  { key: "subcategory", label: "Subcategory" },
  { key: "price", label: "Price (INR)", kind: "number" },
  { key: "condition", label: "Condition" },
  { key: "year", label: "Purchase Year" },
  { key: "box", label: "Box Included (Yes/No)", kind: "bool" },
  { key: "papers", label: "Papers Included (Yes/No)", kind: "bool" },
  { key: "status", label: "Status (available/sold/reserved)" },
  { key: "featured", label: "Featured on Homepage (Yes/No)", kind: "bool" },
  { key: "images", label: "Image URLs (separate multiple with |)", kind: "images" },
  { key: "description", label: "Description" },
  { key: "collection", label: "Collection" },
  { key: "series", label: "Series" },
  { key: "movement", label: "Movement" },
  { key: "calibre", label: "Calibre" },
  { key: "case_size", label: "Case Size" },
  { key: "case_thickness", label: "Case Thickness" },
  { key: "case_shape", label: "Case Shape" },
  { key: "case_material", label: "Case Material" },
  { key: "case_back", label: "Case Back" },
  { key: "glass_material", label: "Glass Material" },
  { key: "dial_color", label: "Dial Colour" },
  { key: "bracelet_material", label: "Strap Material" },
  { key: "strap_colour", label: "Strap Colour" },
  { key: "clasp_type", label: "Clasp Type" },
  { key: "buckle_clasp_material", label: "Buckle/Clasp Material" },
  { key: "gemstone", label: "Precious Stone / Gemstone" },
  { key: "gender", label: "Gender" },
  { key: "water_resistance", label: "Water Resistance (M)" },
  { key: "warranty_period", label: "Warranty Period" },
  { key: "warranty_register_url", label: "Warranty Register URL" },
  { key: "country_of_origin", label: "Country of Origin" },
  { key: "material", label: "Material (Jewellery)" },
  { key: "weight", label: "Weight (Jewellery)" },
  { key: "color", label: "Colour (Bags)" },
  { key: "hardware", label: "Hardware (Bags)" },
  { key: "size", label: "Size (Bags)" },
  { key: "serial_number", label: "Serial Number" },
];

const parseBoolCell = (v: any): boolean => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "yes" || s === "true" || s === "1";
};
const formatBoolCell = (v: boolean) => (v ? "Yes" : "No");
const parseImagesCell = (v: any): string[] =>
  String(v ?? "").split("|").map(s => s.trim()).filter(Boolean);
const formatImagesCell = (v: string[]) => (v || []).join(" | ");

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
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [savingCustomerId, setSavingCustomerId] = useState<string | null>(null);
  const [tab, setTab] = useState<"products" | "bookings" | "orders" | "banners" | "categories" | "customers">("products");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerForm, setBannerForm] = useState<Banner>(emptyBanner);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [draggedBannerId, setDraggedBannerId] = useState<string | null>(null);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [catImages, setCatImages] = useState<Record<string, string>>({ watches: "", jewellery: "", bags: "" });
  const [catUploading, setCatUploading] = useState<string | null>(null);
  const catFileRefs = { watches: useRef<HTMLInputElement>(null), jewellery: useRef<HTMLInputElement>(null), bags: useRef<HTMLInputElement>(null) };
  const storeFileRefs: Record<string, RefObject<HTMLInputElement | null>> = {
    store_1: useRef<HTMLInputElement>(null),
    store_2: useRef<HTMLInputElement>(null),
    store_3: useRef<HTMLInputElement>(null),
    store_4: useRef<HTMLInputElement>(null),
  };
  const [form, setForm] = useState<Product>(emptyProduct);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [lastProduct, setLastProduct] = useState<Product | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importPreview, setImportPreview] = useState<{ rows: any[]; newCount: number; updateCount: number; skipped: number } | null>(null);
  const [adminSort, setAdminSort] = useState<"custom" | "newest" | "price-desc" | "price-asc" | "brand" | "status">("custom");
  const [savingSiteSort, setSavingSiteSort] = useState(false);
  const bulkUploadFileRef = useRef<HTMLInputElement>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadedUrls, setBulkUploadedUrls] = useState<{ name: string; url: string }[]>([]);
  const [bulkCopiedAll, setBulkCopiedAll] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (authed) { fetchProducts(); fetchBookings(); fetchOrders(); fetchBanners(); fetchCategoryImages(); fetchCustomers(); fetchSiteSort(); }
  }, [authed]);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  // Which admin sort options are also valid customer-facing sorts.
  // "brand" and "status" are admin-only views and don't map to a website sort.
  const ADMIN_TO_SITE_SORT: Record<string, string> = {
    custom: "curated",
    "price-desc": "price-desc",
    "price-asc": "price-asc",
    newest: "new",
  };

  const fetchSiteSort = async () => {
    const sb = getClient();
    const { data } = await sb.from("site_settings").select("value").eq("key", "default_sort").maybeSingle();
    const siteVal = (data as any)?.value;
    if (!siteVal) return;
    const adminVal = Object.keys(ADMIN_TO_SITE_SORT).find(k => ADMIN_TO_SITE_SORT[k] === siteVal);
    if (adminVal) setAdminSort(adminVal as any);
  };

  const handleAdminSortChange = async (value: string) => {
    setAdminSort(value as any);
    const siteValue = ADMIN_TO_SITE_SORT[value];
    if (!siteValue) {
      showMsg("This is an admin-only view — the website order is unchanged.");
      return;
    }
    setSavingSiteSort(true);
    const sb = getClient();
    const { error } = await sb.from("site_settings").upsert({ key: "default_sort", value: siteValue }, { onConflict: "key" });
    setSavingSiteSort(false);
    if (error) showMsg("Couldn't update the website order: " + error.message, "error");
    else showMsg("Website product order updated for customers.");
  };

  const fetchProducts = async () => {
    const sb = getClient();
    const { data, error } = await sb.from("products").select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
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

  const fetchCustomers = async () => {
    const sb = getClient();
    const { data, error } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) showMsg("Failed to fetch customers: " + error.message, "error");
    else setCustomers(data || []);
  };

  const handleToggleVip = async (id: string, current: boolean) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, vip: !current } : c));
    const sb = getClient();
    const { error } = await sb.from("profiles").update({ vip: !current }).eq("id", id);
    if (error) showMsg("Failed to update VIP status: " + error.message, "error");
  };

  const handleContactChange = async (id: string, value: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, preferred_contact: value } : c));
    setSavingCustomerId(id);
    const sb = getClient();
    const { error } = await sb.from("profiles").update({ preferred_contact: value }).eq("id", id);
    setSavingCustomerId(null);
    if (error) showMsg("Failed to update preferred contact: " + error.message, "error");
  };

  const handleNotesChange = (id: string, value: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, staff_notes: value } : c));
  };

  const handleSaveCustomer = async (id: string) => {
    const c = customers.find(c => c.id === id);
    if (!c) return;
    setSavingCustomerId(id);
    const sb = getClient();
    const { error } = await sb.from("profiles").update({ staff_notes: c.staff_notes, preferred_contact: c.preferred_contact }).eq("id", id);
    setSavingCustomerId(null);
    if (error) showMsg("Failed to save customer notes: " + error.message, "error");
  };

  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return true;
    return (c.full_name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.phone || "").toLowerCase().includes(q);
  });

  const sortedProducts = (() => {
    const arr = [...products];
    if (adminSort === "custom") return arr; // already in curated sort_order from the query
    if (adminSort === "price-desc") arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (adminSort === "price-asc") arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (adminSort === "brand") arr.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
    else if (adminSort === "status") arr.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    else if (adminSort === "newest") arr.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    return arr;
  })();

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

  const persistProductOrder = async (reordered: Product[], successMsg: string) => {
    const updates = reordered.map((p, i) => ({ ...p, sort_order: i }));
    setProducts(updates);
    setSavingOrder(true);

    const sb = getClient();
    const results = await Promise.all(
      updates.map(p => sb.from("products").update({ sort_order: p.sort_order }).eq("id", p.id!))
    );
    setSavingOrder(false);
    const failed = results.find(r => r.error);
    if (failed?.error) showMsg("Could not save order: " + failed.error.message, "error");
    else showMsg(successMsg);
  };

  const handleProductDrop = async (targetId: string) => {
    if (!draggedProductId || draggedProductId === targetId) { setDraggedProductId(null); return; }
    const draggedIdx = products.findIndex(p => p.id === draggedProductId);
    const targetIdx = products.findIndex(p => p.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) { setDraggedProductId(null); return; }

    const reordered = [...products];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setDraggedProductId(null);

    await persistProductOrder(reordered, "Display order updated — this is the order customers will see.");
  };

  const handleMoveToTop = async (id: string) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx <= 0) return; // already first, or not found
    const reordered = [...products];
    const [moved] = reordered.splice(idx, 1);
    reordered.unshift(moved);
    await persistProductOrder(reordered, `${moved.brand} ${moved.model} moved to the top.`);
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

  const handleBulkImageUpload = async (files: FileList) => {
    setBulkUploading(true);
    const sb = getClient();
    const results: { name: string; url: string }[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from("product-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error) {
        showMsg(`Upload failed for ${file.name}: ${error.message}`, "error");
      } else {
        const { data: { publicUrl } } = sb.storage.from("product-images").getPublicUrl(fileName);
        results.push({ name: file.name, url: publicUrl });
      }
    }
    if (results.length > 0) {
      setBulkUploadedUrls(prev => [...prev, ...results]);
      showMsg(`${results.length} image${results.length > 1 ? "s" : ""} uploaded.`);
    }
    setBulkUploading(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
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

  const handleExportExcel = () => {
    setExporting(true);
    try {
      const rows = products.map(p => {
        const row: Record<string, any> = {};
        EXCEL_COLUMNS.forEach(col => {
          const raw = (p as any)[col.key];
          if (col.kind === "bool") row[col.label] = formatBoolCell(!!raw);
          else if (col.kind === "images") row[col.label] = formatImagesCell(raw);
          else row[col.label] = raw ?? "";
        });
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(rows, { header: EXCEL_COLUMNS.map(c => c.label) });
      ws["!cols"] = EXCEL_COLUMNS.map(c => ({ wch: Math.max(18, c.label.length * 0.9) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `chronovian-products-${dateStr}.xlsx`);
      showMsg(`Exported ${products.length} product${products.length === 1 ? "" : "s"} to Excel.`);
    } catch (err: any) {
      showMsg("Export failed: " + err.message, "error");
    } finally {
      setExporting(false);
    }
  };

  const handleImportFileSelect = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const labelToKey: Record<string, string> = {};
      EXCEL_COLUMNS.forEach(c => { labelToKey[c.label] = c.key; });

      const existingIds = new Set(products.map(p => p.id));
      let newCount = 0, updateCount = 0, skipped = 0;
      const parsedRows: any[] = [];

      rawRows.forEach(raw => {
        const row: Record<string, any> = {};
        EXCEL_COLUMNS.forEach(col => {
          const cell = raw[col.label];
          if (col.kind === "bool") row[col.key] = parseBoolCell(cell);
          else if (col.kind === "images") row[col.key] = parseImagesCell(cell);
          else if (col.kind === "number") row[col.key] = Number(cell) || 0;
          else row[col.key] = String(cell ?? "").trim();
        });

        // Required fields — skip rows missing the essentials rather than importing broken data
        if (!row.brand || !row.model || !row.category) { skipped++; return; }

        // Only treat as an update if the id actually matches an existing product;
        // otherwise strip it so Supabase generates a fresh id (avoids id typos colliding with the wrong row)
        if (row.id && existingIds.has(row.id)) updateCount++;
        else { delete row.id; newCount++; }

        parsedRows.push(row);
      });

      setImportPreview({ rows: parsedRows, newCount, updateCount, skipped });
    } catch (err: any) {
      showMsg("Could not read that file: " + err.message, "error");
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setImporting(true);
    try {
      const sb = getClient();
      const toInsert = importPreview.rows.filter(r => !r.id);
      const toUpdate = importPreview.rows.filter(r => !!r.id);

      if (toInsert.length > 0) {
        const { error } = await sb.from("products").insert(toInsert);
        if (error) throw new Error("Adding new products failed: " + error.message);
      }
      if (toUpdate.length > 0) {
        const { error } = await sb.from("products").upsert(toUpdate, { onConflict: "id" });
        if (error) throw new Error("Updating existing products failed: " + error.message);
      }

      showMsg(`Import complete — ${importPreview.newCount} added, ${importPreview.updateCount} updated.`);
      setImportPreview(null);
      fetchProducts();
    } catch (err: any) {
      showMsg("Import failed: " + err.message, "error");
    } finally {
      setImporting(false);
    }
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F3F0", fontFamily: "sans-serif", color: "#1A1A1A" }}>
        <div style={{ background: "white", padding: "3rem", width: "380px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6E1F2E" }}>Chronovian</h1>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A7340", marginBottom: "2rem" }}>Admin Panel</p>
          <input type="password" placeholder="Enter admin password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (password === ADMIN_PASSWORD ? setAuthed(true) : showMsg("Incorrect password", "error"))}
            style={{ width: "100%", padding: "0.85rem 1rem", border: "1px solid #E5E3E0", fontSize: "0.85rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }}
          />
          <button onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : showMsg("Incorrect password", "error")}
            style={{ width: "100%", padding: "0.85rem", background: "#6E1F2E", color: "white", border: "none", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "sans-serif" }}>
            Enter
          </button>
          {msg && <p style={{ color: msg.type === "error" ? "#c0392b" : "#2e7d32", fontSize: "0.75rem", marginTop: "0.75rem" }}>{msg.text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3F0", fontFamily: "sans-serif", color: "#1A1A1A" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ai { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E3E0; background: white; font-size: 0.82rem; outline: none; transition: border-color 0.2s; font-weight: 400; font-family: sans-serif; color: #1A1A1A; }
        .ai:focus { border-color: #9A7340; }
        .as { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E3E0; background: white; font-size: 0.82rem; outline: none; cursor: pointer; font-family: sans-serif; color: #1A1A1A; }
        .al { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6B6B6B; display: block; margin-bottom: 0.4rem; }
        .ab { padding: 0.65rem 1.25rem; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; border: none; cursor: pointer; font-family: sans-serif; transition: all 0.2s; white-space: nowrap; }
        .ab-gold { background: #6E1F2E; color: white; } .ab-gold:hover { background: #8A2E40; }
        .ab-black { background: #0A0A0A; color: white; } .ab-black:hover { background: #333; }
        .ab-out { background: none; border: 1px solid #E5E3E0; color: #0A0A0A; } .ab-out:hover { border-color: #0A0A0A; }
        .ab-red { background: none; border: 1px solid #E5E3E0; color: #c0392b; } .ab-red:hover { background: #fff5f5; border-color: #c0392b; }
        .ab-blue { background: none; border: 1px solid #3498db; color: #3498db; } .ab-blue:hover { background: #ebf5fb; }
        .fg { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .fg3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .sd { font-size: 0.58rem; letter-spacing: 0.25em; text-transform: uppercase; color: #9A7340; margin: 1.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #E5E3E0; }
        .pr { background: white; padding: 1.25rem 1.5rem; display: grid; grid-template-columns: 80px 1fr auto; gap: 1.5rem; align-items: center; border-bottom: 1px solid #F0EDE9; }
        .pr:last-child { border-bottom: none; }
        .sb { padding: 0.25rem 0.75rem; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 2px; }
        .sb-av { background: #e8f5e9; color: #2e7d32; } .sb-sold { background: #ffebee; color: #c62828; } .sb-res { background: #fff3e0; color: #e65100; }
        .tab { padding: 0.75rem 1.5rem; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; border: none; cursor: pointer; font-family: sans-serif; background: none; color: #6B6B6B; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab.active { color: #9A7340; border-bottom-color: #9A7340; }
        .cb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #0A0A0A; cursor: pointer; }
        .ig { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin-top: 1rem; }
        .it { position: relative; aspect-ratio: 1; background: #F5F3F0; overflow: hidden; border: 1px solid #E5E3E0; }
        .it img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ir { position: absolute; top: 4px; right: 4px; background: white; border: none; width: 22px; height: 22px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.2); border-radius: 50%; }
        .ua { border: 2px dashed #E5E3E0; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.2s; background: white; }
        .ua:hover { border-color: #9A7340; background: #fdf9f4; }
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
            {(["products", "banners", "categories", "bookings", "orders", "customers"] as const).map(t => (
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
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <input ref={importFileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                  onChange={e => { if (e.target.files?.[0]) handleImportFileSelect(e.target.files[0]); e.target.value = ""; }} />
                <button className="ab ab-out" onClick={() => setBulkUploadOpen(true)}>Bulk Upload Images</button>
                <button className="ab ab-out" onClick={() => importFileRef.current?.click()}>Import from Excel</button>
                <button className="ab ab-out" onClick={handleExportExcel} disabled={exporting}>{exporting ? "Exporting…" : "Export to Excel"}</button>
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
                <div><label className="al">Model No</label><input className="ai" value={form.ref} onChange={e => setForm(f => ({ ...f, ref: e.target.value }))} placeholder="e.g. 126610LN" /></div>
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
                      <div><label className="al">Collection</label><input className="ai" value={form.collection} onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} placeholder="e.g. Big Bang" /></div>
                      <div><label className="al">Series</label><input className="ai" value={form.series} onChange={e => setForm(f => ({ ...f, series: e.target.value }))} placeholder="e.g. N/A" /></div>
                      <div><label className="al">Calibre</label><input className="ai" value={form.calibre} onChange={e => setForm(f => ({ ...f, calibre: e.target.value }))} placeholder="e.g. HUB9015" /></div>
                    </div>
                    <div className="fg3">
                      <div><label className="al">Dial Colour</label><input className="ai" value={form.dial_color} onChange={e => setForm(f => ({ ...f, dial_color: e.target.value }))} placeholder="e.g. Black" /></div>
                      <div><label className="al">Case Material</label><input className="ai" value={form.case_material} onChange={e => setForm(f => ({ ...f, case_material: e.target.value }))} placeholder="e.g. Stainless Steel" /></div>
                      <div><label className="al">Bracelet</label><input className="ai" value={form.bracelet_material} onChange={e => setForm(f => ({ ...f, bracelet_material: e.target.value }))} placeholder="e.g. Oyster" /></div>
                    </div>
                    <div className="fg">
                      <div><label className="al">Case Size</label><input className="ai" value={form.case_size} onChange={e => setForm(f => ({ ...f, case_size: e.target.value }))} placeholder="e.g. 41mm" /></div>
                      <div><label className="al">Movement</label><input className="ai" value={form.movement} onChange={e => setForm(f => ({ ...f, movement: e.target.value }))} placeholder="e.g. Automatic Cal. 3235" /></div>
                    </div>
                    <div className="fg3">
                      <div><label className="al">Case Thickness</label><input className="ai" value={form.case_thickness} onChange={e => setForm(f => ({ ...f, case_thickness: e.target.value }))} placeholder="e.g. 15.80 mm" /></div>
                      <div><label className="al">Case Shape</label><input className="ai" value={form.case_shape} onChange={e => setForm(f => ({ ...f, case_shape: e.target.value }))} placeholder="e.g. Round" /></div>
                      <div><label className="al">Case Back</label><input className="ai" value={form.case_back} onChange={e => setForm(f => ({ ...f, case_back: e.target.value }))} placeholder="e.g. See-through Case Back" /></div>
                    </div>
                    <div className="fg3">
                      <div><label className="al">Glass Material</label><input className="ai" value={form.glass_material} onChange={e => setForm(f => ({ ...f, glass_material: e.target.value }))} placeholder="e.g. Sapphire Crystal" /></div>
                      <div><label className="al">Strap Colour</label><input className="ai" value={form.strap_colour} onChange={e => setForm(f => ({ ...f, strap_colour: e.target.value }))} placeholder="e.g. Black" /></div>
                      <div><label className="al">Clasp Type</label><input className="ai" value={form.clasp_type} onChange={e => setForm(f => ({ ...f, clasp_type: e.target.value }))} placeholder="e.g. Folding Clasp" /></div>
                    </div>
                    <div className="fg3">
                      <div><label className="al">Buckle/Clasp Material</label><input className="ai" value={form.buckle_clasp_material} onChange={e => setForm(f => ({ ...f, buckle_clasp_material: e.target.value }))} placeholder="e.g. Deployant Buckle" /></div>
                      <div><label className="al">Precious Stone</label><input className="ai" value={form.gemstone} onChange={e => setForm(f => ({ ...f, gemstone: e.target.value }))} placeholder="e.g. Diamond" /></div>
                      <div><label className="al">Gender</label>
                        <select className="ai" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                          <option value="">Select</option><option>Men</option><option>Women</option><option>Unisex</option>
                        </select>
                      </div>
                    </div>
                    <div className="fg3">
                      <div><label className="al">Water Resistance (M)</label><input className="ai" value={form.water_resistance} onChange={e => setForm(f => ({ ...f, water_resistance: e.target.value }))} placeholder="e.g. 30" /></div>
                      <div><label className="al">Warranty Period</label><input className="ai" value={form.warranty_period} onChange={e => setForm(f => ({ ...f, warranty_period: e.target.value }))} placeholder="e.g. 5 years warranty, extendable to 10 years." /></div>
                      <div><label className="al">Country Of Origin</label><input className="ai" value={form.country_of_origin} onChange={e => setForm(f => ({ ...f, country_of_origin: e.target.value }))} placeholder="e.g. Switzerland" /></div>
                    </div>
                    <div className="fg">
                      <div><label className="al">Warranty Register URL</label><input className="ai" value={form.warranty_register_url} onChange={e => setForm(f => ({ ...f, warranty_register_url: e.target.value }))} placeholder="e.g. https://brand.com/warranty-register" /></div>
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
                          {i === 0 && <span style={{ position: "absolute", bottom: 4, left: 4, background: "#9A7340", color: "white", fontSize: "0.45rem", padding: "2px 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Primary</span>}
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
            {products.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.7rem", color: adminSort === "custom" ? "#6E1F2E" : "#ADADAD" }}>
                  {savingOrder || savingSiteSort
                    ? "Saving…"
                    : adminSort === "custom"
                      ? "Drag rows — or use ↑ Move to Top — to set the order customers see."
                      : adminSort === "brand" || adminSort === "status"
                        ? "Admin view only — the website order is unchanged."
                        : "This is also the order customers see on the website."}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <label style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B6B6B" }}>Sort by</label>
                <select className="as" style={{ width: "auto", minWidth: "220px" }} value={adminSort} onChange={e => handleAdminSortChange(e.target.value)} disabled={savingSiteSort}>
                  <option value="custom">Custom Order (drag to arrange)</option>
                  <option value="price-desc">Price — High to Low</option>
                  <option value="price-asc">Price — Low to High</option>
                  <option value="newest">Newest Added</option>
                  <option value="brand">Brand / Model (A–Z)</option>
                  <option value="status">Status</option>
                </select>
                </div>
              </div>
            )}
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {sortedProducts.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>No products yet. Add your first product above.</div>
                : sortedProducts.map(p => (
                  <div
                    className="pr"
                    key={p.id}
                    draggable={adminSort === "custom"}
                    onDragStart={() => adminSort === "custom" && setDraggedProductId(p.id!)}
                    onDragOver={e => { if (adminSort === "custom") e.preventDefault(); }}
                    onDrop={() => adminSort === "custom" && handleProductDrop(p.id!)}
                    style={{
                      cursor: adminSort === "custom" ? "grab" : "default",
                      opacity: draggedProductId === p.id ? 0.4 : 1,
                    }}
                  >
                    <div style={{ width: 80, height: 96, background: "#F5F3F0", overflow: "hidden", flexShrink: 0, border: "1px solid #E5E3E0" }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.model} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>📷</div>
                      }
                    </div>
                    <div>
                      <span style={{ fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A7340" }}>{p.brand}</span>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", margin: "0.2rem 0" }}>{p.model}</div>
                      <div style={{ fontSize: "0.65rem", color: "#6B6B6B", marginBottom: "0.4rem" }}>{p.ref} · {p.condition} · {p.year}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{fmt(p.price)}</span>
                        <span className={`sb sb-${p.status === "available" ? "av" : p.status === "reserved" ? "res" : "sold"}`}>{p.status}</span>
                        <span style={{ fontSize: "0.6rem", color: "#ADADAD", textTransform: "uppercase", letterSpacing: "0.1em" }}>{p.category}</span>
                        {p.featured && <span style={{ fontSize: "0.6rem", color: "#9A7340", textTransform: "uppercase", letterSpacing: "0.1em" }}>★ Featured</span>}
                        <span style={{ fontSize: "0.6rem", color: "#ADADAD" }}>{p.images?.length || 0} photo{(p.images?.length || 0) !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {adminSort === "custom" && products.findIndex(x => x.id === p.id) > 0 && (
                        <button className="ab ab-out" onClick={() => handleMoveToTop(p.id!)} disabled={savingOrder}>↑ Move to Top</button>
                      )}
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

                <p className="sd">Banner Media</p>
                <div className="ua" onClick={() => bannerFileRef.current?.click()}>
                  <input ref={bannerFileRef} type="file" accept="image/*,video/*" style={{ display: "none" }}
                    onChange={e => { if (e.target.files && e.target.files.length > 0) handleBannerImageUpload(e.target.files); }} />
                  {bannerUploading
                    ? <p style={{ fontSize: "0.82rem", color: "#6B6B6B" }}>⏳ Uploading...</p>
                    : bannerForm.image_url
                      ? (isVideo(bannerForm.image_url)
                          ? <video src={bannerForm.image_url} muted style={{ maxWidth: "100%", maxHeight: "220px", objectFit: "contain" }} />
                          : <img src={bannerForm.image_url} alt="Banner preview" style={{ maxWidth: "100%", maxHeight: "220px", objectFit: "contain" }} />)
                      : <div>
                          <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🖼️</p>
                          <p style={{ fontSize: "0.82rem", color: "#6B6B6B" }}>Click to upload a banner image or video</p>
                          <p style={{ fontSize: "0.65rem", color: "#ADADAD", marginTop: "0.25rem" }}>Image: wide landscape, 1600px+ width. Video: short clip (5–10s), no audio needed — it will autoplay muted and loop.</p>
                        </div>
                  }
                </div>
                {bannerForm.image_url && (
                  <button className="ab ab-out" style={{ marginTop: "0.75rem" }} onClick={() => setBannerForm(f => ({ ...f, image_url: "" }))}>Remove {isVideo(bannerForm.image_url) ? "Video" : "Image"}</button>
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
        {tab === "categories" && (
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
                    <p style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A7340", marginBottom: "0.5rem" }}>
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
            <div style={{ marginTop: "2rem", padding: "1rem 1.5rem", background: "#F5F3F0", borderLeft: "3px solid #9A7340", fontSize: "0.78rem", color: "#6B6B6B", lineHeight: 1.7 }}>
              💡 Tip: Use portrait-oriented images (taller than wide) for best results. Minimum recommended size: 800 × 1000px. The client's own product photography works best here.
            </div>

            {/* CHRONOVIAN STORE PHOTOS */}
            <div style={{ marginTop: "3.5rem", paddingTop: "2.5rem", borderTop: "1px solid #E5E3E0" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", fontWeight: 400 }}>Chronovian Photos</h2>
                <p style={{ fontSize: "0.72rem", color: "#6B6B6B", marginTop: "0.25rem" }}>
                  Shown beside the map in the "Visit Us" section at the bottom of the homepage. Upload up to 4 — empty slots are simply hidden.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
                {["store_1", "store_2", "store_3", "store_4"].map((key, i) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ background: "white", border: "1px solid #E5E3E0", overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                      {catImages[key]
                        ? <img src={catImages[key]} alt={`Chronovian ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.4rem", background: "#F5F3F0" }}>
                            <span style={{ fontSize: "1.5rem" }}>🏪</span>
                            <span style={{ fontSize: "0.68rem", color: "#ADADAD" }}>Photo {i + 1}</span>
                          </div>
                      }
                      {catUploading === key && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", color: "#6B6B6B" }}>
                          ⏳ Uploading...
                        </div>
                      )}
                    </div>
                    <input
                      ref={storeFileRefs[key]}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => { if (e.target.files && e.target.files.length > 0) handleCatImageUpload(key, e.target.files); }}
                    />
                    <button
                      className="ab ab-gold"
                      style={{ width: "100%" }}
                      onClick={() => storeFileRefs[key].current?.click()}
                      disabled={catUploading === key}
                    >
                      {catImages[key] ? "Replace" : "Upload"}
                    </button>
                    {catImages[key] && (
                      <button
                        className="ab ab-out"
                        style={{ width: "100%" }}
                        onClick={async () => {
                          const sb = getClient();
                          await sb.from("category_images").upsert({ id: key, image_url: "", updated_at: new Date().toISOString() });
                          setCatImages(prev => ({ ...prev, [key]: "" }));
                          showMsg(`Chronovian photo ${i + 1} removed.`);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1.5rem", padding: "1rem 1.5rem", background: "#F5F3F0", borderLeft: "3px solid #6E1F2E", fontSize: "0.78rem", color: "#6B6B6B", lineHeight: 1.7 }}>
                💡 Landscape photos work best here (4:3). Interior shots, the display cases, and the storefront all work well.
              </div>
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

        {/* CUSTOMERS TAB */}
        {tab === "customers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", fontWeight: 400 }}>Customers ({customers.length})</h2>
              <input className="ai" style={{ maxWidth: "280px" }} placeholder="Search name, email, phone…" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
            </div>
            <div style={{ background: "white", border: "1px solid #E5E3E0" }}>
              {filteredCustomers.length === 0
                ? <div style={{ padding: "3rem", textAlign: "center", color: "#6B6B6B", fontSize: "0.82rem" }}>
                    {customers.length === 0 ? "No customers yet." : "No customers match your search."}
                  </div>
                : filteredCustomers.map(c => (
                  <div key={c.id} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F0EDE9" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr auto", gap: "1.5rem", alignItems: "center" }}>
                      <div>
                        <div style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {c.full_name || "Unnamed Customer"}
                          {c.vip && <span style={{ fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "#9A7340", color: "white", padding: "2px 7px" }}>VIP</span>}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#6B6B6B" }}>{c.email}</div>
                        <div style={{ fontSize: "0.72rem", color: "#6B6B6B" }}>{c.phone || "No phone on file"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#ADADAD", marginBottom: "0.4rem" }}>Preferred Contact</div>
                        <select className="as" value={c.preferred_contact || "email"} onChange={e => handleContactChange(c.id, e.target.value)}>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                        <button className={`ab ${c.vip ? "ab-gold" : "ab-out"}`} onClick={() => handleToggleVip(c.id, c.vip)}>{c.vip ? "★ VIP" : "Mark VIP"}</button>
                        {c.created_at && <span style={{ fontSize: "0.6rem", color: "#ADADAD" }}>Since {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                      </div>
                    </div>
                    <div style={{ marginTop: "0.9rem", position: "relative" }}>
                      <textarea
                        className="ai"
                        style={{ minHeight: "48px", fontSize: "0.75rem", resize: "vertical" }}
                        placeholder="Staff notes — visible to your team only…"
                        value={c.staff_notes || ""}
                        onChange={e => handleNotesChange(c.id, e.target.value)}
                        onBlur={() => handleSaveCustomer(c.id)}
                      />
                      {savingCustomerId === c.id && <span style={{ fontSize: "0.6rem", color: "#9A7340", position: "absolute", right: "0.5rem", bottom: "0.5rem" }}>Saving…</span>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* BULK IMAGE UPLOAD MODAL */}
      {bulkUploadOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.6)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ background: "white", maxWidth: "620px", width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.2rem", fontWeight: 400 }}>Bulk Upload Images</h3>
              <button onClick={() => { setBulkUploadOpen(false); setBulkUploadedUrls([]); }} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#6B6B6B", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              Select photos from your computer — they'll upload to storage and you'll get back ready-to-paste URLs for the Excel import's Image URLs column.
            </p>

            <input ref={bulkUploadFileRef} type="file" multiple accept="image/*" style={{ display: "none" }}
              onChange={e => { if (e.target.files && e.target.files.length > 0) handleBulkImageUpload(e.target.files); e.target.value = ""; }} />
            <div className="ua" onClick={() => bulkUploadFileRef.current?.click()} style={{ marginBottom: "1.5rem" }}>
              {bulkUploading
                ? <p style={{ fontSize: "0.82rem", color: "#6B6B6B" }}>⏳ Uploading...</p>
                : <div>
                    <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🖼️</p>
                    <p style={{ fontSize: "0.82rem", color: "#6B6B6B" }}>Click to select one or more images</p>
                  </div>
              }
            </div>

            {bulkUploadedUrls.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B" }}>{bulkUploadedUrls.length} Uploaded</span>
                  <button
                    className="ab ab-gold"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.65rem" }}
                    onClick={async () => {
                      const joined = bulkUploadedUrls.map(u => u.url).join(" | ");
                      const ok = await copyToClipboard(joined);
                      if (ok) { setBulkCopiedAll(true); setTimeout(() => setBulkCopiedAll(false), 2000); showMsg("Copied — paste into one Image URLs cell in Excel."); }
                      else showMsg("Couldn't copy automatically — select and copy the URLs manually below.", "error");
                    }}
                  >
                    {bulkCopiedAll ? "Copied ✓" : "Copy All (for one product)"}
                  </button>
                </div>
                <div style={{ border: "1px solid #E5E3E0" }}>
                  {bulkUploadedUrls.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.9rem", borderBottom: i < bulkUploadedUrls.length - 1 ? "1px solid #F0EDE9" : "none" }}>
                      <img src={item.url} alt={item.name} style={{ width: "36px", height: "36px", objectFit: "cover", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.72rem", color: "#6B6B6B", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      <button
                        className="ab ab-out"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.6rem", flexShrink: 0 }}
                        onClick={async () => { const ok = await copyToClipboard(item.url); showMsg(ok ? "URL copied." : "Couldn't copy — copy it manually.", ok ? "success" : "error"); }}
                      >
                        Copy URL
                      </button>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.65rem", color: "#ADADAD", marginTop: "0.75rem", lineHeight: 1.6 }}>
                  Uploading photos for one product? Select them all together, then use "Copy All" — it joins every URL with the same "|" separator the Excel import expects for one cell. Uploading for different products separately? Use each row's individual "Copy URL" instead.
                </p>
                <button className="ab ab-out" style={{ marginTop: "1rem" }} onClick={() => setBulkUploadedUrls([])}>Clear List</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* IMPORT PREVIEW MODAL */}
      {importPreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.6)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ background: "white", maxWidth: "560px", width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "2rem" }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.2rem", fontWeight: 400, marginBottom: "1rem" }}>Confirm Import</h3>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>
              <strong style={{ color: "#6E1F2E" }}>{importPreview.newCount}</strong> new product{importPreview.newCount === 1 ? "" : "s"} will be created,{" "}
              <strong style={{ color: "#6E1F2E" }}>{importPreview.updateCount}</strong> existing product{importPreview.updateCount === 1 ? "" : "s"} will be updated.
              {importPreview.skipped > 0 && <><br /><span style={{ color: "#B3261E" }}>{importPreview.skipped} row{importPreview.skipped === 1 ? "" : "s"} skipped — missing Brand, Model, or Category.</span></>}
            </p>
            <div style={{ border: "1px solid #E5E3E0", maxHeight: "280px", overflowY: "auto", marginBottom: "1.5rem" }}>
              {importPreview.rows.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0.9rem", borderBottom: i < importPreview.rows.length - 1 ? "1px solid #F0EDE9" : "none", fontSize: "0.78rem" }}>
                  <span>{r.brand} {r.model} {r.ref ? `(${r.ref})` : ""}</span>
                  <span style={{ color: r.id ? "#6B6B6B" : "#6E1F2E", fontWeight: 500, fontSize: "0.65rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>{r.id ? "Update" : "New"}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="ab ab-gold" onClick={handleConfirmImport} disabled={importing || importPreview.rows.length === 0}>{importing ? "Importing…" : `Confirm Import (${importPreview.rows.length})`}</button>
              <button className="ab ab-out" onClick={() => setImportPreview(null)} disabled={importing}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

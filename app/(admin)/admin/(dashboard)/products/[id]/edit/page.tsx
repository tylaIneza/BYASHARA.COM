"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  X, Plus, ArrowLeft, ChevronDown, Info,
  ImagePlus, Trash2, CheckCircle2, Package, Star, Loader2,
  PackagePlus, Minus, AlertTriangle,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import Link from "next/link";
import { useProductStore, fileToBase64 } from "@/lib/product-store";
import { useCategoryStore } from "@/lib/category-store";
const CONDITIONS = ["NEW", "REFURBISHED", "OPEN_BOX"];
const CURRENCIES = ["RWF", "USD", "CDF"];

interface ImageItem { file?: File; preview: string; isBase64: boolean; }
interface PriceTier { minQty: number; maxQty: string; price: string; }
interface Variant { name: string; value: string; stock: string; price: string; }

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "pricing", label: "Pricing" },
  { id: "media", label: "Media" },
  { id: "specs", label: "Specifications" },
  { id: "shipping", label: "Shipping" },
] as const;

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  PENDING:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
  DRAFT:    "text-gray-400 bg-gray-400/10 border-gray-400/20",
  INACTIVE: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { products, updateProduct } = useProductStore();
  const { categories } = useCategoryStore();
  const product = products.find((p) => p.id === id);

  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "media" | "specs" | "shipping">("basic");
  const [currency, setCurrency] = useState("RWF");
  const [saving, setSaving] = useState(false);

  // Images: existing base64 stored images + newly uploaded File objects
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([
    { minQty: 1, maxQty: "9", price: "" },
    { minQty: 10, maxQty: "49", price: "" },
    { minQty: 50, maxQty: "", price: "" },
  ]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [specs, setSpecs] = useState([{ key: "Brand", value: "" }]);

  const [status, setStatus] = useState<"ACTIVE" | "PENDING" | "DRAFT" | "INACTIVE" | "REJECTED">("PENDING");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [moq, setMoq] = useState("1");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [warranty, setWarranty] = useState("");
  const [tags, setTags] = useState("");
  const [weight, setWeight] = useState("");
  const [addQty, setAddQty] = useState(""); // units to add to stock

  const applyAddStock = () => {
    const qty = parseInt(addQty, 10);
    if (!qty || qty <= 0) return;
    setStock((prev) => String(Number(prev) + qty));
    setAddQty("");
    toast.success(`+${qty} units added to stock`);
  };

  // Populate fields from store once product is available
  useEffect(() => {
    if (!product) return;
    setStatus(product.status);
    setName(product.name);
    setBrand(product.brand);
    setSku(product.sku);
    setCategory(product.category);
    setStock(String(product.stock));
    setMoq(String(product.moq));
    setPrice(String(product.price));
    setSalePrice(product.salePrice ? String(product.salePrice) : "");
    setDescription(product.description);
    setWarranty(product.warranty);
    setTags(product.tags);
    setWeight(product.weight);
    setCurrency(product.currency ?? "RWF");
    setSpecs([{ key: "Brand", value: product.brand }]);
    setPriceTiers([
      { minQty: 1, maxQty: "9", price: String(product.price) },
      { minQty: 10, maxQty: "49", price: "" },
      { minQty: 50, maxQty: "", price: "" },
    ]);
    // Load existing stored images
    if (product.images && product.images.length > 0) {
      setImageItems(product.images.map((src) => ({ preview: src, isBase64: true })));
    } else if (product.imageUrl) {
      setImageItems([{ preview: product.imageUrl, isBase64: true }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      imageItems.forEach((item) => {
        if (!item.isBase64 && item.preview) URL.revokeObjectURL(item.preview);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: ImageItem[] = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isBase64: false,
    }));
    setImageItems((prev) => [...prev, ...newItems].slice(0, 10));
  }, []);

  const removeImage = (index: number) => {
    setImageItems((prev) => {
      const item = prev[index];
      if (!item.isBase64) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setPrimary = (index: number) => {
    setImageItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [] },
    noClick: true,
    noKeyboard: true,
    onDrop,
  });

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <p className="text-white font-bold text-lg">Product not found</p>
        <Link href="/admin/products" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert any new File uploads to base64; keep existing base64 strings as-is
      const base64Images = await Promise.all(
        imageItems.map((item) =>
          item.isBase64 ? Promise.resolve(item.preview) : fileToBase64(item.file!)
        )
      );

      updateProduct(id, {
        name,
        brand,
        sku,
        category,
        status,
        stock: Number(stock),
        moq: Number(moq),
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        description,
        warranty,
        tags,
        weight,
        currency,
        imageUrl: base64Images[0] ?? product.imageUrl,
        images: base64Images,
      });

      toast.success("Product saved — changes are now live on the store!");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to save. Try using smaller images.");
    } finally {
      setSaving(false);
    }
  };

  const primaryPreview = imageItems[0]?.preview ?? null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/admin/products" className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-11 w-11 rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/10 flex items-center justify-center shrink-0">
            {primaryPreview
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={primaryPreview} alt="" className="w-full h-full object-cover" />
              : <Package className="h-5 w-5 text-gray-600" />
            }
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-white truncate">{name || "Edit Product"}</h1>
            <p className="text-sm text-gray-500">{sku} · {product.vendor}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border appearance-none cursor-pointer bg-transparent ${STATUS_STYLE[status]}`}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="DRAFT">DRAFT</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#111111] border border-white/10 rounded-2xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab.id ? "bg-[#FF6B00] text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
            {tab.id === "media" && imageItems.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-white/20 text-[10px]">
                {imageItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === "basic" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label-xs">Product Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="e.g. Samsung Galaxy S24 Ultra" />
            </div>
            <div>
              <label className="label-xs">Brand *</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="field" />
            </div>
            <div>
              <label className="label-xs">SKU *</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="field" />
            </div>
            <div>
              <label className="label-xs">Product Condition</label>
              <div className="relative">
                <select className="field appearance-none pr-8" defaultValue={product.condition}>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label-xs">Category *</label>
              <div className="relative">
                <select className="field appearance-none pr-8" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label-xs">Warranty</label>
              <input type="text" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="field" />
            </div>
            <div>
              <label className="label-xs">Tags / Keywords</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="field" placeholder="comma separated" />
            </div>
            <div className="md:col-span-2">
              <label className="label-xs">Description</label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="field resize-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label-xs">Product Variants</label>
              <button onClick={() => setVariants((v) => [...v, { name: "Color", value: "", stock: "", price: "" }])}
                className="flex items-center gap-1.5 text-xs text-[#FF6B00] hover:text-white transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Variant
              </button>
            </div>
            {variants.length === 0 && (
              <p className="text-xs text-gray-500 italic">No variants. Click "Add Variant" to add color/storage/size options.</p>
            )}
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <select className="field w-32" value={v.name} onChange={(e) => setVariants((vs) => vs.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))}>
                  {["Color", "Storage", "Size", "Model"].map((n) => <option key={n}>{n}</option>)}
                </select>
                <input type="text" placeholder="Value" className="field flex-1" />
                <input type="number" placeholder="Stock" className="field w-24" />
                <input type="number" placeholder="Price" className="field w-28" />
                <button onClick={() => setVariants((vs) => vs.filter((_, xi) => xi !== i))}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pricing */}
      {activeTab === "pricing" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            <div className="md:col-span-3">
              <label className="label-xs">Currency</label>
              <div className="flex gap-2">
                {CURRENCIES.map((c) => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      currency === c ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "border-white/10 text-gray-400 hover:text-white"
                    }`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-xs">Base Price (Wholesale) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="field" placeholder="e.g. 890000" />
            </div>
            <div>
              <label className="label-xs">Sale Price <span className="text-gray-600 font-normal normal-case tracking-normal">(leave blank = no discount)</span></label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="field"
                placeholder="e.g. 750000"
              />
              {salePrice && Number(salePrice) > 0 && Number(price) > 0 && (
                <p className="text-[11px] text-emerald-400 mt-1.5">
                  {Math.round(((Number(price) - Number(salePrice)) / Number(price)) * 100)}% discount shown on storefront
                </p>
              )}
            </div>
            <div>
              <label className="label-xs">MOQ *</label>
              <input type="number" value={moq} onChange={(e) => setMoq(e.target.value)} min="1" className="field" />
            </div>
          </div>

          {/* Stock management */}
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackagePlus className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-sm font-bold text-white">Stock Management</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                Number(stock) === 0
                  ? "text-red-400 bg-red-400/10 border-red-400/20"
                  : Number(stock) < 20
                  ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                  : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
              }`}>
                {Number(stock) === 0 ? "Out of stock" : Number(stock) < 20 ? "Low stock" : "In stock"}
              </span>
            </div>

            {/* Current stock display */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="label-xs">Current Stock</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    min="0"
                    className="field"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">units total</span>
                </div>
              </div>
            </div>

            {/* Add stock widget */}
            <div className="border-t border-white/10 pt-4">
              <label className="label-xs">Add Stock (incoming shipment)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddQty((v) => String(Math.max(0, Number(v) - 1)))}
                  className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  min="0"
                  placeholder="0"
                  className="field text-center"
                  onKeyDown={(e) => e.key === "Enter" && applyAddStock()}
                />
                <button
                  type="button"
                  onClick={() => setAddQty((v) => String(Number(v) + 1))}
                  className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={applyAddStock}
                  disabled={!addQty || Number(addQty) <= 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e55f00] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all whitespace-nowrap"
                >
                  <PackagePlus className="h-4 w-4" />
                  Add Units
                </button>
              </div>
              {addQty && Number(addQty) > 0 && (
                <p className="text-xs text-emerald-400 mt-2">
                  Stock will become <span className="font-bold">{Number(stock) + Number(addQty)} units</span> after saving
                </p>
              )}
              {Number(stock) === 0 && (
                <div className="flex items-center gap-2 mt-3 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  This product is out of stock and hidden from the storefront
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="label-xs mb-0">Bulk Pricing Tiers</label>
              <span className="text-[10px] text-gray-500 flex items-center gap-1"><Info className="h-3 w-3" /> More units = lower price</span>
            </div>
            <div className="space-y-2">
              {priceTiers.map((tier, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#111111] border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <input type="number" value={tier.minQty} readOnly={i > 0}
                      className="w-16 bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center" />
                    <span>–</span>
                    <input type="text" value={tier.maxQty} placeholder="∞"
                      className="w-16 bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center"
                      onChange={(e) => setPriceTiers((t) => t.map((x, xi) => xi === i ? { ...x, maxQty: e.target.value } : x))} />
                    <span>units</span>
                  </div>
                  <span className="text-gray-500">@</span>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-xs text-gray-500">{currency}</span>
                    <input type="number" value={tier.price} placeholder="Price per unit"
                      className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                      onChange={(e) => setPriceTiers((t) => t.map((x, xi) => xi === i ? { ...x, price: e.target.value } : x))} />
                  </div>
                  {i > 0 && (
                    <button onClick={() => setPriceTiers((t) => t.filter((_, ti) => ti !== i))}
                      className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setPriceTiers((t) => [...t, { minQty: 0, maxQty: "", price: "" }])}
                className="flex items-center gap-1.5 text-xs text-[#FF6B00] hover:text-white transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Tier
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Media */}
      {activeTab === "media" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Primary image preview */}
            <div className="flex flex-col gap-3">
              <p className="label-xs mb-0">Primary Image Preview</p>
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#111111] border-2 border-white/10 flex items-center justify-center relative">
                {primaryPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={primaryPreview} alt="Primary" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-600">
                    <Package className="h-12 w-12" />
                    <span className="text-xs">Upload an image</span>
                  </div>
                )}
                {primaryPreview && (
                  <span className="absolute top-2 left-2 text-[10px] bg-[#FF6B00] text-white px-2 py-0.5 rounded-full font-bold">PRIMARY</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 text-center">This image appears on the storefront</p>
            </div>

            {/* Upload + thumbnails */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragActive ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-white/20 hover:border-[#FF6B00]/40"
                }`}
              >
                <input {...getInputProps()} />
                <ImagePlus className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white mb-1">
                  {isDragActive ? "Drop images here…" : "Drag & drop images here"}
                </p>
                <p className="text-xs text-gray-500 mb-3">PNG, JPG, WEBP · up to 10 images · auto-resized to 800px</p>
                <button type="button" onClick={open} className="btn-primary px-6 py-2 text-xs">
                  Choose Files
                </button>
              </div>

              {imageItems.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {imageItems.map((item, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/10 aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.preview} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {i !== 0 && (
                          <button onClick={() => setPrimary(i)} className="p-1.5 bg-amber-500/80 rounded-full" title="Set as primary">
                            <Star className="h-3.5 w-3.5 text-white fill-white" />
                          </button>
                        )}
                        <button onClick={() => removeImage(i)} className="p-1.5 bg-red-500/80 rounded-full">
                          <Trash2 className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute top-1 left-1 text-[9px] bg-[#FF6B00] text-white px-1.5 py-0.5 rounded font-bold leading-none">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Specifications */}
      {activeTab === "specs" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-xs text-gray-500">Technical specifications for this product.</p>
          {specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="text" value={spec.key} placeholder="Spec name (e.g. RAM)" className="field w-44"
                onChange={(e) => setSpecs((s) => s.map((x, xi) => xi === i ? { ...x, key: e.target.value } : x))} />
              <input type="text" value={spec.value} placeholder="Value (e.g. 12GB)" className="field flex-1"
                onChange={(e) => setSpecs((s) => s.map((x, xi) => xi === i ? { ...x, value: e.target.value } : x))} />
              {i > 0 && (
                <button onClick={() => setSpecs((s) => s.filter((_, si) => si !== i))}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setSpecs((s) => [...s, { key: "", value: "" }])}
            className="flex items-center gap-1.5 text-xs text-[#FF6B00] hover:text-white transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Specification
          </button>
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {["Display", "Processor", "RAM", "Storage", "Battery", "Camera", "OS", "Connectivity", "Color", "Weight"].map((s) => (
                <button key={s} onClick={() => setSpecs((sp) => [...sp, { key: s, value: "" }])}
                  className="px-3 py-1 text-xs bg-white/5 border border-white/10 text-gray-400 hover:text-[#FF6B00] hover:border-[#FF6B00]/30 rounded-full transition-all">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Shipping */}
      {activeTab === "shipping" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label-xs">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} step="0.1" className="field" />
            </div>
            <div>
              <label className="label-xs">Length (cm)</label>
              <input type="number" placeholder="15" className="field" />
            </div>
            <div>
              <label className="label-xs">Width (cm)</label>
              <input type="number" placeholder="8" className="field" />
            </div>
            <div>
              <label className="label-xs">Height (cm)</label>
              <input type="number" placeholder="1" className="field" />
            </div>
          </div>
          <div>
            <label className="label-xs mb-2">Delivery Zones</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["Kigali", "Eastern Province", "Western Province", "Northern Province", "Southern Province", "Goma (DRC)", "Bukavu (DRC)"].map((zone) => (
                <label key={zone} className="flex items-center gap-2 p-3 border border-white/10 rounded-xl cursor-pointer hover:border-[#FF6B00]/30 transition-all">
                  <input type="checkbox" defaultChecked className="accent-[#FF6B00]" />
                  <span className="text-xs text-gray-300">{zone}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <Link href="/admin/products" className="px-5 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Cancel
        </Link>
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>

      <style jsx global>{`
        .field { width:100%; background:#111111; border:1px solid rgba(255,255,255,0.1); border-radius:0.75rem; padding:0.625rem 1rem; font-size:0.875rem; color:white; outline:none; transition:border-color 0.15s; }
        .field:focus { border-color:rgba(255,107,0,0.5); }
        .field::placeholder { color:#4B5563; }
        .label-xs { display:block; font-size:0.6875rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#9CA3AF; margin-bottom:0.5rem; }
      `}</style>
    </div>
  );
}

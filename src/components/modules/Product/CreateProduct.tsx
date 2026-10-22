/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Check,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  Warehouse as WarehouseIcon,
  Layers,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import {
  addStoredProduct,
  updateStoredProduct,
  getStoredProducts,
  ProductVariantItem,
} from "./productStorage";
import { getStoredCategories } from "../Category/categoryStorage";
import { getStoredBrands } from "../Brand/brandStorage";
import { getStoredWarehouses } from "../Warehouse/warehouseStorage";
import { useAddProductMutation } from "@/redux/features/product/product.api";

// Clothing specific categories and dynamic subcategories
const CLOTHING_CATEGORIES = [
  "Shirts",
  "T-Shirts",
  "Denim & Jeans",
  "Panjabi & Kurta",
  "Womenswear",
  "Jackets & Coats",
  "Trousers & Pants",
  "Polo Shirts",
  "Formal Wear",
  "Hoodies & Sweaters",
];

const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  Shirts: ["Casual Shirts", "Formal Shirts", "Slim Fit Shirts", "Linen Shirts", "Denim Shirts"],
  "T-Shirts": ["Crewneck Tees", "V-Neck Tees", "Oversized Tees", "Graphic Tees", "Pique Tees"],
  "Denim & Jeans": ["Slim Fit", "Straight Leg", "Skinny Stretch", "Ripped Vintage", "Bootcut"],
  "Panjabi & Kurta": ["Festive Silk Panjabi", "Casual Cotton Kurta", "Embroidered Heritage", "Kabli Set"],
  Womenswear: ["Maxi Dresses", "Kurtis & Tunics", "Tops & Blouses", "Skirts", "Palazzo Sets"],
  "Jackets & Coats": ["Denim Trucker", "Leather Biker", "Bomber Jackets", "Sherpa Coats", "Blazers"],
  "Trousers & Pants": ["Chino Trousers", "Formal Slacks", "Cargo Pants", "Joggers", "Linen Trousers"],
  "Polo Shirts": ["Classic Pique Polo", "Slim Fit Polo", "Mercerized Cotton Polo", "Solid Active"],
  "Formal Wear": ["Two-Piece Suits", "Structured Blazers", "Tuxedos", "Waistcoats"],
  "Hoodies & Sweaters": ["Fleece Pullover", "Zip-Up Hoodies", "Cashmere Sweaters", "Cardigans"],
};

// Clothing specific brands
const DEFAULT_CLOTHING_BRANDS = [
  "NEXORA Menswear",
  "Levi's",
  "Zara",
  "H&M",
  "Aarong Heritage",
  "Ralph Lauren",
  "Dockers",
  "Tommy Hilfiger",
  "Nike Sportswear",
  "Adidas",
  "Uniqlo",
  "Gucci",
];

// Sample apparel preset images for quick selection
const CLOTHING_DEMO_IMAGES = [
  {
    label: "Cotton Shirt",
    url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Denim Jeans",
    url: "https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Panjabi Kurta",
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Crewneck T-Shirt",
    url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Denim Jacket",
    url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80",
  },
  {
    label: "Pullover Hoodie",
    url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80",
  },
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const AVAILABLE_COLORS = [
  { name: "Black", hex: "#111827" },
  { name: "White", hex: "#F3F4F6" },
  { name: "Navy Blue", hex: "#1E3A8A" },
  { name: "Green", hex: "#15803D" },
  { name: "Red", hex: "#DC2626" },
  { name: "Grey", hex: "#6B7280" },
  { name: "Beige", hex: "#D4B996" },
  { name: "Maroon", hex: "#831843" },
];

export default function CreateProduct() {
  const navigate = useNavigate();
  const { id: editProductId } = useParams<{ id?: string }>();
  const isEditMode = Boolean(editProductId);

  const [createProductMutation] = useAddProductMutation();

  // Basic Information States (Image 1)
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  // Category & Brand dynamic options
  const [categoriesList, setCategoriesList] = useState<string[]>(CLOTHING_CATEGORIES);
  const [brandsList, setBrandsList] = useState<string[]>(DEFAULT_CLOTHING_BRANDS);
  const [warehousesList, setWarehousesList] = useState<string[]>([]);

  // Pricing & Inventory States (Image 1)
  const [manualInventory, setManualInventory] = useState(true);
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(0);

  // Warehouse Selection States (Image 1 & 2)
  const [warehouseEnabled, setWarehouseEnabled] = useState(false);
  const [warehouse, setWarehouse] = useState("");
  const [warehouseSection, setWarehouseSection] = useState("");
  const [warehouseSubsection, setWarehouseSubsection] = useState("");

  // Media States (Image 1)
  const [imageUrl, setImageUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");

  // Status State (Image 1)
  const [status, setStatus] = useState<"Active" | "Inactive" | "Draft">("Active");

  // Extra Information States (Image 1)
  const [taxType, setTaxType] = useState<string>("Exclusive");
  const [taxRate, setTaxRate] = useState<string>("5");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [alertQuantity, setAlertQuantity] = useState<number>(10);
  const [warrantyType, setWarrantyType] = useState<string>("Days");
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>("");

  // Product Variants States (Image 2)
  const [variantMode, setVariantMode] = useState<"Single" | "Combo">("Single");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(["Size"]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M"]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variantRows, setVariantRows] = useState<
    Array<{
      id: string;
      optionName: string;
      purchasePrice: number;
      salePrice: number;
      quantity: number;
      selected: boolean;
    }>
  >([
    {
      id: "var-1",
      optionName: "M",
      purchasePrice: 0,
      salePrice: 0,
      quantity: 0,
      selected: true,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load external storage entities
  useEffect(() => {
    try {
      const storedCats = getStoredCategories();
      const catNames = Array.from(new Set([...CLOTHING_CATEGORIES, ...storedCats.map((c) => c.name)]));
      setCategoriesList(catNames);

      const storedB = getStoredBrands();
      const bNames = Array.from(new Set([...DEFAULT_CLOTHING_BRANDS, ...storedB.map((b) => b.name)]));
      setBrandsList(bNames);

      const storedW = getStoredWarehouses();
      const wNames = storedW.map((w) => w.name);
      setWarehousesList(
        wNames.length > 0
          ? wNames
          : ["Smart Stock Hub", "Flow Grid Storage", "Prime Storage Solutions", "Global Supply Depot"]
      );
    } catch {
      // Keep defaults
    }
  }, []);

  // Pre-load if in edit mode
  useEffect(() => {
    if (isEditMode && editProductId) {
      const all = getStoredProducts();
      const found = all.find((p) => p.id === editProductId);
      if (found) {
        setProductName(found.name || "");
        setSku(found.sku || "");
        setBrand(found.brand || "");
        setModel(found.model || "");
        setCategory(found.category || "");
        setSubcategory(found.subcategory || "");
        setPurchasePrice(found.purchasePrice ?? "");
        setSalePrice(found.sellingPrice ?? "");
        setQuantity(found.quantity ?? 0);
        setStatus((found.activeStatus as any) || "Active");
        setImageUrl(found.image || "");
        setTaxType(found.taxType || "Exclusive");
        setTaxRate(found.taxRate ? found.taxRate.replace("%", "").replace(" VAT", "") : "5");
        setExpiryDate(found.expiryDate || "");
        setAlertQuantity(found.alertQuantity ?? found.reorderLevel ?? 10);
        setWarrantyType(found.warrantyType || "Days");
        setWarrantyPeriod(found.warrantyPeriod || "");
        if (found.warehouse) {
          setWarehouseEnabled(true);
          setWarehouse(found.warehouse);
          setWarehouseSection(found.section || "");
          setWarehouseSubsection(found.subsection || "");
        }
        if (found.variants && found.variants.length > 0) {
          setVariantRows(
            found.variants.map((v) => ({
              id: v.id,
              optionName: v.optionName,
              purchasePrice: v.purchasePrice,
              salePrice: v.salePrice,
              quantity: v.quantity,
              selected: true,
            }))
          );
        }
      }
    }
  }, [isEditMode, editProductId]);

  // Subcategory options based on selected category
  const dynamicSubcategories = useMemo(() => {
    if (category && CATEGORY_SUBCATEGORIES[category]) {
      return CATEGORY_SUBCATEGORIES[category];
    }
    return [
      "Casual Wear",
      "Formal Wear",
      "Daily Essentials",
      "Premium Collection",
      "Seasonal Edition",
    ];
  }, [category]);

  // Generate random SKU
  const handleRegenerateSku = () => {
    const newSku = Math.floor(100000 + Math.random() * 900000).toString();
    setSku(newSku);
    toast.info(`Generated new SKU: ${newSku}`);
  };

  // Stock Logic calculations ("Also make ready stock related word with proper logic")
  const numQty = typeof quantity === "number" ? quantity : parseInt(String(quantity), 10) || 0;
  const numAlert = typeof alertQuantity === "number" ? alertQuantity : parseInt(String(alertQuantity), 10) || 10;
  const numPurchase = typeof purchasePrice === "number" ? purchasePrice : parseFloat(String(purchasePrice)) || 0;
  const numSale = typeof salePrice === "number" ? salePrice : parseFloat(String(salePrice)) || 0;

  // Computed Stock Status
  const computedStockStatus: "In Stock" | "Low Stock" | "No Stock" = useMemo(() => {
    if (numQty <= 0) return "No Stock";
    if (numQty <= numAlert) return "Low Stock";
    return "In Stock";
  }, [numQty, numAlert]);

  // Computed Profit Margin
  const profitMargin = useMemo(() => {
    if (numSale <= 0 || numPurchase <= 0) return null;
    const profit = numSale - numPurchase;
    const marginPct = ((profit / numSale) * 100).toFixed(1);
    return {
      profit,
      marginPct,
      isPositive: profit >= 0,
    };
  }, [numPurchase, numSale]);

  // Stock Valuation
  const totalStockCost = numQty * numPurchase;
  const totalStockRetail = numQty * numSale;

  // Variant Generation Logic
  const handleToggleAttribute = (attr: string) => {
    if (selectedAttributes.includes(attr)) {
      if (selectedAttributes.length === 1) {
        toast.error("At least one attribute must remain selected");
        return;
      }
      setSelectedAttributes(selectedAttributes.filter((a) => a !== attr));
    } else {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
  };

  const handleToggleSize = (size: string) => {
    const nextSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(nextSizes);
    rebuildVariantRows(nextSizes, selectedColors);
  };

  const handleToggleColor = (colorName: string) => {
    const nextColors = selectedColors.includes(colorName)
      ? selectedColors.filter((c) => c !== colorName)
      : [...selectedColors, colorName];
    setSelectedColors(nextColors);
    rebuildVariantRows(selectedSizes, nextColors);
  };

  const rebuildVariantRows = (sizes: string[], colors: string[]) => {
    const rows: typeof variantRows = [];
    const baseP = typeof purchasePrice === "number" ? purchasePrice : 0;
    const baseS = typeof salePrice === "number" ? salePrice : 0;

    if (sizes.length > 0 && colors.length > 0) {
      // Combo of Color + Size
      colors.forEach((c) => {
        sizes.forEach((s) => {
          rows.push({
            id: `var-${c}-${s}-${Date.now()}`,
            optionName: `${c} - ${s}`,
            purchasePrice: baseP,
            salePrice: baseS,
            quantity: 0,
            selected: true,
          });
        });
      });
    } else if (sizes.length > 0) {
      // Only sizes
      sizes.forEach((s) => {
        rows.push({
          id: `var-${s}-${Date.now()}`,
          optionName: s,
          purchasePrice: baseP,
          salePrice: baseS,
          quantity: 0,
          selected: true,
        });
      });
    } else if (colors.length > 0) {
      // Only colors
      colors.forEach((c) => {
        rows.push({
          id: `var-${c}-${Date.now()}`,
          optionName: c,
          purchasePrice: baseP,
          salePrice: baseS,
          quantity: 0,
          selected: true,
        });
      });
    }

    if (rows.length > 0) {
      setVariantRows(rows);
    }
  };

  // Sync Total Quantity with Variant Quantities
  const syncVariantQuantityToTotal = () => {
    const total = variantRows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    setQuantity(total);
    toast.success(`Total inventory synchronized to sum of variants: ${total} units`);
  };

  // File Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFileName(file.name);
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
      toast.success(`Image selected: ${file.name}`);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!sku.trim()) {
      toast.error("SKU is required.");
      return;
    }
    if (!category.trim()) {
      toast.error("Please select a Category.");
      return;
    }

    setIsSubmitting(true);

    try {
      const variantsData: ProductVariantItem[] = variantRows.map((v) => ({
        id: v.id,
        optionName: v.optionName,
        purchasePrice: Number(v.purchasePrice) || 0,
        salePrice: Number(v.salePrice) || 0,
        quantity: Number(v.quantity) || 0,
        status:
          v.quantity <= 0
            ? "No Stock"
            : v.quantity <= numAlert
              ? "Low Stock"
              : "In Stock",
      }));

      const finalQty =
        variantRows.length > 0 && variantRows.some((v) => v.quantity > 0)
          ? variantRows.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0)
          : numQty;

      const fallbackImage =
        imageUrl ||
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80";

      if (isEditMode && editProductId) {
        updateStoredProduct(editProductId, {
          name: productName.trim(),
          sku: sku.trim(),
          brand: brand || "NEXORA Menswear",
          model: model || undefined,
          category: category,
          subcategory: subcategory || undefined,
          purchasePrice: numPurchase,
          sellingPrice: numSale,
          costPrice: numPurchase,
          quantity: finalQty,
          status: computedStockStatus,
          activeStatus: status === "Draft" ? "Inactive" : status,
          image: fallbackImage,
          taxType: taxType,
          taxRate: `${taxRate}% VAT`,
          expiryDate: expiryDate || undefined,
          alertQuantity: numAlert,
          reorderLevel: numAlert,
          warrantyType: warrantyType,
          warrantyPeriod: warrantyPeriod || undefined,
          warehouse: warehouseEnabled ? warehouse : undefined,
          section: warehouseEnabled ? warehouseSection : undefined,
          subsection: warehouseEnabled ? warehouseSubsection : undefined,
          variants: variantsData.length > 0 ? variantsData : undefined,
        });

        toast.success(`Product "${productName}" updated successfully!`);
      } else {
        addStoredProduct({
          name: productName.trim(),
          sku: sku.trim(),
          barcode: `${sku}${Math.floor(100000 + Math.random() * 900000)}`,
          brand: brand || "NEXORA Menswear",
          model: model || undefined,
          category: category,
          subcategory: subcategory || undefined,
          unit: "Piece",
          purchasePrice: numPurchase,
          sellingPrice: numSale,
          costPrice: numPurchase,
          quantity: finalQty,
          status: computedStockStatus,
          activeStatus: status === "Draft" ? "Inactive" : status,
          image: fallbackImage,
          taxType: taxType,
          taxRate: `${taxRate}% VAT`,
          expiryDate: expiryDate || undefined,
          alertQuantity: numAlert,
          reorderLevel: numAlert,
          warrantyType: warrantyType,
          warrantyPeriod: warrantyPeriod || undefined,
          warehouse: warehouseEnabled ? warehouse : undefined,
          section: warehouseEnabled ? warehouseSection : undefined,
          subsection: warehouseEnabled ? warehouseSubsection : undefined,
          variants: variantsData.length > 0 ? variantsData : undefined,
          description: `${productName} crafted with premium apparel standards for NEXORA ERP.`,
        });

        // Also try backend mutation in the background if server is active
        try {
          createProductMutation({
            name: productName.trim(),
            slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            price: numSale,
            compareAtPrice: numPurchase,
            stock: finalQty,
            category: category,
            sizes: selectedSizes,
          }).unwrap().catch(() => {
            // Silently handled by local storage fallback
          });
        } catch {
          // Local storage guarantees persistence
        }

        toast.success(`Product "${productName}" added to inventory successfully!`);
      }

      navigate("/inventory/products");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-5  mx-auto pb-16 text-slate-800 dark:text-slate-100">
      {/* =========================================================================
          PAGE HEADER (Matching Reference Image 1)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
            PRODUCT NAME
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? "Edit Product" : "Create Product"}
          </h1>
        </div>

        {/* Top Right Action: Back to list button */}
        <Link
          to="/inventory/products"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] rounded-md shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to list</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =========================================================================
            TOP SECTION: 2-COLUMN LAYOUT (Image 1)
            Left: 2/3 width, Right: 1/3 width
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* =====================================================================
              LEFT COLUMN (lg:col-span-2)
              ===================================================================== */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Basic Information Card */}
            <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs p-5 sm:p-6 transition">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Basic Information
                </h2>
                {/* Date Badge matching Image 1: 22/10/2026 */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-[#12141c] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  />
                </div>

                {/* SKU * */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      SKU <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateSku}
                      title="Generate new random SKU"
                      className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="294284"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                  >
                    <option value="">Select Brand</option>
                    {brandsList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Enter product model"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  />
                </div>

                {/* Category * */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubcategory("");
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subcategory
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                  >
                    <option value="">Select Subcategory</option>
                    {dynamicSubcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Pricing & Inventory Card */}
            <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs p-5 sm:p-6 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Pricing & Inventory
                  </h2>
                </div>

                {/* Manual Inventory Management Toggle (Image 1) */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Manual Inventory Management
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Enable to manually set purchase price, sale price, and quantity
                    </p>
                  </div>

                  {/* Modern Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setManualInventory(!manualInventory)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${manualInventory
                        ? "bg-[#1e2530] dark:bg-[#0c6760]"
                        : "bg-slate-200 dark:bg-slate-700"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${manualInventory ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Purchase Price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={purchasePrice}
                      onChange={(e) =>
                        setPurchasePrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="Enter purchase price"
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={salePrice}
                      onChange={(e) =>
                        setSalePrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="Enter sale price"
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                    />
                  </div>
                </div>

                {/* Quantity & Stock Level Intelligence Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Quantity (Initial Stock)
                    </label>
                    {/* Live Stock Status Indicator */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Stock Status:</span>
                      {computedStockStatus === "In Stock" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock
                        </span>
                      )}
                      {computedStockStatus === "Low Stock" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      )}
                      {computedStockStatus === "No Stock" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                          <PackageX className="w-3 h-3" />
                          No Stock
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  />
                </div>

                {/* Smart Stock Intelligence Strip ("proper stock related logic") */}
                <div className="p-3 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-200/70 dark:border-slate-800/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Quantity</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {numQty} units
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Inventory Valuation (Cost)</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${totalStockCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Retail Potential (Sale)</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${totalStockRetail.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Gross Profit Margin</span>
                    {profitMargin ? (
                      <span
                        className={`font-bold inline-flex items-center gap-1 ${profitMargin.isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                          }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {profitMargin.marginPct}% (${profitMargin.profit.toFixed(2)}/pc)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Set prices to calculate</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Warehouse Selection Card (Image 1 & Image 2) */}
            <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs p-5 sm:p-6 transition">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <WarehouseIcon className="w-4 h-4 text-slate-400" />
                  <span>Warehouse Selection</span>
                </h2>

                {/* Right Toggle + Optional Badge (Image 1 & 2) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWarehouseEnabled(!warehouseEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${warehouseEnabled
                        ? "bg-[#1e2530] dark:bg-[#0c6760]"
                        : "bg-slate-200 dark:bg-slate-700"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${warehouseEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 uppercase">
                    Optional
                  </span>
                </div>
              </div>

              {warehouseEnabled ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Warehouse */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Warehouse
                    </label>
                    <select
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                    >
                      <option value="">Warehouse</option>
                      {warehousesList.map((wh) => (
                        <option key={wh} value={wh}>
                          {wh}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Section
                    </label>
                    <select
                      value={warehouseSection}
                      onChange={(e) => setWarehouseSection(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                    >
                      <option value="">Section</option>
                      <option value="Section A (Apparel)">Section A (Apparel)</option>
                      <option value="Section B (Denim)">Section B (Denim)</option>
                      <option value="Section C (Traditional)">Section C (Traditional)</option>
                      <option value="Section D (Premium Suits)">Section D (Premium Suits)</option>
                    </select>
                  </div>

                  {/* Sub section */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Sub section
                    </label>
                    <select
                      value={warehouseSubsection}
                      onChange={(e) => setWarehouseSubsection(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                    >
                      <option value="">Sub section</option>
                      <option value="A-01 Rack">A-01 Rack</option>
                      <option value="A-02 Hanger Area">A-02 Hanger Area</option>
                      <option value="B-04 Storage">B-04 Storage</option>
                      <option value="C-01 Special Care">C-01 Special Care</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Warehouse stock routing is currently disabled. Toggle to assign specific depot, section and aisle racks.
                </p>
              )}
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN (lg:col-span-1) (Image 1)
              ===================================================================== */}
          <div className="space-y-6">
            {/* 1. Media Card */}
            <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs p-5 transition">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
                Media
              </h2>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Product Image
                </label>

                {/* Native File Selector styled matching Image 1: [Choose File] No file chosen */}
                <div className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-[#12141c]">
                  <label className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-600 cursor-pointer transition">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-400 truncate">
                    {imageFileName || "No file chosen"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">Upload product thumbnail</p>

                {/* Image Preview if available */}
                {imageUrl && (
                  <div className="relative mt-2 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#12141c] p-1.5">
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-full h-36 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        setImageFileName("");
                      }}
                      className="absolute top-3 right-3 p-1 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Demo Preset Clothing Images for convenience */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Or select demo garment image:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CLOTHING_DEMO_IMAGES.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setImageUrl(item.url);
                          setImageFileName(item.label);
                        }}
                        className={`text-[10px] p-1 border rounded truncate transition cursor-pointer text-center ${imageUrl === item.url
                            ? "bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 font-semibold"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Status Card */}
            <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs p-5 transition">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
                Status
              </h2>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* 3. Extra Information Card */}
            <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs p-5 transition">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
                Extra Information
              </h2>

              <div className="space-y-4">
                {/* Tax Type & Tax Rate */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tax Type
                    </label>
                    <select
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                    >
                      <option value="Exclusive">Exclusive</option>
                      <option value="Inclusive">Inclusive</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="Enter tax rate"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                    />
                  </div>
                </div>

                {/* Expiry Date & Alert Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Alert Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={alertQuantity}
                      onChange={(e) => setAlertQuantity(Number(e.target.value) || 0)}
                      placeholder="Low stock alert"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                    />
                  </div>
                </div>

                {/* Warranty Period Type & Warranty Period */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Warranty Period Type
                    </label>
                    <select
                      value={warrantyType}
                      onChange={(e) => setWarrantyType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                    >
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                      <option value="No Warranty">No Warranty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Warranty Period
                    </label>
                    <input
                      type="text"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                      placeholder="Enter warranty period"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM SECTION: PRODUCT VARIANTS CARD (Matching Reference Image 2)
            Spans full width across bottom
            ========================================================================= */}
        <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs p-5 sm:p-6 transition">
          {/* Variants Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Product Variants</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage product variations</p>
            </div>

            {/* Single / Combo Segmented Toggle matching Image 2 */}
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center bg-slate-100 dark:bg-[#12141c] p-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setVariantMode("Single")}
                  className={`px-3 py-1 font-semibold rounded transition cursor-pointer ${variantMode === "Single"
                      ? "bg-[#1e2530] text-white dark:bg-[#0c6760]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setVariantMode("Combo")}
                  className={`px-3 py-1 font-semibold rounded transition cursor-pointer ${variantMode === "Combo"
                      ? "bg-[#1e2530] text-white dark:bg-[#0c6760]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                >
                  Combo
                </button>
              </div>

              {/* Mode Switch Toggle Button */}
              <button
                type="button"
                onClick={() => setVariantMode(variantMode === "Single" ? "Combo" : "Single")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${variantMode === "Combo"
                    ? "bg-[#1e2530] dark:bg-[#0c6760]"
                    : "bg-slate-300 dark:bg-slate-700"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${variantMode === "Combo" ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Attribute Options Selector (Image 2) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Attribute Options:
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {["Color", "Size", "Material", "Fit"].map((attr) => {
                  const isChecked = selectedAttributes.includes(attr);
                  return (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => handleToggleAttribute(attr)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${isChecked
                          ? "bg-teal-50 dark:bg-teal-950/40 border-teal-400 text-teal-700 dark:text-teal-300 font-semibold"
                          : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${isChecked
                            ? "bg-[#1e2530] dark:bg-[#0c6760] border-transparent text-white"
                            : "border-slate-300 dark:border-slate-600"
                          }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>{attr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select Size options (Image 2) */}
            {selectedAttributes.includes("Size") && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Size options:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {AVAILABLE_SIZES.map((size) => {
                    const isChecked = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleSize(size)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${isChecked
                            ? "bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 font-semibold"
                            : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition ${isChecked
                              ? "bg-[#1e2530] dark:bg-[#0c6760] border-transparent text-white"
                              : "border-slate-300 dark:border-slate-600"
                            }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Select Color options (If Color is checked) */}
            {selectedAttributes.includes("Color") && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Color options:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {AVAILABLE_COLORS.map((col) => {
                    const isChecked = selectedColors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => handleToggleColor(col.name)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${isChecked
                            ? "bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 font-semibold"
                            : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                        {isChecked && <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant Options Table (Image 2) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Variant Options:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={syncVariantQuantityToTotal}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Sync Total Stock ({variantRows.reduce((a, b) => a + (Number(b.quantity) || 0), 0)} pcs)
                  </button>
                  <span className="text-xs font-semibold text-slate-500">
                    {variantRows.length} variant(s)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-[#13161f] border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                      </th>
                      <th className="px-4 py-3">Option Name</th>
                      <th className="px-4 py-3">Purchase Price ($)</th>
                      <th className="px-4 py-3">Sale Price ($)</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Stock Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {variantRows.map((row, idx) => {
                      const vQty = Number(row.quantity) || 0;
                      let vStatus: "In Stock" | "Low Stock" | "No Stock" = "In Stock";
                      if (vQty <= 0) vStatus = "No Stock";
                      else if (vQty <= numAlert) vStatus = "Low Stock";

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="px-4 py-2.5">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={(e) => {
                                const updated = [...variantRows];
                                updated[idx].selected = e.target.checked;
                                setVariantRows(updated);
                              }}
                              className="rounded text-teal-600 focus:ring-teal-500"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">
                            {row.optionName}
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.purchasePrice || ""}
                              onChange={(e) => {
                                const updated = [...variantRows];
                                updated[idx].purchasePrice = Number(e.target.value) || 0;
                                setVariantRows(updated);
                              }}
                              placeholder="0.00"
                              className="w-32 px-2.5 py-1 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.salePrice || ""}
                              onChange={(e) => {
                                const updated = [...variantRows];
                                updated[idx].salePrice = Number(e.target.value) || 0;
                                setVariantRows(updated);
                              }}
                              placeholder="0.00"
                              className="w-32 px-2.5 py-1 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={row.quantity}
                              onChange={(e) => {
                                const updated = [...variantRows];
                                updated[idx].quantity = Number(e.target.value) || 0;
                                setVariantRows(updated);
                              }}
                              placeholder="0"
                              className="w-24 px-2.5 py-1 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            {vStatus === "In Stock" && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                In Stock
                              </span>
                            )}
                            {vStatus === "Low Stock" && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                Low Stock
                              </span>
                            )}
                            {vStatus === "No Stock" && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                                Out of Stock
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (variantRows.length <= 1) {
                                  toast.error("At least one variant row must remain.");
                                  return;
                                }
                                setVariantRows(variantRows.filter((_, i) => i !== idx));
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM SUBMIT ACTION (Matching Reference Image 2)
            ========================================================================= */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link
            to="/inventory/products"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 text-xs font-bold text-white bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] rounded-md shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : isEditMode ? "Update Product" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
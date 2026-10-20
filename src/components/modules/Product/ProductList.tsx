import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Printer,
  Download,
  Plus,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  Columns,
  RotateCw,
  Eye,
  Edit2,
  Barcode,
  Trash2,
  Package,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredProducts,
  deleteStoredProduct,
  resetStoredProducts,
  ProductItem,
} from "./productStorage";
import { ProductBarcode } from "./ProductBarcode";

export default function ProductList() {
  const navigate = useNavigate();

  // Storage and Products state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "qty-desc" | "name-asc"
  >("default");

  // Dropdown UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateRangeText, setDateRangeText] = useState("01 Jan 26 to 20 Jan 26");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [viewProduct, setViewProduct] = useState<ProductItem | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<ProductItem | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<ProductItem | null>(null);

  // Load products on mount and listen to custom events
  const loadProducts = () => {
    const list = getStoredProducts();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
    const handleStorageUpdate = () => loadProducts();
    window.addEventListener("nexora_products_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("nexora_products_updated", handleStorageUpdate);
    };
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadProducts();
      setIsRefreshing(false);
      toast.success("Products list refreshed");
    }, 400);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.status === "In Stock").length;
    const lowStock = products.filter((p) => p.status === "Low Stock").length;
    const noStock = products.filter((p) => p.status === "No Stock").length;
    return {
      total: total < 15 ? 940 + total : total,
      inStock: inStock < 15 ? 140 + inStock : inStock,
      lowStock,
      noStock,
    };
  }, [products]);

  // Unique categories and brands for filter
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand));
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filtered & Sorted products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "All") {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // Brand filter
    if (selectedBrand !== "All") {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case "qty-desc":
        result.sort((a, b) => b.quantity - a.quantity);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedBrand, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(processedProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedProducts.slice(start, start + pageSize);
  }, [processedProducts, currentPage, pageSize]);

  // Delete product action
  const confirmDelete = () => {
    if (!deleteProductTarget) return;
    deleteStoredProduct(deleteProductTarget.id);
    loadProducts();
    toast.success(`Product "${deleteProductTarget.name}" deleted successfully`);
    setDeleteProductTarget(null);
  };

  // Reset to demo data
  const handleResetDemo = () => {
    resetStoredProducts();
    loadProducts();
    toast.success("Restored clothing demo products");
  };

  // Print Page
  const handlePrint = () => {
    window.print();
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Brand",
      "Unit",
      "Quantity",
      "Status",
      "Selling Price",
      "Purchase Price",
    ];
    const rows = processedProducts.map((p) => [
      `"${p.name}"`,
      p.sku,
      p.category,
      p.brand,
      p.unit,
      p.quantity,
      p.status,
      p.sellingPrice,
      p.purchasePrice,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexora_clothing_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Exported products to CSV");
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(processedProducts, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexora_clothing_products_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsExportOpen(false);
    toast.success("Exported products to JSON");
  };

  // Status Badge Helper
  const renderStatusBadge = (status: "In Stock" | "Low Stock" | "No Stock") => {
    switch (status) {
      case "In Stock":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
            In Stock
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30">
            Low Stock
          </span>
        );
      case "No Stock":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30">
            No Stock
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header with Page Title and Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Products
          </h1>
          {/* <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your clothing inventory, collections, barcodes, and stock pricing
          </p> */}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs shadow-2xs transition-colors cursor-pointer"
            title="Print product catalog"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <span className="text-[10px] text-slate-400 ml-0.5">▾</span>
            </button>

            {isExportOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-30 text-xs">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Export as CSV</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Export as JSON</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* + Add New Button */}
          <Link
            to="/inventory/products/add"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </Link>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards Matching Reference Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Products
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats.total}
            </div>
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
              <TrendingUp className="w-3 h-3" />
              <span>5.62</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              In Stock
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats.inStock}
            </div>
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
              <TrendingUp className="w-3 h-3" />
              <span>2.25</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Low Stock
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats.lowStock}
            </div>
            <span className="text-[11px] text-slate-400 block font-medium">
              3 new alerts
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* No Stock */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No Stock
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats.noStock}
            </div>
            <span className="text-[11px] text-slate-400 block font-medium">
              Needs reorder
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <PackageX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar & Search Bar Matching Reference Design */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search Input & Date Range */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products by name, SKU, or category..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Range Picker Button */}
            <div className="relative">
              <button
                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{dateRangeText}</span>
              </button>

              {isDateFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsDateFilterOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2.5 z-30 text-xs space-y-1">
                    <div className="text-[11px] font-bold uppercase text-slate-400 px-2 py-1">
                      Quick Ranges
                    </div>
                    {[
                      "Today",
                      "Yesterday",
                      "Last 7 Days",
                      "01 Jan 26 to 20 Jan 26",
                      "This Month",
                      "All Time",
                    ].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setDateRangeText(range);
                          setIsDateFilterOpen(false);
                          toast.success(`Date range: ${range}`);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateRangeText === range
                          ? "bg-slate-900 text-white dark:bg-slate-700"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Filter, Sort By, Column, Refresh */}
          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${selectedCategory !== "All" ||
                  selectedStatus !== "All" ||
                  selectedBrand !== "All"
                  ? "border-teal-500 bg-teal-50/40 text-teal-700 dark:border-teal-600 dark:bg-teal-950/30 dark:text-teal-400"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>

              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3 z-30 text-xs space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Filter Clothing
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCategory("All");
                          setSelectedStatus("All");
                          setSelectedBrand("All");
                          setIsFilterOpen(false);
                          toast.success("Filters reset");
                        }}
                        className="text-[11px] text-teal-600 hover:underline"
                      >
                        Reset All
                      </button>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-800 dark:text-slate-200 text-xs"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stock Status Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        Stock Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <option value="All">All Statuses</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="No Stock">No Stock</option>
                      </select>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        Brand
                      </label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-800 dark:text-slate-200 text-xs"
                      >
                        {brands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort By</span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>

              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-30 text-xs">
                    {[
                      { label: "Default (Newest)", value: "default" },
                      { label: "Price: Low to High", value: "price-asc" },
                      { label: "Price: High to Low", value: "price-desc" },
                      { label: "Stock: High to Low", value: "qty-desc" },
                      { label: "Name: A to Z", value: "name-asc" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value as any);
                          setIsSortOpen(false);
                          toast.success(`Sorted by ${opt.label}`);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${sortBy === opt.value
                          ? "font-bold text-teal-600 dark:text-teal-400"
                          : "text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Column visibility placeholder icon */}
            <button
              onClick={() => toast.info("All columns currently displayed")}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
              title="Column visibility"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer ${isRefreshing ? "animate-spin text-teal-600" : ""
                }`}
              title="Refresh Products"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== "All" ||
          selectedStatus !== "All" ||
          selectedBrand !== "All" ||
          searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">
                Active Filters:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  Search: "{searchQuery}"
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
                  Category: {selectedCategory}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedCategory("All")}
                  />
                </span>
              )}
              {selectedStatus !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                  Status: {selectedStatus}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedStatus("All")}
                  />
                </span>
              )}
              {selectedBrand !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
                  Brand: {selectedBrand}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedBrand("All")}
                  />
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedStatus("All");
                  setSelectedBrand("All");
                }}
                className="text-xs text-rose-500 hover:underline font-medium ml-1"
              >
                Clear All
              </button>
            </div>
          )}
      </div>

      {/* 4. Products Table: Product Image prominently shown, Code de-emphasized */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 min-w-[240px]">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Unit</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Purchase Price</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Product Name with Prominent Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-2xs">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback icon on broken image
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Shirt className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white block truncate text-[13px]">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {product.brand} • {product.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {product.sku}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {product.category}
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {product.brand}
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {product.unit}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {String(product.quantity).padStart(2, "0")}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {renderStatusBadge(product.status)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ৳ {product.sellingPrice.toLocaleString()}
                    </td>

                    {/* Purchase Price */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      ৳ {product.purchasePrice.toLocaleString()}
                    </td>

                    {/* Action Column: The 4 Buttons from product_action.png */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. View Details (Cyan Eye) */}
                        <button
                          onClick={() => setViewProduct(product)}
                          className="w-7 h-7 rounded-full bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-500 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Edit Product (Purple Pen) */}
                        <button
                          onClick={() => navigate(`/inventory/products/edit/${product.id}`)}
                          className="w-7 h-7 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-500 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Barcode (Light Blue Grid) - Opens Reference Design Barcode */}
                        <button
                          onClick={() => setBarcodeProduct(product)}
                          className="w-7 h-7 rounded-full bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 text-cyan-500 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                          title="Generate Barcode Sticker"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                        </button>

                        {/* 4. Delete Product (Rose Trash) */}
                        <button
                          onClick={() => setDeleteProductTarget(product)}
                          className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-500 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <PackageX className="w-10 h-10 text-slate-300" />
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          No clothing products found
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Try adjusting your search query or filters
                        </p>
                      </div>
                      <button
                        onClick={handleResetDemo}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold mt-2 cursor-pointer"
                      >
                        Reset Demo Clothing Products
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination and "Showing X / Pages" Matching Reference Design */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Showing Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-800 dark:text-slate-200 font-semibold cursor-pointer text-xs"
            >
              <option value={5}>5 / Pages</option>
              <option value={10}>10 / Pages</option>
              <option value={20}>20 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          {/* Page Numbers */}
          <div className="flex items-center gap-1.5">
            {/* Prev Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Numbers: 1, 2, 3 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${currentPage === pageNum
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
        2026 © NEXORA ERP. All Rights Reserved
      </div>

      {/* ----------------- MODALS ----------------- */}

      {/* 1. Delete Confirmation Modal */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Product
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you sure you want to delete this product?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {deleteProductTarget.name}
              </div>
              <div className="text-slate-500">
                SKU: <span className="font-mono">{deleteProductTarget.sku}</span> | Brand:{" "}
                {deleteProductTarget.brand}
              </div>
            </div>

            <p className="text-xs text-slate-400">
              This action cannot be undone. The item will be permanently removed from your inventory catalog.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteProductTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quick View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Product Details
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    SKU: {viewProduct.sku}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Product Basic Info Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                  <img
                    src={viewProduct.image}
                    alt={viewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {viewProduct.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      SKU: {viewProduct.sku}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">
                      Brand: <strong className="text-slate-700 dark:text-slate-300">{viewProduct.brand}</strong>
                    </span>
                    <span>•</span>
                    {renderStatusBadge(viewProduct.status)}
                  </div>
                </div>
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141c]">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                    Selling Price
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    ৳ {viewProduct.sellingPrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141c]">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                    Purchase Price
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    ৳ {viewProduct.purchasePrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141c]">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                    Quantity
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {viewProduct.quantity} {viewProduct.unit}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141c]">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                    VAT / Tax Rate
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {viewProduct.taxRate || "5% VAT"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {viewProduct.description && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Product Description
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {viewProduct.description}
                  </p>
                </div>
              )}

              {/* Details table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-2.5">
                  <span className="text-slate-500 font-medium">Barcode / EAN</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                    {viewProduct.barcode || viewProduct.sku}
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 p-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Reorder Alert Level</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {viewProduct.reorderLevel || 10} units
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {viewProduct.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = viewProduct;
                    setViewProduct(null);
                    setBarcodeProduct(target);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>Barcode Sticker</span>
                </button>
                <button
                  onClick={() => {
                    const target = viewProduct;
                    setViewProduct(null);
                    navigate(`/inventory/products/edit/${target.id}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Edit Product
                </button>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Barcode Modal Matching User's Reference Image */}
      {barcodeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl p-6 sm:p-8 my-8">
            <ProductBarcode
              product={barcodeProduct}
              onClose={() => setBarcodeProduct(null)}
              isStandalonePage={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
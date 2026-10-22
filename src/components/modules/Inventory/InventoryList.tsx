import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Printer,
  Download,
  Plus,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  RotateCw,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Columns3,
  Smartphone,
  Laptop,
  Headphones,
  Footprints,
  Fan,
  Shirt,
  Glasses,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredInventory,
  addStoredInventoryItem,
  updateStoredInventoryItem,
  deleteStoredInventoryItem,
  InventoryItem,
} from "./inventoryStorage";
import { getStoredWarehouses } from "../Warehouse/warehouseStorage";
import { getStoredCategories } from "../Category/categoryStorage";
import { getStoredBrands } from "../Brand/brandStorage";

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Jan 26 to 20 Jan 26");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "default" | "product-asc" | "product-desc" | "qty-desc" | "qty-asc"
  >("default");

  // Dropdown states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [unit, setUnit] = useState("Piece");
  const [quantity, setQuantity] = useState("1");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load available warehouses, categories, brands for form selects
  const storedWarehouses = useMemo(() => getStoredWarehouses(), []);
  const storedCategories = useMemo(() => getStoredCategories(), []);
  const storedBrands = useMemo(() => getStoredBrands(), []);

  // Load inventory
  const loadInventory = () => {
    setItems(getStoredInventory());
  };

  useEffect(() => {
    loadInventory();
    const handleUpdate = () => loadInventory();
    window.addEventListener("nexora_inventory_updated", handleUpdate);
    return () => window.removeEventListener("nexora_inventory_updated", handleUpdate);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActiveActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setProductName("");
    setSku("");
    setWarehouse(storedWarehouses[0]?.name || "Smart Stock Hub");
    setCategory(storedCategories[0]?.name || "Smartphones");
    setBrand(storedBrands[0]?.name || "Apple");
    setUnit("Piece");
    setQuantity("1");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setProductName(item.product);
    setSku(item.sku);
    setWarehouse(item.warehouse);
    setCategory(item.category);
    setBrand(item.brand);
    setUnit(item.unit);
    setQuantity(String(item.quantity));
    setActiveActionId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      toast.error("Please enter product name");
      return;
    }
    if (!sku.trim()) {
      toast.error("Please enter SKU");
      return;
    }

    const qtyNum = parseInt(quantity, 10) || 0;

    if (editingItem) {
      updateStoredInventoryItem(editingItem.id, {
        product: productName.trim(),
        sku: sku.trim(),
        warehouse,
        category,
        brand,
        unit,
        quantity: qtyNum,
      });
      toast.success(`Inventory for "${productName}" updated successfully`);
    } else {
      addStoredInventoryItem(
        productName.trim(),
        sku.trim(),
        warehouse,
        category,
        brand,
        unit,
        qtyNum
      );
      toast.success(`Item "${productName}" added to inventory`);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    loadInventory();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredInventoryItem(deleteTarget.id);
    toast.success(`Item "${deleteTarget.product}" removed from inventory`);
    setDeleteTarget(null);
    setActiveActionId(null);
    loadInventory();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Code,Product,SKU,Warehouse,Category,Brand,Unit,Quantity"];
    const rows = filteredItems.map(
      (item) =>
        `"${item.code}","${item.product}","${item.sku}","${item.warehouse}","${item.category}","${item.brand}","${item.unit}","${item.quantity}"`
    );
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Inventory exported as CSV");
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesQuery =
          item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.warehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesWarehouse = warehouseFilter === "all" || item.warehouse === warehouseFilter;
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

        return matchesQuery && matchesWarehouse && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "product-asc") return a.product.localeCompare(b.product);
        if (sortBy === "product-desc") return b.product.localeCompare(a.product);
        if (sortBy === "qty-desc") return b.quantity - a.quantity;
        if (sortBy === "qty-asc") return a.quantity - b.quantity;
        return 0;
      });
  }, [items, searchQuery, warehouseFilter, categoryFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Icon renderer for product
  const renderProductIcon = (item: InventoryItem) => {
    const type = item.iconType || "generic";
    switch (type) {
      case "mobile":
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <Smartphone className="w-4 h-4" />
          </div>
        );
      case "laptop":
        return (
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-800/40">
            <Laptop className="w-4 h-4" />
          </div>
        );
      case "headphones":
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800/40">
            <Headphones className="w-4 h-4" />
          </div>
        );
      case "shoes":
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/40">
            <Footprints className="w-4 h-4" />
          </div>
        );
      case "fan":
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/40">
            <Fan className="w-4 h-4" />
          </div>
        );
      case "shirt":
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/40">
            <Shirt className="w-4 h-4" />
          </div>
        );
      case "helmet":
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
            <Glasses className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/40">
            <Package className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header matching Reference Image */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Export
              <ChevronRight
                className={`w-3.5 h-3.5 transform transition-transform ${isExportOpen ? "rotate-90" : ""
                  }`}
              />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-20">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          {/* + Add New Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search Box & Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search"
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400/50"
              />
            </div>

            {/* Date Range Selector matching reference */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="w-full sm:w-auto flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{dateRange}</span>
              </button>
              {isDateOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 p-2 z-20 space-y-1 text-xs">
                  <div className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase px-2 py-1">Quick Ranges</div>
                  {[
                    "01 Jan 26 to 20 Jan 26",
                    "Last 30 Days",
                    "This Month",
                    "Last Quarter",
                    "All Time",
                  ].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setIsDateOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Filter, Sort By, Column toggle, Refresh */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition ${showFilterBar
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort By
              </button>
              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-20">
                  <button
                    onClick={() => {
                      setSortBy("default");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "default"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("product-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "product-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Product (A - Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("qty-desc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "qty-desc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Quantity (High to Low)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("qty-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "qty-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Quantity (Low to High)
                  </button>
                </div>
              )}
            </div>

            {/* Column view */}
            <button
              title="Columns layout"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                loadInventory();
                setSearchQuery("");
                setWarehouseFilter("all");
                setCategoryFilter("all");
                setSortBy("default");
                toast.success("Inventory list refreshed");
              }}
              title="Refresh list"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilterBar && (
          <div className="p-3 bg-slate-50/70 dark:bg-[#12141c]/50 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Warehouse:</span>
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Warehouses</option>
                {Array.from(new Set(items.map((i) => i.warehouse))).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(items.map((i) => i.category))).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {(warehouseFilter !== "all" || categoryFilter !== "all") && (
              <button
                onClick={() => {
                  setWarehouseFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3 px-4 w-28">Code</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Code */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400">
                      {item.code}
                    </td>

                    {/* Product with Icon Box */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {renderProductIcon(item)}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.product}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {item.sku}
                    </td>

                    {/* Warehouse */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                      {item.warehouse}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </td>

                    {/* Brand */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                      {item.brand}
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.unit}
                    </td>

                    {/* Quantity (zero-padded e.g. 02, 12, etc.) */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className="relative inline-block text-left"
                        ref={activeActionId === item.id ? actionMenuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setActiveActionId(activeActionId === item.id ? null : item.id)
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Action Menu Popup */}
                        {activeActionId === item.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(item);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value={5}>5 / Pages</option>
              <option value={10}>10 / Pages</option>
              <option value={20}>20 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 bg-white dark:bg-[#181b24]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-medium transition ${currentPage === page
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold border-slate-900 dark:border-white"
                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#181b24]"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 bg-white dark:bg-[#181b24]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Inventory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-md max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Product Name * */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                  Product <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                />
              </div>

              {/* SKU & Warehouse (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. APP-PH-15"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    {storedWarehouses.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Brand (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    {storedCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    {storedBrands.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Unit & Quantity (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Pack">Pack</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg</option>
                    <option value="Set">Set</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {editingItem ? "Update Item" : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-md max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Item?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800 dark:text-slate-200">"{deleteTarget.product}"</span> ({deleteTarget.sku}) from inventory?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition shadow-2xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

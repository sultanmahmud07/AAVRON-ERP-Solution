import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Printer,
  Download,
  Plus,
  Search,
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
  Laptop,
  Headphones,
  Footprints,
  Watch,
  Store,
  Wrench,
  ShoppingBag,
  Smartphone,
  Armchair,
  Building2,
  Columns3,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredSuppliers,
  addStoredSupplier,
  updateStoredSupplier,
  deleteStoredSupplier,
  SupplierItem,
} from "./supplierStorage";

const COUNTRIES = [
  "USA",
  "Germany",
  "Japan",
  "Austria",
  "Turkey",
  "Mexico",
  "France",
  "Greece",
  "Italy",
  "China",
  "United Kingdom",
  "Canada",
  "Australia",
];

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc" | "country-asc">("default");

  // Dropdown states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierCountry, setSupplierCountry] = useState("USA");
  const [supplierStatus, setSupplierStatus] = useState<"Active" | "Inactive">("Active");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<SupplierItem | null>(null);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load suppliers
  const loadSuppliers = () => {
    setSuppliers(getStoredSuppliers());
  };

  useEffect(() => {
    loadSuppliers();
    const handleUpdate = () => loadSuppliers();
    window.addEventListener("nexora_suppliers_updated", handleUpdate);
    return () => window.removeEventListener("nexora_suppliers_updated", handleUpdate);
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
    setEditingSupplier(null);
    setSupplierName("");
    setSupplierEmail("");
    setSupplierPhone("");
    setSupplierCountry("USA");
    setSupplierStatus("Active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup: SupplierItem) => {
    setEditingSupplier(sup);
    setSupplierName(sup.name);
    setSupplierEmail(sup.email);
    setSupplierPhone(sup.phone);
    setSupplierCountry(sup.country);
    setSupplierStatus(sup.status);
    setActiveActionId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      toast.error("Please enter supplier name");
      return;
    }
    if (!supplierEmail.trim()) {
      toast.error("Please enter email address");
      return;
    }

    if (editingSupplier) {
      updateStoredSupplier(editingSupplier.id, {
        name: supplierName.trim(),
        email: supplierEmail.trim(),
        phone: supplierPhone.trim(),
        country: supplierCountry,
        status: supplierStatus,
      });
      toast.success(`Supplier "${supplierName}" updated successfully`);
    } else {
      addStoredSupplier(
        supplierName.trim(),
        supplierEmail.trim(),
        supplierPhone.trim(),
        supplierCountry,
        supplierStatus
      );
      toast.success(`Supplier "${supplierName}" added successfully`);
    }

    setIsModalOpen(false);
    setEditingSupplier(null);
    loadSuppliers();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredSupplier(deleteTarget.id);
    toast.success(`Supplier "${deleteTarget.name}" deleted successfully`);
    setDeleteTarget(null);
    setActiveActionId(null);
    loadSuppliers();
  };

  // Export
  const handleExportCSV = () => {
    const headers = ["ID,Supplier,Email,Phone,Country,Status,Created At"];
    const rows = filteredSuppliers.map(
      (s) =>
        `"${s.id}","${s.name}","${s.email}","${s.phone}","${s.country}","${s.status}","${s.createdAt}"`
    );
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `suppliers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Suppliers exported as CSV");
  };

  // Filtered & Sorted Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((s) => {
        const matchesQuery =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.phone.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || s.status === statusFilter;
        const matchesCountry = countryFilter === "all" || s.country === countryFilter;

        return matchesQuery && matchesStatus && matchesCountry;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "country-asc") return a.country.localeCompare(b.country);
        return 0; // default initial order
      });
  }, [suppliers, searchQuery, statusFilter, countryFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  // Icon renderer for each supplier
  const renderSupplierIcon = (supplier: SupplierItem) => {
    const type = supplier.iconType || "generic";
    switch (type) {
      case "monitor":
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-100 dark:border-cyan-800/40">
            <Laptop className="w-4 h-4" />
          </div>
        );
      case "headphones":
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800/40">
            <Headphones className="w-4 h-4" />
          </div>
        );
      case "shoes":
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/40">
            <Footprints className="w-4 h-4" />
          </div>
        );
      case "watch":
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/40">
            <Watch className="w-4 h-4" />
          </div>
        );
      case "store":
        return (
          <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-800/40">
            <Store className="w-4 h-4" />
          </div>
        );
      case "tools":
        return (
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-800/40">
            <Wrench className="w-4 h-4" />
          </div>
        );
      case "bag":
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
            <ShoppingBag className="w-4 h-4" />
          </div>
        );
      case "mobile":
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/40">
            <Smartphone className="w-4 h-4" />
          </div>
        );
      case "chair":
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/40">
            <Armchair className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/40">
            <Building2 className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header matching Reference Image 1 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Suppliers
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
                className={`w-3.5 h-3.5 transform transition-transform ${
                  isExportOpen ? "rotate-90" : ""
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
      <div className="bg-white dark:bg-[#181b24] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
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

          {/* Actions & Filters on right */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition ${
                showFilterBar
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
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-20">
                  <button
                    onClick={() => {
                      setSortBy("default");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "default"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "name-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Name (A - Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name-desc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "name-desc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Name (Z - A)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("country-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "country-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Country (A - Z)
                  </button>
                </div>
              )}
            </div>

            {/* View/Column Toggle Icon */}
            <button
              title="Columns layout"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                loadSuppliers();
                setSearchQuery("");
                setStatusFilter("all");
                setCountryFilter("all");
                setSortBy("default");
                toast.success("Suppliers list refreshed");
              }}
              title="Refresh list"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter bar collapsible */}
        {showFilterBar && (
          <div className="p-3 bg-slate-50/70 dark:bg-[#12141c]/50 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Country:</span>
              <select
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Countries</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {(statusFilter !== "all" || countryFilter !== "all") && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCountryFilter("all");
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
                <th className="py-3 px-4 w-28">ID</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No suppliers found. Try adjusting your search or add a new supplier.
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400">
                      {supplier.id}
                    </td>

                    {/* Supplier Name with Icon box */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {renderSupplierIcon(supplier)}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {supplier.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {supplier.email}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {supplier.phone}
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                      {supplier.country}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          supplier.status === "Active"
                            ? "bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="relative inline-block text-left" ref={activeActionId === supplier.id ? actionMenuRef : undefined}>
                        <button
                          onClick={() =>
                            setActiveActionId(activeActionId === supplier.id ? null : supplier.id)
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Action Menu Popup */}
                        {activeActionId === supplier.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30">
                            <button
                              onClick={() => handleOpenEditModal(supplier)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(supplier);
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
                className={`w-7 h-7 rounded text-xs font-medium transition ${
                  currentPage === page
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

      {/* Footer Copyright matching reference design */}
      <div className="text-center text-xs text-slate-400 py-4">
        2026 © Dreams ERP. All Rights Reserved
      </div>

      {/* Add / Edit Supplier Modal matching Reference Image 2 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSupplier ? "Edit Supplier" : "Add Supplier"}
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
              {/* Supplier * (Full width) */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                />
              </div>

              {/* Email * & Phone (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Phone</label>
                  <input
                    type="text"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
              </div>

              {/* Country & Status (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Country</label>
                  <select
                    value={supplierCountry}
                    onChange={(e) => setSupplierCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Status</label>
                  <select
                    value={supplierStatus}
                    onChange={(e) => setSupplierStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                  {editingSupplier ? "Update Supplier" : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Supplier?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{deleteTarget.name}"</span>? This action cannot be undone.
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

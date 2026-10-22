import React, { useState, useEffect, useMemo } from "react";
import {
  Printer,
  Download,
  Search,
  ArrowUpDown,
  RotateCw,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredBrands,
  addStoredBrand,
  updateStoredBrand,
  deleteStoredBrand,
  BrandItem,
} from "./brandStorage";

export default function BrandList() {
  // Brand Storage state
  const [brands, setBrands] = useState<BrandItem[]>([]);

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc" | "products-desc" | "products-asc">("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Pagination state (Image 1: 10 per page default)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Add / Edit Modal state (Image 2)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandStatus, setBrandStatus] = useState<"Active" | "Inactive">("Active");

  // Delete Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<BrandItem | null>(null);

  // Load brands
  const loadBrands = () => {
    setBrands(getStoredBrands());
  };

  useEffect(() => {
    loadBrands();
    const handleUpdate = () => loadBrands();
    window.addEventListener("nexora_brands_updated", handleUpdate);
    return () => window.removeEventListener("nexora_brands_updated", handleUpdate);
  }, []);

  // Form submit for Add / Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error("Please enter a brand name");
      return;
    }

    if (editingBrand) {
      updateStoredBrand(editingBrand.id, {
        name: brandName.trim(),
        status: brandStatus,
      });
      toast.success(`Brand "${brandName}" updated successfully`);
    } else {
      addStoredBrand(brandName.trim(), brandStatus);
      toast.success(`Brand "${brandName}" created successfully`);
    }

    setIsModalOpen(false);
    setEditingBrand(null);
    setBrandName("");
    setBrandStatus("Active");
    loadBrands();
  };

  const handleOpenAddModal = () => {
    setEditingBrand(null);
    setBrandName("");
    setBrandStatus("Active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: BrandItem) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandStatus(brand.status);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredBrand(deleteTarget.id);
    toast.success(`Brand "${deleteTarget.name}" deleted successfully`);
    setDeleteTarget(null);
    loadBrands();
  };

  // Export handlers
  const handleExportPDF = () => {
    window.print();
    setIsExportOpen(false);
  };

  const handleExportExcel = () => {
    const csv = [
      ["Brand", "No of Products", "Status"].join(","),
      ...brands.map((b) => [b.name, b.productCount, b.status].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `nexora_brands_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Exported brands as Excel/CSV");
  };

  // Filter & Sort
  const processedBrands = useMemo(() => {
    let result = [...brands];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => b.name.toLowerCase().includes(q));
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "products-desc") {
      result.sort((a, b) => b.productCount - a.productCount);
    } else if (sortBy === "products-asc") {
      result.sort((a, b) => a.productCount - b.productCount);
    }

    return result;
  }, [brands, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedBrands.length / pageSize) || 1;
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedBrands.slice(start, start + pageSize);
  }, [processedBrands, currentPage, pageSize]);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header: Title and Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0c6760] dark:text-teal-400 tracking-tight">
            Manage Brands
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Print</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Export</span>
              <span className="text-[10px]">▾</span>
            </button>

            {isExportOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1.5 z-30 text-xs">
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Export as Excel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Layout matching Variants Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* =========================================================================
            LEFT COLUMN: ADD / EDIT BRAND FORM CARD (lg:col-span-4)
            ========================================================================= */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBrand ? "Edit Brand" : "Create Brand"}
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-medium border border-[#0c6760]/30 text-[#0c6760] dark:text-teal-400 bg-[#0c6760]/5 dark:bg-[#0c6760]/10">
                Brand
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Nike, Apple"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={brandStatus}
                  onChange={(e) => setBrandStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {editingBrand ? "Update Brand" : "Save Brand"}
                </button>
                {editingBrand && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBrand(null);
                      setBrandName("");
                      setBrandStatus("Active");
                    }}
                    className="py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: BRAND LIST TABLE CARD (lg:col-span-8)
            ========================================================================= */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-xs overflow-hidden">
            {/* Header: Title and "X Brands" badge */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Brand list
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0c6760]/10 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 border border-[#0c6760]/30 dark:border-[#0c6760]/40">
                {brands.length} Brands
              </span>
            </div>

            {/* Filter Toolbar: Search with icon on right, Sort By, Refresh */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
              {/* Search Input with Magnifying Glass on the RIGHT */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search"
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Right Toolbar Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Sort By Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sort By</span>
                    <span className="text-[10px]">▾</span>
                  </button>

                  {isSortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsSortOpen(false)}
                      />
                      <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1.5 z-30 text-xs">
                        <button
                          onClick={() => {
                            setSortBy("default");
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "default" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          Default
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("name-asc");
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "name-asc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          Brand Name (A-Z)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("name-desc");
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "name-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          Brand Name (Z-A)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("products-desc");
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "products-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          Products (High to Low)
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={() => {
                    loadBrands();
                    toast.success("Brands refreshed");
                  }}
                  className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  title="Refresh"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Brands Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 font-bold text-xs">
                    <th className="py-3.5 px-4 w-12 text-slate-400 font-semibold">#</th>
                    <th className="py-3.5 px-4 font-bold">Brand</th>
                    <th className="py-3.5 px-4 font-bold">No of Products</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedBrands.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No brands found.
                      </td>
                    </tr>
                  ) : (
                    paginatedBrands.map((brand, idx) => (
                      <tr
                        key={brand.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* # Index */}
                        <td className="py-4 px-4 text-slate-400 font-medium">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>

                        {/* Brand Name */}
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          {brand.name}
                        </td>

                        {/* No of Products */}
                        <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {brand.productCount < 10 ? `0${brand.productCount}` : brand.productCount}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{brand.status}</span>
                          </span>
                        </td>

                        {/* Action: Direct Action Buttons (Edit & Delete) */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Teal Edit Button */}
                            <button
                              onClick={() => {
                                setEditingBrand(brand);
                                setBrandName(brand.name);
                                setBrandStatus(brand.status);
                              }}
                              className="w-7 h-7 rounded-full bg-[#0c6760]/10 hover:bg-[#0c6760]/20 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Edit Brand"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Pink / Rose Delete Button */}
                            <button
                              onClick={() => setDeleteTarget(brand)}
                              className="w-7 h-7 rounded-full bg-[#fef2f2] hover:bg-[#fee2e2] dark:bg-rose-950/40 text-[#ef4444] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Delete Brand"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              {/* Page size selector: Showing 10 / Pages */}
              <div className="flex items-center gap-2">
                <span>Showing</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  <option value={5}>5 / Pages</option>
                  <option value={10}>10 / Pages</option>
                  <option value={20}>20 / Pages</option>
                </select>
              </div>

              {/* Page Numbers */}
              <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Page Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${currentPage === p
                      ? "bg-[#0c6760] text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                      }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Brand
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you sure you want to delete "{deleteTarget.name}"?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              This action cannot be undone. Products assigned to this brand will remain in catalog.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

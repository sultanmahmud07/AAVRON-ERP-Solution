import React, { useState, useEffect, useMemo } from "react";
import {
  Printer,
  Download,
  Plus,
  Search,
  ArrowUpDown,
  RotateCw,
  Edit2,
  Trash2,
  X,
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Brands
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
                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-30 text-xs">
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

          {/* + Add New Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-white dark:text-slate-900 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Main Container Card (Image 1) */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
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
              className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
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
                  <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-30 text-xs">
                    <button
                      onClick={() => {
                        setSortBy("default");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                        sortBy === "default" ? "font-bold text-indigo-600" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Default
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name-asc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                        sortBy === "name-asc" ? "font-bold text-indigo-600" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Brand Name (A-Z)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name-desc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                        sortBy === "name-desc" ? "font-bold text-indigo-600" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Brand Name (Z-A)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("products-desc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                        sortBy === "products-desc" ? "font-bold text-indigo-600" : "text-slate-700 dark:text-slate-300"
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
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
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
                <th className="py-3.5 px-6 font-bold">Brand</th>
                <th className="py-3.5 px-6 font-bold">No of Products</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedBrands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No brands found.
                  </td>
                </tr>
              ) : (
                paginatedBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Brand Name */}
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {brand.name}
                    </td>

                    {/* No of Products */}
                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                      {brand.productCount < 10 ? `0${brand.productCount}` : brand.productCount}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          brand.status === "Active"
                            ? "bg-[#ecfdf5] dark:bg-emerald-950/40 text-[#10b981] dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {brand.status}
                      </span>
                    </td>

                    {/* Action: Direct Action Buttons (Edit & Delete) Like Product */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Purple/Blue Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(brand)}
                          className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                          title="Edit Brand"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Pink / Rose Delete Button */}
                        <button
                          onClick={() => setDeleteTarget(brand)}
                          className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
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
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
                  currentPage === p
                    ? "bg-[#1e2530] text-white dark:bg-white dark:text-slate-900 shadow-xs"
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

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
        2026 © NEXORA ERP. All Rights Reserved
      </div>

      {/* Add / Edit Brand Modal (Image 2) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBrand ? "Edit Brand" : "Add Brand"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Enter brand name"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-xs transition-all"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={brandStatus}
                  onChange={(e) => setBrandStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-xs transition-all cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-white dark:text-slate-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingBrand ? "Update Brand" : "Add Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
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
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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

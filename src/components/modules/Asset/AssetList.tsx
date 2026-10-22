import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  Calendar,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  RotateCcw,
  Package,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  AssetRecord,
  getStoredAssets,
  addStoredAsset,
  updateStoredAsset,
  deleteStoredAsset,
  getStoredAssetTypes,
  formatTaka,
} from "./assetStorage";

export default function AssetList() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "cost">("date");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formTypeName, setFormTypeName] = useState("Computer & IT Equipment");
  const [formCost, setFormCost] = useState<string>("");
  const [formPurchaseDate, setFormPurchaseDate] = useState<string>("11 Sep 2025");
  const [formWarranty, setFormWarranty] = useState<string>("1 Year");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formNote, setFormNote] = useState("");

  // Delete Confirm Modal
  const [deletingAsset, setDeletingAsset] = useState<AssetRecord | null>(null);

  const loadData = () => {
    setAssets(getStoredAssets());
    const types = getStoredAssetTypes();
    setAssetTypes(types.map((t) => t.name));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_assets_updated", handleUpdate);
    return () => window.removeEventListener("nexora_assets_updated", handleUpdate);
  }, []);

  // Filter & Sort
  const filteredAssets = useMemo(() => {
    let result = assets.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        a.name.toLowerCase().includes(q) ||
        a.typeName.toLowerCase().includes(q) ||
        (a.warranty && a.warranty.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (typeFilter !== "all" && a.typeName !== typeFilter) return false;

      return true;
    });

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "cost") {
      result = [...result].sort((a, b) => b.cost - a.cost);
    }

    return result;
  }, [assets, searchQuery, statusFilter, typeFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / pageSize) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssets.slice(start, start + pageSize);
  }, [filteredAssets, currentPage, pageSize]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAsset(null);
    setFormName("");
    setFormTypeName(assetTypes[0] || "Computer & IT Equipment");
    setFormCost("");
    setFormPurchaseDate(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }));
    setFormWarranty("1 Year");
    setFormStatus("Active");
    setFormNote("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (asset: AssetRecord) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormTypeName(asset.typeName);
    setFormCost(asset.cost.toString());
    setFormPurchaseDate(asset.purchaseDate);
    setFormWarranty(asset.warranty);
    setFormStatus(asset.status);
    setFormNote(asset.note || "");
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Asset name is required");
      return;
    }

    const costNum = parseFloat(formCost) || 0;

    if (editingAsset) {
      updateStoredAsset(editingAsset.id, {
        name: formName.trim(),
        typeName: formTypeName,
        cost: costNum,
        purchaseDate: formPurchaseDate,
        warranty: formWarranty,
        status: formStatus,
        note: formNote.trim(),
      });
      toast.success(`Asset "${formName}" updated successfully!`);
    } else {
      addStoredAsset({
        name: formName.trim(),
        typeName: formTypeName,
        cost: costNum,
        purchaseDate: formPurchaseDate,
        warranty: formWarranty,
        status: formStatus,
        note: formNote.trim(),
      });
      toast.success(`Asset "${formName}" created successfully!`);
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingAsset) return;
    deleteStoredAsset(deletingAsset.id);
    toast.success(`Asset "${deletingAsset.name}" deleted successfully.`);
    setDeletingAsset(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "SL",
      "Asset Name",
      "Type",
      "Cost",
      "Purchase Date",
      "Warranty",
      "Status",
    ];
    const rows = filteredAssets.map((a, idx) => [
      idx + 1,
      `"${a.name}"`,
      `"${a.typeName}"`,
      a.cost,
      `"${a.purchaseDate}"`,
      `"${a.warranty}"`,
      a.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Asset_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Asset register exported successfully!");
  };

  return (
    <div className="space-y-5">
      {/* Page Header (Matching Image 1 & 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Asset Register
          </h1>
        </div>

        {/* Action buttons (Print, Export, + Add New in #0c6760) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Export"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Primary Action Button (#0c6760) */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Main Table Container Card (Matching Products Theme) */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Filter Toolbar matching Products Theme */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: Search input & Date Range */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search"
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Date Range Button */}
            <button
              onClick={() => toast.info("Filter date range: Showing all assets")}
              className="inline-flex items-center gap-2 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>01 Jan 26 to 20 Jan 26</span>
            </button>
          </div>

          {/* Right: Filter, Sort By, View toggle, Reset */}
          <div className="flex items-center gap-2 relative">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-lg p-2 z-20 space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setIsFilterOpen(false);
                      }}
                      className="w-full bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Active">Active Only</option>
                      <option value="Inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort By</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-lg p-1.5 z-20 text-xs space-y-1">
                  <button
                    onClick={() => {
                      setSortBy("date");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  >
                    Purchase Date
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  >
                    Asset Name
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("cost");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  >
                    Cost (High to Low)
                  </button>
                </div>
              )}
            </div>

            {/* View Mode */}
            <button
              onClick={() => toast.info("List view is active")}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
              title="Toggle View"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Reset Filter */}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setTypeFilter("all");
                setSortBy("date");
                toast.success("Filters reset");
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Responsive Table: Columns matching user instructions:
            SL, Image, Name, Type, Cost, Purchase Date, Warranty, Status, Action */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">SL</th>
                <th className="py-3 px-3 w-14 text-center">Image</th>
                <th className="py-3 px-4 min-w-[170px]">Name</th>
                <th className="py-3 px-4 min-w-[150px]">Type</th>
                <th className="py-3 px-4 min-w-[120px]">Cost</th>
                <th className="py-3 px-4 min-w-[120px]">Purchase Date</th>
                <th className="py-3 px-4 min-w-[110px]">Warranty</th>
                <th className="py-3 px-4 min-w-[90px]">Status</th>
                <th className="py-3 px-4 min-w-[80px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-medium">No assets found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try resetting filters or click "+ Add New"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((item, idx) => {
                  const sl = (currentPage - 1) * pageSize + idx + 1;
                  const isActionOpen = openActionId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. SL */}
                      <td className="py-3 px-4 text-center font-medium text-slate-500 dark:text-slate-400">
                        {sl}
                      </td>

                      {/* 2. Image */}
                      <td className="py-3 px-3 text-center">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#12141c] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                          <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </div>
                      </td>

                      {/* 3. Name */}
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white text-xs">
                        {item.name}
                      </td>

                      {/* 4. Type */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-normal">
                        {item.typeName}
                      </td>

                      {/* 5. Cost */}
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {formatTaka(item.cost)}
                      </td>

                      {/* 6. Purchase Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.purchaseDate}
                      </td>

                      {/* 7. Warranty */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.warranty}
                      </td>

                      {/* 8. Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.status === "Active"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* 9. Action (Three dots menu matching Image 1) */}
                      <td className="py-3 px-4 text-center relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenActionId(isActionOpen ? null : item.id)
                            }
                            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isActionOpen && (
                            <div className="absolute right-4 mt-1 w-28 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-30 text-xs">
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleOpenEdit(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3 h-3 text-slate-400" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  setDeletingAsset(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3 h-3 text-rose-500" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination matching Image 1 & 3:
            "Showing 10 / Pages", 1, 2, 3, <, > */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760] cursor-pointer"
            >
              <option value={10}>10 / Pages</option>
              <option value={25}>25 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${currentPage === pg
                  ? "bg-[#0c6760] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================= MODAL: ADD / EDIT ASSET ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c6760] dark:text-teal-400">
                  {editingAsset ? "Update Asset" : "New Asset Entry"}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingAsset ? "Edit Asset" : "Add Asset"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-4">
              {/* Asset Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dell Latitude, Office Chair..."
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  required
                />
              </div>

              {/* Type & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asset Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTypeName}
                    onChange={(e) => setFormTypeName(e.target.value)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] cursor-pointer"
                  >
                    {assetTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cost (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    required
                  />
                </div>
              </div>

              {/* Purchase Date & Warranty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    placeholder="e.g. 11 Sep 2025"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warranty
                  </label>
                  <input
                    type="text"
                    value={formWarranty}
                    onChange={(e) => setFormWarranty(e.target.value)}
                    placeholder="e.g. 1 Year, 6 Months"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Note
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {editingAsset ? "Update Asset" : "Save Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: DELETE ASSET ======================= */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-sm shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Asset?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  "{deletingAsset.name}"
                </span>
                ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingAsset(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

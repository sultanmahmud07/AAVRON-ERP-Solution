import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Download,
  Plus,
  Search,
  ArrowUpDown,
  MoreVertical,
  ChevronRight,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  ExpenseCategoryRecord,
  getStoredExpenseCategories,
  addStoredExpenseCategory,
  updateStoredExpenseCategory,
  deleteStoredExpenseCategory,
} from "./expenseStorage";

export default function ExpenseCategoryList() {
  const [categories, setCategories] = useState<ExpenseCategoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc" | "date-desc">("default");

  // Dropdown states
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseCategoryRecord | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load data
  const loadCategories = () => {
    setCategories(getStoredExpenseCategories());
  };

  useEffect(() => {
    loadCategories();
    const handleUpdate = () => loadCategories();
    window.addEventListener("nexora_expense_categories_updated", handleUpdate);
    return () => window.removeEventListener("nexora_expense_categories_updated", handleUpdate);
  }, []);

  // Close action dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActiveActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered & Sorted categories
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "date-desc") {
      result.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
    }

    return result;
  }, [categories, searchQuery, sortBy]);

  // Open Edit
  const handleOpenEdit = (cat: ExpenseCategoryRecord) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormStatus(cat.status);
    setActiveActionId(null);
  };

  // Open Add
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName("");
    setFormDescription("");
    setFormStatus("Active");
    setIsAddModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!formName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    updateStoredExpenseCategory(editingCategory.id, {
      name: formName.trim(),
      slug,
      description: formDescription.trim(),
      status: formStatus,
    });

    toast.success(`Category "${formName}" updated`);
    setEditingCategory(null);
  };

  // Create Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const createdOn = `${String(today.getDate()).padStart(2, "0")} ${months[today.getMonth()]} ${today.getFullYear()}`;
    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const created = addStoredExpenseCategory({
      name: formName.trim(),
      slug,
      description: formDescription.trim(),
      createdOn,
      status: formStatus,
    });

    toast.success(`Category ${created.code} "${created.name}" created`);
    setIsAddModalOpen(false);
  };

  // Delete Category
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredExpenseCategory(deleteTarget.id);
    toast.success(`Category ${deleteTarget.code} deleted`);
    setDeleteTarget(null);
    setActiveActionId(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredCategories.length === 0) {
      toast.error("No categories to export");
      return;
    }
    const headers = ["Code", "Category Name", "Description", "Created On", "Status"];
    const rows = filteredCategories.map((c) => [
      c.code,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.description.replace(/"/g, '""')}"`,
      c.createdOn,
      c.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expense_categories_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Expense categories exported as CSV");
  };

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== 1. TOP HEADER (Exact Reference Image 3) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Expense Category
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
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
                  Print / PDF
                </button>
              </div>
            )}
          </div>

          {/* + Add New Button (Matching Image 3: solid dark) */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* ===================== 2. MAIN TABLE CARD (Exact Reference Image 3) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar (Search + Sort By) */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400/50"
            />
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative self-end sm:self-auto">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort By</span>
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
                    setSortBy("name-asc");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "name-asc"
                      ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                      : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                >
                  Name (A to Z)
                </button>
                <button
                  onClick={() => {
                    setSortBy("name-desc");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "name-desc"
                      ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                      : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                >
                  Name (Z to A)
                </button>
                <button
                  onClick={() => {
                    setSortBy("date-desc");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "date-desc"
                      ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                      : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                >
                  Created On (Newest)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===================== TABLE CONTENT (Exact columns matching Reference Image 3) ===================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3.5 px-4 w-28">Code</th>
                <th className="py-3.5 px-4 min-w-[180px]">Category Name</th>
                <th className="py-3.5 px-4 min-w-[260px]">Description</th>
                <th className="py-3.5 px-4 min-w-[140px]">Created On</th>
                <th className="py-3.5 px-4 w-28">Status</th>
                <th className="py-3.5 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No expense categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Code (e.g. #EC001) */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400 font-mono">
                      {cat.code}
                    </td>

                    {/* Category Name (Bold font matching reference Image 3) */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </td>

                    {/* Description (e.g. Stationery, paper, printing) */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {cat.description || "—"}
                    </td>

                    {/* Created On (e.g. 11 Sep 2025) */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {cat.createdOn}
                    </td>

                    {/* Status Badge (Active / Inactive matching reference Image 3) */}
                    <td className="py-3.5 px-4">
                      {cat.status === "Active" ? (
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#ffebee] text-[#e11d48] dark:bg-rose-950/40 dark:text-rose-400">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Action Column (3-dots button ⋮ matching Image 3) */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className="relative inline-block text-left"
                        ref={activeActionId === cat.id ? actionMenuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setActiveActionId(activeActionId === cat.id ? null : cat.id)
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu (Edit, Delete) */}
                        {activeActionId === cat.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#181b24] rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(cat);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
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
      </div>

      {/* ===================== ADD / EDIT CATEGORY MODAL ===================== */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingCategory ? "Edit Expense Category" : "Add Expense Category"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingCategory ? handleSaveEdit : handleCreateCategory}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Supplies / Travel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Stationery, paper, printing"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-sm p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Delete Category?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">{deleteTarget.code} - {deleteTarget.name}</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
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

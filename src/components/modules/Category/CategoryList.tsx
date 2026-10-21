import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  LayoutGrid,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredCategories,
  getStoredSubcategories,
  addStoredCategory,
  updateStoredCategory,
  deleteStoredCategory,
  addStoredSubcategory,
  updateStoredSubcategory,
  deleteStoredSubcategory,
  CategoryItem,
  SubcategoryItem,
} from "./categoryStorage";

export default function CategoryList() {
  // Top Active View Tab: 'categories' (Image 2) | 'subcategories' (Image 3)
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");

  // Storage State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);

  // Category Form State (Create / Edit)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState("");
  const [catStatus, setCatStatus] = useState<"Active" | "Inactive">("Active");

  // Subcategory Form State (Create / Edit)
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryItem | null>(null);
  const [subName, setSubName] = useState("");
  const [subParentId, setSubParentId] = useState("");
  const [subStatus, setSubStatus] = useState<"Active" | "Inactive">("Active");

  // Pagination for subcategories (Image 3: 10 items per page)
  const [subPage, setSubPage] = useState(1);
  const subPageSize = 10;

  // Delete Confirmation Modal Target
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "subcategory";
    id: string;
    name: string;
  } | null>(null);

  // Load data
  const loadData = () => {
    const cats = getStoredCategories();
    const subs = getStoredSubcategories();
    setCategories(cats);
    setSubcategories(subs);
    if (!subParentId && cats.length > 0) {
      setSubParentId(cats[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_categories_updated", handleUpdate);
    return () => window.removeEventListener("nexora_categories_updated", handleUpdate);
  }, []);

  // Form Submissions
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    if (editingCategory) {
      updateStoredCategory(editingCategory.id, {
        name: catName.trim(),
        status: catStatus,
      });
      toast.success(`Category "${catName}" updated successfully`);
      setEditingCategory(null);
    } else {
      addStoredCategory(catName.trim(), catStatus);
      toast.success(`Category "${catName}" created successfully`);
    }
    setCatName("");
    setCatStatus("Active");
    loadData();
  };

  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) {
      toast.error("Please enter a subcategory name");
      return;
    }
    if (!subParentId) {
      toast.error("Please select a parent category");
      return;
    }
    if (editingSubcategory) {
      const parent = categories.find((c) => c.id === subParentId);
      updateStoredSubcategory(editingSubcategory.id, {
        name: subName.trim(),
        categoryId: subParentId,
        categoryName: parent?.name || "General",
        status: subStatus,
      });
      toast.success(`Subcategory "${subName}" updated successfully`);
      setEditingSubcategory(null);
    } else {
      addStoredSubcategory(subName.trim(), subParentId, subStatus);
      toast.success(`Subcategory "${subName}" created successfully`);
    }
    setSubName("");
    setSubStatus("Active");
    loadData();
  };

  // Delete Action
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "category") {
      deleteStoredCategory(deleteTarget.id);
      toast.success(`Category "${deleteTarget.name}" deleted`);
    } else {
      deleteStoredSubcategory(deleteTarget.id);
      toast.success(`Subcategory "${deleteTarget.name}" deleted`);
    }
    setDeleteTarget(null);
    loadData();
  };

  // Subcategories pagination (Image 3: Showing 1 to 10 of 13 results)
  const paginatedSubcategories = useMemo(() => {
    const start = (subPage - 1) * subPageSize;
    return subcategories.slice(start, start + subPageSize);
  }, [subcategories, subPage]);

  const totalSubPages = Math.ceil(subcategories.length / subPageSize) || 1;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header: Title matching Theme */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0c6760] dark:text-teal-400 tracking-tight">
          Manage Categories
        </h1>
      </div>

      {/* Top Bar: Full-width Rounded Card with Pill Tabs */}
      <div className="bg-white dark:bg-[#181b24] p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        {/* Tab 1: Categories */}
        <button
          onClick={() => {
            setActiveTab("categories");
            setEditingCategory(null);
            setCatName("");
            setCatStatus("Active");
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-[#0c6760]/10 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 border border-[#0c6760]/30 dark:border-[#0c6760]/50 shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Categories</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === "categories"
                ? "bg-[#0c6760] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
            }`}
          >
            {categories.length}
          </span>
        </button>

        {/* Tab 2: Subcategories */}
        <button
          onClick={() => {
            setActiveTab("subcategories");
            setEditingSubcategory(null);
            setSubName("");
            setSubStatus("Active");
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "subcategories"
              ? "bg-[#0c6760]/10 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 border border-[#0c6760]/30 dark:border-[#0c6760]/50 shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Subcategories</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === "subcategories"
                ? "bg-[#0c6760] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
            }`}
          >
            {subcategories.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: CATEGORIES MANAGER (Image 2)
          ========================================================================= */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full animate-in fade-in duration-200">
          {/* Left Column: Create / Edit Category Card */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingCategory ? "Edit Category" : "Create Category"}
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-medium border border-[#0c6760]/30 text-[#0c6760] dark:text-teal-400 bg-[#0c6760]/5 dark:bg-[#0c6760]/10">
                  Product
                </span>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Enter category name"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={catStatus}
                    onChange={(e) => setCatStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {editingCategory ? "Update" : "Submit"}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCatName("");
                        setCatStatus("Active");
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

          {/* Right Column: Category list */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Category list
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0c6760]/10 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 border border-[#0c6760]/30 dark:border-[#0c6760]/40">
                  {categories.length} categories
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 font-bold text-xs">
                      <th className="py-3.5 px-4 w-12 text-slate-400 font-semibold">#</th>
                      <th className="py-3.5 px-4 font-bold">Name</th>
                      <th className="py-3.5 px-4 font-bold text-center">Subcategories</th>
                      <th className="py-3.5 px-4 font-bold">Status</th>
                      <th className="py-3.5 px-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {categories.map((cat, idx) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {cat.name}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("subcategories");
                              setSubParentId(cat.id);
                            }}
                            className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#0c6760]/10 hover:bg-[#0c6760]/20 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 border border-[#0c6760]/30 cursor-pointer transition-colors"
                            title={`View subcategories for ${cat.name}`}
                          >
                            {cat.subcategoriesCount}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{cat.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Teal Edit Button */}
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setCatName(cat.name);
                                setCatStatus(cat.status);
                              }}
                              className="w-7 h-7 rounded-full bg-[#0c6760]/10 hover:bg-[#0c6760]/20 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Pink / Rose Delete Button */}
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "category",
                                  id: cat.id,
                                  name: cat.name,
                                })
                              }
                              className="w-7 h-7 rounded-full bg-[#fef2f2] hover:bg-[#fee2e2] dark:bg-rose-950/40 text-[#ef4444] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SUBCATEGORIES MANAGER (Image 3)
          ========================================================================= */}
      {activeTab === "subcategories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full animate-in fade-in duration-200">
          {/* Left Column: Create / Edit Subcategory Card */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingSubcategory ? "Edit Subcategory" : "Create Subcategory"}
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-medium border border-[#0c6760]/30 text-[#0c6760] dark:text-teal-400 bg-[#0c6760]/5 dark:bg-[#0c6760]/10">
                  {categories.length} categories
                </span>
              </div>

              <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                {/* Parent Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Parent Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subParentId}
                    onChange={(e) => setSubParentId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subcategory Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="Enter subcategory name"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subStatus}
                    onChange={(e) => setSubStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {editingSubcategory ? "Update" : "Submit"}
                  </button>
                  {editingSubcategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubcategory(null);
                        setSubName("");
                        setSubStatus("Active");
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

          {/* Right Column: Subcategory list */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Subcategory list
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0c6760]/10 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 border border-[#0c6760]/30 dark:border-[#0c6760]/40">
                  {subcategories.length} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 font-bold text-xs">
                      <th className="py-3.5 px-4 w-12 text-slate-400 font-semibold">#</th>
                      <th className="py-3.5 px-4 font-bold">Name</th>
                      <th className="py-3.5 px-4 font-bold">Category</th>
                      <th className="py-3.5 px-4 font-bold">Status</th>
                      <th className="py-3.5 px-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedSubcategories.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-slate-400 font-medium">
                          {(subPage - 1) * subPageSize + idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {sub.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {sub.categoryName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{sub.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Teal Edit Button */}
                            <button
                              onClick={() => {
                                setEditingSubcategory(sub);
                                setSubName(sub.name);
                                setSubParentId(sub.categoryId);
                                setSubStatus(sub.status);
                              }}
                              className="w-7 h-7 rounded-full bg-[#0c6760]/10 hover:bg-[#0c6760]/20 dark:bg-[#0c6760]/20 text-[#0c6760] dark:text-teal-400 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Edit Subcategory"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Pink / Rose Delete Button */}
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "subcategory",
                                  id: sub.id,
                                  name: sub.name,
                                 })
                              }
                              className="w-7 h-7 rounded-full bg-[#fef2f2] hover:bg-[#fee2e2] dark:bg-rose-950/40 text-[#ef4444] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Delete Subcategory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination matching Image 3: Showing 1 to 10 of 13 results, « 1 2 » */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <span className="px-3.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-medium text-xs">
                  Showing {(subPage - 1) * subPageSize + 1} to{" "}
                  {Math.min(subcategories.length, subPage * subPageSize)} of{" "}
                  {subcategories.length} results
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSubPage((p) => Math.max(p - 1, 1))}
                    disabled={subPage === 1}
                    className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    «
                  </button>
                  {Array.from({ length: totalSubPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSubPage(p)}
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
                        subPage === p
                          ? "bg-[#0c6760] text-white shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setSubPage((p) => Math.min(p + 1, totalSubPages))}
                    disabled={subPage === totalSubPages}
                    className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
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
                  Delete {deleteTarget.type === "category" ? "Category" : "Subcategory"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you sure you want to delete "{deleteTarget.name}"?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              This action cannot be undone. Items assigned to this{" "}
              {deleteTarget.type === "category" ? "category" : "subcategory"} will need to be
              reassigned.
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

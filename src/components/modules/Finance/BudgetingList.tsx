import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  X,
  ChevronDown,
  Eye,
  Printer,
  FileSpreadsheet,
  FileText,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";
import {
  BudgetRecord,
  getStoredBudgets,
  addStoredBudget,
  updateStoredBudget,
  deleteStoredBudget,
  BUDGET_CATEGORIES,
  BUDGET_PERIODS,
} from "./budgetingStorage";

export default function BudgetingList() {
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [usageFilter, setUsageFilter] = useState<string>("all"); // "all", "over", "warning", "under"

  // Dropdowns & Popovers
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Currency
  const [currencySymbol, setCurrencySymbol] = useState<"$" | "৳">("$");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRecord | null>(null);

  // Add / Edit form state
  const [formBudgetId, setFormBudgetId] = useState("");
  const [formPeriod, setFormPeriod] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formBudgetAmount, setFormBudgetAmount] = useState<number | string>("");
  const [formSpentAmount, setFormSpentAmount] = useState<number | string>("");
  const [formNotes, setFormNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const exportRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
      if (
        activeActionId &&
        !(e.target as HTMLElement).closest(".action-menu-container")
      ) {
        setActiveActionId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeActionId]);

  // Load budgets from storage
  const loadData = () => {
    const data = getStoredBudgets();
    setBudgets(data);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_finance_budgeting_updated", handleUpdate);
    return () => {
      window.removeEventListener(
        "nexora_finance_budgeting_updated",
        handleUpdate
      );
    };
  }, []);

  // Filtered and searched budgets
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      // Search
      const matchSearch =
        !searchQuery ||
        b.budgetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.period.toLowerCase().includes(searchQuery.toLowerCase());

      // Period filter
      const matchPeriod =
        selectedPeriod === "all" || b.period === selectedPeriod;

      // Category filter
      const matchCategory =
        selectedCategory === "all" || b.category === selectedCategory;

      // Usage filter
      let matchUsage = true;
      const usagePercent = b.budget > 0 ? (b.spent / b.budget) * 100 : 0;
      if (usageFilter === "over") {
        matchUsage = usagePercent > 100;
      } else if (usageFilter === "warning") {
        matchUsage = usagePercent >= 85 && usagePercent <= 100;
      } else if (usageFilter === "under") {
        matchUsage = usagePercent < 85;
      }

      return matchSearch && matchPeriod && matchCategory && matchUsage;
    });
  }, [budgets, searchQuery, selectedPeriod, selectedCategory, usageFilter]);

  // Pagination slice
  const totalItems = filteredBudgets.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedBudgets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBudgets.slice(start, start + pageSize);
  }, [filteredBudgets, currentPage, pageSize]);

  // Format currency
  const formatAmount = (val: number) => {
    const formatted = Math.abs(val).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    if (val < 0) {
      return `-${currencySymbol}${formatted}`;
    }
    return `${currencySymbol}${formatted}`;
  };

  // Helper for progress bar color & remaining text color
  const getBudgetUsageStyle = (spent: number, budget: number) => {
    const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;

    let barColor = "bg-emerald-600";
    let textColor = "text-emerald-600 dark:text-emerald-400";
    let remainingColor = "text-emerald-600 dark:text-emerald-400";

    if (percent > 100) {
      barColor = "bg-red-700";
      textColor = "text-red-700 dark:text-red-400 font-semibold";
      remainingColor = "text-red-600 dark:text-red-400 font-medium";
    } else if (percent >= 85) {
      barColor = "bg-amber-600";
      textColor = "text-amber-600 dark:text-amber-400 font-medium";
      remainingColor = "text-amber-600 dark:text-amber-400 font-medium";
    } else if (percent === 0) {
      barColor = "bg-gray-300 dark:bg-gray-700";
      textColor = "text-gray-500 dark:text-gray-400";
      remainingColor = "text-gray-600 dark:text-gray-400";
    } else if (percent < 50) {
      barColor = "bg-sky-500";
      textColor = "text-sky-600 dark:text-sky-400";
      remainingColor = "text-emerald-600 dark:text-emerald-400";
    }

    return {
      percent,
      barColor,
      textColor,
      remainingColor,
    };
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    // Generate next budget ID
    const numericIds = budgets
      .map((b) => {
        const m = b.budgetId.match(/#?BG0*(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 21;
    const nextIdStr = `#BG00${nextNum}`;

    setFormBudgetId(nextIdStr);
    setFormPeriod("Q2 2026");
    setFormCategory("Office Supplies");
    setFormBudgetAmount("");
    setFormSpentAmount("");
    setFormNotes("");
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (b: BudgetRecord) => {
    setSelectedBudget(b);
    setFormBudgetId(b.budgetId);
    setFormPeriod(b.period);
    setFormCategory(b.category);
    setFormBudgetAmount(b.budget);
    setFormSpentAmount(b.spent);
    setFormNotes(b.notes || "");
    setFormErrors({});
    setActiveActionId(null);
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (b: BudgetRecord) => {
    setSelectedBudget(b);
    setActiveActionId(null);
    setIsViewModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (b: BudgetRecord) => {
    setSelectedBudget(b);
    setActiveActionId(null);
    setIsDeleteModalOpen(true);
  };

  // Save Add Budget
  const handleSaveAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formBudgetId.trim()) errors.budgetId = "Budget ID is required";
    if (!formPeriod.trim()) errors.period = "Period is required";
    if (!formCategory.trim()) errors.category = "Category is required";
    if (!formBudgetAmount || Number(formBudgetAmount) <= 0) {
      errors.budget = "Please enter a valid budget amount";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addStoredBudget({
      customId: formBudgetId.trim(),
      period: formPeriod.trim(),
      category: formCategory.trim(),
      budget: Number(formBudgetAmount),
      spent: formSpentAmount ? Number(formSpentAmount) : 0,
      notes: formNotes.trim() || undefined,
    });

    toast.success("Budget entry added successfully");
    setIsAddModalOpen(false);
  };

  // Save Edit Budget
  const handleSaveEditBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget) return;
    const errors: Record<string, string> = {};

    if (!formPeriod.trim()) errors.period = "Period is required";
    if (!formCategory.trim()) errors.category = "Category is required";
    if (!formBudgetAmount || Number(formBudgetAmount) <= 0) {
      errors.budget = "Please enter a valid budget amount";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateStoredBudget(selectedBudget.id, {
      budgetId: formBudgetId.trim(),
      period: formPeriod.trim(),
      category: formCategory.trim(),
      budget: Number(formBudgetAmount),
      spent: Number(formSpentAmount) || 0,
      notes: formNotes.trim() || undefined,
    });

    toast.success("Budget entry updated successfully");
    setIsEditModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedBudget) return;
    deleteStoredBudget(selectedBudget.id);
    toast.success(`Budget ${selectedBudget.budgetId} deleted`);
    setIsDeleteModalOpen(false);
    setSelectedBudget(null);
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      "Budget ID",
      "Category",
      "Period",
      "Budget",
      "Spent",
      "Remaining",
      "Usage (%)",
    ];
    const rows = filteredBudgets.map((b) => {
      const remaining = b.budget - b.spent;
      const usage = b.budget > 0 ? Math.round((b.spent / b.budget) * 100) : 0;
      return [
        b.budgetId,
        b.category,
        b.period,
        b.budget,
        b.spent,
        remaining,
        `${usage}%`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budgeting_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Budget CSV downloaded");
  };

  const handlePrint = () => {
    setIsExportOpen(false);
    window.print();
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen">
      {/* Top Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Budgeting
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Plan, monitor allocations, and track department spending limits in
            real-time.
          </p>
        </div>

        {/* Action Buttons: Export and + Add Budget */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Currency Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrencySymbol("$")}
              className={`px-2 py-1 rounded ${currencySymbol === "$"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => setCurrencySymbol("৳")}
              className={`px-2 py-1 rounded ${currencySymbol === "৳"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              ৳ BDT
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-1">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export as CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Export as Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left border-t border-gray-100 dark:border-gray-800"
                >
                  <Printer className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span>Print Document</span>
                </button>
              </div>
            )}
          </div>

          {/* + Add Budget Button matching Image 2 */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0c6760] hover:bg-[#09544e] rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Budget</span>
          </button>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Filter / Search Bar matching Image 2 */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search"
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50/60 dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter button toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors ${showFilterBar ||
                selectedPeriod !== "all" ||
                selectedCategory !== "all" ||
                usageFilter !== "all"
                ? "bg-[#0c6760]/10 border-[#0c6760] text-[#0c6760] dark:bg-[#0c6760]/20 dark:border-[#0c6760]"
                : "bg-white dark:bg-[#181b24] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilterBar && (
          <div className="p-4 bg-gray-50/70 dark:bg-[#14161f] border-b border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-1">
            {/* Period */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
              >
                <option value="all">All Periods</option>
                {BUDGET_PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
              >
                <option value="all">All Categories</option>
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Usage Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Budget Status
              </label>
              <select
                value={usageFilter}
                onChange={(e) => {
                  setUsageFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
              >
                <option value="all">All Statuses</option>
                <option value="under">Under Budget (&lt; 85%)</option>
                <option value="warning">Near Limit (85% - 100%)</option>
                <option value="over">Over Budget (&gt; 100%)</option>
              </select>
            </div>
          </div>
        )}

        {/* Table View matching Image 2 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14161f]/50 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <th className="py-3.5 px-4 font-semibold">Budget ID</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Period</th>
                <th className="py-3.5 px-4 font-semibold">Budget</th>
                <th className="py-3.5 px-4 font-semibold">Spent</th>
                <th className="py-3.5 px-4 font-semibold">Remaining</th>
                <th className="py-3.5 px-4 font-semibold min-w-[160px]">
                  Usage
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-sm">
              {paginatedBudgets.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PieChart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium">No budgets found</p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your filters or click "+ Add Budget"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBudgets.map((b) => {
                  const remaining = b.budget - b.spent;
                  const usageStyle = getBudgetUsageStyle(b.spent, b.budget);

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group"
                    >
                      {/* Budget ID */}
                      <td className="py-4 px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                        {b.budgetId}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100">
                        {b.category}
                      </td>

                      {/* Period */}
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                        {b.period}
                      </td>

                      {/* Budget */}
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        {formatAmount(b.budget)}
                      </td>

                      {/* Spent */}
                      <td className="py-4 px-4 font-normal text-gray-700 dark:text-gray-300">
                        {formatAmount(b.spent)}
                      </td>

                      {/* Remaining (Colorized as in Image 2) */}
                      <td
                        className={`py-4 px-4 font-semibold ${usageStyle.remainingColor}`}
                      >
                        {formatAmount(remaining)}
                      </td>

                      {/* Usage (Progress bar + percentage as in Image 2) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[110px] h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${usageStyle.barColor}`}
                              style={{
                                width: `${Math.min(usageStyle.percent, 100)}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold whitespace-nowrap min-w-[32px] ${usageStyle.textColor}`}
                          >
                            {usageStyle.percent}%
                          </span>
                        </div>
                      </td>

                      {/* Action Menu button matching Image 2 */}
                      <td className="py-4 px-4 text-right">
                        <div className="relative inline-block text-left action-menu-container">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveActionId(
                                activeActionId === b.id ? null : b.id
                              )
                            }
                            className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeActionId === b.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-1 text-xs">
                              <button
                                type="button"
                                onClick={() => handleOpenViewModal(b)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                                <span>View Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(b)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                              >
                                <Edit className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Edit Budget</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(b)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-medium border-t border-gray-100 dark:border-gray-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
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

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {totalItems}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value={7}>7 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ADD BUDGET MODAL matching Image 3 precisely */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Add Budgeting
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAddBudget} className="p-6 space-y-4">
              {/* Budget ID * */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Budget ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formBudgetId}
                  onChange={(e) => setFormBudgetId(e.target.value)}
                  placeholder="#BG0020"
                  className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.budgetId
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                    }`}
                />
                {formErrors.budgetId && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.budgetId}
                  </p>
                )}
              </div>

              {/* Two columns: Period * and Category * matching Image 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Period * */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Period <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.period
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                      }`}
                  >
                    <option value="">Select</option>
                    {BUDGET_PERIODS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {formErrors.period && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.period}
                    </p>
                  )}
                </div>

                {/* Category * */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.category
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                      }`}
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Budget * matching Image 3 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formBudgetAmount}
                    onChange={(e) => setFormBudgetAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className={`w-full pl-8 pr-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.budget
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                      }`}
                  />
                </div>
                {formErrors.budget && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.budget}
                  </p>
                )}
              </div>

              {/* Initial Spent (Optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Initial Spent (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formSpentAmount}
                    onChange={(e) => setFormSpentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30"
                  />
                </div>
              </div>

              {/* Footer Buttons matching Image 3: Cancel & Add Budgeting */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#0c6760] hover:bg-[#09544e] rounded-lg transition-all shadow-sm active:scale-95"
                >
                  Add Budgeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT BUDGET MODAL */}
      {/* ============================================================== */}
      {isEditModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Edit Budget - {selectedBudget.budgetId}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBudget} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Budget ID
                </label>
                <input
                  type="text"
                  value={formBudgetId}
                  onChange={(e) => setFormBudgetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-100 dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Period <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    {BUDGET_PERIODS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Budget Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formBudgetAmount}
                    onChange={(e) => setFormBudgetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Spent Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formSpentAmount}
                    onChange={(e) => setFormSpentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional context about this department budget"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#0c6760] hover:bg-[#09544e] rounded-lg transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW DETAILS MODAL */}
      {/* ============================================================== */}
      {isViewModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#0c6760]" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Budget Details ({selectedBudget.budgetId})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-[#12141c] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Category & Period</p>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {selectedBudget.category}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {selectedBudget.period}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Allocated Budget</p>
                  <p className="text-lg font-bold text-[#0c6760]">
                    {formatAmount(selectedBudget.budget)}
                  </p>
                </div>
              </div>

              {/* Spending Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50/60 dark:bg-[#14161f] rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500">Spent to Date</span>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                    {formatAmount(selectedBudget.spent)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50/60 dark:bg-[#14161f] rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500">Remaining</span>
                  <p
                    className={`text-base font-semibold mt-0.5 ${getBudgetUsageStyle(
                      selectedBudget.spent,
                      selectedBudget.budget
                    ).remainingColor
                      }`}
                  >
                    {formatAmount(
                      selectedBudget.budget - selectedBudget.spent
                    )}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="text-gray-500">Budget Usage</span>
                  <span
                    className={
                      getBudgetUsageStyle(
                        selectedBudget.spent,
                        selectedBudget.budget
                      ).textColor
                    }
                  >
                    {selectedBudget.budget > 0
                      ? Math.round(
                        (selectedBudget.spent / selectedBudget.budget) * 100
                      )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getBudgetUsageStyle(
                      selectedBudget.spent,
                      selectedBudget.budget
                    ).barColor
                      }`}
                    style={{
                      width: `${Math.min(
                        (selectedBudget.spent / (selectedBudget.budget || 1)) *
                        100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {selectedBudget.notes && (
                <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-semibold mb-0.5">Notes:</p>
                  <p>{selectedBudget.notes}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {isDeleteModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
              Delete Budget {selectedBudget.budgetId}?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to remove the budget allocation for{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {selectedBudget.category} ({selectedBudget.period})
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
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

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Printer,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Calendar,
  X,
  Edit2,
  Trash2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  ExpenseRecord,
  getStoredExpenses,
  addStoredExpense,
  updateStoredExpense,
  deleteStoredExpense,
  getStoredExpenseCategories,
} from "./expenseStorage";

export default function ExpensesList() {
  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Jan 26 to 20 Jan 26");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "amount-desc" | "amount-asc" | "date-desc" | "name-asc">("default");

  // UI Dropdowns
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRecord | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Office Supplies");
  const [formAmount, setFormAmount] = useState<number | string>("");
  const [formPaymentMethod, setFormPaymentMethod] = useState("Cash");
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${String(today.getDate()).padStart(2, "0")} ${months[today.getMonth()]} ${today.getFullYear()}`;
  });
  const [formStatus, setFormStatus] = useState<"Paid" | "Pending" | "Approved">("Pending");

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load data
  const loadData = () => {
    setExpenses(getStoredExpenses());
    const cats = getStoredExpenseCategories();
    setCategories(cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_expenses_updated", handleUpdate);
    window.addEventListener("nexora_expense_categories_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_expenses_updated", handleUpdate);
      window.removeEventListener("nexora_expense_categories_updated", handleUpdate);
    };
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

  // Format currency helper ($10,000)
  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString("en-US")}`;
  };

  // Open Edit Modal (matching Image 2)
  const handleOpenEdit = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setFormName(exp.name);
    setFormCategory(exp.category || "Office Supplies");
    setFormAmount(exp.amount);
    setFormPaymentMethod(exp.paymentMethod || "Cash");
    setFormDate(exp.date);
    setFormStatus(exp.status);
    setActiveActionId(null);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormName("");
    setFormCategory(categories.length > 0 ? categories[0].name : "Office Supplies");
    setFormAmount("");
    setFormPaymentMethod("Cash");
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    setFormDate(`${String(today.getDate()).padStart(2, "0")} ${months[today.getMonth()]} ${today.getFullYear()}`);
    setFormStatus("Paid");
    setIsAddModalOpen(true);
  };

  // Save changes (Edit)
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    if (!formName.trim()) {
      toast.error("Please enter expense name");
      return;
    }

    const catSlug = formCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const updated = updateStoredExpense(editingExpense.id, {
      name: formName.trim(),
      category: formCategory,
      categorySlug: catSlug,
      amount: Number(formAmount) || editingExpense.amount,
      paymentMethod: formPaymentMethod,
      date: formDate,
      status: formStatus,
    });

    if (updated) {
      toast.success(`Expense ${editingExpense.expenseId} updated successfully`);
      setEditingExpense(null);
    }
  };

  // Create new expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter expense name");
      return;
    }
    const amt = Number(formAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const catSlug = formCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const created = addStoredExpense({
      name: formName.trim(),
      category: formCategory,
      categorySlug: catSlug,
      amount: amt,
      paymentMethod: formPaymentMethod,
      date: formDate,
      status: formStatus,
    });

    toast.success(`Expense ${created.expenseId} created successfully`);
    setIsAddModalOpen(false);
  };

  // Delete expense
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredExpense(deleteTarget.id);
    toast.success(`Expense ${deleteTarget.expenseId} deleted`);
    setDeleteTarget(null);
    setActiveActionId(null);
  };

  // Filter & Sort
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.expenseId.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.paymentMethod.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((e) => e.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Payment method filter
    if (paymentFilter !== "all") {
      result = result.filter((e) => e.paymentMethod.toLowerCase() === paymentFilter.toLowerCase());
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Sorting
    if (sortBy === "amount-desc") {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "amount-asc") {
      result.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "date-desc") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }, [expenses, searchQuery, categoryFilter, paymentFilter, statusFilter, sortBy]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }
    const headers = ["Expense ID", "Expense Name", "Category", "Amount", "Payment Method", "Date", "Status"];
    const rows = filteredExpenses.map((e) => [
      e.expenseId,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.category.replace(/"/g, '""')}"`,
      e.amount,
      e.paymentMethod,
      e.date,
      e.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Expenses exported as CSV");
  };

  // Status Badge Renderer matching Reference Image 1
  const renderStatusBadge = (status: "Paid" | "Pending" | "Approved") => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400">
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#fff8eb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400">
            Pending
          </span>
        );
      case "Approved":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#e0f2fe] text-[#0284c7] dark:bg-sky-950/40 dark:text-sky-400">
            Approved
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== 1. TOP HEADER (Exact Reference Image 1) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Expenses
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* + Add New Button (Matching Image 1: solid dark) */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* ===================== 2. MAIN TABLE CARD (Exact Reference Image 1) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar (Search + Date Range + Action Controls) */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search Box & Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
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

            {/* Date Range Selector matching Reference Image 1 */}
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
                  <div className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase px-2 py-1">
                    Quick Ranges
                  </div>
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

          {/* Right: Filter & Sort By buttons */}
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
              <span>Filter</span>
            </button>

            {/* Sort By Dropdown */}
            <div className="relative">
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
                      setSortBy("amount-desc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "amount-desc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Amount (High to Low)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("amount-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "amount-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Amount (Low to High)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("date-desc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "date-desc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Date (Newest First)
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
                    Name (A to Z)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilterBar && (
          <div className="p-3 bg-slate-50/70 dark:bg-[#12141c]/50 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            {(categoryFilter !== "all" || paymentFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setPaymentFilter("all");
                  setStatusFilter("all");
                }}
                className="text-indigo-600 dark:text-indigo-400 underline font-medium ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* ===================== TABLE CONTENT (Exact columns matching Reference Image 1) ===================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3.5 px-4 w-32">Expense ID</th>
                <th className="py-3.5 px-4 min-w-[200px]">Expense Name</th>
                <th className="py-3.5 px-4 min-w-[150px]">Category</th>
                <th className="py-3.5 px-4 min-w-[120px]">Amount</th>
                <th className="py-3.5 px-4 min-w-[140px]">Payment Method</th>
                <th className="py-3.5 px-4 min-w-[130px]">Date</th>
                <th className="py-3.5 px-4 w-28">Status</th>
                <th className="py-3.5 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No expense records found. Try adjusting your search or add a new expense.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Expense ID (e.g. #EXP0020) */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400 font-mono">
                      {exp.expenseId}
                    </td>

                    {/* Expense Name (Bold font matching reference Image 1) */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {exp.name}
                    </td>

                    {/* Category (e.g. Office Supplies) */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {exp.category}
                    </td>

                    {/* Amount (e.g. $10,000) */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white font-mono">
                      {formatMoney(exp.amount)}
                    </td>

                    {/* Payment Method (e.g. Cash, Credit Card, UPI) */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {exp.paymentMethod}
                    </td>

                    {/* Date (e.g. 11 Sep 2025) */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {exp.date}
                    </td>

                    {/* Status Badge (Paid / Pending / Approved) */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(exp.status)}
                    </td>

                    {/* Action Column (3-dots button ⋮ matching Image 1) */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className="relative inline-block text-left"
                        ref={activeActionId === exp.id ? actionMenuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setActiveActionId(activeActionId === exp.id ? null : exp.id)
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu (Matching Image 1: Edit, Delete) */}
                        {activeActionId === exp.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#181b24] rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => handleOpenEdit(exp)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(exp);
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

      {/* ===================== EDIT EXPENSE MODAL (Exact Layout of Reference Image 2) ===================== */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Expense
              </h2>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              {/* Expense Name * */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expense Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Category Slug * */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  list="category-suggestions"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              {/* Amount and Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Amount ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 font-mono bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Status (dropdown matching Image 2) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Paid" | "Pending" | "Approved")}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              {/* Action Buttons (Matching Image 2: Cancel vs Save Changes) */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== ADD NEW EXPENSE MODAL ===================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add New Expense
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expense Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Stationery / Team Lunch"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && <option value="General">General</option>}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Amount ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="1000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 font-mono bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Expense Date
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="DD Mon YYYY"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Paid" | "Pending" | "Approved")}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Delete Expense Record?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">{deleteTarget.expenseId} - {deleteTarget.name}</span>? This action cannot be undone.
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

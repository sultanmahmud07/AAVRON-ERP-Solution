import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Printer,
  Download,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  RotateCw,
  Columns3,
  MoreVertical,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  X,
  Eye,
  Undo2,
  CreditCard,
  ShoppingBag,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  PurchaseRecord,
  PurchaseStatus,
  PurchasePaymentStatus,
  getStoredPurchases,
  deleteStoredPurchase,
  recordPurchasePayment,
} from "./purchaseStorage";

export default function ManagePurchase() {
  const navigate = useNavigate();

  // Purchases State
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "default" | "amount-desc" | "amount-asc" | "supplier-asc" | "date-desc"
  >("default");

  // KPI Metrics Calculation (Total, Paid, Due)
  const kpiMetrics = useMemo(() => {
    const totalCount = purchases.length;
    const totalAmount = purchases.reduce((acc, p) => acc + (p.netTotal || 0), 0);
    const totalPaid = purchases.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
    const totalDue = purchases.reduce((acc, p) => acc + (p.dueAmount || 0), 0);
    return { totalCount, totalAmount, totalPaid, totalDue };
  }, [purchases]);

  // UI Dropdowns
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [activePaymentPurchase, setActivePaymentPurchase] = useState<PurchaseRecord | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number | string>("");
  const [paymentAccountChoice, setPaymentAccountChoice] = useState<string>("Cash");
  const [deleteTarget, setDeleteTarget] = useState<PurchaseRecord | null>(null);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load data
  const loadPurchases = () => {
    const list = getStoredPurchases();
    setPurchases(list);
  };

  useEffect(() => {
    loadPurchases();
    const handleStorageUpdate = () => loadPurchases();
    window.addEventListener("nexora_purchases_updated", handleStorageUpdate);
    return () => window.removeEventListener("nexora_purchases_updated", handleStorageUpdate);
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

  // Format currency helper ($ or ৳ supported)
  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Filtered & Sorted purchases
  const filteredPurchases = useMemo(() => {
    let result = [...purchases];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.purchaseNumber.toLowerCase().includes(q) ||
          p.invoiceNumber.toLowerCase().includes(q) ||
          p.purchaseName.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          (p.supplierCompany && p.supplierCompany.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Payment filter
    if (paymentFilter !== "all") {
      result = result.filter((p) => {
        const pStatus = p.paymentStatus.toLowerCase();
        if (paymentFilter === "paid") return pStatus === "paid";
        if (paymentFilter === "pending") return pStatus === "pending" || pStatus === "unpaid";
        if (paymentFilter === "partial") return pStatus === "partial" || pStatus === "partially paid";
        return true;
      });
    }

    // Sorting
    if (sortBy === "amount-desc") {
      result.sort((a, b) => b.netTotal - a.netTotal);
    } else if (sortBy === "amount-asc") {
      result.sort((a, b) => a.netTotal - b.netTotal);
    } else if (sortBy === "supplier-asc") {
      result.sort((a, b) => a.supplierName.localeCompare(b.supplierName));
    } else if (sortBy === "date-desc") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }, [purchases, searchQuery, statusFilter, paymentFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / pageSize));
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPurchases.slice(start, start + pageSize);
  }, [filteredPurchases, currentPage, pageSize]);

  // Status Badge matching reference Image 1
  const renderStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case "Received":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400">
            Received
          </span>
        );
      case "Ordered":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#fff8eb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400">
            Ordered
          </span>
        );
      case "In Transit":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#eef4ff] text-[#2563eb] dark:bg-sky-950/40 dark:text-sky-400">
            In Transit
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#fef2f2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  // Payment column display
  const renderPaymentText = (paymentStatus: PurchasePaymentStatus) => {
    switch (paymentStatus) {
      case "Paid":
        return <span className="text-slate-700 dark:text-slate-300">Paid</span>;
      case "Partial":
      case "Partially paid":
        return <span className="text-slate-700 dark:text-slate-300">Partial</span>;
      case "Pending":
      case "Unpaid":
      default:
        return <span className="text-slate-700 dark:text-slate-300">Pending</span>;
    }
  };

  // Quick Payment Handlers
  const openPaymentModal = (record: PurchaseRecord) => {
    setActivePaymentPurchase(record);
    setPaymentAmountInput(record.dueAmount || record.netTotal);
    setPaymentAccountChoice("Cash");
    setActiveActionId(null);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentPurchase) return;

    const amount = Number(paymentAmountInput);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    recordPurchasePayment(activePaymentPurchase.id, amount, paymentAccountChoice);
    toast.success(`Payment of ${formatMoney(amount)} recorded for ${activePaymentPurchase.purchaseNumber}`);
    setActivePaymentPurchase(null);
    loadPurchases();
  };

  // Delete Handlers
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteStoredPurchase(deleteTarget.id);
    toast.success(`Purchase ${deleteTarget.purchaseNumber} deleted successfully`);
    setDeleteTarget(null);
    setActiveActionId(null);
    loadPurchases();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Reference,Supplier,Purchase Date,Items,Amount,Payment,Status"];
    const rows = filteredPurchases.map((p) => [
      `"${p.purchaseNumber}"`,
      `"${p.supplierName}"`,
      `"${p.date}"`,
      p.itemsCount || p.items.length || 1,
      p.netTotal,
      `"${p.paymentStatus}"`,
      `"${p.status}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchases_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Purchases exported as CSV");
  };

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== 1. TOP HEADER (Exact Layout of Reference Image 1) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Purchases
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

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
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

          {/* + Add New Button (Matching Image 1: solid dark) */}
          <Link
            to="/purchase/add"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </Link>
        </div>
      </div>

      {/* ===================== KPI SUMMARY METRICS (Total, Paid, Due) ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-[#181b24] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Purchases
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {formatMoney(kpiMetrics.totalAmount)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {kpiMetrics.totalCount} total procurement orders
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#181b24] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Paid Amount
            </span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatMoney(kpiMetrics.totalPaid)}
            </div>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              Settled to suppliers
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#181b24] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Due Amount
            </span>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {formatMoney(kpiMetrics.totalDue)}
            </div>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium">
              Outstanding payable balance
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ===================== 2. MAIN TABLE CARD (Exact Layout of Reference Image 1) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar (Search + Date Range + Action Controls) */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search Box & Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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

          {/* Right: Filter, Sort By, Column toggle, Refresh */}
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
                      setSortBy("supplier-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "supplier-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Supplier (A - Z)
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
                </div>
              )}
            </div>

            {/* Column Layout Icon */}
            <button
              title="Columns layout"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                loadPurchases();
                setSearchQuery("");
                setStatusFilter("all");
                setPaymentFilter("all");
                setSortBy("default");
                toast.success("Purchases list refreshed");
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
              <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="Received">Received</option>
                <option value="Ordered">Ordered</option>
                <option value="In Transit">In Transit</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            {(statusFilter !== "all" || paymentFilter !== "all") && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="text-indigo-600 dark:text-indigo-400 underline font-medium ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Table Content (Exact columns matching Reference Image 1) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3.5 px-4 w-28">Reference</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Purchase Date</th>
                <th className="py-3.5 px-4 w-16 text-center">Items</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Due</th>
                <th className="py-3.5 px-4 w-28">Payment</th>
                <th className="py-3.5 px-4 w-28">Status</th>
                <th className="py-3.5 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No purchase records found. Try adjusting your search or add a new purchase.
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((pur) => (
                  <tr
                    key={pur.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Reference (e.g. #PUR0020) */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400">
                      <Link
                        to={`/purchase/details/${pur.id}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 font-mono transition-colors"
                      >
                        {pur.purchaseNumber}
                      </Link>
                    </td>

                    {/* Supplier (Bold font matching reference Image 1) */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pur.supplierName}
                        </span>
                        {pur.supplierCompany && (
                          <span className="text-[11px] text-slate-400">
                            {pur.supplierCompany}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Purchase Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {pur.date}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-200">
                      {pur.itemsCount || pur.items.length || 1}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white font-mono">
                      {formatMoney(pur.netTotal)}
                    </td>

                    {/* Paid Amount */}
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatMoney(pur.paidAmount)}
                    </td>

                    {/* Due Amount */}
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`font-semibold ${
                          pur.dueAmount > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {formatMoney(pur.dueAmount)}
                      </span>
                    </td>

                    {/* Payment (Paid / Pending / Partial) */}
                    <td className="py-3.5 px-4">
                      {renderPaymentText(pur.paymentStatus)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(pur.status)}
                    </td>

                    {/* Action Column (3-dots button ⋮ matching Image 1) */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className="relative inline-block text-left"
                        ref={activeActionId === pur.id ? actionMenuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setActiveActionId(
                              activeActionId === pur.id ? null : pur.id
                            )
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeActionId === pur.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30">
                            {/* View Details */}
                            <button
                              onClick={() => {
                                navigate(`/purchase/details/${pur.id}`);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-500" />
                              View Details
                            </button>

                            {/* Record Payment */}
                            <button
                              onClick={() => openPaymentModal(pur)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                              Record Payment
                            </button>

                            {/* Purchase Return */}
                            <button
                              onClick={() => {
                                navigate(`/purchase/returns?invoice=${encodeURIComponent(pur.invoiceNumber || pur.purchaseNumber)}`);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Undo2 className="w-3.5 h-3.5 text-amber-500" />
                              Purchase Return
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                setDeleteTarget(pur);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

        {/* Bottom Pagination Bar (Exact Layout of Reference Image 1) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          {/* Showing 10 / Pages dropdown */}
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
            >
              <option value={10}>10 / Pages</option>
              <option value={25}>25 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          {/* Page numbers & previous/next */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition ${
                  currentPage === page
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== QUICK PAYMENT MODAL ===================== */}
      {activePaymentPurchase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Record Payment
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {activePaymentPurchase.purchaseNumber} - {activePaymentPurchase.supplierName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePaymentPurchase(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-[#12141c] p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
                <div>
                  <span className="block text-slate-500 text-[10px]">Total Amount</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {formatMoney(activePaymentPurchase.netTotal)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px]">Already Paid</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatMoney(activePaymentPurchase.paidAmount)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px]">Due Balance</span>
                  <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                    {formatMoney(activePaymentPurchase.dueAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Account
                </label>
                <select
                  value={paymentAccountChoice}
                  onChange={(e) => setPaymentAccountChoice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Cash">Cash in Hand</option>
                  <option value="City Bank Ltd">City Bank Ltd</option>
                  <option value="Dutch Bangla Bank">Dutch Bangla Bank</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="bKash Merchant">bKash Merchant</option>
                  <option value="Nagad Business">Nagad Business</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Amount to Pay <span className="text-rose-500">*</span>
                  </label>
                  {activePaymentPurchase.dueAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmountInput(activePaymentPurchase.dueAmount)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Pay Full Due ({formatMoney(activePaymentPurchase.dueAmount)})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={activePaymentPurchase.dueAmount}
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm bg-slate-50 dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {Number(paymentAmountInput) > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Remaining Due after Payment:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {formatMoney(Math.max(0, activePaymentPurchase.dueAmount - (Number(paymentAmountInput) || 0)))}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivePaymentPurchase(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Delete Purchase?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {deleteTarget.purchaseNumber} ({deleteTarget.supplierName})
                </span>
                ?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
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

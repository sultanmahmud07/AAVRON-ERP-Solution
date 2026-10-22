import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
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
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  PurchaseReturnRecord,
  PurchaseReturnStatus,
  getStoredPurchaseReturns,
  addStoredPurchaseReturn,
  deleteStoredPurchaseReturn,
  getStoredPurchases,
  PurchaseRecord,
} from "./purchaseStorage";

export default function PurchaseReturnList() {
  const [searchParams] = useSearchParams();
  const preselectedInvoice = searchParams.get("invoice") || "";

  // State
  const [returns, setReturns] = useState<PurchaseReturnRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "default" | "amount-desc" | "amount-asc" | "supplier-asc" | "date-desc"
  >("default");

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingReturn, setViewingReturn] = useState<PurchaseReturnRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseReturnRecord | null>(null);

  // Create Return Form State
  const [selectedInvoice, setSelectedInvoice] = useState<string>(preselectedInvoice);
  const [returnDate, setReturnDate] = useState<string>(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [returnReason, setReturnReason] = useState<string>("Damaged during transit");
  const [refundStatus, setRefundStatus] = useState<PurchaseReturnStatus>("Approved");
  const [returnNotes, setReturnNotes] = useState<string>("");

  const [returnItems, setReturnItems] = useState<
    { name: string; qty: number; unitPrice: number; refundAmount: number; reason: string }[]
  >([]);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load data
  const loadData = () => {
    setReturns(getStoredPurchaseReturns());
    setPurchases(getStoredPurchases());
  };

  useEffect(() => {
    loadData();
    if (preselectedInvoice) {
      setSelectedInvoice(preselectedInvoice);
      setIsCreateModalOpen(true);
    }
  }, [preselectedInvoice]);

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

  // When invoice changes in create modal, prepopulate items
  useEffect(() => {
    if (!selectedInvoice) {
      setReturnItems([]);
      return;
    }
    const found = purchases.find(
      (p) => p.invoiceNumber === selectedInvoice || p.purchaseNumber === selectedInvoice
    );
    if (found && found.items.length > 0) {
      const first = found.items[0];
      setReturnItems([
        {
          name: first.name,
          qty: 1,
          unitPrice: first.purchasePrice,
          refundAmount: first.purchasePrice * 1,
          reason: returnReason,
        },
      ]);
    }
  }, [selectedInvoice, purchases, returnReason]);

  const formatMoney = (val: number) => {
    return `$${val.toLocaleString("en-US", {
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Filtered & Sorted returns
  const filteredReturns = useMemo(() => {
    let result = [...returns];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.returnNumber.toLowerCase().includes(q) ||
          r.supplierName.toLowerCase().includes(q) ||
          r.purchaseInvoice.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.refundStatus.toLowerCase() === statusFilter.toLowerCase());
    }

    if (sortBy === "amount-desc") {
      result.sort((a, b) => b.totalRefundAmount - a.totalRefundAmount);
    } else if (sortBy === "amount-asc") {
      result.sort((a, b) => a.totalRefundAmount - b.totalRefundAmount);
    } else if (sortBy === "supplier-asc") {
      result.sort((a, b) => a.supplierName.localeCompare(b.supplierName));
    } else if (sortBy === "date-desc") {
      result.sort((a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime());
    }

    return result;
  }, [returns, searchQuery, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredReturns.length / pageSize));
  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReturns.slice(start, start + pageSize);
  }, [filteredReturns, currentPage, pageSize]);

  // Status Badge matching reference Image 2
  const renderStatusBadge = (status: PurchaseReturnStatus) => {
    switch (status) {
      case "Approved":
      case "Refunded":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400">
            Approved
          </span>
        );
      case "Pending":
      case "Deducted from Due":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#fff8eb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400">
            Pending
          </span>
        );
      case "Rejected":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#fef2f2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400">
            Rejected
          </span>
        );
    }
  };

  // Submit new return
  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const purchase = purchases.find(
      (p) => p.invoiceNumber === selectedInvoice || p.purchaseNumber === selectedInvoice
    );
    if (!purchase) {
      toast.error("Please select a valid purchase invoice");
      return;
    }

    if (returnItems.length === 0 || returnItems[0].qty <= 0) {
      toast.error("Please specify items and return quantity");
      return;
    }

    const totalRefund = returnItems.reduce((acc, it) => acc + it.refundAmount, 0);

    const created = addStoredPurchaseReturn({
      purchaseInvoice: purchase.purchaseNumber,
      purchaseName: purchase.purchaseName,
      supplierName: purchase.supplierName,
      supplierPhone: purchase.supplierPhone,
      returnDate: "11 Sep 2025",
      itemsCount: returnItems.reduce((acc, it) => acc + it.qty, 0),
      items: returnItems.map((it, idx) => ({
        id: `ri-${Date.now()}-${idx}`,
        name: it.name,
        qty: it.qty,
        unitPrice: it.unitPrice,
        refundAmount: it.refundAmount,
        reason: it.reason || returnReason,
      })),
      totalRefundAmount: totalRefund,
      refundStatus,
      notes: returnNotes.trim() || undefined,
    });

    toast.success(`Purchase return ${created.returnNumber} processed successfully!`);
    setIsCreateModalOpen(false);
    loadData();
  };

  // Delete Return
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteStoredPurchaseReturn(deleteTarget.id);
    toast.success(`Return record ${deleteTarget.returnNumber} deleted`);
    setDeleteTarget(null);
    setActiveActionId(null);
    loadData();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Return ID,Supplier,PO Ref,Return Date,Items,Amount,Status"];
    const rows = filteredReturns.map((r) => [
      `"${r.returnNumber}"`,
      `"${r.supplierName}"`,
      `"${r.purchaseInvoice}"`,
      `"${r.returnDate}"`,
      r.itemsCount || r.items.length || 1,
      r.totalRefundAmount,
      `"${r.refundStatus}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchase_returns_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Purchase Returns exported as CSV");
  };

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== 1. TOP HEADER (Exact Layout of Reference Image 2) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Purchase Return
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

          {/* + Add New Button (Matching Image 2: solid dark) */}
          <button
            onClick={() => {
              if (purchases.length > 0 && !selectedInvoice) {
                setSelectedInvoice(purchases[0].purchaseNumber);
              }
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* ===================== 2. MAIN TABLE CARD (Exact Layout of Reference Image 2) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
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

            {/* Date Range Selector matching Reference Image 2 */}
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition ${showFilterBar
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
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "default"
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
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "amount-desc"
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
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "amount-asc"
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
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "supplier-asc"
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
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "date-desc"
                      ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                      : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Date (Newest First)
                  </button>
                </div>
              )}
            </div>

            {/* Column layout */}
            <button
              title="Columns layout"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                loadData();
                setSearchQuery("");
                setStatusFilter("all");
                setSortBy("default");
                toast.success("Purchase returns refreshed");
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
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="text-indigo-600 dark:text-indigo-400 underline font-medium ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Table Content (Exact columns matching Reference Image 2) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3.5 px-4 w-32">Return ID</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">PO Ref</th>
                <th className="py-3.5 px-4">Return Date</th>
                <th className="py-3.5 px-4 w-20">Items</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 w-28">Status</th>
                <th className="py-3.5 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No purchase return records found.
                  </td>
                </tr>
              ) : (
                paginatedReturns.map((ret) => (
                  <tr
                    key={ret.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Return ID */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400">
                      <span className="font-mono">{ret.returnNumber}</span>
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ret.supplierName}
                        </span>
                      </div>
                    </td>

                    {/* PO Ref */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {ret.purchaseInvoice}
                    </td>

                    {/* Return Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {ret.returnDate}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                      {ret.itemsCount || ret.items.length || 1}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      {formatMoney(ret.totalRefundAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{renderStatusBadge(ret.refundStatus)}</td>

                    {/* Action Column (3-dots button ⋮ matching Image 2) */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className="relative inline-block text-left"
                        ref={activeActionId === ret.id ? actionMenuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setActiveActionId(
                              activeActionId === ret.id ? null : ret.id
                            )
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeActionId === ret.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30">
                            {/* View Note */}
                            <button
                              onClick={() => {
                                setViewingReturn(ret);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-500" />
                              View
                            </button>

                            {/* Print */}
                            <button
                              onClick={() => {
                                window.print();
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              Print
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                setDeleteTarget(ret);
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

        {/* Bottom Pagination Bar (Exact Layout of Reference Image 2) */}
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
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition ${currentPage === page
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

      {/* ===================== CREATE RETURN MODAL ===================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Add New Purchase Return
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Purchase / PO Ref <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                >
                  <option value="">Select PO Reference</option>
                  {purchases.map((p) => (
                    <option key={p.id} value={p.purchaseNumber}>
                      {p.purchaseNumber} - {p.supplierName} ({p.purchaseName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Return Date
                </label>
                <input
                  type="text"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              {returnItems.length > 0 && (
                <div className="bg-slate-50 dark:bg-[#12141c] p-3 rounded-md border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                    Item To Return
                  </span>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {returnItems[0].name}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          Return Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={returnItems[0].qty}
                          onChange={(e) => {
                            const q = Math.max(1, parseInt(e.target.value) || 1);
                            setReturnItems([
                              {
                                ...returnItems[0],
                                qty: q,
                                refundAmount: q * returnItems[0].unitPrice,
                              },
                            ]);
                          }}
                          className="w-full px-2 py-1.5 font-mono bg-white dark:bg-[#181b24] border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          Total Refund
                        </label>
                        <div className="px-2 py-1.5 font-mono font-bold text-rose-600 bg-white dark:bg-[#181b24] border border-slate-300 dark:border-slate-700 rounded-md">
                          {formatMoney(returnItems[0].refundAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Damaged during transit">Damaged during transit</option>
                  <option value="Defective or malfunctioning item">Defective or malfunctioning item</option>
                  <option value="Wrong item delivered by vendor">Wrong item delivered by vendor</option>
                  <option value="Excess inventory adjustment">Excess inventory adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={refundStatus}
                  onChange={(e) =>
                    setRefundStatus(
                      e.target.value as PurchaseReturnStatus
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Return Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Additional remarks..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Save Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== VIEW RETURN MODAL ===================== */}
      {viewingReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Return {viewingReturn.returnNumber}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  PO Ref: {viewingReturn.purchaseInvoice}
                </p>
              </div>
              <button
                onClick={() => setViewingReturn(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-mono font-semibold">{viewingReturn.returnDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-semibold">{viewingReturn.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <div>{renderStatusBadge(viewingReturn.refundStatus)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Refund:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {formatMoney(viewingReturn.totalRefundAmount)}
                </span>
              </div>

              {viewingReturn.notes && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#12141c] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold block text-[10px] text-slate-500 uppercase">Notes</span>
                  {viewingReturn.notes}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingReturn(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Delete Return Record?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete return {deleteTarget.returnNumber}?
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

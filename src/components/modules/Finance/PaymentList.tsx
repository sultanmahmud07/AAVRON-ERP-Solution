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
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calendar,
  X,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  DollarSign,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  PaymentRecord,
  PaymentStatus,
  PaymentMethodType,
  getStoredPayments,
  addStoredPayment,
  updateStoredPayment,
  deleteStoredPayment,
  COMMON_BANKS,
} from "./paymentStorage";

export default function PaymentList() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "default" | "amount-desc" | "amount-asc" | "payee-asc" | "date-desc"
  >("default");

  // UI state
  const [currencySymbol, setCurrencySymbol] = useState<"$" | "৳">("$");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [viewingPayment, setViewingPayment] = useState<PaymentRecord | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<PaymentRecord | null>(null);

  // Form State
  const [formPayee, setFormPayee] = useState("");
  const [formBank, setFormBank] = useState("Chase Bank");
  const [formMethod, setFormMethod] = useState<PaymentMethodType>("Bank Transfer");
  const [formAmount, setFormAmount] = useState("22500");
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    return `${today.getDate()} ${today.toLocaleString("en-US", { month: "short" })} ${today.getFullYear()}`;
  });
  const [formStatus, setFormStatus] = useState<PaymentStatus>("Completed");
  const [formRefNo, setFormRefNo] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const actionMenuRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setPayments(getStoredPayments());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_finance_payments_updated", handleUpdate);
    return () => window.removeEventListener("nexora_finance_payments_updated", handleUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActiveActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.paymentId.toLowerCase().includes(q) ||
        p.payee.toLowerCase().includes(q) ||
        p.bank.toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q) ||
        (p.referenceNo && p.referenceNo.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (methodFilter !== "all" && p.paymentMethod !== methodFilter) return false;
      if (bankFilter !== "all" && p.bank !== bankFilter) return false;
      return true;
    });
  }, [payments, searchQuery, statusFilter, methodFilter, bankFilter]);

  // Sorted Payments
  const sortedPayments = useMemo(() => {
    const copy = [...filteredPayments];
    if (sortBy === "amount-desc") copy.sort((a, b) => b.amount - a.amount);
    else if (sortBy === "amount-asc") copy.sort((a, b) => a.amount - b.amount);
    else if (sortBy === "payee-asc") copy.sort((a, b) => a.payee.localeCompare(b.payee));
    else if (sortBy === "date-desc") copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return copy;
  }, [filteredPayments, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPayments.slice(start, start + pageSize);
  }, [sortedPayments, currentPage, pageSize]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingPayment(null);
    setFormPayee("");
    setFormBank(COMMON_BANKS[0]);
    setFormMethod("Bank Transfer");
    setFormAmount("");
    const today = new Date();
    setFormDate(`${today.getDate()} ${today.toLocaleString("en-US", { month: "short" })} ${today.getFullYear()}`);
    setFormStatus("Completed");
    setFormRefNo(`TRX-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormNotes("");
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (p: PaymentRecord) => {
    setEditingPayment(p);
    setFormPayee(p.payee);
    setFormBank(p.bank);
    setFormMethod(p.paymentMethod);
    setFormAmount(p.amount.toString());
    setFormDate(p.date);
    setFormStatus(p.status);
    setFormRefNo(p.referenceNo || "");
    setFormNotes(p.notes || "");
    setIsAddModalOpen(true);
    setActiveActionId(null);
  };

  // Save Add/Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPayee.trim()) {
      toast.error("Please enter a payee name.");
      return;
    }
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (editingPayment) {
      updateStoredPayment(editingPayment.id, {
        payee: formPayee,
        bank: formBank,
        paymentMethod: formMethod,
        amount: amt,
        date: formDate,
        status: formStatus,
        referenceNo: formRefNo,
        notes: formNotes,
      });
      toast.success(`Payment ${editingPayment.paymentId} updated.`);
    } else {
      const created = addStoredPayment({
        payee: formPayee,
        bank: formBank,
        paymentMethod: formMethod,
        amount: amt,
        date: formDate,
        status: formStatus,
        referenceNo: formRefNo,
        notes: formNotes,
      });
      toast.success(`Payment ${created.paymentId} recorded.`);
    }
    setIsAddModalOpen(false);
  };

  // Status Change
  const handleStatusChange = (p: PaymentRecord, nextStatus: PaymentStatus) => {
    updateStoredPayment(p.id, { status: nextStatus });
    toast.success(`Payment ${p.paymentId} marked as ${nextStatus}.`);
    setActiveActionId(null);
  };

  // Delete
  const handleConfirmDelete = () => {
    if (!deletingPayment) return;
    deleteStoredPayment(deletingPayment.id);
    toast.success(`Payment ${deletingPayment.paymentId} deleted.`);
    setDeletingPayment(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Payment ID", "Payee", "Bank", "Payment Method", "Amount", "Date", "Status"];
    const rows = sortedPayments.map((p) => [
      `"${p.paymentId}"`,
      `"${p.payee}"`,
      `"${p.bank}"`,
      `"${p.paymentMethod}"`,
      p.amount,
      `"${p.date}"`,
      `"${p.status}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Payments_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Payments exported as CSV.");
  };

  const fmt = (val: number) => {
    return `${currencySymbol}${val.toLocaleString()}`;
  };

  const renderStatusBadge = (status: PaymentStatus) => {
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
          Completed
        </span>
      );
    }
    if (status === "Pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shadow-2xs">
        Failed
      </span>
    );
  };

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== 1. TOP HEADER (Exact Image 1 Layout) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Payments
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Currency Toggle */}
          <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrencySymbol("$")}
              className={`px-2 py-1 rounded font-bold text-[11px] transition ${currencySymbol === "$"
                ? "bg-[#0c6760] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrencySymbol("৳")}
              className={`px-2 py-1 rounded font-bold text-[11px] transition ${currencySymbol === "৳"
                ? "bg-[#0c6760] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              BDT (৳)
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transform transition-transform ${isExportOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                >
                  Export as CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          {/* + Add New Button (Matching Image 1: solid dark) */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* ===================== 2. MAIN TABLE CARD (Exact Image 1 Layout) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Top Controls Bar */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search Box & Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search"
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400/50"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="w-full sm:w-auto flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{dateRange}</span>
              </button>
              {isDateOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 p-2 z-30 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100">
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
                      type="button"
                      onClick={() => {
                        setDateRange(range);
                        setIsDateOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Filter & Sort By */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition cursor-pointer ${showFilterBar
                ? "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort By</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("default");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("amount-desc");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  >
                    Amount: High to Low
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("amount-asc");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  >
                    Amount: Low to High
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("payee-asc");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  >
                    Payee: A to Z
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setMethodFilter("all");
                setBankFilter("all");
                setSortBy("default");
                setCurrentPage(1);
                toast.info("Payments filters reset.");
              }}
              title="Reset table"
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilterBar && (
          <div className="bg-slate-50/80 dark:bg-[#12141c]/60 p-3.5 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Methods</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Bank
              </label>
              <select
                value={bankFilter}
                onChange={(e) => {
                  setBankFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Banks</option>
                {COMMON_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ===================== TABLE ===================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Payment ID
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Payee
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Bank
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Payment Method
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Amount
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Date
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200 text-center">
                  Status
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200 text-center w-16">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No payments found</p>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Payment ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {item.paymentId}
                    </td>

                    {/* Payee */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.payee}
                    </td>

                    {/* Bank */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {item.bank}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {item.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900 dark:text-white">
                      {fmt(item.amount)}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {item.date}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionId(
                              activeActionId === item.id ? null : item.id
                            );
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeActionId === item.id && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-left text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setViewingPayment(item);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-500" />
                              <span>View Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-500" />
                              <span>Edit Payment</span>
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Change Status
                            </div>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(item, "Completed")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Completed</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(item, "Pending")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Mark Pending</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(item, "Failed")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Mark Failed</span>
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingPayment(item);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
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

        {/* ===================== 3. BOTTOM PAGINATION ===================== */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10 / Pages</option>
              <option value={20}>20 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded-md font-semibold text-xs transition cursor-pointer ${currentPage === pageNum
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== 4. ADD / EDIT PAYMENT MODAL ===================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#0c6760]" />
                {editingPayment ? `Edit Payment ${editingPayment.paymentId}` : "Record Payment"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payee / Vendor <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formPayee}
                  onChange={(e) => setFormPayee(e.target.value)}
                  placeholder="e.g. Alpha Supplies Inc"
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bank
                  </label>
                  <select
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    {COMMON_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethodType)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="22500"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="11 Sep 2025"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reference / TRX No
                  </label>
                  <input
                    type="text"
                    value={formRefNo}
                    onChange={(e) => setFormRefNo(e.target.value)}
                    placeholder="TRX-CHASE-9921"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional payment notes..."
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-md bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs cursor-pointer"
                >
                  {editingPayment ? "Update Payment" : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== 5. VIEW PAYMENT RECEIPT MODAL ===================== */}
      {viewingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0c6760]" />
                Payment Voucher
              </h3>
              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Payment ID</span>
                  <p className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {viewingPayment.paymentId}
                  </p>
                </div>
                <div>{renderStatusBadge(viewingPayment.status)}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-500">Payee:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingPayment.payee}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-500">Bank:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{viewingPayment.bank}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{viewingPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{viewingPayment.date}</span>
                </div>
                {viewingPayment.referenceNo && (
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500">Reference:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{viewingPayment.referenceNo}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-sm font-black">
                  <span>Total Amount:</span>
                  <span className="font-mono text-[#0c6760] dark:text-teal-400">{fmt(viewingPayment.amount)}</span>
                </div>
              </div>

              {viewingPayment.notes && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#12141c] text-[11px] text-slate-500 dark:text-slate-400">
                  {viewingPayment.notes}
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-[#12141c]/50">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Print Slip
              </button>
              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 6. DELETE CONFIRMATION ===================== */}
      {deletingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Delete Payment Record?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete payment{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                {deletingPayment.paymentId}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {deletingPayment.payee}
              </strong>
              ?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingPayment(null)}
                className="px-4 py-2 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
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

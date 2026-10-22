import React, { useState, useEffect, useMemo, useRef } from "react";
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
  ChevronDown,
  Calendar,
  X,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  FileText,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  RefundRecord,
  RefundStatus,
  PaymentMethod,
  RefundItem,
  getStoredRefunds,
  addStoredRefund,
  updateStoredRefund,
  deleteStoredRefund,
  COMMON_RETURN_REASONS,
} from "./refundStorage";
import { getStoredCustomers } from "../Customer/customerStorage";
import { getStoredSalesOrders } from "../SalesOrder/salesOrderStorage";

export default function RefundList() {
  // Stored state
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "default" | "amount-desc" | "amount-asc" | "customer-asc" | "date-desc" | "date-asc"
  >("default");

  // UI state
  const [currencySymbol, setCurrencySymbol] = useState<"$" | "৳">("$");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRefund, setEditingRefund] = useState<RefundRecord | null>(null);
  const [viewingRefund, setViewingRefund] = useState<RefundRecord | null>(null);
  const [deletingRefund, setDeletingRefund] = useState<RefundRecord | null>(null);

  // Form State for Add / Edit
  const [formCustomer, setFormCustomer] = useState("");
  const [formInvoiceRef, setFormInvoiceRef] = useState("");
  const [formRefundDate, setFormRefundDate] = useState(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString("en-US", { month: "short" });
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
  });
  const [formAmount, setFormAmount] = useState<string>("320");
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>("Cash");
  const [formStatus, setFormStatus] = useState<RefundStatus>("Completed");
  const [formReturnReason, setFormReturnReason] = useState<string>("Defective product on delivery");
  const [formCustomReason, setFormCustomReason] = useState<string>("");
  const [formTransactionId, setFormTransactionId] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formItems, setFormItems] = useState<RefundItem[]>([
    {
      id: "item-1",
      name: "VoltX Fast Charger 65W",
      qty: 1,
      unitPrice: 160,
      refundAmount: 160,
      returnReason: "Defective product on delivery",
      condition: "Damaged",
    },
  ]);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load data & subscribe to events
  const loadData = () => {
    setRefunds(getStoredRefunds());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_sales_refunds_updated", handleUpdate);
    return () => window.removeEventListener("nexora_sales_refunds_updated", handleUpdate);
  }, []);

  // Close dropdowns on outside click
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

  // Customer suggestions
  const availableCustomers = useMemo(() => {
    return getStoredCustomers();
  }, []);

  // Sales Orders suggestions
  const availableSalesOrders = useMemo(() => {
    return getStoredSalesOrders();
  }, []);

  // Filtered and Sorted Refunds
  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.refundId.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.invoiceRef.toLowerCase().includes(q) ||
        r.paymentMethod.toLowerCase().includes(q) ||
        r.returnReason.toLowerCase().includes(q) ||
        (r.transactionId && r.transactionId.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (paymentMethodFilter !== "all" && r.paymentMethod !== paymentMethodFilter) return false;
      if (reasonFilter !== "all" && !r.returnReason.toLowerCase().includes(reasonFilter.toLowerCase())) return false;

      return true;
    });
  }, [refunds, searchQuery, statusFilter, paymentMethodFilter, reasonFilter]);

  const sortedRefunds = useMemo(() => {
    const copy = [...filteredRefunds];
    if (sortBy === "amount-desc") {
      copy.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "amount-asc") {
      copy.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === "customer-asc") {
      copy.sort((a, b) => a.customer.localeCompare(b.customer));
    } else if (sortBy === "date-desc") {
      copy.sort((a, b) => new Date(b.createdAt || b.refundDate).getTime() - new Date(a.createdAt || a.refundDate).getTime());
    } else if (sortBy === "date-asc") {
      copy.sort((a, b) => new Date(a.createdAt || a.refundDate).getTime() - new Date(b.createdAt || b.refundDate).getTime());
    }
    return copy;
  }, [filteredRefunds, sortBy]);

  // Paginated Refunds
  const totalPages = Math.ceil(sortedRefunds.length / pageSize) || 1;
  const currentRefunds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRefunds.slice(start, start + pageSize);
  }, [sortedRefunds, currentPage, pageSize]);

  // Open Add modal with defaults
  const handleOpenAddModal = () => {
    setEditingRefund(null);
    setFormCustomer("Alexander Kenn");
    setFormInvoiceRef("#INV0020");
    const today = new Date();
    setFormRefundDate(`${today.getDate()} ${today.toLocaleString("en-US", { month: "short" })} ${today.getFullYear()}`);
    setFormAmount("320");
    setFormPaymentMethod("Cash");
    setFormStatus("Completed");
    setFormReturnReason(COMMON_RETURN_REASONS[0]);
    setFormCustomReason("");
    setFormTransactionId("TXN-" + Math.floor(1000 + Math.random() * 9000));
    setFormNotes("");
    setFormItems([
      {
        id: "rfi-" + Date.now(),
        name: "VoltX Fast Charger 65W",
        qty: 1,
        unitPrice: 160,
        refundAmount: 160,
        returnReason: "Defective product on delivery",
        condition: "Damaged",
      },
    ]);
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (r: RefundRecord) => {
    setEditingRefund(r);
    setFormCustomer(r.customer);
    setFormInvoiceRef(r.invoiceRef);
    setFormRefundDate(r.refundDate);
    setFormAmount(r.amount.toString());
    setFormPaymentMethod(r.paymentMethod);
    setFormStatus(r.status);
    setFormReturnReason(r.returnReason);
    setFormCustomReason("");
    setFormTransactionId(r.transactionId || "");
    setFormNotes(r.notes || "");
    setFormItems(
      r.items && r.items.length > 0
        ? r.items
        : [
          {
            id: "item-default",
            name: "General Merchandise Return",
            qty: 1,
            unitPrice: r.amount,
            refundAmount: r.amount,
            returnReason: r.returnReason,
            condition: "Resalable",
          },
        ]
    );
    setIsAddModalOpen(true);
    setActiveActionId(null);
  };

  // Save Add or Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCustomer.trim()) {
      toast.error("Please enter or select a customer name");
      return;
    }
    if (!formInvoiceRef.trim()) {
      toast.error("Please enter an invoice reference (e.g. #INV0020)");
      return;
    }
    const parsedAmount = parseFloat(formAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    const finalReason = formReturnReason === "Other" && formCustomReason.trim()
      ? formCustomReason.trim()
      : formReturnReason;

    if (editingRefund) {
      updateStoredRefund(editingRefund.id, {
        customer: formCustomer,
        invoiceRef: formInvoiceRef.startsWith("#") ? formInvoiceRef : `#${formInvoiceRef}`,
        refundDate: formRefundDate,
        amount: parsedAmount,
        paymentMethod: formPaymentMethod,
        status: formStatus,
        returnReason: finalReason,
        transactionId: formTransactionId,
        notes: formNotes,
        items: formItems,
      });
      toast.success(`Refund ${editingRefund.refundId} updated successfully.`);
    } else {
      const newRef = addStoredRefund({
        customer: formCustomer,
        invoiceRef: formInvoiceRef,
        refundDate: formRefundDate,
        amount: parsedAmount,
        paymentMethod: formPaymentMethod,
        status: formStatus,
        returnReason: finalReason,
        transactionId: formTransactionId,
        notes: formNotes,
        items: formItems,
      });
      toast.success(`Refund ${newRef.refundId} created successfully.`);
    }

    setIsAddModalOpen(false);
  };

  // Quick Status Change
  const handleStatusChange = (refund: RefundRecord, nextStatus: RefundStatus) => {
    updateStoredRefund(refund.id, { status: nextStatus });
    toast.success(`Refund ${refund.refundId} status marked as ${nextStatus}.`);
    setActiveActionId(null);
  };

  // Delete Refund
  const handleConfirmDelete = () => {
    if (!deletingRefund) return;
    deleteStoredRefund(deletingRefund.id);
    toast.success(`Refund ${deletingRefund.refundId} deleted successfully.`);
    setDeletingRefund(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Refund ID",
      "Customer",
      "Invoice Ref",
      "Refund Date",
      "Amount",
      "Payment Method",
      "Return Reason",
      "Status",
    ];

    const rows = sortedRefunds.map((r) => [
      `"${r.refundId}"`,
      `"${r.customer}"`,
      `"${r.invoiceRef}"`,
      `"${r.refundDate}"`,
      `"${r.amount}"`,
      `"${r.paymentMethod}"`,
      `"${r.returnReason.replace(/"/g, '""')}"`,
      `"${r.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Refunds_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Refunds exported as CSV successfully.");
  };

  // Currency Formatter
  const formatAmount = (val: number) => {
    return `${currencySymbol}${val.toLocaleString()}`;
  };

  // Status Badge Helper matching reference image
  const renderStatusBadge = (status: RefundStatus) => {
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
          Completed
        </span>
      );
    }
    if (status === "Pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shadow-2xs">
        Rejected
      </span>
    );
  };

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== 1. TOP HEADER (Exact Layout of Reference Image) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Refunds
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
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
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
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                >
                  Export as CSV
                </button>
                <button
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

          {/* + Add New Button (Matching reference image: solid dark styling) */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* ===================== 2. MAIN TABLE CARD (Exact Reference Layout) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Top Controls Bar (Search + Date Range + Filter + Sort + Density + Refresh) */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search Box & Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
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

            {/* Date Range Selector matching reference image */}
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

          {/* Right: Filter, Sort By, Layout icon, Refresh */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Toggle */}
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

            {/* Sort By Dropdown */}
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
                    className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${sortBy === "default"
                      ? "text-[#0c6760] font-bold bg-teal-50/50 dark:bg-teal-950/30"
                      : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("amount-desc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${sortBy === "amount-desc"
                      ? "text-[#0c6760] font-bold bg-teal-50/50 dark:bg-teal-950/30"
                      : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Amount: High to Low
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("amount-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${sortBy === "amount-asc"
                      ? "text-[#0c6760] font-bold bg-teal-50/50 dark:bg-teal-950/30"
                      : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Amount: Low to High
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("customer-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${sortBy === "customer-asc"
                      ? "text-[#0c6760] font-bold bg-teal-50/50 dark:bg-teal-950/30"
                      : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Customer: A to Z
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("date-desc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${sortBy === "date-desc"
                      ? "text-[#0c6760] font-bold bg-teal-50/50 dark:bg-teal-950/30"
                      : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Date: Newest First
                  </button>
                </div>
              )}
            </div>

            {/* Density / Column icon */}
            <button
              type="button"
              title="Column layout"
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md transition cursor-pointer"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>

            {/* Refresh / Reset Filters Button */}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPaymentMethodFilter("all");
                setReasonFilter("all");
                setSortBy("default");
                setCurrentPage(1);
                toast.info("Filters reset to default.");
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
                className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => {
                  setPaymentMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="all">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Debit Card">Debit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Return Reason
              </label>
              <select
                value={reasonFilter}
                onChange={(e) => {
                  setReasonFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="all">All Return Reasons</option>
                <option value="Defective">Defective product</option>
                <option value="Wrong size">Wrong size / color</option>
                <option value="broken seal">Broken seal / transit</option>
                <option value="expired">Expired window</option>
                <option value="cancelled">Customer cancelled</option>
                <option value="overheating">Overheating</option>
                <option value="Duplicate">Duplicate order</option>
                <option value="missing">Accessories missing</option>
                <option value="misuse">Customer damage</option>
                <option value="Unopened">Unopened package</option>
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
                  Refund ID
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Customer
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Invoice Ref
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Refund Date
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Amount
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">
                  Payment Method
                </th>
                <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200 min-w-[180px]">
                  Return Reason
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
              {currentRefunds.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-semibold">No refunds found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search criteria or add a new refund.
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0c6760] text-white hover:bg-[#09544e] transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Refund</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRefunds.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Refund ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {item.refundId}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.customer}
                    </td>

                    {/* Invoice Ref */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {item.invoiceRef}
                    </td>

                    {/* Refund Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {item.refundDate}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900 dark:text-white">
                      {formatAmount(item.amount)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {item.paymentMethod}
                    </td>

                    {/* Return Reason */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5" title={item.returnReason}>
                        <span className="truncate max-w-[200px] text-slate-600 dark:text-slate-400 text-xs">
                          {item.returnReason}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Action Dropdown Menu matching three dots in reference image */}
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

                        {/* Action Menu Popover */}
                        {activeActionId === item.id && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-left text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setViewingRefund(item);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-500" />
                              <span>View Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-500" />
                              <span>Edit Refund</span>
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
                              onClick={() => handleStatusChange(item, "Rejected")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Mark Rejected</span>
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingRefund(item);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Refund</span>
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

        {/* ===================== 3. BOTTOM PAGINATION (Exact Reference Layout) ===================== */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          {/* Showing 10 / Pages dropdown matching reference image */}
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

          {/* Pagination Controls [1] 2 3 < > */}
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
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== 4. ADD / EDIT REFUND MODAL ===================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#181b24]/95 backdrop-blur-sm z-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#0c6760]" />
                {editingRefund ? `Edit Refund ${editingRefund.refundId}` : "Record Customer Refund / Return"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="customer-suggestions"
                      required
                      value={formCustomer}
                      onChange={(e) => setFormCustomer(e.target.value)}
                      placeholder="e.g. Alexander Kenn"
                      className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    />
                    <datalist id="customer-suggestions">
                      {availableCustomers.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Invoice Ref */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Reference <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="invoice-suggestions"
                      required
                      value={formInvoiceRef}
                      onChange={(e) => setFormInvoiceRef(e.target.value)}
                      placeholder="e.g. #INV0020"
                      className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    />
                    <datalist id="invoice-suggestions">
                      {availableSalesOrders.map((so) => (
                        <option key={so.id} value={`#${so.invoiceNumber || so.orderNumber}`}>
                          {so.customer} - ${so.totalAmount}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Refund Date */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Refund Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formRefundDate}
                    onChange={(e) => setFormRefundDate(e.target.value)}
                    placeholder="e.g. 11 Sep 2025"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Refund Amount ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="320.00"
                      className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as RefundStatus)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Return Reason Field (Requested feature) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Return Reason <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Select standard policy reason or customize
                  </span>
                </label>
                <select
                  value={formReturnReason}
                  onChange={(e) => setFormReturnReason(e.target.value)}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] mb-2"
                >
                  {COMMON_RETURN_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                  <option value="Other">Other / Custom Reason</option>
                </select>

                {formReturnReason === "Other" && (
                  <input
                    type="text"
                    required
                    value={formCustomReason}
                    onChange={(e) => setFormCustomReason(e.target.value)}
                    placeholder="Enter detailed reason for return..."
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                )}
              </div>

              {/* Returned Line Item */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                    Returned Product Details
                  </span>
                  <span className="text-[10px] text-slate-400">Inventory update</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Product name"
                      value={formItems[0]?.name || ""}
                      onChange={(e) => {
                        const updated = [...formItems];
                        if (updated[0]) updated[0].name = e.target.value;
                        setFormItems(updated);
                      }}
                      className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={formItems[0]?.qty || 1}
                      onChange={(e) => {
                        const updated = [...formItems];
                        if (updated[0]) {
                          const q = parseInt(e.target.value) || 1;
                          updated[0].qty = q;
                          updated[0].refundAmount = q * updated[0].unitPrice;
                        }
                        setFormItems(updated);
                      }}
                      className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={formItems[0]?.condition || "Damaged"}
                      onChange={(e) => {
                        const updated = [...formItems];
                        if (updated[0]) {
                          updated[0].condition = e.target.value as "Resalable" | "Damaged" | "Scrapped" | "Opened";
                        }
                        setFormItems(updated);
                      }}
                      className="w-full bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="Damaged">Damaged / Defective</option>
                      <option value="Resalable">Resalable / Restock</option>
                      <option value="Opened">Opened Box</option>
                      <option value="Scrapped">Scrapped / Write-off</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transaction ID & Internal Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction / Gateway Ref
                  </label>
                  <input
                    type="text"
                    value={formTransactionId}
                    onChange={(e) => setFormTransactionId(e.target.value)}
                    placeholder="e.g. TXN-CSH-9021"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Internal Note / Approval
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Approved by store manager"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-md bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition cursor-pointer"
                >
                  {editingRefund ? "Update Refund" : "Save Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== 5. VIEW DETAILS / RECEIPT MODAL ===================== */}
      {viewingRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0c6760]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Refund Receipt & Voucher
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingRefund(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Refund ID
                  </span>
                  <p className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {viewingRefund.refundId}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Status
                  </span>
                  <div className="mt-0.5">{renderStatusBadge(viewingRefund.status)}</div>
                </div>
              </div>

              {/* Customer & Invoice Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Customer Name
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {viewingRefund.customer}
                  </p>
                  {viewingRefund.customerPhone && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      {viewingRefund.customerPhone}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Original Invoice Ref
                  </span>
                  <p className="font-bold font-mono text-[#0c6760] dark:text-teal-400 mt-0.5">
                    {viewingRefund.invoiceRef}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Issued: {viewingRefund.refundDate}
                  </p>
                </div>
              </div>

              {/* Return Reason Box */}
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-md space-y-1">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Return Reason
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {viewingRefund.returnReason}
                </p>
              </div>

              {/* Items Breakdown */}
              {viewingRefund.items && viewingRefund.items.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">
                    Returned Items
                  </span>
                  <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-[#12141c] text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Item</th>
                          <th className="py-2 px-3 text-center">Qty</th>
                          <th className="py-2 px-3 text-center">Condition</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {viewingRefund.items.map((it) => (
                          <tr key={it.id}>
                            <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {it.name}
                            </td>
                            <td className="py-2 px-3 text-center">{it.qty}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {it.condition || "Inspected"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              {formatAmount(it.refundAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Financial Totals */}
              <div className="bg-slate-50 dark:bg-[#12141c] p-3.5 rounded-md border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payment Method:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingRefund.paymentMethod}
                  </span>
                </div>
                {viewingRefund.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {viewingRefund.transactionId}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-black">
                  <span className="text-slate-900 dark:text-white">Total Refunded:</span>
                  <span className="text-lg font-black font-mono text-[#0c6760] dark:text-teal-400">
                    {formatAmount(viewingRefund.amount)}
                  </span>
                </div>
              </div>

              {viewingRefund.notes && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Note: {viewingRefund.notes}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#12141c]/40">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingRefund(null)}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 6. DELETE CONFIRMATION MODAL ===================== */}
      {deletingRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Delete Refund Record?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete refund{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                {deletingRefund.refundId}
              </strong>{" "}
              for{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {deletingRefund.customer}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingRefund(null)}
                className="px-4 py-2 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer"
              >
                Delete Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  X,
  Eye,
  Undo2,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  SalesOrder,
  SalesOrderStatus,
  PaymentStatus,
  getStoredSalesOrders,
  addStoredSalesOrder,
  updateStoredSalesOrder,
  deleteStoredSalesOrder,
  processReturnSalesOrder,
} from "./salesOrderStorage";

export default function SalesOrderList() {
  const navigate = useNavigate();

  // Orders State
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "default" | "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "customer-asc"
  >("default");

  // UI state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesOrder | null>(null);

  // Modal Form Inputs
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );
  const [deliveryDate, setDeliveryDate] = useState("28 Oct 2026");
  const [paymentMethod, setPaymentMethod] = useState<
    "Credit Card" | "Cash" | "Bank Transfer" | "Mobile Pay" | "PayPal"
  >("Credit Card");
  const [reference, setReference] = useState("For Purchase");
  const [orderStatus, setOrderStatus] = useState<SalesOrderStatus>("Delivered");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Paid");

  // Line Items in modal
  const [lineItems, setLineItems] = useState<
    { description: string; model: string; qty: number; rate: number }[]
  >([{ description: "VoltX Charger", model: "VX-CH-01", qty: 1, rate: 1000 }]);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load orders
  const loadOrders = () => {
    const list = getStoredSalesOrders();
    setOrders(list);
  };

  useEffect(() => {
    loadOrders();
    const handleStorageUpdate = () => loadOrders();
    window.addEventListener("nexora_sales_orders_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("nexora_sales_orders_updated", handleStorageUpdate);
    };
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setActiveActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Summary Metrics calculations (from 1st image)
  const summaryMetrics = useMemo(() => {
    const totalCount = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const paidOrders = orders.filter((o) => o.paymentStatus === "Paid");
    const paidAmount = paidOrders.reduce((sum, o) => sum + o.paidAmount, 0);

    const unpaidOrders = orders.filter((o) => o.paymentStatus === "Unpaid");
    const unpaidAmount = unpaidOrders.reduce((sum, o) => sum + (o.dueAmount || o.totalAmount), 0);

    const partialOrders = orders.filter(
      (o) => o.paymentStatus === "Partial" || (o.dueAmount > 0 && o.paidAmount > 0)
    );
    const partialAmount = partialOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalCount,
      totalAmount,
      paidCount: paidOrders.length,
      paidAmount,
      unpaidCount: unpaidOrders.length,
      unpaidAmount,
      partialCount: partialOrders.length,
      partialAmount,
    };
  }, [orders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          (order.invoiceNumber && order.invoiceNumber.toLowerCase().includes(query)) ||
          order.customerEmail.toLowerCase().includes(query) ||
          order.customerPhone.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesPayment =
          paymentFilter === "all" ||
          order.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

        return matchesQuery && matchesStatus && matchesPayment;
      })
      .sort((a, b) => {
        if (sortBy === "amount-desc") return b.totalAmount - a.totalAmount;
        if (sortBy === "amount-asc") return a.totalAmount - b.totalAmount;
        if (sortBy === "customer-asc") return a.customer.localeCompare(b.customer);
        if (sortBy === "date-desc")
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        if (sortBy === "date-asc")
          return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
        return 0; // default preserving ID descending
      });
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingOrder(null);
    setCustomerName("");
    setCustomerCompany("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setOrderDate(
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
    setDeliveryDate("28 Oct 2026");
    setPaymentMethod("Credit Card");
    setReference("For Purchase");
    setOrderStatus("Delivered");
    setPaymentStatus("Paid");
    setLineItems([{ description: "VoltX Charger", model: "VX-CH-01", qty: 1, rate: 1000 }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order: SalesOrder) => {
    setEditingOrder(order);
    setCustomerName(order.customer);
    setCustomerCompany(order.customerCompany || "");
    setCustomerEmail(order.customerEmail);
    setCustomerPhone(order.customerPhone);
    setCustomerAddress(order.customerAddress || "");
    setOrderDate(order.orderDate);
    setDeliveryDate(order.deliveryDate);
    setPaymentMethod(order.paymentMethod);
    setReference(order.reference);
    setOrderStatus(order.status);
    setPaymentStatus(order.paymentStatus);
    setLineItems(
      order.items.length > 0
        ? order.items.map((i) => ({
            description: i.description,
            model: i.model || "",
            qty: i.qty,
            rate: i.rate,
          }))
        : [{ description: "General Item", model: "GEN-01", qty: 1, rate: order.totalAmount }]
    );
    setIsModalOpen(true);
    setActiveActionId(null);
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "Product Item", model: "PROD-01", qty: 1, rate: 500 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    const calculatedSubtotal = lineItems.reduce((acc, curr) => acc + curr.qty * curr.rate, 0);

    const items = lineItems.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      description: item.description,
      model: item.model,
      qty: Number(item.qty),
      rate: Number(item.rate),
      discount: 0,
      vat: 0,
      total: Number(item.qty) * Number(item.rate),
    }));

    if (editingOrder) {
      updateStoredSalesOrder(editingOrder.id, {
        customer: customerName.trim(),
        customerCompany: customerCompany.trim() || undefined,
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim() || undefined,
        orderDate,
        deliveryDate,
        paymentMethod,
        reference,
        status: orderStatus,
        paymentStatus,
        subtotal: calculatedSubtotal,
        discount: 0,
        tax: 0,
        paidAmount: paymentStatus === "Paid" ? calculatedSubtotal : paymentStatus === "Unpaid" ? 0 : calculatedSubtotal / 2,
        items,
      });
      toast.success(`Sales Order "${editingOrder.orderNumber}" updated successfully`);
    } else {
      const newOrder = addStoredSalesOrder({
        customer: customerName.trim(),
        customerCompany: customerCompany.trim() || undefined,
        customerEmail: customerEmail.trim() || "customer@example.com",
        customerPhone: customerPhone.trim() || "+1 (555) 000-0000",
        customerAddress: customerAddress.trim() || "Business District",
        customerCountry: "United States",
        orderDate,
        deliveryDate,
        paymentMethod,
        reference,
        status: orderStatus,
        paymentStatus,
        subtotal: calculatedSubtotal,
        discount: 0,
        tax: 0,
        paidAmount: paymentStatus === "Paid" ? calculatedSubtotal : paymentStatus === "Unpaid" ? 0 : calculatedSubtotal / 2,
        items,
        notes: "Direct sale created via ERP.",
      });
      toast.success(`Sales Order "${newOrder.orderNumber}" created successfully`);
    }

    setIsModalOpen(false);
    setEditingOrder(null);
    loadOrders();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredSalesOrder(deleteTarget.id);
    toast.success(`Order "${deleteTarget.orderNumber}" deleted successfully`);
    setDeleteTarget(null);
    setActiveActionId(null);
    loadOrders();
  };

  const handleProcessReturn = (order: SalesOrder) => {
    processReturnSalesOrder(order.id);
    toast.success(`Order "${order.orderNumber}" marked as Returned`);
    setActiveActionId(null);
    loadOrders();
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      "Order ID,Customer,Order Date,Delivery Date,Items,Amount,Status,Payment Status",
    ];
    const rows = filteredOrders.map((o) =>
      [
        `"${o.orderNumber}"`,
        `"${o.customer}"`,
        `"${o.orderDate}"`,
        `"${o.deliveryDate}"`,
        o.items.length || 1,
        o.totalAmount,
        `"${o.status}"`,
        `"${o.paymentStatus}"`,
      ].join(",")
    );
    const blob = new Blob([headers.concat(rows).join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `sales_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Exported Sales Orders as CSV");
  };

  const renderStatusBadge = (status: SalesOrderStatus) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400">
            Delivered
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            Processing
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
            Shipped
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            Cancelled
          </span>
        );
      case "Returned":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
            Returned
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

  return (
    <div className="w-full space-y-4">
      {/* 1. Header with Page Title and Action Buttons (Matching Image 3) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sales Orders
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Export
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

          {/* + Add New Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards (Information from Image 1 styled to match Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Invoices
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {summaryMetrics.totalCount}
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
              ${summaryMetrics.totalAmount.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Paid Invoices
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {summaryMetrics.paidCount}
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              ${summaryMetrics.paidAmount.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Unpaid Invoices */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Unpaid Invoices
            </span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {summaryMetrics.unpaidCount}
            </div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
              ${summaryMetrics.unpaidAmount.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Partial Paid Invoices */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Partial Paid Invoices
            </span>
            <div className="text-2xl font-bold text-amber-500 dark:text-amber-400 mt-1">
              {summaryMetrics.partialCount}
            </div>
            <div className="text-xs font-semibold text-amber-500 dark:text-amber-400 mt-1">
              ${summaryMetrics.partialAmount.toLocaleString()}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Table Card (Exact Styling of Image 3) */}
      <div className="bg-white dark:bg-[#181b24] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search Box & Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search"
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400/50"
              />
            </div>

            {/* Date Range Selector matching Reference Image 3 */}
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
              Filter
            </button>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort By
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
                      setSortBy("customer-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "customer-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Customer (A - Z)
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

            {/* Column view */}
            <button
              title="Columns layout"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                loadOrders();
                setSearchQuery("");
                setStatusFilter("all");
                setPaymentFilter("all");
                setSortBy("default");
                toast.success("Sales Orders list refreshed");
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
                <option value="Delivered">Delivered</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
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
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            {(statusFilter !== "all" || paymentFilter !== "all") && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Table Content (Columns & layout matching Image 3) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3 px-4 w-28">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4 w-20">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No sales orders found. Try adjusting your search or add a new order.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400">
                      <Link
                        to={`/sales/orders/${order.orderNumber.replace("#", "")}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 font-mono transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {order.customer}
                        </span>
                        {order.customerPhone && (
                          <span className="text-[11px] text-slate-400 hidden md:inline">
                            • {order.customerPhone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Order Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {order.orderDate}
                    </td>

                    {/* Delivery Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {order.deliveryDate}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                      {order.items.length || 1}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      ${order.totalAmount.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{renderStatusBadge(order.status)}</td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className="relative inline-block text-left"
                        ref={activeActionId === order.id ? actionMenuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setActiveActionId(
                              activeActionId === order.id ? null : order.id
                            )
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Action Menu Popup (Integrating features from Image 1 & Image 3) */}
                        {activeActionId === order.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30">
                            {/* View / Preview */}
                            <button
                              onClick={() => {
                                navigate(`/sales/orders/${order.orderNumber.replace("#", "")}`);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-500" />
                              View
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditModal(order)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              Edit
                            </button>

                            {/* Process Exchange */}
                            <button
                              onClick={() => {
                                toast.success(
                                  `Exchange initiated for order "${order.orderNumber}"`
                                );
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                              Process exchange
                            </button>

                            {/* Return */}
                            <button
                              onClick={() => handleProcessReturn(order)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Undo2 className="w-3.5 h-3.5 text-orange-500" />
                              Return
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                setDeleteTarget(order);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
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

        {/* Table Pagination Footer (Matching Image 3) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value={5}>5 / Pages</option>
              <option value={10}>10 / Pages</option>
              <option value={20}>20 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 bg-white dark:bg-[#181b24]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-medium transition ${
                  currentPage === page
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold border-slate-900 dark:border-white"
                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#181b24]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 bg-white dark:bg-[#181b24]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="text-center text-xs text-slate-400 py-4">
        2026 © Dreams ERP. All Rights Reserved
      </div>

      {/* Add / Edit Sales Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#181b24] rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingOrder ? "Edit Sales Order" : "Add New Sales Order"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Customer Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alexander Kenn"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    placeholder="e.g. TechCorp Inc"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alexander@techcorp.com"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
              </div>

              {/* Order Date & Delivery Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Order Date
                  </label>
                  <input
                    type="text"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Delivery Date
                  </label>
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
              </div>

              {/* Payment Method, Status, Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Pay">Mobile Pay</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Order Status
                  </label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as SalesOrderStatus)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Order Line Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-[#12141c] p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].description = e.target.value;
                          setLineItems(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Model / SKU"
                        value={item.model}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].model = e.target.value;
                          setLineItems(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].qty = Number(e.target.value);
                          setLineItems(updated);
                        }}
                        className="w-full px-1.5 py-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].rate = Number(e.target.value);
                          setLineItems(updated);
                        }}
                        className="w-full px-2 py-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        disabled={lineItems.length === 1}
                        className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="text-right text-xs text-slate-600 dark:text-slate-400 pt-1 font-semibold">
                  Estimated Total: $
                  {lineItems
                    .reduce((sum, item) => sum + Number(item.qty) * Number(item.rate), 0)
                    .toLocaleString()}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {editingOrder ? "Update Sales Order" : "Create Sales Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Sales Order?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  "{deleteTarget.orderNumber}"
                </span>{" "}
                for {deleteTarget.customer}? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition shadow-2xs"
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

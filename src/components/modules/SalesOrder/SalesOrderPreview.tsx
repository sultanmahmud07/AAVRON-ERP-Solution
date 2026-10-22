import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  Printer,
  Download,
  Edit2,
  ChevronRight,
  ArrowLeft,
  Mail,
  MessageSquare,
  Receipt,
  Plus,
  Trash2,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import DreamsLogo from "@/components/common/DreamsLogo";
import {
  SalesOrder,
  SalesOrderItem,
  SalesOrderStatus,
  PaymentStatus,
  getStoredSalesOrders,
  getStoredSalesOrderById,
  updateStoredSalesOrder,
  initialSalesOrders,
} from "./salesOrderStorage";

export default function SalesOrderPreview() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Active order state
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // View modes: "default" (A4 formal document) or "pos" (thermal receipt)
  const [viewMode, setViewMode] = useState<"default" | "pos">("default");

  // Currency symbol toggle ($ vs ৳ support from images)
  const [currencySymbol, setCurrencySymbol] = useState<"$" | "৳">("$");

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editOrderDate, setEditOrderDate] = useState("");
  const [editDeliveryDate, setEditDeliveryDate] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<SalesOrder["paymentMethod"]>("Credit Card");
  const [editReference, setEditReference] = useState("");
  const [editStatus, setEditStatus] = useState<SalesOrderStatus>("Delivered");
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>("Paid");
  const [editItems, setEditItems] = useState<
    { description: string; model: string; qty: number; rate: number }[]
  >([]);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editTax, setEditTax] = useState<number>(0);
  const [editPaidAmount, setEditPaidAmount] = useState<number>(0);

  // SMS & Email modals / feedback
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareType, setShareType] = useState<"sms" | "email">("email");
  const [shareRecipient, setShareRecipient] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Load order data
  const loadOrder = () => {
    setLoading(true);
    const targetId = orderId || "SO0020";
    let found = getStoredSalesOrderById(targetId);

    if (!found) {
      // Fallback to first stored order or initial default
      const all = getStoredSalesOrders();
      if (all.length > 0) {
        found = all[0];
      } else {
        found = initialSalesOrders[0];
      }
    }

    if (found) {
      setOrder(found);
      // Auto-detect currency if invoice uses Taka or Dollar
      if (found.invoiceNumber?.startsWith("INV-001") || found.customerCountry === "Bangladesh") {
        setCurrencySymbol("৳");
      } else {
        setCurrencySymbol("$");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();

    const handleStorageUpdate = () => {
      loadOrder();
    };

    window.addEventListener("nexora_sales_orders_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("nexora_sales_orders_updated", handleStorageUpdate);
    };
  }, [orderId]);

  // Open Edit Modal
  const handleOpenEdit = () => {
    if (!order) return;
    setEditCustomer(order.customer);
    setEditCompany(order.customerCompany || "");
    setEditEmail(order.customerEmail);
    setEditPhone(order.customerPhone);
    setEditAddress(order.customerAddress || "");
    setEditOrderDate(order.orderDate);
    setEditDeliveryDate(order.deliveryDate);
    setEditPaymentMethod(order.paymentMethod);
    setEditReference(order.reference);
    setEditStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setEditDiscount(order.discount || 0);
    setEditTax(order.tax || 0);
    setEditPaidAmount(order.paidAmount || 0);
    setEditItems(
      order.items.map((it) => ({
        description: it.description,
        model: it.model || "",
        qty: it.qty,
        rate: it.rate,
      }))
    );
    setIsEditModalOpen(true);
  };

  // Add Item to Edit Modal
  const handleAddEditItem = () => {
    setEditItems((prev) => [
      ...prev,
      { description: "New Product", model: "SKU-000", qty: 1, rate: 100 },
    ]);
  };

  // Remove Item from Edit Modal
  const handleRemoveEditItem = (idx: number) => {
    setEditItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update Item in Edit Modal
  const handleUpdateEditItem = (
    idx: number,
    field: "description" | "model" | "qty" | "rate",
    val: string | number
  ) => {
    setEditItems((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            [field]:
              field === "qty" || field === "rate"
                ? Number(val) || 0
                : val,
          };
        }
        return item;
      })
    );
  };

  // Save Edit Order
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!editCustomer.trim()) {
      toast.error("Please enter a customer name");
      return;
    }

    if (editItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    const items: SalesOrderItem[] = editItems.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      description: it.description,
      model: it.model,
      qty: it.qty,
      rate: it.rate,
      discount: 0,
      vat: 0,
      total: it.qty * it.rate,
    }));

    const subtotal = items.reduce((sum, it) => sum + it.total, 0);
    const totalAmount = Math.max(0, subtotal - editDiscount + editTax);
    const dueAmount = Math.max(0, totalAmount - editPaidAmount);

    const updated = updateStoredSalesOrder(order.id, {
      customer: editCustomer,
      customerCompany: editCompany,
      customerEmail: editEmail,
      customerPhone: editPhone,
      customerAddress: editAddress,
      orderDate: editOrderDate,
      deliveryDate: editDeliveryDate,
      paymentMethod: editPaymentMethod,
      reference: editReference,
      status: editStatus,
      paymentStatus: editPaymentStatus,
      items,
      subtotal,
      discount: editDiscount,
      tax: editTax,
      totalAmount,
      paidAmount: editPaidAmount,
      dueAmount,
    });

    if (updated) {
      setOrder(updated);
      setIsEditModalOpen(false);
      toast.success(`Sales Order "${updated.orderNumber}" updated successfully!`);
    } else {
      toast.error("Failed to update sales order");
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Download PDF / Print Dialog
  const handleDownload = () => {
    toast.info("Generating PDF preview for download...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Open Share Dialog
  const handleOpenShare = (type: "sms" | "email") => {
    if (!order) return;
    setShareType(type);
    setShareRecipient(type === "sms" ? order.customerPhone : order.customerEmail);
    setIsShareModalOpen(true);
  };

  const handleSendShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (shareType === "email") {
      toast.success(`Invoice for ${order.orderNumber} dispatched to ${shareRecipient}`);
    } else {
      toast.success(`SMS receipt sent to ${shareRecipient}`);
    }
    setIsShareModalOpen(false);
  };

  // Copy Order Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Order preview link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 p-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order Not Found</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          The requested sales order could not be located in local storage.
        </p>
        <button
          onClick={() => navigate("/sales/orders")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sales Orders
        </button>
      </div>
    );
  }

  // Format currency
  const formatMoney = (val: number) => {
    const formatted = val.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return currencySymbol === "৳" ? `৳ ${formatted}` : `$${formatted}`;
  };

  // Status Badge styles matching reference Image 4 & Image 3
  const getStatusBadge = (status: SalesOrderStatus) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
            Completed
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
            Processing
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/50">
            Shipped
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50">
            Cancelled
          </span>
        );
      case "Returned":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/50">
            Returned
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header Navigation & Breadcrumbs matching Image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb: Sales Orders > #SO0020 */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link
              to="/sales/orders"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sales Orders
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">
              {order.orderNumber}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/sales/orders")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Back to list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sales Order Preview
            </h1>
          </div>
        </div>

        {/* Action Buttons matching Image 4 & Image 2 (Print, Edit, Download, SMS, Email, POS Switch) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* View Mode Toggle: Default vs POS (Image 2 style) */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181b24] p-0.5 text-xs">
            <button
              onClick={() => setViewMode("default")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${viewMode === "default"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              Default
            </button>
            <button
              onClick={() => setViewMode("pos")}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${viewMode === "pos"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Receipt className="w-3 h-3" />
              POS
            </button>
          </div>

          {/* Currency Toggle */}
          <button
            onClick={() => setCurrencySymbol(currencySymbol === "$" ? "৳" : "$")}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181b24] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Toggle Currency symbol ($ or ৳)"
          >
            {currencySymbol === "$" ? "USD ($)" : "BDT (৳)"}
          </button>

          {/* SMS Button (from Image 2) */}
          <button
            onClick={() => handleOpenShare("sms")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition border border-indigo-100 dark:border-indigo-800/40"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            SMS
          </button>

          {/* Email Button (from Image 2) */}
          <button
            onClick={() => handleOpenShare("email")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition border border-pink-100 dark:border-pink-800/40"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>

          {/* Print Button (Image 4 exact style: white pill with printer icon) */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            Print
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>

          {/* Edit Button (Image 4 exact style: dark pill with pencil icon) */}
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* 2. Main Order Document Container */}
      {viewMode === "default" ? (
        /* ======================== DEFAULT A4 PREVIEW (Matching Image 4 & Image 2) ======================== */
        <div
          ref={printAreaRef}
          className="sales-order-printable bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-xs p-6 sm:p-10 transition-colors"
        >
          {/* Top Row: Brand & Order Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800/60">
            {/* Left: Company Logo & Details (Matching Image 4 "Dreams ERP") */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <DreamsLogo showText={true} />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                <p>123 Business Ave</p>
                <p>New York, NY 10001</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  contact@dreamserp.com • +1 (555) 019-2834
                </p>
              </div>
            </div>

            {/* Right: SALES ORDER heading, Order Number & Status badge (Image 4 layout) */}
            <div className="sm:text-right space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                SALES ORDER
              </h2>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300">
                  {order.orderNumber}
                </span>
                {order.invoiceNumber && (
                  <span className="text-xs text-slate-400 font-mono">
                    ({order.invoiceNumber})
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex sm:justify-end items-center gap-2 pt-1">
                {getStatusBadge(order.status)}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${order.paymentStatus === "Paid"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : order.paymentStatus === "Partial"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              {/* Barcode representation (from Image 2) */}
              <div className="pt-2 flex sm:justify-end">
                <div className="inline-block bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                  <svg className="w-40 h-8 text-slate-900 dark:text-white" viewBox="0 0 160 32">
                    <rect x="0" y="0" width="3" height="32" fill="currentColor" />
                    <rect x="5" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="9" y="0" width="4" height="32" fill="currentColor" />
                    <rect x="15" y="0" width="1" height="32" fill="currentColor" />
                    <rect x="18" y="0" width="3" height="32" fill="currentColor" />
                    <rect x="23" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="27" y="0" width="5" height="32" fill="currentColor" />
                    <rect x="34" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="38" y="0" width="1" height="32" fill="currentColor" />
                    <rect x="41" y="0" width="4" height="32" fill="currentColor" />
                    <rect x="47" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="51" y="0" width="3" height="32" fill="currentColor" />
                    <rect x="56" y="0" width="1" height="32" fill="currentColor" />
                    <rect x="59" y="0" width="5" height="32" fill="currentColor" />
                    <rect x="66" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="70" y="0" width="3" height="32" fill="currentColor" />
                    <rect x="75" y="0" width="1" height="32" fill="currentColor" />
                    <rect x="78" y="0" width="4" height="32" fill="currentColor" />
                    <rect x="84" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="88" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="92" y="0" width="5" height="32" fill="currentColor" />
                    <rect x="99" y="0" width="1" height="32" fill="currentColor" />
                    <rect x="102" y="0" width="3" height="32" fill="currentColor" />
                    <rect x="107" y="0" width="4" height="32" fill="currentColor" />
                    <rect x="113" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="117" y="0" width="1" height="32" fill="currentColor" />
                    <rect x="120" y="0" width="4" height="32" fill="currentColor" />
                    <rect x="126" y="0" width="3" height="32" fill="currentColor" />
                    <rect x="131" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="135" y="0" width="5" height="32" fill="currentColor" />
                    <rect x="142" y="0" width="2" height="32" fill="currentColor" />
                    <rect x="146" y="0" width="1" height="32" fill="currentColor" />
                    <rect x="149" y="0" width="4" height="32" fill="currentColor" />
                    <rect x="155" y="0" width="3" height="32" fill="currentColor" />
                  </svg>
                  <p className="text-[10px] text-center font-mono text-slate-500 tracking-widest mt-0.5">
                    {order.orderNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Bill To & Order Info (Matching Image 4 layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 dark:border-slate-800/60">
            {/* Left: Bill To */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Bill To
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {order.customer}
              </h3>
              {order.customerCompany && (
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {order.customerCompany}
                </p>
              )}
              {order.customerAddress && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {order.customerAddress}
                  {order.customerCountry ? `, ${order.customerCountry}` : ""}
                </p>
              )}
              <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                {order.customerEmail && <p>Email: {order.customerEmail}</p>}
                {order.customerPhone && <p>Mobile: {order.customerPhone}</p>}
              </div>
            </div>

            {/* Right: Order Metadata */}
            <div className="sm:text-right space-y-2 text-xs">
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400">Sale Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {order.orderDate}
                </span>
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400">Delivery Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {order.deliveryDate}
                </span>
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400">Reference:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {order.reference || "For Purchase"}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table: Exact layout of Image 4 (Description, Qty, Rate, Amount) */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-2 w-12 text-center">#</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-4 text-center w-24">Qty</th>
                  <th className="py-3 px-4 text-right w-32">Rate</th>
                  <th className="py-3 px-4 text-right w-36">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {order.items.map((item, index) => (
                  <tr key={item.id || index} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-2 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-4 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.description}
                      </div>
                      {item.model && (
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Model / SKU: {item.model}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                      {item.qty}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {formatMoney(item.rate)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatMoney(item.total || item.qty * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section (Subtotal, Discount, Tax, Total, Paid Amount) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            {/* Notes / Terms */}
            <div className="max-w-md space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Order Notes:</span>
              <p className="leading-relaxed">
                {order.notes ||
                  "Thank you for doing business with us. Please verify all items upon delivery."}
              </p>
            </div>

            {/* Financial Totals matching Image 4 (Subtotal & Total) & Image 2 (Paid & Due) */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatMoney(order.subtotal)}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                  <span>Discount</span>
                  <span className="font-semibold">- {formatMoney(order.discount)}</span>
                </div>
              )}

              {order.tax > 0 && (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Vat / Tax</span>
                  <span className="font-semibold">{formatMoney(order.tax)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2.5 border-t border-b border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 pt-1">
                <span>Paid Amount</span>
                <span className="font-semibold">{formatMoney(order.paidAmount)}</span>
              </div>

              {order.dueAmount > 0 && (
                <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-medium">
                  <span>Due Amount</span>
                  <span className="font-semibold">{formatMoney(order.dueAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dual Signatures matching Image 2 */}
          <div className="mt-14 pt-8 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-8 text-center">
            <div className="space-y-2">
              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-44 mx-auto mb-2"></div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Authorized Signature
              </p>
            </div>
            <div className="space-y-2">
              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-44 mx-auto mb-2"></div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Customer Signature
              </p>
            </div>
          </div>

          {/* Footer note matching Image 2 */}
          <div className="mt-10 pt-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-800/40 space-y-1">
            <p className="italic">
              "Just wanted to say thank you for your purchase. We're so lucky to have customers like you!"
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              Powered by NEXORA ERP • Modern Enterprise Management
            </p>
          </div>
        </div>
      ) : (
        /* ======================== POS RECEIPT PREVIEW (Matching Image 2 POS button) ======================== */
        <div className="max-w-md mx-auto bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-lg p-6 sm:p-8 font-mono text-xs">
          {/* POS Header */}
          <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-center pb-1">
              <DreamsLogo showText={true} />
            </div>
            <p className="font-bold text-sm tracking-wider text-slate-900 dark:text-white uppercase">
              Dreams ERP Store #01
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              123 Business Ave, New York, NY 10001
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Tel: +1 (555) 019-2834</p>
          </div>

          {/* POS Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span>Order #: {order.orderNumber}</span>
              <span>{order.orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer: {order.customer}</span>
              <span>Cashier: Admin</span>
            </div>
            <div className="flex justify-between">
              <span>Method: {order.paymentMethod}</span>
              <span className="font-semibold text-emerald-600">{order.paymentStatus}</span>
            </div>
          </div>

          {/* POS Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white pb-2 text-[11px]">
              <span>ITEM</span>
              <span>QTY x RATE</span>
              <span>TOTAL</span>
            </div>
            <div className="space-y-2 text-[11px]">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                  <div className="truncate max-w-[140px]">
                    <p className="font-medium">{item.description}</p>
                    {item.model && <p className="text-[10px] text-slate-400">{item.model}</p>}
                  </div>
                  <span>
                    {item.qty} x {item.rate}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatMoney(item.total || item.qty * item.rate)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* POS Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>SUBTOTAL:</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>DISCOUNT:</span>
                <span>-{formatMoney(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1">
              <span>TOTAL:</span>
              <span>{formatMoney(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>PAID:</span>
              <span>{formatMoney(order.paidAmount)}</span>
            </div>
            {order.dueAmount > 0 && (
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>DUE:</span>
                <span>{formatMoney(order.dueAmount)}</span>
              </div>
            )}
          </div>

          {/* POS Barcode & Footer */}
          <div className="text-center pt-5 space-y-2">
            <div className="flex justify-center">
              <svg className="w-48 h-10 text-slate-900 dark:text-white" viewBox="0 0 160 32">
                <rect x="0" y="0" width="3" height="32" fill="currentColor" />
                <rect x="5" y="0" width="2" height="32" fill="currentColor" />
                <rect x="9" y="0" width="4" height="32" fill="currentColor" />
                <rect x="15" y="0" width="1" height="32" fill="currentColor" />
                <rect x="18" y="0" width="3" height="32" fill="currentColor" />
                <rect x="23" y="0" width="2" height="32" fill="currentColor" />
                <rect x="27" y="0" width="5" height="32" fill="currentColor" />
                <rect x="34" y="0" width="2" height="32" fill="currentColor" />
                <rect x="38" y="0" width="1" height="32" fill="currentColor" />
                <rect x="41" y="0" width="4" height="32" fill="currentColor" />
                <rect x="47" y="0" width="2" height="32" fill="currentColor" />
                <rect x="51" y="0" width="3" height="32" fill="currentColor" />
                <rect x="56" y="0" width="1" height="32" fill="currentColor" />
                <rect x="59" y="0" width="5" height="32" fill="currentColor" />
                <rect x="66" y="0" width="2" height="32" fill="currentColor" />
                <rect x="70" y="0" width="3" height="32" fill="currentColor" />
                <rect x="75" y="0" width="1" height="32" fill="currentColor" />
                <rect x="78" y="0" width="4" height="32" fill="currentColor" />
                <rect x="84" y="0" width="2" height="32" fill="currentColor" />
                <rect x="88" y="0" width="2" height="32" fill="currentColor" />
                <rect x="92" y="0" width="5" height="32" fill="currentColor" />
                <rect x="99" y="0" width="1" height="32" fill="currentColor" />
                <rect x="102" y="0" width="3" height="32" fill="currentColor" />
                <rect x="107" y="0" width="4" height="32" fill="currentColor" />
                <rect x="113" y="0" width="2" height="32" fill="currentColor" />
                <rect x="117" y="0" width="1" height="32" fill="currentColor" />
                <rect x="120" y="0" width="4" height="32" fill="currentColor" />
                <rect x="126" y="0" width="3" height="32" fill="currentColor" />
                <rect x="131" y="0" width="2" height="32" fill="currentColor" />
                <rect x="135" y="0" width="5" height="32" fill="currentColor" />
              </svg>
            </div>
            <p className="text-[10px] tracking-widest text-slate-400">
              * {order.orderNumber} *
            </p>
            <p className="text-[11px] text-slate-500 pt-1">
              Thank you for shopping with us!
            </p>
            <div className="pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-sans font-bold rounded-lg text-xs hover:opacity-90 transition shadow-2xs"
              >
                Print POS Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit Order Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#181b24] rounded-md max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Sales Order: {order.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Update customer details, status, delivery date, and order items.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={editCustomer}
                    onChange={(e) => setEditCustomer(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Order Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as SalesOrderStatus)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) =>
                      setEditPaymentMethod(e.target.value as SalesOrder["paymentMethod"])
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Pay">Mobile Pay</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>
              </div>

              {/* Dates & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Sale Date
                  </label>
                  <input
                    type="text"
                    value={editOrderDate}
                    onChange={(e) => setEditOrderDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="text"
                    value={editDeliveryDate}
                    onChange={(e) => setEditDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={editReference}
                    onChange={(e) => setEditReference(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Order Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddEditItem}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Product
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-[#12141c] p-2 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Product Name"
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateEditItem(idx, "description", e.target.value)
                          }
                          required
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Model/SKU"
                          value={item.model}
                          onChange={(e) =>
                            handleUpdateEditItem(idx, "model", e.target.value)
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateEditItem(idx, "qty", Number(e.target.value))
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 text-center"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) =>
                            handleUpdateEditItem(idx, "rate", Number(e.target.value))
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 text-right"
                        />
                        {editItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEditItem(idx)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial adjustments */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Discount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Tax ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editTax}
                    onChange={(e) => setEditTax(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Paid Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPaidAmount}
                    onChange={(e) => setEditPaidAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. SMS / Email Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-md max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {shareType === "email" ? (
                  <>
                    <Mail className="w-4 h-4 text-pink-500" />
                    Send Invoice by Email
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    Send Receipt by SMS
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendShare} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Recipient {shareType === "email" ? "Email Address" : "Phone Number"}
                </label>
                <input
                  type={shareType === "email" ? "email" : "text"}
                  value={shareRecipient}
                  onChange={(e) => setShareRecipient(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Link Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Preview Link
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900"
                >
                  Send Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Print Optimization Styles */}
      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            /* Hide application shell */
            aside, header, nav, .print\\:hidden, button, .lucide-arrow-left {
              display: none !important;
            }
            main {
              padding: 0 !important;
              max-width: 100% !important;
            }
            .sales-order-printable {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .sales-order-printable * {
              color: #000000 !important;
              border-color: #e2e8f0 !important;
            }
          }
        `}
      </style>
    </div>
  );
}

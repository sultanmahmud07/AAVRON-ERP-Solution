import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  RotateCcw,
  Eye,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  RotateCw,
  FileCheck,
  AlertCircle,
  MessageSquare,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredQuotations,
  deleteStoredQuotation,
  QuotationItem,
} from "./quotationStorage";

export default function QuotationList() {
  const navigate = useNavigate();

  // Quotation data state
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Expanded rows (set of quotation IDs)
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  // Delete modal state
  const [deletingQuote, setDeletingQuote] = useState<QuotationItem | null>(null);

  // Preview modal state
  const [previewQuote, setPreviewQuote] = useState<QuotationItem | null>(null);
  const [previewMode, setPreviewMode] = useState<"default" | "pos">("default");

  // Load quotes from storage
  const loadData = () => {
    setQuotations(getStoredQuotations());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_quotations_updated", handleUpdate);
    return () => window.removeEventListener("nexora_quotations_updated", handleUpdate);
  }, []);

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        q.quotationNumber.toLowerCase().includes(query) ||
        q.clientName.toLowerCase().includes(query) ||
        q.clientPhone.toLowerCase().includes(query) ||
        (q.clientEmail && q.clientEmail.toLowerCase().includes(query)) ||
        (q.convertedInvoiceNumber && q.convertedInvoiceNumber.toLowerCase().includes(query));

      if (!matchSearch) return false;
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      return true;
    });
  }, [quotations, searchQuery, statusFilter]);

  // Toggle row expand
  const toggleRowExpand = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Delete handler
  const handleConfirmDelete = () => {
    if (!deletingQuote) return;
    deleteStoredQuotation(deletingQuote.id);
    toast.success(`Quotation "${deletingQuote.quotationNumber}" deleted successfully.`);
    setDeletingQuote(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Quotation Number",
      "Date",
      "Client Name",
      "Client Phone",
      "Subtotal",
      "Discount",
      "VAT",
      "Total Amount",
      "Status",
    ];

    const rows = filteredQuotations.map((q) => [
      `"${q.quotationNumber}"`,
      `"${q.date}"`,
      `"${q.clientName}"`,
      `"${q.clientPhone}"`,
      q.subtotal,
      q.discount,
      q.totalVat,
      q.netTotal,
      q.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Quotations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Quotations exported successfully!");
  };

  const fmt = (val: number) => {
    return `৳ ${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link
              to="/sales/orders"
              className="hover:text-[#0c6760] dark:hover:text-teal-400 transition-colors"
            >
              Sales
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Sales Quotes
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-[#0c6760]" />
            Manage Quotations
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Print list"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <Link
            to="/sales/quotes/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by quote no, client, phone..."
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 z-20 space-y-1 text-xs">
                  {["all", "Pending", "Converted", "Expired"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition ${
                        statusFilter === st
                          ? "bg-[#0c6760] text-white"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {st === "all" ? "All Statuses" : st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                toast.success("Filters reset");
              }}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredQuotations.length}</span> quotes
          </div>
        </div>

        {/* Table Matching Reference Image 1 Exactly */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <ChevronDown className="w-3.5 h-3.5 mx-auto text-slate-400" />
                </th>
                <th className="py-3 px-4 w-14">SL</th>
                <th className="py-3 px-4 min-w-[110px]">Date</th>
                <th className="py-3 px-4 min-w-[150px]">Quotation Number</th>
                <th className="py-3 px-4 min-w-[220px]">Client Info</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Total Amount</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Status</th>
                <th className="py-3 px-4 min-w-[140px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-medium">No sales quotations found</p>
                      <p className="text-xs mt-0.5">Click "Create Quotation" to add a new quote.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((item, idx) => {
                  const isExpanded = expandedRowIds.has(item.id);

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Expand row arrow */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRowExpand(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                            title={isExpanded ? "Collapse" : "Expand items"}
                          >
                            <ChevronRight
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? "rotate-90 text-[#0c6760]" : ""
                              }`}
                            />
                          </button>
                        </td>

                        {/* SL */}
                        <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {item.date}
                        </td>

                        {/* Quotation Number */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {item.quotationNumber}
                        </td>

                        {/* Client Info (Matching Image 1 avatar + name + phone) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white shadow-2xs shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                {item.clientName}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                {item.clientPhone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3 px-4 text-right font-black font-mono text-sm text-slate-900 dark:text-white">
                          {fmt(item.netTotal)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "Converted"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                                : item.status === "Expired"
                                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50"
                                : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Action circular buttons matching Image 1 */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* 1. Preview / View button (Cyan circle) */}
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewQuote(item);
                                setPreviewMode("default");
                              }}
                              className="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300 hover:bg-sky-100 flex items-center justify-center transition shadow-2xs cursor-pointer"
                              title="View Quotation"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Convert to Invoice button (Amber cycle icon matching image 1) */}
                            <button
                              type="button"
                              onClick={() => navigate(`/sales/quotes/convert/${item.id}`)}
                              className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300 hover:bg-amber-100 flex items-center justify-center transition shadow-2xs cursor-pointer"
                              title="Convert to Invoice"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete button (Pink/Rose circle matching image 1) */}
                            <button
                              type="button"
                              onClick={() => setDeletingQuote(item)}
                              className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-100 flex items-center justify-center transition shadow-2xs cursor-pointer"
                              title="Delete Quotation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Line Items Detail Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-[#12141c]/60">
                          <td colSpan={8} className="p-4 sm:p-5">
                            <div className="space-y-3 bg-white dark:bg-[#181b24] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>Quoted Line Items ({item.items.length})</span>
                                  {item.convertedInvoiceNumber && (
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                                      • Converted to Invoice #{item.convertedInvoiceNumber}
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/sales/quotes/edit/${item.id}`)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/sales/quotes/convert/${item.id}`)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0c6760] dark:text-teal-400 hover:underline"
                                  >
                                    <RotateCw className="w-3 h-3" />
                                    <span>Convert to Invoice</span>
                                  </button>
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100 dark:border-slate-800">
                                      <th className="py-1.5 text-left">Item Name</th>
                                      <th className="py-1.5 text-left">Variant</th>
                                      <th className="py-1.5 text-center">Qty</th>
                                      <th className="py-1.5 text-right">Rate</th>
                                      <th className="py-1.5 text-right">Discount</th>
                                      <th className="py-1.5 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                    {item.items.map((row, rIdx) => (
                                      <tr key={rIdx}>
                                        <td className="py-2 font-medium text-slate-800 dark:text-slate-200">
                                          {row.name}
                                        </td>
                                        <td className="py-2 text-slate-500">{row.variant}</td>
                                        <td className="py-2 text-center">{row.qty}</td>
                                        <td className="py-2 text-right">{fmt(row.rate)}</td>
                                        <td className="py-2 text-right text-rose-500">
                                          {row.discount > 0 ? `-${fmt(row.discount)}` : "0.00"}
                                        </td>
                                        <td className="py-2 text-right font-bold text-slate-900 dark:text-white">
                                          {fmt(row.total)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-slate-500 text-[11px] italic">
                                  {item.note || "No specific client note attached."}
                                </p>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                  <span>Subtotal: {fmt(item.subtotal)}</span>
                                  <span>Shipping: {fmt(item.shippingCost)}</span>
                                  <span className="text-rose-500">Discount: -{fmt(item.discount)}</span>
                                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                                    Net Total: {fmt(item.netTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Quotation?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete quotation{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  #{deletingQuote.quotationNumber}
                </span>{" "}
                for {deletingQuote.clientName}? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuote(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Preview Modal (Default A4 & POS Thermal Layouts) */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 bg-white dark:bg-[#181b24] z-20">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0c6760]" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Quotation #{previewQuote.quotationNumber}
                </h2>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs">
                {/* Default vs POS toggle */}
                <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("default")}
                    className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                      previewMode === "default"
                        ? "bg-[#0c6760] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("pos")}
                    className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                      previewMode === "pos"
                        ? "bg-[#0c6760] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    POS
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toast.success("Quote link dispatched via SMS!")}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  SMS
                </button>

                <button
                  type="button"
                  onClick={() => toast.success("Quote dispatched via Email!")}
                  className="px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const qId = previewQuote.id;
                    setPreviewQuote(null);
                    navigate(`/sales/quotes/convert/${qId}`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Convert to Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewQuote(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-8">
              {previewMode === "default" ? (
                <div className="bg-white dark:bg-[#12141c] rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-6 text-slate-800 dark:text-slate-100 shadow-sm">
                  {/* Company Header & Barcode */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#0c6760] flex items-center justify-center text-white font-black text-lg">
                          N
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                            Redion IT Solution
                          </h3>
                          <p className="text-[10px] text-slate-400">NEXORA Enterprise ERP</p>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Quotation Number: #{previewQuote.quotationNumber}
                      </p>
                      <div className="inline-block px-3 py-1 rounded bg-[#0c6760] text-white text-xs font-bold">
                        Quotation Date: {previewQuote.date}
                      </div>
                    </div>
                  </div>

                  {/* To / From */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Quoted To:</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {previewQuote.clientName}
                      </p>
                      {previewQuote.clientCompany && <p>{previewQuote.clientCompany}</p>}
                      <p>Phone: {previewQuote.clientPhone}</p>
                      <p>Address: {previewQuote.clientAddress}</p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        Redion IT Solution
                      </p>
                      <p>industrial Area2 Sharjah UAE</p>
                      <p>Tel: 0565495023</p>
                      <p>Email: Redion@gmail.com</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#1e293b] text-white text-[11px] font-bold uppercase">
                          <th className="py-2.5 px-3 text-left w-12">Sl.</th>
                          <th className="py-2.5 px-3 text-left">Item</th>
                          <th className="py-2.5 px-3 text-center w-16">Qty</th>
                          <th className="py-2.5 px-3 text-right">Price</th>
                          <th className="py-2.5 px-3 text-right">Discount</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {previewQuote.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold">{it.name}</td>
                            <td className="py-2.5 px-3 text-center">{it.qty}</td>
                            <td className="py-2.5 px-3 text-right">{fmt(it.rate)}</td>
                            <td className="py-2.5 px-3 text-right">{fmt(it.discount)}</td>
                            <td className="py-2.5 px-3 text-right font-bold">{fmt(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end text-xs">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Subtotal:</span>
                        <span className="font-semibold">{fmt(previewQuote.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Shipping:</span>
                        <span className="font-semibold">{fmt(previewQuote.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-rose-500 font-semibold">
                        <span>Discount:</span>
                        <span>-{fmt(previewQuote.discount)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span>Grand Total:</span>
                        <span>{fmt(previewQuote.netTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-center text-slate-400">
                    <div>
                      <p className="font-mono">.....................................</p>
                      <p className="mt-1 font-semibold text-slate-600 dark:text-slate-300">
                        Authorized Signature
                      </p>
                    </div>
                    <div>
                      <p className="font-mono">.....................................</p>
                      <p className="mt-1 font-semibold text-slate-600 dark:text-slate-300">
                        Client Acceptance
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-xs mx-auto bg-white text-slate-900 p-6 rounded-xl border border-slate-300 shadow-md font-mono text-[11px] leading-relaxed select-text">
                  <div className="text-center space-y-0.5">
                    <p className="font-bold text-xs uppercase tracking-wider">REDION IT SOLUTION</p>
                    <p className="text-[10px] text-slate-600">industrial Area2 Sharjah UAE</p>
                  </div>

                  <div className="border-t border-dashed border-slate-400 my-2" />
                  <p className="text-center font-bold tracking-widest text-xs">SALES ESTIMATE</p>
                  <div className="border-t border-dashed border-slate-400 my-2" />

                  <div className="space-y-0.5 text-[10px]">
                    <p>Quote No: {previewQuote.quotationNumber}</p>
                    <p>Date: {previewQuote.date}</p>
                    <p>Client: {previewQuote.clientName}</p>
                    <p>Phone: {previewQuote.clientPhone}</p>
                  </div>

                  <div className="border-t border-dashed border-slate-400 my-2" />

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-slate-300">
                      <span># Item</span>
                      <span>Qty</span>
                      <span>Amount</span>
                    </div>
                    {previewQuote.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[10px]">
                        <span className="truncate max-w-[140px]">
                          {idx + 1} {it.name}
                        </span>
                        <span>{it.qty}</span>
                        <span className="font-bold">{fmt(it.total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-slate-400 my-2" />

                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{fmt(previewQuote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{fmt(previewQuote.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{fmt(previewQuote.discount)}</span>
                    </div>
                    <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                      <span>Net Estimate:</span>
                      <span>{fmt(previewQuote.netTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

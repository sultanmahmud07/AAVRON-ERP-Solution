import React, { useState, useEffect, useMemo } from "react";
import {
  Eye,
  CreditCard,
  Search,
  Calendar,
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Building,
  RotateCcw,
  UserCheck,
  TrendingDown,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  CustomerDueRecord,
  getStoredCustomerDues,
  recordCustomerDuePayment,
  formatTaka,
} from "./dueStorage";

export default function CustomerDueList() {
  const [records, setRecords] = useState<CustomerDueRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  // Modals state
  const [activeLedgerRecord, setActiveLedgerRecord] = useState<CustomerDueRecord | null>(null);
  const [activePaymentRecord, setActivePaymentRecord] = useState<CustomerDueRecord | null>(null);

  // Payment Form state
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentAccount, setPaymentAccount] = useState<string>("Cash Account (Counter 1)");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentNote, setPaymentNote] = useState<string>("");
  const [activeLedgerTab, setActiveLedgerTab] = useState<"invoices" | "payments">("invoices");

  const loadData = () => {
    setRecords(getStoredCustomerDues());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_due_updated", handleUpdate);
    return () => window.removeEventListener("nexora_due_updated", handleUpdate);
  }, []);

  // Summary KPIs
  const kpis = useMemo(() => {
    const totalDue = records.reduce((sum, r) => sum + r.totalDue, 0);
    const totalPaid = records.reduce((sum, r) => sum + r.totalPaid, 0);
    const totalAmount = records.reduce((sum, r) => sum + r.totalAmount, 0);
    const customersWithDue = records.filter((r) => r.totalDue > 0).length;
    return { totalDue, totalPaid, totalAmount, customersWithDue };
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchSearch =
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.phone.includes(searchQuery) ||
        rec.address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (dateRangeFilter === "due_only") return rec.totalDue > 0;
      if (dateRangeFilter === "cleared_only") return rec.totalDue === 0;

      return true;
    });
  }, [records, searchQuery, dateRangeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Handle open payment modal
  const handleOpenPayment = (record: CustomerDueRecord) => {
    setActivePaymentRecord(record);
    setPaymentAmount(record.totalDue > 0 ? record.totalDue.toString() : "0");
    setPaymentReference(`CR-${Math.floor(10000 + Math.random() * 90000)}`);
    setPaymentNote(`Due collection from ${record.name}`);
  };

  // Submit payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentRecord) return;

    const numAmount = parseFloat(paymentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid payment amount greater than 0");
      return;
    }

    if (numAmount > activePaymentRecord.totalDue) {
      toast.error("Collection amount cannot exceed outstanding due amount");
      return;
    }

    const updated = recordCustomerDuePayment(
      activePaymentRecord.id,
      numAmount,
      paymentAccount,
      paymentReference,
      paymentNote
    );

    if (updated) {
      toast.success(
        `Received ${formatTaka(numAmount)} from ${updated.name}. Due updated to ${formatTaka(
          updated.totalDue
        )}`
      );
      loadData();
      setActivePaymentRecord(null);
      // Dispatch custom event for real-time sync across widgets
      window.dispatchEvent(new Event("nexora_due_updated"));
    }
  };

  // Quick preset amount helper
  const handlePresetPay = (type: "full" | "half" | "clear") => {
    if (!activePaymentRecord) return;
    if (type === "full") {
      setPaymentAmount(activePaymentRecord.totalDue.toFixed(2));
    } else if (type === "half") {
      setPaymentAmount((activePaymentRecord.totalDue / 2).toFixed(2));
    } else if (type === "clear") {
      setPaymentAmount("");
    }
  };

  // Print list
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "SL",
      "Customer Name",
      "Phone",
      "Address",
      "Total Invoices",
      "Total Amount",
      "Total Paid",
      "Total Due",
    ];
    const rows = filteredRecords.map((r, i) => [
      i + 1,
      `"${r.name}"`,
      `"${r.phone}"`,
      `"${r.address}"`,
      r.totalInvoice,
      r.totalAmount,
      r.totalPaid,
      r.totalDue,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NEXORA_Customer_Due_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer due report exported successfully!");
  };

  const remainingDuePreview = useMemo(() => {
    if (!activePaymentRecord) return 0;
    const num = parseFloat(paymentAmount) || 0;
    return Math.max(0, activePaymentRecord.totalDue - num);
  }, [activePaymentRecord, paymentAmount]);

  return (
    <div className="space-y-4">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            Customer Due
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track customer receivables, review detailed invoice ledgers, and collect outstanding payments.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-2xs cursor-pointer"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-2xs cursor-pointer"
            title="Print List"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Receivables (Due) */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Receivables
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
            {formatTaka(kpis.totalDue)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Across {kpis.customersWithDue} pending accounts
          </span>
        </div>

        {/* Total Collections (Paid) */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Collections
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatTaka(kpis.totalPaid)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Settled successfully
          </span>
        </div>

        {/* Total Invoiced Amount */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Invoiced
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatTaka(kpis.totalAmount)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Gross sales volume
          </span>
        </div>

        {/* Outstanding Accounts */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Due Accounts
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400 tracking-tight">
            {kpis.customersWithDue} / {records.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Active credit accounts
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Filter Controls Row */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            {/* SHOW Dropdown */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Show
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700/80 rounded-md px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Status / Due Filter Dropdown */}
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Filter by Status
              </label>
              <div className="relative">
                <select
                  value={dateRangeFilter}
                  onChange={(e) => {
                    setDateRangeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700/80 rounded-md pl-9 pr-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all cursor-pointer"
                >
                  <option value="all">All Accounts (All Records)</option>
                  <option value="due_only">With Outstanding Due</option>
                  <option value="cleared_only">Fully Cleared Only</option>
                </select>
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* SEARCH Input */}
            <div className="sm:col-span-6">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Search Customer
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by customer name, phone, address..."
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700/80 rounded-md pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-[#13161f] border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <th className="py-3.5 px-4 w-12 text-center">SL</th>
                <th className="py-3.5 px-4 min-w-[200px]">Customer Info</th>
                <th className="py-3.5 px-4 min-w-[110px] text-center">Invoices</th>
                <th className="py-3.5 px-4 min-w-[130px]">Total Amount</th>
                <th className="py-3.5 px-4 min-w-[130px]">Total Paid</th>
                <th className="py-3.5 px-4 min-w-[140px]">Total Due</th>
                <th className="py-3.5 px-4 min-w-[100px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No customer due records found
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try adjusting your search query or status filter settings
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item, idx) => {
                  const sl = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* SL */}
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400 dark:text-slate-500">
                        {sl}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                          {item.phone}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-normal truncate max-w-[240px]">
                          {item.address}
                        </div>
                      </td>

                      {/* Total Invoice */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.totalInvoice}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        {formatTaka(item.totalAmount)}
                      </td>

                      {/* Total Paid (Emerald Green) */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatTaka(item.totalPaid)}
                      </td>

                      {/* Total Due (Rose Red or Cleared) */}
                      <td className="py-3.5 px-4 text-sm">
                        {item.totalDue > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatTaka(item.totalDue)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          {/* View details / ledger button */}
                          <button
                            onClick={() => {
                              setActiveLedgerRecord(item);
                              setActiveLedgerTab("invoices");
                            }}
                            className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors cursor-pointer"
                            title="View customer ledger & invoices"
                            aria-label={`View ledger for ${item.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Collect due / payment button */}
                          <button
                            onClick={() => handleOpenPayment(item)}
                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                            title={
                              item.totalDue > 0
                                ? `Collect due payment (${formatTaka(item.totalDue)})`
                                : "Add payment record"
                            }
                            aria-label={`Collect payment from ${item.name}`}
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(currentPage * pageSize, filteredRecords.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {filteredRecords.length}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${currentPage === pg
                  ? "bg-[#202938] dark:bg-teal-600 text-white font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================= MODAL 1: VIEW CUSTOMER LEDGER & INVOICES ======================= */}
      {activeLedgerRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Customer Due Ledger
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeLedgerRecord.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Phone: {activeLedgerRecord.phone} • {activeLedgerRecord.address}
                </p>
              </div>
              <button
                onClick={() => setActiveLedgerRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-md bg-slate-50 dark:bg-[#12141c] border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    Total Billed
                  </span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatTaka(activeLedgerRecord.totalAmount)}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {activeLedgerRecord.totalInvoice} Invoices
                  </span>
                </div>
                <div className="p-3.5 rounded-md bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                    Total Paid
                  </span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatTaka(activeLedgerRecord.totalPaid)}
                  </div>
                  <span className="text-[10px] text-emerald-600/80">Collected to date</span>
                </div>
                <div className="p-3.5 rounded-md bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/40">
                  <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">
                    Outstanding Due
                  </span>
                  <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {formatTaka(activeLedgerRecord.totalDue)}
                  </div>
                  <span className="text-[10px] text-rose-600/80">Unsettled balance</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveLedgerTab("invoices")}
                  className={`pb-2.5 px-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeLedgerTab === "invoices"
                    ? "border-teal-600 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                >
                  Invoices Breakdown ({activeLedgerRecord.invoices?.length || 0})
                </button>
                <button
                  onClick={() => setActiveLedgerTab("payments")}
                  className={`pb-2.5 px-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeLedgerTab === "payments"
                    ? "border-teal-600 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                >
                  Payment Receipts ({activeLedgerRecord.paymentHistory?.length || 0})
                </button>
              </div>

              {/* Tab 1: Invoices */}
              {activeLedgerTab === "invoices" && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#12141c] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Bill Amount</th>
                        <th className="py-2.5 px-3">Paid</th>
                        <th className="py-2.5 px-3">Due</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                      {activeLedgerRecord.invoices?.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{inv.date}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                            {formatTaka(inv.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                            {formatTaka(inv.paidAmount)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                            {formatTaka(inv.dueAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.status === "Paid"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                                : inv.status === "Partial"
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                                }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Payments */}
              {activeLedgerTab === "payments" && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#12141c] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Account</th>
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                      {activeLedgerRecord.paymentHistory &&
                        activeLedgerRecord.paymentHistory.length > 0 ? (
                        activeLedgerRecord.paymentHistory.map((pay) => (
                          <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 text-slate-500">{pay.date}</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                              {formatTaka(pay.amount)}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                              {pay.accountName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                              {pay.reference || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{pay.note || "—"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            No payment history logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#12141c]/50">
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Statement
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveLedgerRecord(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {activeLedgerRecord.totalDue > 0 && (
                  <button
                    onClick={() => {
                      const rec = activeLedgerRecord;
                      setActiveLedgerRecord(null);
                      handleOpenPayment(rec);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-[#202938] hover:bg-[#141b25] text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Collect Due Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL 2: COLLECT DUE PAYMENT MODAL ======================= */}
      {activePaymentRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Payment Collection Voucher
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Receive From: {activePaymentRecord.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Phone: {activePaymentRecord.phone} • Address: {activePaymentRecord.address}
                </p>
              </div>
              <button
                onClick={() => setActivePaymentRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4">
              {/* Outstanding Due Banner */}
              <div className="p-3.5 rounded-md bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Outstanding Customer Due
                  </span>
                  <div className="text-xl font-bold text-rose-700 dark:text-rose-400">
                    {formatTaka(activePaymentRecord.totalDue)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 block">Total Billed</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatTaka(activePaymentRecord.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Received Amount (৳) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePresetPay("full")}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/60 dark:border-teal-800/60 transition-colors cursor-pointer"
                    >
                      Collect Full Due
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetPay("half")}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetPay("clear")}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5 inline" /> Clear
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activePaymentRecord.totalDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount to collect..."
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700/80 rounded-md px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              {/* Live Remaining Due Calculation */}
              <div className="p-3 rounded-md bg-slate-50 dark:bg-[#12141c] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Remaining Due After This Payment:
                </span>
                <span
                  className={`font-bold ${remainingDuePreview === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                    }`}
                >
                  {remainingDuePreview === 0 ? "✓ ৳ 0.00 (Fully Settled)" : formatTaka(remainingDuePreview)}
                </span>
              </div>

              {/* Deposit Into Account */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Receiving Financial Account <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700/80 rounded-md pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
                    required
                  >
                    <option value="Cash Account (Counter 1)">Cash Account (Counter 1)</option>
                    <option value="Bkash Merchant (01745968975)">Bkash Merchant (01745968975)</option>
                    <option value="Islami Bank PLC (1701570001814)">
                      Islami Bank PLC (1701570001814)
                    </option>
                    <option value="City Bank Corp (123231321213)">
                      City Bank Corp (123231321213)
                    </option>
                    <option value="Nagad Enterprise (01823456789)">
                      Nagad Enterprise (01823456789)
                    </option>
                  </select>
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Date & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Payment Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Receipt / Trx Reference
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. REC-8921"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Note / Remarks */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Remarks / Note
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Settlement for overdue invoice"
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivePaymentRecord(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-[#202938] hover:bg-[#141b25] text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

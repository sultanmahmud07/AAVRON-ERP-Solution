import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  Calendar,
  Edit2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  TransactionRecord,
  getStoredTransactions,
  updateStoredTransaction,
} from "./accountingStorage";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  // Filters
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dateRange, setDateRange] = useState<string>("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal
  const [editingTx, setEditingTx] = useState<TransactionRecord | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editTxId, setEditTxId] = useState("");

  // Load data
  const loadData = () => {
    setTransactions(getStoredTransactions());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_accounting_updated", handleUpdate);
    return () => window.removeEventListener("nexora_accounting_updated", handleUpdate);
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (transactionTypeFilter !== "all") {
      result = result.filter((t) => t.type.toLowerCase().includes(transactionTypeFilter.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.accountName.toLowerCase().includes(q) ||
          t.accountNumber.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.transactionId && t.transactionId.toLowerCase().includes(q))
      );
    }

    return result;
  }, [transactions, transactionTypeFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Edit action
  const handleOpenEdit = (tx: TransactionRecord) => {
    setEditingTx(tx);
    setEditDesc(tx.description);
    setEditTxId(tx.transactionId === "--" ? "" : tx.transactionId || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    updateStoredTransaction(editingTx.id, {
      description: editDesc.trim(),
      transactionId: editTxId.trim() || "--",
    });

    toast.success("Transaction updated");
    setEditingTx(null);
  };

  // Export CSV
  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = ["SL", "Date", "Account Name", "Account Number", "Amount", "Type", "Transaction ID", "Description"];
    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      t.date,
      `"${t.accountName}"`,
      `"${t.accountNumber}"`,
      t.amount,
      t.type,
      `"${t.transactionId || "--"}"`,
      `"${t.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaction_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported successfully");
  };

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== TOP HEADER (Matching Reference Image transaction_history.png) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            Transactions
          </h1>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Transactions</span>
        </button>
      </div>

      {/* ===================== MAIN TABLE CARD (Matching Reference Image transaction_history.png) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
          {/* SHOW */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">SHOW</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* DATE RANGE */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">DATE RANGE</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Select date range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-44 px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
              <Calendar className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* TRANSACTION TYPE */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">TRANSACTION TYPE</span>
            <select
              value={transactionTypeFilter}
              onChange={(e) => {
                setTransactionTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Transaction type</option>
              <option value="credit">Credit (++)</option>
              <option value="debit">Debit (--)</option>
            </select>
          </div>

          {/* SEARCH */}
          <div className="relative w-full sm:w-64 ml-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block sm:hidden mb-0.5">SEARCH</span>
            <input
              type="text"
              placeholder="Search transaction..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table Content matching Reference Image transaction_history.png */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3 px-4 w-14">SL</th>
                <th className="py-3 px-4 min-w-[110px]">Date</th>
                <th className="py-3 px-4 min-w-[140px]">Account Name</th>
                <th className="py-3 px-4 min-w-[150px]">Account Number</th>
                <th className="py-3 px-4 min-w-[110px]">Amount</th>
                <th className="py-3 px-4 min-w-[110px]">Type</th>
                <th className="py-3 px-4 min-w-[130px]">Transaction ID</th>
                <th className="py-3 px-4 min-w-[280px]">Description</th>
                <th className="py-3 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, idx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {tx.accountName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {tx.accountNumber}
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-slate-900 dark:text-white">
                      {tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {tx.type === "Credit (++)" ? (
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400">
                          Credit (++)
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#fee2e2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400">
                          Debit (--)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                      {tx.transactionId || "--"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition mx-auto"
                        title="Edit Description"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===================== TABLE FOOTER & PAGINATION (Exact Reference Image transaction_history.png) ===================== */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing {filteredTransactions.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} results
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40"
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition ${
                    currentPage === pg
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40"
              >
                »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Edit Transaction
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="Reference / Transaction ID"
                  value={editTxId}
                  onChange={(e) => setEditTxId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

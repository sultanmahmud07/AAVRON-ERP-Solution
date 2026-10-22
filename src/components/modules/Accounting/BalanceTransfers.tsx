import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  ArrowLeft,
  Calendar,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccountRecord,
  BalanceTransferRecord,
  getStoredAccounts,
  getStoredTransfers,
  addStoredTransfer,
  deleteStoredTransfer,
  formatTaka,
} from "./accountingStorage";

export default function BalanceTransfers() {
  const [transfers, setTransfers] = useState<BalanceTransferRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "create">("list");

  // Filters
  const [pageSize, setPageSize] = useState<number>(10);
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State matching Reference Image balance_transfer.png
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amountInput, setAmountInput] = useState<number | string>("");
  const [feeInput, setFeeInput] = useState<number | string>("");
  const [transferDate, setTransferDate] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  });
  const [descriptionInput, setDescriptionInput] = useState("");

  // Load data
  const loadData = () => {
    setTransfers(getStoredTransfers());
    setAccounts(getStoredAccounts());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_accounting_updated", handleUpdate);
    return () => window.removeEventListener("nexora_accounting_updated", handleUpdate);
  }, []);

  // Net Amount calculation
  const calculatedNetAmount = useMemo(() => {
    const amt = parseFloat(String(amountInput)) || 0;
    const fee = parseFloat(String(feeInput)) || 0;
    return Math.max(0, amt - fee);
  }, [amountInput, feeInput]);

  // Filtered transfers
  const filteredTransfers = useMemo(() => {
    let result = [...transfers];

    if (accountFilter !== "all") {
      result = result.filter(
        (t) =>
          t.fromAccountId === accountFilter ||
          t.toAccountId === accountFilter ||
          t.fromAccountName === accountFilter ||
          t.toAccountName === accountFilter
      );
    }

    if (userFilter !== "all") {
      result = result.filter((t) => t.transferBy.toLowerCase() === userFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.fromAccountName.toLowerCase().includes(q) ||
          t.toAccountName.toLowerCase().includes(q) ||
          (t.reason && t.reason.toLowerCase().includes(q))
      );
    }

    return result.slice(0, pageSize);
  }, [transfers, accountFilter, userFilter, searchQuery, pageSize]);

  // Open Create
  const handleOpenCreate = () => {
    const available = accounts.filter((a) => a.status === "Active");
    setFromAccountId(available.length > 0 ? available[0].id : "");
    setToAccountId(available.length > 1 ? available[1].id : "");
    setAmountInput("");
    setFeeInput("");
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    setTransferDate(`${mm}/${dd}/${yyyy}`);
    setDescriptionInput("");
    setViewMode("create");
  };

  // Submit Transfer
  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromAccountId || !toAccountId) {
      toast.error("Please select both source and destination accounts");
      return;
    }

    if (fromAccountId === toAccountId) {
      toast.error("Source and destination accounts cannot be the same");
      return;
    }

    const amt = parseFloat(String(amountInput));
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid transfer amount");
      return;
    }

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);

    if (!fromAcc || !toAcc) {
      toast.error("Selected account could not be found");
      return;
    }

    const fee = parseFloat(String(feeInput)) || 0;
    if (fromAcc.currentBalance < amt + fee) {
      toast.error(
        `Insufficient funds in ${fromAcc.accountName}. Available: ৳${fromAcc.currentBalance.toFixed(2)}`
      );
      return;
    }

    addStoredTransfer({
      fromAccountId: fromAcc.id,
      fromAccountName: fromAcc.accountName,
      fromAccountNumber: fromAcc.accountNumber,
      toAccountId: toAcc.id,
      toAccountName: toAcc.accountName,
      toAccountNumber: toAcc.accountNumber,
      amount: amt,
      charge: fee,
      netAmount: calculatedNetAmount || amt,
      transferBy: "Admin",
      date: transferDate,
      reason: descriptionInput.trim() || undefined,
    });

    toast.success(
      `Transferred ৳${amt.toFixed(2)} from ${fromAcc.accountName} to ${toAcc.accountName}`
    );
    setViewMode("list");
  };

  // Delete transfer record
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transfer record?")) {
      deleteStoredTransfer(id);
      toast.success("Transfer record deleted");
    }
  };

  // If in Create Mode, render matching Reference Image balance_transfer.png
  if (viewMode === "create") {
    return (
      <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
        <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-2xs space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                BALANCE TRANSFER
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                Balance Transfer
              </h2>
            </div>
            <button
              onClick={() => setViewMode("list")}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to list</span>
            </button>
          </div>

          {/* Form matching Reference Image balance_transfer.png */}
          <form onSubmit={handleSubmitTransfer} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select From Account * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select From Account <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Select From Account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} (৳ {acc.currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select To Account * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select To Account <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Select To Account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} (৳ {acc.currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="500"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fee
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Enter fee (if any)"
                  value={feeInput}
                  onChange={(e) => setFeeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Net Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Net Amount
                </label>
                <input
                  type="text"
                  readOnly
                  value={calculatedNetAmount}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* Date * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="MM/DD/YYYY"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter description (optional)"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-7 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                Transfer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== TOP HEADER (Matching Reference Image 5) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            Balance Transfers
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Transfer Balance</span>
        </button>
      </div>

      {/* ===================== MAIN TABLE CARD (Matching Reference Image 5) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
          {/* SHOW */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">SHOW</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* ACCOUNT */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">ACCOUNT</span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName}
                </option>
              ))}
            </select>
          </div>

          {/* USER */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">USER</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Select User</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          {/* SEARCH */}
          <div className="relative w-full sm:w-64 ml-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block sm:hidden mb-0.5">SEARCH</span>
            <input
              type="text"
              placeholder="Search transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table Content matching Reference Image 5 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3 px-4 w-14">SL</th>
                <th className="py-3 px-4 min-w-[120px]">Date</th>
                <th className="py-3 px-4 min-w-[130px]">Transfer By</th>
                <th className="py-3 px-4 min-w-[150px]">From Account</th>
                <th className="py-3 px-4 min-w-[150px]">To Account</th>
                <th className="py-3 px-4 min-w-[120px]">Amount</th>
                <th className="py-3 px-4 min-w-[90px]">Charge</th>
                <th className="py-3 px-4 min-w-[180px]">Reason</th>
                <th className="py-3 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No balance transfers found.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((trans, idx) => (
                  <tr
                    key={trans.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {trans.date}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {trans.transferBy}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {trans.fromAccountName}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {trans.toAccountName}
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {formatTaka(trans.amount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {trans.charge > 0 ? formatTaka(trans.charge) : "0.00"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {trans.reason || "--"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(trans.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition mx-auto"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

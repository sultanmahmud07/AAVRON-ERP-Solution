import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccountRecord,
  AccountAdjustmentRecord,
  getStoredAccounts,
  getStoredAdjustments,
  addStoredAdjustment,
  updateStoredAdjustment,
  deleteStoredAdjustment,
} from "./accountingStorage";

export default function BalanceAdjustments() {
  const [adjustments, setAdjustments] = useState<AccountAdjustmentRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingAdj, setEditingAdj] = useState<AccountAdjustmentRecord | null>(null);

  // Filters
  const [pageSize, setPageSize] = useState<number>(10);
  const [adjustmentTypeFilter, setAdjustmentTypeFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");

  // Form State
  const [formAccountId, setFormAccountId] = useState("");
  const [formType, setFormType] = useState<"Credit (++)" | "Debit (--)">("Credit (++)");
  const [formAmount, setFormAmount] = useState<number | string>("");
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [formReason, setFormReason] = useState("");

  // Load data
  const loadData = () => {
    setAdjustments(getStoredAdjustments());
    setAccounts(getStoredAccounts());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_accounting_updated", handleUpdate);
    return () => window.removeEventListener("nexora_accounting_updated", handleUpdate);
  }, []);

  // Filtered list
  const filteredAdjustments = useMemo(() => {
    let result = [...adjustments];

    if (adjustmentTypeFilter !== "all") {
      result = result.filter((a) => a.type.toLowerCase().includes(adjustmentTypeFilter.toLowerCase()));
    }

    if (accountFilter !== "all") {
      result = result.filter(
        (a) => a.accountId === accountFilter || a.accountName === accountFilter
      );
    }

    return result.slice(0, pageSize);
  }, [adjustments, adjustmentTypeFilter, accountFilter, pageSize]);

  // Open Edit
  const handleOpenEdit = (adj: AccountAdjustmentRecord) => {
    setEditingAdj(adj);
    setFormAccountId(adj.accountId);
    setFormType(adj.type);
    setFormAmount(adj.amount);
    setFormDate(adj.date);
    setFormReason(adj.reason || "");
    setViewMode("edit");
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingAdj(null);
    setFormAccountId(accounts.length > 0 ? accounts[0].id : "");
    setFormType("Credit (++)");
    setFormAmount("");
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    setFormDate(`${dd}/${mm}/${yyyy}`);
    setFormReason("");
    setViewMode("create");
  };

  // Handle Form Submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccountId) {
      toast.error("Please select an account");
      return;
    }
    const amt = parseFloat(String(formAmount));
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const selectedAcc = accounts.find((a) => a.id === formAccountId);
    if (!selectedAcc) {
      toast.error("Selected account not found");
      return;
    }

    if (viewMode === "edit" && editingAdj) {
      updateStoredAdjustment(editingAdj.id, {
        accountId: formAccountId,
        accountName: selectedAcc.accountName,
        accountNumber: selectedAcc.accountNumber,
        amount: amt,
        type: formType,
        date: formDate,
        reason: formReason.trim(),
      });
      toast.success("Adjustment updated successfully");
    } else {
      addStoredAdjustment({
        accountId: formAccountId,
        accountName: selectedAcc.accountName,
        accountNumber: selectedAcc.accountNumber,
        amount: amt,
        type: formType,
        date: formDate,
        reason: formReason.trim(),
      });
      toast.success(`Adjustment of ৳${amt.toFixed(2)} recorded on ${selectedAcc.accountName}`);
    }

    setViewMode("list");
  };

  // Delete
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this adjustment?")) {
      deleteStoredAdjustment(id);
      toast.success("Adjustment deleted");
    }
  };

  // If create / edit mode, render Reference Image 4
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
        <div className="bg-white dark:bg-[#181b24] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-2xs space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ACCOUNT ADJUSTMENT
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {viewMode === "edit" ? "Edit Adjustment" : "Account Adjustment"}
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

          {/* Form matching Reference Image 4 */}
          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Account * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Account <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Select an account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} ({acc.accountNumber}) - Bal: ৳{acc.currentBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustment Type * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Adjustment Type <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as "Credit (++)" | "Debit (--)")}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Credit (++)">Credit (++)</option>
                  <option value="Debit (--)">Debit (--)</option>
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
                  min="0.01"
                  required
                  placeholder="Enter amount"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    placeholder="DD/MM/YYYY"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Reason */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter reason (optional)"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                {viewMode === "edit" ? "Save Changes" : "Create Adjustment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== TOP HEADER (Matching Reference Image 3) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            Accounts Adjustments
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Adjustment</span>
        </button>
      </div>

      {/* ===================== MAIN TABLE CARD (Matching Reference Image 3) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-4">
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

          {/* ADJUSTMENT TYPE */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">ADJUSTMENT TYPE</span>
            <select
              value={adjustmentTypeFilter}
              onChange={(e) => setAdjustmentTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Adjustment Type</option>
              <option value="credit">Credit (++)</option>
              <option value="debit">Debit (--)</option>
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
        </div>

        {/* Table Content matching Reference Image 3 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3 px-4 w-14">SL</th>
                <th className="py-3 px-4 min-w-[120px]">Date</th>
                <th className="py-3 px-4 min-w-[150px]">Account Name</th>
                <th className="py-3 px-4 min-w-[160px]">Account Number</th>
                <th className="py-3 px-4 min-w-[120px]">Amount</th>
                <th className="py-3 px-4 min-w-[120px]">Type</th>
                <th className="py-3 px-4 min-w-[180px]">Reason</th>
                <th className="py-3 px-4 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No adjustments found.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj, idx) => (
                  <tr
                    key={adj.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {adj.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {adj.accountName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {adj.accountNumber}
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-slate-900 dark:text-white">
                      {adj.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {adj.type === "Credit (++)" ? (
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400">
                          Credit (++)
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#fee2e2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400">
                          Debit (--)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {adj.reason || "--"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(adj)}
                          className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition"
                          title="Edit Adjustment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(adj.id)}
                          className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition"
                          title="Delete Adjustment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

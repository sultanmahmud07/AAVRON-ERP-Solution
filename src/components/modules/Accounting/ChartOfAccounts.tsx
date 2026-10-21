import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Printer,
  FileText,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccountRecord,
  getStoredAccounts,
  addStoredAccount,
  updateStoredAccount,
  deleteStoredAccount,
  formatTaka,
} from "./accountingStorage";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingAccount, setEditingAccount] = useState<AccountRecord | null>(null);

  // Filters
  const [pageSize, setPageSize] = useState<number>(25);
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create / Edit Form State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"Cash" | "Bank" | "MFS">("Cash");
  const [formNumber, setFormNumber] = useState("");
  const [formBranch, setFormBranch] = useState("");
  const [formOpeningBalance, setFormOpeningBalance] = useState<number | string>("0.00");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");

  // Load accounts
  const loadAccounts = () => {
    setAccounts(getStoredAccounts());
  };

  useEffect(() => {
    loadAccounts();
    const handleUpdate = () => loadAccounts();
    window.addEventListener("nexora_accounting_updated", handleUpdate);
    return () => window.removeEventListener("nexora_accounting_updated", handleUpdate);
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = accounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
    const cash = accounts
      .filter((a) => a.type === "Cash")
      .reduce((acc, a) => acc + (a.currentBalance || 0), 0);
    const bank = accounts
      .filter((a) => a.type === "Bank")
      .reduce((acc, a) => acc + (a.currentBalance || 0), 0);
    const mfs = accounts
      .filter((a) => a.type === "MFS")
      .reduce((acc, a) => acc + (a.currentBalance || 0), 0);
    const totalOpening = accounts.reduce((acc, a) => acc + (a.openingBalance || 0), 0);
    return { total, cash, bank, mfs, totalOpening };
  }, [accounts]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    if (accountTypeFilter !== "all") {
      result = result.filter((a) => a.type.toLowerCase() === accountTypeFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.accountName.toLowerCase().includes(q) ||
          a.accountNumber.toLowerCase().includes(q) ||
          (a.branch && a.branch.toLowerCase().includes(q))
      );
    }

    return result.slice(0, pageSize);
  }, [accounts, accountTypeFilter, searchQuery, pageSize]);

  // Open Edit
  const handleOpenEdit = (acc: AccountRecord) => {
    setEditingAccount(acc);
    setFormName(acc.accountName);
    setFormType(acc.type);
    setFormNumber(acc.accountNumber);
    setFormBranch(acc.branch === "--" ? "" : acc.branch || "");
    setFormOpeningBalance(acc.openingBalance);
    setFormStatus(acc.status);
    setViewMode("edit");
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingAccount(null);
    setFormName("");
    setFormType("Cash");
    setFormNumber("");
    setFormBranch("");
    setFormOpeningBalance("0.00");
    setFormStatus("Active");
    setViewMode("create");
  };

  // Save Account
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNumber.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const openBal = parseFloat(String(formOpeningBalance)) || 0;

    if (viewMode === "edit" && editingAccount) {
      updateStoredAccount(editingAccount.id, {
        accountName: formName.trim(),
        type: formType,
        accountNumber: formNumber.trim(),
        branch: formBranch.trim() || "--",
        openingBalance: openBal,
        status: formStatus,
      });
      toast.success(`Account "${formName}" updated successfully`);
    } else {
      addStoredAccount({
        accountName: formName.trim(),
        type: formType,
        accountNumber: formNumber.trim(),
        branch: formBranch.trim() || "--",
        openingBalance: openBal,
        currentBalance: openBal,
        status: formStatus,
      });
      toast.success(`Account "${formName}" created successfully`);
    }

    setViewMode("list");
  };

  // Delete Account
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete account "${name}"?`)) {
      deleteStoredAccount(id);
      toast.success(`Account "${name}" deleted`);
    }
  };

  // Export CSV / Excel
  const handleExportCSV = () => {
    const headers = ["SL", "Account Number", "Account Name", "Type", "Branch", "Opening Balance", "Current Balance", "Status"];
    const rows = filteredAccounts.map((a, idx) => [
      idx + 1,
      `"${a.accountNumber}"`,
      `"${a.accountName}"`,
      a.type,
      `"${a.branch || "--"}"`,
      a.openingBalance,
      a.currentBalance,
      a.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chart_of_accounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Accounts exported successfully");
  };

  // If in Create / Edit view mode, render Image 2
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
        <div className="bg-white dark:bg-[#181b24] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-2xs space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ACCOUNT
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {viewMode === "edit" ? "Edit Account" : "Create Account"}
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

          {/* Form matching Reference Image 2 */}
          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Name * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter account name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Account Type * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as "Cash" | "Bank" | "MFS")}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="MFS">MFS</option>
                </select>
              </div>

              {/* Account Number * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter account number"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Branch
                </label>
                <input
                  type="text"
                  placeholder="Enter branch name"
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Opening Balance */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Opening Balance
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={formOpeningBalance}
                  onChange={(e) => setFormOpeningBalance(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                {viewMode === "edit" ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== TOP HEADER (Matching Reference Image 1) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            Chart of Accounts
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Account</span>
        </button>
      </div>

      {/* ===================== 4 SUMMARY STAT CARDS (Exact Reference Image 1) ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-white dark:bg-[#181b24] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              Total Balance
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block tracking-tight">
              {formatTaka(metrics.total)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#e8f8ee] dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 text-xl shadow-2xs">
            💸
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-white dark:bg-[#181b24] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              Cash Balance
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block tracking-tight">
              {formatTaka(metrics.cash)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#e8f8ee] dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 text-xl shadow-2xs">
            💵
          </div>
        </div>

        {/* Bank Balance */}
        <div className="bg-white dark:bg-[#181b24] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              Bank Balance
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block tracking-tight">
              {formatTaka(metrics.bank)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#f0f4ff] dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 text-xl shadow-2xs">
            🏦
          </div>
        </div>

        {/* MFS Balance */}
        <div className="bg-white dark:bg-[#181b24] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              MFS Balance
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block tracking-tight">
              {formatTaka(metrics.mfs)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#fbf0ff] dark:bg-purple-950/50 flex items-center justify-center text-purple-600 text-xl shadow-2xs">
            📲
          </div>
        </div>
      </div>

      {/* ===================== MAIN TABLE CARD (Exact Reference Image 1) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
                <option value={100}>100</option>
              </select>
            </div>

            {/* ACCOUNT TYPE */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">ACCOUNT TYPE</span>
              <select
                value={accountTypeFilter}
                onChange={(e) => setAccountTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Types</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="MFS">MFS</option>
              </select>
            </div>

            {/* SEARCH */}
            <div className="relative w-full sm:w-60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block sm:hidden mb-0.5">SEARCH</span>
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right Export Buttons (Print, PDF, Excel matching Image 1) */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg hover:bg-rose-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg hover:bg-emerald-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Table Content matching Reference Image 1 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3 px-4 w-14">SL</th>
                <th className="py-3 px-4 min-w-[150px]">Account Number</th>
                <th className="py-3 px-4 min-w-[180px]">Account Name</th>
                <th className="py-3 px-4 w-24">Type</th>
                <th className="py-3 px-4 min-w-[130px]">Branch</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Opening Balance</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Current Balance</th>
                <th className="py-3 px-4 w-24 text-center">Status</th>
                <th className="py-3 px-4 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, idx) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {acc.accountName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eef2ff] text-[#4f46e5] dark:bg-indigo-950/60 dark:text-indigo-300">
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {acc.branch || "--"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                      {formatTaka(acc.openingBalance)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatTaka(acc.currentBalance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          acc.status === "Active"
                            ? "bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-[#fee2e2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition"
                          title="Edit Account"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id, acc.accountName)}
                          className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer with Total Balance matching Image 1 */}
            {filteredAccounts.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/70 dark:bg-slate-900/60 font-bold border-t border-slate-200 dark:border-slate-800">
                  <td colSpan={5} className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                    Total Balance
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-white">
                    {formatTaka(metrics.totalOpening)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-indigo-600 dark:text-indigo-400">
                    {formatTaka(metrics.total)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

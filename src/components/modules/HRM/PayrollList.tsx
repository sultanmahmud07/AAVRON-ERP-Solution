import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  Printer,
  Download,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  X,
  RotateCw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredPayrolls,
  deleteStoredPayroll,
  updateStoredPayroll,
  getStoredDepartments,
  PayrollItem,
} from "./hrmStorage";

export default function PayrollList() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState<PayrollItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangeText] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "net-desc" | "net-asc">("default");

  // Dropdown open states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<PayrollItem | null>(null);
  const [viewPayslipItem, setViewPayslipItem] = useState<PayrollItem | null>(null);

  const loadData = () => {
    const stored = getStoredPayrolls();
    setPayrolls(stored);

    const depts = getStoredDepartments().map((d) => d.name);
    setDepartments(depts.length > 0 ? depts : ["Engineering", "Design", "HR", "Finance", "Sales", "Marketing"]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_payrolls_updated", handleUpdate);
    window.addEventListener("nexora_departments_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_payrolls_updated", handleUpdate);
      window.removeEventListener("nexora_departments_updated", handleUpdate);
    };
  }, []);

  // Filter & Sort
  const processedPayrolls = useMemo(() => {
    let result = [...payrolls];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.employeeName.toLowerCase().includes(q) ||
          p.payrollId.toLowerCase().includes(q) ||
          p.designation.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (deptFilter !== "all") {
      result = result.filter((p) => p.department.toLowerCase() === deptFilter.toLowerCase());
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    } else if (sortBy === "net-desc") {
      result.sort((a, b) => b.netPay - a.netPay);
    } else if (sortBy === "net-asc") {
      result.sort((a, b) => a.netPay - b.netPay);
    }

    return result;
  }, [payrolls, searchQuery, statusFilter, deptFilter, sortBy]);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredPayroll(deleteTarget.id);
    toast.success(`Payroll record ${deleteTarget.payrollId} deleted`);
    setDeleteTarget(null);
    loadData();
  };

  const handleToggleStatus = (item: PayrollItem) => {
    const nextStatus = item.status === "Paid" ? "Pending" : "Paid";
    updateStoredPayroll(item.id, { status: nextStatus });
    toast.success(`Payroll status updated to ${nextStatus}`);
    setActiveMenuId(null);
    loadData();
  };

  // Export handlers
  const handleExportPDF = () => {
    window.print();
    setIsExportOpen(false);
  };

  const handleExportExcel = () => {
    const headers = ["ID", "Employee", "Designation", "Department", "Basic", "Bonus", "Net Pay", "Status"];
    const rows = processedPayrolls.map((p) => [
      p.payrollId,
      `"${p.employeeName}"`,
      `"${p.designation}"`,
      `"${p.department}"`,
      p.basic,
      p.bonus,
      p.netPay,
      p.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportOpen(false);
    toast.success("Payroll exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP HEADER BAR (Matching Reference Image 3)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Payroll
          </h1>
        </div>

        {/* Right actions: Print, Export, + Add New */}
        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Print</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Export</span>
              <span className="text-[10px]">▾</span>
            </button>

            {isExportOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsExportOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1.5 z-30 text-xs">
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Export as Excel
                  </button>
                </div>
              </>
            )}
          </div>

          {/* + Add New Button */}
          <Link
            to="/hrm/payroll/add"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTAINER CARD (Matching Image 3)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-xs overflow-hidden">
        {/* Top Filter Toolbar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
          {/* Left: Search input + Date Range Picker */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-3 pr-8 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Range Button matching Image 3: "01 Jan 26 to 20 Jan 26" */}
            <button
              type="button"
              onClick={() => toast.info(`Current Date Range: ${dateRangeText}`)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRangeText}</span>
            </button>
          </div>

          {/* Right Toolbar: Filter and Sort By */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
                <span className="text-[10px]">▾</span>
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl p-3 z-30 text-xs space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Department
                      </label>
                      <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white"
                      >
                        <option value="all">All Departments</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setIsFilterOpen(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Paid">Paid Only</option>
                        <option value="Pending">Pending Only</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Sort By</span>
                <span className="text-[10px]">▾</span>
              </button>

              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1.5 z-30 text-xs">
                    <button
                      onClick={() => {
                        setSortBy("default");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "default" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Default
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name-asc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "name-asc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Employee Name (A-Z)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("net-desc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "net-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Net Pay (High to Low)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("net-asc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "net-asc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Net Pay (Low to High)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                loadData();
                toast.success("Payroll refreshed");
              }}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table matching Image 3 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 font-bold text-xs">
                <th className="py-3.5 px-4 font-bold">ID</th>
                <th className="py-3.5 px-4 font-bold">Employee</th>
                <th className="py-3.5 px-4 font-bold">Designation</th>
                <th className="py-3.5 px-4 font-bold">Department</th>
                <th className="py-3.5 px-4 font-bold">Basic</th>
                <th className="py-3.5 px-4 font-bold">Bonus</th>
                <th className="py-3.5 px-4 font-bold">Net Pay</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {processedPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                processedPayrolls.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400 font-mono">
                      {item.payrollId}
                    </td>

                    {/* Employee (Avatar + Name) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.employeePhoto}
                          alt={item.employeeName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                          }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.employeeName}
                        </span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.designation}
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.department}
                    </td>

                    {/* Basic */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      ${item.basic.toLocaleString()}
                    </td>

                    {/* Bonus */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      ${item.bonus.toLocaleString()}
                    </td>

                    {/* Net Pay */}
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      ${item.netPay.toLocaleString()}
                    </td>

                    {/* Status (Paid: emerald badge, Pending: amber badge) */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.status === "Paid"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors mx-auto"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuId === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1 z-30 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setViewPayslipItem(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Payslip</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item)}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                              >
                                <span className="w-3.5 text-center text-emerald-500 font-bold">✓</span>
                                <span>Mark {item.status === "Paid" ? "Pending" : "Paid"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  navigate(`/hrm/payroll/edit/${item.id}`);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDeleteTarget(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          PAYSLIP MODAL
          ========================================================================= */}
      {viewPayslipItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Payslip ({viewPayslipItem.payrollId})
                </h2>
                <p className="text-xs text-slate-500">
                  {viewPayslipItem.payrollMonth || "Jan 2026"} • {viewPayslipItem.department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewPayslipItem(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Employee Banner */}
            <div className="flex items-center gap-3 p-3.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
              <img
                src={viewPayslipItem.employeePhoto}
                alt={viewPayslipItem.employeeName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {viewPayslipItem.employeeName}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewPayslipItem.designation} • {viewPayslipItem.department}
                </p>
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${viewPayslipItem.status === "Paid"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}
                >
                  {viewPayslipItem.status}
                </span>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="bg-slate-50/60 dark:bg-slate-900/30 p-3.5 rounded-md border border-slate-100 dark:border-slate-800/80 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                  Earnings
                </h4>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Basic Salary:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ${viewPayslipItem.basic.toLocaleString()}
                  </span>
                </div>
                {viewPayslipItem.hra ? (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>HRA:</span>
                    <span>${viewPayslipItem.hra.toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Bonus:</span>
                  <span className="font-semibold text-emerald-600">
                    +${viewPayslipItem.bonus.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white">
                  <span>Total Earnings:</span>
                  <span>${(viewPayslipItem.totalEarnings || viewPayslipItem.basic + viewPayslipItem.bonus).toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-slate-50/60 dark:bg-slate-900/30 p-3.5 rounded-md border border-slate-100 dark:border-slate-800/80 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                  Deductions
                </h4>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>PF / Tax:</span>
                  <span>${((viewPayslipItem.pf || 0) + (viewPayslipItem.tds || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Other Deductions:</span>
                  <span>${(viewPayslipItem.otherDeductions || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white">
                  <span>Total Deductions:</span>
                  <span className="text-rose-600">
                    -${(viewPayslipItem.totalDeductions || (viewPayslipItem.basic + viewPayslipItem.bonus - viewPayslipItem.netPay)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="p-4 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                  Net Salary Payable
                </span>
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                  ${viewPayslipItem.netPay.toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow-xs hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Payslip</span>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setViewPayslipItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Payroll Record
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete payroll record{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {deleteTarget.payrollId} ({deleteTarget.employeeName})
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  Printer,
  Download,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  X,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredLeaves,
  addStoredLeave,
  updateStoredLeave,
  deleteStoredLeave,
  getStoredEmployees,
  getStoredLeaveTypes,
  LeaveItem,
} from "./hrmStorage";

export default function LeaveList() {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [employeesList, setEmployeesList] = useState<{ name: string; photo: string }[]>([]);
  const [leaveTypesList, setLeaveTypesList] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangeText] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "days-desc" | "days-asc">("default");

  // Dropdown open states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal state (Reference Image 4)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaveItem | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [leaveType, setLeaveType] = useState("Annual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [description, setDescription] = useState("");

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<LeaveItem | null>(null);
  const [viewDetailsItem, setViewDetailsItem] = useState<LeaveItem | null>(null);

  const loadData = () => {
    const stored = getStoredLeaves();
    setLeaves(stored);

    const emps = getStoredEmployees().map((e) => ({
      name: e.name,
      photo: e.photo,
    }));
    setEmployeesList(emps);

    const types = getStoredLeaveTypes().map((t) => t.name.replace(" Leave", ""));
    setLeaveTypesList(types.length > 0 ? types : ["Annual", "Sick", "Casual", "Maternity", "Paternity", "Bereavement"]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_leaves_updated", handleUpdate);
    window.addEventListener("nexora_employees_updated", handleUpdate);
    window.addEventListener("nexora_leave_types_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_leaves_updated", handleUpdate);
      window.removeEventListener("nexora_employees_updated", handleUpdate);
      window.removeEventListener("nexora_leave_types_updated", handleUpdate);
    };
  }, []);

  // Filter & Sort
  const processedLeaves = useMemo(() => {
    let result = [...leaves];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q) ||
          l.leaveType.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (typeFilter !== "all") {
      result = result.filter((l) => l.leaveType.toLowerCase() === typeFilter.toLowerCase());
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    } else if (sortBy === "days-desc") {
      result.sort((a, b) => b.days - a.days);
    } else if (sortBy === "days-asc") {
      result.sort((a, b) => a.days - b.days);
    }

    return result;
  }, [leaves, searchQuery, statusFilter, typeFilter, sortBy]);

  // Open modal for apply
  const handleOpenApplyModal = () => {
    setEditingItem(null);
    setSelectedEmployeeName(employeesList[0]?.name || "Ethan Walker");
    setLeaveType(leaveTypesList[0] || "Annual");
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    setDescription("");
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (item: LeaveItem) => {
    setEditingItem(item);
    setSelectedEmployeeName(item.employeeName);
    setLeaveType(item.leaveType);
    setFromDate(item.from);
    setToDate(item.to);
    setDescription(item.description || "");
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployeeName.trim()) {
      toast.error("Please select an employee");
      return;
    }

    const matchedEmp = employeesList.find((e) => e.name === selectedEmployeeName);

    // Format dates to "DD MMM YYYY" if formatted as YYYY-MM-DD
    const formatDateStr = (dStr: string) => {
      if (!dStr) return "";
      if (dStr.includes("-") && dStr.length === 10) {
        const parts = dStr.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = parts[0];
        const month = months[parseInt(parts[1], 10) - 1];
        const day = parts[2];
        return `${day} ${month} ${year}`;
      }
      return dStr;
    };

    const formattedFrom = formatDateStr(fromDate);
    const formattedTo = formatDateStr(toDate);

    if (editingItem) {
      updateStoredLeave(editingItem.id, {
        employeeName: selectedEmployeeName,
        employeePhoto: matchedEmp?.photo || editingItem.employeePhoto,
        leaveType,
        from: formattedFrom,
        to: formattedTo,
        description,
      });
      toast.success(`Leave request updated for ${selectedEmployeeName}`);
    } else {
      addStoredLeave({
        employeeName: selectedEmployeeName,
        employeePhoto: matchedEmp?.photo,
        leaveType,
        from: formattedFrom,
        to: formattedTo,
        status: "Pending",
        description,
      });
      toast.success(`Leave request applied for ${selectedEmployeeName}`);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  const handleUpdateStatus = (id: string, newStatus: "Approved" | "Pending" | "Rejected") => {
    updateStoredLeave(id, { status: newStatus });
    toast.success(`Leave status updated to ${newStatus}`);
    setActiveMenuId(null);
    loadData();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredLeave(deleteTarget.id);
    toast.success(`Leave record ${deleteTarget.code} deleted`);
    setDeleteTarget(null);
    loadData();
  };

  // Export handlers
  const handleExportPDF = () => {
    window.print();
    setIsExportOpen(false);
  };

  const handleExportExcel = () => {
    const headers = ["ID", "Employee", "Leave Type", "From", "To", "Days", "Status"];
    const rows = processedLeaves.map((l) => [
      l.code,
      `"${l.employeeName}"`,
      `"${l.leaveType}"`,
      `"${l.from}"`,
      `"${l.to}"`,
      l.days,
      l.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leaves_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportOpen(false);
    toast.success("Leaves exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP HEADER BAR (Matching Reference Image 3)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Leaves
          </h1>
        </div>

        {/* Right actions: Print, Export, + Apply Leave */}
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
                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-30 text-xs">
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

          {/* + Apply Leave Button (Image 3) */}
          <button
            onClick={handleOpenApplyModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTAINER CARD (Matching Image 3)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
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
                className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Range Button matching Image 3: "01 Jan 26 to 20 Jan 26" */}
            <button
              type="button"
              onClick={() => toast.info(`Current Date Range: ${dateRangeText}`)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
                <span className="text-[10px]">▾</span>
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-30 text-xs space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Leave Type
                      </label>
                      <select
                        value={typeFilter}
                        onChange={(e) => {
                          setTypeFilter(e.target.value);
                          setIsFilterOpen(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white"
                      >
                        <option value="all">All Types</option>
                        {leaveTypesList.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Sort By</span>
                <span className="text-[10px]">▾</span>
              </button>

              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-30 text-xs">
                    <button
                      onClick={() => {
                        setSortBy("default");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                        sortBy === "default" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Default
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name-asc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                        sortBy === "name-asc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Employee (A-Z)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("days-desc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                        sortBy === "days-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Days (High to Low)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("days-asc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                        sortBy === "days-asc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Days (Low to High)
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
                toast.success("Leaves refreshed");
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
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
                <th className="py-3.5 px-4 font-bold">Leave Type</th>
                <th className="py-3.5 px-4 font-bold">From</th>
                <th className="py-3.5 px-4 font-bold">To</th>
                <th className="py-3.5 px-4 font-bold">Days</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {processedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No leave records found matching your criteria.
                  </td>
                </tr>
              ) : (
                processedLeaves.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {item.code}
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

                    {/* Leave Type */}
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.leaveType}
                    </td>

                    {/* From */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {item.from}
                    </td>

                    {/* To */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {item.to}
                    </td>

                    {/* Days */}
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.days}
                    </td>

                    {/* Status Badge (Approved, Pending, Rejected) */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === "Approved"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                            : item.status === "Pending"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Action */}
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
                            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-30 text-xs">
                              {item.status !== "Approved" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item.id, "Approved")}
                                  className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 flex items-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Approve</span>
                                </button>
                              )}
                              {item.status !== "Rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(item.id, "Rejected")}
                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Reject</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setViewDetailsItem(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleOpenEditModal(item);
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
          ADD LEAVE MODAL (Matching Reference Image 4)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? "Edit Leave" : "Add Leave"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEmployeeName}
                  onChange={(e) => setSelectedEmployeeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  <option value="">Select Employee</option>
                  {employeesList.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Leave Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  {leaveTypesList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Date with calendar icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  From
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* To Date with calendar icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  To
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter reason for leave..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? "Save Changes" : "Add Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW DETAILS MODAL
          ========================================================================= */}
      {viewDetailsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Leave Details ({viewDetailsItem.code})
              </h2>
              <button
                type="button"
                onClick={() => setViewDetailsItem(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 py-2">
              <img
                src={viewDetailsItem.employeePhoto}
                alt={viewDetailsItem.employeeName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
              />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {viewDetailsItem.employeeName}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewDetailsItem.leaveType} Leave • {viewDetailsItem.days} Days
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Period:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {viewDetailsItem.from} - {viewDetailsItem.to}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-semibold ${
                    viewDetailsItem.status === "Approved"
                      ? "text-emerald-600"
                      : viewDetailsItem.status === "Pending"
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {viewDetailsItem.status}
                </span>
              </div>
              {viewDetailsItem.description && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">Reason:</span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {viewDetailsItem.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewDetailsItem(null)}
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
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Leave Record
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete leave record{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {deleteTarget.code} ({deleteTarget.employeeName})
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

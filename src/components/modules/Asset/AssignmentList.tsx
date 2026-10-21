import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  Calendar,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  RotateCcw,
  ChevronDown,
  MoreVertical,
  Wrench,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  AssignmentRecord,
  getStoredAssignments,
  addStoredAssignment,
  updateStoredAssignment,
  deleteStoredAssignment,
  getStoredAssets,
} from "./assetStorage";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [assetNames, setAssetNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"id" | "date" | "employee">("id");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentRecord | null>(null);

  // Form State
  const [formAssetName, setFormAssetName] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formDepartment, setFormDepartment] = useState("IT");
  const [formAssignmentDate, setFormAssignmentDate] = useState("11 Sep 2025");
  const [formReturnDate, setFormReturnDate] = useState("—");
  const [formStatus, setFormStatus] = useState<"Assigned" | "Repair" | "Returned">("Assigned");
  const [formNote, setFormNote] = useState("");

  // Delete Confirm Modal
  const [deletingAssignment, setDeletingAssignment] = useState<AssignmentRecord | null>(null);

  const loadData = () => {
    setAssignments(getStoredAssignments());
    const assets = getStoredAssets();
    setAssetNames(assets.map((a) => a.name));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_assets_updated", handleUpdate);
    return () => window.removeEventListener("nexora_assets_updated", handleUpdate);
  }, []);

  // Filtered & Sorted
  const filteredAssignments = useMemo(() => {
    let result = assignments.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        a.assignmentId.toLowerCase().includes(q) ||
        a.assetName.toLowerCase().includes(q) ||
        a.assignedTo.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (departmentFilter !== "all" && a.department !== departmentFilter) return false;

      return true;
    });

    if (sortBy === "employee") {
      result = [...result].sort((a, b) => a.assignedTo.localeCompare(b.assignedTo));
    }

    return result;
  }, [assignments, searchQuery, statusFilter, departmentFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / pageSize) || 1;
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, currentPage, pageSize]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setFormAssetName(assetNames[0] || "Dell Latitude");
    setFormAssignedTo("");
    setFormDepartment("IT");
    setFormAssignmentDate(
      new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    );
    setFormReturnDate("—");
    setFormStatus("Assigned");
    setFormNote("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (record: AssignmentRecord) => {
    setEditingAssignment(record);
    setFormAssetName(record.assetName);
    setFormAssignedTo(record.assignedTo);
    setFormDepartment(record.department);
    setFormAssignmentDate(record.assignmentDate);
    setFormReturnDate(record.returnDate);
    setFormStatus(record.status);
    setFormNote(record.note || "");
    setIsModalOpen(true);
  };

  // Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssetName.trim() || !formAssignedTo.trim()) {
      toast.error("Asset name and assigned employee are required");
      return;
    }

    const colorPresets = [
      "bg-teal-600",
      "bg-amber-600",
      "bg-purple-600",
      "bg-blue-600",
      "bg-orange-600",
      "bg-cyan-600",
      "bg-red-600",
      "bg-emerald-600",
      "bg-indigo-600",
    ];
    const randomColor = colorPresets[Math.floor(Math.random() * colorPresets.length)];

    if (editingAssignment) {
      updateStoredAssignment(editingAssignment.id, {
        assetName: formAssetName.trim(),
        assignedTo: formAssignedTo.trim(),
        department: formDepartment,
        assignmentDate: formAssignmentDate,
        returnDate: formReturnDate.trim() || "—",
        status: formStatus,
        note: formNote.trim(),
      });
      toast.success(`Assignment for "${formAssignedTo}" updated successfully!`);
    } else {
      addStoredAssignment({
        assignmentId: `#ASN00${assignments.length + 21}`,
        assetName: formAssetName.trim(),
        assignedTo: formAssignedTo.trim(),
        avatarColor: randomColor,
        department: formDepartment,
        assignmentDate: formAssignmentDate,
        returnDate: formReturnDate.trim() || "—",
        status: formStatus,
        note: formNote.trim(),
      });
      toast.success(`Asset assigned to "${formAssignedTo}" successfully!`);
    }

    setIsModalOpen(false);
  };

  // Status quick update
  const handleUpdateStatus = (record: AssignmentRecord, newStatus: "Assigned" | "Repair" | "Returned") => {
    updateStoredAssignment(record.id, {
      status: newStatus,
      returnDate:
        newStatus === "Returned"
          ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : record.returnDate,
    });
    toast.success(`Status updated to "${newStatus}"`);
    setOpenActionId(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingAssignment) return;
    deleteStoredAssignment(deletingAssignment.id);
    toast.success(`Assignment "${deletingAssignment.assignmentId}" deleted.`);
    setDeletingAssignment(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Assignment ID",
      "Asset Name",
      "Assigned To",
      "Department",
      "Assignment Date",
      "Return Date",
      "Status",
    ];
    const rows = filteredAssignments.map((a) => [
      a.assignmentId,
      `"${a.assetName}"`,
      `"${a.assignedTo}"`,
      `"${a.department}"`,
      `"${a.assignmentDate}"`,
      `"${a.returnDate}"`,
      a.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Asset_Assignments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Assignments exported successfully!");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-5">
      {/* Page Header (Matching Image 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Assignments
          </h1>
        </div>

        {/* Action buttons (Print, Export, + Add New in #0c6760) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Export"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Primary Action Button (#0c6760) */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Main Table Container Card (Matching Products Theme) */}
      <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Filter Toolbar matching Products Theme */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: Search input & Date Range */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search"
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Date Range Button */}
            <button
              onClick={() => toast.info("Filter date range: Showing all assignments")}
              className="inline-flex items-center gap-2 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>01 Jan 26 to 20 Jan 26</span>
            </button>
          </div>

          {/* Right: Filter, Sort By, View toggle, Reset */}
          <div className="flex items-center gap-2 relative">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2.5 z-20 space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setIsFilterOpen(false);
                      }}
                      className="w-full bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Assigned">Assigned Only</option>
                      <option value="Repair">Repair Only</option>
                      <option value="Returned">Returned Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Department
                    </label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => {
                        setDepartmentFilter(e.target.value);
                        setIsFilterOpen(false);
                      }}
                      className="w-full bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">All Departments</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Admin">Admin</option>
                      <option value="Management">Management</option>
                      <option value="Design">Design</option>
                      <option value="Facility">Facility</option>
                      <option value="Security">Security</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort By</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-20 text-xs space-y-1">
                  <button
                    onClick={() => {
                      setSortBy("id");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  >
                    Assignment ID
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("employee");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  >
                    Employee Name
                  </button>
                </div>
              )}
            </div>

            {/* View Mode */}
            <button
              onClick={() => toast.info("List view is active")}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
              title="Toggle View"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDepartmentFilter("all");
                setSortBy("id");
                toast.success("Filters reset");
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Responsive Table: Columns matching Image 3:
            Assignment ID, Asset Name, Assigned To, Department, Assignment Date, Return Date, Status, Action */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[120px]">Assignment ID</th>
                <th className="py-3 px-4 min-w-[160px]">Asset Name</th>
                <th className="py-3 px-4 min-w-[170px]">Assigned To</th>
                <th className="py-3 px-4 min-w-[110px]">Department</th>
                <th className="py-3 px-4 min-w-[130px]">Assignment Date</th>
                <th className="py-3 px-4 min-w-[130px]">Return Date</th>
                <th className="py-3 px-4 min-w-[90px]">Status</th>
                <th className="py-3 px-4 min-w-[80px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-medium">No assignments found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try resetting filters or click "+ Add New"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAssignments.map((item) => {
                  const isActionOpen = openActionId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Assignment ID */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 text-xs">
                        {item.assignmentId}
                      </td>

                      {/* Asset Name */}
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white text-xs">
                        {item.assetName}
                      </td>

                      {/* Assigned To (Avatar + Name matching Image 3) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-2xs shrink-0 ${item.avatarColor}`}
                          >
                            {getInitials(item.assignedTo)}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs truncate">
                            {item.assignedTo}
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-normal">
                        {item.department}
                      </td>

                      {/* Assignment Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.assignmentDate}
                      </td>

                      {/* Return Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.returnDate}
                      </td>

                      {/* Status (Assigned in green, Repair in rose) */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === "Assigned"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                              : item.status === "Repair"
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
                              : "bg-slate-100 dark:bg-[#12141c] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenActionId(isActionOpen ? null : item.id)
                            }
                            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isActionOpen && (
                            <div className="absolute right-4 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-30 text-xs">
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleOpenEdit(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3 h-3 text-slate-400" />
                                Edit Assignment
                              </button>
                              {item.status !== "Returned" && (
                                <button
                                  onClick={() => handleUpdateStatus(item, "Returned")}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
                                >
                                  <CheckSquare className="w-3 h-3 text-emerald-500" />
                                  Mark Returned
                                </button>
                              )}
                              {item.status !== "Repair" && (
                                <button
                                  onClick={() => handleUpdateStatus(item, "Repair")}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
                                >
                                  <Wrench className="w-3 h-3 text-amber-500" />
                                  Send to Repair
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  setDeletingAssignment(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3 h-3 text-rose-500" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination matching Image 3:
            "Showing 10 / Pages", 1, 2, 3, <, > */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760] cursor-pointer"
            >
              <option value={10}>10 / Pages</option>
              <option value={25}>25 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${
                  currentPage === pg
                    ? "bg-[#0c6760] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================= MODAL: ADD / EDIT ASSIGNMENT ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c6760] dark:text-teal-400">
                  {editingAssignment ? "Update Assignment" : "Asset Custody Transfer"}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingAssignment ? "Edit Assignment" : "Assign Asset"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-4">
              {/* Asset Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Asset <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formAssetName}
                  onChange={(e) => setFormAssetName(e.target.value)}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] cursor-pointer"
                >
                  {assetNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned To & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Employee Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    placeholder="e.g. Ethan Walker"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] cursor-pointer"
                  >
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                    <option value="Management">Management</option>
                    <option value="Design">Design</option>
                    <option value="Facility">Facility</option>
                    <option value="Security">Security</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
              </div>

              {/* Assignment Date & Return Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assignment Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formAssignmentDate}
                    onChange={(e) => setFormAssignmentDate(e.target.value)}
                    placeholder="e.g. 11 Sep 2025"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Return Date
                  </label>
                  <input
                    type="text"
                    value={formReturnDate}
                    onChange={(e) => setFormReturnDate(e.target.value)}
                    placeholder="e.g. 02 Sep 2026 or —"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "Assigned" | "Repair" | "Returned")
                  }
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                >
                  <option value="Assigned">Assigned</option>
                  <option value="Repair">Repair</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Purpose
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. For remote workstation setup"
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {editingAssignment ? "Update Assignment" : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: DELETE ASSIGNMENT ======================= */}
      {deletingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Assignment?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete assignment{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {deletingAssignment.assignmentId}
                </span>{" "}
                for {deletingAssignment.assignedTo}?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingAssignment(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  RotateCw,
  Printer,
  Download,
  Plus,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredEmployees,
  deleteStoredEmployee,
  getStoredDepartments,
  EmployeeItem,
} from "./hrmStorage";

export default function EmployeeList() {
  const navigate = useNavigate();

  // Storage data
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // View Mode: "grid" (Image 1) or "list" (Image 2)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangeText] = useState("01 Jan 26 to 20 Jan 26");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc" | "id-desc" | "id-asc">("default");

  // Dropdown open states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination state (for list view)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<EmployeeItem | null>(null);
  const [viewDetailsEmp, setViewDetailsEmp] = useState<EmployeeItem | null>(null);

  // Load data
  const loadData = () => {
    const stored = getStoredEmployees();
    setEmployees(stored);
    const depts = getStoredDepartments().map((d) => d.name);
    setDepartments(depts);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_employees_updated", handleUpdate);
    window.addEventListener("nexora_departments_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_employees_updated", handleUpdate);
      window.removeEventListener("nexora_departments_updated", handleUpdate);
    };
  }, []);

  // Filter & Sort
  const processedEmployees = useMemo(() => {
    let result = [...employees];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.empId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    if (deptFilter !== "all") {
      result = result.filter((e) => e.department.toLowerCase() === deptFilter.toLowerCase());
    }

    if (statusFilter !== "all") {
      result = result.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "id-desc") {
      result.sort((a, b) => b.empId.localeCompare(a.empId));
    } else if (sortBy === "id-asc") {
      result.sort((a, b) => a.empId.localeCompare(b.empId));
    }

    return result;
  }, [employees, searchQuery, deptFilter, statusFilter, sortBy]);

  // Pagination for list view
  const totalPages = Math.ceil(processedEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedEmployees.slice(start, start + pageSize);
  }, [processedEmployees, currentPage, pageSize]);

  // Export handlers
  const handleExportPDF = () => {
    window.print();
    setIsExportOpen(false);
  };

  const handleExportExcel = () => {
    const headers = ["Emp ID", "Name", "Email", "Phone", "Designation", "Department", "Shift", "Status"];
    const rows = processedEmployees.map((e) => [
      e.empId,
      `"${e.name}"`,
      e.email,
      e.phone,
      `"${e.designation}"`,
      `"${e.department}"`,
      e.shift,
      e.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Employees exported to CSV");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredEmployee(deleteTarget.id);
    toast.success(`Employee "${deleteTarget.name}" deleted successfully`);
    setDeleteTarget(null);
    loadData();
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* =========================================================================
          TOP HEADER (Matching Reference Images 1 & 2)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Employees
          </h1>
        </div>

        {/* Action Controls: View Toggle, Print, Export, Add New */}
        <div className="flex items-center gap-2.5">
          {/* List / Grid View Toggle Button Group */}
          <div className="flex items-center bg-white dark:bg-[#181b24] p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            {/* List Icon Button */}
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "list"
                  ? "bg-[#1e2530] text-white dark:bg-[#0c6760] shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>

            {/* Grid Icon Button */}
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "grid"
                  ? "bg-[#1e2530] text-white dark:bg-[#0c6760] shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

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

          {/* + Add New Button */}
          <Link
            to="/hrm/employees/add"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: GRID CARDS VIEW (Image 1)
          ========================================================================= */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-200">
          {processedEmployees.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <p className="text-slate-400 text-sm">No employees match your search criteria.</p>
            </div>
          ) : (
            processedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 text-center shadow-xs hover:shadow-md transition-all group relative flex flex-col justify-between"
              >
                {/* Top Corner Action Menu */}
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                      title="Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === emp.id && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-30 text-xs">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setViewDetailsEmp(emp);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              navigate(`/hrm/employees/edit/${emp.id}`);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeleteTarget(emp);
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
                </div>

                {/* Avatar & Main Info */}
                <div className="space-y-3">
                  <div className="relative mx-auto w-18 h-18 sm:w-20 sm:h-20">
                    <img
                      src={emp.photo}
                      alt={emp.name}
                      className="w-full h-full rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                      }}
                    />
                    {emp.status === "Inactive" && (
                      <span
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-[#181b24]"
                        title="Inactive"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {emp.designation}
                    </p>
                  </div>

                  {/* Department Pill Badge (soft teal matching reference Image 1) */}
                  <div className="pt-0.5">
                    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                      {emp.department}
                    </span>
                  </div>
                </div>

                {/* Thin divider and Contact Information */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 mt-5 pt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: LIST / TABLE VIEW (Image 2)
          ========================================================================= */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden animate-in fade-in duration-200">
          {/* Top Filter Toolbar (Matching Image 2) */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
            {/* Left: Search input + Date Range Picker */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Search with magnifying glass */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search"
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Date Range Button matching Image 2: "01 Jan 26 to 20 Jan 26" */}
              <button
                type="button"
                onClick={() => toast.info(`Current Date Range: ${dateRangeText}`)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{dateRangeText}</span>
              </button>
            </div>

            {/* Right: Filter, Sort By, Column toggle, Refresh */}
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
                    <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-30 text-xs space-y-3">
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
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white"
                        >
                          <option value="all">All Statuses</option>
                          <option value="Active">Active Only</option>
                          <option value="Inactive">Inactive Only</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setDeptFilter("all");
                            setStatusFilter("all");
                            setIsFilterOpen(false);
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFilterOpen(false)}
                          className="px-3 py-1 rounded-md bg-[#0c6760] text-white font-medium text-[11px]"
                        >
                          Apply
                        </button>
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
                        Name (A-Z)
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("name-desc");
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "name-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        Name (Z-A)
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("id-desc");
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "id-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        Emp ID (High to Low)
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Column options icon */}
              <button
                type="button"
                onClick={() => toast.info("Displaying standard columns")}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                title="Column View"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => {
                  loadData();
                  toast.success("Employees refreshed");
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                title="Refresh"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table matching Image 2 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 font-bold text-xs">
                  <th className="py-3.5 px-4 font-bold">Emp ID</th>
                  <th className="py-3.5 px-4 font-bold">Employee</th>
                  <th className="py-3.5 px-4 font-bold">Email</th>
                  <th className="py-3.5 px-4 font-bold">Designation</th>
                  <th className="py-3.5 px-4 font-bold">Department</th>
                  <th className="py-3.5 px-4 font-bold">Shift</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Emp ID */}
                      <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400">
                        {emp.empId}
                      </td>

                      {/* Employee (Avatar + Name) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                            }}
                          />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {emp.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {emp.email}
                      </td>

                      {/* Designation */}
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {emp.designation}
                      </td>

                      {/* Department */}
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {emp.department}
                      </td>

                      {/* Shift */}
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {emp.shift}
                      </td>

                      {/* Status (Active: green badge, Inactive: red badge) */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${emp.status === "Active"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
                            }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      {/* Action: 3-dots vertical button with dropdown */}
                      <td className="py-4 px-4 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors mx-auto"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuId === emp.id && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-30 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setViewDetailsEmp(emp);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/hrm/employees/edit/${emp.id}`);
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
                                    setDeleteTarget(emp);
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

          {/* Pagination Toolbar */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                <option value={5}>5 / Pages</option>
                <option value={10}>10 / Pages</option>
                <option value={20}>20 / Pages</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                «
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${currentPage === p
                      ? "bg-[#0c6760] text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                    }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW DETAILS MODAL
          ========================================================================= */}
      {viewDetailsEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Employee Profile
              </h3>
              <button
                onClick={() => setViewDetailsEmp(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={viewDetailsEmp.photo}
                alt={viewDetailsEmp.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {viewDetailsEmp.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewDetailsEmp.designation} · {viewDetailsEmp.department}
                </p>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${viewDetailsEmp.status === "Active"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}
                >
                  {viewDetailsEmp.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Emp ID</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewDetailsEmp.empId}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Shift</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewDetailsEmp.shift}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate block">{viewDetailsEmp.email}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewDetailsEmp.phone}</span>
              </div>
              {viewDetailsEmp.joinDate && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Join Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{viewDetailsEmp.joinDate}</span>
                </div>
              )}
              {viewDetailsEmp.salary && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Salary</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${viewDetailsEmp.salary}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const id = viewDetailsEmp.id;
                  setViewDetailsEmp(null);
                  navigate(`/hrm/employees/edit/${id}`);
                }}
                className="px-4 py-2 rounded-xl bg-[#0c6760] hover:bg-[#09544e] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Edit Employee
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
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Employee
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you sure you want to delete "{deleteTarget.name}"?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              This action cannot be undone. All active payroll and asset assignments for this employee will be marked as unassigned.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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

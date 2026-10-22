import { useState, useEffect, useMemo } from "react";
import {
  Printer,
  Download,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Eye,
  X,
  RotateCw,
  BarChart3,
  CalendarX2,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Coffee,
} from "lucide-react";
import { toast } from "sonner";
import {
  AttendanceItem,
  AttendanceStatus,
  getStoredAttendance,
  deleteStoredAttendance,
} from "./attendanceStorage";
import MarkAttendanceModal from "./MarkAttendanceModal";
import { getStoredDepartments } from "./hrmStorage";

export default function AttendanceList() {
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilterOption, setDateFilterOption] = useState<string>("All Dates");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "default" | "name-asc" | "name-desc" | "date-desc" | "date-asc" | "late-desc" | "hours-desc"
  >("default");

  // Dropdown menus
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttendanceItem | null>(null);
  const [viewItem, setViewItem] = useState<AttendanceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceItem | null>(null);

  // Load data
  const loadData = () => {
    const records = getStoredAttendance();
    setAttendance(records);

    const depts = getStoredDepartments().map((d) => d.name);
    setDepartments(depts.length > 0 ? depts : ["Engineering", "Design", "HR", "Finance", "Sales", "Operations", "Marketing"]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_attendance_updated", handleUpdate);
    window.addEventListener("nexora_employees_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_attendance_updated", handleUpdate);
      window.removeEventListener("nexora_employees_updated", handleUpdate);
    };
  }, []);

  // Compute 5 KPI Metrics from Image 2
  const kpiStats = useMemo(() => {
    const presentCount = attendance.filter((a) => a.status === "Present").length;
    const absentCount = attendance.filter((a) => a.status === "Absent").length;
    const lateCount = attendance.filter((a) => a.status === "Late").length;
    const halfDayCount = attendance.filter((a) => a.status === "Half Day").length;
    const totalCount = attendance.length;

    return {
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      halfDay: halfDayCount,
      total: totalCount,
    };
  }, [attendance]);

  // Filter & Sort Logic
  const filteredRecords = useMemo(() => {
    let result = [...attendance];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.employeeName.toLowerCase().includes(q) ||
          item.department?.toLowerCase().includes(q) ||
          item.designation?.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.remarks?.toLowerCase().includes(q)
      );
    }

    // Date filtering
    if (dateFilterOption === "21 May 2026") {
      result = result.filter(
        (item) => item.date === "2026-05-21" || item.formattedDate.includes("21 May 2026")
      );
    } else if (dateFilterOption === "Today") {
      const todayISO = new Date().toISOString().split("T")[0];
      result = result.filter((item) => item.date === todayISO || item.date === "2026-10-22");
    } else if (dateFilterOption === "01 Jan 26 to 20 Jan 26") {
      result = result.filter(
        (item) => item.date >= "2026-01-01" && item.date <= "2026-01-20"
      );
    } else if (dateFilterOption === "Custom" && (customStartDate || customEndDate)) {
      if (customStartDate && customEndDate) {
        result = result.filter(
          (item) => item.date >= customStartDate && item.date <= customEndDate
        );
      } else if (customStartDate) {
        result = result.filter((item) => item.date >= customStartDate);
      } else if (customEndDate) {
        result = result.filter((item) => item.date <= customEndDate);
      }
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Department filter
    if (deptFilter !== "all") {
      result = result.filter((item) => item.department === deptFilter);
    }

    // Sorting
    if (sortBy === "name-asc") {
      result.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.employeeName.localeCompare(a.employeeName));
    } else if (sortBy === "date-desc") {
      result.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sortBy === "date-asc") {
      result.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortBy === "late-desc") {
      result.sort((a, b) => {
        const aLate = parseInt(a.late.replace(/\D/g, "")) || 0;
        const bLate = parseInt(b.late.replace(/\D/g, "")) || 0;
        return bLate - aLate;
      });
    } else if (sortBy === "hours-desc") {
      result.sort((a, b) => {
        const getMinutes = (hStr: string) => {
          const matchH = hStr.match(/(\d+)h/);
          const matchM = hStr.match(/(\d+)m/);
          const h = matchH ? parseInt(matchH[1], 10) : 0;
          const m = matchM ? parseInt(matchM[1], 10) : 0;
          return h * 60 + m;
        };
        return getMinutes(b.hours) - getMinutes(a.hours);
      });
    }

    return result;
  }, [
    attendance,
    searchQuery,
    dateFilterOption,
    customStartDate,
    customEndDate,
    statusFilter,
    deptFilter,
    sortBy,
  ]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilterOption, statusFilter, deptFilter, sortBy, pageSize]);

  // Delete Action
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteStoredAttendance(deleteTarget.id);
    toast.success(`Attendance record deleted for ${deleteTarget.employeeName}`);
    setDeleteTarget(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error("No records to export.");
      return;
    }
    const headers = ["Employee", "Department", "Designation", "Date", "Check In", "Check Out", "Hours", "Late", "Status", "Remarks"];
    const rows = filteredRecords.map((r) => [
      `"${r.employeeName}"`,
      `"${r.department || "-"}"`,
      `"${r.designation || "-"}"`,
      `"${r.formattedDate}"`,
      `"${r.checkIn}"`,
      `"${r.checkOut}"`,
      `"${r.hours}"`,
      `"${r.late}"`,
      `"${r.status}"`,
      `"${(r.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportOpen(false);
    toast.success("Attendance exported as CSV");
  };

  // Export PDF / Print
  const handleExportPDF = () => {
    setIsExportOpen(false);
    window.print();
  };

  // Helper for Status Pills matching Reference Image 1 exactly
  const renderStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            Present
          </span>
        );
      case "Late":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
            Late
          </span>
        );
      case "Absent":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
            Absent
          </span>
        );
      case "Night Shift":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/40">
            Night Shift
          </span>
        );
      case "Half Day":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40">
            Half Day
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* =========================================================================
          PAGE HEADER BAR (Matching Reference Image 1 & 2)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Attendance
          </h1>
        </div>

        {/* Action Buttons: Print, Export, + Mark Attendance */}
        <div className="flex items-center gap-2.5">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export
              <ChevronRight
                className={`w-3 h-3 transform transition-transform ${isExportOpen ? "rotate-90" : ""
                  }`}
              />
            </button>
            {isExportOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                  >
                    Export as PDF
                  </button>
                </div>
              </>
            )}
          </div>

          {/* + Mark Attendance Button */}
          <button
            onClick={() => {
              setEditingItem(null);
              setIsMarkModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] rounded-md shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* =========================================================================
          5 KPI SUMMARY CARDS (Matching Reference Image 2)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Present Card */}
        <div className="bg-white dark:bg-[#181b24] p-4 rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between transition hover:shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Present</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {kpiStats.present}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* Absent Card */}
        <div className="bg-white dark:bg-[#181b24] p-4 rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between transition hover:shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Absent</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {kpiStats.absent}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800/40">
            <CalendarX2 className="w-5 h-5" />
          </div>
        </div>

        {/* Late Card */}
        <div className="bg-white dark:bg-[#181b24] p-4 rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between transition hover:shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Late</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {kpiStats.late}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/40">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Half Day Card */}
        <div className="bg-white dark:bg-[#181b24] p-4 rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between transition hover:shadow-xs">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Half Day</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {kpiStats.halfDay}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/40">
            <Coffee className="w-5 h-5" />
          </div>
        </div>

        {/* Total Employees / Records Card */}
        <div className="bg-white dark:bg-[#181b24] p-4 rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between transition hover:shadow-xs col-span-2 sm:col-span-1">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {kpiStats.total}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/40">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN TABLE CARD & CONTROLS TOOLBAR (Matching Reference Image 1)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Controls Toolbar: Search, Date Range, Filter, Sort By */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left Controls: Search + Date Range Button */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input with Magnifier */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Range Picker Button matching Image 1: "01 Jan 26 to 20 Jan 26" */}
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {dateFilterOption === "Custom"
                      ? `${customStartDate || "Start"} to ${customEndDate || "End"}`
                      : dateFilterOption === "All Dates"
                        ? "All Dates (Full Log)"
                        : dateFilterOption}
                  </span>
                </div>
                <ChevronRight
                  className={`w-3 h-3 text-slate-400 transform transition-transform ${isDateRangeOpen ? "rotate-90" : ""
                    }`}
                />
              </button>

              {/* Date Range Popover */}
              {isDateRangeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsDateRangeOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl p-3 z-30 text-xs space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                      Select Date Range
                    </p>
                    <div className="space-y-1">
                      {[
                        "All Dates",
                        "21 May 2026",
                        "Today",
                        "01 Jan 26 to 20 Jan 26",
                      ].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setDateFilterOption(opt);
                            setIsDateRangeOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md transition cursor-pointer flex items-center justify-between ${dateFilterOption === opt
                              ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                        >
                          <span>{opt === "All Dates" ? "All Dates (Full Log)" : opt}</span>
                          {dateFilterOption === opt && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500">Custom Date Range</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => {
                            setCustomStartDate(e.target.value);
                            setDateFilterOption("Custom");
                          }}
                          className="px-2 py-1 text-[11px] bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                        />
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => {
                            setCustomEndDate(e.target.value);
                            setDateFilterOption("Custom");
                          }}
                          className="px-2 py-1 text-[11px] bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDateRangeOpen(false)}
                        className="w-full mt-1 py-1 text-[11px] font-medium text-center bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-md cursor-pointer"
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Controls: Filter button + Sort By button */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Filter Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition cursor-pointer ${statusFilter !== "all" || deptFilter !== "all"
                    ? "bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-400 font-semibold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
                <ChevronRight
                  className={`w-3 h-3 transform transition-transform ${isFilterOpen ? "rotate-90" : ""
                    }`}
                />
              </button>

              {/* Filter Popover */}
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl p-3 z-30 text-xs space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Half Day">Half Day</option>
                        <option value="Night Shift">Night Shift</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Department
                      </label>
                      <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                      >
                        <option value="all">All Departments</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(statusFilter !== "all" || deptFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter("all");
                          setDeptFilter("all");
                        }}
                        className="w-full text-center text-[11px] text-teal-600 dark:text-teal-400 hover:underline pt-1 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sort By Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                Sort By
                <ChevronRight
                  className={`w-3 h-3 transform transition-transform ${isSortOpen ? "rotate-90" : ""
                    }`}
                />
              </button>

              {/* Sort By Popover */}
              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1 z-30 text-xs">
                    {[
                      { key: "default", label: "Default" },
                      { key: "name-asc", label: "Employee Name (A - Z)" },
                      { key: "name-desc", label: "Employee Name (Z - A)" },
                      { key: "date-desc", label: "Date (Newest)" },
                      { key: "date-asc", label: "Date (Oldest)" },
                      { key: "hours-desc", label: "Longest Hours" },
                      { key: "late-desc", label: "Most Late" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          setSortBy(item.key as any);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer flex items-center justify-between ${sortBy === item.key
                            ? "text-teal-600 dark:text-teal-400 font-semibold"
                            : "text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        <span>{item.label}</span>
                        {sortBy === item.key && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Quick Refresh */}
            <button
              onClick={() => {
                loadData();
                toast.success("Attendance refreshed");
              }}
              title="Refresh logs"
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            ATTENDANCE DATA TABLE (Matching Reference Image 1)
            ========================================================================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50/75 dark:bg-[#13161f] border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-bold">
                  Employee
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Date
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Check In
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Check Out
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Hours
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Late
                </th>
                <th scope="col" className="px-4 py-3.5 font-bold">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5 text-right font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                  >
                    {/* Employee: Avatar + Name (bold) */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.employeePhoto}
                          alt={item.employeeName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            // Fallback to stylized initial
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {item.employeeName}
                          </p>
                          {(item.designation || item.department) && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                              {item.designation} {item.department ? `• ${item.department}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date: formatted date e.g. "21 May 2026" */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                      {item.formattedDate}
                    </td>

                    {/* Check In */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                      {item.checkIn}
                    </td>

                    {/* Check Out */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                      {item.checkOut}
                    </td>

                    {/* Hours */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                      {item.hours}
                    </td>

                    {/* Late */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                      {item.late}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewItem(item)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsMarkModalOpen(true);
                          }}
                          title="Edit Attendance"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          title="Delete Record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CalendarX2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-medium">No attendance records found.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setDateFilterOption("All Dates");
                          setStatusFilter("all");
                          setDeptFilter("all");
                        }}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        Clear filters to see all entries
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>
              Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}{" "}
              entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
              Prev
            </button>
            <span className="px-2 py-1 font-semibold text-slate-700 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MARK / EDIT ATTENDANCE MODAL (Matching Reference Image 3)
          ========================================================================= */}
      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        editingItem={editingItem}
        onSuccess={loadData}
      />

      {/* =========================================================================
          VIEW DETAILS MODAL
          ========================================================================= */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setViewItem(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#181b24] rounded-md shadow-2xl border border-slate-200/90 dark:border-slate-800 p-5 z-10 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Attendance Details
              </h3>
              <button
                onClick={() => setViewItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={viewItem.employeePhoto}
                  alt={viewItem.employeeName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {viewItem.employeeName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {viewItem.designation} • {viewItem.department}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewItem.formattedDate}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Status</span>
                  <span className="mt-0.5 inline-block">
                    {renderStatusBadge(viewItem.status)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Check In</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewItem.checkIn}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Check Out</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewItem.checkOut}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Hours</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewItem.hours}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Late</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewItem.late}
                  </span>
                </div>
              </div>

              {viewItem.remarks && (
                <div className="p-3 bg-slate-50 dark:bg-[#12141c] rounded-md border border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-1">
                    Remarks / Notes
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{viewItem.remarks}</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] rounded-md transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#181b24] rounded-md shadow-2xl border border-slate-200/90 dark:border-slate-800 p-5 z-10 text-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete Attendance Record
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Are you sure you want to delete the attendance log for{" "}
              <strong>{deleteTarget.employeeName}</strong> on {deleteTarget.formattedDate}?
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition cursor-pointer"
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

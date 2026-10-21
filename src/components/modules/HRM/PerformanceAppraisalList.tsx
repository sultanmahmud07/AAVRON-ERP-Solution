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
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  X,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredAppraisals,
  addStoredAppraisal,
  updateStoredAppraisal,
  deleteStoredAppraisal,
  getStoredEmployees,
  getStoredDepartments,
  AppraisalItem,
} from "./hrmStorage";

export default function PerformanceAppraisalList() {
  const [appraisals, setAppraisals] = useState<AppraisalItem[]>([]);
  const [employees, setEmployees] = useState<{ name: string; photo: string; designation: string; department: string }[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangeText] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "score-desc" | "score-asc" | "name-asc">("default");

  // Dropdown open states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal state (matching Reference Image 4)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppraisalItem | null>(null);

  // Modal Form state
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [designation, setDesignation] = useState("");
  const [appraisalDate, setAppraisalDate] = useState("");
  const [reviewPeriod, setReviewPeriod] = useState("Q2 2026");
  const [techRating, setTechRating] = useState("");
  const [commRating, setCommRating] = useState("");
  const [problemRating, setProblemRating] = useState("");
  const [teamRating, setTeamRating] = useState("");
  const [overallRating, setOverallRating] = useState("");
  const [status, setStatus] = useState<"Excellent" | "Good" | "Average" | "Needs Improvement" | "">("");
  const [remarks, setRemarks] = useState("");

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<AppraisalItem | null>(null);
  const [viewDetailsItem, setViewDetailsItem] = useState<AppraisalItem | null>(null);

  const loadData = () => {
    const stored = getStoredAppraisals();
    setAppraisals(stored);

    const emps = getStoredEmployees().map((e) => ({
      name: e.name,
      photo: e.photo,
      designation: e.designation,
      department: e.department,
    }));
    setEmployees(emps);

    const depts = getStoredDepartments().map((d) => d.name);
    setDepartments(depts.length > 0 ? depts : ["Engineering", "Design", "HR", "Finance", "Sales", "Marketing"]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_appraisals_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_appraisals_updated", handleUpdate);
    };
  }, []);

  // Filtered & Sorted items
  const filteredAppraisals = useMemo(() => {
    return appraisals
      .filter((item) => {
        const matchesSearch =
          (item.employeeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.appraisalId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.designation || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.reviewPeriod || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesDept =
          deptFilter === "all" || item.department.toLowerCase() === deptFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesDept;
      })
      .sort((a, b) => {
        const parseScore = (s: string) => parseFloat(s.split("/")[0]) || 0;
        if (sortBy === "score-desc") return parseScore(b.score) - parseScore(a.score);
        if (sortBy === "score-asc") return parseScore(a.score) - parseScore(b.score);
        if (sortBy === "name-asc") return a.employeeName.localeCompare(b.employeeName);
        return 0; // Default order
      });
  }, [appraisals, searchQuery, statusFilter, deptFilter, sortBy]);

  // Open Add Modal
  const openAddModal = () => {
    setEditingItem(null);
    setSelectedEmployeeName("");
    setDesignation("");
    setAppraisalDate("");
    setReviewPeriod("Q2 2026");
    setTechRating("");
    setCommRating("");
    setProblemRating("");
    setTeamRating("");
    setOverallRating("");
    setStatus("");
    setRemarks("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: AppraisalItem) => {
    setEditingItem(item);
    setSelectedEmployeeName(item.employeeName);
    setDesignation(item.designation);
    setAppraisalDate(item.appraisalDate || "");
    setReviewPeriod(item.reviewPeriod || "Q2 2026");
    setTechRating(item.technicalSkills ? String(item.technicalSkills) : "");
    setCommRating(item.communication ? String(item.communication) : "");
    setProblemRating(item.problemSolving ? String(item.problemSolving) : "");
    setTeamRating(item.teamwork ? String(item.teamwork) : "");
    setOverallRating(item.score || "");
    setStatus(item.status);
    setRemarks(item.remarks || "");
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  // Auto calculate overall score & status when skills ratings change
  const handleRatingChange = (
    tech: string,
    comm: string,
    prob: string,
    team: string
  ) => {
    const vals = [tech, comm, prob, team].map((v) => parseFloat(v)).filter((n) => !isNaN(n));
    if (vals.length > 0) {
      const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
      setOverallRating(`${avg}/5`);

      const avgNum = parseFloat(avg);
      if (avgNum >= 4.5) setStatus("Excellent");
      else if (avgNum >= 3.8) setStatus("Good");
      else if (avgNum >= 3.0) setStatus("Average");
      else setStatus("Needs Improvement");
    }
  };

  // Handle Employee selection
  const handleEmployeeSelect = (name: string) => {
    setSelectedEmployeeName(name);
    const emp = employees.find((e) => e.name === name);
    if (emp) {
      setDesignation(emp.designation);
    }
  };

  // Save Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeName.trim()) {
      toast.error("Please select an employee");
      return;
    }
    if (!designation.trim()) {
      toast.error("Please enter a designation");
      return;
    }

    const emp = employees.find((e) => e.name === selectedEmployeeName);
    const employeePhoto =
      emp?.photo ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
    const department = emp?.department || "General";

    const computedScore = overallRating.trim() ? (overallRating.includes("/") ? overallRating : `${overallRating}/5`) : "4.0/5";
    const finalStatus = (status as any) || "Good";

    if (editingItem) {
      updateStoredAppraisal(editingItem.id, {
        employeeName: selectedEmployeeName,
        employeePhoto,
        designation,
        department,
        appraisalDate,
        reviewPeriod: reviewPeriod || "Q2 2026",
        technicalSkills: techRating,
        communication: commRating,
        problemSolving: problemRating,
        teamwork: teamRating,
        score: computedScore,
        status: finalStatus,
        remarks,
      });
      toast.success("Performance appraisal updated successfully");
    } else {
      addStoredAppraisal({
        employeeName: selectedEmployeeName,
        employeePhoto,
        designation,
        department,
        appraisalDate,
        reviewPeriod: reviewPeriod || "Q2 2026",
        technicalSkills: techRating,
        communication: commRating,
        problemSolving: problemRating,
        teamwork: teamRating,
        score: computedScore,
        status: finalStatus,
        remarks,
      });
      toast.success("Performance appraisal created successfully");
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const ok = deleteStoredAppraisal(deleteTarget.id);
    if (ok) {
      toast.success(`Performance appraisal ${deleteTarget.appraisalId} deleted`);
      loadData();
    } else {
      toast.error("Failed to delete appraisal");
    }
    setDeleteTarget(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredAppraisals.length === 0) {
      toast.error("No appraisals to export");
      return;
    }
    const headers = ["ID", "Employee", "Designation", "Department", "Review Period", "Score", "Status"];
    const rows = filteredAppraisals.map((a) => [
      a.appraisalId,
      `"${a.employeeName}"`,
      `"${a.designation}"`,
      `"${a.department}"`,
      `"${a.reviewPeriod}"`,
      `"${a.score}"`,
      a.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `performance_appraisals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Appraisals exported to CSV");
  };

  // Status Badge styling matching reference Image 3
  const getStatusBadge = (status: AppraisalItem["status"]) => {
    switch (status) {
      case "Excellent":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
            Excellent
          </span>
        );
      case "Good":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/40">
            Good
          </span>
        );
      case "Average":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40">
            Average
          </span>
        );
      case "Needs Improvement":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
            Needs Improvement
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className=" mx-auto space-y-6">
      {/* Top Header matching reference image 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Performance Appraisal</h1>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export
              <span className="text-[10px] ml-0.5">▾</span>
            </button>

            {isExportOpen && (
              <div
                className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsExportOpen(false)}
              >
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  Export to CSV
                </button>
                <button
                  onClick={() => {
                    handlePrint();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  Print / PDF
                </button>
              </div>
            )}
          </div>

          {/* + Add New Button */}
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#181b24] hover:bg-slate-800 dark:bg-[#0c6760] dark:hover:bg-[#0a524d] rounded-md shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add New
          </button>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-sm overflow-hidden">
        {/* Toolbar matching reference image 3 */}
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Range Badge matching reference image 3 */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRangeText}</span>
            </div>
          </div>

          {/* Right Tools (Filter, Sort By) */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${statusFilter !== "all" || deptFilter !== "all"
                  ? "bg-[#0c6760]/10 border-[#0c6760] text-[#0c6760]"
                  : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Filter
                <span className="text-[10px] ml-0.5">▾</span>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full text-xs p-1.5 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">All Statuses</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="needs improvement">Needs Improvement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Department
                    </label>
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="w-full text-xs p-1.5 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(statusFilter !== "all" || deptFilter !== "all") && (
                    <button
                      onClick={() => {
                        setStatusFilter("all");
                        setDeptFilter("all");
                      }}
                      className="w-full py-1 text-xs text-[#0c6760] hover:underline text-center"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                Sort By
                <span className="text-[10px] ml-0.5">▾</span>
              </button>

              {isSortOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsSortOpen(false)}
                >
                  <button
                    onClick={() => setSortBy("default")}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "default"
                      ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                  >
                    Default Order
                  </button>
                  <button
                    onClick={() => setSortBy("score-desc")}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "score-desc"
                      ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                  >
                    Score (High to Low)
                  </button>
                  <button
                    onClick={() => setSortBy("score-asc")}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "score-asc"
                      ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                  >
                    Score (Low to High)
                  </button>
                  <button
                    onClick={() => setSortBy("name-asc")}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "name-asc"
                      ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                  >
                    Employee (A-Z)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table matching reference image 3 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#151821]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Review Period</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredAppraisals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Award className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    No performance appraisals found.
                  </td>
                </tr>
              ) : (
                filteredAppraisals.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs font-normal">
                      {item.appraisalId}
                    </td>

                    {/* Employee (Avatar + Name) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.employeePhoto}
                          alt={item.employeeName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.employeeName}
                        </span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.designation}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.department}
                    </td>

                    {/* Review Period */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.reviewPeriod}
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      {item.score}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Action Menu */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div
                            className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                            onClick={() => setActiveMenuId(null)}
                          >
                            <button
                              onClick={() => setViewDetailsItem(item)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Details
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              Delete
                            </button>
                          </div>
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

      {/* Add / Edit Performance Appraisal Modal matching Reference Image 4 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? "Edit Performance Appraisal" : "Add Performance Appraisal"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable form fields matching Image 4) */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Employee * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedEmployeeName}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                />
              </div>

              {/* Appraisal Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Appraisal Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={appraisalDate}
                    onChange={(e) => setAppraisalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Review Period */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Review Period
                </label>
                <select
                  value={reviewPeriod}
                  onChange={(e) => setReviewPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                >
                  <option value="">Select Review Period</option>
                  <option value="Q1 2026">Q1 2026</option>
                  <option value="Q2 2026">Q2 2026</option>
                  <option value="Q3 2026">Q3 2026</option>
                  <option value="Q4 2026">Q4 2026</option>
                  <option value="Annual 2026">Annual 2026</option>
                </select>
              </div>

              {/* Technical Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Skills
                </label>
                <select
                  value={techRating}
                  onChange={(e) => {
                    setTechRating(e.target.value);
                    handleRatingChange(e.target.value, commRating, problemRating, teamRating);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                >
                  <option value="">Select Rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              {/* Communication */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Communication
                </label>
                <select
                  value={commRating}
                  onChange={(e) => {
                    setCommRating(e.target.value);
                    handleRatingChange(techRating, e.target.value, problemRating, teamRating);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                >
                  <option value="">Select Rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              {/* Problem Solving */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Problem Solving
                </label>
                <select
                  value={problemRating}
                  onChange={(e) => {
                    setProblemRating(e.target.value);
                    handleRatingChange(techRating, commRating, e.target.value, teamRating);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                >
                  <option value="">Select Rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              {/* Teamwork */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teamwork
                </label>
                <select
                  value={teamRating}
                  onChange={(e) => {
                    setTeamRating(e.target.value);
                    handleRatingChange(techRating, commRating, problemRating, e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                >
                  <option value="">Select Rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Overall Rating
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4.5/5"
                  value={overallRating}
                  onChange={(e) => setOverallRating(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
                >
                  <option value="">Select Status</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional feedback, notes, and goals..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] resize-none"
                />
              </div>

              {/* Modal Footer matching reference image 4 */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#181b24] hover:bg-slate-800 dark:bg-[#0c6760] dark:hover:bg-[#0a524d] rounded-md shadow transition-colors"
                >
                  {editingItem ? "Save Changes" : "Add Appraisal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-full">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Delete Appraisal Record</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to remove appraisal <span className="font-semibold text-slate-700 dark:text-slate-300">{deleteTarget.appraisalId}</span> for {deleteTarget.employeeName}?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={viewDetailsItem.employeePhoto}
                  alt={viewDetailsItem.employeeName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{viewDetailsItem.appraisalId}</span>
                    {getStatusBadge(viewDetailsItem.status)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewDetailsItem.employeeName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setViewDetailsItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Designation</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Review Period</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.reviewPeriod}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Overall Score</span>
                <span className="font-bold text-[#0c6760] text-sm">{viewDetailsItem.score}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#12141c] border border-slate-100 dark:border-slate-800 rounded-lg space-y-2 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] block">
                Evaluation Breakdown
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>Technical Skills: <span className="font-semibold">{viewDetailsItem.technicalSkills || "4"}/5</span></div>
                <div>Communication: <span className="font-semibold">{viewDetailsItem.communication || "4"}/5</span></div>
                <div>Problem Solving: <span className="font-semibold">{viewDetailsItem.problemSolving || "4"}/5</span></div>
                <div>Teamwork: <span className="font-semibold">{viewDetailsItem.teamwork || "4"}/5</span></div>
              </div>
            </div>

            {viewDetailsItem.remarks && (
              <div className="text-xs">
                <span className="text-slate-400 block text-[11px] mb-1">Remarks & Feedback</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#12141c] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {viewDetailsItem.remarks}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setViewDetailsItem(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewDetailsItem(null);
                  openEditModal(viewDetailsItem);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#0c6760] hover:bg-[#0a524d] rounded-lg transition-colors"
              >
                Edit Appraisal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

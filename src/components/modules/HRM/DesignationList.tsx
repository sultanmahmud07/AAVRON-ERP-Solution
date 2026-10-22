import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Printer,
  Download,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredDesignations,
  addStoredDesignation,
  updateStoredDesignation,
  deleteStoredDesignation,
  getStoredDepartments,
  DesignationItem,
} from "./hrmStorage";

export default function DesignationList() {
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc" | "employees-desc" | "employees-asc">("default");

  // Dropdown open states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal state (Reference Image 2)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DesignationItem | null>(null);
  const [designationName, setDesignationName] = useState("");
  const [designationDept, setDesignationDept] = useState("Design");
  const [designationStatus, setDesignationStatus] = useState<"Active" | "Inactive">("Active");

  // Delete Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<DesignationItem | null>(null);

  const loadData = () => {
    const stored = getStoredDesignations();
    setDesignations(stored);

    const depts = getStoredDepartments().map((d) => d.name);
    setDepartments(depts.length > 0 ? depts : ["Engineering", "Design", "HR", "Finance", "Sales", "Marketing", "Support"]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_designations_updated", handleUpdate);
    window.addEventListener("nexora_departments_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_designations_updated", handleUpdate);
      window.removeEventListener("nexora_departments_updated", handleUpdate);
    };
  }, []);

  // Filter & Sort
  const processedDesignations = useMemo(() => {
    let result = [...designations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q)
      );
    }

    if (deptFilter !== "all") {
      result = result.filter((d) => d.department.toLowerCase() === deptFilter.toLowerCase());
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "employees-desc") {
      result.sort((a, b) => b.employeesCount - a.employeesCount);
    } else if (sortBy === "employees-asc") {
      result.sort((a, b) => a.employeesCount - b.employeesCount);
    }

    return result;
  }, [designations, searchQuery, deptFilter, statusFilter, sortBy]);

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setDesignationName("");
    setDesignationDept(departments[0] || "Design");
    setDesignationStatus("Active");
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (item: DesignationItem) => {
    setEditingItem(item);
    setDesignationName(item.name);
    setDesignationDept(item.department);
    setDesignationStatus(item.status);
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!designationName.trim()) {
      toast.error("Please enter a designation name");
      return;
    }

    if (editingItem) {
      updateStoredDesignation(editingItem.id, {
        name: designationName.trim(),
        department: designationDept || "General",
        status: designationStatus,
      });
      toast.success(`Designation "${designationName}" updated successfully`);
    } else {
      addStoredDesignation({
        name: designationName.trim(),
        department: designationDept || "General",
        status: designationStatus,
        employeesCount: 0,
      });
      toast.success(`Designation "${designationName}" created successfully`);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setDesignationName("");
    loadData();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredDesignation(deleteTarget.id);
    toast.success(`Designation "${deleteTarget.name}" deleted successfully`);
    setDeleteTarget(null);
    loadData();
  };

  // Export handlers
  const handleExportPDF = () => {
    window.print();
    setIsExportOpen(false);
  };

  const handleExportExcel = () => {
    const headers = ["ID", "Designation", "Department", "Employees", "Created On", "Status"];
    const rows = processedDesignations.map((d) => [
      d.code,
      `"${d.name}"`,
      `"${d.department}"`,
      d.employeesCount,
      `"${d.createdOn}"`,
      d.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Designations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportOpen(false);
    toast.success("Designations exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP HEADER BAR (Matching Reference Image 1)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Designations
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
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTAINER CARD (Matching Image 1)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-xs overflow-hidden">
        {/* Top Filter Toolbar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
          {/* Search Input on Left */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-3 pr-8 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        <option value="Active">Active Only</option>
                        <option value="Inactive">Inactive Only</option>
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
                      Designation (A-Z)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name-desc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "name-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Designation (Z-A)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("employees-desc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "employees-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Employees (High to Low)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("employees-asc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "employees-asc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Employees (Low to High)
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
                toast.success("Designations refreshed");
              }}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table matching Image 1 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 font-bold text-xs">
                <th className="py-3.5 px-4 font-bold">ID</th>
                <th className="py-3.5 px-4 font-bold">Designation</th>
                <th className="py-3.5 px-4 font-bold">Department</th>
                <th className="py-3.5 px-4 font-bold">Employees</th>
                <th className="py-3.5 px-4 font-bold">Created On</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {processedDesignations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No designations found matching your criteria.
                  </td>
                </tr>
              ) : (
                processedDesignations.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {item.code}
                    </td>

                    {/* Designation */}
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.department}
                    </td>

                    {/* Employees */}
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.employeesCount}
                    </td>

                    {/* Created On */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {item.createdOn}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.status === "Active"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
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
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1 z-30 text-xs">
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
          ADD / EDIT DESIGNATION MODAL (Matching Reference Image 2)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md p-6 max-w-md w-full shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? "Edit Designation" : "Add Designation"}
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
              {/* Designation Name * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Designation Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={designationName}
                  onChange={(e) => setDesignationName(e.target.value)}
                  placeholder="e.g. Senior Developer"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <select
                  value={designationDept}
                  onChange={(e) => setDesignationDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={designationStatus}
                  onChange={(e) => setDesignationStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {editingItem ? "Save Changes" : "Add Designation"}
                </button>
              </div>
            </form>
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
                Delete Designation
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {deleteTarget.name}
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

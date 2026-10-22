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
  ShieldCheck,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import {
  SystemRoleRecord,
  getStoredSystemRoles,
  addStoredSystemRole,
  updateStoredSystemRole,
  deleteStoredSystemRole,
  SYSTEM_MODULES,
  RolePermissions,
} from "./systemStorage";

export default function RoleManagement() {
  const [roles, setRoles] = useState<SystemRoleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SystemRoleRecord | null>(null);
  const [formRoleName, setFormRoleName] = useState("");
  const [formRoleStatus, setFormRoleStatus] = useState<"Active" | "Inactive">("Active");
  const [formRoleDescription, setFormRoleDescription] = useState("");

  // Permissions Matrix Modal State
  const [activePermRole, setActivePermRole] = useState<SystemRoleRecord | null>(null);
  const [rolePermissions, setRolePermissions] = useState<
    Record<string, RolePermissions>
  >({});

  // Delete Confirm Modal
  const [deletingRole, setDeletingRole] = useState<SystemRoleRecord | null>(null);

  const loadData = () => {
    setRoles(getStoredSystemRoles());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_system_updated", handleUpdate);
    return () => window.removeEventListener("nexora_system_updated", handleUpdate);
  }, []);

  // Filtered & Sorted
  const filteredRoles = useMemo(() => {
    let result = roles.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      return true;
    });

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [roles, searchQuery, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / pageSize) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  // Open Create Role Modal
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setFormRoleName("");
    setFormRoleStatus("Active");
    setFormRoleDescription("");
    setIsRoleModalOpen(true);
  };

  // Open Edit Role Modal
  const handleOpenEditRole = (role: SystemRoleRecord) => {
    setEditingRole(role);
    setFormRoleName(role.name);
    setFormRoleStatus(role.status);
    setFormRoleDescription(role.description || "");
    setIsRoleModalOpen(true);
  };

  // Open Permissions Matrix Modal
  const handleOpenPermissions = (role: SystemRoleRecord) => {
    setActivePermRole(role);
    // Initialize permissions copy
    const initialPerms: Record<string, RolePermissions> = {};
    SYSTEM_MODULES.forEach((mod) => {
      initialPerms[mod] = role.permissions?.[mod] || {
        view: role.name === "Admin",
        create: role.name === "Admin",
        edit: role.name === "Admin",
        delete: role.name === "Admin",
        export: role.name === "Admin",
      };
    });
    setRolePermissions(initialPerms);
  };

  // Toggle single permission
  const handleTogglePerm = (moduleName: string, op: keyof RolePermissions) => {
    setRolePermissions((prev) => {
      const currentMod = prev[moduleName] || {
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
      };
      return {
        ...prev,
        [moduleName]: {
          ...currentMod,
          [op]: !currentMod[op],
        },
      };
    });
  };

  // Toggle all permissions for a module
  const handleToggleModuleAll = (moduleName: string) => {
    setRolePermissions((prev) => {
      const current = prev[moduleName];
      const allActive =
        current?.view && current?.create && current?.edit && current?.delete && current?.export;
      const nextVal = !allActive;
      return {
        ...prev,
        [moduleName]: {
          view: nextVal,
          create: nextVal,
          edit: nextVal,
          delete: nextVal,
          export: nextVal,
        },
      };
    });
  };

  // Select / Deselect All across all modules
  const handleToggleAllGlobal = (enable: boolean) => {
    const updated: Record<string, RolePermissions> = {};
    SYSTEM_MODULES.forEach((mod) => {
      updated[mod] = {
        view: enable,
        create: enable,
        edit: enable,
        delete: enable,
        export: enable,
      };
    });
    setRolePermissions(updated);
  };

  // Save Permissions
  const handleSavePermissions = () => {
    if (!activePermRole) return;
    updateStoredSystemRole(activePermRole.id, {
      permissions: rolePermissions,
    });
    toast.success(`Permissions for role "${activePermRole.name}" updated successfully!`);
    setActivePermRole(null);
  };

  // Form Submit Role
  const handleFormSubmitRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (editingRole) {
      updateStoredSystemRole(editingRole.id, {
        name: formRoleName.trim(),
        status: formRoleStatus,
        description: formRoleDescription.trim(),
      });
      toast.success(`Role "${formRoleName}" updated successfully!`);
    } else {
      addStoredSystemRole(formRoleName.trim(), formRoleStatus, formRoleDescription.trim());
      toast.success(`Role "${formRoleName}" created successfully!`);
    }

    setIsRoleModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingRole) return;
    if (deletingRole.name === "Admin") {
      toast.error("The system Admin role cannot be deleted.");
      setDeletingRole(null);
      return;
    }

    deleteStoredSystemRole(deletingRole.id);
    toast.success(`Role "${deletingRole.name}" deleted.`);
    setDeletingRole(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Role Name", "Created On", "Status", "Description"];
    const rows = filteredRoles.map((r) => [
      `"${r.name}"`,
      `"${r.createdOn}"`,
      r.status,
      `"${r.description || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Roles_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Roles exported successfully!");
  };

  return (
    <div className="space-y-5">
      {/* Page Header (Matching Image 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Roles
          </h1>
        </div>

        {/* Action buttons (Print, Export, + Add New) */}
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
            onClick={handleOpenCreateRole}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Main Table Container Card (Matching Image 5) */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Filter Toolbar matching Image 1, 2, 5 */}
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
              onClick={() => toast.info("Filter date range: Showing all roles")}
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
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-lg p-2.5 z-20 space-y-2 text-xs">
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
                      <option value="Active">Active Only</option>
                      <option value="Inactive">Inactive Only</option>
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
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-lg p-1.5 z-20 text-xs space-y-1">
                  <button
                    onClick={() => {
                      setSortBy("date");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  >
                    Created Date
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  >
                    Role Name
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
                setSortBy("date");
                toast.success("Filters reset");
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Responsive Table matching Image 5:
            Role, Created On, Status, Action */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[200px]">Role</th>
                <th className="py-3 px-4 min-w-[140px]">Created On</th>
                <th className="py-3 px-4 min-w-[100px]">Status</th>
                <th className="py-3 px-4 min-w-[80px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-medium">No roles found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try resetting filters or click "+ Add New"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRoles.map((item) => {
                  const isActionOpen = openActionId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Role */}
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white text-xs">
                        {item.name}
                        {item.description && (
                          <div className="text-[11px] text-slate-400 font-normal truncate max-w-sm">
                            {item.description}
                          </div>
                        )}
                      </td>

                      {/* Created On */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.createdOn}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.status === "Active"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action (Pop-up with Edit, Permission, and Delete matching Image 5) */}
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
                            <div className="absolute right-4 mt-1 w-32 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-30 text-xs">
                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleOpenEditRole(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3 h-3 text-slate-400" />
                                Edit
                              </button>

                              {/* Permission */}
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleOpenPermissions(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                              >
                                <ShieldCheck className="w-3 h-3 text-slate-400" />
                                Permission
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  setDeletingRole(item);
                                }}
                                disabled={item.name === "Admin"}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
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

        {/* Table Footer with Pagination matching Image 5:
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
                className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${currentPage === pg
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

      {/* ======================= MODAL 1: ADD / EDIT ROLE ======================= */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c6760] dark:text-teal-400">
                  {editingRole ? "Update Role" : "New Security Role"}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingRole ? "Edit Role" : "Add Role"}
                </h3>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmitRole} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formRoleName}
                  onChange={(e) => setFormRoleName(e.target.value)}
                  placeholder="e.g. Inventory Officer, Sales Lead..."
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formRoleDescription}
                  onChange={(e) => setFormRoleDescription(e.target.value)}
                  rows={3}
                  placeholder="Responsibilities and permission scopes for this role..."
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formRoleStatus}
                  onChange={(e) => setFormRoleStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {editingRole ? "Update Role" : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 2: PERMISSIONS MATRIX MODAL ======================= */}
      {activePermRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c6760] dark:text-teal-400">
                  Granular Access Control
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Permissions Matrix: {activePermRole.name}
                </h3>
              </div>
              <button
                onClick={() => setActivePermRole(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#12141c] border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Grant or restrict modules for this security profile
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAllGlobal(true)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200/50 transition-colors"
                >
                  <CheckSquare className="w-3 h-3 inline mr-1" />
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllGlobal(false)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Square className="w-3 h-3 inline mr-1" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-y-auto p-4 sm:p-5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3 text-center">View</th>
                    <th className="py-2.5 px-3 text-center">Create</th>
                    <th className="py-2.5 px-3 text-center">Edit</th>
                    <th className="py-2.5 px-3 text-center">Delete</th>
                    <th className="py-2.5 px-3 text-center">Export</th>
                    <th className="py-2.5 px-3 text-center">All</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {SYSTEM_MODULES.map((mod) => {
                    const p = rolePermissions[mod] || {
                      view: false,
                      create: false,
                      edit: false,
                      delete: false,
                      export: false,
                    };
                    const isAll = p.view && p.create && p.edit && p.delete && p.export;
                    return (
                      <tr key={mod} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {mod}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.view}
                            onChange={() => handleTogglePerm(mod, "view")}
                            className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.create}
                            onChange={() => handleTogglePerm(mod, "create")}
                            className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.edit}
                            onChange={() => handleTogglePerm(mod, "edit")}
                            className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.delete}
                            onChange={() => handleTogglePerm(mod, "delete")}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.export}
                            onChange={() => handleTogglePerm(mod, "export")}
                            className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleModuleAll(mod)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${isAll
                              ? "bg-[#0c6760] text-white"
                              : "bg-slate-100 dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                              }`}
                          >
                            {isAll ? "Full" : "Toggle"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-[#181b24]">
              <button
                type="button"
                onClick={() => setActivePermRole(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL 3: DELETE ROLE CONFIRMATION ======================= */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-sm shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Role?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete role{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  "{deletingRole.name}"
                </span>
                ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingRole(null)}
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

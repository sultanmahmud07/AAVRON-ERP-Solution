import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  SystemUserRecord,
  getStoredSystemUsers,
  addStoredSystemUser,
  updateStoredSystemUser,
  deleteStoredSystemUser,
} from "./systemStorage";

export default function UserManagement() {
  const [users, setUsers] = useState<SystemUserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "role">("date");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserRecord | null>(null);

  // Form State (Matching Image 3 & 4)
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<SystemUserRecord["role"]>("Admin");
  const [formDepartment, setFormDepartment] = useState("Finance");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirm Modal
  const [deletingUser, setDeletingUser] = useState<SystemUserRecord | null>(null);

  const loadData = () => {
    setUsers(getStoredSystemUsers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_system_updated", handleUpdate);
    return () => window.removeEventListener("nexora_system_updated", handleUpdate);
  }, []);

  // Filtered & Sorted List
  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (departmentFilter !== "all" && u.department !== departmentFilter) return false;

      return true;
    });

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "role") {
      result = [...result].sort((a, b) => a.role.localeCompare(b.role));
    }

    return result;
  }, [users, searchQuery, statusFilter, roleFilter, departmentFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Admin");
    setFormDepartment("Finance");
    setFormPassword("");
    setFormConfirmPassword("");
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: SystemUserRecord) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormDepartment(user.department);
    setFormPassword("");
    setFormConfirmPassword("");
    setPreviewImage(user.profileImage || null);
    setIsModalOpen(true);
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size cannot exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editingUser) {
      if (!formPassword) {
        toast.error("Password is required for new users");
        return;
      }
      if (formPassword !== formConfirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    const avatarColors = [
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
    const randomAvatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    if (editingUser) {
      updateStoredSystemUser(editingUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        department: formDepartment,
        profileImage: previewImage || undefined,
      });
      toast.success(`User "${formName}" updated successfully!`);
    } else {
      addStoredSystemUser({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        department: formDepartment,
        status: "Active",
        avatarColor: randomAvatar,
        profileImage: previewImage || undefined,
      });
      toast.success(`User "${formName}" created successfully!`);
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    deleteStoredSystemUser(deletingUser.id);
    toast.success(`User "${deletingUser.name}" deleted.`);
    setDeletingUser(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "User Name",
      "Email",
      "Phone",
      "Role",
      "Department",
      "Created On",
      "Status",
    ];
    const rows = filteredUsers.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      u.role,
      `"${u.department}"`,
      `"${u.createdOn}"`,
      u.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Users_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users exported successfully!");
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
      {/* Page Header (Matching Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Users
          </h1>
        </div>

        {/* Action buttons (Print, Export, + Add New in #0c6760) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
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

      {/* Main Table Container Card (Matching Image 2) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Filter Toolbar matching Image 2 */}
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
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Date Range Button */}
            <button
              onClick={() => toast.info("Filter date range: Showing all user registrations")}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
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
                className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2.5 z-20 space-y-2 text-xs">
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
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Active">Active Only</option>
                      <option value="Inactive">Inactive Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setIsFilterOpen(false);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs"
                    >
                      <option value="all">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="User">User</option>
                      <option value="Employee">Employee</option>
                      <option value="Accountant">Accountant</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort By</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 z-20 text-xs space-y-1">
                  <button
                    onClick={() => {
                      setSortBy("date");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Created Date
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    User Name
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("role");
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Role
                  </button>
                </div>
              )}
            </div>

            {/* View Mode */}
            <button
              onClick={() => toast.info("List view is active")}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 shadow-2xs"
              title="Toggle View"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setRoleFilter("all");
                setDepartmentFilter("all");
                setSortBy("date");
                toast.success("Filters reset");
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 shadow-2xs"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Responsive Table matching Image 2:
            User, Email, Phone, Role, Department, Created On, Status, Action */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <th className="py-3 px-4 min-w-[180px]">User</th>
                <th className="py-3 px-4 min-w-[170px]">Email</th>
                <th className="py-3 px-4 min-w-[140px]">Phone</th>
                <th className="py-3 px-4 min-w-[100px]">Role</th>
                <th className="py-3 px-4 min-w-[110px]">Department</th>
                <th className="py-3 px-4 min-w-[110px]">Created On</th>
                <th className="py-3 px-4 min-w-[90px]">Status</th>
                <th className="py-3 px-4 min-w-[70px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try adjusting filters or click "+ Add New"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((item) => {
                  const isActionOpen = openActionId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* User (Avatar + Name) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.profileImage ? (
                            <img
                              src={item.profileImage}
                              alt={item.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-2xs shrink-0 ${item.avatarColor}`}
                            >
                              {getInitials(item.name)}
                            </div>
                          )}
                          <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-normal">
                        {item.email}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {item.phone}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {item.role}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.department}
                      </td>

                      {/* Created On */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.createdOn}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === "Active"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action (Pop-up with Edit and Delete matching Image 2) */}
                      <td className="py-3 px-4 text-center relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenActionId(isActionOpen ? null : item.id)
                            }
                            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isActionOpen && (
                            <div className="absolute right-4 mt-1 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-30 text-xs">
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleOpenEdit(item);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3 h-3 text-slate-400" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  setDeletingUser(item);
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

        {/* Table Footer with Pagination matching Image 2:
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
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760] cursor-pointer"
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
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================= MODAL: ADD / EDIT USER (Matching Image 3 & 4) ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingUser ? "Edit User" : "Add User"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
              {/* Profile Image Upload Box matching Image 3 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Profile Image <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/png, image/jpeg"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1">
                      JPG or PNG format, not exceeding 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  User Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  required
                />
              </div>

              {/* Role & Department dropdowns matching Image 3 & 4 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as SystemUserRecord["role"])}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] cursor-pointer"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Support">Support</option>
                    <option value="Membership">Membership</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 202 555 0173"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password (Matching Image 3) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password {!editingUser && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUser ? "Leave blank to keep" : "••••••••"}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password {!editingUser && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    placeholder={editingUser ? "Leave blank to keep" : "••••••••"}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    required={!editingUser}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
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
                  {editingUser ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: DELETE CONFIRMATION ======================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete User?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  "{deletingUser.name}"
                </span>
                ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
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

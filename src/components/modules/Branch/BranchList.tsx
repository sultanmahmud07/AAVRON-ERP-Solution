import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  User,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  BranchItem,
  getStoredBranches,
  addStoredBranch,
  updateStoredBranch,
  deleteStoredBranch,
} from "./branchStorage";

export default function BranchList() {
  const [branches, setBranches] = useState<BranchItem[]>([]);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Dropdowns & Action Menu
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);

  // Form states
  const [formBranchName, setFormBranchName] = useState("");
  const [formBranchCode, setFormBranchCode] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formManagerName, setFormManagerName] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const exportRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
      if (
        activeActionId &&
        !(e.target as HTMLElement).closest(".action-menu-container")
      ) {
        setActiveActionId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeActionId]);

  // Load branches
  const loadData = () => {
    setBranches(getStoredBranches());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_branches_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_branches_updated", handleUpdate);
    };
  }, []);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.branchName.toLowerCase().includes(q) ||
        b.branchCode.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        (b.managerName && b.managerName.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" || b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [branches, searchQuery, statusFilter]);

  // Pagination slice
  const totalItems = filteredBranches.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBranches.slice(start, start + pageSize);
  }, [filteredBranches, currentPage, pageSize]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextNum = branches.length + 1;
    const nextCode = `BR-${String(nextNum).padStart(3, "0")}`;

    setFormBranchName("");
    setFormBranchCode(nextCode);
    setFormPhone("");
    setFormEmail("");
    setFormAddress("");
    setFormManagerName("");
    setFormStatus("Active");
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (b: BranchItem) => {
    setSelectedBranch(b);
    setFormBranchName(b.branchName);
    setFormBranchCode(b.branchCode);
    setFormPhone(b.phone);
    setFormEmail(b.email);
    setFormAddress(b.address);
    setFormManagerName(b.managerName || "");
    setFormStatus(b.status);
    setFormErrors({});
    setActiveActionId(null);
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (b: BranchItem) => {
    setSelectedBranch(b);
    setActiveActionId(null);
    setIsViewModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (b: BranchItem) => {
    setSelectedBranch(b);
    setActiveActionId(null);
    setIsDeleteModalOpen(true);
  };

  // Toggle Status
  const handleToggleStatus = (b: BranchItem) => {
    const nextStatus = b.status === "Active" ? "Inactive" : "Active";
    updateStoredBranch(b.id, { status: nextStatus });
    toast.success(`Branch "${b.branchName}" is now ${nextStatus}`);
    setActiveActionId(null);
  };

  // Save Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formBranchName.trim()) errors.branchName = "Branch name is required";
    if (!formPhone.trim()) errors.phone = "Phone number is required";
    if (!formEmail.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formEmail.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!formAddress.trim()) errors.address = "Address is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addStoredBranch({
      branchName: formBranchName.trim(),
      branchCode: formBranchCode.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
      managerName: formManagerName.trim() || undefined,
      status: formStatus,
    });

    toast.success("New branch created successfully!");
    setIsAddModalOpen(false);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    const errors: Record<string, string> = {};

    if (!formBranchName.trim()) errors.branchName = "Branch name is required";
    if (!formPhone.trim()) errors.phone = "Phone number is required";
    if (!formEmail.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formEmail.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!formAddress.trim()) errors.address = "Address is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateStoredBranch(selectedBranch.id, {
      branchName: formBranchName.trim(),
      branchCode: formBranchCode.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
      managerName: formManagerName.trim() || undefined,
      status: formStatus,
    });

    toast.success("Branch details updated successfully!");
    setIsEditModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedBranch) return;
    deleteStoredBranch(selectedBranch.id);
    toast.success(`Branch "${selectedBranch.branchName}" removed`);
    setIsDeleteModalOpen(false);
    setSelectedBranch(null);
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ["SL No", "Branch Code", "Branch Name", "Phone", "Email", "Address", "Manager", "Status"];
    const rows = filteredBranches.map((b) => [
      b.slNo.toString(),
      b.branchCode,
      `"${b.branchName.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      b.email,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${(b.managerName || "N/A").replace(/"/g, '""')}"`,
      b.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `branches_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Branches list exported to CSV");
  };

  const handlePrint = () => {
    setIsExportOpen(false);
    window.print();
  };

  return (
    <div className=" mx-auto min-h-screen">
      {/* Header matching ERP styling */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#0c6760]/10 text-[#0c6760] dark:bg-[#0c6760]/20">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Branches
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage company branches, physical outlets, regional contact details, and locations.
          </p>
        </div>

        {/* Action Buttons: Export & + Add New Branch */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-1">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export as CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Export as Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left border-t border-gray-100 dark:border-gray-800"
                >
                  <Printer className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span>Print Document</span>
                </button>
              </div>
            )}
          </div>

          {/* + Add New Branch Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0c6760] hover:bg-[#09544e] rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Branch</span>
          </button>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm overflow-hidden">
        {/* Filter / Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by branch name, phone, email, address..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50/60 dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter button toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors ${showFilterBar || statusFilter !== "all"
                ? "bg-[#0c6760]/10 border-[#0c6760] text-[#0c6760] dark:bg-[#0c6760]/20 dark:border-[#0c6760]"
                : "bg-white dark:bg-[#181b24] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilterBar && (
          <div className="p-4 bg-gray-50/70 dark:bg-[#14161f] border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-1">
            <div className="w-full sm:w-64">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Branch Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="text-xs text-[#0c6760] hover:underline self-end pb-2 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {/* Table View with exact required columns: SL No, Branch name, Phone, Email, Address, Action */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14161f]/50 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <th className="py-3.5 px-4 font-semibold w-16">SL No</th>
                <th className="py-3.5 px-4 font-semibold min-w-[200px]">Branch Name</th>
                <th className="py-3.5 px-4 font-semibold min-w-[150px]">Phone</th>
                <th className="py-3.5 px-4 font-semibold min-w-[180px]">Email</th>
                <th className="py-3.5 px-4 font-semibold min-w-[240px]">Address</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-sm">
              {paginatedBranches.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium">No branches found</p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your search query or click "+ Add New Branch"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBranches.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    {/* 1. SL No */}
                    <td className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                      {String(b.slNo).padStart(2, "0")}
                    </td>

                    {/* 2. Branch Name */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 block">
                          {b.branchName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-gray-400">
                            {b.branchCode}
                          </span>
                          {b.managerName && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              • <User className="w-3 h-3 text-gray-400 inline" /> {b.managerName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Phone */}
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-mono">{b.phone}</span>
                      </div>
                    </td>

                    {/* 4. Email */}
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <a
                          href={`mailto:${b.email}`}
                          className="hover:text-[#0c6760] transition-colors truncate max-w-[180px]"
                        >
                          {b.email}
                        </a>
                      </div>
                    </td>

                    {/* 5. Address */}
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2 leading-relaxed">{b.address}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {b.status === "Active" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* 6. Action button */}
                    <td className="py-4 px-4 text-right">
                      <div className="relative inline-block text-left action-menu-container">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveActionId(
                              activeActionId === b.id ? null : b.id
                            )
                          }
                          className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeActionId === b.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-1 text-xs">
                            <button
                              type="button"
                              onClick={() => handleOpenViewModal(b)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>View Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(b)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Edit Branch</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(b)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                            >
                              {b.status === "Active" ? (
                                <>
                                  <ToggleLeft className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Set Inactive</span>
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Set Active</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(b)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-medium border-t border-gray-100 dark:border-gray-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
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

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {totalItems}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ADD NEW BRANCH MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-lg rounded-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-[#0c6760]/10 text-[#0c6760]">
                  <Building2 className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Add New Branch
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formBranchName}
                    onChange={(e) => setFormBranchName(e.target.value)}
                    placeholder="e.g. Banani Flagship Outlet"
                    className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.branchName
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                      }`}
                  />
                  {formErrors.branchName && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.branchName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={formBranchCode}
                    onChange={(e) => setFormBranchCode(e.target.value)}
                    placeholder="BR-007"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50/50 dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+880 1711-XXXXXX"
                      className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.phone
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                        }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="branch@nexora.com"
                      className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.email
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                        }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Full street address, area, district, postal code"
                    className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.address
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                      }`}
                  />
                </div>
                {formErrors.address && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Branch Manager / In-Charge
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formManagerName}
                      onChange={(e) => setFormManagerName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Operating Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "Active" | "Inactive")
                    }
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#0c6760] hover:bg-[#09544e] rounded-lg transition-all shadow-sm active:scale-95"
                >
                  Add Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT BRANCH MODAL */}
      {/* ============================================================== */}
      {isEditModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-lg rounded-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-[#0c6760]/10 text-[#0c6760]">
                  <Edit2 className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Edit Branch - {selectedBranch.branchCode}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formBranchName}
                    onChange={(e) => setFormBranchName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  />
                  {formErrors.branchName && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.branchName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={formBranchCode}
                    onChange={(e) => setFormBranchCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  />
                </div>
                {formErrors.address && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Branch Manager
                  </label>
                  <input
                    type="text"
                    value={formManagerName}
                    onChange={(e) => setFormManagerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Operating Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "Active" | "Inactive")
                    }
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#0c6760] hover:bg-[#09544e] rounded-lg transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW BRANCH DETAILS MODAL */}
      {/* ============================================================== */}
      {isViewModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-md rounded-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0c6760]" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Branch Information
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-[#12141c] p-4 rounded-md border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedBranch.branchCode} • SL #{String(selectedBranch.slNo).padStart(2, "0")}
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                    {selectedBranch.branchName}
                  </p>
                </div>
                <div>
                  {selectedBranch.status === "Active" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/60 dark:bg-[#14161f] border border-gray-100 dark:border-gray-800">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-gray-400 block text-[11px]">Contact Phone</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                      {selectedBranch.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/60 dark:bg-[#14161f] border border-gray-100 dark:border-gray-800">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-gray-400 block text-[11px]">Official Email</span>
                    <a
                      href={`mailto:${selectedBranch.email}`}
                      className="font-semibold text-[#0c6760] hover:underline"
                    >
                      {selectedBranch.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/60 dark:bg-[#14161f] border border-gray-100 dark:border-gray-800">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-400 block text-[11px]">Physical Address</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                      {selectedBranch.address}
                    </span>
                  </div>
                </div>

                {selectedBranch.managerName && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/60 dark:bg-[#14161f] border border-gray-100 dark:border-gray-800">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block text-[11px]">Branch In-Charge</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedBranch.managerName}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {isDeleteModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-sm rounded-md shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
              Delete Branch?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {selectedBranch.branchName} ({selectedBranch.branchCode})
              </span>
              ? You can also toggle its status to Inactive instead of deleting.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

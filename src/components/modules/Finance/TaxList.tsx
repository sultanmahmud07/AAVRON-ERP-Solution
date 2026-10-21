import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  X,
  ChevronDown,
  Eye,
  Percent,
  FileSpreadsheet,
  FileText,
  Printer,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  TaxRecord,
  TaxType,
  TaxStatus,
  getStoredTaxes,
  addStoredTax,
  updateStoredTax,
  deleteStoredTax,
  APPLIED_TO_OPTIONS,
} from "./taxStorage";

export default function TaxList() {
  const [taxes, setTaxes] = useState<TaxRecord[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedAppliedTo, setSelectedAppliedTo] = useState<string>("all");

  // UI state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<TaxRecord | null>(null);

  // Form states
  const [formTaxId, setFormTaxId] = useState("");
  const [formTaxName, setFormTaxName] = useState("");
  const [formType, setFormType] = useState<TaxType>("Inclusive");
  const [formRate, setFormRate] = useState<number | string>("");
  const [formAppliedTo, setFormAppliedTo] = useState("All Sales");
  const [formStatus, setFormStatus] = useState<TaxStatus>("Active");
  const [formDescription, setFormDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
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

  // Load taxes
  const loadData = () => {
    const data = getStoredTaxes();
    setTaxes(data);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_finance_taxes_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_finance_taxes_updated", handleUpdate);
    };
  }, []);

  // Filtered taxes
  const filteredTaxes = useMemo(() => {
    return taxes.filter((t) => {
      const matchSearch =
        !searchQuery ||
        t.taxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.taxName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.appliedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description &&
          t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = selectedType === "all" || t.type === selectedType;
      const matchStatus =
        selectedStatus === "all" || t.status === selectedStatus;
      const matchApplied =
        selectedAppliedTo === "all" || t.appliedTo === selectedAppliedTo;

      return matchSearch && matchType && matchStatus && matchApplied;
    });
  }, [taxes, searchQuery, selectedType, selectedStatus, selectedAppliedTo]);

  // Pagination slice
  const totalItems = filteredTaxes.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTaxes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTaxes.slice(start, start + pageSize);
  }, [filteredTaxes, currentPage, pageSize]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const numericIds = taxes
      .map((t) => {
        const m = t.taxId.match(/#?TAX0*(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 8;
    const nextIdStr = `#TAX${String(nextNum).padStart(3, "0")}`;

    setFormTaxId(nextIdStr);
    setFormTaxName("");
    setFormType("Inclusive");
    setFormRate("");
    setFormAppliedTo("All Sales");
    setFormStatus("Active");
    setFormDescription("");
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (t: TaxRecord) => {
    setSelectedTax(t);
    setFormTaxId(t.taxId);
    setFormTaxName(t.taxName);
    setFormType(t.type);
    setFormRate(t.rate);
    setFormAppliedTo(t.appliedTo);
    setFormStatus(t.status);
    setFormDescription(t.description || "");
    setFormErrors({});
    setActiveActionId(null);
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (t: TaxRecord) => {
    setSelectedTax(t);
    setActiveActionId(null);
    setIsViewModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (t: TaxRecord) => {
    setSelectedTax(t);
    setActiveActionId(null);
    setIsDeleteModalOpen(true);
  };

  // Toggle Status
  const handleToggleStatus = (t: TaxRecord) => {
    const newStatus: TaxStatus = t.status === "Active" ? "Inactive" : "Active";
    updateStoredTax(t.id, { status: newStatus });
    toast.success(`Tax ${t.taxName} marked as ${newStatus}`);
    setActiveActionId(null);
  };

  // Submit Add
  const handleSaveAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formTaxName.trim()) errors.taxName = "Tax name is required";
    if (
      formRate === "" ||
      isNaN(Number(formRate)) ||
      Number(formRate) < 0 ||
      Number(formRate) > 100
    ) {
      errors.rate = "Enter a valid percentage rate (0 - 100%)";
    }
    if (!formAppliedTo.trim()) errors.appliedTo = "Applied To is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addStoredTax({
      customId: formTaxId.trim(),
      taxName: formTaxName.trim(),
      type: formType,
      rate: Number(formRate),
      appliedTo: formAppliedTo.trim(),
      status: formStatus,
      description: formDescription.trim() || undefined,
    });

    toast.success("Tax record created successfully");
    setIsAddModalOpen(false);
  };

  // Submit Edit
  const handleSaveEditTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTax) return;
    const errors: Record<string, string> = {};

    if (!formTaxName.trim()) errors.taxName = "Tax name is required";
    if (
      formRate === "" ||
      isNaN(Number(formRate)) ||
      Number(formRate) < 0 ||
      Number(formRate) > 100
    ) {
      errors.rate = "Enter a valid percentage rate (0 - 100%)";
    }
    if (!formAppliedTo.trim()) errors.appliedTo = "Applied To is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateStoredTax(selectedTax.id, {
      taxId: formTaxId.trim(),
      taxName: formTaxName.trim(),
      type: formType,
      rate: Number(formRate),
      appliedTo: formAppliedTo.trim(),
      status: formStatus,
      description: formDescription.trim() || undefined,
    });

    toast.success("Tax record updated successfully");
    setIsEditModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedTax) return;
    deleteStoredTax(selectedTax.id);
    toast.success(`Tax ${selectedTax.taxName} (${selectedTax.taxId}) deleted`);
    setIsDeleteModalOpen(false);
    setSelectedTax(null);
  };

  // Exports
  const handleExportCSV = () => {
    const headers = ["Tax ID", "Tax Name", "Type", "Rate (%)", "Applied To", "Status"];
    const rows = filteredTaxes.map((t) => [
      t.taxId,
      t.taxName,
      t.type,
      `${t.rate}%`,
      t.appliedTo,
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `taxes_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Taxes exported to CSV");
  };

  const handlePrint = () => {
    setIsExportOpen(false);
    window.print();
  };

  return (
    <div className=" max-w-[1600px] mx-auto min-h-screen">
      {/* Top Header matching Image 4 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Taxes
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Configure sales taxes, VAT, GST rates, and invoice calculation rules.
          </p>
        </div>

        {/* Action Buttons: Export and + Add Tax matching Image 4 */}
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

          {/* + Add Tax Button matching Image 4 */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0c6760] hover:bg-[#09544e] rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tax</span>
          </button>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm overflow-hidden">
        {/* Filter / Search Bar matching Image 4 */}
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
              placeholder="Search"
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

          {/* Filter button toggle matching Image 4 */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors ${showFilterBar ||
                selectedType !== "all" ||
                selectedStatus !== "all" ||
                selectedAppliedTo !== "all"
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
          <div className="p-4 bg-gray-50/70 dark:bg-[#14161f] border-b border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-1">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Tax Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
              >
                <option value="all">All Types</option>
                <option value="Inclusive">Inclusive</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Applied To */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Applied To
              </label>
              <select
                value={selectedAppliedTo}
                onChange={(e) => {
                  setSelectedAppliedTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0c6760]"
              >
                <option value="all">All Scopes</option>
                {APPLIED_TO_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Table View matching Image 4 exactly */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14161f]/50 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <th className="py-3.5 px-4 font-semibold">Tax ID</th>
                <th className="py-3.5 px-4 font-semibold">Tax Name</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Rate (%)</th>
                <th className="py-3.5 px-4 font-semibold">Applied To</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-sm">
              {paginatedTaxes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Percent className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium">No taxes found</p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your filters or click "+ Add Tax"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTaxes.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    {/* Tax ID */}
                    <td className="py-4 px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {t.taxId}
                    </td>

                    {/* Tax Name */}
                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100">
                      {t.taxName}
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {t.type}
                    </td>

                    {/* Rate (%) */}
                    <td className="py-4 px-4 font-medium text-gray-900 dark:text-gray-100">
                      {t.rate}%
                    </td>

                    {/* Applied To */}
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {t.appliedTo}
                    </td>

                    {/* Status Badge matching Image 4 */}
                    <td className="py-4 px-4">
                      {t.status === "Active" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Action button matching Image 4 */}
                    <td className="py-4 px-4 text-right">
                      <div className="relative inline-block text-left action-menu-container">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveActionId(
                              activeActionId === t.id ? null : t.id
                            )
                          }
                          className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeActionId === t.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-1 text-xs">
                            <button
                              type="button"
                              onClick={() => handleOpenViewModal(t)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>View Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(t)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                            >
                              <Edit className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Edit Tax</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(t)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                            >
                              {t.status === "Active" ? (
                                <>
                                  <ToggleLeft className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(t)}
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
              <option value={7}>7 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
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
      {/* ADD TAX MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Add Tax
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddTax} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={formTaxId}
                  onChange={(e) => setFormTaxId(e.target.value)}
                  placeholder="#TAX008"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tax Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTaxName}
                  onChange={(e) => setFormTaxName(e.target.value)}
                  placeholder="e.g. Luxury Tax"
                  className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.taxName
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                    }`}
                />
                {formErrors.taxName && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.taxName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TaxType)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    <option value="Inclusive">Inclusive</option>
                    <option value="Exclusive">Exclusive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    placeholder="e.g. 15"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 transition-colors ${formErrors.rate
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-[#0c6760]"
                      }`}
                  />
                  {formErrors.rate && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.rate}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Applied To <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formAppliedTo}
                    onChange={(e) => setFormAppliedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    {APPLIED_TO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaxStatus)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional tax calculation notes or legal citation"
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#0c6760] hover:bg-[#09544e] rounded-lg transition-all shadow-sm active:scale-95"
                >
                  Add Tax
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT TAX MODAL */}
      {/* ============================================================== */}
      {isEditModalOpen && selectedTax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Edit Tax - {selectedTax.taxId}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTax} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tax Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTaxName}
                  onChange={(e) => setFormTaxName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TaxType)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    <option value="Inclusive">Inclusive</option>
                    <option value="Exclusive">Exclusive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Applied To <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formAppliedTo}
                    onChange={(e) => setFormAppliedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    {APPLIED_TO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaxStatus)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0c6760]"
                />
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
      {/* VIEW TAX DETAILS MODAL */}
      {/* ============================================================== */}
      {isViewModalOpen && selectedTax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#0c6760]" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Tax Details ({selectedTax.taxId})
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
              <div className="bg-gray-50 dark:bg-[#12141c] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Tax Name</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {selectedTax.taxName}
                  </p>
                  <span className="text-xs text-gray-500 mt-0.5 inline-block">
                    Type: {selectedTax.type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#0c6760]">
                    {selectedTax.rate}%
                  </span>
                  <div className="mt-1">
                    {selectedTax.status === "Active" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50/60 dark:bg-[#14161f] rounded-lg border border-gray-100 dark:border-gray-800 text-xs">
                <span className="text-gray-500 block mb-1">Applied Scope:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedTax.appliedTo}
                </span>
              </div>

              {selectedTax.description && (
                <div className="p-3 bg-gray-50/60 dark:bg-[#14161f] rounded-lg border border-gray-100 dark:border-gray-800 text-xs">
                  <span className="text-gray-500 block mb-1">Description:</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedTax.description}
                  </p>
                </div>
              )}

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
      {isDeleteModalOpen && selectedTax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
              Delete Tax {selectedTax.taxName}?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {selectedTax.taxName} ({selectedTax.taxId} - {selectedTax.rate}%)
              </span>
              ? Inactive taxes can be toggled without deleting.
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

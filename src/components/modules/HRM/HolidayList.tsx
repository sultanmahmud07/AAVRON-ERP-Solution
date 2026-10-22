import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Calendar,
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
  getStoredHolidays,
  addStoredHoliday,
  updateStoredHoliday,
  deleteStoredHoliday,
  HolidayItem,
} from "./hrmStorage";

export default function HolidayList() {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);

  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc" | "status">("default");

  // Dropdown open states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal state (Reference Image 2)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HolidayItem | null>(null);
  const [holidayTitle, setHolidayTitle] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayDescription, setHolidayDescription] = useState("");

  // Delete Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<HolidayItem | null>(null);

  const loadData = () => {
    const stored = getStoredHolidays();
    setHolidays(stored);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_holidays_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_holidays_updated", handleUpdate);
    };
  }, []);

  // Filter & Sort
  const processedHolidays = useMemo(() => {
    let result = [...holidays];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.date.toLowerCase().includes(q) ||
          h.day.toLowerCase().includes(q) ||
          h.type.toLowerCase().includes(q)
      );
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "status") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [holidays, searchQuery, sortBy]);

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setHolidayTitle("");
    const today = new Date().toISOString().split("T")[0];
    setHolidayDate(today);
    setHolidayDescription("");
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (item: HolidayItem) => {
    setEditingItem(item);
    setHolidayTitle(item.title);
    setHolidayDate(item.date);
    setHolidayDescription(item.description || "");
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!holidayTitle.trim()) {
      toast.error("Please enter a holiday title");
      return;
    }

    // Format date string to "DD MMM YYYY" if needed
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      if (dateStr.includes("-") && dateStr.length === 10) {
        const parts = dateStr.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = parts[0];
        const month = months[parseInt(parts[1], 10) - 1];
        const day = parts[2];
        return `${day} ${month} ${year}`;
      }
      return dateStr;
    };

    const formattedDate = formatDate(holidayDate);

    // Calculate weekday
    let dayOfWeek = "Monday";
    try {
      const d = new Date(holidayDate);
      if (!isNaN(d.getTime())) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        dayOfWeek = days[d.getDay()];
      }
    } catch {
      // Keep fallback
    }

    if (editingItem) {
      updateStoredHoliday(editingItem.id, {
        title: holidayTitle.trim(),
        date: formattedDate,
        day: dayOfWeek,
        description: holidayDescription.trim(),
      });
      toast.success(`Holiday "${holidayTitle}" updated successfully`);
    } else {
      addStoredHoliday({
        title: holidayTitle.trim(),
        date: formattedDate,
        type: "Public",
        status: "Upcoming",
        description: holidayDescription.trim(),
      });
      toast.success(`Holiday "${holidayTitle}" added successfully`);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setHolidayTitle("");
    setHolidayDescription("");
    loadData();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredHoliday(deleteTarget.id);
    toast.success(`Holiday "${deleteTarget.title}" deleted successfully`);
    setDeleteTarget(null);
    loadData();
  };

  // Export handlers
  const handleExportPDF = () => {
    window.print();
    setIsExportOpen(false);
  };

  const handleExportExcel = () => {
    const headers = ["Holiday Name", "Date", "Day", "Type", "Status"];
    const rows = processedHolidays.map((h) => [
      `"${h.title}"`,
      `"${h.date}"`,
      h.day,
      h.type,
      h.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Holidays_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportOpen(false);
    toast.success("Holidays exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP HEADER BAR (Matching Reference Image 1)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Holidays
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

          {/* Right Toolbar: Sort By and Refresh */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
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
                      Holiday Name (A-Z)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name-desc");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "name-desc" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Holiday Name (Z-A)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("status");
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${sortBy === "status" ? "font-bold text-[#0c6760] dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      Status (This Week first)
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
                toast.success("Holidays refreshed");
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
                <th className="py-3.5 px-4 font-bold">Holiday Name</th>
                <th className="py-3.5 px-4 font-bold">Date</th>
                <th className="py-3.5 px-4 font-bold">Day</th>
                <th className="py-3.5 px-4 font-bold">Type</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {processedHolidays.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No holidays found.
                  </td>
                </tr>
              ) : (
                processedHolidays.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Holiday Name */}
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {item.date}
                    </td>

                    {/* Day */}
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.day}
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {item.type}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.status === "Upcoming"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                          : item.status === "This Week"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Action with Popover Menu matching Image 1 */}
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
                            {/* Popover Menu with Edit & Delete exactly matching Image 1 */}
                            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1.5 z-30 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleOpenEditModal(item);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2.5 cursor-pointer font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDeleteTarget(item);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2.5 cursor-pointer font-medium"
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
          ADD / EDIT HOLIDAY MODAL (Matching Reference Image 2)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md p-6 max-w-md w-full shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? "Edit Holiday" : "Add Holiday"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form matching Image 2 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={holidayTitle}
                  onChange={(e) => setHolidayTitle(e.target.value)}
                  placeholder="e.g. New Year's Day"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Date with calendar icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
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
                  value={holidayDescription}
                  onChange={(e) => setHolidayDescription(e.target.value)}
                  placeholder="Enter details about this holiday..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all resize-none"
                />
              </div>

              {/* Action Buttons: Cancel and Add Holiday (Image 2) */}
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
                  {editingItem ? "Save Changes" : "Add Holiday"}
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
                Delete Holiday
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {deleteTarget.title}
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

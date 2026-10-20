import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Printer,
  Download,
  Plus,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  RotateCw,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Columns3,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredWarehouses,
  addStoredWarehouse,
  updateStoredWarehouse,
  deleteStoredWarehouse,
  sampleContactPersons,
  WarehouseItem,
} from "./warehouseStorage";

export default function WarehouseList() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Jan 26 to 20 Jan 26");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc" | "capacity-desc" | "capacity-asc">("default");

  // Dropdown states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null);
  const [warehouseName, setWarehouseName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [warehousePhone, setWarehousePhone] = useState("");
  const [warehouseCapacity, setWarehouseCapacity] = useState("");
  const [warehouseStatus, setWarehouseStatus] = useState<"Active" | "Inactive">("Active");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<WarehouseItem | null>(null);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load data
  const loadWarehouses = () => {
    setWarehouses(getStoredWarehouses());
  };

  useEffect(() => {
    loadWarehouses();
    const handleUpdate = () => loadWarehouses();
    window.addEventListener("nexora_warehouses_updated", handleUpdate);
    return () => window.removeEventListener("nexora_warehouses_updated", handleUpdate);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActiveActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingWarehouse(null);
    setWarehouseName("");
    setContactPerson("");
    setWarehousePhone("");
    setWarehouseCapacity("");
    setWarehouseStatus("Active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (w: WarehouseItem) => {
    setEditingWarehouse(w);
    setWarehouseName(w.name);
    setContactPerson(w.contactPerson);
    setWarehousePhone(w.phone);
    setWarehouseCapacity(String(w.capacity));
    setWarehouseStatus(w.status);
    setActiveActionId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseName.trim()) {
      toast.error("Please enter warehouse name");
      return;
    }
    if (!contactPerson.trim()) {
      toast.error("Please select or enter a contact person");
      return;
    }

    const capNum = Number(warehouseCapacity) || 0;

    if (editingWarehouse) {
      updateStoredWarehouse(editingWarehouse.id, {
        name: warehouseName.trim(),
        contactPerson: contactPerson.trim(),
        phone: warehousePhone.trim(),
        capacity: capNum,
        status: warehouseStatus,
      });
      toast.success(`Warehouse "${warehouseName}" updated successfully`);
    } else {
      addStoredWarehouse(
        warehouseName.trim(),
        contactPerson.trim(),
        warehousePhone.trim(),
        capNum,
        warehouseStatus
      );
      toast.success(`Warehouse "${warehouseName}" created successfully`);
    }

    setIsModalOpen(false);
    setEditingWarehouse(null);
    loadWarehouses();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredWarehouse(deleteTarget.id);
    toast.success(`Warehouse "${deleteTarget.name}" deleted successfully`);
    setDeleteTarget(null);
    setActiveActionId(null);
    loadWarehouses();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID,Warehouse,Contact Person,Phone,Created On,Capacity,Used,Status"];
    const rows = filteredWarehouses.map(
      (w) =>
        `"${w.id}","${w.name}","${w.contactPerson}","${w.phone}","${w.createdOn}","${w.capacity}","${w.used}","${w.status}"`
    );
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `warehouses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Warehouses exported as CSV");
  };

  // Filtered & Sorted Warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses
      .filter((w) => {
        const matchesQuery =
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.phone.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || w.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "capacity-desc") return b.capacity - a.capacity;
        if (sortBy === "capacity-asc") return a.capacity - b.capacity;
        return 0;
      });
  }, [warehouses, searchQuery, statusFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredWarehouses.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedWarehouses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWarehouses.slice(start, start + pageSize);
  }, [filteredWarehouses, currentPage, pageSize]);

  // Avatar helper
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-full space-y-4">
      {/* Header matching Reference Image 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Warehouse
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Export
              <ChevronRight
                className={`w-3.5 h-3.5 transform transition-transform ${
                  isExportOpen ? "rotate-90" : ""
                }`}
              />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-20">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          {/* + Add New Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#181b24] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search Box & Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search"
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400/50"
              />
            </div>

            {/* Date Range Selector matching reference */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="w-full sm:w-auto flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{dateRange}</span>
              </button>
              {isDateOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 p-2 z-20 space-y-1 text-xs">
                  <div className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase px-2 py-1">Quick Ranges</div>
                  {[
                    "01 Jan 26 to 20 Jan 26",
                    "Last 30 Days",
                    "This Month",
                    "Last Quarter",
                    "All Time",
                  ].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setIsDateOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Filter, Sort By, Column toggle, Refresh */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition ${
                showFilterBar
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort By
              </button>
              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-20">
                  <button
                    onClick={() => {
                      setSortBy("default");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "default"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "name-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Warehouse (A - Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("capacity-desc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "capacity-desc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Capacity (High to Low)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("capacity-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      sortBy === "capacity-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                    } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Capacity (Low to High)
                  </button>
                </div>
              )}
            </div>

            {/* Column view */}
            <button
              title="Columns layout"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                loadWarehouses();
                setSearchQuery("");
                setStatusFilter("all");
                setSortBy("default");
                toast.success("Warehouse list refreshed");
              }}
              title="Refresh list"
              className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilterBar && (
          <div className="p-3 bg-slate-50/70 dark:bg-[#12141c]/50 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3 px-4 w-28">ID</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Created On</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Used</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No warehouses found. Try adjusting your search or add a new warehouse.
                  </td>
                </tr>
              ) : (
                paginatedWarehouses.map((wh) => (
                  <tr
                    key={wh.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400">
                      {wh.id}
                    </td>

                    {/* Warehouse Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {wh.name}
                    </td>

                    {/* Contact Person with Circular Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${
                            wh.contactAvatarColor || "bg-indigo-600"
                          } text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          {getInitials(wh.contactPerson)}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {wh.contactPerson}
                        </span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {wh.phone}
                    </td>

                    {/* Created On */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {wh.createdOn}
                    </td>

                    {/* Capacity */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-200">
                      {wh.capacity.toLocaleString()}
                    </td>

                    {/* Used */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-200">
                      {wh.used.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          wh.status === "Active"
                            ? "bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {wh.status}
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="relative inline-block text-left" ref={activeActionId === wh.id ? actionMenuRef : undefined}>
                        <button
                          onClick={() =>
                            setActiveActionId(activeActionId === wh.id ? null : wh.id)
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Action Menu Popup */}
                        {activeActionId === wh.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30">
                            <button
                              onClick={() => handleOpenEditModal(wh)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(wh);
                                setActiveActionId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
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

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value={5}>5 / Pages</option>
              <option value={10}>10 / Pages</option>
              <option value={20}>20 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 bg-white dark:bg-[#181b24]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-medium transition ${
                  currentPage === page
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold border-slate-900 dark:border-white"
                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#181b24]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 bg-white dark:bg-[#181b24]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="text-center text-xs text-slate-400 py-4">
        2026 © Dreams ERP. All Rights Reserved
      </div>

      {/* Add / Edit Warehouse Modal matching Reference Image 4 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Warehouse * (Full width) */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="Enter warehouse name"
                  className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                />
              </div>

              {/* Contact Person * & Phone (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    <option value="">Select</option>
                    {sampleContactPersons.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Phone</label>
                  <input
                    type="text"
                    value={warehousePhone}
                    onChange={(e) => setWarehousePhone(e.target.value)}
                    placeholder="+1 (746) 835-3478"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
              </div>

              {/* Capacity & Status (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Capacity</label>
                  <input
                    type="number"
                    value={warehouseCapacity}
                    onChange={(e) => setWarehouseCapacity(e.target.value)}
                    placeholder="e.g. 300000"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Status</label>
                  <select
                    value={warehouseStatus}
                    onChange={(e) => setWarehouseStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {editingWarehouse ? "Update Warehouse" : "Add Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Warehouse?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{deleteTarget.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:bg-[#181b24] dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition shadow-2xs"
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

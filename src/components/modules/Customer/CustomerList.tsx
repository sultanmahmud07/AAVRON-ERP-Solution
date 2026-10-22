import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Printer,
  Download,
  Plus,
  Search,
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
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredCustomers,
  addStoredCustomer,
  updateStoredCustomer,
  deleteStoredCustomer,
  COUNTRIES_LIST,
  CustomerItem,
} from "./customerStorage";

export default function CustomerList() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "name-asc" | "name-desc" | "country-asc">("default");

  // Dropdown states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCountry, setCustomerCountry] = useState("United States");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerStatus, setCustomerStatus] = useState<"Active" | "Inactive">("Active");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<CustomerItem | null>(null);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Load customers
  const loadCustomers = () => {
    setCustomers(getStoredCustomers());
  };

  useEffect(() => {
    loadCustomers();
    const handleUpdate = () => loadCustomers();
    window.addEventListener("nexora_customers_updated", handleUpdate);
    return () => window.removeEventListener("nexora_customers_updated", handleUpdate);
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
    setEditingCustomer(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerCountry("United States");
    setCustomerAddress("");
    setCustomerStatus("Active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: CustomerItem) => {
    setEditingCustomer(customer);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerPhone(customer.phone);
    setCustomerCountry(customer.country);
    setCustomerAddress(customer.address || "");
    setCustomerStatus(customer.status);
    setActiveActionId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!customerEmail.trim()) {
      toast.error("Please enter email address");
      return;
    }

    if (editingCustomer) {
      updateStoredCustomer(editingCustomer.id, {
        name: customerName.trim(),
        email: customerEmail.trim(),
        phone: customerPhone.trim(),
        country: customerCountry,
        address: customerAddress.trim() || undefined,
        status: customerStatus,
      });
      toast.success(`Customer "${customerName}" updated successfully`);
    } else {
      addStoredCustomer(
        customerName.trim(),
        customerEmail.trim(),
        customerPhone.trim(),
        customerCountry,
        customerAddress.trim() || undefined,
        customerStatus
      );
      toast.success(`Customer "${customerName}" created successfully`);
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
    loadCustomers();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredCustomer(deleteTarget.id);
    toast.success(`Customer "${deleteTarget.name}" deleted successfully`);
    setDeleteTarget(null);
    setActiveActionId(null);
    loadCustomers();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Code,Customer,Email,Phone,Country,Address,Status"];
    const rows = filteredCustomers.map(
      (c) =>
        `"${c.code}","${c.name}","${c.email}","${c.phone}","${c.country}","${c.address || ""}","${c.status}"`
    );
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Customers exported as CSV");
  };

  // Filtered & Sorted customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesQuery =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCountry = countryFilter === "all" || c.country === countryFilter;
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;

        return matchesQuery && matchesCountry && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "country-asc") return a.country.localeCompare(b.country);
        return 0;
      });
  }, [customers, searchQuery, countryFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Initials for avatar
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
      {/* Header matching Reference Image 1 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Customers
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
                className={`w-3.5 h-3.5 transform transition-transform ${isExportOpen ? "rotate-90" : ""
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

      {/* Main Table Card Matching Product Card Dark Background and Borders */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
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

          {/* Actions & Filters on right */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition ${showFilterBar
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
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "default"
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
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "name-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Name (A - Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name-desc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "name-desc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Name (Z - A)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("country-asc");
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${sortBy === "country-asc"
                        ? "text-indigo-600 font-medium bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "text-slate-700 dark:text-slate-200"
                      } hover:bg-slate-50 dark:hover:bg-slate-800/70`}
                  >
                    Country (A - Z)
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
                loadCustomers();
                setSearchQuery("");
                setCountryFilter("all");
                setStatusFilter("all");
                setSortBy("default");
                toast.success("Customers list refreshed");
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
          <div className="p-3 bg-slate-50/70 dark:bg-[#12141c]/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Country:</span>
              <select
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Countries</option>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {(countryFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setCountryFilter("all");
                  setStatusFilter("all");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-28">Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found. Try adjusting your search or add a new customer.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Code */}
                    <td className="py-3.5 px-4 font-normal text-slate-500 dark:text-slate-400">
                      {cust.code}
                    </td>

                    {/* Customer with Circular Avatar & Optional Address Indicator */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full ${cust.avatarColor || "bg-indigo-600"
                            } text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          {getInitials(cust.name)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {cust.name}
                          </span>
                          {cust.address && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {cust.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {cust.email}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {cust.phone}
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                      {cust.country}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cust.status === "Active"
                            ? "bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          }`}
                      >
                        {cust.status}
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className="relative inline-block text-left"
                        ref={activeActionId === cust.id ? actionMenuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setActiveActionId(activeActionId === cust.id ? null : cust.id)
                          }
                          className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Action Menu Popup */}
                        {activeActionId === cust.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-[#181b24] rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30">
                            <button
                              onClick={() => handleOpenEditModal(cust)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(cust);
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
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
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-medium transition ${currentPage === page
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Customer Modal matching Reference Image 2 + Address (Optional) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-md max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCustomer ? "Edit Customer" : "Add Customer"}
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
              {/* Row 1: Customer * & Email * (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Country (Two columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Country</label>
                  <select
                    value={customerCountry}
                    onChange={(e) => setCustomerCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                  >
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Address (Optional) - As explicitly requested! */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Address</label>
                  <span className="text-[10px] text-slate-400 font-medium">(Optional)</span>
                </div>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street, City, State or Postal Code"
                  className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                />
              </div>

              {/* Row 4: Status */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Status</label>
                <select
                  value={customerStatus}
                  onChange={(e) => setCustomerStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400/50 text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {editingCustomer ? "Update Customer" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-md max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Customer?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete customer <span className="font-semibold text-slate-800 dark:text-slate-200">"{deleteTarget.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
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

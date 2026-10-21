import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
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
  Eye,
  Radio,
  BarChart3,
  Users,
  Briefcase,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredJobs,
  deleteStoredJob,
  getStoredDepartments,
  JobRequisitionItem,
} from "./hrmStorage";

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobRequisitionItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Navigation tab state (Image 1: Jobs, Pipeline, Interviews, Offers, Onboarding)
  const [activeTab, setActiveTab] = useState<"Jobs" | "Pipeline" | "Interviews" | "Offers" | "Onboarding">("Jobs");

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "title-asc" | "applicants-desc" | "applicants-asc" | "date-desc">("default");

  // Dropdowns state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<JobRequisitionItem | null>(null);
  const [viewDetailsItem, setViewDetailsItem] = useState<JobRequisitionItem | null>(null);

  const loadData = () => {
    const stored = getStoredJobs();
    setJobs(stored);

    const depts = getStoredDepartments().map((d) => d.name);
    setDepartments(depts.length > 0 ? depts : ["Engineering", "Design", "HR", "Sales", "Marketing", "Finance"]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_jobs_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_jobs_updated", handleUpdate);
    };
  }, []);

  // Filtered & Sorted items
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((item) => {
        const matchesSearch =
          (item.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.jobId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.skills || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesDept = deptFilter === "all" || item.department.toLowerCase() === deptFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesDept;
      })
      .sort((a, b) => {
        if (sortBy === "title-asc") return a.jobTitle.localeCompare(b.jobTitle);
        if (sortBy === "applicants-desc") return (b.applicants || 0) - (a.applicants || 0);
        if (sortBy === "applicants-asc") return (a.applicants || 0) - (b.applicants || 0);
        return 0; // Default order
      });
  }, [jobs, searchQuery, statusFilter, deptFilter, sortBy]);

  // Status badge styling matching reference image 1
  const getStatusBadge = (status: JobRequisitionItem["status"]) => {
    switch (status) {
      case "Open":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
            Open
          </span>
        );
      case "On Hold":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40">
            On Hold
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
            Closed
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

  const handleDelete = () => {
    if (!deleteTarget) return;
    const ok = deleteStoredJob(deleteTarget.id);
    if (ok) {
      toast.success(`Job requisition ${deleteTarget.jobId} deleted`);
      loadData();
    } else {
      toast.error("Failed to delete job requisition");
    }
    setDeleteTarget(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredJobs.length === 0) {
      toast.error("No jobs to export");
      return;
    }
    const headers = ["Job ID", "Job Title", "Department", "Location", "Applicants", "Posted", "Status"];
    const rows = filteredJobs.map((j) => [
      j.jobId,
      `"${j.jobTitle}"`,
      `"${j.department}"`,
      `"${j.location}"`,
      j.applicants,
      `"${j.posted}"`,
      j.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job_listings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Job listings exported to CSV");
  };

  return (
    <div className=" mx-auto space-y-2">
      {/* Top Header matching reference image 1 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Job Listings</h1>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sourcing button */}
          <button
            onClick={() => toast.info("AI Sourcing module active")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-[#0c6760]" />
            Sourcing
          </button>

          {/* Analytics button */}
          <button
            onClick={() => toast.info("Recruitment Analytics: 232 Total Applicants across 7 Active Roles")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            Analytics
          </button>

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
          <Link
            to="/hrm/recruitment/add"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#181b24] hover:bg-slate-800 dark:bg-[#0c6760] dark:hover:bg-[#0a524d] rounded-md shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add New
          </Link>
        </div>
      </div>

      {/* Sub-Navigation Tabs matching reference image 1 */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-8">
          {(["Jobs", "Pipeline", "Interviews", "Offers", "Onboarding"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-150 ${isActive
                  ? "border-[#0c6760] text-[#0c6760] dark:border-[#0c6760] dark:text-[#0c6760]"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "Jobs" ? (
        /* Main Card Container */
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar (Search, Filter, Sort By) */}
          <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60">
            {/* Search Input matching reference image */}
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
                        <option value="open">Open</option>
                        <option value="on hold">On Hold</option>
                        <option value="closed">Closed</option>
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
                      onClick={() => setSortBy("title-asc")}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "title-asc"
                        ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      Job Title (A-Z)
                    </button>
                    <button
                      onClick={() => setSortBy("applicants-desc")}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "applicants-desc"
                        ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      Applicants (High to Low)
                    </button>
                    <button
                      onClick={() => setSortBy("applicants-asc")}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "applicants-asc"
                        ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      Applicants (Low to High)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table matching reference image 1 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#151821]">
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Posted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <Briefcase className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                      No job listings found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Job ID */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs font-normal">
                        {item.jobId}
                      </td>

                      {/* Job Title (Bold) */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {item.jobTitle}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {item.department}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {item.location}
                      </td>

                      {/* Applicants */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {item.applicants}
                      </td>

                      {/* Posted */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {item.posted}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Action Menu matching reference image */}
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
                                onClick={() => navigate(`/hrm/recruitment/edit/${item.id}`)}
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
      ) : (
        /* Alternative Tabs (Pipeline, Interviews, Offers, Onboarding) */
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-8 text-center space-y-4">
          <div className="inline-flex p-3 bg-emerald-50 dark:bg-[#0c6760]/20 rounded-full text-[#0c6760]">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeTab} Management</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Manage candidates moving through the {activeTab.toLowerCase()} stage across all active job postings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-3 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-xs font-semibold text-slate-500">Screening</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">42 Candidates</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-xs font-semibold text-slate-500">Technical Round</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">18 Candidates</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-xs font-semibold text-slate-500">Management Round</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">9 Candidates</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-xs font-semibold text-slate-500">Offer Sent</span>
              <p className="text-lg font-bold text-[#0c6760] mt-1">4 Candidates</p>
            </div>
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
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Delete Job Requisition</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to remove <span className="font-semibold text-slate-700 dark:text-slate-300">{deleteTarget.jobTitle}</span> ({deleteTarget.jobId})?
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
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{viewDetailsItem.jobId}</span>
                  {getStatusBadge(viewDetailsItem.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {viewDetailsItem.jobTitle}
                </h3>
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
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Location</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Hiring Manager</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.hiringManager}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Employment Type</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.employmentType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Experience Level</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.experienceLevel}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Applicants</span>
                <span className="font-bold text-[#0c6760] text-sm">{viewDetailsItem.applicants}</span>
              </div>
            </div>

            {viewDetailsItem.skills && (
              <div className="text-xs">
                <span className="text-slate-400 block text-[11px] mb-1">Required Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewDetailsItem.skills.split(",").map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewDetailsItem.description && (
              <div className="text-xs">
                <span className="text-slate-400 block text-[11px] mb-1">Description</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#12141c] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {viewDetailsItem.description}
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
                  navigate(`/hrm/recruitment/edit/${viewDetailsItem.id}`);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#0c6760] hover:bg-[#0a524d] rounded-lg transition-colors"
              >
                Edit Requisition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

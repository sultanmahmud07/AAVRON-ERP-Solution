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
  Calendar,
  Clock,
  Phone,
  Video,
  MapPin,
  CheckCircle2,
  MoveRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredJobs,
  deleteStoredJob,
  getStoredDepartments,
  JobRequisitionItem,
  getStoredPipeline,
  saveStoredPipeline,
  addStoredPipelineCandidate,
  updateStoredPipelineStage,
  CandidatePipelineItem,
  getStoredInterviews,
  addStoredInterview,
  deleteStoredInterview,
  InterviewItem,
  getStoredOffers,
  addStoredOffer,
  deleteStoredOffer,
  OfferItem,
  getStoredOnboarding,
  addStoredOnboarding,
  deleteStoredOnboarding,
  OnboardingItem,
} from "./hrmStorage";

export default function JobList() {
  const navigate = useNavigate();

  // Navigation tab state (Image 1: Jobs, Pipeline, Interviews, Offers, Onboarding)
  const [activeTab, setActiveTab] = useState<"Jobs" | "Pipeline" | "Interviews" | "Offers" | "Onboarding">("Jobs");

  // Storage Data
  const [jobs, setJobs] = useState<JobRequisitionItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [pipeline, setPipeline] = useState<CandidatePipelineItem[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingItem[]>([]);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "title-asc" | "applicants-desc" | "applicants-asc">("default");

  // Dropdown states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [deleteJobTarget, setDeleteJobTarget] = useState<JobRequisitionItem | null>(null);
  const [viewJobDetails, setViewJobDetails] = useState<JobRequisitionItem | null>(null);

  // Modals for other tabs
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [candName, setCandName] = useState("");
  const [candRole, setCandRole] = useState("");
  const [candStage, setCandStage] = useState<CandidatePipelineItem["stage"]>("Applied");

  const [isAddInterviewOpen, setIsAddInterviewOpen] = useState(false);
  const [intCand, setIntCand] = useState("");
  const [intPos, setIntPos] = useState("");
  const [intInterviewer, setIntInterviewer] = useState("Ethan Walker");
  const [intDateTime, setIntDateTime] = useState("25 May 2026, 10:00 AM");
  const [intType, setIntType] = useState<InterviewItem["type"]>("Video Call");
  const [intStatus, setIntStatus] = useState<InterviewItem["status"]>("Scheduled");

  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [offCand, setOffCand] = useState("");
  const [offPos, setOffPos] = useState("");
  const [offSalary, setOffSalary] = useState("$80,000");
  const [offExpires, setOffExpires] = useState("25 May 2026");
  const [offStatus, setOffStatus] = useState<OfferItem["status"]>("Pending");

  const [isAddOnboardingOpen, setIsAddOnboardingOpen] = useState(false);
  const [onbEmp, setOnbEmp] = useState("");
  const [onbPos, setOnbPos] = useState("");
  const [onbStart, setOnbStart] = useState("01 Jun 2026");
  const [onbBuddy, setOnbBuddy] = useState("Ethan Walker");
  const [onbProgress, setOnbProgress] = useState(30);
  const [onbStatus, setOnbStatus] = useState<OnboardingItem["status"]>("Just Started");

  const loadAllData = () => {
    setJobs(getStoredJobs());
    const depts = getStoredDepartments().map((d) => d.name);
    setDepartments(depts.length > 0 ? depts : ["Engineering", "Design", "HR", "Sales", "Marketing", "Finance"]);
    setPipeline(getStoredPipeline());
    setInterviews(getStoredInterviews());
    setOffers(getStoredOffers());
    setOnboarding(getStoredOnboarding());
  };

  useEffect(() => {
    loadAllData();
    const handleUpdate = () => loadAllData();
    window.addEventListener("nexora_jobs_updated", handleUpdate);
    window.addEventListener("nexora_pipeline_updated", handleUpdate);
    window.addEventListener("nexora_interviews_updated", handleUpdate);
    window.addEventListener("nexora_offers_updated", handleUpdate);
    window.addEventListener("nexora_onboarding_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_jobs_updated", handleUpdate);
      window.removeEventListener("nexora_pipeline_updated", handleUpdate);
      window.removeEventListener("nexora_interviews_updated", handleUpdate);
      window.removeEventListener("nexora_offers_updated", handleUpdate);
      window.removeEventListener("nexora_onboarding_updated", handleUpdate);
    };
  }, []);

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((item) => {
        const matchesSearch =
          (item.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.jobId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.location || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesDept = deptFilter === "all" || item.department.toLowerCase() === deptFilter.toLowerCase();
        return matchesSearch && matchesStatus && matchesDept;
      })
      .sort((a, b) => {
        if (sortBy === "title-asc") return a.jobTitle.localeCompare(b.jobTitle);
        if (sortBy === "applicants-desc") return (b.applicants || 0) - (a.applicants || 0);
        if (sortBy === "applicants-asc") return (a.applicants || 0) - (b.applicants || 0);
        return 0;
      });
  }, [jobs, searchQuery, statusFilter, deptFilter, sortBy]);

  // Filtered Interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.candidate.toLowerCase().includes(q) ||
        item.position.toLowerCase().includes(q) ||
        item.interviewer.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [interviews, searchQuery, statusFilter]);

  // Filtered Offers
  const filteredOffers = useMemo(() => {
    return offers.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.offerId.toLowerCase().includes(q) ||
        item.candidate.toLowerCase().includes(q) ||
        item.position.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchQuery, statusFilter]);

  // Filtered Onboarding
  const filteredOnboarding = useMemo(() => {
    return onboarding.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.employee.toLowerCase().includes(q) ||
        item.position.toLowerCase().includes(q) ||
        item.buddy.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [onboarding, searchQuery, statusFilter]);

  // Pipeline stages configuration matching Image 1
  const pipelineStages: {
    key: CandidatePipelineItem["stage"];
    title: string;
    badgeCount: number;
    badgeClass: string;
  }[] = [
    { key: "Applied", title: "Applied", badgeCount: 12, badgeClass: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400" },
    { key: "Screening", title: "Screening", badgeCount: 8, badgeClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
    { key: "Interview", title: "Interview", badgeCount: 5, badgeClass: "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400" },
    { key: "Offer", title: "Offer", badgeCount: 3, badgeClass: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400" },
    { key: "Hired", title: "Hired", badgeCount: 2, badgeClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  ];

  // Action handlers
  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = "";

    if (activeTab === "Jobs") {
      headers = ["Job ID", "Job Title", "Department", "Location", "Applicants", "Posted", "Status"];
      rows = filteredJobs.map((j) => [j.jobId, `"${j.jobTitle}"`, `"${j.department}"`, `"${j.location}"`, j.applicants, `"${j.posted}"`, j.status]);
      filename = "job_listings.csv";
    } else if (activeTab === "Pipeline") {
      headers = ["Candidate", "Role", "Stage"];
      rows = pipeline.map((p) => [`"${p.name}"`, `"${p.role}"`, p.stage]);
      filename = "candidate_pipeline.csv";
    } else if (activeTab === "Interviews") {
      headers = ["Candidate", "Position", "Interviewer", "Date & Time", "Type", "Status"];
      rows = filteredInterviews.map((i) => [`"${i.candidate}"`, `"${i.position}"`, `"${i.interviewer}"`, `"${i.dateTime}"`, i.type, i.status]);
      filename = "interview_scheduler.csv";
    } else if (activeTab === "Offers") {
      headers = ["Offer ID", "Candidate", "Position", "Salary", "Issued", "Expires", "Status"];
      rows = filteredOffers.map((o) => [o.offerId, `"${o.candidate}"`, `"${o.position}"`, `"${o.salary}"`, `"${o.issued}"`, `"${o.expires}"`, o.status]);
      filename = "job_offers.csv";
    } else {
      headers = ["Employee", "Position", "Start Date", "Buddy", "Progress", "Status"];
      rows = filteredOnboarding.map((onb) => [`"${onb.employee}"`, `"${onb.position}"`, `"${onb.startDate}"`, `"${onb.buddy}"`, `${onb.progress}%`, onb.status]);
      filename = "onboarding_tracker.csv";
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Export completed");
  };

  // Header Title by active tab matching reference images
  const getHeaderTitle = () => {
    switch (activeTab) {
      case "Jobs":
        return "Job Listings";
      case "Pipeline":
        return "Candidate Pipeline";
      case "Interviews":
        return "Interview Scheduler";
      case "Offers":
        return ""; // In Reference Image 3, header text is subtle or omitted
      case "Onboarding":
        return "Onboarding";
    }
  };

  // Add Button Click Handler
  const handleAddNewClick = () => {
    if (activeTab === "Jobs") {
      navigate("/hrm/recruitment/add");
    } else if (activeTab === "Pipeline") {
      setIsAddCandidateOpen(true);
    } else if (activeTab === "Interviews") {
      setIsAddInterviewOpen(true);
    } else if (activeTab === "Offers") {
      setIsAddOfferOpen(true);
    } else if (activeTab === "Onboarding") {
      setIsAddOnboardingOpen(true);
    }
  };

  return (
    <div className="mx-auto space-y-4">
      {/* Top Header matching reference images */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {getHeaderTitle() ? (
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getHeaderTitle()}
          </h1>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2.5 flex-wrap ml-auto">
          {/* Sourcing and Analytics buttons visible on Jobs tab */}
          {activeTab === "Jobs" && (
            <>
              <button
                onClick={() => toast.info("AI Sourcing module active")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-[#0c6760]" />
                Sourcing
              </button>

              <button
                onClick={() => toast.info("Recruitment Analytics: 232 Total Applicants across 7 Active Roles")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                Analytics
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Print
              </button>
            </>
          )}

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
          {activeTab !== "Offers" && (
            <button
              onClick={handleAddNewClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#181b24] hover:bg-slate-800 dark:bg-[#0c6760] dark:hover:bg-[#0a524d] rounded-md shadow transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs matching reference images */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-8">
          {(["Jobs", "Pipeline", "Interviews", "Offers", "Onboarding"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  isActive
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

      {/* ============================================================ */}
      {/* 1. JOBS TAB */}
      {/* ============================================================ */}
      {activeTab === "Jobs" && (
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60">
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

            <div className="flex items-center gap-2.5 self-end md:self-auto">
              {/* Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  Filter
                  <span className="text-[10px] ml-0.5">▾</span>
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-3 z-30 space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Status</label>
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
                  </div>
                )}
              </div>

              {/* Sort By */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  Sort By
                  <span className="text-[10px] ml-0.5">▾</span>
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-30" onClick={() => setIsSortOpen(false)}>
                    <button onClick={() => setSortBy("default")} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800">Default Order</button>
                    <button onClick={() => setSortBy("title-asc")} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800">Job Title (A-Z)</button>
                    <button onClick={() => setSortBy("applicants-desc")} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800">Applicants (High to Low)</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
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
                {filteredJobs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">{item.jobId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.jobTitle}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.department}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.location}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{item.applicants}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.posted}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === "Open"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                          : item.status === "On Hold"
                          ? "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                          : "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenuId === item.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-30" onClick={() => setActiveMenuId(null)}>
                            <button onClick={() => setViewJobDetails(item)} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5 text-slate-400" /> View Details
                            </button>
                            <button onClick={() => navigate(`/hrm/recruitment/edit/${item.id}`)} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit
                            </button>
                            <button onClick={() => setDeleteJobTarget(item)} className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. PIPELINE TAB matching Reference Image 1 */}
      {/* ============================================================ */}
      {activeTab === "Pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pipelineStages.map((stage) => {
            const candidatesInStage = pipeline.filter((p) => p.stage === stage.key);
            return (
              <div
                key={stage.key}
                className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-4 space-y-3.5 min-h-[460px] shadow-xs flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{stage.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${stage.badgeClass}`}>
                    {stage.badgeCount}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-2.5 flex-1">
                  {candidatesInStage.map((cand) => (
                    <div
                      key={cand.id}
                      className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800/80 rounded p-3 shadow-xs hover:border-[#0c6760] transition-colors group relative"
                    >
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {cand.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {cand.role}
                      </p>

                      {/* Stage Move Controls */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Stage:</span>
                        <select
                          value={cand.stage}
                          onChange={(e) => {
                            updateStoredPipelineStage(cand.id, e.target.value as any);
                            setPipeline(getStoredPipeline());
                            toast.success(`Moved ${cand.name} to ${e.target.value}`);
                          }}
                          className="bg-transparent text-slate-700 dark:text-slate-300 text-[10px] cursor-pointer focus:outline-none"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Screening">Screening</option>
                          <option value="Interview">Interview</option>
                          <option value="Offer">Offer</option>
                          <option value="Hired">Hired</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. INTERVIEWS TAB matching Reference Image 2 */}
      {/* ============================================================ */}
      {activeTab === "Interviews" && (
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
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

              {/* Date Badge matching Reference Image 2 */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>01 Jan 26 to 20 Jan 26</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setStatusFilter(statusFilter === "all" ? "scheduled" : "all")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Filter
                <span className="text-[10px] ml-0.5">▾</span>
              </button>
            </div>
          </div>

          {/* Interviews Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#151821]">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Interviewer</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.candidate}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.position}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.interviewer}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.dateTime}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.type}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === "Scheduled"
                          ? "bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40"
                          : item.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                          : "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          deleteStoredInterview(item.id);
                          setInterviews(getStoredInterviews());
                          toast.success("Interview removed");
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. OFFERS TAB matching Reference Image 3 */}
      {/* ============================================================ */}
      {activeTab === "Offers" && (
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60">
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

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setStatusFilter(statusFilter === "all" ? "accepted" : "all")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Filter
                <span className="text-[10px] ml-0.5">▾</span>
              </button>
            </div>
          </div>

          {/* Offers Table matching Reference Image 3 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#151821]">
                  <th className="py-3 px-4">Offer ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4">Issued</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredOffers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">{item.offerId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.candidate}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.position}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">{item.salary}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.issued}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.expires}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === "Accepted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                          : item.status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
                          : "bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          deleteStoredOffer(item.id);
                          setOffers(getStoredOffers());
                          toast.success("Offer removed");
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. ONBOARDING TAB matching Reference Image 4 */}
      {/* ============================================================ */}
      {activeTab === "Onboarding" && (
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60">
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

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setStatusFilter(statusFilter === "all" ? "completed" : "all")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Filter
                <span className="text-[10px] ml-0.5">▾</span>
              </button>
            </div>
          </div>

          {/* Onboarding Table matching Reference Image 4 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#151821]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Buddy</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredOnboarding.map((item) => {
                  // Bar color based on progress percentage matching image 4
                  const barColor =
                    item.progress >= 70
                      ? "bg-[#0c6760]"
                      : item.progress >= 30
                      ? "bg-sky-500"
                      : "bg-amber-500";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.employee}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.position}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.startDate}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.buddy}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${item.progress}%` }} />
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">{item.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          item.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                            : item.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                            : "bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            deleteStoredOnboarding(item.id);
                            setOnboarding(getStoredOnboarding());
                            toast.success("Onboarding record removed");
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS: ADD CANDIDATE, SCHEDULE INTERVIEW, ADD ONBOARDING */}
      {/* ============================================================ */}

      {/* Add Candidate Modal */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg p-5 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Candidate to Pipeline</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Role / Position</label>
                <input
                  type="text"
                  value={candRole}
                  onChange={(e) => setCandRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Stage</label>
                <select
                  value={candStage}
                  onChange={(e) => setCandStage(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setIsAddCandidateOpen(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button
                onClick={() => {
                  if (!candName.trim()) return toast.error("Enter candidate name");
                  addStoredPipelineCandidate(candName.trim(), candRole.trim() || "Applicant", candStage);
                  setPipeline(getStoredPipeline());
                  setIsAddCandidateOpen(false);
                  setCandName("");
                  setCandRole("");
                  toast.success("Candidate added to pipeline");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0c6760] hover:bg-[#0a524d] rounded"
              >
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isAddInterviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg p-5 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Interview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={intCand}
                  onChange={(e) => setIntCand(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Position</label>
                <input
                  type="text"
                  value={intPos}
                  onChange={(e) => setIntPos(e.target.value)}
                  placeholder="e.g. Senior React Dev"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Interviewer</label>
                <input
                  type="text"
                  value={intInterviewer}
                  onChange={(e) => setIntInterviewer(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Date & Time</label>
                <input
                  type="text"
                  value={intDateTime}
                  onChange={(e) => setIntDateTime(e.target.value)}
                  placeholder="25 May 2026, 10:00 AM"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Type</label>
                <select
                  value={intType}
                  onChange={(e) => setIntType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                >
                  <option value="Video Call">Video Call</option>
                  <option value="On-site">On-site</option>
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setIsAddInterviewOpen(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button
                onClick={() => {
                  if (!intCand.trim()) return toast.error("Enter candidate name");
                  addStoredInterview({
                    candidate: intCand.trim(),
                    position: intPos.trim() || "Developer",
                    interviewer: intInterviewer.trim(),
                    dateTime: intDateTime.trim(),
                    type: intType,
                    status: intStatus,
                  });
                  setInterviews(getStoredInterviews());
                  setIsAddInterviewOpen(false);
                  setIntCand("");
                  toast.success("Interview scheduled");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0c6760] hover:bg-[#0a524d] rounded"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Onboarding Modal */}
      {isAddOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg p-5 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Employee Onboarding</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Employee Name</label>
                <input
                  type="text"
                  value={onbEmp}
                  onChange={(e) => setOnbEmp(e.target.value)}
                  placeholder="e.g. Lisa Garcia"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Position</label>
                <input
                  type="text"
                  value={onbPos}
                  onChange={(e) => setOnbPos(e.target.value)}
                  placeholder="e.g. Senior React Dev"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Start Date</label>
                <input
                  type="text"
                  value={onbStart}
                  onChange={(e) => setOnbStart(e.target.value)}
                  placeholder="25 May 2026"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Buddy</label>
                <input
                  type="text"
                  value={onbBuddy}
                  onChange={(e) => setOnbBuddy(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={onbProgress}
                  onChange={(e) => setOnbProgress(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Status</label>
                <select
                  value={onbStatus}
                  onChange={(e) => setOnbStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                >
                  <option value="Just Started">Just Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setIsAddOnboardingOpen(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button
                onClick={() => {
                  if (!onbEmp.trim()) return toast.error("Enter employee name");
                  addStoredOnboarding({
                    employee: onbEmp.trim(),
                    position: onbPos.trim() || "Developer",
                    startDate: onbStart.trim(),
                    buddy: onbBuddy.trim(),
                    progress: onbProgress,
                    status: onbStatus,
                  });
                  setOnboarding(getStoredOnboarding());
                  setIsAddOnboardingOpen(false);
                  setOnbEmp("");
                  toast.success("Onboarding record added");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0c6760] hover:bg-[#0a524d] rounded"
              >
                Add Onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Job Confirmation Modal */}
      {deleteJobTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg p-5 max-w-md w-full space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Delete Job Requisition</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete {deleteJobTarget.jobTitle} ({deleteJobTarget.jobId})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteJobTarget(null)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button
                onClick={() => {
                  deleteStoredJob(deleteJobTarget.id);
                  setJobs(getStoredJobs());
                  setDeleteJobTarget(null);
                  toast.success("Job deleted");
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Job Details Modal */}
      {viewJobDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewJobDetails.jobTitle}</h3>
              <button onClick={() => setViewJobDetails(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">Department:</span> <span className="font-semibold">{viewJobDetails.department}</span></div>
              <div><span className="text-slate-400">Location:</span> <span className="font-semibold">{viewJobDetails.location}</span></div>
              <div><span className="text-slate-400">Applicants:</span> <span className="font-semibold">{viewJobDetails.applicants}</span></div>
              <div><span className="text-slate-400">Status:</span> <span className="font-semibold">{viewJobDetails.status}</span></div>
            </div>
            {viewJobDetails.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#12141c] p-3 rounded">
                {viewJobDetails.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

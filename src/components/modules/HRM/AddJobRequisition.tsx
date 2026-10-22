import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  getStoredJobs,
  addStoredJob,
  updateStoredJob,
  getStoredEmployees,
  getStoredDepartments,
} from "./hrmStorage";

export default function AddJobRequisition() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // Storage data
  const [hiringManagers, setHiringManagers] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // Form State matching Reference Image 2
  const [requisitionId, setRequisitionId] = useState("#REQ0021");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [hiringManager, setHiringManager] = useState("Ethan Walker");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [openings, setOpenings] = useState("1");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [targetHireDate, setTargetHireDate] = useState("");

  // Job Description Card
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");

  // Right Column Cards
  const [priority, setPriority] = useState<"High" | "Medium" | "Low" | "Urgent">("High");
  const [status, setStatus] = useState<"Draft" | "Open" | "Pending Approval" | "Approved" | "On Hold" | "Closed">("Draft");

  useEffect(() => {
    // Load managers and departments
    const emps = getStoredEmployees().map((e) => e.name);
    setHiringManagers(
      emps.length > 0
        ? emps
        : [
          "Ethan Walker",
          "Madison Clark",
          "James Harris",
          "Avery Thompson",
          "Benjamin Wright",
          "Chloe Mitchell",
          "Daniel Roberts",
          "Grace Adams",
        ]
    );

    const depts = getStoredDepartments().map((d) => d.name);
    setDepartments(depts.length > 0 ? depts : ["Engineering", "Design", "HR", "Sales", "Marketing", "Finance"]);

    const allJobs = getStoredJobs();
    if (isEditing && id) {
      const existing = allJobs.find((j) => j.id === id);
      if (existing) {
        setRequisitionId(existing.jobId);
        setJobTitle(existing.jobTitle);
        setDepartment(existing.department);
        setHiringManager(existing.hiringManager || "Ethan Walker");
        setEmploymentType(existing.employmentType || "Full-time");
        setOpenings(String(existing.openings || 1));
        setExperienceLevel(existing.experienceLevel || "Entry Level");
        setLocation(existing.location || "");
        setSalaryMin(existing.salaryMin ? String(existing.salaryMin) : "");
        setSalaryMax(existing.salaryMax ? String(existing.salaryMax) : "");
        setTargetHireDate(existing.targetHireDate || "");
        setDescription(existing.description || "");
        setSkills(existing.skills || "");
        setPriority(existing.priority || "High");
        setStatus(existing.status as any);
      }
    } else {
      const nextNum = allJobs.length + 21;
      setRequisitionId(`#REQ00${nextNum}`);
    }
  }, [id, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle.trim()) {
      toast.error("Please enter a job title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    if (isEditing && id) {
      updateStoredJob(id, {
        jobTitle: jobTitle.trim(),
        department,
        hiringManager,
        employmentType,
        openings: parseInt(openings) || 1,
        experienceLevel,
        location: location.trim() || "Remote",
        salaryMin,
        salaryMax,
        targetHireDate,
        description: description.trim(),
        skills: skills.trim(),
        priority,
        status,
      });
      toast.success("Job requisition updated successfully!");
    } else {
      addStoredJob({
        jobId: requisitionId,
        jobTitle: jobTitle.trim(),
        department,
        hiringManager,
        employmentType,
        openings: parseInt(openings) || 1,
        experienceLevel,
        location: location.trim() || "Remote",
        salaryMin,
        salaryMax,
        targetHireDate,
        description: description.trim(),
        skills: skills.trim(),
        priority,
        status: status === "Draft" ? "Open" : status, // Open in listing or draft
      });
      toast.success("Job requisition submitted successfully!");
    }

    navigate("/hrm/recruitment");
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Breadcrumb matching Reference Image 2 */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/hrm/recruitment" className="hover:text-slate-800 dark:hover:text-slate-200">
          HRM
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/hrm/recruitment" className="hover:text-slate-800 dark:hover:text-slate-200">
          Recruitment
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">
          {isEditing ? "Edit Job Requisition" : "Add Job Requisition"}
        </span>
      </div>

      {/* Header with Title and Cancel / Submit buttons */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isEditing ? "Edit Job Requisition" : "Add Job Requisition"}
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/hrm/recruitment")}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#181b24] hover:bg-slate-800 dark:bg-[#0c6760] dark:hover:bg-[#0a524d] rounded-md shadow transition-colors"
          >
            {isEditing ? "Save Changes" : "Submit Requisition"}
          </button>
        </div>
      </div>

      {/* 2-Column Form Layout matching Reference Image 2 */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Requisition Details */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Requisition Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Requisition ID */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Requisition ID
                </label>
                <input
                  type="text"
                  value={requisitionId}
                  onChange={(e) => setRequisitionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 font-mono focus:outline-none"
                />
              </div>

              {/* Job Title * */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior React Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                />
              </div>

              {/* Department * */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hiring Manager * */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Hiring Manager <span className="text-rose-500">*</span>
                </label>
                <select
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                >
                  {hiringManagers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Openings */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Openings
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 2"
                  value={openings}
                  onChange={(e) => setOpenings(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote, New York, USA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                />
              </div>

              {/* Salary Range (Min) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Salary Range (Min)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 60000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                />
              </div>

              {/* Salary Range (Max) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Salary Range (Max)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 90000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                />
              </div>

              {/* Target Hire Date */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Hire Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={targetHireDate}
                    onChange={(e) => setTargetHireDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Job Description */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Job Description</h2>

            <div className="space-y-4">
              {/* Description * */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed role requirements and responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, REST APIs"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) matching Reference Image 2 */}
        <div className="space-y-6">
          {/* Card 1: Priority */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Priority</h2>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Card 2: Status */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
            >
              <option value="Draft">Draft</option>
              <option value="Open">Open</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="On Hold">On Hold</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}

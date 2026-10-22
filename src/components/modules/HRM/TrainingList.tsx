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
  Eye,
  AlertCircle,
  X,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredTrainings,
  addStoredTraining,
  updateStoredTraining,
  deleteStoredTraining,
  getStoredEmployees,
  TrainingItem,
} from "./hrmStorage";

export default function TrainingList() {
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [trainers, setTrainers] = useState<string[]>([]);

  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "program-asc" | "participants-desc" | "status">("default");

  // Dropdown open states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal state (matching Reference Image 2)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingItem | null>(null);

  // Modal form fields
  const [programTitle, setProgramTitle] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [participantsCount, setParticipantsCount] = useState("10");
  const [statusVal, setStatusVal] = useState<TrainingItem["status"]>("Scheduled");

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<TrainingItem | null>(null);
  const [viewDetailsItem, setViewDetailsItem] = useState<TrainingItem | null>(null);

  const loadData = () => {
    const stored = getStoredTrainings();
    setTrainings(stored);

    const emps = getStoredEmployees().map((e) => e.name);
    setTrainers(
      emps.length > 0
        ? emps
        : [
          "Ethan Walker",
          "Madison Clark",
          "Daniel Roberts",
          "Avery Thompson",
          "Chloe Mitchell",
          "Benjamin Wright",
          "Grace Adams",
        ]
    );
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nexora_trainings_updated", handleUpdate);
    return () => {
      window.removeEventListener("nexora_trainings_updated", handleUpdate);
    };
  }, []);

  // Filtered & Sorted items
  const filteredTrainings = useMemo(() => {
    return trainings
      .filter((item) => {
        const matchesSearch =
          (item.program || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.trainingId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.trainer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.status || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "program-asc") return a.program.localeCompare(b.program);
        if (sortBy === "participants-desc") return (b.participants || 0) - (a.participants || 0);
        if (sortBy === "status") return a.status.localeCompare(b.status);
        return 0; // Default order
      });
  }, [trainings, searchQuery, sortBy]);

  // Open Add Modal matching Image 2
  const openAddModal = () => {
    setEditingItem(null);
    setProgramTitle("");
    setSelectedTrainer("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setParticipantsCount("10");
    setStatusVal("Scheduled");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: TrainingItem) => {
    setEditingItem(item);
    setProgramTitle(item.program);
    setSelectedTrainer(item.trainer);
    setStartDate(item.startDate);
    setEndDate(item.endDate);
    setDescription(item.description || "");
    setParticipantsCount(String(item.participants || 10));
    setStatusVal(item.status);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle.trim()) {
      toast.error("Please enter a training program name");
      return;
    }

    const formatDisplayDate = (d: string) => {
      if (!d) return "";
      if (d.includes("-")) {
        const [year, month, day] = d.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mIdx = parseInt(month, 10) - 1;
        return `${day.padStart(2, "0")} ${months[mIdx] || "Jan"} ${year}`;
      }
      return d;
    };

    const formattedStart = formatDisplayDate(startDate) || "10 Jun 2026";
    const formattedEnd = formatDisplayDate(endDate) || "15 Jun 2026";

    if (editingItem) {
      updateStoredTraining(editingItem.id, {
        program: programTitle.trim(),
        trainer: selectedTrainer || "Ethan Walker",
        startDate: formattedStart,
        endDate: formattedEnd,
        participants: parseInt(participantsCount) || 10,
        status: statusVal,
        description: description.trim(),
      });
      toast.success("Training program updated successfully");
    } else {
      addStoredTraining({
        program: programTitle.trim(),
        trainer: selectedTrainer || "Ethan Walker",
        startDate: formattedStart,
        endDate: formattedEnd,
        participants: parseInt(participantsCount) || 10,
        status: statusVal,
        description: description.trim(),
      });
      toast.success("Training program added successfully");
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const ok = deleteStoredTraining(deleteTarget.id);
    if (ok) {
      toast.success(`Training program ${deleteTarget.trainingId} deleted`);
      loadData();
    } else {
      toast.error("Failed to delete training program");
    }
    setDeleteTarget(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredTrainings.length === 0) {
      toast.error("No training programs to export");
      return;
    }
    const headers = ["ID", "Training Program", "Trainer", "Start Date", "End Date", "Participants", "Status"];
    const rows = filteredTrainings.map((t) => [
      t.trainingId,
      `"${t.program}"`,
      `"${t.trainer}"`,
      `"${t.startDate}"`,
      `"${t.endDate}"`,
      t.participants,
      t.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `training_programs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Training programs exported to CSV");
  };

  // Status Badge styling matching reference Image 1
  const getStatusBadge = (status: TrainingItem["status"]) => {
    switch (status) {
      case "Scheduled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40">
            Scheduled
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40">
            In Progress
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
            Cancelled
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

  return (
    <div className="mx-auto space-y-4">
      {/* Top Header matching reference image 1 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Training</h1>

        <div className="flex items-center gap-2.5 flex-wrap">
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
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#181b24] hover:bg-slate-800 dark:bg-[#0c6760] dark:hover:bg-[#0a524d] rounded-md shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add New
          </button>
        </div>
      </div>

      {/* Main Table Card Container matching Reference Image 1 */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-sm overflow-hidden">
        {/* Toolbar (Search and Sort By) */}
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60">
          {/* Search Input */}
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

          {/* Sort By Dropdown */}
          <div className="relative self-end md:self-auto">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
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
                  onClick={() => setSortBy("program-asc")}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "program-asc"
                    ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                >
                  Program (A-Z)
                </button>
                <button
                  onClick={() => setSortBy("participants-desc")}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "participants-desc"
                    ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                >
                  Participants (High to Low)
                </button>
                <button
                  onClick={() => setSortBy("status")}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${sortBy === "status"
                    ? "bg-slate-100 dark:bg-slate-800 text-[#0c6760] font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                >
                  Status
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table matching reference image 1 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#151821]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Training Program</th>
                <th className="py-3 px-4">Trainer</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Participants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTrainings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <GraduationCap className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    No training programs found.
                  </td>
                </tr>
              ) : (
                filteredTrainings.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs font-normal">
                      {item.trainingId}
                    </td>

                    {/* Training Program (Bold) */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.program}
                    </td>

                    {/* Trainer */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.trainer}
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.startDate}
                    </td>

                    {/* End Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.endDate}
                    </td>

                    {/* Participants */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.participants}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Action Menu */}
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
                              onClick={() => openEditModal(item)}
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

      {/* Add / Edit Training Modal matching Reference Image 2 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? "Edit Training" : "Add Training"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body matching Reference Image 2 */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Training Program * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Training Program <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React Development"
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                />
              </div>

              {/* Trainer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trainer
                </label>
                <select
                  value={selectedTrainer}
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                >
                  <option value="">Select Trainer</option>
                  {trainers.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] transition-colors"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter training program objectives, syllabus, and prerequisites..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0c6760] resize-none"
                />
              </div>

              {/* Participants & Status (Additional helper fields) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer matching Reference Image 2 */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#181b24] hover:bg-slate-800 dark:bg-[#0c6760] dark:hover:bg-[#0a524d] rounded-md shadow transition-colors"
                >
                  {editingItem ? "Save Changes" : "Add Training"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-full">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Delete Training Program</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to remove <span className="font-semibold text-slate-700 dark:text-slate-300">{deleteTarget.program}</span> ({deleteTarget.trainingId})?
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
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{viewDetailsItem.trainingId}</span>
                  {getStatusBadge(viewDetailsItem.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {viewDetailsItem.program}
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
                <span className="text-slate-400 block text-[11px]">Trainer</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewDetailsItem.trainer}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Participants</span>
                <span className="font-bold text-[#0c6760] text-sm">{viewDetailsItem.participants}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Start Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.startDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">End Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewDetailsItem.endDate}</span>
              </div>
            </div>

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
                  openEditModal(viewDetailsItem);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#0c6760] hover:bg-[#0a524d] rounded-lg transition-colors"
              >
                Edit Training
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

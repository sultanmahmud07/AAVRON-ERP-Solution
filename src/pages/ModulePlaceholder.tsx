import React, { useState } from "react";
import { useLocation } from "react-router";
import {
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

interface ModulePlaceholderProps {
  moduleName?: string;
  category?: string;
  description?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  moduleName,
  category,
  description,
}) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Extract a readable name from url if not provided
  const pathParts = location.pathname.split("/").filter(Boolean);
  const displayCategory =
    category || (pathParts[0] ? pathParts[0].toUpperCase() : "ERP MODULE");
  const displayTitle =
    moduleName ||
    (pathParts[1]
      ? pathParts[1].replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : pathParts[0]
      ? pathParts[0].replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Overview");

  // Realistic sample records
  const sampleData = [
    {
      id: "REC-901",
      name: `${displayTitle} Primary Record A`,
      code: "REF-2026-01",
      owner: "Jamie Anderson",
      date: "Oct 19, 2026",
      amount: "$14,500.00",
      status: "Completed",
    },
    {
      id: "REC-902",
      name: `${displayTitle} Operations Batch B`,
      code: "REF-2026-02",
      owner: "Alex Thompson",
      date: "Oct 18, 2026",
      amount: "$8,920.00",
      status: "In Progress",
    },
    {
      id: "REC-903",
      name: `${displayTitle} Department Allocation C`,
      code: "REF-2026-03",
      owner: "Maria Garcia",
      date: "Oct 17, 2026",
      amount: "$32,150.00",
      status: "Completed",
    },
    {
      id: "REC-904",
      name: `${displayTitle} Audit Clearance D`,
      code: "REF-2026-04",
      owner: "Thomas Mervin",
      date: "Oct 16, 2026",
      amount: "$5,400.00",
      status: "Pending Review",
    },
    {
      id: "REC-905",
      name: `${displayTitle} Enterprise Schedule E`,
      code: "REF-2026-05",
      owner: "Regina Bryant",
      date: "Oct 15, 2026",
      amount: "$19,800.00",
      status: "Completed",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>{displayCategory}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-slate-200">{displayTitle}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            {displayTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {description || `Manage, inspect, and analyze ${displayTitle.toLowerCase()} data for Dreams ERP.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.success(`Creating new item in ${displayTitle}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create {displayTitle}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161821] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Total Entries</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">1,482</p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            ↗ 8.4% this month
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161821] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Active Records</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">1,390</p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            93.8% operational
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161821] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Monthly Volume</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$482,900</p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            ↗ 12.1% growth
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161821] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Pending Actions</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">14</p>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Requires approval
          </span>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div className="bg-white dark:bg-[#161821] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${displayTitle.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => toast.info("Filter applied")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => toast.success(`Exporting ${displayTitle} dataset...`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Reference Code</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {sampleData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-teal-600 dark:text-teal-400">
                    {row.code}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {row.owner}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{row.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {row.amount}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === "Completed"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                          : row.status === "In Progress"
                          ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toast.info(`Action menu for ${row.name}`)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModulePlaceholder;

import { useState } from "react";
import {
  Printer,
  Download,
  Users,
  CalendarCheck,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_DEPARTMENT_ANALYTICS, DepartmentAnalyticsItem } from "./hrmStorage";

export default function HRAnalytics() {
  const [data] = useState<DepartmentAnalyticsItem[]>(DEFAULT_DEPARTMENT_ANALYTICS);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Department", "Employees", "Avg Salary", "Turnover", "Satisfaction", "Status"];
    const rows = data.map((d) => [
      `"${d.department}"`,
      d.employees,
      `"${d.avgSalary}"`,
      `"${d.turnover}"`,
      `"${d.satisfaction}"`,
      d.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hr_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("HR Analytics exported to CSV");
  };

  // Status Badge styling matching reference Image 3
  const getStatusBadge = (status: DepartmentAnalyticsItem["status"]) => {
    switch (status) {
      case "Healthy":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
            Healthy
          </span>
        );
      case "Watch":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40">
            Watch
          </span>
        );
      case "At Risk":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
            At Risk
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
      {/* Top Header matching reference image 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">HR Analytics</h1>

        <div className="flex items-center gap-2.5">
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
        </div>
      </div>

      {/* Top 4 Metric Cards matching Reference Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Employees */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Employees</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">152</h3>
            </div>
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              5.5%
            </span>
          </div>
        </div>

        {/* Card 2: Attendance Rate */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Attendance Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">94.2%</h3>
            </div>
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              2.1%
            </span>
          </div>
        </div>

        {/* Card 3: Turnover Rate */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Turnover Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3.8%</h3>
            </div>
            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40">
              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              0.5%
            </span>
          </div>
        </div>

        {/* Card 4: Avg Tenure */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Tenure</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3.2 yrs</h3>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              0.3
            </span>
          </div>
        </div>
      </div>

      {/* Main Card: Department Breakdown matching Reference Image 3 */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Department Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#151821]">
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Employees</th>
                <th className="py-3 px-5">Avg Salary</th>
                <th className="py-3 px-5">Turnover</th>
                <th className="py-3 px-5">Satisfaction</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {data.map((item) => (
                <tr
                  key={item.department}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Department (Bold) */}
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                    {item.department}
                  </td>

                  {/* Employees */}
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                    {item.employees}
                  </td>

                  {/* Avg Salary */}
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 font-mono">
                    {item.avgSalary}
                  </td>

                  {/* Turnover */}
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                    {item.turnover}
                  </td>

                  {/* Satisfaction */}
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                    {item.satisfaction}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

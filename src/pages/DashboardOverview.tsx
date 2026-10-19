import React, { useState } from "react";
import {
  Users,
  Calendar,
  UserCheck,
  UserPlus,
  DollarSign,
  Download,
  Plus,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Video,
  Network,
  Code2,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";
import ExportDropdown from "@/components/layout/ExportDropdown";
import AddEmployeeModal from "@/components/modals/AddEmployeeModal";
import RunPayrollModal from "@/components/modals/RunPayrollModal";
import PostJobModal from "@/components/modals/PostJobModal";

// Donut data for Employee Distribution
const employeeDistributionData = [
  { name: "Engineering", value: 488, color: "#0d9488" },
  { name: "Marketing", value: 282, color: "#f97316" },
  { name: "Finance", value: 231, color: "#eab308" },
  { name: "Sales", value: 180, color: "#a855f7" },
  { name: "HR", value: 103, color: "#1e293b" },
];

// Bar chart data for Weekly Attendance
const weeklyAttendanceData = [
  { day: "Mon", attendance: 1205, isHighlighted: false },
  { day: "Tue", attendance: 1220, isHighlighted: false },
  { day: "Wed", attendance: 1198, isHighlighted: false },
  { day: "Thu", attendance: 1180, isHighlighted: true }, // Thursday orange highlight
  { day: "Fri", attendance: 1210, isHighlighted: false },
  { day: "Sat", attendance: 950, isHighlighted: false },
  { day: "Sun", attendance: 420, isHighlighted: false },
];

// Area chart data for 6-Month Payroll Trend
const payrollTrendData = [
  { month: "Jan", payroll: 1080 },
  { month: "Feb", payroll: 1140 },
  { month: "Mar", payroll: 1196 },
  { month: "Apr", payroll: 1248 },
  { month: "May", payroll: 1290 },
  { month: "Jun", payroll: 1350 },
];

export const DashboardOverview: React.FC = () => {
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [runPayrollOpen, setRunPayrollOpen] = useState(false);
  const [postJobOpen, setPostJobOpen] = useState(false);

  // Dynamic table data so posting a new job shows up immediately!
  const [openings, setOpenings] = useState([
    {
      title: "Senior IOS Developer",
      category: "iOS",
      location: "New York , USA",
      openings: "02",
      status: "Active",
      iconType: "apple",
    },
    {
      title: "Junior PHP Developer",
      category: "Web & Application",
      location: "Los Angeles, USA",
      openings: "03",
      status: "Active",
      iconType: "php",
    },
    {
      title: "Network Engineer",
      category: "Networking",
      location: "Bristol, UK",
      openings: "01",
      status: "Expired",
      iconType: "network",
    },
    {
      title: "Junior React Developer",
      category: "Web & Application",
      location: "Birmingham, UK",
      openings: "04",
      status: "Active",
      iconType: "react",
    },
    {
      title: "Senior Laravel Developer",
      category: "Web & Application",
      location: "Washington, USA",
      openings: "02",
      status: "Active",
      iconType: "laravel",
    },
  ]);

  const handleJobCreated = (newJob: any) => {
    setOpenings([
      {
        title: newJob.title,
        category: newJob.category,
        location: newJob.location,
        openings: newJob.openings,
        status: newJob.status,
        iconType: "react",
      },
      ...openings,
    ]);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Top Greeting Bar & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Good morning, Andrew <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            You have 7 leave requests and 2 urgent alerts pending.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <ExportDropdown />

          {/* Add Employee Button */}
          <button
            onClick={() => setAddEmployeeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all font-semibold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Row (Row 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Total Workforce + 4 Mini Stat Boxes (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#161821] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Workforce
                </p>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    1,284
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />
                    12 new this month
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  Active employees across 7 departments
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#1e2238] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* 4 Mini Stat Tiles in 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {/* On Leave Today */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" /> 3.64%
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2.5">
                  On Leave Today
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">23</p>
              </div>

              {/* Attendance Rate */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" /> 3.64%
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2.5">
                  Attendance Rate
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">94.2%</p>
              </div>

              {/* Open Positions */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" /> 3.64%
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2.5">
                  Open Positions
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">47</p>
              </div>

              {/* Monthly Payroll */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" /> 3.64%
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2.5">
                  Monthly Payroll
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">$1,248K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Employee Distribution & Run Payroll (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#161821] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Employee Distribution
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live
              </span>
            </div>

            {/* Donut Chart with Centered Total Count */}
            <div className="relative flex items-center justify-between my-2">
              <div className="relative w-44 h-44 shrink-0 mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employeeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={74}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {employeeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} Employees`, name]}
                      contentStyle={{
                        backgroundColor: "#1e222e",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white leading-none">
                    1,284
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Employees
                  </span>
                </div>
              </div>

              {/* Department Legend */}
              <div className="space-y-1.5 flex-1 pl-4 text-xs font-semibold">
                {employeeDistributionData.map((dept, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                      <span className="truncate">{dept.name}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white font-bold ml-2">
                      {dept.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Summary Badges */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">1196</p>
                <p className="text-[10px] text-slate-400 font-medium">Active</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">88</p>
                <p className="text-[10px] text-slate-400 font-medium">On Leave</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">12</p>
                <p className="text-[10px] text-slate-400 font-medium">Notice</p>
              </div>
            </div>
          </div>

          {/* Bottom Banner: Run Payroll */}
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold leading-tight">Run Payroll</p>
              <p className="text-[11px] text-emerald-100">Process Monthly Pay</p>
            </div>
            <button
              onClick={() => setRunPayrollOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-xs transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Run Payroll</span>
            </button>
          </div>
        </div>

        {/* Card 3: Attendance Summary (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#161821] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Attendance Summary
              </h3>
              <button
                onClick={() => toast.info("Navigating to detailed Attendance Logs")}
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                <span>View Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Attendance Status Boxes in 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <p className="text-xs text-slate-400 font-medium">Present</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">1209</p>
                <p className="text-[11px] text-slate-400 mt-0.5">94.2% of workforce</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <p className="text-xs text-slate-400 font-medium">Late</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">78</p>
                <p className="text-[11px] text-slate-400 mt-0.5">After 9:30 AM</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <p className="text-xs text-slate-400 font-medium">Absent</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">52</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Unplanned absence</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <p className="text-xs text-slate-400 font-medium">Remote</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">361</p>
                <p className="text-[11px] text-slate-400 mt-0.5">WFH approved</p>
              </div>
            </div>

            {/* Weekly Attendance Trend Bar Chart */}
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Weekly Attendance Trend
              </p>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAttendanceData} barSize={18}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} Present`, "Attendance"]}
                      contentStyle={{
                        backgroundColor: "#1e222e",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                      {weeklyAttendanceData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={entry.isHighlighted ? "#f97316" : "#0d9488"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Monthly Payroll Card & Recruitment Pipeline (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 4: Monthly Payroll Dark Navy Card (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#101935] dark:bg-[#0e172e] rounded-2xl border border-blue-900/30 p-6 shadow-md text-white flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Monthly Payroll
                </p>
                <h3 className="text-3xl font-black tracking-tight text-white mt-2">
                  $1,248K
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  March 2026 · 1,196 employees
                </p>
              </div>

              <button
                onClick={() => toast.success("Downloading March 2026 Consolidated Payslip...")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-sm border border-white/10 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Payslip</span>
              </button>
            </div>

            {/* 3 Key Payroll Metrics */}
            <div className="grid grid-cols-3 gap-2 my-5 pt-4 border-t border-slate-700/60">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Avg Salary</p>
                <p className="text-lg font-bold text-white mt-0.5">$1,285.3K</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Last Month</p>
                <p className="text-lg font-bold text-white mt-0.5">$1,196K</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">MOM Growth</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">4.2%</p>
              </div>
            </div>

            {/* 6-Month Payroll Trend Area Chart */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-300 mb-2">6-Month Payroll Trend</p>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={payrollTrendData}>
                    <defs>
                      <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`$${val}K`, "Payroll"]}
                      contentStyle={{
                        backgroundColor: "#1e222e",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="payroll"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#payrollGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Recruitment Pipeline Card (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161821] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recruitment Pipeline
              </h3>
              <button
                onClick={() => setPostJobOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post New Job</span>
              </button>
            </div>

            {/* 3 Pipeline Stages */}
            <div className="grid grid-cols-3 gap-3 my-4">
              {/* New Applicants */}
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">47</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">New Applicants</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />
              </div>

              {/* Screening */}
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">23</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Screening</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-full" />
              </div>

              {/* Interviews */}
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">12</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Interviews</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 rounded-full" />
              </div>
            </div>

            {/* Recent Candidates List */}
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Recent Candidates
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Alex Thompson */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
                      alt="Alex Thompson"
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Alex Thompson
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">Senior Developer</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shrink-0">
                    Interview
                  </span>
                </div>

                {/* Maria Garcia */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                      alt="Maria Garcia"
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Maria Garcia
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">UX Designer</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shrink-0">
                    Applied
                  </span>
                </div>

                {/* Thomas Mervin */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                      alt="Thomas Mervin"
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Thomas Mervin
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">Senior Developer</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shrink-0">
                    Offer Made
                  </span>
                </div>

                {/* Regina Bryant */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face"
                      alt="Regina Bryant"
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Regina Bryant
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">Android Developer</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                    Hired
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Performance Tracking & Recent Openings / Payments Table (Row 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 6: Performance Tracking (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161821] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Performance Tracking
              </h3>
              <button
                onClick={() => toast.info("Opening Full Performance Report")}
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                <span>Full Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top 3 Performers */}
            <div className="space-y-3 mt-4">
              {/* Evelyn Hayes - Rank 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
                      alt="Evelyn Hayes"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                      1
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Evelyn Hayes
                    </p>
                    <p className="text-[11px] text-slate-400">Product Manager</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">98</p>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ↗ 2.8%
                  </p>
                </div>
              </div>

              {/* Emily Carter - Rank 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face"
                      alt="Emily Carter"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-600"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-400 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Emily Carter
                    </p>
                    <p className="text-[11px] text-slate-400">Android Developer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">96</p>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ↗ 4.8%
                  </p>
                </div>
              </div>

              {/* Daniel Roberts - Rank 3 */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
                      alt="Daniel Roberts"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-700"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-700 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Daniel Roberts
                    </p>
                    <p className="text-[11px] text-slate-400">Graphic Designer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">94</p>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ↗ 29.6%
                  </p>
                </div>
              </div>
            </div>

            {/* Target Progress Bars */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Hiring Target</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">87%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: "87%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Employee Retention</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: "92%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 7: Recent Payments / Active Openings Table (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161821] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Payments & Vacancies
              </h3>
              <button
                onClick={() => toast.info("Viewing all open vacancies")}
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                <span>All Openings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Job Title</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Location</th>
                    <th className="py-3 px-2 text-center">Openings</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {openings.map((job, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          {/* Tech badge icon */}
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold">
                            {job.iconType === "apple" ? (
                              <span>🍎</span>
                            ) : job.iconType === "php" ? (
                              <span className="text-[10px] text-indigo-500 font-extrabold">PHP</span>
                            ) : job.iconType === "network" ? (
                              <Network className="w-4 h-4 text-emerald-500" />
                            ) : job.iconType === "react" ? (
                              <Code2 className="w-4 h-4 text-sky-500" />
                            ) : (
                              <span className="text-[10px] text-red-500 font-extrabold">LAR</span>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {job.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                        {job.category}
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                        {job.location}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-900 dark:text-white">
                        {job.openings}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {job.status === "Active" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                            <ShieldAlert className="w-3 h-3" />
                            Expired
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <footer className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <p>2026 © NEXORA ERP. All Rights Reserved</p>
        <div className="flex items-center gap-4">
          <button onClick={() => toast.info("Privacy Policy")} className="hover:text-slate-600 dark:hover:text-slate-200">
            Privacy Policy
          </button>
          <button onClick={() => toast.info("Terms of Service")} className="hover:text-slate-600 dark:hover:text-slate-200">
            Terms of Service
          </button>
          <button onClick={() => toast.info("Help & Support Center")} className="hover:text-slate-600 dark:hover:text-slate-200">
            Help Center
          </button>
        </div>
      </footer>

      {/* Interactive Modals */}
      <AddEmployeeModal
        isOpen={addEmployeeOpen}
        onClose={() => setAddEmployeeOpen(false)}
      />

      <RunPayrollModal
        isOpen={runPayrollOpen}
        onClose={() => setRunPayrollOpen(false)}
      />

      <PostJobModal
        isOpen={postJobOpen}
        onClose={() => setPostJobOpen(false)}
        onSuccess={handleJobCreated}
      />
    </div>
  );
};

export default DashboardOverview;

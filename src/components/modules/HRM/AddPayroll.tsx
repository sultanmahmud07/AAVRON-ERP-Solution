import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  getStoredPayrolls,
  addStoredPayroll,
  updateStoredPayroll,
  getStoredEmployees,
  getStoredDepartments,
  PayrollItem,
} from "./hrmStorage";

export default function AddPayroll() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // Storage data
  const [employeesList, setEmployeesList] = useState<{
    name: string;
    photo: string;
    designation: string;
    department: string;
    salary?: string | number;
  }[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  // Payroll Details fields (Reference Image 4)
  const [payrollId, setPayrollId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [designation, setDesignation] = useState("Manager");
  const [department, setDepartment] = useState("Engineering");
  const [payrollMonth, setPayrollMonth] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  // Earnings fields (Reference Image 4)
  const [basicSalary, setBasicSalary] = useState<string>("");
  const [hra, setHra] = useState<string>("");
  const [conveyance, setConveyance] = useState<string>("");
  const [bonus, setBonus] = useState<string>("");
  const [otherAllowances, setOtherAllowances] = useState<string>("");

  // Deductions fields (Reference Image 4)
  const [pf, setPf] = useState<string>("");
  const [profTax, setProfTax] = useState<string>("");
  const [tds, setTds] = useState<string>("");
  const [otherDeductions, setOtherDeductions] = useState<string>("");

  // Right column: Status
  const [status, setStatus] = useState<"Paid" | "Pending">("Paid");

  useEffect(() => {
    const emps = getStoredEmployees().map((e) => ({
      name: e.name,
      photo: e.photo,
      designation: e.designation,
      department: e.department,
      salary: e.salary,
    }));
    setEmployeesList(emps);

    const depts = getStoredDepartments().map((d) => d.name);
    setDepartmentOptions(depts.length > 0 ? depts : ["Engineering", "Design", "HR", "Finance", "Sales", "Marketing"]);

    if (isEditing && id) {
      const all = getStoredPayrolls();
      const existing = all.find((p) => p.id === id);
      if (existing) {
        setPayrollId(existing.payrollId);
        setEmployeeName(existing.employeeName);
        setDesignation(existing.designation);
        setDepartment(existing.department);
        setPayrollMonth(existing.payrollMonth || "");
        setPaymentDate(existing.paymentDate || "");
        setBasicSalary(existing.basic ? String(existing.basic) : "");
        setHra(existing.hra ? String(existing.hra) : "");
        setConveyance(existing.conveyance ? String(existing.conveyance) : "");
        setBonus(existing.bonus ? String(existing.bonus) : "");
        setOtherAllowances(existing.otherAllowances ? String(existing.otherAllowances) : "");
        setPf(existing.pf ? String(existing.pf) : "");
        setProfTax(existing.profTax ? String(existing.profTax) : "");
        setTds(existing.tds ? String(existing.tds) : "");
        setOtherDeductions(existing.otherDeductions ? String(existing.otherDeductions) : "");
        setStatus(existing.status);
      } else {
        toast.error("Payroll record not found");
        navigate("/hrm/payroll");
      }
    } else {
      // Auto-generate next payroll ID like #PR0021
      const all = getStoredPayrolls();
      const nextNum = all.length + 20;
      setPayrollId(`#PR${nextNum < 1000 ? String(nextNum).padStart(4, "0") : nextNum}`);

      // Set default employee if available
      if (emps.length > 0) {
        const first = emps[0];
        setEmployeeName(first.name);
        setDesignation(first.designation);
        setDepartment(first.department);
        setBasicSalary(first.salary ? String(first.salary) : "6500");
      } else {
        setEmployeeName("Ethan Walker");
      }

      const today = new Date().toISOString().split("T")[0];
      setPaymentDate(today);
      setPayrollMonth(today);
    }
  }, [id, isEditing, navigate]);

  // When employee dropdown changes, automatically fill designation and department
  const handleEmployeeChange = (name: string) => {
    setEmployeeName(name);
    const matched = employeesList.find((e) => e.name === name);
    if (matched) {
      if (matched.designation) setDesignation(matched.designation);
      if (matched.department) setDepartment(matched.department);
      if (matched.salary) setBasicSalary(String(matched.salary));
    }
  };

  // Dynamic calculations for Net Salary card
  const totalEarnings = useMemo(() => {
    const b = parseFloat(basicSalary) || 0;
    const h = parseFloat(hra) || 0;
    const c = parseFloat(conveyance) || 0;
    const bo = parseFloat(bonus) || 0;
    const oa = parseFloat(otherAllowances) || 0;
    return b + h + c + bo + oa;
  }, [basicSalary, hra, conveyance, bonus, otherAllowances]);

  const totalDeductions = useMemo(() => {
    const p = parseFloat(pf) || 0;
    const pt = parseFloat(profTax) || 0;
    const t = parseFloat(tds) || 0;
    const od = parseFloat(otherDeductions) || 0;
    return p + pt + t + od;
  }, [pf, profTax, tds, otherDeductions]);

  const netSalary = useMemo(() => {
    return Math.max(0, totalEarnings - totalDeductions);
  }, [totalEarnings, totalDeductions]);

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeName.trim()) {
      toast.error("Please select an employee");
      return;
    }

    if (!basicSalary || isNaN(Number(basicSalary)) || Number(basicSalary) <= 0) {
      toast.error("Please enter a valid Basic Salary");
      return;
    }

    const matchedEmp = employeesList.find((e) => e.name === employeeName);

    const payload = {
      payrollId: payrollId.trim() || `#PR00${Date.now().toString().slice(-2)}`,
      employeeName: employeeName.trim(),
      employeePhoto:
        matchedEmp?.photo ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      designation: designation.trim() || "Staff",
      department: department.trim() || "General",
      payrollMonth,
      paymentDate,
      basic: parseFloat(basicSalary) || 0,
      hra: parseFloat(hra) || 0,
      conveyance: parseFloat(conveyance) || 0,
      bonus: parseFloat(bonus) || 0,
      otherAllowances: parseFloat(otherAllowances) || 0,
      totalEarnings,
      pf: parseFloat(pf) || 0,
      profTax: parseFloat(profTax) || 0,
      tds: parseFloat(tds) || 0,
      otherDeductions: parseFloat(otherDeductions) || 0,
      totalDeductions,
      netPay: netSalary,
      status,
    };

    if (isEditing && id) {
      updateStoredPayroll(id, payload);
      toast.success(`Payroll record for ${employeeName} updated successfully`);
    } else {
      addStoredPayroll(payload);
      toast.success(`Payroll record for ${employeeName} created successfully`);
    }

    navigate("/hrm/payroll");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* =========================================================================
          TOP BREADCRUMB & HEADER BAR (Matching Reference Image 4)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* Breadcrumbs: HRM > Payroll > Add Payroll */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="hover:text-[#0c6760] transition-colors">HRM</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link
              to="/hrm/payroll"
              className="hover:text-[#0c6760] dark:hover:text-teal-400 transition-colors"
            >
              Payroll
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {isEditing ? "Edit Payroll" : "Add Payroll"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? "Edit Payroll" : "Add Payroll"}
          </h1>
        </div>

        {/* Top Right Action Buttons: Cancel and Save Payroll */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/hrm/payroll")}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {isEditing ? "Update Payroll" : "Save Payroll"}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2-COLUMN FORM LAYOUT (Matching Reference Image 4)
          ========================================================================= */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================================
            LEFT COLUMN: DETAILS, EARNINGS, DEDUCTIONS (lg:col-span-8)
            ======================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Payroll Details */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Payroll Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payroll ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payroll ID
                </label>
                <input
                  type="text"
                  value={payrollId}
                  onChange={(e) => setPayrollId(e.target.value)}
                  placeholder="#PR0021"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs font-mono transition-all"
                />
              </div>

              {/* Employee * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={employeeName}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  <option value="">Select Employee</option>
                  {employeesList.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Designation
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  <option value="Manager">Manager</option>
                  <option value="Designer">Designer</option>
                  <option value="Developer">Developer</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Sales Rep">Sales Rep</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payroll Month * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payroll Month <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={payrollMonth}
                    onChange={(e) => setPayrollMonth(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Earnings */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Earnings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Basic Salary * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Basic Salary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  placeholder="e.g. 6500"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* HRA */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  HRA
                </label>
                <input
                  type="number"
                  step="any"
                  value={hra}
                  onChange={(e) => setHra(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Conveyance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Conveyance
                </label>
                <input
                  type="number"
                  step="any"
                  value={conveyance}
                  onChange={(e) => setConveyance(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Bonus */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bonus
                </label>
                <input
                  type="number"
                  step="any"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Other Allowances */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Other Allowances
                </label>
                <input
                  type="number"
                  step="any"
                  value={otherAllowances}
                  onChange={(e) => setOtherAllowances(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Deductions */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Deductions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Provident Fund (PF) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Provident Fund (PF)
                </label>
                <input
                  type="number"
                  step="any"
                  value={pf}
                  onChange={(e) => setPf(e.target.value)}
                  placeholder="e.g. 400"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Professional Tax */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Professional Tax
                </label>
                <input
                  type="number"
                  step="any"
                  value={profTax}
                  onChange={(e) => setProfTax(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* TDS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  TDS
                </label>
                <input
                  type="number"
                  step="any"
                  value={tds}
                  onChange={(e) => setTds(e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Other Deductions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Other Deductions
                </label>
                <input
                  type="number"
                  step="any"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN: NET SALARY & STATUS (lg:col-span-4)
            ======================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Net Salary */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Net Salary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Earnings</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Deductions</span>
                <span className="font-semibold text-rose-500">
                  ${totalDeductions.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                <span>Net Salary</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
                  ${netSalary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Status */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Status
            </h2>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}

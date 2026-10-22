import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Calendar,
  UserCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredEmployees,
  addStoredEmployee,
  updateStoredEmployee,
  getStoredDepartments,
} from "./hrmStorage";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
];

export default function AddEmployee() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // Departments from storage
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([
    "Engineering",
    "Design",
    "HR",
    "Finance",
    "Sales",
    "Marketing",
    "Operations",
    "Support",
  ]);

  // Form Fields
  // Personal Information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");

  // Employment Details
  const [empId, setEmpId] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [designation, setDesignation] = useState("Manager");
  const [department, setDepartment] = useState("Engineering");
  const [shift, setShift] = useState<"Day" | "Night" | "Morning" | "Evening">("Day");
  const [salary, setSalary] = useState("");

  // Right column: Profile photo & Status
  const [photo, setPhoto] = useState<string>("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load departments
    const storedDepts = getStoredDepartments().map((d) => d.name);
    if (storedDepts.length > 0) {
      setDepartmentOptions(storedDepts);
    }

    if (isEditing && id) {
      const all = getStoredEmployees();
      const existing = all.find((e) => e.id === id);
      if (existing) {
        setFirstName(existing.firstName || existing.name.split(" ")[0] || "");
        setLastName(existing.lastName || existing.name.split(" ").slice(1).join(" ") || "");
        setEmail(existing.email || "");
        setPhone(existing.phone || "");
        setDateOfBirth(existing.dateOfBirth || "");
        setGender(existing.gender || "Male");
        setEmpId(existing.empId || "");
        setJoinDate(existing.joinDate || "");
        setDesignation(existing.designation || "Manager");
        setDepartment(existing.department || "Engineering");
        setShift(existing.shift || "Day");
        setSalary(existing.salary ? String(existing.salary) : "");
        setPhoto(existing.photo || "");
        setStatus(existing.status || "Active");
      } else {
        toast.error("Employee not found");
        navigate("/hrm/employees");
      }
    } else {
      // Auto-generate next Employee ID like #EMP0021
      const all = getStoredEmployees();
      const nextNum = all.length + 20;
      setEmpId(`#EMP${nextNum < 1000 ? String(nextNum).padStart(4, "0") : nextNum}`);
      // Default join date to today
      setJoinDate(new Date().toISOString().split("T")[0]);
      // Random default photo from presets
      const randomPreset = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
      setPhoto(randomPreset);
    }
  }, [id, isEditing, navigate]);

  // Handle image upload from computer
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file is too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        toast.success("Profile photo uploaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter both First Name and Last Name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter an Email address");
      return;
    }

    const finalPhoto =
      photo ||
      AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];

    if (isEditing && id) {
      updateStoredEmployee(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || "+1 202 555 0100",
        dateOfBirth,
        gender,
        empId: empId.trim() || `#EMP00${Date.now().toString().slice(-2)}`,
        joinDate: joinDate || new Date().toISOString().split("T")[0],
        designation,
        department,
        shift,
        salary,
        photo: finalPhoto,
        status,
      });
      toast.success(`Employee "${firstName} ${lastName}" updated successfully!`);
    } else {
      addStoredEmployee({
        empId: empId.trim() || `#EMP00${Date.now().toString().slice(-2)}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim(),
        phone: phone.trim() || "+1 202 555 0100",
        dateOfBirth,
        gender,
        joinDate: joinDate || new Date().toISOString().split("T")[0],
        designation,
        department,
        shift,
        salary,
        photo: finalPhoto,
        status,
      });
      toast.success(`Employee "${firstName} ${lastName}" added successfully!`);
    }

    navigate("/hrm/employees");
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* =========================================================================
          TOP BREADCRUMBS & HEADER (Matching Image 3)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumbs: Employees > Add New */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link
              to="/hrm/employees"
              className="hover:text-[#0c6760] dark:hover:text-teal-400 transition-colors"
            >
              Employees
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {isEditing ? "Edit Employee" : "Add New"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? "Edit Employee" : "Add Employee"}
          </h1>
        </div>

        {/* Top Right Action Buttons: Cancel and Save Employee */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/hrm/employees")}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {isEditing ? "Update Employee" : "Save Employee"}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2-COLUMN FORM LAYOUT (Matching Reference Image 3)
          ========================================================================= */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================================
            LEFT COLUMN: PERSONAL INFO & EMPLOYMENT DETAILS (lg:col-span-8)
            ======================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Personal Information */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Ethan"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Last Name * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Walker"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Email * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ethan@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 202 555 0173"
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>

              {/* Date of Birth with calendar icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Employment Details */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Employment Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Employee ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="#EMP0021"
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all font-mono"
                />
              </div>

              {/* Join Date with calendar icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Join Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Designation
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  <option value="Manager">Manager</option>
                  <option value="Designer">Designer</option>
                  <option value="Developer">Developer</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Sales Rep">Sales Rep</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Support Specialist">Support Specialist</option>
                  <option value="Team Lead">Team Lead</option>
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
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shift */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Shift
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer"
                >
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Salary
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN: PROFILE PHOTO & STATUS (lg:col-span-4)
            ======================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Profile Photo */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Profile Photo
            </h2>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Dashed dropzone matching Image 3 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#0c6760] dark:hover:border-teal-400 rounded-md p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/40 group min-h-[160px]"
            >
              {photo ? (
                <div className="relative group/preview">
                  <img
                    src={photo}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    <span className="text-white text-[11px] font-semibold">Change</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#0c6760] transition-colors mb-2">
                    <UserCircle className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Click to upload
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    SVG, PNG, JPG or GIF (max. 2MB)
                  </span>
                </>
              )}
            </div>

            {/* Quick Preset Selector */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Or select a sample avatar</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhoto(p)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${photo === p
                      ? "border-[#0c6760] ring-2 ring-[#0c6760]/30 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                  >
                    <img src={p} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Status */}
          <div className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Status
            </h2>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c6760]/30 focus:border-[#0c6760] text-xs transition-all cursor-pointer font-medium"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}

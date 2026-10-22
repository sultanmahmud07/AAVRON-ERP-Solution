import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { getStoredEmployees, EmployeeItem } from "./hrmStorage";
import {
  AttendanceItem,
  AttendanceStatus,
  addStoredAttendance,
  updateStoredAttendance,
  formatTime12H,
  time12HTo24H,
  calculateAttendanceHours,
  calculateLateMinutes,
} from "./attendanceStorage";

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: AttendanceItem | null;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: AttendanceStatus[] = [
  "Present",
  "Late",
  "Absent",
  "Half Day",
  "Night Shift",
];

export default function MarkAttendanceModal({
  isOpen,
  onClose,
  editingItem,
  onSuccess,
}: MarkAttendanceModalProps) {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [clockIn, setClockIn] = useState("09:00");
  const [clockOut, setClockOut] = useState("18:00");
  const [status, setStatus] = useState<AttendanceStatus>("Present");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load employees from hrmStorage
  useEffect(() => {
    const loaded = getStoredEmployees();
    setEmployees(loaded);
  }, [isOpen]);

  // Pre-fill fields if editing, or set defaults if creating
  useEffect(() => {
    if (editingItem) {
      setSelectedEmployeeId(editingItem.employeeId);
      setDate(editingItem.date || new Date().toISOString().split("T")[0]);
      setClockIn(time12HTo24H(editingItem.checkIn) || "");
      setClockOut(time12HTo24H(editingItem.checkOut) || "");
      setStatus(editingItem.status);
      setRemarks(editingItem.remarks || "");
    } else {
      setSelectedEmployeeId("");
      setDate(new Date().toISOString().split("T")[0]);
      setClockIn("09:00");
      setClockOut("18:00");
      setStatus("Present");
      setRemarks("");
    }
  }, [editingItem, isOpen]);

  // Auto-adjust status if clock-in is past 09:00 and status is Present
  const handleClockInChange = (newClockIn: string) => {
    setClockIn(newClockIn);
    if (!newClockIn) return;
    const [h, m] = newClockIn.split(":").map(Number);
    if (h > 9 || (h === 9 && m > 0)) {
      if (status === "Present") {
        setStatus("Late");
      }
    } else if (status === "Late") {
      setStatus("Present");
    }
  };

  // If status is changed to Absent, clear checkIn/checkOut
  const handleStatusChange = (newStatus: AttendanceStatus) => {
    setStatus(newStatus);
    if (newStatus === "Absent") {
      setClockIn("");
      setClockOut("");
    } else if (!clockIn && !clockOut) {
      if (newStatus === "Night Shift") {
        setClockIn("22:30");
        setClockOut("07:00");
      } else if (newStatus === "Half Day") {
        setClockIn("09:30");
        setClockOut("13:00");
      } else {
        setClockIn("09:00");
        setClockOut("18:00");
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const matchedEmp = employees.find((e) => e.id === selectedEmployeeId);
    if (!matchedEmp) {
      toast.error("Selected employee not found");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedCheckIn =
        status === "Absent" || !clockIn ? "-" : formatTime12H(clockIn);
      const formattedCheckOut =
        status === "Absent" || !clockOut ? "-" : formatTime12H(clockOut);
      const computedHours =
        status === "Absent"
          ? "-"
          : calculateAttendanceHours(formattedCheckIn, formattedCheckOut);
      const computedLate =
        status === "Absent" || status === "Night Shift"
          ? "-"
          : calculateLateMinutes(formattedCheckIn);

      if (editingItem) {
        updateStoredAttendance(editingItem.id, {
          employeeId: matchedEmp.id,
          employeeName: matchedEmp.name,
          employeePhoto: matchedEmp.photo,
          designation: matchedEmp.designation,
          department: matchedEmp.department,
          date,
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut,
          hours: computedHours,
          late: computedLate,
          status,
          remarks,
        });
        toast.success(`Attendance updated for ${matchedEmp.name}`);
      } else {
        addStoredAttendance({
          employeeId: matchedEmp.id,
          employeeName: matchedEmp.name,
          employeePhoto: matchedEmp.photo,
          designation: matchedEmp.designation,
          department: matchedEmp.department,
          date,
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut,
          status,
          remarks,
        });
        toast.success(`Attendance marked for ${matchedEmp.name}`);
      }

      onSuccess?.();
      onClose();
    } catch {
      toast.error("An error occurred while saving attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog matching Reference Image 3 */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#181b24] rounded-md shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 z-10 transition-all text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{editingItem ? "Edit Attendance" : "Mark / Edit Attendance"}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Employee Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Employee <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                required
                className="w-full appearance-none px-3.5 py-2.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition pr-9"
              >
                <option value="" disabled>
                  Select option
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.designation} ({emp.department})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Clock In & Clock Out in 2-column or single depending on status */}
          {status !== "Absent" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Clock In
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={clockIn}
                    onChange={(e) => handleClockInChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Standard shift starts at 09:00 AM
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Clock Out
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={clockOut}
                    onChange={(e) => setClockOut(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Standard shift ends at 06:00 PM
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-md text-xs text-rose-700 dark:text-rose-400">
              Employee is marked as <strong>Absent</strong>. Clock In and Clock Out are recorded as &quot;-&quot;.
            </div>
          )}

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Status <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as AttendanceStatus)}
                required
                className="w-full appearance-none px-3.5 py-2.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition pr-9"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add optional notes or remarks here..."
              className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition resize-none placeholder-slate-400"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1e2530] hover:bg-[#111827] dark:bg-[#0c6760] dark:hover:bg-[#09544e] rounded-md shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

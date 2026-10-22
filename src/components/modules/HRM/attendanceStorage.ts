export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Night Shift"
  | "Half Day";

export interface AttendanceItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhoto: string;
  designation: string;
  department: string;
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g., "21 May 2026"
  checkIn: string; // e.g. "09:00 AM" or "-"
  checkOut: string; // e.g. "06:05 PM" or "-"
  hours: string; // e.g. "9h 5m" or "-"
  late: string; // e.g. "15 min" or "-"
  status: AttendanceStatus;
  remarks?: string;
  createdAt?: string;
}

const ATTENDANCE_STORAGE_KEY = "nexora_hrm_attendance_v1";

export const DEFAULT_ATTENDANCE: AttendanceItem[] = [
  {
    id: "att-1",
    employeeId: "emp-1",
    employeeName: "Ethan Walker",
    employeePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    designation: "Manager",
    department: "Engineering",
    date: "2026-05-21",
    formattedDate: "21 May 2026",
    checkIn: "09:00 AM",
    checkOut: "06:05 PM",
    hours: "9h 5m",
    late: "-",
    status: "Present",
    remarks: "On schedule, completed weekly sprint review.",
    createdAt: "2026-05-21T09:00:00.000Z",
  },
  {
    id: "att-2",
    employeeId: "emp-2",
    employeeName: "Madison Clark",
    employeePhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    designation: "Designer",
    department: "Design",
    date: "2026-05-21",
    formattedDate: "21 May 2026",
    checkIn: "09:15 AM",
    checkOut: "06:00 PM",
    hours: "8h 45m",
    late: "15 min",
    status: "Late",
    remarks: "Metro line maintenance delay reported.",
    createdAt: "2026-05-21T09:15:00.000Z",
  },
  {
    id: "att-3",
    employeeId: "emp-3",
    employeeName: "James Harris",
    employeePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    designation: "Developer",
    department: "Engineering",
    date: "2026-05-21",
    formattedDate: "21 May 2026",
    checkIn: "08:55 AM",
    checkOut: "05:50 PM",
    hours: "8h 55m",
    late: "-",
    status: "Present",
    remarks: "Early arrival, deployed microservice updates.",
    createdAt: "2026-05-21T08:55:00.000Z",
  },
  {
    id: "att-4",
    employeeId: "emp-4",
    employeeName: "Avery Thompson",
    employeePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    designation: "HR Manager",
    department: "HR",
    date: "2026-05-21",
    formattedDate: "21 May 2026",
    checkIn: "-",
    checkOut: "-",
    hours: "-",
    late: "-",
    status: "Absent",
    remarks: "Pre-approved medical leave.",
    createdAt: "2026-05-21T00:00:00.000Z",
  },
  {
    id: "att-5",
    employeeId: "emp-5",
    employeeName: "Benjamin Wright",
    employeePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    designation: "Accountant",
    department: "Finance",
    date: "2026-05-21",
    formattedDate: "21 May 2026",
    checkIn: "09:05 AM",
    checkOut: "06:10 PM",
    hours: "9h 5m",
    late: "5 min",
    status: "Present",
    remarks: "Reconciled fiscal tax ledgers.",
    createdAt: "2026-05-21T09:05:00.000Z",
  },
  {
    id: "att-6",
    employeeId: "emp-6",
    employeeName: "Chloe Mitchell",
    employeePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    designation: "Sales Rep",
    department: "Sales",
    date: "2026-05-21",
    formattedDate: "21 May 2026",
    checkIn: "08:50 AM",
    checkOut: "05:45 PM",
    hours: "8h 55m",
    late: "-",
    status: "Present",
    remarks: "Prepared Q2 enterprise client pitches.",
    createdAt: "2026-05-21T08:50:00.000Z",
  },
  {
    id: "att-7",
    employeeId: "emp-7",
    employeeName: "Daniel Roberts",
    employeePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    designation: "DevOps",
    department: "Operations",
    date: "2026-05-21",
    formattedDate: "21 May 2026",
    checkIn: "10:30 PM",
    checkOut: "07:00 AM",
    hours: "8h 30m",
    late: "-",
    status: "Night Shift",
    remarks: "Night maintenance & database clustering.",
    createdAt: "2026-05-21T22:30:00.000Z",
  },
  {
    id: "att-8",
    employeeId: "emp-8",
    employeeName: "Grace Adams",
    employeePhoto: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&auto=format&fit=crop&q=80",
    designation: "Marketing Lead",
    department: "Marketing",
    date: "2026-05-21",
    formattedDate: "21 May 2026",
    checkIn: "09:30 AM",
    checkOut: "01:00 PM",
    hours: "3h 30m",
    late: "30 min",
    status: "Half Day",
    remarks: "Half-day approved for personal appointment.",
    createdAt: "2026-05-21T09:30:00.000Z",
  },
  // Add entries for current date (2026-10-22) so current day filters have rich data
  {
    id: "att-9",
    employeeId: "emp-1",
    employeeName: "Ethan Walker",
    employeePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    designation: "Manager",
    department: "Engineering",
    date: "2026-10-22",
    formattedDate: "22 Oct 2026",
    checkIn: "09:00 AM",
    checkOut: "06:05 PM",
    hours: "9h 5m",
    late: "-",
    status: "Present",
    remarks: "Present on duty.",
    createdAt: "2026-10-22T09:00:00.000Z",
  },
  {
    id: "att-10",
    employeeId: "emp-2",
    employeeName: "Madison Clark",
    employeePhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    designation: "Designer",
    department: "Design",
    date: "2026-10-22",
    formattedDate: "22 Oct 2026",
    checkIn: "09:20 AM",
    checkOut: "06:00 PM",
    hours: "8h 40m",
    late: "20 min",
    status: "Late",
    remarks: "Design review standup attended.",
    createdAt: "2026-10-22T09:20:00.000Z",
  },
  {
    id: "att-11",
    employeeId: "emp-3",
    employeeName: "James Harris",
    employeePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    designation: "Developer",
    department: "Engineering",
    date: "2026-10-22",
    formattedDate: "22 Oct 2026",
    checkIn: "08:50 AM",
    checkOut: "05:45 PM",
    hours: "8h 55m",
    late: "-",
    status: "Present",
    remarks: "Sprint tasks completed.",
    createdAt: "2026-10-22T08:50:00.000Z",
  },
  {
    id: "att-12",
    employeeId: "emp-4",
    employeeName: "Avery Thompson",
    employeePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    designation: "HR Manager",
    department: "HR",
    date: "2026-10-22",
    formattedDate: "22 Oct 2026",
    checkIn: "-",
    checkOut: "-",
    hours: "-",
    late: "-",
    status: "Absent",
    remarks: "Casual leave day.",
    createdAt: "2026-10-22T00:00:00.000Z",
  },
  {
    id: "att-13",
    employeeId: "emp-5",
    employeeName: "Benjamin Wright",
    employeePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    designation: "Accountant",
    department: "Finance",
    date: "2026-10-22",
    formattedDate: "22 Oct 2026",
    checkIn: "09:05 AM",
    checkOut: "06:10 PM",
    hours: "9h 5m",
    late: "5 min",
    status: "Present",
    remarks: "Monthly financial audit.",
    createdAt: "2026-10-22T09:05:00.000Z",
  },
  {
    id: "att-14",
    employeeId: "emp-6",
    employeeName: "Chloe Mitchell",
    employeePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    designation: "Sales Rep",
    department: "Sales",
    date: "2026-10-22",
    formattedDate: "22 Oct 2026",
    checkIn: "08:55 AM",
    checkOut: "05:50 PM",
    hours: "8h 55m",
    late: "-",
    status: "Present",
    remarks: "Client onboarding meetings.",
    createdAt: "2026-10-22T08:55:00.000Z",
  },
  {
    id: "att-15",
    employeeId: "emp-7",
    employeeName: "Daniel Roberts",
    employeePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    designation: "DevOps",
    department: "Operations",
    date: "2026-10-22",
    formattedDate: "22 Oct 2026",
    checkIn: "10:30 PM",
    checkOut: "07:00 AM",
    hours: "8h 30m",
    late: "-",
    status: "Night Shift",
    remarks: "Night shift monitoring.",
    createdAt: "2026-10-22T22:30:00.000Z",
  },
  {
    id: "att-16",
    employeeId: "emp-8",
    employeeName: "Grace Adams",
    employeePhoto: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&auto=format&fit=crop&q=80",
    designation: "Marketing Lead",
    department: "Marketing",
    date: "2026-10-22",
    formattedDate: "22 Oct 2026",
    checkIn: "09:30 AM",
    checkOut: "01:00 PM",
    hours: "3h 30m",
    late: "30 min",
    status: "Half Day",
    remarks: "Half day leave afternoon.",
    createdAt: "2026-10-22T09:30:00.000Z",
  },
];

// Dispatches an event so all mounted components re-render immediately
function dispatchAttendanceUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nexora_attendance_updated"));
  }
}

/**
 * Format date string "YYYY-MM-DD" into readable "21 May 2026"
 */
export function formatAttendanceDate(dateStr?: string): string {
  if (!dateStr || dateStr === "-") return "-";
  try {
    // If it already contains words like "21 May 2026", return it directly
    if (/[a-zA-Z]/.test(dateStr) && dateStr.split(" ").length === 3) {
      return dateStr;
    }
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * Parse any time string like "09:00 AM", "06:05 PM", "10:30 PM", or "09:00", "18:05" into minutes from midnight
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || timeStr === "-" || timeStr.trim() === "") return null;
  const str = timeStr.trim().toUpperCase();

  // Handle 12-hour AM/PM format (e.g. "09:00 AM", "06:05 PM")
  const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3]?.toUpperCase();

    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Handle 24-hour format "HH:MM"
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Format minutes into "9h 5m" or "-"
 */
export function calculateAttendanceHours(checkIn?: string, checkOut?: string): string {
  const inMin = parseTimeToMinutes(checkIn);
  const outMin = parseTimeToMinutes(checkOut);
  if (inMin === null || outMin === null) return "-";

  let diff = outMin - inMin;
  // If check out is on next day (e.g., Night Shift 10:30 PM to 07:00 AM)
  if (diff < 0) {
    diff += 24 * 60;
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h 0m`;
  return `${minutes}m`;
}

/**
 * Calculate late minutes compared to standard start (default 09:00 AM)
 */
export function calculateLateMinutes(checkIn?: string, standardStart = "09:00 AM"): string {
  const inMin = parseTimeToMinutes(checkIn);
  const stdMin = parseTimeToMinutes(standardStart) ?? 9 * 60; // 09:00 AM = 540 min
  if (inMin === null) return "-";

  if (inMin > stdMin) {
    const lateMin = inMin - stdMin;
    return `${lateMin} min`;
  }
  return "-";
}

/**
 * Convert 24h input time (e.g. "09:15", "18:05") to 12h display time ("09:15 AM", "06:05 PM")
 */
export function formatTime12H(time24?: string): string {
  if (!time24 || time24 === "-") return "-";
  if (time24.toUpperCase().includes("AM") || time24.toUpperCase().includes("PM")) {
    return time24;
  }
  const match = time24.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridian = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${paddedHours}:${minutes} ${meridian}`;
}

/**
 * Convert 12h time ("09:15 AM") to 24h for standard <input type="time"> ("09:15")
 */
export function time12HTo24H(time12?: string): string {
  if (!time12 || time12 === "-") return "";
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return time12;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${paddedHours}:${minutes}`;
}

// ---------------- LOCAL STORAGE CRUD ----------------

export function getStoredAttendance(): AttendanceItem[] {
  if (typeof window === "undefined") return DEFAULT_ATTENDANCE;
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(DEFAULT_ATTENDANCE));
      return DEFAULT_ATTENDANCE;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(DEFAULT_ATTENDANCE));
    return DEFAULT_ATTENDANCE;
  } catch {
    return DEFAULT_ATTENDANCE;
  }
}

export function saveStoredAttendance(items: AttendanceItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(items));
  dispatchAttendanceUpdate();
}

export function addStoredAttendance(
  data: Omit<AttendanceItem, "id" | "formattedDate" | "hours" | "late"> & {
    hours?: string;
    late?: string;
  }
): AttendanceItem {
  const current = getStoredAttendance();
  const id = `att-${Date.now()}`;
  const formattedDate = formatAttendanceDate(data.date);

  const hours = data.hours || calculateAttendanceHours(data.checkIn, data.checkOut);
  const late =
    data.late ||
    (data.status === "Night Shift" || data.status === "Absent"
      ? "-"
      : calculateLateMinutes(data.checkIn));

  const newItem: AttendanceItem = {
    ...data,
    id,
    formattedDate,
    hours,
    late,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  saveStoredAttendance(updated);
  return newItem;
}

export function updateStoredAttendance(
  id: string,
  updates: Partial<AttendanceItem>
): AttendanceItem | null {
  const current = getStoredAttendance();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const existing = current[index];
  const date = updates.date || existing.date;
  const checkIn = updates.checkIn !== undefined ? updates.checkIn : existing.checkIn;
  const checkOut = updates.checkOut !== undefined ? updates.checkOut : existing.checkOut;
  const status = updates.status || existing.status;

  const formattedDate = updates.formattedDate || formatAttendanceDate(date);
  const hours =
    updates.hours !== undefined
      ? updates.hours
      : calculateAttendanceHours(checkIn, checkOut);
  const late =
    updates.late !== undefined
      ? updates.late
      : status === "Night Shift" || status === "Absent"
      ? "-"
      : calculateLateMinutes(checkIn);

  const updatedItem: AttendanceItem = {
    ...existing,
    ...updates,
    formattedDate,
    hours,
    late,
  };

  current[index] = updatedItem;
  saveStoredAttendance(current);
  return updatedItem;
}

export function deleteStoredAttendance(id: string): boolean {
  const current = getStoredAttendance();
  const filtered = current.filter((item) => item.id !== id);
  if (filtered.length !== current.length) {
    saveStoredAttendance(filtered);
    return true;
  }
  return false;
}

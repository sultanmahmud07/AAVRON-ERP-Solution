export interface EmployeeItem {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  joinDate: string;
  designation: string;
  department: string;
  shift: "Day" | "Night" | "Morning" | "Evening";
  salary?: string | number;
  status: "Active" | "Inactive";
  photo: string;
  createdAt: string;
}

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  head: string;
  employeesCount: number;
  createdOn: string;
  status: "Active" | "Inactive";
}

export interface DesignationItem {
  id: string;
  code: string;
  name: string;
  department: string;
  employeesCount: number;
  createdOn: string;
  status: "Active" | "Inactive";
}

export interface LeaveItem {
  id: string;
  code: string;
  employeeId?: string;
  employeeName: string;
  employeePhoto: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  status: "Approved" | "Pending" | "Rejected";
  description?: string;
  appliedOn?: string;
}

export interface LeaveTypeItem {
  id: string;
  code: string;
  name: string;
  daysPerYear: string | number;
  carryForward: "Yes" | "No" | "N/A";
  status: "Active" | "Inactive";
}

export interface HolidayItem {
  id: string;
  title: string;
  date: string;
  day: string;
  type: string;
  status: "Upcoming" | "This Week" | "Past";
  description?: string;
}

export interface PayrollItem {
  id: string;
  payrollId: string;
  employeeName: string;
  employeePhoto: string;
  designation: string;
  department: string;
  payrollMonth?: string;
  paymentDate?: string;
  basic: number;
  hra?: number;
  conveyance?: number;
  bonus: number;
  otherAllowances?: number;
  totalEarnings?: number;
  pf?: number;
  profTax?: number;
  tds?: number;
  otherDeductions?: number;
  totalDeductions?: number;
  netPay: number;
  status: "Paid" | "Pending";
}

const EMPLOYEES_STORAGE_KEY = "nexora_hrm_employees_v1";
const DEPARTMENTS_STORAGE_KEY = "nexora_hrm_departments_v1";

export const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "dept-1",
    code: "#DPT001",
    name: "Engineering",
    head: "Ethan Walker",
    employeesCount: 45,
    createdOn: "11 Sep 2025",
    status: "Active",
  },
  {
    id: "dept-2",
    code: "#DPT002",
    name: "Design",
    head: "Madison Clark",
    employeesCount: 18,
    createdOn: "05 Sep 2025",
    status: "Active",
  },
  {
    id: "dept-3",
    code: "#DPT003",
    name: "HR",
    head: "Avery Thompson",
    employeesCount: 8,
    createdOn: "27 Aug 2025",
    status: "Active",
  },
  {
    id: "dept-4",
    code: "#DPT004",
    name: "Finance",
    head: "Benjamin Wright",
    employeesCount: 12,
    createdOn: "16 Aug 2025",
    status: "Active",
  },
  {
    id: "dept-5",
    code: "#DPT005",
    name: "Sales",
    head: "Chloe Mitchell",
    employeesCount: 25,
    createdOn: "25 Jul 2025",
    status: "Active",
  },
  {
    id: "dept-6",
    code: "#DPT006",
    name: "Marketing",
    head: "Grace Adams",
    employeesCount: 14,
    createdOn: "12 Jul 2025",
    status: "Active",
  },
  {
    id: "dept-7",
    code: "#DPT007",
    name: "Operations",
    head: "Daniel Roberts",
    employeesCount: 20,
    createdOn: "23 Jun 2025",
    status: "Active",
  },
  {
    id: "dept-8",
    code: "#DPT008",
    name: "Support",
    head: "Hannah Scott",
    employeesCount: 10,
    createdOn: "18 May 2025",
    status: "Inactive",
  },
];

export const DEFAULT_EMPLOYEES: EmployeeItem[] = [
  {
    id: "emp-1",
    empId: "#EMP0020",
    firstName: "Ethan",
    lastName: "Walker",
    name: "Ethan Walker",
    email: "ethan@example.com",
    phone: "+1 202 555 0173",
    dateOfBirth: "1992-04-18",
    gender: "Female",
    joinDate: "2024-03-15",
    designation: "Manager",
    department: "Engineering",
    shift: "Day",
    salary: "85000",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    createdAt: "2024-03-15",
  },
  {
    id: "emp-2",
    empId: "#EMP0019",
    firstName: "Madison",
    lastName: "Clark",
    name: "Madison Clark",
    email: "madison@example.com",
    phone: "+91 98765 43210",
    dateOfBirth: "1995-08-22",
    gender: "Female",
    joinDate: "2024-05-10",
    designation: "Designer",
    department: "Design",
    shift: "Day",
    salary: "68000",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    createdAt: "2024-05-10",
  },
  {
    id: "emp-3",
    empId: "#EMP0018",
    firstName: "James",
    lastName: "Harris",
    name: "James Harris",
    email: "james@example.com",
    phone: "+1 416 555 8294",
    dateOfBirth: "1993-11-05",
    gender: "Female",
    joinDate: "2024-06-01",
    designation: "Developer",
    department: "Engineering",
    shift: "Night",
    salary: "75000",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    createdAt: "2024-06-01",
  },
  {
    id: "emp-4",
    empId: "#EMP0017",
    firstName: "Avery",
    lastName: "Thompson",
    name: "Avery Thompson",
    email: "avery@example.com",
    phone: "+61 412 345 678",
    dateOfBirth: "1989-02-14",
    gender: "Male",
    joinDate: "2023-09-15",
    designation: "HR Manager",
    department: "HR",
    shift: "Day",
    salary: "72000",
    status: "Inactive",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    createdAt: "2023-09-15",
  },
  {
    id: "emp-5",
    empId: "#EMP0016",
    firstName: "Benjamin",
    lastName: "Wright",
    name: "Benjamin Wright",
    email: "benjamin@example.com",
    phone: "+49 1512 3456789",
    dateOfBirth: "1991-07-30",
    gender: "Male",
    joinDate: "2023-11-01",
    designation: "Accountant",
    department: "Finance",
    shift: "Day",
    salary: "65000",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    createdAt: "2023-11-01",
  },
  {
    id: "emp-6",
    empId: "#EMP0015",
    firstName: "Chloe",
    lastName: "Mitchell",
    name: "Chloe Mitchell",
    email: "chloe@example.com",
    phone: "+81 90 1234 5678",
    dateOfBirth: "1996-01-25",
    gender: "Female",
    joinDate: "2024-01-15",
    designation: "Sales Rep",
    department: "Sales",
    shift: "Day",
    salary: "58000",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    createdAt: "2024-01-15",
  },
  {
    id: "emp-7",
    empId: "#EMP0014",
    firstName: "Daniel",
    lastName: "Roberts",
    name: "Daniel Roberts",
    email: "daniel@example.com",
    phone: "+55 11 91234 5678",
    dateOfBirth: "1990-09-12",
    gender: "Female",
    joinDate: "2023-08-20",
    designation: "DevOps",
    department: "Engineering",
    shift: "Night",
    salary: "88000",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    createdAt: "2023-08-20",
  },
  {
    id: "emp-8",
    empId: "#EMP0013",
    firstName: "Grace",
    lastName: "Adams",
    name: "Grace Adams",
    email: "grace@example.com",
    phone: "+27 82 123 4567",
    dateOfBirth: "1994-12-03",
    gender: "Female",
    joinDate: "2024-04-01",
    designation: "Marketing",
    department: "Marketing",
    shift: "Day",
    salary: "62000",
    status: "Active",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    createdAt: "2024-04-01",
  },
];

// Helper to notify listeners
function dispatchEmployeesUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nexora_employees_updated"));
  }
}

function dispatchDepartmentsUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nexora_departments_updated"));
  }
}

// ---------------- EMPLOYEES CRUD ----------------
export function getStoredEmployees(): EmployeeItem[] {
  if (typeof window === "undefined") return DEFAULT_EMPLOYEES;
  const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EMPLOYEES;
  } catch {
    return DEFAULT_EMPLOYEES;
  }
}

export function saveStoredEmployees(employees: EmployeeItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  dispatchEmployeesUpdate();
}

export function addStoredEmployee(employeeData: Omit<EmployeeItem, "id" | "createdAt">): EmployeeItem {
  const employees = getStoredEmployees();
  const newEmp: EmployeeItem = {
    ...employeeData,
    id: `emp-${Date.now()}`,
    name: `${employeeData.firstName} ${employeeData.lastName}`.trim(),
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updated = [newEmp, ...employees];
  saveStoredEmployees(updated);
  return newEmp;
}

export function updateStoredEmployee(id: string, updates: Partial<EmployeeItem>): EmployeeItem | null {
  const employees = getStoredEmployees();
  const index = employees.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const current = employees[index];
  const updatedItem: EmployeeItem = {
    ...current,
    ...updates,
    name:
      updates.firstName || updates.lastName
        ? `${updates.firstName ?? current.firstName} ${updates.lastName ?? current.lastName}`.trim()
        : updates.name ?? current.name,
  };

  employees[index] = updatedItem;
  saveStoredEmployees(employees);
  return updatedItem;
}

export function deleteStoredEmployee(id: string): boolean {
  const employees = getStoredEmployees();
  const filtered = employees.filter((e) => e.id !== id);
  if (filtered.length !== employees.length) {
    saveStoredEmployees(filtered);
    return true;
  }
  return false;
}

// ---------------- DEPARTMENTS CRUD ----------------
export function getStoredDepartments(): DepartmentItem[] {
  if (typeof window === "undefined") return DEFAULT_DEPARTMENTS;
  const raw = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
    return DEFAULT_DEPARTMENTS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEPARTMENTS;
  } catch {
    return DEFAULT_DEPARTMENTS;
  }
}

export function saveStoredDepartments(departments: DepartmentItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));
  dispatchDepartmentsUpdate();
}

export function addStoredDepartment(data: {
  name: string;
  head?: string;
  status?: "Active" | "Inactive";
  employeesCount?: number;
}): DepartmentItem {
  const departments = getStoredDepartments();
  const nextNum = departments.length + 1;
  const code = `#DPT${nextNum < 10 ? "00" + nextNum : nextNum < 100 ? "0" + nextNum : nextNum}`;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const createdOn = `${String(now.getDate()).padStart(2, "0")} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const newDept: DepartmentItem = {
    id: `dept-${Date.now()}`,
    code,
    name: data.name,
    head: data.head || "Unassigned",
    employeesCount: data.employeesCount ?? 0,
    createdOn,
    status: data.status || "Active",
  };

  const updated = [newDept, ...departments];
  saveStoredDepartments(updated);
  return newDept;
}

export function updateStoredDepartment(id: string, updates: Partial<DepartmentItem>): DepartmentItem | null {
  const departments = getStoredDepartments();
  const index = departments.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const current = departments[index];
  const updatedItem: DepartmentItem = {
    ...current,
    ...updates,
  };

  departments[index] = updatedItem;
  saveStoredDepartments(departments);
  return updatedItem;
}

export function deleteStoredDepartment(id: string): boolean {
  const departments = getStoredDepartments();
  const filtered = departments.filter((d) => d.id !== id);
  if (filtered.length !== departments.length) {
    saveStoredDepartments(filtered);
    return true;
  }
  return false;
}

// ============================================================================
// DESIGNATIONS MODULE (Images 1 & 2)
// ============================================================================
const DESIGNATIONS_STORAGE_KEY = "nexora_hrm_designations_v1";

export const DEFAULT_DESIGNATIONS: DesignationItem[] = [
  {
    id: "dsg-1",
    code: "#DSG001",
    name: "Engineering Manager",
    department: "Engineering",
    employeesCount: 8,
    createdOn: "11 Sep 2025",
    status: "Active",
  },
  {
    id: "dsg-2",
    code: "#DSG002",
    name: "Senior Developer",
    department: "Engineering",
    employeesCount: 15,
    createdOn: "05 Sep 2025",
    status: "Active",
  },
  {
    id: "dsg-3",
    code: "#DSG003",
    name: "UX Designer",
    department: "Design",
    employeesCount: 12,
    createdOn: "27 Aug 2025",
    status: "Active",
  },
  {
    id: "dsg-4",
    code: "#DSG004",
    name: "HR Manager",
    department: "HR",
    employeesCount: 3,
    createdOn: "16 Aug 2025",
    status: "Active",
  },
  {
    id: "dsg-5",
    code: "#DSG005",
    name: "Accountant",
    department: "Finance",
    employeesCount: 6,
    createdOn: "25 Jul 2025",
    status: "Active",
  },
  {
    id: "dsg-6",
    code: "#DSG006",
    name: "Sales Executive",
    department: "Sales",
    employeesCount: 20,
    createdOn: "12 Jul 2025",
    status: "Active",
  },
  {
    id: "dsg-7",
    code: "#DSG007",
    name: "Marketing Lead",
    department: "Marketing",
    employeesCount: 5,
    createdOn: "23 Jun 2025",
    status: "Active",
  },
  {
    id: "dsg-8",
    code: "#DSG008",
    name: "Support Specialist",
    department: "Support",
    employeesCount: 10,
    createdOn: "18 May 2025",
    status: "Inactive",
  },
];

const dispatchDesignationsUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nexora_designations_updated"));
  }
};

export function getStoredDesignations(): DesignationItem[] {
  if (typeof window === "undefined") return DEFAULT_DESIGNATIONS;
  const raw = localStorage.getItem(DESIGNATIONS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(DESIGNATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_DESIGNATIONS));
    return DEFAULT_DESIGNATIONS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DESIGNATIONS;
  } catch {
    return DEFAULT_DESIGNATIONS;
  }
}

export function saveStoredDesignations(designations: DesignationItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DESIGNATIONS_STORAGE_KEY, JSON.stringify(designations));
  dispatchDesignationsUpdate();
}

export function addStoredDesignation(data: {
  name: string;
  department: string;
  employeesCount?: number;
  status?: "Active" | "Inactive";
}): DesignationItem {
  const list = getStoredDesignations();
  const nextNum = list.length + 1;
  const code = `#DSG${nextNum < 10 ? "00" + nextNum : nextNum < 100 ? "0" + nextNum : nextNum}`;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const createdOn = `${String(now.getDate()).padStart(2, "0")} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const newItem: DesignationItem = {
    id: `dsg-${Date.now()}`,
    code,
    name: data.name,
    department: data.department || "General",
    employeesCount: data.employeesCount ?? 0,
    createdOn,
    status: data.status || "Active",
  };

  const updated = [newItem, ...list];
  saveStoredDesignations(updated);
  return newItem;
}

export function updateStoredDesignation(id: string, updates: Partial<DesignationItem>): DesignationItem | null {
  const list = getStoredDesignations();
  const index = list.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedItem: DesignationItem = {
    ...current,
    ...updates,
  };

  list[index] = updatedItem;
  saveStoredDesignations(list);
  return updatedItem;
}

export function deleteStoredDesignation(id: string): boolean {
  const list = getStoredDesignations();
  const filtered = list.filter((d) => d.id !== id);
  if (filtered.length !== list.length) {
    saveStoredDesignations(filtered);
    return true;
  }
  return false;
}

// ============================================================================
// LEAVES MODULE (Images 3 & 4)
// ============================================================================
const LEAVES_STORAGE_KEY = "nexora_hrm_leaves_v1";

export const DEFAULT_LEAVES: LeaveItem[] = [
  {
    id: "lv-1",
    code: "#LV0020",
    employeeName: "Ethan Walker",
    employeePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    leaveType: "Annual",
    from: "10 Sep 2025",
    to: "15 Sep 2025",
    days: 5,
    status: "Approved",
    description: "Annual vacation trip.",
  },
  {
    id: "lv-2",
    code: "#LV0019",
    employeeName: "Madison Clark",
    employeePhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    leaveType: "Sick",
    from: "05 Sep 2025",
    to: "07 Sep 2025",
    days: 2,
    status: "Pending",
    description: "Medical recovery.",
  },
  {
    id: "lv-3",
    code: "#LV0018",
    employeeName: "James Harris",
    employeePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    leaveType: "Casual",
    from: "27 Aug 2025",
    to: "28 Aug 2025",
    days: 1,
    status: "Approved",
    description: "Personal errands.",
  },
  {
    id: "lv-4",
    code: "#LV0017",
    employeeName: "Avery Thompson",
    employeePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    leaveType: "Maternity",
    from: "16 Aug 2025",
    to: "16 Feb 2026",
    days: 180,
    status: "Approved",
    description: "Maternity leave leave plan.",
  },
  {
    id: "lv-5",
    code: "#LV0016",
    employeeName: "Benjamin Wright",
    employeePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    leaveType: "Annual",
    from: "25 Jul 2025",
    to: "28 Jul 2025",
    days: 3,
    status: "Rejected",
    description: "Denied due to quarter closing audit.",
  },
  {
    id: "lv-6",
    code: "#LV0015",
    employeeName: "Chloe Mitchell",
    employeePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    leaveType: "Sick",
    from: "12 Jul 2025",
    to: "13 Jul 2025",
    days: 1,
    status: "Approved",
    description: "Dental appointment.",
  },
  {
    id: "lv-7",
    code: "#LV0014",
    employeeName: "Daniel Roberts",
    employeePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    leaveType: "Casual",
    from: "23 Jun 2025",
    to: "24 Jun 2025",
    days: 1,
    status: "Pending",
    description: "Family emergency.",
  },
  {
    id: "lv-8",
    code: "#LV0013",
    employeeName: "Grace Adams",
    employeePhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    leaveType: "Annual",
    from: "07 Jun 2025",
    to: "12 Jun 2025",
    days: 5,
    status: "Approved",
    description: "Summer vacation.",
  },
];

const dispatchLeavesUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nexora_leaves_updated"));
  }
};

export function getStoredLeaves(): LeaveItem[] {
  if (typeof window === "undefined") return DEFAULT_LEAVES;
  const raw = localStorage.getItem(LEAVES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(DEFAULT_LEAVES));
    return DEFAULT_LEAVES;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LEAVES;
  } catch {
    return DEFAULT_LEAVES;
  }
}

export function saveStoredLeaves(leaves: LeaveItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(leaves));
  dispatchLeavesUpdate();
}

export function addStoredLeave(data: {
  employeeName: string;
  employeePhoto?: string;
  leaveType: string;
  from: string;
  to: string;
  days?: number;
  status?: "Approved" | "Pending" | "Rejected";
  description?: string;
}): LeaveItem {
  const list = getStoredLeaves();
  const nextNum = list.length + 20;
  const code = `#LV${nextNum < 1000 ? String(nextNum).padStart(4, "0") : nextNum}`;

  // Calculate days if not provided
  let calculatedDays = data.days ?? 1;
  if (!data.days && data.from && data.to) {
    try {
      const d1 = new Date(data.from);
      const d2 = new Date(data.to);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      calculatedDays = 1;
    }
  }

  const newItem: LeaveItem = {
    id: `lv-${Date.now()}`,
    code,
    employeeName: data.employeeName,
    employeePhoto:
      data.employeePhoto ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    leaveType: data.leaveType,
    from: data.from,
    to: data.to,
    days: calculatedDays,
    status: data.status || "Pending",
    description: data.description || "",
  };

  const updated = [newItem, ...list];
  saveStoredLeaves(updated);
  return newItem;
}

export function updateStoredLeave(id: string, updates: Partial<LeaveItem>): LeaveItem | null {
  const list = getStoredLeaves();
  const index = list.findIndex((l) => l.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedItem: LeaveItem = {
    ...current,
    ...updates,
  };

  list[index] = updatedItem;
  saveStoredLeaves(list);
  return updatedItem;
}

export function deleteStoredLeave(id: string): boolean {
  const list = getStoredLeaves();
  const filtered = list.filter((l) => l.id !== id);
  if (filtered.length !== list.length) {
    saveStoredLeaves(filtered);
    return true;
  }
  return false;
}

// ============================================================================
// LEAVE TYPES MODULE (Image 5 & add_leave_type.png)
// ============================================================================
const LEAVE_TYPES_STORAGE_KEY = "nexora_hrm_leave_types_v1";

export const DEFAULT_LEAVE_TYPES: LeaveTypeItem[] = [
  {
    id: "lt-1",
    code: "#LT001",
    name: "Annual Leave",
    daysPerYear: 21,
    carryForward: "Yes",
    status: "Active",
  },
  {
    id: "lt-2",
    code: "#LT002",
    name: "Sick Leave",
    daysPerYear: 12,
    carryForward: "No",
    status: "Active",
  },
  {
    id: "lt-3",
    code: "#LT003",
    name: "Casual Leave",
    daysPerYear: 7,
    carryForward: "No",
    status: "Active",
  },
  {
    id: "lt-4",
    code: "#LT004",
    name: "Maternity Leave",
    daysPerYear: 180,
    carryForward: "No",
    status: "Active",
  },
  {
    id: "lt-5",
    code: "#LT005",
    name: "Paternity Leave",
    daysPerYear: 15,
    carryForward: "No",
    status: "Active",
  },
  {
    id: "lt-6",
    code: "#LT006",
    name: "Bereavement",
    daysPerYear: 5,
    carryForward: "No",
    status: "Active",
  },
  {
    id: "lt-7",
    code: "#LT007",
    name: "Unpaid Leave",
    daysPerYear: "Unlimited",
    carryForward: "N/A",
    status: "Active",
  },
];

const dispatchLeaveTypesUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nexora_leave_types_updated"));
  }
};

export function getStoredLeaveTypes(): LeaveTypeItem[] {
  if (typeof window === "undefined") return DEFAULT_LEAVE_TYPES;
  const raw = localStorage.getItem(LEAVE_TYPES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LEAVE_TYPES_STORAGE_KEY, JSON.stringify(DEFAULT_LEAVE_TYPES));
    return DEFAULT_LEAVE_TYPES;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LEAVE_TYPES;
  } catch {
    return DEFAULT_LEAVE_TYPES;
  }
}

export function saveStoredLeaveTypes(types: LeaveTypeItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEAVE_TYPES_STORAGE_KEY, JSON.stringify(types));
  dispatchLeaveTypesUpdate();
}

export function addStoredLeaveType(data: {
  name: string;
  daysPerYear: string | number;
  carryForward?: "Yes" | "No" | "N/A";
  status?: "Active" | "Inactive";
}): LeaveTypeItem {
  const list = getStoredLeaveTypes();
  const nextNum = list.length + 1;
  const code = `#LT${nextNum < 10 ? "00" + nextNum : nextNum < 100 ? "0" + nextNum : nextNum}`;

  const newItem: LeaveTypeItem = {
    id: `lt-${Date.now()}`,
    code,
    name: data.name,
    daysPerYear: data.daysPerYear,
    carryForward: data.carryForward || "No",
    status: data.status || "Active",
  };

  const updated = [newItem, ...list];
  saveStoredLeaveTypes(updated);
  return newItem;
}

export function updateStoredLeaveType(id: string, updates: Partial<LeaveTypeItem>): LeaveTypeItem | null {
  const list = getStoredLeaveTypes();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedItem: LeaveTypeItem = {
    ...current,
    ...updates,
  };

  list[index] = updatedItem;
  saveStoredLeaveTypes(list);
  return updatedItem;
}

export function deleteStoredLeaveType(id: string): boolean {
  const list = getStoredLeaveTypes();
  const filtered = list.filter((t) => t.id !== id);
  if (filtered.length !== list.length) {
    saveStoredLeaveTypes(filtered);
    return true;
  }
  return false;
}

// ============================================================================
// HOLIDAYS MODULE (Images 1 & 2)
// ============================================================================
const HOLIDAYS_STORAGE_KEY = "nexora_hrm_holidays_v1";

export const DEFAULT_HOLIDAYS: HolidayItem[] = [
  {
    id: "hol-1",
    title: "New Year's Day",
    date: "01 Jan 2026",
    day: "Thursday",
    type: "Public",
    status: "Upcoming",
    description: "Celebration of the first day of the year in the Gregorian calendar.",
  },
  {
    id: "hol-2",
    title: "Independence Day",
    date: "04 Jul 2026",
    day: "Saturday",
    type: "Public",
    status: "Upcoming",
    description: "Commemoration of the Declaration of Independence.",
  },
  {
    id: "hol-3",
    title: "Labor Day",
    date: "07 Sep 2026",
    day: "Monday",
    type: "Public",
    status: "Upcoming",
    description: "Honoring the American labor movement and contributions of workers.",
  },
  {
    id: "hol-4",
    title: "Thanksgiving Day",
    date: "26 Nov 2026",
    day: "Thursday",
    type: "Public",
    status: "Upcoming",
    description: "Annual national holiday giving thanks and blessing of harvest.",
  },
  {
    id: "hol-5",
    title: "Christmas Day",
    date: "25 Dec 2026",
    day: "Friday",
    type: "Public",
    status: "Upcoming",
    description: "Celebration of Christmas holiday.",
  },
  {
    id: "hol-6",
    title: "Memorial Day",
    date: "25 May 2026",
    day: "Monday",
    type: "Public",
    status: "This Week",
    description: "Honoring and mourning U.S. military personnel.",
  },
  {
    id: "hol-7",
    title: "Veterans Day",
    date: "11 Nov 2026",
    day: "Wednesday",
    type: "Public",
    status: "Upcoming",
    description: "Honoring military veterans of the United States Armed Forces.",
  },
];

const dispatchHolidaysUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nexora_holidays_updated"));
  }
};

export function getStoredHolidays(): HolidayItem[] {
  if (typeof window === "undefined") return DEFAULT_HOLIDAYS;
  const raw = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(DEFAULT_HOLIDAYS));
    return DEFAULT_HOLIDAYS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HOLIDAYS;
  } catch {
    return DEFAULT_HOLIDAYS;
  }
}

export function saveStoredHolidays(holidays: HolidayItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays));
  dispatchHolidaysUpdate();
}

export function addStoredHoliday(data: {
  title: string;
  date: string;
  type?: string;
  status?: "Upcoming" | "This Week" | "Past";
  description?: string;
}): HolidayItem {
  const list = getStoredHolidays();

  // Infer weekday from date if possible
  let dayName = "Monday";
  let formattedDate = data.date;

  try {
    const d = new Date(data.date);
    if (!isNaN(d.getTime())) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      dayName = dayNames[d.getDay()];

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      formattedDate = `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {
    // Keep original
  }

  const newItem: HolidayItem = {
    id: `hol-${Date.now()}`,
    title: data.title,
    date: formattedDate,
    day: dayName,
    type: data.type || "Public",
    status: data.status || "Upcoming",
    description: data.description || "",
  };

  const updated = [newItem, ...list];
  saveStoredHolidays(updated);
  return newItem;
}

export function updateStoredHoliday(id: string, updates: Partial<HolidayItem>): HolidayItem | null {
  const list = getStoredHolidays();
  const index = list.findIndex((h) => h.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedItem: HolidayItem = {
    ...current,
    ...updates,
  };

  list[index] = updatedItem;
  saveStoredHolidays(list);
  return updatedItem;
}

export function deleteStoredHoliday(id: string): boolean {
  const list = getStoredHolidays();
  const filtered = list.filter((h) => h.id !== id);
  if (filtered.length !== list.length) {
    saveStoredHolidays(filtered);
    return true;
  }
  return false;
}

// ============================================================================
// PAYROLL MODULE (Images 3 & 4)
// ============================================================================
const PAYROLL_STORAGE_KEY = "nexora_hrm_payrolls_v1";

export const DEFAULT_PAYROLLS: PayrollItem[] = [
  {
    id: "pr-1",
    payrollId: "#PR0020",
    employeeName: "Ethan Walker",
    employeePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    designation: "Manager",
    department: "Engineering",
    basic: 6500,
    hra: 500,
    conveyance: 200,
    bonus: 500,
    otherAllowances: 100,
    totalEarnings: 7800,
    pf: 400,
    profTax: 200,
    tds: 300,
    otherDeductions: 100,
    totalDeductions: 1000,
    netPay: 6800,
    status: "Paid",
    payrollMonth: "2026-01",
    paymentDate: "2026-01-20",
  },
  {
    id: "pr-2",
    payrollId: "#PR0019",
    employeeName: "Madison Clark",
    employeePhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    designation: "Designer",
    department: "Design",
    basic: 4800,
    hra: 400,
    conveyance: 150,
    bonus: 300,
    otherAllowances: 100,
    totalEarnings: 5750,
    pf: 350,
    profTax: 150,
    tds: 200,
    otherDeductions: 100,
    totalDeductions: 800,
    netPay: 4950,
    status: "Paid",
    payrollMonth: "2026-01",
    paymentDate: "2026-01-20",
  },
  {
    id: "pr-3",
    payrollId: "#PR0018",
    employeeName: "James Harris",
    employeePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    designation: "Developer",
    department: "Engineering",
    basic: 5500,
    hra: 450,
    conveyance: 200,
    bonus: 400,
    otherAllowances: 50,
    totalEarnings: 6600,
    pf: 400,
    profTax: 150,
    tds: 250,
    otherDeductions: 100,
    totalDeductions: 900,
    netPay: 5700,
    status: "Pending",
    payrollMonth: "2026-01",
    paymentDate: "2026-01-20",
  },
  {
    id: "pr-4",
    payrollId: "#PR0017",
    employeeName: "Avery Thompson",
    employeePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    designation: "HR Manager",
    department: "HR",
    basic: 5000,
    hra: 400,
    conveyance: 150,
    bonus: 250,
    otherAllowances: 100,
    totalEarnings: 5900,
    pf: 350,
    profTax: 150,
    tds: 200,
    otherDeductions: 100,
    totalDeductions: 800,
    netPay: 5100,
    status: "Paid",
    payrollMonth: "2026-01",
    paymentDate: "2026-01-20",
  },
  {
    id: "pr-5",
    payrollId: "#PR0016",
    employeeName: "Benjamin Wright",
    employeePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    designation: "Accountant",
    department: "Finance",
    basic: 4500,
    hra: 350,
    conveyance: 150,
    bonus: 200,
    otherAllowances: 100,
    totalEarnings: 5300,
    pf: 300,
    profTax: 150,
    tds: 150,
    otherDeductions: 100,
    totalDeductions: 700,
    netPay: 4600,
    status: "Paid",
    payrollMonth: "2026-01",
    paymentDate: "2026-01-20",
  },
  {
    id: "pr-6",
    payrollId: "#PR0015",
    employeeName: "Chloe Mitchell",
    employeePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    designation: "Sales Rep",
    department: "Sales",
    basic: 3800,
    hra: 300,
    conveyance: 150,
    bonus: 600,
    otherAllowances: 100,
    totalEarnings: 4950,
    pf: 250,
    profTax: 150,
    tds: 200,
    otherDeductions: 100,
    totalDeductions: 700,
    netPay: 4250,
    status: "Paid",
    payrollMonth: "2026-01",
    paymentDate: "2026-01-20",
  },
  {
    id: "pr-7",
    payrollId: "#PR0014",
    employeeName: "Daniel Roberts",
    employeePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    designation: "DevOps",
    department: "Engineering",
    basic: 5800,
    hra: 500,
    conveyance: 200,
    bonus: 450,
    otherAllowances: 100,
    totalEarnings: 7050,
    pf: 450,
    profTax: 150,
    tds: 300,
    otherDeductions: 100,
    totalDeductions: 1000,
    netPay: 6050,
    status: "Pending",
    payrollMonth: "2026-01",
    paymentDate: "2026-01-20",
  },
  {
    id: "pr-8",
    payrollId: "#PR0013",
    employeeName: "Grace Adams",
    employeePhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    designation: "Marketing",
    department: "Marketing",
    basic: 4200,
    hra: 350,
    conveyance: 150,
    bonus: 350,
    otherAllowances: 50,
    totalEarnings: 5100,
    pf: 300,
    profTax: 150,
    tds: 150,
    otherDeductions: 100,
    totalDeductions: 700,
    netPay: 4400,
    status: "Paid",
    payrollMonth: "2026-01",
    paymentDate: "2026-01-20",
  },
];

const dispatchPayrollsUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nexora_payrolls_updated"));
  }
};

export function getStoredPayrolls(): PayrollItem[] {
  if (typeof window === "undefined") return DEFAULT_PAYROLLS;
  const raw = localStorage.getItem(PAYROLL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(DEFAULT_PAYROLLS));
    return DEFAULT_PAYROLLS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PAYROLLS;
  } catch {
    return DEFAULT_PAYROLLS;
  }
}

export function saveStoredPayrolls(payrolls: PayrollItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(payrolls));
  dispatchPayrollsUpdate();
}

export function addStoredPayroll(data: Partial<PayrollItem> & { employeeName: string; basic: number }): PayrollItem {
  const list = getStoredPayrolls();
  const nextNum = list.length + 20;
  const payrollId = data.payrollId || `#PR${nextNum < 1000 ? String(nextNum).padStart(4, "0") : nextNum}`;

  const basic = Number(data.basic) || 0;
  const hra = Number(data.hra) || 0;
  const conveyance = Number(data.conveyance) || 0;
  const bonus = Number(data.bonus) || 0;
  const otherAllowances = Number(data.otherAllowances) || 0;
  const totalEarnings = data.totalEarnings ?? basic + hra + conveyance + bonus + otherAllowances;

  const pf = Number(data.pf) || 0;
  const profTax = Number(data.profTax) || 0;
  const tds = Number(data.tds) || 0;
  const otherDeductions = Number(data.otherDeductions) || 0;
  const totalDeductions = data.totalDeductions ?? pf + profTax + tds + otherDeductions;

  const netPay = data.netPay ?? totalEarnings - totalDeductions;

  const newItem: PayrollItem = {
    id: `pr-${Date.now()}`,
    payrollId,
    employeeName: data.employeeName,
    employeePhoto:
      data.employeePhoto ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    designation: data.designation || "Staff",
    department: data.department || "General",
    payrollMonth: data.payrollMonth || new Date().toISOString().slice(0, 7),
    paymentDate: data.paymentDate || new Date().toISOString().split("T")[0],
    basic,
    hra,
    conveyance,
    bonus,
    otherAllowances,
    totalEarnings,
    pf,
    profTax,
    tds,
    otherDeductions,
    totalDeductions,
    netPay,
    status: data.status || "Paid",
  };

  const updated = [newItem, ...list];
  saveStoredPayrolls(updated);
  return newItem;
}

export function updateStoredPayroll(id: string, updates: Partial<PayrollItem>): PayrollItem | null {
  const list = getStoredPayrolls();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedItem: PayrollItem = {
    ...current,
    ...updates,
  };

  list[index] = updatedItem;
  saveStoredPayrolls(list);
  return updatedItem;
}

export function deleteStoredPayroll(id: string): boolean {
  const list = getStoredPayrolls();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length !== list.length) {
    saveStoredPayrolls(filtered);
    return true;
  }
  return false;
}

// ==========================================
// RECRUITMENT / JOB REQUISITIONS
// ==========================================

export interface JobRequisitionItem {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  hiringManager: string;
  employmentType: string;
  openings: number | string;
  experienceLevel: string;
  location: string;
  salaryMin?: string | number;
  salaryMax?: string | number;
  targetHireDate?: string;
  description?: string;
  skills?: string;
  priority?: "High" | "Medium" | "Low" | "Urgent";
  applicants: number;
  posted: string;
  status: "Open" | "On Hold" | "Closed" | "Draft" | "Pending Approval" | "Approved";
}

export const JOBS_STORAGE_KEY = "nexora_hrm_jobs";

export const DEFAULT_JOBS: JobRequisitionItem[] = [
  {
    id: "job-1",
    jobId: "#JOB0020",
    jobTitle: "Senior React Developer",
    department: "Engineering",
    hiringManager: "Ethan Walker",
    employmentType: "Full-time",
    openings: 3,
    experienceLevel: "Senior",
    location: "Remote",
    salaryMin: "90000",
    salaryMax: "130000",
    targetHireDate: "2025-10-15",
    description: "Lead frontend engineering efforts on core ERP web application.",
    skills: "React, TypeScript, TailwindCSS, State Management",
    priority: "High",
    applicants: 42,
    posted: "11 Sep 2025",
    status: "Open",
  },
  {
    id: "job-2",
    jobId: "#JOB0019",
    jobTitle: "UX Designer",
    department: "Design",
    hiringManager: "Madison Clark",
    employmentType: "Full-time",
    openings: 2,
    experienceLevel: "Mid Level",
    location: "New York, USA",
    salaryMin: "75000",
    salaryMax: "105000",
    targetHireDate: "2025-10-01",
    description: "Design intuitive interfaces, design systems, and user flows.",
    skills: "Figma, User Research, Prototyping, Design Systems",
    priority: "Medium",
    applicants: 28,
    posted: "05 Sep 2025",
    status: "Open",
  },
  {
    id: "job-3",
    jobId: "#JOB0018",
    jobTitle: "HR Specialist",
    department: "HR",
    hiringManager: "Avery Thompson",
    employmentType: "Full-time",
    openings: 1,
    experienceLevel: "Mid Level",
    location: "London, UK",
    salaryMin: "55000",
    salaryMax: "70000",
    targetHireDate: "2025-09-30",
    description: "Manage recruitment, onboarding, employee relations, and compliance.",
    skills: "Talent Acquisition, HR Policies, Payroll Coordination",
    priority: "Low",
    applicants: 35,
    posted: "27 Aug 2025",
    status: "On Hold",
  },
  {
    id: "job-4",
    jobId: "#JOB0017",
    jobTitle: "Sales Executive",
    department: "Sales",
    hiringManager: "Chloe Mitchell",
    employmentType: "Full-time",
    openings: 4,
    experienceLevel: "Entry Level",
    location: "Hybrid",
    salaryMin: "60000",
    salaryMax: "95000",
    targetHireDate: "2025-09-20",
    description: "Drive enterprise B2B sales cycles, presentations, and product demos.",
    skills: "B2B Sales, CRM, Client Relations, Negotiations",
    priority: "High",
    applicants: 56,
    posted: "16 Aug 2025",
    status: "Open",
  },
  {
    id: "job-5",
    jobId: "#JOB0016",
    jobTitle: "DevOps Engineer",
    department: "Engineering",
    hiringManager: "Daniel Roberts",
    employmentType: "Full-time",
    openings: 1,
    experienceLevel: "Senior",
    location: "Remote",
    salaryMin: "100000",
    salaryMax: "140000",
    targetHireDate: "2025-08-15",
    description: "Maintain CI/CD infrastructure, cloud orchestration, and containerization.",
    skills: "Docker, Kubernetes, AWS, Terraform, Monitoring",
    priority: "Urgent",
    applicants: 18,
    posted: "25 Jul 2025",
    status: "Closed",
  },
  {
    id: "job-6",
    jobId: "#JOB0015",
    jobTitle: "Marketing Lead",
    department: "Marketing",
    hiringManager: "Grace Adams",
    employmentType: "Full-time",
    openings: 1,
    experienceLevel: "Senior",
    location: "San Francisco, USA",
    salaryMin: "85000",
    salaryMax: "120000",
    targetHireDate: "2025-08-10",
    description: "Lead growth campaigns, social branding, content marketing, and SEO.",
    skills: "Growth Marketing, Paid Media, Brand Strategy, Analytics",
    priority: "Medium",
    applicants: 22,
    posted: "12 Jul 2025",
    status: "Open",
  },
  {
    id: "job-7",
    jobId: "#JOB0014",
    jobTitle: "Financial Analyst",
    department: "Finance",
    hiringManager: "Benjamin Wright",
    employmentType: "Full-time",
    openings: 2,
    experienceLevel: "Entry Level",
    location: "Chicago, USA",
    salaryMin: "65000",
    salaryMax: "85000",
    targetHireDate: "2025-07-25",
    description: "Analyze financial data, prepare forecasts, budgets, and executive reports.",
    skills: "Financial Modeling, Excel, ERP, Auditing",
    priority: "Low",
    applicants: 31,
    posted: "23 Jun 2025",
    status: "Open",
  },
];

export function getStoredJobs(): JobRequisitionItem[] {
  if (typeof window === "undefined") return DEFAULT_JOBS;
  const raw = localStorage.getItem(JOBS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(DEFAULT_JOBS));
    return DEFAULT_JOBS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_JOBS;
  } catch {
    return DEFAULT_JOBS;
  }
}

export function saveStoredJobs(jobs: JobRequisitionItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event("nexora_jobs_updated"));
}

export function addStoredJob(data: Partial<JobRequisitionItem>): JobRequisitionItem {
  const list = getStoredJobs();
  const nextNum = list.length + 21;
  const jobId = data.jobId || `#JOB00${nextNum}`;

  const newItem: JobRequisitionItem = {
    id: `job-${Date.now()}`,
    jobId,
    jobTitle: data.jobTitle || "New Position",
    department: data.department || "Engineering",
    hiringManager: data.hiringManager || "Ethan Walker",
    employmentType: data.employmentType || "Full-time",
    openings: data.openings || 1,
    experienceLevel: data.experienceLevel || "Mid Level",
    location: data.location || "Remote",
    salaryMin: data.salaryMin || "",
    salaryMax: data.salaryMax || "",
    targetHireDate: data.targetHireDate || "",
    description: data.description || "",
    skills: data.skills || "",
    priority: data.priority || "High",
    applicants: data.applicants || 0,
    posted: data.posted || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status: data.status || "Open",
  };

  const updated = [newItem, ...list];
  saveStoredJobs(updated);
  return newItem;
}

export function updateStoredJob(id: string, updates: Partial<JobRequisitionItem>): JobRequisitionItem | null {
  const list = getStoredJobs();
  const index = list.findIndex((j) => j.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedItem: JobRequisitionItem = {
    ...current,
    ...updates,
  };

  list[index] = updatedItem;
  saveStoredJobs(list);
  return updatedItem;
}

export function deleteStoredJob(id: string): boolean {
  const list = getStoredJobs();
  const filtered = list.filter((j) => j.id !== id);
  if (filtered.length !== list.length) {
    saveStoredJobs(filtered);
    return true;
  }
  return false;
}

// ==========================================
// PERFORMANCE APPRAISALS
// ==========================================

export interface AppraisalItem {
  id: string;
  appraisalId: string;
  employeeName: string;
  employeePhoto: string;
  designation: string;
  department: string;
  appraisalDate?: string;
  reviewPeriod: string;
  technicalSkills?: string | number;
  communication?: string | number;
  problemSolving?: string | number;
  teamwork?: string | number;
  score: string;
  status: "Excellent" | "Good" | "Average" | "Needs Improvement";
  remarks?: string;
}

export const APPRAISAL_STORAGE_KEY = "nexora_hrm_appraisals";

export const DEFAULT_APPRAISALS: AppraisalItem[] = [
  {
    id: "pa-1",
    appraisalId: "#PA0020",
    employeeName: "Ethan Walker",
    employeePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    designation: "Manager",
    department: "Engineering",
    appraisalDate: "2026-06-25",
    reviewPeriod: "Q2 2026",
    technicalSkills: "5",
    communication: "5",
    problemSolving: "5",
    teamwork: "4",
    score: "4.8/5",
    status: "Excellent",
    remarks: "Exceptional leadership in team delivery and architecture.",
  },
  {
    id: "pa-2",
    appraisalId: "#PA0019",
    employeeName: "Madison Clark",
    employeePhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    designation: "Designer",
    department: "Design",
    appraisalDate: "2026-06-24",
    reviewPeriod: "Q2 2026",
    technicalSkills: "4",
    communication: "4",
    problemSolving: "4",
    teamwork: "5",
    score: "4.2/5",
    status: "Good",
    remarks: "Delivered stunning UI prototypes and expanded design system.",
  },
  {
    id: "pa-3",
    appraisalId: "#PA0018",
    employeeName: "James Harris",
    employeePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    designation: "Developer",
    department: "Engineering",
    appraisalDate: "2026-06-23",
    reviewPeriod: "Q2 2026",
    technicalSkills: "5",
    communication: "4",
    problemSolving: "5",
    teamwork: "4",
    score: "4.5/5",
    status: "Excellent",
    remarks: "Great problem solving and fast feature development.",
  },
  {
    id: "pa-4",
    appraisalId: "#PA0017",
    employeeName: "Avery Thompson",
    employeePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    designation: "HR Manager",
    department: "HR",
    appraisalDate: "2026-06-22",
    reviewPeriod: "Q2 2026",
    technicalSkills: "3",
    communication: "4",
    problemSolving: "3",
    teamwork: "4",
    score: "3.5/5",
    status: "Average",
    remarks: "Solid overall HR coordination, needs to improve hiring turnaround time.",
  },
  {
    id: "pa-5",
    appraisalId: "#PA0016",
    employeeName: "Benjamin Wright",
    employeePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    designation: "Accountant",
    department: "Finance",
    appraisalDate: "2026-06-21",
    reviewPeriod: "Q2 2026",
    technicalSkills: "4",
    communication: "4",
    problemSolving: "4",
    teamwork: "4",
    score: "4.0/5",
    status: "Good",
    remarks: "Accurate monthly closes and audit preparation.",
  },
  {
    id: "pa-6",
    appraisalId: "#PA0015",
    employeeName: "Chloe Mitchell",
    employeePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    designation: "Sales Rep",
    department: "Sales",
    appraisalDate: "2026-06-20",
    reviewPeriod: "Q2 2026",
    technicalSkills: "5",
    communication: "5",
    problemSolving: "4",
    teamwork: "5",
    score: "4.7/5",
    status: "Excellent",
    remarks: "Exceeded Q2 sales quota by 130%.",
  },
  {
    id: "pa-7",
    appraisalId: "#PA0014",
    employeeName: "Daniel Roberts",
    employeePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    designation: "DevOps",
    department: "Engineering",
    appraisalDate: "2026-06-19",
    reviewPeriod: "Q2 2026",
    technicalSkills: "3",
    communication: "3",
    problemSolving: "3",
    teamwork: "2",
    score: "2.8/5",
    status: "Needs Improvement",
    remarks: "Need more proactive communication during infrastructure outages.",
  },
  {
    id: "pa-8",
    appraisalId: "#PA0013",
    employeeName: "Grace Adams",
    employeePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    designation: "Marketing",
    department: "Marketing",
    appraisalDate: "2026-06-18",
    reviewPeriod: "Q2 2026",
    technicalSkills: "4",
    communication: "5",
    problemSolving: "4",
    teamwork: "4",
    score: "4.3/5",
    status: "Good",
    remarks: "Strong brand campaigns and social engagement increase.",
  },
];

export function getStoredAppraisals(): AppraisalItem[] {
  if (typeof window === "undefined") return DEFAULT_APPRAISALS;
  const raw = localStorage.getItem(APPRAISAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(APPRAISAL_STORAGE_KEY, JSON.stringify(DEFAULT_APPRAISALS));
    return DEFAULT_APPRAISALS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_APPRAISALS;
  } catch {
    return DEFAULT_APPRAISALS;
  }
}

export function saveStoredAppraisals(appraisals: AppraisalItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(APPRAISAL_STORAGE_KEY, JSON.stringify(appraisals));
  window.dispatchEvent(new Event("nexora_appraisals_updated"));
}

export function addStoredAppraisal(data: Partial<AppraisalItem>): AppraisalItem {
  const list = getStoredAppraisals();
  const nextNum = list.length + 21;
  const appraisalId = data.appraisalId || `#PA00${nextNum}`;

  const newItem: AppraisalItem = {
    id: `pa-${Date.now()}`,
    appraisalId,
    employeeName: data.employeeName || "Employee",
    employeePhoto:
      data.employeePhoto ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    designation: data.designation || "Staff",
    department: data.department || "General",
    appraisalDate: data.appraisalDate || new Date().toISOString().split("T")[0],
    reviewPeriod: data.reviewPeriod || "Q2 2026",
    technicalSkills: data.technicalSkills || "4",
    communication: data.communication || "4",
    problemSolving: data.problemSolving || "4",
    teamwork: data.teamwork || "4",
    score: data.score || "4.0/5",
    status: data.status || "Good",
    remarks: data.remarks || "",
  };

  const updated = [newItem, ...list];
  saveStoredAppraisals(updated);
  return newItem;
}

export function updateStoredAppraisal(id: string, updates: Partial<AppraisalItem>): AppraisalItem | null {
  const list = getStoredAppraisals();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedItem: AppraisalItem = {
    ...current,
    ...updates,
  };

  list[index] = updatedItem;
  saveStoredAppraisals(list);
  return updatedItem;
}

export function deleteStoredAppraisal(id: string): boolean {
  const list = getStoredAppraisals();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length !== list.length) {
    saveStoredAppraisals(filtered);
    return true;
  }
  return false;
}

// ==========================================
// TRAINING & DEVELOPMENT
// ==========================================

export interface TrainingItem {
  id: string;
  trainingId: string;
  program: string;
  trainer: string;
  startDate: string;
  endDate: string;
  participants: number;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  description?: string;
}

export const TRAINING_STORAGE_KEY = "nexora_hrm_trainings";

export const DEFAULT_TRAININGS: TrainingItem[] = [
  {
    id: "tr-1",
    trainingId: "#TR0020",
    program: "React Development",
    trainer: "Ethan Walker",
    startDate: "10 Jun 2026",
    endDate: "15 Jun 2026",
    participants: 12,
    status: "Scheduled",
    description: "Deep dive into React 19, Server Components, advanced hooks, and modern frontend architecture.",
  },
  {
    id: "tr-2",
    trainingId: "#TR0019",
    program: "UX Design Fundamentals",
    trainer: "Madison Clark",
    startDate: "05 Jun 2026",
    endDate: "08 Jun 2026",
    participants: 8,
    status: "In Progress",
    description: "Design thinking, user journey mapping, design systems, and Figma component libraries.",
  },
  {
    id: "tr-3",
    trainingId: "#TR0018",
    program: "DevOps & Cloud",
    trainer: "Daniel Roberts",
    startDate: "27 May 2026",
    endDate: "02 Jun 2026",
    participants: 10,
    status: "Completed",
    description: "Containerization with Docker, Kubernetes orchestration, and automated CI/CD deployment pipelines.",
  },
  {
    id: "tr-4",
    trainingId: "#TR0017",
    program: "Leadership Skills",
    trainer: "Avery Thompson",
    startDate: "16 May 2026",
    endDate: "20 May 2026",
    participants: 15,
    status: "Completed",
    description: "Executive leadership, strategic delegation, 1-on-1 team development, and conflict management.",
  },
  {
    id: "tr-5",
    trainingId: "#TR0016",
    program: "Sales Techniques",
    trainer: "Chloe Mitchell",
    startDate: "25 Apr 2026",
    endDate: "28 Apr 2026",
    participants: 20,
    status: "Completed",
    description: "Enterprise sales pipeline development, consultative pitching, and closing masterclasses.",
  },
  {
    id: "tr-6",
    trainingId: "#TR0015",
    program: "Financial Reporting",
    trainer: "Benjamin Wright",
    startDate: "12 Apr 2026",
    endDate: "14 Apr 2026",
    participants: 6,
    status: "Cancelled",
    description: "P&L balance sheet analysis, statutory compliance, tax reporting, and quarterly financial audits.",
  },
  {
    id: "tr-7",
    trainingId: "#TR0014",
    program: "Digital Marketing",
    trainer: "Grace Adams",
    startDate: "07 Apr 2026",
    endDate: "10 Apr 2026",
    participants: 14,
    status: "Completed",
    description: "Performance campaigns, content marketing strategies, SEO optimization, and social media branding.",
  },
];

export function getStoredTrainings(): TrainingItem[] {
  if (typeof window === "undefined") return DEFAULT_TRAININGS;
  const raw = localStorage.getItem(TRAINING_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(DEFAULT_TRAININGS));
    return DEFAULT_TRAININGS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TRAININGS;
  } catch {
    return DEFAULT_TRAININGS;
  }
}

export function saveStoredTrainings(trainings: TrainingItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(trainings));
  window.dispatchEvent(new Event("nexora_trainings_updated"));
}

export function addStoredTraining(data: Partial<TrainingItem>): TrainingItem {
  const list = getStoredTrainings();
  const nextNum = list.length + 21;
  const trainingId = data.trainingId || `#TR00${nextNum}`;

  const newItem: TrainingItem = {
    id: `tr-${Date.now()}`,
    trainingId,
    program: data.program || "New Training Program",
    trainer: data.trainer || "Ethan Walker",
    startDate: data.startDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    endDate: data.endDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    participants: data.participants || 1,
    status: data.status || "Scheduled",
    description: data.description || "",
  };

  const updated = [newItem, ...list];
  saveStoredTrainings(updated);
  return newItem;
}

export function updateStoredTraining(id: string, updates: Partial<TrainingItem>): TrainingItem | null {
  const list = getStoredTrainings();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedItem: TrainingItem = {
    ...current,
    ...updates,
  };

  list[index] = updatedItem;
  saveStoredTrainings(list);
  return updatedItem;
}

export function deleteStoredTraining(id: string): boolean {
  const list = getStoredTrainings();
  const filtered = list.filter((t) => t.id !== id);
  if (filtered.length !== list.length) {
    saveStoredTrainings(filtered);
    return true;
  }
  return false;
}

// ==========================================
// HR ANALYTICS
// ==========================================

export interface DepartmentAnalyticsItem {
  department: string;
  employees: number;
  avgSalary: string;
  turnover: string;
  satisfaction: string;
  status: "Healthy" | "Watch" | "At Risk";
}

export const DEFAULT_DEPARTMENT_ANALYTICS: DepartmentAnalyticsItem[] = [
  {
    department: "Engineering",
    employees: 45,
    avgSalary: "$72,000",
    turnover: "2.5%",
    satisfaction: "4.5/5",
    status: "Healthy",
  },
  {
    department: "Sales",
    employees: 25,
    avgSalary: "$58,000",
    turnover: "5.2%",
    satisfaction: "4.1/5",
    status: "Watch",
  },
  {
    department: "Operations",
    employees: 20,
    avgSalary: "$52,000",
    turnover: "3.0%",
    satisfaction: "4.3/5",
    status: "Healthy",
  },
  {
    department: "Design",
    employees: 18,
    avgSalary: "$68,000",
    turnover: "2.0%",
    satisfaction: "4.7/5",
    status: "Healthy",
  },
  {
    department: "Marketing",
    employees: 14,
    avgSalary: "$56,000",
    turnover: "4.5%",
    satisfaction: "4.0/5",
    status: "Healthy",
  },
  {
    department: "Finance",
    employees: 12,
    avgSalary: "$62,000",
    turnover: "1.5%",
    satisfaction: "4.6/5",
    status: "Healthy",
  },
  {
    department: "Support",
    employees: 10,
    avgSalary: "$45,000",
    turnover: "6.8%",
    satisfaction: "3.8/5",
    status: "At Risk",
  },
  {
    department: "HR",
    employees: 8,
    avgSalary: "$54,000",
    turnover: "0.0%",
    satisfaction: "4.4/5",
    status: "Healthy",
  },
];





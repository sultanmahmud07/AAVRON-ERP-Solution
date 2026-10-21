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


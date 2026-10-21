export interface SystemUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "Manager" | "User" | "Employee" | "Accountant";
  department: string;
  createdOn: string;
  status: "Active" | "Inactive";
  avatarColor: string;
  profileImage?: string;
}

export interface RolePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface SystemRoleRecord {
  id: string;
  name: string;
  createdOn: string;
  status: "Active" | "Inactive";
  description?: string;
  permissions: Record<string, RolePermissions>;
}

export interface DeleteRequestRecord {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  phone: string;
  department: string;
  requestDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

const STORAGE_KEY_SYSTEM_USERS = "nexora_system_users_v1";
const STORAGE_KEY_SYSTEM_ROLES = "nexora_system_roles_v1";
const STORAGE_KEY_DELETE_REQUESTS = "nexora_delete_requests_v1";

// Seed Users matching user reference image 2:
export const initialSystemUsers: SystemUserRecord[] = [
  {
    id: "usr-1",
    name: "Nathan Brooks",
    email: "nathan@example.com",
    phone: "+1 202 555 0173",
    role: "Admin",
    department: "Finance",
    createdOn: "11 Sep 2025",
    status: "Active",
    avatarColor: "bg-teal-600",
  },
  {
    id: "usr-2",
    name: "Emma Collins",
    email: "emma@example.com",
    phone: "+91 98765 43210",
    role: "Manager",
    department: "Sales",
    createdOn: "05 Sep 2025",
    status: "Active",
    avatarColor: "bg-amber-600",
  },
  {
    id: "usr-3",
    name: "Elijah Cooper",
    email: "elijah@example.com",
    phone: "+1 416 555 8294",
    role: "User",
    department: "HR",
    createdOn: "27 Aug 2025",
    status: "Active",
    avatarColor: "bg-purple-600",
  },
  {
    id: "usr-4",
    name: "Lily Anderson",
    email: "lily@example.com",
    phone: "+61 412 345 678",
    role: "User",
    department: "IT",
    createdOn: "16 Aug 2025",
    status: "Inactive",
    avatarColor: "bg-orange-600",
  },
  {
    id: "usr-5",
    name: "Samuel Hayes",
    email: "samuel@example.com",
    phone: "+49 1512 3456789",
    role: "Manager",
    department: "Purchase",
    createdOn: "25 Jul 2025",
    status: "Active",
    avatarColor: "bg-blue-600",
  },
  {
    id: "usr-6",
    name: "Hannah Scott",
    email: "hannah@example.com",
    phone: "+81 90 1234 5678",
    role: "User",
    department: "Support",
    createdOn: "12 Jul 2025",
    status: "Active",
    avatarColor: "bg-cyan-600",
  },
  {
    id: "usr-7",
    name: "Logan Prince",
    email: "logan@example.com",
    phone: "+55 11 91234 5678",
    role: "Admin",
    department: "Finance",
    createdOn: "23 Jun 2025",
    status: "Inactive",
    avatarColor: "bg-red-600",
  },
  {
    id: "usr-8",
    name: "Zoe Matthews",
    email: "zoe@example.com",
    phone: "+27 82 123 4567",
    role: "User",
    department: "Sales",
    createdOn: "07 Jun 2025",
    status: "Active",
    avatarColor: "bg-amber-500",
  },
  {
    id: "usr-9",
    name: "Alexander Reed",
    email: "alex@example.com",
    phone: "+44 7700 900123",
    role: "User",
    department: "Membership",
    createdOn: "28 May 2025",
    status: "Inactive",
    avatarColor: "bg-emerald-600",
  },
  {
    id: "usr-10",
    name: "Natalie Perez",
    email: "natalie@example.com",
    phone: "+39 331 234 5678",
    role: "Manager",
    department: "Finance",
    createdOn: "18 May 2025",
    status: "Active",
    avatarColor: "bg-indigo-600",
  },
];

export const SYSTEM_MODULES = [
  "Dashboard Overview",
  "Product Management",
  "Sales & POS Orders",
  "Purchase & Suppliers",
  "Due Management",
  "Finance & Cashflow",
  "Accounting & Ledger",
  "Asset Management",
  "User Administration",
];

const defaultAdminPerms: Record<string, RolePermissions> = {};
const defaultManagerPerms: Record<string, RolePermissions> = {};
const defaultUserPerms: Record<string, RolePermissions> = {};

SYSTEM_MODULES.forEach((mod) => {
  defaultAdminPerms[mod] = { view: true, create: true, edit: true, delete: true, export: true };
  defaultManagerPerms[mod] = { view: true, create: true, edit: true, delete: false, export: true };
  defaultUserPerms[mod] = { view: true, create: false, edit: false, delete: false, export: false };
});

// Seed Roles matching reference image 5:
export const initialSystemRoles: SystemRoleRecord[] = [
  {
    id: "role-1",
    name: "Admin",
    createdOn: "11 Sep 2025",
    status: "Active",
    description: "Full enterprise super-administrator privileges across all ERP systems.",
    permissions: defaultAdminPerms,
  },
  {
    id: "role-2",
    name: "Manager",
    createdOn: "05 Sep 2025",
    status: "Inactive",
    description: "Operational management privileges including creation, edits, and financial exports.",
    permissions: defaultManagerPerms,
  },
  {
    id: "role-3",
    name: "User",
    createdOn: "27 Aug 2025",
    status: "Active",
    description: "Standard read-only user access with limited operational input.",
    permissions: defaultUserPerms,
  },
  {
    id: "role-4",
    name: "Employee",
    createdOn: "15 Jul 2025",
    status: "Active",
    description: "Self-service staff account for attendance, leaves, and assigned assets.",
    permissions: defaultUserPerms,
  },
  {
    id: "role-5",
    name: "Accountant",
    createdOn: "02 Jun 2025",
    status: "Active",
    description: "Financial ledger, invoices, vouchers, and accounting reconciliations.",
    permissions: defaultManagerPerms,
  },
];

// Seed Delete Requests:
export const initialDeleteRequests: DeleteRequestRecord[] = [
  {
    id: "del-1",
    userName: "Lily Anderson",
    userEmail: "lily@example.com",
    phone: "+61 412 345 678",
    department: "IT",
    requestDate: "16 Aug 2025",
    reason: "Employee resignation / Offboarding complete",
    status: "Pending",
  },
  {
    id: "del-2",
    userName: "Alexander Reed",
    userEmail: "alex@example.com",
    phone: "+44 7700 900123",
    department: "Membership",
    requestDate: "28 May 2025",
    reason: "Department restructuring / Account deactivated",
    status: "Pending",
  },
];

// ------------------ System Users Storage ------------------
export function getStoredSystemUsers(): SystemUserRecord[] {
  if (typeof window === "undefined") return initialSystemUsers;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYSTEM_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SYSTEM_USERS, JSON.stringify(initialSystemUsers));
      return initialSystemUsers;
    }
    return JSON.parse(raw);
  } catch {
    return initialSystemUsers;
  }
}

export function saveStoredSystemUsers(records: SystemUserRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SYSTEM_USERS, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent("nexora_system_updated"));
  } catch (e) {
    console.error("Failed to save system users", e);
  }
}

export function addStoredSystemUser(
  data: Omit<SystemUserRecord, "id" | "createdOn">
): SystemUserRecord {
  const users = getStoredSystemUsers();
  const newUser: SystemUserRecord = {
    ...data,
    id: `usr-${Date.now()}`,
    createdOn: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
  const updated = [newUser, ...users];
  saveStoredSystemUsers(updated);
  return newUser;
}

export function updateStoredSystemUser(
  id: string,
  updates: Partial<SystemUserRecord>
): SystemUserRecord | null {
  const users = getStoredSystemUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  saveStoredSystemUsers([...users]);
  return users[idx];
}

export function deleteStoredSystemUser(id: string): boolean {
  const users = getStoredSystemUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  saveStoredSystemUsers(filtered);
  return true;
}

// ------------------ System Roles Storage ------------------
export function getStoredSystemRoles(): SystemRoleRecord[] {
  if (typeof window === "undefined") return initialSystemRoles;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYSTEM_ROLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SYSTEM_ROLES, JSON.stringify(initialSystemRoles));
      return initialSystemRoles;
    }
    return JSON.parse(raw);
  } catch {
    return initialSystemRoles;
  }
}

export function saveStoredSystemRoles(records: SystemRoleRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SYSTEM_ROLES, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent("nexora_system_updated"));
  } catch (e) {
    console.error("Failed to save system roles", e);
  }
}

export function addStoredSystemRole(
  name: string,
  status: "Active" | "Inactive",
  description?: string
): SystemRoleRecord {
  const roles = getStoredSystemRoles();
  const newRole: SystemRoleRecord = {
    id: `role-${Date.now()}`,
    name: name.trim(),
    createdOn: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status,
    description: description || `Access role for ${name}`,
    permissions: JSON.parse(JSON.stringify(defaultUserPerms)),
  };
  const updated = [newRole, ...roles];
  saveStoredSystemRoles(updated);
  return newRole;
}

export function updateStoredSystemRole(
  id: string,
  updates: Partial<SystemRoleRecord>
): SystemRoleRecord | null {
  const roles = getStoredSystemRoles();
  const idx = roles.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  roles[idx] = { ...roles[idx], ...updates };
  saveStoredSystemRoles([...roles]);
  return roles[idx];
}

export function deleteStoredSystemRole(id: string): boolean {
  const roles = getStoredSystemRoles();
  const filtered = roles.filter((r) => r.id !== id);
  if (filtered.length === roles.length) return false;
  saveStoredSystemRoles(filtered);
  return true;
}

// ------------------ Delete Requests Storage ------------------
export function getStoredDeleteRequests(): DeleteRequestRecord[] {
  if (typeof window === "undefined") return initialDeleteRequests;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETE_REQUESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DELETE_REQUESTS, JSON.stringify(initialDeleteRequests));
      return initialDeleteRequests;
    }
    return JSON.parse(raw);
  } catch {
    return initialDeleteRequests;
  }
}

export function saveStoredDeleteRequests(records: DeleteRequestRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_DELETE_REQUESTS, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent("nexora_system_updated"));
  } catch (e) {
    console.error("Failed to save delete requests", e);
  }
}

export function updateDeleteRequestStatus(
  id: string,
  status: "Approved" | "Rejected"
): DeleteRequestRecord | null {
  const requests = getStoredDeleteRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  requests[idx].status = status;
  saveStoredDeleteRequests([...requests]);

  // If approved, deactivate or remove user
  if (status === "Approved") {
    const users = getStoredSystemUsers();
    const targetUser = users.find((u) => u.email === requests[idx].userEmail);
    if (targetUser) {
      updateStoredSystemUser(targetUser.id, { status: "Inactive" });
    }
  }

  return requests[idx];
}

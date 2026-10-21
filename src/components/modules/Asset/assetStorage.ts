export interface AssetTypeRecord {
  id: string;
  name: string;
  note: string;
  totalAssets: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface AssetRecord {
  id: string;
  name: string;
  typeId?: string;
  typeName: string;
  cost: number;
  purchaseDate: string; // e.g. "11 Sep 2025"
  warranty: string;     // e.g. "1 Year", "4 Months"
  warrantyEndDate?: string; // e.g. "25 Sep 2026"
  status: "Active" | "Inactive";
  assignedTo?: string;
  note?: string;
  image?: string;
  createdAt: string;
}

export interface AssignmentRecord {
  id: string;
  assignmentId: string; // e.g. "#ASN0020"
  assetName: string;
  assignedTo: string;
  avatarColor: string;
  department: string;
  assignmentDate: string; // e.g. "11 Sep 2025"
  returnDate: string;     // e.g. "—" or "02 Sep 2026"
  status: "Assigned" | "Repair" | "Returned";
  note?: string;
  createdAt: string;
}

const STORAGE_KEY_ASSET_TYPES = "nexora_asset_types_v2";
const STORAGE_KEY_ASSETS = "nexora_assets_data_v2";
const STORAGE_KEY_ASSIGNMENTS = "nexora_assignments_data_v2";

// Initial Seed Data for Asset Types:
export const initialAssetTypes: AssetTypeRecord[] = [
  {
    id: "atype-1",
    name: "Electronics",
    note: "—",
    totalAssets: 4,
    status: "Active",
    createdAt: "2025-08-01",
  },
  {
    id: "atype-2",
    name: "Furniture",
    note: "—",
    totalAssets: 2,
    status: "Active",
    createdAt: "2025-08-01",
  },
  {
    id: "atype-3",
    name: "Computer & IT Equipment",
    note: "—",
    totalAssets: 3,
    status: "Active",
    createdAt: "2025-08-05",
  },
  {
    id: "atype-4",
    name: "Office Equipment",
    note: "—",
    totalAssets: 0,
    status: "Active",
    createdAt: "2025-08-08",
  },
  {
    id: "atype-5",
    name: "Machinery & Vehicles",
    note: "—",
    totalAssets: 1,
    status: "Active",
    createdAt: "2025-08-10",
  },
];

// Initial Seed Data for Assets (Directly matching user image 1):
export const initialAssets: AssetRecord[] = [
  {
    id: "asset-1",
    name: "Dell Latitude",
    typeName: "Computer & IT Equipment",
    cost: 95000.0,
    purchaseDate: "11 Sep 2025",
    warranty: "1 Year",
    warrantyEndDate: "25 Sep 2026",
    status: "Active",
    assignedTo: "Ethan Walker",
    createdAt: "2025-09-11",
  },
  {
    id: "asset-2",
    name: "Office Chair",
    typeName: "Furniture",
    cost: 14500.0,
    purchaseDate: "05 Sep 2025",
    warranty: "1 Year",
    warrantyEndDate: "10 Sep 2026",
    status: "Active",
    assignedTo: "Madison Clark",
    createdAt: "2025-09-05",
  },
  {
    id: "asset-3",
    name: "HP LaserJet Pro MFP",
    typeName: "Electronics",
    cost: 42000.0,
    purchaseDate: "27 Aug 2025",
    warranty: "1 Year",
    warrantyEndDate: "02 Sep 2026",
    status: "Active",
    assignedTo: "James Harris",
    createdAt: "2025-08-27",
  },
  {
    id: "asset-4",
    name: "iPhone 14",
    typeName: "Electronics",
    cost: 115000.0,
    purchaseDate: "16 Aug 2025",
    warranty: "1 Year",
    warrantyEndDate: "23 Aug 2026",
    status: "Inactive",
    assignedTo: "Avery Thompson",
    createdAt: "2025-08-16",
  },
  {
    id: "asset-5",
    name: "MacBook Pro 16\"",
    typeName: "Computer & IT Equipment",
    cost: 245000.0,
    purchaseDate: "25 Jul 2025",
    warranty: "4 Months",
    warrantyEndDate: "30 Nov 2025",
    status: "Active",
    assignedTo: "Benjamin Wright",
    createdAt: "2025-07-25",
  },
  {
    id: "asset-6",
    name: "AC Unit",
    typeName: "Electronics",
    cost: 65000.0,
    purchaseDate: "12 Jul 2025",
    warranty: "5 Months",
    warrantyEndDate: "20 Dec 2025",
    status: "Active",
    assignedTo: "Chloe Mitchell",
    createdAt: "2025-07-12",
  },
  {
    id: "asset-7",
    name: "Conference Table",
    typeName: "Furniture",
    cost: 55000.0,
    purchaseDate: "23 Jun 2025",
    warranty: "3 Months",
    warrantyEndDate: "28 Sep 2025",
    status: "Active",
    assignedTo: "Daniel Roberts",
    createdAt: "2025-06-23",
  },
  {
    id: "asset-8",
    name: "CCTV Camera Set",
    typeName: "Electronics",
    cost: 38000.0,
    purchaseDate: "07 Jun 2025",
    warranty: "5 Months",
    warrantyEndDate: "15 Nov 2025",
    status: "Inactive",
    assignedTo: "Grace Adams",
    createdAt: "2025-06-07",
  },
  {
    id: "asset-9",
    name: "Forklift Machine",
    typeName: "Machinery & Vehicles",
    cost: 450000.0,
    purchaseDate: "28 May 2025",
    warranty: "3 Months",
    warrantyEndDate: "05 Aug 2025",
    status: "Active",
    assignedTo: "Hendrita Bennett",
    createdAt: "2025-05-28",
  },
  {
    id: "asset-10",
    name: "Server Rack",
    typeName: "Computer & IT Equipment",
    cost: 120000.0,
    purchaseDate: "18 May 2025",
    warranty: "4 Months",
    warrantyEndDate: "26 Sep 2025",
    status: "Active",
    assignedTo: "Harper Scott",
    createdAt: "2025-05-18",
  },
];

// Initial Seed Data for Assignments (Directly matching user image 3):
export const initialAssignments: AssignmentRecord[] = [
  {
    id: "asn-1",
    assignmentId: "#ASN0020",
    assetName: "Dell Latitude",
    assignedTo: "Ethan Walker",
    avatarColor: "bg-teal-600",
    department: "IT",
    assignmentDate: "11 Sep 2025",
    returnDate: "—",
    status: "Assigned",
    createdAt: "2025-09-11",
  },
  {
    id: "asn-2",
    assignmentId: "#ASN0019",
    assetName: "Office Chair",
    assignedTo: "Madison Clark",
    avatarColor: "bg-amber-600",
    department: "HR",
    assignmentDate: "05 Sep 2025",
    returnDate: "—",
    status: "Assigned",
    createdAt: "2025-09-05",
  },
  {
    id: "asn-3",
    assignmentId: "#ASN0018",
    assetName: "HP LaserJet Pro MFP",
    assignedTo: "James Harris",
    avatarColor: "bg-purple-600",
    department: "Admin",
    assignmentDate: "27 Aug 2025",
    returnDate: "02 Sep 2026",
    status: "Assigned",
    createdAt: "2025-08-27",
  },
  {
    id: "asn-4",
    assignmentId: "#ASN0017",
    assetName: "iPhone 14",
    assignedTo: "Avery Thompson",
    avatarColor: "bg-orange-600",
    department: "Management",
    assignmentDate: "16 Aug 2025",
    returnDate: "—",
    status: "Repair",
    createdAt: "2025-08-16",
  },
  {
    id: "asn-5",
    assignmentId: "#ASN0016",
    assetName: "MacBook Pro 16\"",
    assignedTo: "Benjamin Wright",
    avatarColor: "bg-blue-600",
    department: "Design",
    assignmentDate: "25 Jul 2025",
    returnDate: "—",
    status: "Assigned",
    createdAt: "2025-07-25",
  },
  {
    id: "asn-6",
    assignmentId: "#ASN0015",
    assetName: "AC Unit",
    assignedTo: "Chloe Mitchell",
    avatarColor: "bg-cyan-600",
    department: "Facility",
    assignmentDate: "12 Jul 2025",
    returnDate: "20 Dec 2025",
    status: "Assigned",
    createdAt: "2025-07-12",
  },
  {
    id: "asn-7",
    assignmentId: "#ASN0014",
    assetName: "Conference Table",
    assignedTo: "Daniel Roberts",
    avatarColor: "bg-red-600",
    department: "Admin",
    assignmentDate: "23 Jun 2025",
    returnDate: "15 Nov 2025",
    status: "Assigned",
    createdAt: "2025-06-23",
  },
  {
    id: "asn-8",
    assignmentId: "#ASN0013",
    assetName: "CCTV Camera Set",
    assignedTo: "Grace Adams",
    avatarColor: "bg-amber-500",
    department: "Security",
    assignmentDate: "07 Jun 2025",
    returnDate: "—",
    status: "Repair",
    createdAt: "2025-06-07",
  },
  {
    id: "asn-9",
    assignmentId: "#ASN0012",
    assetName: "Forklift Machine",
    assignedTo: "Hendrita Bennett",
    avatarColor: "bg-emerald-600",
    department: "Logistics",
    assignmentDate: "28 May 2025",
    returnDate: "—",
    status: "Assigned",
    createdAt: "2025-05-28",
  },
  {
    id: "asn-10",
    assignmentId: "#ASN0011",
    assetName: "Server Rack",
    assignedTo: "Harper Scott",
    avatarColor: "bg-indigo-600",
    department: "IT",
    assignmentDate: "18 May 2025",
    returnDate: "26 Sep 2025",
    status: "Assigned",
    createdAt: "2025-05-18",
  },
];

// Helper to format currency in Bangladeshi Taka: ৳ 95 000.00
export function formatTaka(amount: number): string {
  const parts = Math.abs(amount).toFixed(2).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${amount < 0 ? "-" : ""}৳ ${integerPart}.${parts[1]}`;
}

// ------------------ Asset Types Storage ------------------
export function getStoredAssetTypes(): AssetTypeRecord[] {
  if (typeof window === "undefined") return initialAssetTypes;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSET_TYPES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ASSET_TYPES, JSON.stringify(initialAssetTypes));
      return initialAssetTypes;
    }
    const types: AssetTypeRecord[] = JSON.parse(raw);
    const assets = getStoredAssets();
    return types.map((t) => ({
      ...t,
      totalAssets: assets.filter(
        (a) => a.typeName.toLowerCase() === t.name.toLowerCase()
      ).length,
    }));
  } catch {
    return initialAssetTypes;
  }
}

export function saveStoredAssetTypes(records: AssetTypeRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ASSET_TYPES, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent("nexora_assets_updated"));
  } catch (e) {
    console.error("Failed to save asset types", e);
  }
}

export function addStoredAssetType(
  data: Omit<AssetTypeRecord, "id" | "totalAssets" | "createdAt">
): AssetTypeRecord {
  const types = getStoredAssetTypes();
  const newType: AssetTypeRecord = {
    id: `atype-${Date.now()}`,
    name: data.name.trim(),
    note: data.note?.trim() || "—",
    totalAssets: 0,
    status: data.status || "Active",
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updated = [newType, ...types];
  saveStoredAssetTypes(updated);
  return newType;
}

export function updateStoredAssetType(
  id: string,
  updates: Partial<AssetTypeRecord>
): AssetTypeRecord | null {
  const types = getStoredAssetTypes();
  const index = types.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const oldName = types[index].name;
  types[index] = { ...types[index], ...updates };
  saveStoredAssetTypes([...types]);

  if (updates.name && updates.name !== oldName) {
    const assets = getStoredAssets();
    const updatedAssets = assets.map((a) =>
      a.typeName.toLowerCase() === oldName.toLowerCase()
        ? { ...a, typeName: updates.name! }
        : a
    );
    saveStoredAssets(updatedAssets);
  }

  return types[index];
}

export function deleteStoredAssetType(id: string): boolean {
  const types = getStoredAssetTypes();
  const filtered = types.filter((t) => t.id !== id);
  if (filtered.length === types.length) return false;
  saveStoredAssetTypes(filtered);
  return true;
}

// ------------------ Assets Storage ------------------
export function getStoredAssets(): AssetRecord[] {
  if (typeof window === "undefined") return initialAssets;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(initialAssets));
      return initialAssets;
    }
    return JSON.parse(raw);
  } catch {
    return initialAssets;
  }
}

export function saveStoredAssets(records: AssetRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent("nexora_assets_updated"));
  } catch (e) {
    console.error("Failed to save assets", e);
  }
}

export function addStoredAsset(
  data: Omit<AssetRecord, "id" | "createdAt">
): AssetRecord {
  const assets = getStoredAssets();
  const newAsset: AssetRecord = {
    id: `asset-${Date.now()}`,
    name: data.name.trim(),
    typeId: data.typeId,
    typeName: data.typeName.trim(),
    cost: Number(data.cost) || 0,
    purchaseDate: data.purchaseDate || "11 Sep 2025",
    warranty: data.warranty || "1 Year",
    warrantyEndDate: data.warrantyEndDate,
    status: data.status || "Active",
    assignedTo: data.assignedTo || "—",
    note: data.note?.trim() || "",
    image: data.image,
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updated = [newAsset, ...assets];
  saveStoredAssets(updated);
  return newAsset;
}

export function updateStoredAsset(
  id: string,
  updates: Partial<AssetRecord>
): AssetRecord | null {
  const assets = getStoredAssets();
  const index = assets.findIndex((a) => a.id === id);
  if (index === -1) return null;

  assets[index] = { ...assets[index], ...updates };
  saveStoredAssets([...assets]);
  return assets[index];
}

export function deleteStoredAsset(id: string): boolean {
  const assets = getStoredAssets();
  const filtered = assets.filter((a) => a.id !== id);
  if (filtered.length === assets.length) return false;
  saveStoredAssets(filtered);
  return true;
}

// ------------------ Assignments Storage ------------------
export function getStoredAssignments(): AssignmentRecord[] {
  if (typeof window === "undefined") return initialAssignments;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(initialAssignments));
      return initialAssignments;
    }
    return JSON.parse(raw);
  } catch {
    return initialAssignments;
  }
}

export function saveStoredAssignments(records: AssignmentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent("nexora_assets_updated"));
  } catch (e) {
    console.error("Failed to save assignments", e);
  }
}

export function addStoredAssignment(
  data: Omit<AssignmentRecord, "id" | "createdAt">
): AssignmentRecord {
  const list = getStoredAssignments();
  const newRecord: AssignmentRecord = {
    id: `asn-${Date.now()}`,
    assignmentId: data.assignmentId || `#ASN00${list.length + 21}`,
    assetName: data.assetName.trim(),
    assignedTo: data.assignedTo.trim(),
    avatarColor: data.avatarColor || "bg-teal-600",
    department: data.department || "General",
    assignmentDate: data.assignmentDate || new Date().toISOString().split("T")[0],
    returnDate: data.returnDate || "—",
    status: data.status || "Assigned",
    note: data.note?.trim() || "",
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updated = [newRecord, ...list];
  saveStoredAssignments(updated);
  return newRecord;
}

export function updateStoredAssignment(
  id: string,
  updates: Partial<AssignmentRecord>
): AssignmentRecord | null {
  const list = getStoredAssignments();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...updates };
  saveStoredAssignments([...list]);
  return list[index];
}

export function deleteStoredAssignment(id: string): boolean {
  const list = getStoredAssignments();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length === list.length) return false;
  saveStoredAssignments(filtered);
  return true;
}

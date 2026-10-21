export interface BranchItem {
  id: string;
  slNo: number;
  branchCode: string;
  branchName: string;
  phone: string;
  email: string;
  address: string;
  managerName?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

const STORAGE_KEY = "nexora_branches_data_v1";
const STORAGE_EVENT = "nexora_branches_updated";

export const initialBranches: BranchItem[] = [
  {
    id: "br-1",
    slNo: 1,
    branchCode: "BR-001",
    branchName: "Dhaka Head Office & Flagship",
    phone: "+880 1711-002233",
    email: "dhaka.hq@nexora.com",
    address: "Level 14, Crystal Palace, Gulshan-2, Dhaka 1212",
    managerName: "Mahmudur Rahman",
    status: "Active",
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "br-2",
    slNo: 2,
    branchCode: "BR-002",
    branchName: "Chittagong Port Hub",
    phone: "+880 1819-445566",
    email: "ctg.hub@nexora.com",
    address: "Holding 88, Agrabad Commercial Area, Chittagong 4100",
    managerName: "Farhana Yasmin",
    status: "Active",
    createdAt: "2024-02-10T10:30:00Z",
  },
  {
    id: "br-3",
    slNo: 3,
    branchCode: "BR-003",
    branchName: "Uttara Retail Outlet",
    phone: "+880 1912-778899",
    email: "uttara.store@nexora.com",
    address: "Sector 3, Jasimuddin Avenue, Uttara, Dhaka 1230",
    managerName: "Tanvir Ahmed",
    status: "Active",
    createdAt: "2024-03-01T11:15:00Z",
  },
  {
    id: "br-4",
    slNo: 4,
    branchCode: "BR-004",
    branchName: "Sylhet Regional Hub",
    phone: "+880 1613-223344",
    email: "sylhet.office@nexora.com",
    address: "Zindabazar Tower, 3rd Floor, Sylhet 3100",
    managerName: "Nusrat Jahan",
    status: "Active",
    createdAt: "2024-04-12T14:00:00Z",
  },
  {
    id: "br-5",
    slNo: 5,
    branchCode: "BR-005",
    branchName: "Mirpur Logistics Hub",
    phone: "+880 1515-998877",
    email: "mirpur.hub@nexora.com",
    address: "Plot 12, Main Road 1, Mirpur-10 Roundabout, Dhaka 1216",
    managerName: "Rafiqul Islam",
    status: "Active",
    createdAt: "2024-05-20T16:45:00Z",
  },
  {
    id: "br-6",
    slNo: 6,
    branchCode: "BR-006",
    branchName: "Khulna Business Center",
    phone: "+880 1714-332211",
    email: "khulna.branch@nexora.com",
    address: "KDA Avenue, Royal Square, Khulna 9100",
    managerName: "Kabir Hossain",
    status: "Inactive",
    createdAt: "2024-06-05T08:30:00Z",
  },
];

export function getStoredBranches(): BranchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBranches));
      return initialBranches;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialBranches;
  } catch {
    return initialBranches;
  }
}

export function saveStoredBranches(items: BranchItem[]): void {
  try {
    // Re-index slNo to always be sequential 1, 2, 3...
    const normalized = items.map((b, index) => ({
      ...b,
      slNo: index + 1,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error("Failed to save branches", err);
  }
}

export function addStoredBranch(
  data: Omit<BranchItem, "id" | "slNo" | "createdAt"> & {
    branchCode?: string;
  }
): BranchItem {
  const current = getStoredBranches();
  const nextNum = current.length + 1;
  const branchCode =
    data.branchCode && data.branchCode.trim()
      ? data.branchCode.trim()
      : `BR-${String(nextNum).padStart(3, "0")}`;

  const newBranch: BranchItem = {
    id: `br-${Date.now()}`,
    slNo: nextNum,
    branchCode,
    branchName: data.branchName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    address: data.address.trim(),
    managerName: data.managerName?.trim() || undefined,
    status: data.status || "Active",
    createdAt: new Date().toISOString(),
  };

  const updated = [newBranch, ...current];
  saveStoredBranches(updated);
  return newBranch;
}

export function updateStoredBranch(
  id: string,
  updates: Partial<Omit<BranchItem, "id">>
): BranchItem | null {
  const current = getStoredBranches();
  const idx = current.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const updatedItem: BranchItem = {
    ...current[idx],
    ...updates,
  };

  current[idx] = updatedItem;
  saveStoredBranches(current);
  return updatedItem;
}

export function deleteStoredBranch(id: string): boolean {
  const current = getStoredBranches();
  const filtered = current.filter((b) => b.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredBranches(filtered);
  return true;
}

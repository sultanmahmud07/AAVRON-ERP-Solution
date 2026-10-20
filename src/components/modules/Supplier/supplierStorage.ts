export interface SupplierItem {
  id: string; // e.g. "#SUP0020"
  name: string;
  email: string;
  phone: string;
  country: string;
  status: "Active" | "Inactive";
  category?: string;
  iconType?: "monitor" | "headphones" | "shoes" | "watch" | "store" | "tools" | "bag" | "mobile" | "chair" | "generic";
  createdAt: string;
}

const STORAGE_KEY = "nexora_suppliers_data";

export const initialSuppliers: SupplierItem[] = [
  {
    id: "#SUP0020",
    name: "Apex Computers",
    email: "apexcomputers@example.com",
    phone: "+1 (758) 364-7314",
    country: "Germany",
    status: "Active",
    iconType: "monitor",
    createdAt: "2025-09-20",
  },
  {
    id: "#SUP0019",
    name: "Beats Headphones",
    email: "beatsheadphone@example.com",
    phone: "+1 (382) 764-2864",
    country: "Japan",
    status: "Active",
    iconType: "headphones",
    createdAt: "2025-09-18",
  },
  {
    id: "#SUP0018",
    name: "Dazzle Shoes",
    email: "dazzleshoes@example.com",
    phone: "+1 (648) 375-3145",
    country: "USA",
    status: "Active",
    iconType: "shoes",
    createdAt: "2025-09-15",
  },
  {
    id: "#SUP0017",
    name: "Best Accessories",
    email: "bestaccessories@example.com",
    phone: "+1 (325) 874-3284",
    country: "Austria",
    status: "Active",
    iconType: "watch",
    createdAt: "2025-09-10",
  },
  {
    id: "#SUP0016",
    name: "A-Z Store",
    email: "a2zstore@example.com",
    phone: "+1 (783) 856-6575",
    country: "Turkey",
    status: "Active",
    iconType: "store",
    createdAt: "2025-09-05",
  },
  {
    id: "#SUP0015",
    name: "Hatimi Hardwares",
    email: "hatimihardware@example.com",
    phone: "+1 (853) 475-3248",
    country: "Mexico",
    status: "Active",
    iconType: "tools",
    createdAt: "2025-08-28",
  },
  {
    id: "#SUP0014",
    name: "Aesthetic Bags",
    email: "aestheticbags@example.com",
    phone: "+1 (235) 745-7465",
    country: "France",
    status: "Active",
    iconType: "bag",
    createdAt: "2025-08-20",
  },
  {
    id: "#SUP0013",
    name: "Alpha Mobiles",
    email: "alphamobiles@example.com",
    phone: "+1 (756) 352-3425",
    country: "Greece",
    status: "Active",
    iconType: "mobile",
    createdAt: "2025-08-15",
  },
  {
    id: "#SUP0012",
    name: "Sigma Chairs",
    email: "sigmachair@example.com",
    phone: "+1 (602) 735-7453",
    country: "Italy",
    status: "Active",
    iconType: "chair",
    createdAt: "2025-08-01",
  },
  {
    id: "#SUP0011",
    name: "Zenith Bags",
    email: "zenithbags@example.com",
    phone: "+1 (453) 345-2486",
    country: "China",
    status: "Active",
    iconType: "bag",
    createdAt: "2025-07-25",
  },
];

export function getStoredSuppliers(): SupplierItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSuppliers));
      return initialSuppliers;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSuppliers));
      return initialSuppliers;
    }
    return parsed;
  } catch {
    return initialSuppliers;
  }
}

export function saveStoredSuppliers(suppliers: SupplierItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
    window.dispatchEvent(new Event("nexora_suppliers_updated"));
  } catch (err) {
    console.error("Failed to save suppliers to localStorage", err);
  }
}

export function addStoredSupplier(
  name: string,
  email: string,
  phone: string,
  country: string,
  status: "Active" | "Inactive" = "Active"
): SupplierItem {
  const current = getStoredSuppliers();
  const nextNum = current.length + 21;
  const newId = `#SUP00${nextNum < 100 ? nextNum : nextNum}`;

  const newSupplier: SupplierItem = {
    id: newId,
    name,
    email,
    phone,
    country,
    status,
    iconType: "generic",
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newSupplier, ...current];
  saveStoredSuppliers(updated);
  return newSupplier;
}

export function updateStoredSupplier(
  id: string,
  updates: Partial<Omit<SupplierItem, "id">>
): SupplierItem | null {
  const current = getStoredSuppliers();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return null;

  current[index] = { ...current[index], ...updates };
  saveStoredSuppliers([...current]);
  return current[index];
}

export function deleteStoredSupplier(id: string): boolean {
  const current = getStoredSuppliers();
  const filtered = current.filter((s) => s.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredSuppliers(filtered);
  return true;
}

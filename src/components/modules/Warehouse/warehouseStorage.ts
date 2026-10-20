export interface WarehouseItem {
  id: string; // e.g. "#WRH0020"
  name: string;
  contactPerson: string;
  contactAvatarColor?: string;
  phone: string;
  createdOn: string;
  capacity: number;
  used: number;
  status: "Active" | "Inactive";
}

const STORAGE_KEY = "nexora_warehouses_data";

export const initialWarehouses: WarehouseItem[] = [
  {
    id: "#WRH0020",
    name: "Smart Stock Hub",
    contactPerson: "Peter Crawford",
    contactAvatarColor: "bg-teal-600",
    phone: "+1 (746) 835-3478",
    createdOn: "11 Sep 2025",
    capacity: 300000,
    used: 250000,
    status: "Active",
  },
  {
    id: "#WRH0019",
    name: "Flow Grid Storage",
    contactPerson: "Regina Bryant",
    contactAvatarColor: "bg-amber-600",
    phone: "+1 (375) 235-0453",
    createdOn: "05 Sep 2025",
    capacity: 250000,
    used: 200000,
    status: "Active",
  },
  {
    id: "#WRH0018",
    name: "Prime Storage Solutions",
    contactPerson: "Richard Jordan",
    contactAvatarColor: "bg-purple-600",
    phone: "+1 (834) 735-8345",
    createdOn: "27 Aug 2025",
    capacity: 200000,
    used: 170000,
    status: "Active",
  },
  {
    id: "#WRH0017",
    name: "Global Supply Depot",
    contactPerson: "Jennifer Hines",
    contactAvatarColor: "bg-orange-600",
    phone: "+1 (796) 384-3524",
    createdOn: "16 Aug 2025",
    capacity: 350000,
    used: 320000,
    status: "Active",
  },
  {
    id: "#WRH0016",
    name: "Silverline Storage",
    contactPerson: "George Meurer",
    contactAvatarColor: "bg-blue-600",
    phone: "+1 (342) 352-3425",
    createdOn: "25 Jul 2025",
    capacity: 400000,
    used: 370000,
    status: "Active",
  },
  {
    id: "#WRH0015",
    name: "Nova Storage Hub",
    contactPerson: "Ruby Perez",
    contactAvatarColor: "bg-teal-700",
    phone: "+1 (835) 654-3865",
    createdOn: "12 Jul 2025",
    capacity: 270000,
    used: 230000,
    status: "Active",
  },
  {
    id: "#WRH0014",
    name: "Riverfront Depot",
    contactPerson: "Joseph Chasteen",
    contactAvatarColor: "bg-rose-600",
    phone: "+1 (457) 348-3245",
    createdOn: "23 Jun 2025",
    capacity: 420000,
    used: 400000,
    status: "Active",
  },
  {
    id: "#WRH0013",
    name: "Grand Avenue Depot",
    contactPerson: "Renee Jimenes",
    contactAvatarColor: "bg-amber-700",
    phone: "+1 (735) 106-7648",
    createdOn: "07 Jun 2025",
    capacity: 250000,
    used: 200000,
    status: "Active",
  },
  {
    id: "#WRH0012",
    name: "Edge Ware Solutions",
    contactPerson: "Kenneth Chilton",
    contactAvatarColor: "bg-cyan-600",
    phone: "+1 (348) 304-7354",
    createdOn: "28 May 2025",
    capacity: 450000,
    used: 420000,
    status: "Active",
  },
  {
    id: "#WRH0011",
    name: "Riverbend Storage",
    contactPerson: "Maria Ortiz",
    contactAvatarColor: "bg-orange-700",
    phone: "+1 (854) 734-7652",
    createdOn: "18 May 2025",
    capacity: 320000,
    used: 300000,
    status: "Active",
  },
];

export const sampleContactPersons = [
  "Peter Crawford",
  "Regina Bryant",
  "Richard Jordan",
  "Jennifer Hines",
  "George Meurer",
  "Ruby Perez",
  "Joseph Chasteen",
  "Renee Jimenes",
  "Kenneth Chilton",
  "Maria Ortiz",
  "Alexander Wright",
  "Sophia Davis",
];

export function getStoredWarehouses(): WarehouseItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialWarehouses));
      return initialWarehouses;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialWarehouses));
      return initialWarehouses;
    }
    return parsed;
  } catch {
    return initialWarehouses;
  }
}

export function saveStoredWarehouses(warehouses: WarehouseItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(warehouses));
    window.dispatchEvent(new Event("nexora_warehouses_updated"));
  } catch (err) {
    console.error("Failed to save warehouses to localStorage", err);
  }
}

export function addStoredWarehouse(
  name: string,
  contactPerson: string,
  phone: string,
  capacity: number,
  status: "Active" | "Inactive" = "Active",
  used: number = 0
): WarehouseItem {
  const current = getStoredWarehouses();
  const nextNum = current.length + 21;
  const newId = `#WRH00${nextNum < 100 ? nextNum : nextNum}`;

  const colors = [
    "bg-teal-600",
    "bg-amber-600",
    "bg-purple-600",
    "bg-orange-600",
    "bg-blue-600",
    "bg-rose-600",
    "bg-cyan-600",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date();
  const createdOnStr = `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;

  const newWarehouse: WarehouseItem = {
    id: newId,
    name,
    contactPerson,
    contactAvatarColor: randomColor,
    phone,
    createdOn: createdOnStr,
    capacity: Number(capacity) || 100000,
    used: Number(used) || 0,
    status,
  };

  const updated = [newWarehouse, ...current];
  saveStoredWarehouses(updated);
  return newWarehouse;
}

export function updateStoredWarehouse(
  id: string,
  updates: Partial<Omit<WarehouseItem, "id">>
): WarehouseItem | null {
  const current = getStoredWarehouses();
  const index = current.findIndex((w) => w.id === id);
  if (index === -1) return null;

  current[index] = { ...current[index], ...updates };
  saveStoredWarehouses([...current]);
  return current[index];
}

export function deleteStoredWarehouse(id: string): boolean {
  const current = getStoredWarehouses();
  const filtered = current.filter((w) => w.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredWarehouses(filtered);
  return true;
}

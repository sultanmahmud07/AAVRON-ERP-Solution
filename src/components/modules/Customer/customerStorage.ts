export interface CustomerItem {
  id: string; // e.g. "#ORD0020"
  code: string; // e.g. "#ORD0020"
  name: string;
  email: string;
  phone: string;
  country: string;
  address?: string;
  status: "Active" | "Inactive";
  avatarColor?: string;
  createdAt: string;
}

const STORAGE_KEY = "nexora_customers_data";

export const initialCustomers: CustomerItem[] = [
  {
    id: "#ORD0020",
    code: "#ORD0020",
    name: "Alexander Kenn",
    email: "alexan@example.com",
    phone: "+1 202 555 0173",
    country: "United States",
    address: "742 Evergreen Terrace, Springfield, OR",
    status: "Active",
    avatarColor: "bg-teal-600",
    createdAt: "2026-01-20",
  },
  {
    id: "#ORD0019",
    code: "#ORD0019",
    name: "Gabriella White",
    email: "gabrie@example.com",
    phone: "+91 98765 43210",
    country: "India",
    address: "42 Park Avenue, Mumbai",
    status: "Active",
    avatarColor: "bg-amber-600",
    createdAt: "2026-01-18",
  },
  {
    id: "#ORD0018",
    code: "#ORD0018",
    name: "Christopher Rey",
    email: "christ@example.com",
    phone: "+1 416 555 8294",
    country: "Canada",
    address: "100 Queen St W, Toronto, ON",
    status: "Active",
    avatarColor: "bg-purple-600",
    createdAt: "2026-01-15",
  },
  {
    id: "#ORD0017",
    code: "#ORD0017",
    name: "Penelope Ton",
    email: "penelo@example.com",
    phone: "+61 412 345 678",
    country: "Australia",
    address: "123 Collins St, Melbourne, VIC",
    status: "Active",
    avatarColor: "bg-orange-600",
    createdAt: "2026-01-12",
  },
  {
    id: "#ORD0016",
    code: "#ORD0016",
    name: "Daniel Foster",
    email: "daniel@example.com",
    phone: "+49 1512 3456789",
    country: "Germany",
    address: "Friedrichstraße 43, Berlin",
    status: "Active",
    avatarColor: "bg-blue-600",
    createdAt: "2026-01-10",
  },
  {
    id: "#ORD0015",
    code: "#ORD0015",
    name: "Anastasia Leton",
    email: "anasta@example.com",
    phone: "+81 90 1234 5678",
    country: "Japan",
    address: "Shibuya 2-24-12, Tokyo",
    status: "Active",
    avatarColor: "bg-teal-700",
    createdAt: "2026-01-08",
  },
  {
    id: "#ORD0014",
    code: "#ORD0014",
    name: "Noah Bennett",
    email: "noah@example.com",
    phone: "+55 11 91234 5678",
    country: "Brazil",
    address: "Av. Paulista 1000, São Paulo",
    status: "Active",
    avatarColor: "bg-rose-600",
    createdAt: "2026-01-05",
  },
  {
    id: "#ORD0013",
    code: "#ORD0013",
    name: "Victoria Ellsworth",
    email: "victoria@example.com",
    phone: "+27 82 123 4567",
    country: "South Africa",
    address: "Long Street 88, Cape Town",
    status: "Active",
    avatarColor: "bg-amber-700",
    createdAt: "2026-01-03",
  },
  {
    id: "#ORD0012",
    code: "#ORD0012",
    name: "Noah Kensington",
    email: "kensing@example.com",
    phone: "+44 7700 900123",
    country: "United Kingdom",
    address: "221B Baker Street, London",
    status: "Active",
    avatarColor: "bg-cyan-600",
    createdAt: "2026-01-02",
  },
  {
    id: "#ORD0011",
    code: "#ORD0011",
    name: "Catherine Lan",
    email: "cather@example.com",
    phone: "+39 331 234 5678",
    country: "Italy",
    address: "Via del Corso 18, Rome",
    status: "Active",
    avatarColor: "bg-orange-700",
    createdAt: "2026-01-01",
  },
];

export const COUNTRIES_LIST = [
  "United States",
  "India",
  "Canada",
  "Australia",
  "Germany",
  "Japan",
  "Brazil",
  "South Africa",
  "United Kingdom",
  "Italy",
  "France",
  "China",
  "Mexico",
  "Turkey",
];

export function getStoredCustomers(): CustomerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCustomers));
      return initialCustomers;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCustomers));
      return initialCustomers;
    }
    return parsed;
  } catch {
    return initialCustomers;
  }
}

export function saveStoredCustomers(customers: CustomerItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    window.dispatchEvent(new Event("nexora_customers_updated"));
  } catch (err) {
    console.error("Failed to save customers to localStorage", err);
  }
}

export function addStoredCustomer(
  name: string,
  email: string,
  phone: string,
  country: string = "United States",
  address?: string,
  status: "Active" | "Inactive" = "Active"
): CustomerItem {
  const current = getStoredCustomers();
  const nextNum = current.length + 21;
  const newCode = `#ORD00${nextNum < 100 ? nextNum : nextNum}`;

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

  const newCustomer: CustomerItem = {
    id: newCode,
    code: newCode,
    name,
    email,
    phone,
    country,
    address: address?.trim() || undefined,
    status,
    avatarColor: randomColor,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newCustomer, ...current];
  saveStoredCustomers(updated);
  return newCustomer;
}

export function updateStoredCustomer(
  id: string,
  updates: Partial<Omit<CustomerItem, "id" | "code">>
): CustomerItem | null {
  const current = getStoredCustomers();
  const index = current.findIndex((c) => c.id === id);
  if (index === -1) return null;

  current[index] = { ...current[index], ...updates };
  saveStoredCustomers([...current]);
  return current[index];
}

export function deleteStoredCustomer(id: string): boolean {
  const current = getStoredCustomers();
  const filtered = current.filter((c) => c.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredCustomers(filtered);
  return true;
}

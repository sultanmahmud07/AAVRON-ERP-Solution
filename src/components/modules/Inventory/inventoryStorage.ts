export interface InventoryItem {
  id: string; // e.g. "#PRD0020"
  code: string; // e.g. "#PRD0020"
  product: string;
  sku: string;
  warehouse: string;
  category: string;
  brand: string;
  unit: string;
  quantity: number;
  iconType?: "mobile" | "laptop" | "headphones" | "shoes" | "fan" | "shirt" | "helmet" | "generic";
  createdAt: string;
}

const STORAGE_KEY = "nexora_inventory_stock_data";

export const initialInventory: InventoryItem[] = [
  {
    id: "#PRD0020",
    code: "#PRD0020",
    product: "Apple iPhone 15",
    sku: "APP-PH-15",
    warehouse: "Smart Stock Hub",
    category: "Smartphones",
    brand: "Apple",
    unit: "Piece",
    quantity: 2,
    iconType: "mobile",
    createdAt: "2026-01-20",
  },
  {
    id: "#PRD0019",
    code: "#PRD0019",
    product: "Dell XPS 13 9310",
    sku: "DEL-LAP-9310",
    warehouse: "Flow Grid Storage",
    category: "Computers",
    brand: "Dell",
    unit: "Piece",
    quantity: 12,
    iconType: "laptop",
    createdAt: "2026-01-18",
  },
  {
    id: "#PRD0018",
    code: "#PRD0018",
    product: "Bose QuietComfort 45",
    sku: "BOS-HD-45",
    warehouse: "Prime Storage Solutions",
    category: "Headphones",
    brand: "Bose",
    unit: "Piece",
    quantity: 15,
    iconType: "headphones",
    createdAt: "2026-01-15",
  },
  {
    id: "#PRD0017",
    code: "#PRD0017",
    product: "Adidas Running Shoe",
    sku: "ADI-SHO-RUN",
    warehouse: "Global Supply Depot",
    category: "Footwear",
    brand: "Adidas",
    unit: "Pack",
    quantity: 20,
    iconType: "shoes",
    createdAt: "2026-01-12",
  },
  {
    id: "#PRD0016",
    code: "#PRD0016",
    product: "Dyson Vacuum Cleaner",
    sku: "DYS-VC-100",
    warehouse: "Silverline Storage",
    category: "Appliances",
    brand: "Dyson",
    unit: "Piece",
    quantity: 8,
    iconType: "fan",
    createdAt: "2026-01-10",
  },
  {
    id: "#PRD0015",
    code: "#PRD0015",
    product: "Apple AirPods Pro",
    sku: "APP-EAR-PRO",
    warehouse: "Nova Storage Hub",
    category: "Headphones",
    brand: "Apple",
    unit: "Piece",
    quantity: 25,
    iconType: "headphones",
    createdAt: "2026-01-08",
  },
  {
    id: "#PRD0014",
    code: "#PRD0014",
    product: "Levi's Original Fit Jeans",
    sku: "LEV-JEA-001",
    warehouse: "Riverfront Depot",
    category: "Apparel",
    brand: "Levi",
    unit: "Piece",
    quantity: 13,
    iconType: "shirt",
    createdAt: "2026-01-05",
  },
  {
    id: "#PRD0013",
    code: "#PRD0013",
    product: "Giro Synthe Helmet",
    sku: "GIR-HEL-01",
    warehouse: "Grand Avenue Depot",
    category: "Accessories",
    brand: "Giro",
    unit: "Piece",
    quantity: 6,
    iconType: "helmet",
    createdAt: "2026-01-03",
  },
  {
    id: "#PRD0012",
    code: "#PRD0012",
    product: "OnePlus 11 5G",
    sku: "ONE-PH-11",
    warehouse: "Edge Ware Solutions",
    category: "Smartphones",
    brand: "Oneplus",
    unit: "Piece",
    quantity: 3,
    iconType: "mobile",
    createdAt: "2026-01-02",
  },
  {
    id: "#PRD0011",
    code: "#PRD0011",
    product: "HP Spectre x360 14",
    sku: "HP-LAP-36014",
    warehouse: "Riverbend Storage",
    category: "Computers",
    brand: "HP",
    unit: "Piece",
    quantity: 10,
    iconType: "laptop",
    createdAt: "2026-01-01",
  },
];

export function getStoredInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialInventory));
      return initialInventory;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialInventory));
      return initialInventory;
    }
    return parsed;
  } catch {
    return initialInventory;
  }
}

export function saveStoredInventory(items: InventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("nexora_inventory_updated"));
  } catch (err) {
    console.error("Failed to save inventory to localStorage", err);
  }
}

export function addStoredInventoryItem(
  product: string,
  sku: string,
  warehouse: string,
  category: string,
  brand: string,
  unit: string = "Piece",
  quantity: number = 1
): InventoryItem {
  const current = getStoredInventory();
  const nextNum = current.length + 21;
  const newCode = `#PRD00${nextNum < 100 ? nextNum : nextNum}`;

  const newItem: InventoryItem = {
    id: newCode,
    code: newCode,
    product,
    sku,
    warehouse,
    category,
    brand,
    unit,
    quantity: Number(quantity) || 0,
    iconType: "generic",
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newItem, ...current];
  saveStoredInventory(updated);
  return newItem;
}

export function updateStoredInventoryItem(
  id: string,
  updates: Partial<Omit<InventoryItem, "id" | "code">>
): InventoryItem | null {
  const current = getStoredInventory();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  current[index] = { ...current[index], ...updates };
  saveStoredInventory([...current]);
  return current[index];
}

export function deleteStoredInventoryItem(id: string): boolean {
  const current = getStoredInventory();
  const filtered = current.filter((item) => item.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredInventory(filtered);
  return true;
}

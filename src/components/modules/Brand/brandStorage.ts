export interface BrandItem {
  id: string;
  name: string;
  productCount: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

const BRAND_STORAGE_KEY = "nexora_erp_brands_v1";

export const initialBrands: BrandItem[] = [
  {
    id: "brand-1",
    name: "Apple",
    productCount: 30,
    status: "Active",
    createdAt: "2026-01-01",
  },
  {
    id: "brand-2",
    name: "Dell",
    productCount: 40,
    status: "Active",
    createdAt: "2026-01-02",
  },
  {
    id: "brand-3",
    name: "Bose",
    productCount: 60,
    status: "Active",
    createdAt: "2026-01-03",
  },
  {
    id: "brand-4",
    name: "Adidas",
    productCount: 80,
    status: "Active",
    createdAt: "2026-01-04",
  },
  {
    id: "brand-5",
    name: "Dyson",
    productCount: 120,
    status: "Active",
    createdAt: "2026-01-05",
  },
  {
    id: "brand-6",
    name: "Samsung",
    productCount: 25,
    status: "Active",
    createdAt: "2026-01-06",
  },
  {
    id: "brand-7",
    name: "Levi",
    productCount: 13,
    status: "Active",
    createdAt: "2026-01-07",
  },
  {
    id: "brand-8",
    name: "Giro",
    productCount: 6,
    status: "Active",
    createdAt: "2026-01-08",
  },
  {
    id: "brand-9",
    name: "Oneplus",
    productCount: 3,
    status: "Active",
    createdAt: "2026-01-09",
  },
  {
    id: "brand-10",
    name: "HP",
    productCount: 10,
    status: "Active",
    createdAt: "2026-01-10",
  },
  {
    id: "brand-11",
    name: "Nike",
    productCount: 45,
    status: "Active",
    createdAt: "2026-01-11",
  },
  {
    id: "brand-12",
    name: "Puma",
    productCount: 22,
    status: "Active",
    createdAt: "2026-01-12",
  },
  {
    id: "brand-13",
    name: "Zara",
    productCount: 18,
    status: "Active",
    createdAt: "2026-01-13",
  },
];

export const getStoredBrands = (): BrandItem[] => {
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(initialBrands));
      return initialBrands;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(initialBrands));
    return initialBrands;
  } catch {
    return initialBrands;
  }
};

export const saveStoredBrands = (brands: BrandItem[]): void => {
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brands));
    window.dispatchEvent(new Event("nexora_brands_updated"));
  } catch (e) {
    console.error("Error saving brands", e);
  }
};

export const addStoredBrand = (
  name: string,
  status: "Active" | "Inactive" = "Active",
  productCount: number = 0
): BrandItem => {
  const current = getStoredBrands();
  const newBrand: BrandItem = {
    id: `brand-${Date.now()}`,
    name: name.trim(),
    productCount,
    status,
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updated = [newBrand, ...current];
  saveStoredBrands(updated);
  return newBrand;
};

export const updateStoredBrand = (
  id: string,
  updates: Partial<BrandItem>
): BrandItem | null => {
  const current = getStoredBrands();
  const index = current.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const item = current[index];
  const updatedItem: BrandItem = {
    ...item,
    ...updates,
  };
  current[index] = updatedItem;
  saveStoredBrands(current);
  return updatedItem;
};

export const deleteStoredBrand = (id: string): boolean => {
  const current = getStoredBrands();
  const filtered = current.filter((b) => b.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredBrands(filtered);
  return true;
};

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  subcategoriesCount: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface SubcategoryItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

const CAT_STORAGE_KEY = "nexora_erp_categories_v3";
const SUBCAT_STORAGE_KEY = "nexora_erp_subcategories_v3";

export const initialCategories: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Sofa",
    slug: "sofa",
    productCount: 15,
    subcategoriesCount: 0,
    status: "Active",
    createdAt: "2026-01-01",
  },
  {
    id: "cat-2",
    name: "Bade",
    slug: "bade",
    productCount: 20,
    subcategoriesCount: 0,
    status: "Active",
    createdAt: "2026-01-02",
  },
  {
    id: "cat-3",
    name: "Stool",
    slug: "stool",
    productCount: 40,
    subcategoriesCount: 4,
    status: "Active",
    createdAt: "2026-01-03",
  },
  {
    id: "cat-4",
    name: "Kobad",
    slug: "kobad",
    productCount: 35,
    subcategoriesCount: 3,
    status: "Active",
    createdAt: "2026-01-04",
  },
  {
    id: "cat-5",
    name: "WareDroob",
    slug: "waredroob",
    productCount: 50,
    subcategoriesCount: 3,
    status: "Active",
    createdAt: "2026-01-05",
  },
  {
    id: "cat-6",
    name: "Round Tabil",
    slug: "round-tabil",
    productCount: 28,
    subcategoriesCount: 3,
    status: "Active",
    createdAt: "2026-01-06",
  },
];

export const initialSubcategories: SubcategoryItem[] = [
  {
    id: "sub-1",
    name: "Kids Wear",
    categoryId: "cat-4",
    categoryName: "Kobad",
    status: "Active",
    createdAt: "2026-01-01",
  },
  {
    id: "sub-2",
    name: "Accessories",
    categoryId: "cat-3",
    categoryName: "Stool",
    status: "Active",
    createdAt: "2026-01-02",
  },
  {
    id: "sub-3",
    name: "Furniture",
    categoryId: "cat-6",
    categoryName: "Round Tabil",
    status: "Active",
    createdAt: "2026-01-03",
  },
  {
    id: "sub-4",
    name: "Sneakers",
    categoryId: "cat-5",
    categoryName: "WareDroob",
    status: "Active",
    createdAt: "2026-01-04",
  },
  {
    id: "sub-5",
    name: "Kitchen",
    categoryId: "cat-6",
    categoryName: "Round Tabil",
    status: "Active",
    createdAt: "2026-01-05",
  },
  {
    id: "sub-6",
    name: "Sandals",
    categoryId: "cat-5",
    categoryName: "WareDroob",
    status: "Active",
    createdAt: "2026-01-06",
  },
  {
    id: "sub-7",
    name: "Home Decor",
    categoryId: "cat-6",
    categoryName: "Round Tabil",
    status: "Active",
    createdAt: "2026-01-07",
  },
  {
    id: "sub-8",
    name: "Formal Shoes",
    categoryId: "cat-5",
    categoryName: "WareDroob",
    status: "Active",
    createdAt: "2026-01-08",
  },
  {
    id: "sub-9",
    name: "Mobile",
    categoryId: "cat-3",
    categoryName: "Stool",
    status: "Active",
    createdAt: "2026-01-09",
  },
  {
    id: "sub-10",
    name: "Men's Wear",
    categoryId: "cat-4",
    categoryName: "Kobad",
    status: "Active",
    createdAt: "2026-01-10",
  },
  {
    id: "sub-11",
    name: "T-Shirt",
    categoryId: "cat-4",
    categoryName: "Kobad",
    status: "Active",
    createdAt: "2026-01-11",
  },
  {
    id: "sub-12",
    name: "Leather Belt",
    categoryId: "cat-3",
    categoryName: "Stool",
    status: "Active",
    createdAt: "2026-01-12",
  },
  {
    id: "sub-13",
    name: "Smart Watch",
    categoryId: "cat-3",
    categoryName: "Stool",
    status: "Active",
    createdAt: "2026-01-13",
  },
];

// Helper to get Categories with dynamically computed subcategoriesCount
export const getStoredCategories = (): CategoryItem[] => {
  try {
    const raw = localStorage.getItem(CAT_STORAGE_KEY);
    let cats: CategoryItem[] = [];
    if (!raw) {
      localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(initialCategories));
      cats = initialCategories;
    } else {
      const parsed = JSON.parse(raw);
      cats = Array.isArray(parsed) && parsed.length > 0 ? parsed : initialCategories;
    }
    const subs = getStoredSubcategories();
    return cats.map((c) => ({
      ...c,
      subcategoriesCount: subs.filter((s) => s.categoryId === c.id || s.categoryName === c.name)
        .length,
    }));
  } catch {
    return initialCategories;
  }
};

export const saveStoredCategories = (categories: CategoryItem[]): void => {
  try {
    localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event("nexora_categories_updated"));
  } catch (e) {
    console.error("Error saving categories", e);
  }
};

export const addStoredCategory = (
  name: string,
  status: "Active" | "Inactive" = "Active"
): CategoryItem => {
  const current = getStoredCategories();
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const newCat: CategoryItem = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    slug,
    productCount: 0,
    subcategoriesCount: 0,
    status,
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updated = [...current, newCat];
  saveStoredCategories(updated);
  return newCat;
};

export const updateStoredCategory = (
  id: string,
  updates: Partial<CategoryItem>
): CategoryItem | null => {
  const current = getStoredCategories();
  const index = current.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const item = current[index];
  const updatedItem: CategoryItem = {
    ...item,
    ...updates,
    slug: updates.name ? updates.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") : item.slug,
  };
  current[index] = updatedItem;
  saveStoredCategories(current);
  return updatedItem;
};

export const deleteStoredCategory = (id: string): boolean => {
  const current = getStoredCategories();
  const filtered = current.filter((c) => c.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredCategories(filtered);
  return true;
};

// Helper to get Subcategories
export const getStoredSubcategories = (): SubcategoryItem[] => {
  try {
    const raw = localStorage.getItem(SUBCAT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUBCAT_STORAGE_KEY, JSON.stringify(initialSubcategories));
      return initialSubcategories;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    localStorage.setItem(SUBCAT_STORAGE_KEY, JSON.stringify(initialSubcategories));
    return initialSubcategories;
  } catch {
    return initialSubcategories;
  }
};

export const saveStoredSubcategories = (subs: SubcategoryItem[]): void => {
  try {
    localStorage.setItem(SUBCAT_STORAGE_KEY, JSON.stringify(subs));
    window.dispatchEvent(new Event("nexora_categories_updated"));
  } catch (e) {
    console.error("Error saving subcategories", e);
  }
};

export const addStoredSubcategory = (
  name: string,
  categoryId: string,
  status: "Active" | "Inactive" = "Active"
): SubcategoryItem => {
  const current = getStoredSubcategories();
  const categories = getStoredCategories();
  const parent = categories.find((c) => c.id === categoryId);
  const newSub: SubcategoryItem = {
    id: `sub-${Date.now()}`,
    name: name.trim(),
    categoryId,
    categoryName: parent?.name || "General",
    status,
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updated = [...current, newSub];
  saveStoredSubcategories(updated);

  // Update parent subcategory count
  if (parent) {
    updateStoredCategory(parent.id, {
      subcategoriesCount: (parent.subcategoriesCount || 0) + 1,
    });
  }

  return newSub;
};

export const updateStoredSubcategory = (
  id: string,
  updates: Partial<SubcategoryItem>
): SubcategoryItem | null => {
  const current = getStoredSubcategories();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return null;
  const item = current[index];
  const updatedItem = { ...item, ...updates };
  current[index] = updatedItem;
  saveStoredSubcategories(current);
  return updatedItem;
};

export const deleteStoredSubcategory = (id: string): boolean => {
  const current = getStoredSubcategories();
  const filtered = current.filter((s) => s.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredSubcategories(filtered);
  return true;
};

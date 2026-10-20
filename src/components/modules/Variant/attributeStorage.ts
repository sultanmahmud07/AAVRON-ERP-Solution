export interface AttributeItem {
  id: string;
  name: string;
  options: string[];
  status: "Active" | "Inactive";
  createdAt: string;
}

const ATTRIBUTE_STORAGE_KEY = "nexora_erp_attributes_v1";

export const initialAttributes: AttributeItem[] = [
  {
    id: "attr-1",
    name: "Size",
    options: ["S", "M", "L", "XL"],
    status: "Active",
    createdAt: "2026-01-01",
  },
  {
    id: "attr-2",
    name: "Color",
    options: ["Red", "Green", "Purpel"],
    status: "Active",
    createdAt: "2026-01-02",
  },
];

export const getStoredAttributes = (): AttributeItem[] => {
  try {
    const raw = localStorage.getItem(ATTRIBUTE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ATTRIBUTE_STORAGE_KEY, JSON.stringify(initialAttributes));
      return initialAttributes;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    localStorage.setItem(ATTRIBUTE_STORAGE_KEY, JSON.stringify(initialAttributes));
    return initialAttributes;
  } catch {
    return initialAttributes;
  }
};

export const saveStoredAttributes = (attributes: AttributeItem[]): void => {
  try {
    localStorage.setItem(ATTRIBUTE_STORAGE_KEY, JSON.stringify(attributes));
    window.dispatchEvent(new Event("nexora_attributes_updated"));
  } catch (e) {
    console.error("Error saving attributes", e);
  }
};

export const addStoredAttribute = (
  name: string,
  options: string[] = [],
  status: "Active" | "Inactive" = "Active"
): AttributeItem => {
  const current = getStoredAttributes();
  const newAttr: AttributeItem = {
    id: `attr-${Date.now()}`,
    name: name.trim(),
    options,
    status,
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updated = [...current, newAttr];
  saveStoredAttributes(updated);
  return newAttr;
};

export const updateStoredAttribute = (
  id: string,
  updates: Partial<AttributeItem>
): AttributeItem | null => {
  const current = getStoredAttributes();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const item = current[index];
  const updatedItem: AttributeItem = {
    ...item,
    ...updates,
  };
  current[index] = updatedItem;
  saveStoredAttributes(current);
  return updatedItem;
};

export const deleteStoredAttribute = (id: string): boolean => {
  const current = getStoredAttributes();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredAttributes(filtered);
  return true;
};

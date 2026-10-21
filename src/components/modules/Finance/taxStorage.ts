export type TaxType = "Inclusive" | "Exclusive";
export type TaxStatus = "Active" | "Inactive";

export interface TaxRecord {
  id: string;
  taxId: string; // e.g. #TAX001
  taxName: string; // e.g. GST
  type: TaxType; // e.g. Inclusive
  rate: number; // e.g. 18 (18%)
  appliedTo: string; // e.g. All Sales
  status: TaxStatus;
  description?: string;
  createdAt: string;
}

const STORAGE_KEY = "nexora_finance_taxes_data";
const STORAGE_EVENT = "nexora_finance_taxes_updated";

export const initialTaxes: TaxRecord[] = [
  {
    id: "tax-1",
    taxId: "#TAX001",
    taxName: "GST",
    type: "Inclusive",
    rate: 18,
    appliedTo: "All Sales",
    status: "Active",
    description: "Standard Goods & Services Tax inclusive in product retail shelf price.",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "tax-2",
    taxId: "#TAX002",
    taxName: "VAT",
    type: "Exclusive",
    rate: 20,
    appliedTo: "EU Sales",
    status: "Active",
    description: "European Union Value Added Tax applied at checkout for export orders.",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "tax-3",
    taxId: "#TAX003",
    taxName: "Sales Tax",
    type: "Exclusive",
    rate: 8.25,
    appliedTo: "US Sales",
    status: "Active",
    description: "State level sales tax for retail commerce in selected jurisdictions.",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "tax-4",
    taxId: "#TAX004",
    taxName: "CGST",
    type: "Inclusive",
    rate: 9,
    appliedTo: "Intra-state",
    status: "Active",
    description: "Central Goods and Services Tax for local state apparel supply.",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "tax-5",
    taxId: "#TAX005",
    taxName: "SGST",
    type: "Inclusive",
    rate: 9,
    appliedTo: "Intra-state",
    status: "Active",
    description: "State Goods and Services Tax for domestic orders.",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "tax-6",
    taxId: "#TAX006",
    taxName: "IGST",
    type: "Inclusive",
    rate: 18,
    appliedTo: "Inter-state",
    status: "Active",
    description: "Integrated Goods and Services Tax across regional borders.",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "tax-7",
    taxId: "#TAX007",
    taxName: "Service Tax",
    type: "Inclusive",
    rate: 15,
    appliedTo: "Services Only",
    status: "Inactive",
    description: "Legacy service tax archived for historical accounting reference.",
    createdAt: "2025-01-01T00:00:00Z",
  },
];

export function getStoredTaxes(): TaxRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTaxes));
      return initialTaxes;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return initialTaxes;
  } catch {
    return initialTaxes;
  }
}

export function saveStoredTaxes(items: TaxRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error("Failed to save taxes", err);
  }
}

export function addStoredTax(
  data: Omit<TaxRecord, "id" | "taxId" | "createdAt"> & {
    customId?: string;
  }
): TaxRecord {
  const current = getStoredTaxes();
  let nextIdStr = data.customId;
  if (!nextIdStr) {
    const numericIds = current
      .map((t) => {
        const m = t.taxId.match(/#?TAX0*(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numericIds.length > 0 ? Math.max(...numericIds) : 7;
    nextIdStr = `#TAX${String(maxNum + 1).padStart(3, "0")}`;
  }

  const newRec: TaxRecord = {
    id: `tax-${Date.now()}`,
    taxId: nextIdStr,
    taxName: data.taxName,
    type: data.type,
    rate: data.rate,
    appliedTo: data.appliedTo,
    status: data.status,
    description: data.description,
    createdAt: new Date().toISOString(),
  };

  const updated = [newRec, ...current];
  saveStoredTaxes(updated);
  return newRec;
}

export function updateStoredTax(
  id: string,
  updates: Partial<Omit<TaxRecord, "id">>
): TaxRecord | null {
  const current = getStoredTaxes();
  const idx = current.findIndex((t) => t.id === id || t.taxId === id);
  if (idx === -1) return null;

  const updatedRec = { ...current[idx], ...updates };
  current[idx] = updatedRec;
  saveStoredTaxes(current);
  return updatedRec;
}

export function deleteStoredTax(id: string): boolean {
  const current = getStoredTaxes();
  const filtered = current.filter((t) => t.id !== id && t.taxId !== id);
  if (filtered.length === current.length) return false;
  saveStoredTaxes(filtered);
  return true;
}

export const APPLIED_TO_OPTIONS = [
  "All Sales",
  "EU Sales",
  "US Sales",
  "Intra-state",
  "Inter-state",
  "Services Only",
  "Retail Only",
  "Wholesale Only",
];

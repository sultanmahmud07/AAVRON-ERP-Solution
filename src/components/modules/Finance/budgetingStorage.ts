export interface BudgetRecord {
  id: string;
  budgetId: string; // e.g. #BG0020
  category: string; // e.g. Office Supplies
  period: string; // e.g. Q2 2026
  budget: number; // e.g. 15000
  spent: number; // e.g. 12500
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = "nexora_finance_budgeting_data";
const STORAGE_EVENT = "nexora_finance_budgeting_updated";

export const initialBudgets: BudgetRecord[] = [
  {
    id: "bg-20",
    budgetId: "#BG0020",
    category: "Office Supplies",
    period: "Q2 2026",
    budget: 15000,
    spent: 12500,
    notes: "Paper, printing cartridges, stationery, and packing tapes.",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "bg-19",
    budgetId: "#BG0019",
    category: "Marketing",
    period: "Q2 2026",
    budget: 50000,
    spent: 48200,
    notes: "Social media ads, billboard campaigns, and influencer sponsorships.",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "bg-18",
    budgetId: "#BG0018",
    category: "Travel",
    period: "Q2 2026",
    budget: 25000,
    spent: 28500,
    notes: "International garment trade fair in Milan and buyer visits.",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "bg-17",
    budgetId: "#BG0017",
    category: "IT Services",
    period: "Q2 2026",
    budget: 40000,
    spent: 30800,
    notes: "Server hosting, cloud storage, and cyber-security audit.",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "bg-16",
    budgetId: "#BG0016",
    category: "Utilities",
    period: "Q2 2026",
    budget: 20000,
    spent: 15400,
    notes: "Electricity, commercial water, generator diesel fuel, and fiber internet.",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "bg-15",
    budgetId: "#BG0015",
    category: "Rent",
    period: "Q2 2026",
    budget: 45000,
    spent: 45000,
    notes: "HQ office & central warehouse lease quarterly installment.",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "bg-14",
    budgetId: "#BG0014",
    category: "Training",
    period: "Q2 2026",
    budget: 30000,
    spent: 12800,
    notes: "Apparel quality control workshop and inventory software training.",
    createdAt: "2026-04-01T09:00:00Z",
  },
];

export function getStoredBudgets(): BudgetRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBudgets));
      return initialBudgets;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return initialBudgets;
  } catch {
    return initialBudgets;
  }
}

export function saveStoredBudgets(items: BudgetRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error("Failed to save budgeting", err);
  }
}

export function addStoredBudget(
  data: Omit<BudgetRecord, "id" | "budgetId" | "createdAt" | "spent"> & {
    spent?: number;
    customId?: string;
  }
): BudgetRecord {
  const current = getStoredBudgets();
  let nextIdStr = data.customId;
  if (!nextIdStr) {
    const numericIds = current
      .map((b) => {
        const m = b.budgetId.match(/#?BG0*(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numericIds.length > 0 ? Math.max(...numericIds) : 20;
    nextIdStr = `#BG00${maxNum + 1}`;
  }

  const newRec: BudgetRecord = {
    id: `bg-${Date.now()}`,
    budgetId: nextIdStr,
    category: data.category,
    period: data.period,
    budget: data.budget,
    spent: data.spent || 0,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  const updated = [newRec, ...current];
  saveStoredBudgets(updated);
  return newRec;
}

export function updateStoredBudget(
  id: string,
  updates: Partial<Omit<BudgetRecord, "id">>
): BudgetRecord | null {
  const current = getStoredBudgets();
  const idx = current.findIndex((b) => b.id === id || b.budgetId === id);
  if (idx === -1) return null;

  const updatedRec = { ...current[idx], ...updates };
  current[idx] = updatedRec;
  saveStoredBudgets(current);
  return updatedRec;
}

export function deleteStoredBudget(id: string): boolean {
  const current = getStoredBudgets();
  const filtered = current.filter((b) => b.id !== id && b.budgetId !== id);
  if (filtered.length === current.length) return false;
  saveStoredBudgets(filtered);
  return true;
}

export const BUDGET_CATEGORIES = [
  "Office Supplies",
  "Marketing",
  "Travel",
  "IT Services",
  "Utilities",
  "Rent",
  "Training",
  "Logistics & Shipping",
  "Equipment Maintenance",
  "Legal & Professional",
];

export const BUDGET_PERIODS = [
  "Q1 2026",
  "Q2 2026",
  "Q3 2026",
  "Q4 2026",
  "Annual 2026",
  "Monthly",
];

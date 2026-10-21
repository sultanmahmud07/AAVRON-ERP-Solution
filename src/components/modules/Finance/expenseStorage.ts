export interface ExpenseRecord {
  id: string;
  expenseId: string;       // e.g. #EXP0020
  name: string;            // e.g. Stationery Purchase
  category: string;        // e.g. Office Supplies
  categorySlug?: string;   // e.g. office-supplies
  amount: number;          // e.g. 10000
  paymentMethod: string;   // Cash, Credit Card, Debit Card, UPI, Bank Transfer
  date: string;            // e.g. 11 Sep 2025
  status: "Paid" | "Pending" | "Approved";
  description?: string;
  createdAt: string;
}

export interface ExpenseCategoryRecord {
  id: string;
  code: string;            // e.g. #EC001
  name: string;            // e.g. Office Supplies
  slug: string;            // e.g. office-supplies
  description: string;     // e.g. Stationery, paper, printing
  createdOn: string;       // e.g. 11 Sep 2025
  status: "Active" | "Inactive";
}

const STORAGE_KEY_EXPENSES = "nexora_expenses_data_v1";
const STORAGE_KEY_EXPENSE_CATEGORIES = "nexora_expense_categories_data_v1";
const STORAGE_EVENT_EXPENSES = "nexora_expenses_updated";
const STORAGE_EVENT_EXPENSE_CATEGORIES = "nexora_expense_categories_updated";

// Seed data matching user's Image 1 exactly
export const initialExpenses: ExpenseRecord[] = [
  {
    id: "exp-020",
    expenseId: "#EXP0020",
    name: "Stationery Purchase",
    category: "Office Supplies",
    categorySlug: "office-supplies",
    amount: 10000,
    paymentMethod: "Cash",
    date: "11 Sep 2025",
    status: "Paid",
    createdAt: "2025-09-11",
  },
  {
    id: "exp-019",
    expenseId: "#EXP0019",
    name: "Sales Team Flights",
    category: "Travel",
    categorySlug: "travel",
    amount: 5000,
    paymentMethod: "Credit Card",
    date: "05 Sep 2025",
    status: "Paid",
    createdAt: "2025-09-05",
  },
  {
    id: "exp-018",
    expenseId: "#EXP0018",
    name: "Utility Bill",
    category: "Utilities",
    categorySlug: "utilities",
    amount: 25000,
    paymentMethod: "Debit Card",
    date: "27 Aug 2025",
    status: "Paid",
    createdAt: "2025-08-27",
  },
  {
    id: "exp-017",
    expenseId: "#EXP0017",
    name: "Office Rent",
    category: "Rent",
    categorySlug: "rent",
    amount: 15500,
    paymentMethod: "UPI",
    date: "16 Aug 2025",
    status: "Paid",
    createdAt: "2025-08-16",
  },
  {
    id: "exp-016",
    expenseId: "#EXP0016",
    name: "Google Ad Campaign",
    category: "Marketing",
    categorySlug: "marketing",
    amount: 34000,
    paymentMethod: "Bank Transfer",
    date: "25 Jul 2025",
    status: "Pending",
    createdAt: "2025-07-25",
  },
  {
    id: "exp-015",
    expenseId: "#EXP0015",
    name: "Cloud Hosting Fees",
    category: "IT Services",
    categorySlug: "it-services",
    amount: 28000,
    paymentMethod: "Cash",
    date: "12 Jul 2025",
    status: "Approved",
    createdAt: "2025-07-12",
  },
  {
    id: "exp-014",
    expenseId: "#EXP0014",
    name: "Local Transport",
    category: "Travel",
    categorySlug: "travel",
    amount: 145000,
    paymentMethod: "Credit Card",
    date: "23 Jun 2025",
    status: "Paid",
    createdAt: "2025-06-23",
  },
  {
    id: "exp-013",
    expenseId: "#EXP0013",
    name: "Leadership Training",
    category: "Employee Training",
    categorySlug: "employee-training",
    amount: 270000,
    paymentMethod: "Debit Card",
    date: "07 Jun 2025",
    status: "Pending",
    createdAt: "2025-06-07",
  },
];

// Seed data matching user's Image 3 exactly
export const initialExpenseCategories: ExpenseCategoryRecord[] = [
  {
    id: "ec-001",
    code: "#EC001",
    name: "Office Supplies",
    slug: "office-supplies",
    description: "Stationery, paper, printing",
    createdOn: "11 Sep 2025",
    status: "Active",
  },
  {
    id: "ec-002",
    code: "#EC002",
    name: "Travel",
    slug: "travel",
    description: "Flights, taxi, hotel",
    createdOn: "05 Sep 2025",
    status: "Active",
  },
  {
    id: "ec-003",
    code: "#EC003",
    name: "Utilities",
    slug: "utilities",
    description: "Electricity, water, internet",
    createdOn: "27 Aug 2025",
    status: "Active",
  },
  {
    id: "ec-004",
    code: "#EC004",
    name: "Rent",
    slug: "rent",
    description: "Office and warehouse rent",
    createdOn: "16 Aug 2025",
    status: "Active",
  },
  {
    id: "ec-005",
    code: "#EC005",
    name: "Marketing",
    slug: "marketing",
    description: "Ads, campaigns, PR",
    createdOn: "25 Jul 2025",
    status: "Active",
  },
  {
    id: "ec-006",
    code: "#EC006",
    name: "IT Services",
    slug: "it-services",
    description: "Software, hosting, licenses",
    createdOn: "12 Jul 2025",
    status: "Active",
  },
  {
    id: "ec-007",
    code: "#EC007",
    name: "Employee Training",
    slug: "employee-training",
    description: "Courses, workshops",
    createdOn: "23 Jun 2025",
    status: "Inactive",
  },
];

// Helper to get stored expenses
export function getStoredExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(initialExpenses));
      return initialExpenses;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(initialExpenses));
      return initialExpenses;
    }
    return parsed;
  } catch {
    return initialExpenses;
  }
}

// Helper to save expenses
export function saveStoredExpenses(list: ExpenseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(list));
    window.dispatchEvent(new Event(STORAGE_EVENT_EXPENSES));
  } catch (err) {
    console.error("Failed to save expenses to localStorage", err);
  }
}

// Add a new expense
export function addStoredExpense(
  record: Omit<ExpenseRecord, "id" | "expenseId" | "createdAt">
): ExpenseRecord {
  const current = getStoredExpenses();
  const nextNum = current.length + 21;
  const expNum = `#EXP00${nextNum < 10 ? `0${nextNum}` : nextNum}`;

  const newRecord: ExpenseRecord = {
    ...record,
    id: `exp-${Date.now()}`,
    expenseId: expNum,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newRecord, ...current];
  saveStoredExpenses(updated);
  return newRecord;
}

// Update existing expense
export function updateStoredExpense(
  id: string,
  updates: Partial<ExpenseRecord>
): ExpenseRecord | null {
  const current = getStoredExpenses();
  const idx = current.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  current[idx] = { ...current[idx], ...updates };
  saveStoredExpenses([...current]);
  return current[idx];
}

// Delete expense
export function deleteStoredExpense(id: string): boolean {
  const current = getStoredExpenses();
  const filtered = current.filter((e) => e.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredExpenses(filtered);
  return true;
}

// ====================== EXPENSE CATEGORIES ======================
export function getStoredExpenseCategories(): ExpenseCategoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSE_CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EXPENSE_CATEGORIES, JSON.stringify(initialExpenseCategories));
      return initialExpenseCategories;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_EXPENSE_CATEGORIES, JSON.stringify(initialExpenseCategories));
      return initialExpenseCategories;
    }
    return parsed;
  } catch {
    return initialExpenseCategories;
  }
}

export function saveStoredExpenseCategories(list: ExpenseCategoryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSE_CATEGORIES, JSON.stringify(list));
    window.dispatchEvent(new Event(STORAGE_EVENT_EXPENSE_CATEGORIES));
  } catch (err) {
    console.error("Failed to save expense categories to localStorage", err);
  }
}

export function addStoredExpenseCategory(
  record: Omit<ExpenseCategoryRecord, "id" | "code">
): ExpenseCategoryRecord {
  const current = getStoredExpenseCategories();
  const nextNum = current.length + 1;
  const code = `#EC00${nextNum < 10 ? `0${nextNum}` : nextNum}`;

  const newRecord: ExpenseCategoryRecord = {
    ...record,
    id: `ec-${Date.now()}`,
    code,
  };

  const updated = [newRecord, ...current];
  saveStoredExpenseCategories(updated);
  return newRecord;
}

export function updateStoredExpenseCategory(
  id: string,
  updates: Partial<ExpenseCategoryRecord>
): ExpenseCategoryRecord | null {
  const current = getStoredExpenseCategories();
  const idx = current.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  current[idx] = { ...current[idx], ...updates };
  saveStoredExpenseCategories([...current]);
  return current[idx];
}

export function deleteStoredExpenseCategory(id: string): boolean {
  const current = getStoredExpenseCategories();
  const filtered = current.filter((c) => c.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredExpenseCategories(filtered);
  return true;
}

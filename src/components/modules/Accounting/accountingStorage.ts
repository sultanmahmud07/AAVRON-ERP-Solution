export interface AccountRecord {
  id: string;
  accountNumber: string; // e.g. 1701570001814, 123231321213, CASH001
  accountName: string;   // e.g. Islami Bank PLC, Bkash, Cash Account
  type: "Cash" | "Bank" | "MFS";
  branch?: string;       // e.g. Narsingdi, --
  openingBalance: number;
  currentBalance: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface AccountAdjustmentRecord {
  id: string;
  accountId: string;
  accountName: string;
  accountNumber: string;
  date: string;          // e.g. 21/10/2026
  amount: number;
  type: "Credit (++)" | "Debit (--)";
  reason?: string;
  createdAt: string;
}

export interface BalanceTransferRecord {
  id: string;
  fromAccountId: string;
  fromAccountName: string;
  fromAccountNumber?: string;
  toAccountId: string;
  toAccountName: string;
  toAccountNumber?: string;
  amount: number;
  charge: number;        // fee
  netAmount: number;
  transferBy: string;    // e.g. Admin
  date: string;          // e.g. 21/10/2026
  reason?: string;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  date: string;          // e.g. 21/10/2026
  accountId: string;
  accountName: string;
  accountNumber: string;
  amount: number;
  type: "Credit (++)" | "Debit (--)";
  transactionId?: string; // e.g. 6767565, 53434343, or --
  description: string;
  sourceType?: "Adjustment" | "Transfer" | "Invoice" | "Manual";
  referenceId?: string;
  createdAt: string;
}

const STORAGE_KEY_ACCOUNTS = "nexora_accounts_data_v1";
const STORAGE_KEY_ADJUSTMENTS = "nexora_account_adjustments_data_v1";
const STORAGE_KEY_TRANSFERS = "nexora_balance_transfers_data_v1";
const STORAGE_KEY_TRANSACTIONS = "nexora_transactions_data_v1";

const STORAGE_EVENT_ACCOUNTING = "nexora_accounting_updated";

// Initial Accounts matching user reference Image 1
export const initialAccounts: AccountRecord[] = [
  {
    id: "acc-001",
    accountNumber: "1701570001814",
    accountName: "Islami Bank PLC",
    type: "MFS",
    branch: "Narsingdi",
    openingBalance: 0.0,
    currentBalance: 250299.75,
    status: "Active",
    createdAt: "2026-01-10",
  },
  {
    id: "acc-002",
    accountNumber: "123231321213",
    accountName: "Bkash",
    type: "MFS",
    branch: "--",
    openingBalance: 0.0,
    currentBalance: 3040.0,
    status: "Active",
    createdAt: "2026-01-15",
  },
  {
    id: "acc-003",
    accountNumber: "CASH001",
    accountName: "Cash Account",
    type: "Cash",
    branch: "--",
    openingBalance: 150000.01,
    currentBalance: 249246.01,
    status: "Active",
    createdAt: "2026-01-01",
  },
];

// Initial Adjustments matching user reference Image 3
export const initialAdjustments: AccountAdjustmentRecord[] = [
  {
    id: "adj-001",
    accountId: "acc-002",
    accountName: "Bkash",
    accountNumber: "123231321213",
    date: "21/10/2026",
    amount: 40.0,
    type: "Credit (++)",
    reason: "efdfs",
    createdAt: "2026-10-21",
  },
];

// Initial Balance Transfers matching user reference Image 5
export const initialTransfers: BalanceTransferRecord[] = [
  {
    id: "trans-001",
    fromAccountId: "acc-002",
    fromAccountName: "Bkash",
    fromAccountNumber: "123231321213",
    toAccountId: "acc-001",
    toAccountName: "Islami Bank PLC",
    toAccountNumber: "1701570001814",
    amount: 500.0,
    charge: 0.0,
    netAmount: 500.0,
    transferBy: "Admin",
    date: "21/10/2026",
    reason: "Fund rebalancing for settlement",
    createdAt: "2026-10-21",
  },
];

// Initial Transactions matching user reference Image (transaction_history.png)
export const initialTransactions: TransactionRecord[] = [
  {
    id: "tx-001",
    date: "21/10/2026",
    accountId: "acc-002",
    accountName: "Bkash",
    accountNumber: "123231321213",
    amount: 40.0,
    type: "Credit (++)",
    transactionId: "--",
    description: "efdfs",
    sourceType: "Adjustment",
    createdAt: "2026-10-21",
  },
  {
    id: "tx-002",
    date: "21/10/2026",
    accountId: "acc-003",
    accountName: "Cash Account",
    accountNumber: "CASH001",
    amount: 1600.0,
    type: "Credit (++)",
    transactionId: "--",
    description: "Payment for POS Invoice #INV-0017",
    sourceType: "Invoice",
    createdAt: "2026-10-21",
  },
  {
    id: "tx-003",
    date: "19/10/2026",
    accountId: "acc-002",
    accountName: "Bkash",
    accountNumber: "123231321213",
    amount: 2500.0,
    type: "Credit (++)",
    transactionId: "6767565",
    description: "Payment for invoice #INV-0013",
    sourceType: "Invoice",
    createdAt: "2026-10-19",
  },
  {
    id: "tx-004",
    date: "19/10/2026",
    accountId: "acc-003",
    accountName: "Cash Account",
    accountNumber: "CASH001",
    amount: 1430.0,
    type: "Debit (--)",
    transactionId: "--",
    description: "Refund for sales return on invoice #INV-0016",
    sourceType: "Invoice",
    createdAt: "2026-10-19",
  },
  {
    id: "tx-005",
    date: "19/10/2026",
    accountId: "acc-003",
    accountName: "Cash Account",
    accountNumber: "CASH001",
    amount: 1430.0,
    type: "Credit (++)",
    transactionId: "--",
    description: "Payment for invoice #INV-0016",
    sourceType: "Invoice",
    createdAt: "2026-10-19",
  },
  {
    id: "tx-006",
    date: "19/10/2026",
    accountId: "acc-002",
    accountName: "Bkash",
    accountNumber: "123231321213",
    amount: 540.0,
    type: "Credit (++)",
    transactionId: "53434343",
    description: "Payment for POS Invoice #INV-0015",
    sourceType: "Invoice",
    createdAt: "2026-10-19",
  },
  {
    id: "tx-007",
    date: "19/10/2026",
    accountId: "acc-003",
    accountName: "Cash Account",
    accountNumber: "CASH001",
    amount: 3500.0,
    type: "Credit (++)",
    transactionId: "--",
    description: "Payment for POS Invoice #INV-0014",
    sourceType: "Invoice",
    createdAt: "2026-10-19",
  },
  {
    id: "tx-008",
    date: "17/10/2026",
    accountId: "acc-003",
    accountName: "Cash Account",
    accountNumber: "CASH001",
    amount: 500.0,
    type: "Credit (++)",
    transactionId: "--",
    description: "Payment for POS Invoice #INV-0012",
    sourceType: "Invoice",
    createdAt: "2026-10-17",
  },
  {
    id: "tx-009",
    date: "14/10/2026",
    accountId: "acc-003",
    accountName: "Cash Account",
    accountNumber: "CASH001",
    amount: 20000.0,
    type: "Debit (--)",
    transactionId: "--",
    description: "Refund for sales return on invoice #INV-0003",
    sourceType: "Invoice",
    createdAt: "2026-10-14",
  },
  {
    id: "tx-010",
    date: "11/10/2026",
    accountId: "acc-003",
    accountName: "Cash Account",
    accountNumber: "CASH001",
    amount: 163080.0,
    type: "Credit (++)",
    transactionId: "--",
    description: "Payment for POS Invoice #INV-0011",
    sourceType: "Invoice",
    createdAt: "2026-10-11",
  },
  {
    id: "tx-011",
    date: "10/10/2026",
    accountId: "acc-001",
    accountName: "Islami Bank PLC",
    accountNumber: "1701570001814",
    amount: 75000.0,
    type: "Credit (++)",
    transactionId: "TX-BANK-1001",
    description: "Direct bank deposit from client",
    sourceType: "Manual",
    createdAt: "2026-10-10",
  },
];

// Dispatch event helper
function dispatchAccountingUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_EVENT_ACCOUNTING));
  }
}

// ====================== ACCOUNTS STORAGE ======================
export function getStoredAccounts(): AccountRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initialAccounts));
      return initialAccounts;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initialAccounts));
      return initialAccounts;
    }
    return parsed;
  } catch {
    return initialAccounts;
  }
}

export function saveStoredAccounts(list: AccountRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(list));
    dispatchAccountingUpdate();
  } catch (err) {
    console.error("Failed to save accounts", err);
  }
}

export function addStoredAccount(
  record: Omit<AccountRecord, "id" | "createdAt" | "currentBalance"> & { currentBalance?: number }
): AccountRecord {
  const current = getStoredAccounts();
  const newRecord: AccountRecord = {
    ...record,
    id: `acc-${Date.now()}`,
    currentBalance: typeof record.currentBalance === "number" ? record.currentBalance : record.openingBalance,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [...current, newRecord];
  saveStoredAccounts(updated);
  return newRecord;
}

export function updateStoredAccount(
  id: string,
  updates: Partial<AccountRecord>
): AccountRecord | null {
  const current = getStoredAccounts();
  const idx = current.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  current[idx] = { ...current[idx], ...updates };
  saveStoredAccounts([...current]);
  return current[idx];
}

export function deleteStoredAccount(id: string): boolean {
  const current = getStoredAccounts();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredAccounts(filtered);
  return true;
}

// ====================== ADJUSTMENTS STORAGE ======================
export function getStoredAdjustments(): AccountAdjustmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADJUSTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ADJUSTMENTS, JSON.stringify(initialAdjustments));
      return initialAdjustments;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_ADJUSTMENTS, JSON.stringify(initialAdjustments));
      return initialAdjustments;
    }
    return parsed;
  } catch {
    return initialAdjustments;
  }
}

export function saveStoredAdjustments(list: AccountAdjustmentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADJUSTMENTS, JSON.stringify(list));
    dispatchAccountingUpdate();
  } catch (err) {
    console.error("Failed to save adjustments", err);
  }
}

export function addStoredAdjustment(
  record: Omit<AccountAdjustmentRecord, "id" | "createdAt">
): AccountAdjustmentRecord {
  const current = getStoredAdjustments();
  const newRecord: AccountAdjustmentRecord = {
    ...record,
    id: `adj-${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
  };

  // Automatically update the account's current balance
  const accounts = getStoredAccounts();
  const accIndex = accounts.findIndex((a) => a.id === record.accountId || a.accountName === record.accountName);
  if (accIndex !== -1) {
    const delta = record.type === "Credit (++)" ? record.amount : -record.amount;
    accounts[accIndex].currentBalance = Math.round((accounts[accIndex].currentBalance + delta) * 100) / 100;
    saveStoredAccounts(accounts);
  }

  // Automatically add transaction history log
  addStoredTransaction({
    date: record.date,
    accountId: record.accountId,
    accountName: record.accountName,
    accountNumber: record.accountNumber,
    amount: record.amount,
    type: record.type,
    transactionId: "--",
    description: record.reason || `Manual balance adjustment (${record.type})`,
    sourceType: "Adjustment",
  });

  const updated = [newRecord, ...current];
  saveStoredAdjustments(updated);
  return newRecord;
}

export function updateStoredAdjustment(
  id: string,
  updates: Partial<AccountAdjustmentRecord>
): AccountAdjustmentRecord | null {
  const current = getStoredAdjustments();
  const idx = current.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  current[idx] = { ...current[idx], ...updates };
  saveStoredAdjustments([...current]);
  return current[idx];
}

export function deleteStoredAdjustment(id: string): boolean {
  const current = getStoredAdjustments();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredAdjustments(filtered);
  return true;
}

// ====================== TRANSFERS STORAGE ======================
export function getStoredTransfers(): BalanceTransferRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSFERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(initialTransfers));
      return initialTransfers;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(initialTransfers));
      return initialTransfers;
    }
    return parsed;
  } catch {
    return initialTransfers;
  }
}

export function saveStoredTransfers(list: BalanceTransferRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(list));
    dispatchAccountingUpdate();
  } catch (err) {
    console.error("Failed to save transfers", err);
  }
}

export function addStoredTransfer(
  record: Omit<BalanceTransferRecord, "id" | "createdAt">
): BalanceTransferRecord {
  const current = getStoredTransfers();
  const newRecord: BalanceTransferRecord = {
    ...record,
    id: `trans-${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
  };

  // Adjust source and destination accounts
  const accounts = getStoredAccounts();
  const fromIdx = accounts.findIndex((a) => a.id === record.fromAccountId);
  const toIdx = accounts.findIndex((a) => a.id === record.toAccountId);

  if (fromIdx !== -1) {
    const totalDeduction = record.amount + (record.charge || 0);
    accounts[fromIdx].currentBalance = Math.round((accounts[fromIdx].currentBalance - totalDeduction) * 100) / 100;
  }
  if (toIdx !== -1) {
    accounts[toIdx].currentBalance = Math.round((accounts[toIdx].currentBalance + record.netAmount) * 100) / 100;
  }
  saveStoredAccounts(accounts);

  // Automatically record debit transaction on sender
  if (fromIdx !== -1) {
    addStoredTransaction({
      date: record.date,
      accountId: accounts[fromIdx].id,
      accountName: accounts[fromIdx].accountName,
      accountNumber: accounts[fromIdx].accountNumber,
      amount: record.amount,
      type: "Debit (--)",
      transactionId: `--`,
      description: `Transfer to ${record.toAccountName}${record.reason ? ` - ${record.reason}` : ""}`,
      sourceType: "Transfer",
    });
  }

  // Automatically record credit transaction on receiver
  if (toIdx !== -1) {
    addStoredTransaction({
      date: record.date,
      accountId: accounts[toIdx].id,
      accountName: accounts[toIdx].accountName,
      accountNumber: accounts[toIdx].accountNumber,
      amount: record.netAmount,
      type: "Credit (++)",
      transactionId: `--`,
      description: `Transfer from ${record.fromAccountName}${record.reason ? ` - ${record.reason}` : ""}`,
      sourceType: "Transfer",
    });
  }

  const updated = [newRecord, ...current];
  saveStoredTransfers(updated);
  return newRecord;
}

export function deleteStoredTransfer(id: string): boolean {
  const current = getStoredTransfers();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredTransfers(filtered);
  return true;
}

// ====================== TRANSACTIONS STORAGE ======================
export function getStoredTransactions(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(initialTransactions));
      return initialTransactions;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(initialTransactions));
      return initialTransactions;
    }
    return parsed;
  } catch {
    return initialTransactions;
  }
}

export function saveStoredTransactions(list: TransactionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(list));
    dispatchAccountingUpdate();
  } catch (err) {
    console.error("Failed to save transactions", err);
  }
}

export function addStoredTransaction(
  record: Omit<TransactionRecord, "id" | "createdAt">
): TransactionRecord {
  const current = getStoredTransactions();
  const newRecord: TransactionRecord = {
    ...record,
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newRecord, ...current];
  saveStoredTransactions(updated);
  return newRecord;
}

export function updateStoredTransaction(
  id: string,
  updates: Partial<TransactionRecord>
): TransactionRecord | null {
  const current = getStoredTransactions();
  const idx = current.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  current[idx] = { ...current[idx], ...updates };
  saveStoredTransactions([...current]);
  return current[idx];
}

export function deleteStoredTransaction(id: string): boolean {
  const current = getStoredTransactions();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredTransactions(filtered);
  return true;
}

// Helper to format currency in Bangladeshi Taka: ৳ 502 585.76 or standard
export function formatTaka(amount: number): string {
  const parts = amount.toFixed(2).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `৳ ${integerPart}.${parts[1]}`;
}

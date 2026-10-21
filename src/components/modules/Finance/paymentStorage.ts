export type PaymentStatus = "Completed" | "Pending" | "Failed";

export type PaymentMethodType =
  | "Bank Transfer"
  | "UPI"
  | "Credit Card"
  | "Debit Card"
  | "Cash"
  | "Cheque";

export interface PaymentRecord {
  id: string;
  paymentId: string; // e.g. #PAY0020
  payee: string; // e.g. Alpha Supplies Inc
  bank: string; // e.g. Chase Bank
  paymentMethod: PaymentMethodType;
  amount: number; // e.g. 22500
  date: string; // e.g. 11 Sep 2025
  status: PaymentStatus;
  referenceNo?: string;
  accountNumber?: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = "nexora_finance_payments_data";
const STORAGE_EVENT = "nexora_finance_payments_updated";

export const initialPayments: PaymentRecord[] = [
  {
    id: "pay-20",
    paymentId: "#PAY0020",
    payee: "Alpha Supplies Inc",
    bank: "Chase Bank",
    paymentMethod: "Bank Transfer",
    amount: 22500,
    date: "11 Sep 2025",
    status: "Completed",
    referenceNo: "TRX-CHASE-9921",
    accountNumber: "•••• 4821",
    category: "Raw Materials",
    notes: "Batch invoice settlement for textiles and cotton roll supplies.",
    createdAt: "2025-09-11T10:00:00Z",
  },
  {
    id: "pay-19",
    paymentId: "#PAY0019",
    payee: "Beta Logistics Ltd",
    bank: "HSBC",
    paymentMethod: "UPI",
    amount: 15750,
    date: "05 Sep 2025",
    status: "Pending",
    referenceNo: "UPI-HSBC-4819",
    accountNumber: "beta.logistics@upi",
    category: "Freight & Shipping",
    notes: "Port clearance and container logistics fee.",
    createdAt: "2025-09-05T14:30:00Z",
  },
  {
    id: "pay-18",
    paymentId: "#PAY0018",
    payee: "Star Printers Co",
    bank: "Wells Fargo",
    paymentMethod: "Credit Card",
    amount: 8600,
    date: "27 Aug 2025",
    status: "Completed",
    referenceNo: "CC-WF-8812",
    accountNumber: "•••• 1092",
    category: "Packaging & Labels",
    notes: "Custom hang tags and garment polybag print run.",
    createdAt: "2025-08-27T09:15:00Z",
  },
  {
    id: "pay-17",
    paymentId: "#PAY0017",
    payee: "Quick Rentals",
    bank: "Bank of America",
    paymentMethod: "Debit Card",
    amount: 4200,
    date: "16 Aug 2025",
    status: "Failed",
    referenceNo: "BOA-FAIL-012",
    accountNumber: "•••• 6634",
    category: "Equipment Lease",
    notes: "Steam pressing machine monthly equipment lease.",
    createdAt: "2025-08-16T11:45:00Z",
  },
  {
    id: "pay-16",
    paymentId: "#PAY0016",
    payee: "Bright Cleaning",
    bank: "Chase Bank",
    paymentMethod: "Bank Transfer",
    amount: 28400,
    date: "25 Jul 2025",
    status: "Completed",
    referenceNo: "CHASE-WIRE-771",
    accountNumber: "•••• 8910",
    category: "Facility & Maintenance",
    notes: "Factory warehouse sanitization and dry cleaning services.",
    createdAt: "2025-07-25T16:00:00Z",
  },
  {
    id: "pay-15",
    paymentId: "#PAY0015",
    payee: "Green Cafe Supplies",
    bank: "HSBC",
    paymentMethod: "UPI",
    amount: 6400,
    date: "12 Jul 2025",
    status: "Completed",
    referenceNo: "UPI-HSBC-2291",
    accountNumber: "greencafe@upi",
    category: "Office Pantry",
    notes: "Corporate cafeteria coffee beans and refreshment stock.",
    createdAt: "2025-07-12T13:20:00Z",
  },
  {
    id: "pay-14",
    paymentId: "#PAY0014",
    payee: "Tech Soft Ltd",
    bank: "Wells Fargo",
    paymentMethod: "Credit Card",
    amount: 11300,
    date: "23 Jun 2025",
    status: "Pending",
    referenceNo: "CC-WF-5541",
    accountNumber: "•••• 3391",
    category: "IT & Software",
    notes: "Enterprise cloud server licenses and backup infrastructure.",
    createdAt: "2025-06-23T15:10:00Z",
  },
];

export function getStoredPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPayments));
      return initialPayments;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return initialPayments;
  } catch {
    return initialPayments;
  }
}

export function saveStoredPayments(items: PaymentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error("Failed to save payments", err);
  }
}

export function addStoredPayment(
  data: Omit<PaymentRecord, "id" | "paymentId" | "createdAt"> & {
    customId?: string;
  }
): PaymentRecord {
  const current = getStoredPayments();
  let nextIdStr = data.customId;
  if (!nextIdStr) {
    const numericIds = current
      .map((p) => {
        const m = p.paymentId.match(/#?PAY0*(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numericIds.length > 0 ? Math.max(...numericIds) : 20;
    nextIdStr = `#PAY00${maxNum + 1}`;
  }

  const newRec: PaymentRecord = {
    id: `pay-${Date.now()}`,
    paymentId: nextIdStr,
    payee: data.payee,
    bank: data.bank,
    paymentMethod: data.paymentMethod,
    amount: data.amount,
    date: data.date,
    status: data.status,
    referenceNo: data.referenceNo,
    accountNumber: data.accountNumber,
    category: data.category,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  const updated = [newRec, ...current];
  saveStoredPayments(updated);
  return newRec;
}

export function updateStoredPayment(
  id: string,
  updates: Partial<Omit<PaymentRecord, "id">>
): PaymentRecord | null {
  const current = getStoredPayments();
  const idx = current.findIndex((p) => p.id === id || p.paymentId === id);
  if (idx === -1) return null;

  const updatedRec = { ...current[idx], ...updates };
  current[idx] = updatedRec;
  saveStoredPayments(current);
  return updatedRec;
}

export function deleteStoredPayment(id: string): boolean {
  const current = getStoredPayments();
  const filtered = current.filter((p) => p.id !== id && p.paymentId !== id);
  if (filtered.length === current.length) return false;
  saveStoredPayments(filtered);
  return true;
}

export const COMMON_BANKS = [
  "Chase Bank",
  "HSBC",
  "Wells Fargo",
  "Bank of America",
  "Citibank",
  "Barclays",
  "Standard Chartered",
  "City Bank Ltd",
];

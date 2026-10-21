export interface DueInvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "Paid" | "Partial" | "Unpaid";
}

export interface DuePaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  accountName: string;
  reference?: string;
  note?: string;
  recordedBy?: string;
}

export interface CustomerDueRecord {
  id: string;
  customerId?: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  totalInvoice: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  lastUpdated: string;
  invoices: DueInvoiceItem[];
  paymentHistory: DuePaymentHistoryItem[];
}

export interface SupplierDueRecord {
  id: string;
  supplierId?: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  totalInvoice: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  lastUpdated: string;
  invoices: DueInvoiceItem[];
  paymentHistory: DuePaymentHistoryItem[];
}

const STORAGE_KEY_CUSTOMER_DUES = "nexora_customer_dues_v1";
const STORAGE_KEY_SUPPLIER_DUES = "nexora_supplier_dues_v1";

// Initial Seed Data directly matching reference image 1:
export const initialCustomerDues: CustomerDueRecord[] = [
  {
    id: "cdue-1",
    customerId: "#ORD0001",
    name: "Walking Customer",
    phone: "0000000000",
    address: "Bangladesh",
    email: "walking@customer.com",
    totalInvoice: 10,
    totalAmount: 285055.0,
    totalPaid: 239380.0,
    totalDue: 2175.0,
    lastUpdated: "2026-10-21",
    invoices: [
      {
        id: "inv-c1-1",
        invoiceNumber: "INV-2026-0104",
        date: "2026-10-20",
        totalAmount: 12175.0,
        paidAmount: 10000.0,
        dueAmount: 2175.0,
        status: "Partial",
      },
      {
        id: "inv-c1-2",
        invoiceNumber: "INV-2026-0098",
        date: "2026-10-18",
        totalAmount: 48500.0,
        paidAmount: 48500.0,
        dueAmount: 0.0,
        status: "Paid",
      },
      {
        id: "inv-c1-3",
        invoiceNumber: "INV-2026-0082",
        date: "2026-10-12",
        totalAmount: 74380.0,
        paidAmount: 74380.0,
        dueAmount: 0.0,
        status: "Paid",
      },
      {
        id: "inv-c1-4",
        invoiceNumber: "INV-2026-0065",
        date: "2026-10-05",
        totalAmount: 150000.0,
        paidAmount: 106500.0,
        dueAmount: 0.0,
        status: "Paid",
      },
    ],
    paymentHistory: [
      {
        id: "pay-c1-1",
        date: "2026-10-20",
        amount: 10000.0,
        accountName: "Bkash (01745968975)",
        reference: "bKash TrxID #8932489",
        note: "Partial payment for counter sales",
        recordedBy: "Admin",
      },
      {
        id: "pay-c1-2",
        date: "2026-10-18",
        amount: 48500.0,
        accountName: "Cash Counter 1",
        reference: "RCT-4902",
        note: "Cash payment",
        recordedBy: "Manager",
      },
    ],
  },
  {
    id: "cdue-2",
    customerId: "#ORD0021",
    name: "Anwar Ali",
    phone: "0125698745",
    address: "Dhaka",
    email: "anwar.ali@gmail.com",
    totalInvoice: 3,
    totalAmount: 46240.0,
    totalPaid: 44090.0,
    totalDue: 2150.0,
    lastUpdated: "2026-10-19",
    invoices: [
      {
        id: "inv-c2-1",
        invoiceNumber: "INV-2026-0089",
        date: "2026-10-19",
        totalAmount: 22240.0,
        paidAmount: 20090.0,
        dueAmount: 2150.0,
        status: "Partial",
      },
      {
        id: "inv-c2-2",
        invoiceNumber: "INV-2026-0074",
        date: "2026-10-10",
        totalAmount: 14000.0,
        paidAmount: 14000.0,
        dueAmount: 0.0,
        status: "Paid",
      },
      {
        id: "inv-c2-3",
        invoiceNumber: "INV-2026-0051",
        date: "2026-09-28",
        totalAmount: 10000.0,
        paidAmount: 10000.0,
        dueAmount: 0.0,
        status: "Paid",
      },
    ],
    paymentHistory: [
      {
        id: "pay-c2-1",
        date: "2026-10-19",
        amount: 20090.0,
        accountName: "City Bank Corp (123231321213)",
        reference: "CHQ #440219",
        note: "Cheque deposit",
        recordedBy: "Admin",
      },
    ],
  },
  {
    id: "cdue-3",
    customerId: "#ORD0022",
    name: "Dream style",
    phone: "0565495023",
    address: "Dragon Mart",
    email: "dreamstyle@mart.ae",
    totalInvoice: 2,
    totalAmount: 3139.75,
    totalPaid: 41000.0,
    totalDue: 1564.75,
    lastUpdated: "2026-10-15",
    invoices: [
      {
        id: "inv-c3-1",
        invoiceNumber: "INV-2026-0071",
        date: "2026-10-15",
        totalAmount: 1564.75,
        paidAmount: 0.0,
        dueAmount: 1564.75,
        status: "Unpaid",
      },
      {
        id: "inv-c3-2",
        invoiceNumber: "INV-2026-0058",
        date: "2026-10-02",
        totalAmount: 1575.0,
        paidAmount: 1575.0,
        dueAmount: 0.0,
        status: "Paid",
      },
    ],
    paymentHistory: [
      {
        id: "pay-c3-1",
        date: "2026-10-02",
        amount: 1575.0,
        accountName: "Cash Counter 1",
        reference: "INV-REC-58",
        note: "Immediate counter clearance",
        recordedBy: "Sales Executive",
      },
    ],
  },
];

// Initial Seed Data directly matching reference image 2:
export const initialSupplierDues: SupplierDueRecord[] = [
  {
    id: "sdue-1",
    supplierId: "#SUP0021",
    name: "Akash Islam",
    phone: "01900000000",
    address: "568,Shewrapara,Mirpur,Dhaka",
    email: "akash.islam@suppliers.bd",
    totalInvoice: 1,
    totalAmount: 18500.0,
    totalPaid: 15000.0,
    totalDue: 3500.0,
    lastUpdated: "2026-10-21",
    invoices: [
      {
        id: "inv-s1-1",
        invoiceNumber: "PUR-2026-0012",
        date: "2026-10-21",
        totalAmount: 18500.0,
        paidAmount: 15000.0,
        dueAmount: 3500.0,
        status: "Partial",
      },
    ],
    paymentHistory: [
      {
        id: "pay-s1-1",
        date: "2026-10-21",
        amount: 15000.0,
        accountName: "Islami Bank PLC (1701570001814)",
        reference: "EFT-884920",
        note: "Initial advance purchase deposit",
        recordedBy: "Purchase Officer",
      },
    ],
  },
  {
    id: "sdue-2",
    supplierId: "#SUP0022",
    name: "Akiz Alom",
    phone: "0175894563",
    address: "Chattogram",
    email: "akiz.alom@akizholdings.com",
    totalInvoice: 1,
    totalAmount: 350000.0,
    totalPaid: 50000.0,
    totalDue: 300000.0,
    lastUpdated: "2026-10-18",
    invoices: [
      {
        id: "inv-s2-1",
        invoiceNumber: "PUR-2026-0008",
        date: "2026-10-18",
        totalAmount: 350000.0,
        paidAmount: 50000.0,
        dueAmount: 300000.0,
        status: "Partial",
      },
    ],
    paymentHistory: [
      {
        id: "pay-s2-1",
        date: "2026-10-18",
        amount: 50000.0,
        accountName: "City Bank Corp (123231321213)",
        reference: "CHQ-739102",
        note: "PO down-payment",
        recordedBy: "Finance Lead",
      },
    ],
  },
  {
    id: "sdue-3",
    supplierId: "#SUP0023",
    name: "Dhruv Rathee",
    phone: "0145618549",
    address: "Jessore",
    email: "dhruv.rathee@distributors.in",
    totalInvoice: 1,
    totalAmount: 1050.0,
    totalPaid: 0.0,
    totalDue: 1050.0,
    lastUpdated: "2026-10-15",
    invoices: [
      {
        id: "inv-s3-1",
        invoiceNumber: "PUR-2026-0015",
        date: "2026-10-15",
        totalAmount: 1050.0,
        paidAmount: 0.0,
        dueAmount: 1050.0,
        status: "Unpaid",
      },
    ],
    paymentHistory: [],
  },
];

// Helper to format currency in Bangladeshi Taka: ৳ 285 055.00
export function formatTaka(amount: number): string {
  const parts = Math.abs(amount).toFixed(2).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${amount < 0 ? "-" : ""}৳ ${integerPart}.${parts[1]}`;
}

// ------------------ Customer Due Storage ------------------
export function getStoredCustomerDues(): CustomerDueRecord[] {
  if (typeof window === "undefined") return initialCustomerDues;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOMER_DUES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CUSTOMER_DUES, JSON.stringify(initialCustomerDues));
      return initialCustomerDues;
    }
    return JSON.parse(raw);
  } catch {
    return initialCustomerDues;
  }
}

export function saveStoredCustomerDues(records: CustomerDueRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOMER_DUES, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent("nexora_due_updated"));
  } catch (e) {
    console.error("Failed to save customer dues", e);
  }
}

export function recordCustomerDuePayment(
  dueId: string,
  amount: number,
  accountName: string,
  reference?: string,
  note?: string
): CustomerDueRecord | null {
  const dues = getStoredCustomerDues();
  const index = dues.findIndex((d) => d.id === dueId);
  if (index === -1) return null;

  const current = dues[index];
  const newPaid = current.totalPaid + amount;
  const newDue = Math.max(0, current.totalDue - amount);

  const paymentEntry: DuePaymentHistoryItem = {
    id: `pay-c-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    amount,
    accountName,
    reference: reference || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    note: note || "Due collection",
    recordedBy: "Admin",
  };

  const updated: CustomerDueRecord = {
    ...current,
    totalPaid: newPaid,
    totalDue: newDue,
    lastUpdated: new Date().toISOString().split("T")[0],
    paymentHistory: [paymentEntry, ...current.paymentHistory],
  };

  dues[index] = updated;
  saveStoredCustomerDues(dues);
  return updated;
}

// ------------------ Supplier Due Storage ------------------
export function getStoredSupplierDues(): SupplierDueRecord[] {
  if (typeof window === "undefined") return initialSupplierDues;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPPLIER_DUES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SUPPLIER_DUES, JSON.stringify(initialSupplierDues));
      return initialSupplierDues;
    }
    return JSON.parse(raw);
  } catch {
    return initialSupplierDues;
  }
}

export function saveStoredSupplierDues(records: SupplierDueRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SUPPLIER_DUES, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent("nexora_due_updated"));
  } catch (e) {
    console.error("Failed to save supplier dues", e);
  }
}

export function recordSupplierDuePayment(
  dueId: string,
  amount: number,
  accountName: string,
  reference?: string,
  note?: string
): SupplierDueRecord | null {
  const dues = getStoredSupplierDues();
  const index = dues.findIndex((d) => d.id === dueId);
  if (index === -1) return null;

  const current = dues[index];
  const newPaid = current.totalPaid + amount;
  const newDue = Math.max(0, current.totalDue - amount);

  const paymentEntry: DuePaymentHistoryItem = {
    id: `pay-s-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    amount,
    accountName,
    reference: reference || `VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`,
    note: note || "Supplier due disbursement",
    recordedBy: "Admin",
  };

  const updated: SupplierDueRecord = {
    ...current,
    totalPaid: newPaid,
    totalDue: newDue,
    lastUpdated: new Date().toISOString().split("T")[0],
    paymentHistory: [paymentEntry, ...current.paymentHistory],
  };

  dues[index] = updated;
  saveStoredSupplierDues(dues);
  return updated;
}

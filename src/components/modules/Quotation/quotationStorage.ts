export interface QuotationLineItem {
  id: string;
  name: string;
  variant: string;
  qty: number;
  rate: number;
  discount: number;
  discountStr?: string;
  vatPercent: number;
  vatAmount: number;
  total: number;
}

export type QuotationStatus = "Pending" | "Converted" | "Expired" | "Rejected";

export interface QuotationItem {
  id: string;
  quotationNumber: string; // e.g. "INV-0001" or "QT-0001"
  date: string; // e.g. "12/09/2026"
  expiryDate?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientCompany?: string;
  clientAddress?: string;
  items: QuotationLineItem[];
  subtotal: number;
  totalVat: number;
  shippingCost: number;
  grandTotal: number;
  discount: number;
  netTotal: number;
  paymentAccount?: string;
  transactionId?: string;
  paidAmount?: number;
  dueAmount?: number;
  hasMultiplePayments?: boolean;
  payments?: { account: string; transactionId: string; amount: number }[];
  note?: string;
  status: QuotationStatus;
  convertedInvoiceNumber?: string;
  createdAt: string;
}

const STORAGE_KEY = "nexora_quotations_data";
const STORAGE_EVENT = "nexora_quotations_updated";

export const initialQuotations: QuotationItem[] = [
  {
    id: "qt-1001",
    quotationNumber: "INV-0001",
    date: "12/09/2026",
    expiryDate: "12/10/2026",
    clientId: "#ORD0022",
    clientName: "Abul Hasnat",
    clientPhone: "0158459632",
    clientEmail: "abul.hasnat@example.com",
    clientCompany: "Hasnat Enterprises Ltd",
    clientAddress: "Gulshan-1, Dhaka, Bangladesh",
    items: [
      {
        id: "item-q1",
        name: "Air Fryer 1500W [271474]",
        variant: "No variants",
        qty: 10,
        rate: 8500,
        discount: 0,
        discountStr: "0.00",
        vatPercent: 0,
        vatAmount: 0,
        total: 85000,
      },
      {
        id: "item-q2",
        name: "Rice Cooker [625125]",
        variant: "No variants",
        qty: 10,
        rate: 3500,
        discount: 0,
        discountStr: "0.00",
        vatPercent: 0,
        vatAmount: 0,
        total: 35000,
      },
    ],
    subtotal: 120000,
    totalVat: 0,
    shippingCost: 500,
    grandTotal: 120500,
    discount: 200,
    netTotal: 120300,
    paidAmount: 0,
    dueAmount: 120300,
    note: "Official client quotation for hotel kitchen appliances tender.",
    status: "Pending",
    createdAt: "2026-09-12T10:30:00Z",
  },
  {
    id: "qt-1002",
    quotationNumber: "INV-0002",
    date: "14/09/2026",
    expiryDate: "14/10/2026",
    clientId: "#ORD0021",
    clientName: "Akkas Ali",
    clientPhone: "01745968975",
    clientEmail: "akkas.ali@example.com",
    clientCompany: "Poltry seeds",
    clientAddress: "Mirpur-10, Dhaka, Bangladesh",
    items: [
      {
        id: "item-q3",
        name: "Inverter AC 1.5 Ton Copper",
        variant: "1.5 Ton Eco",
        qty: 2,
        rate: 75000,
        discount: 2000,
        discountStr: "2000",
        vatPercent: 5,
        vatAmount: 7400,
        total: 155400,
      },
    ],
    subtotal: 150000,
    totalVat: 7400,
    shippingCost: 600,
    grandTotal: 156000,
    discount: 1000,
    netTotal: 155000,
    paidAmount: 0,
    dueAmount: 155000,
    note: "Quotation for dual cooling inverter units installation.",
    status: "Converted",
    convertedInvoiceNumber: "INV-0017",
    createdAt: "2026-09-14T11:15:00Z",
  },
  {
    id: "qt-1003",
    quotationNumber: "INV-0003",
    date: "18/09/2026",
    expiryDate: "25/09/2026",
    clientId: "#ORD0019",
    clientName: "Gabriella White",
    clientPhone: "+91 98765 43210",
    clientEmail: "gabrie@example.com",
    clientCompany: "White Interiors",
    clientAddress: "42 Park Avenue, Mumbai",
    items: [
      {
        id: "item-q4",
        name: "Ergonomic Mesh Office Chair",
        variant: "High Back Black",
        qty: 6,
        rate: 11500,
        discount: 0,
        discountStr: "0.00",
        vatPercent: 5,
        vatAmount: 3450,
        total: 72450,
      },
    ],
    subtotal: 69000,
    totalVat: 3450,
    shippingCost: 800,
    grandTotal: 73250,
    discount: 750,
    netTotal: 72500,
    paidAmount: 0,
    dueAmount: 72500,
    note: "Estimate valid for 7 days only.",
    status: "Expired",
    createdAt: "2026-09-18T14:00:00Z",
  },
];

export function getStoredQuotations(): QuotationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuotations));
      return initialQuotations;
    }
    const parsed: QuotationItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuotations));
      return initialQuotations;
    }
    // Merge any missing initial record (like INV-0001 for Abul Hasnat)
    const existingIds = new Set(parsed.map((q) => q.quotationNumber.toLowerCase()));
    let hasNew = false;
    for (const init of initialQuotations) {
      if (!existingIds.has(init.quotationNumber.toLowerCase())) {
        parsed.unshift(init);
        existingIds.add(init.quotationNumber.toLowerCase());
        hasNew = true;
      }
    }
    if (hasNew) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return initialQuotations;
  }
}

export function saveStoredQuotations(quotes: QuotationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error("Failed to save quotations", err);
  }
}

export function getStoredQuotationById(id: string): QuotationItem | null {
  const list = getStoredQuotations();
  return (
    list.find(
      (q) =>
        q.id === id ||
        q.quotationNumber.toLowerCase() === id.toLowerCase() ||
        q.quotationNumber.replace("#", "").toLowerCase() === id.toLowerCase()
    ) || null
  );
}

export function addStoredQuotation(
  quoteData: Omit<QuotationItem, "id" | "quotationNumber" | "createdAt"> & {
    quotationNumber?: string;
  }
): QuotationItem {
  const current = getStoredQuotations();
  const nextNum = current.length + 1;
  const quoteNumber =
    quoteData.quotationNumber || `INV-000${nextNum < 10 ? nextNum : nextNum}`;

  const newQuote: QuotationItem = {
    ...quoteData,
    id: `qt-${Date.now()}`,
    quotationNumber: quoteNumber,
    createdAt: new Date().toISOString(),
  };

  const updated = [newQuote, ...current];
  saveStoredQuotations(updated);
  return newQuote;
}

export function updateStoredQuotation(
  id: string,
  updates: Partial<QuotationItem>
): QuotationItem | null {
  const current = getStoredQuotations();
  const index = current.findIndex((q) => q.id === id || q.quotationNumber === id);
  if (index === -1) return null;

  const merged: QuotationItem = {
    ...current[index],
    ...updates,
  };

  current[index] = merged;
  saveStoredQuotations(current);
  return merged;
}

export function deleteStoredQuotation(id: string): boolean {
  const current = getStoredQuotations();
  const filtered = current.filter((q) => q.id !== id && q.quotationNumber !== id);
  if (filtered.length === current.length) return false;
  saveStoredQuotations(filtered);
  return true;
}

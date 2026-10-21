export type RefundStatus = "Completed" | "Pending" | "Rejected";

export type PaymentMethod =
  | "Cash"
  | "Credit Card"
  | "Bank Transfer"
  | "UPI"
  | "Debit Card"
  | "Mobile Banking";

export interface RefundItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  refundAmount: number;
  returnReason?: string;
  condition?: "Resalable" | "Damaged" | "Scrapped" | "Opened";
}

export interface RefundRecord {
  id: string;
  refundId: string; // e.g. #RF0020
  customer: string; // e.g. Alexander Kenn
  customerId?: string; // e.g. #ORD0020
  customerPhone?: string;
  customerEmail?: string;
  invoiceRef: string; // e.g. #INV0020
  salesOrderId?: string;
  refundDate: string; // e.g. 11 Sep 2025
  amount: number; // e.g. 320
  paymentMethod: PaymentMethod;
  status: RefundStatus;
  returnReason: string; // e.g. Defective on arrival, Wrong size, Damaged in transit
  items?: RefundItem[];
  notes?: string;
  transactionId?: string;
  approvedBy?: string;
  createdAt: string;
}

const STORAGE_KEY = "nexora_sales_refunds_data";
const STORAGE_EVENT = "nexora_sales_refunds_updated";

export const initialRefunds: RefundRecord[] = [
  {
    id: "rf-20",
    refundId: "#RF0020",
    customer: "Alexander Kenn",
    customerId: "#ORD0020",
    customerEmail: "alexan@example.com",
    customerPhone: "+1 202 555 0173",
    invoiceRef: "#INV0020",
    refundDate: "11 Sep 2025",
    amount: 320,
    paymentMethod: "Cash",
    status: "Completed",
    returnReason: "Defective product on delivery",
    items: [
      {
        id: "rfi-20-1",
        name: "VoltX Fast Charger 65W",
        qty: 2,
        unitPrice: 160,
        refundAmount: 320,
        returnReason: "Coil whine and failed surge protection",
        condition: "Damaged",
      },
    ],
    notes: "Customer tested at counter, issued instant cash refund.",
    transactionId: "TXN-CSH-9021",
    approvedBy: "Admin Manager",
    createdAt: "2025-09-11T10:30:00Z",
  },
  {
    id: "rf-19",
    refundId: "#RF0019",
    customer: "Gabriella White",
    customerId: "#ORD0019",
    customerEmail: "gabrie@example.com",
    customerPhone: "+91 98765 43210",
    invoiceRef: "#INV0019",
    refundDate: "05 Sep 2025",
    amount: 150,
    paymentMethod: "Credit Card",
    status: "Pending",
    returnReason: "Wrong size / color variation delivered",
    items: [
      {
        id: "rfi-19-1",
        name: "Wireless ANC Headphones V2",
        qty: 1,
        unitPrice: 150,
        refundAmount: 150,
        returnReason: "Received matte grey instead of midnight blue",
        condition: "Resalable",
      },
    ],
    notes: "Awaiting gateway authorization reversal within 48h.",
    transactionId: "CC-REV-7832",
    approvedBy: "Finance Lead",
    createdAt: "2025-09-05T14:15:00Z",
  },
  {
    id: "rf-18",
    refundId: "#RF0018",
    customer: "Christopher Rey",
    customerId: "#ORD0018",
    customerEmail: "christ@example.com",
    customerPhone: "+1 416 555 8294",
    invoiceRef: "#INV0018",
    refundDate: "27 Aug 2025",
    amount: 580,
    paymentMethod: "Bank Transfer",
    status: "Completed",
    returnReason: "Items arrived with broken seal during transit",
    items: [
      {
        id: "rfi-18-1",
        name: "Smart Watch Elite Pro 46mm",
        qty: 2,
        unitPrice: 290,
        refundAmount: 580,
        returnReason: "Screen cracked inside unopened packaging",
        condition: "Damaged",
      },
    ],
    notes: "Carrier insurance claim filed (#CLM-48912). Wire transferred.",
    transactionId: "WIRE-8931204",
    approvedBy: "Operations Director",
    createdAt: "2025-08-27T09:40:00Z",
  },
  {
    id: "rf-17",
    refundId: "#RF0017",
    customer: "Penelope Ton",
    customerId: "#ORD0017",
    customerEmail: "penelo@example.com",
    customerPhone: "+61 412 345 678",
    invoiceRef: "#INV0017",
    refundDate: "16 Aug 2025",
    amount: 210,
    paymentMethod: "UPI",
    status: "Rejected",
    returnReason: "Return window expired (> 30 days warranty limit)",
    items: [
      {
        id: "rfi-17-1",
        name: "Bluetooth Conference Speakerphone",
        qty: 1,
        unitPrice: 210,
        refundAmount: 210,
        returnReason: "Customer upgraded office setup after 45 days",
        condition: "Opened",
      },
    ],
    notes: "Rejected per 14-day standard return policy terms.",
    transactionId: "UPI-FAIL-0012",
    approvedBy: "Support Supervisor",
    createdAt: "2025-08-16T16:20:00Z",
  },
  {
    id: "rf-16",
    refundId: "#RF0016",
    customer: "Daniel Foster",
    customerId: "#ORD0016",
    customerEmail: "daniel@example.com",
    customerPhone: "+49 1512 3456789",
    invoiceRef: "#INV0016",
    refundDate: "25 Jul 2025",
    amount: 740,
    paymentMethod: "Debit Card",
    status: "Completed",
    returnReason: "Customer cancelled before installation commenced",
    items: [
      {
        id: "rfi-16-1",
        name: "Enterprise Ethernet Router 24-Port",
        qty: 1,
        unitPrice: 740,
        refundAmount: 740,
        returnReason: "Premises relocation caused cancellation",
        condition: "Resalable",
      },
    ],
    notes: "Full debited refund processed back to bank card.",
    transactionId: "DB-REV-54129",
    approvedBy: "Finance Lead",
    createdAt: "2025-07-25T11:00:00Z",
  },
  {
    id: "rf-15",
    refundId: "#RF0015",
    customer: "Anastasia Leton",
    customerId: "#ORD0015",
    customerEmail: "anasta@example.com",
    customerPhone: "+81 90 1234 5678",
    invoiceRef: "#INV0015",
    refundDate: "12 Jul 2025",
    amount: 295,
    paymentMethod: "Credit Card",
    status: "Pending",
    returnReason: "Device overheating during initial setup",
    items: [
      {
        id: "rfi-15-1",
        name: "4K Dual Camera Drone Battery Pack",
        qty: 1,
        unitPrice: 295,
        refundAmount: 295,
        returnReason: "High operating temperature detected",
        condition: "Damaged",
      },
    ],
    notes: "Under technical inspection in laboratory.",
    transactionId: "CC-HOLD-9014",
    approvedBy: "QA Lead",
    createdAt: "2025-07-12T13:45:00Z",
  },
  {
    id: "rf-14",
    refundId: "#RF0014",
    customer: "Noah Bennett",
    customerId: "#ORD0014",
    customerEmail: "noah@example.com",
    customerPhone: "+44 20 7946 0912",
    invoiceRef: "#INV0014",
    refundDate: "23 Jun 2025",
    amount: 430,
    paymentMethod: "Bank Transfer",
    status: "Completed",
    returnReason: "Duplicate order placed by mistake",
    items: [
      {
        id: "rfi-14-1",
        name: "Ergonomic Mechanical Keyboard RGB",
        qty: 2,
        unitPrice: 215,
        refundAmount: 430,
        returnReason: "Customer accidentally clicked checkout twice",
        condition: "Resalable",
      },
    ],
    notes: "Duplicate items returned in sealed box. Wire sent.",
    transactionId: "WIRE-7719234",
    approvedBy: "Sales Manager",
    createdAt: "2025-06-23T15:10:00Z",
  },
  {
    id: "rf-13",
    refundId: "#RF0013",
    customer: "Victoria Ellsworth",
    customerId: "#ORD0013",
    customerEmail: "victoria@example.com",
    customerPhone: "+33 1 42 68 55 00",
    invoiceRef: "#INV0013",
    refundDate: "07 Jun 2025",
    amount: 185,
    paymentMethod: "Cash",
    status: "Completed",
    returnReason: "Accessories missing from original package",
    items: [
      {
        id: "rfi-13-1",
        name: "USB-C Multi-Port Docking Hub",
        qty: 1,
        unitPrice: 185,
        refundAmount: 185,
        returnReason: "Power adapter and HDMI cable were missing",
        condition: "Opened",
      },
    ],
    notes: "Client returned unit to outlet store counter.",
    transactionId: "TXN-CSH-4412",
    approvedBy: "Store Supervisor",
    createdAt: "2025-06-07T12:05:00Z",
  },
  {
    id: "rf-12",
    refundId: "#RF0012",
    customer: "Noah Kensington",
    customerId: "#ORD0012",
    customerEmail: "kensington@example.com",
    customerPhone: "+1 604 555 0198",
    invoiceRef: "#INV0012",
    refundDate: "28 May 2025",
    amount: 640,
    paymentMethod: "UPI",
    status: "Rejected",
    returnReason: "Product physically damaged by customer misuse",
    items: [
      {
        id: "rfi-12-1",
        name: "Outdoor Waterproof Soundbar 120W",
        qty: 1,
        unitPrice: 640,
        refundAmount: 640,
        returnReason: "Submerged beyond IP67 rating; casing dropped",
        condition: "Scrapped",
      },
    ],
    notes: "Diagnostics show physical impact dent on internal amplifier board.",
    transactionId: "UPI-REJ-88120",
    approvedBy: "Warranty Officer",
    createdAt: "2025-05-28T17:30:00Z",
  },
  {
    id: "rf-11",
    refundId: "#RF0011",
    customer: "Catherine Lan",
    customerId: "#ORD0011",
    customerEmail: "catherine@example.com",
    customerPhone: "+65 6789 0123",
    invoiceRef: "#INV0011",
    refundDate: "18 May 2025",
    amount: 120,
    paymentMethod: "Credit Card",
    status: "Completed",
    returnReason: "Unopened package return requested within window",
    items: [
      {
        id: "rfi-11-1",
        name: "Slim Wireless Numeric Keypad",
        qty: 2,
        unitPrice: 60,
        refundAmount: 120,
        returnReason: "Bought for staff members who had already purchased one",
        condition: "Resalable",
      },
    ],
    notes: "Factory seal intact, restocked into main warehouse.",
    transactionId: "CC-REV-10923",
    approvedBy: "Inventory Lead",
    createdAt: "2025-05-18T10:15:00Z",
  },
];

// Helper to get all stored refunds
export function getStoredRefunds(): RefundRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRefunds));
      return initialRefunds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRefunds));
      return initialRefunds;
    }
    return parsed;
  } catch {
    return initialRefunds;
  }
}

// Helper to save stored refunds
export function saveStoredRefunds(refunds: RefundRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(refunds));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error("Failed to save refunds to localStorage", err);
  }
}

// Add a new refund
export function addStoredRefund(
  data: Omit<RefundRecord, "id" | "refundId" | "createdAt"> & {
    customRefundId?: string;
  }
): RefundRecord {
  const current = getStoredRefunds();

  // Generate next #RF00XX ID
  let nextIdStr = data.customRefundId;
  if (!nextIdStr) {
    const numericIds = current
      .map((r) => {
        const match = r.refundId.match(/#?RF0*(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numericIds.length > 0 ? Math.max(...numericIds) : 20;
    const nextNum = maxNum + 1;
    nextIdStr = `#RF00${nextNum}`;
  }

  const newRecord: RefundRecord = {
    id: `rf-${Date.now()}`,
    refundId: nextIdStr,
    customer: data.customer,
    customerId: data.customerId,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    invoiceRef: data.invoiceRef.startsWith("#") ? data.invoiceRef : `#${data.invoiceRef}`,
    salesOrderId: data.salesOrderId,
    refundDate: data.refundDate,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    status: data.status,
    returnReason: data.returnReason,
    items: data.items,
    notes: data.notes,
    transactionId: data.transactionId,
    approvedBy: data.approvedBy || "Admin Staff",
    createdAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...current];
  saveStoredRefunds(updated);
  return newRecord;
}

// Update existing refund
export function updateStoredRefund(
  id: string,
  updates: Partial<Omit<RefundRecord, "id">>
): RefundRecord | null {
  const current = getStoredRefunds();
  const index = current.findIndex((r) => r.id === id || r.refundId === id);
  if (index === -1) return null;

  const updatedRecord = {
    ...current[index],
    ...updates,
  };

  current[index] = updatedRecord;
  saveStoredRefunds(current);
  return updatedRecord;
}

// Delete refund
export function deleteStoredRefund(id: string): boolean {
  const current = getStoredRefunds();
  const filtered = current.filter((r) => r.id !== id && r.refundId !== id);
  if (filtered.length === current.length) return false;
  saveStoredRefunds(filtered);
  return true;
}

// Get single refund by ID
export function getStoredRefundById(id: string): RefundRecord | undefined {
  const current = getStoredRefunds();
  return current.find((r) => r.id === id || r.refundId === id);
}

// Common return reasons list for dropdowns and suggestions
export const COMMON_RETURN_REASONS = [
  "Defective product on delivery",
  "Wrong size / color variation delivered",
  "Items arrived with broken seal during transit",
  "Return window expired (> 30 days warranty limit)",
  "Customer cancelled before installation commenced",
  "Device overheating during initial setup",
  "Duplicate order placed by mistake",
  "Accessories missing from original package",
  "Product physically damaged by customer misuse",
  "Unopened package return requested within window",
  "Performance does not match technical specifications",
  "Dissatisfied with product quality",
];

export interface PurchaseItem {
  id: string;
  name: string;
  variant: string;
  stock: number;
  qty: number;
  purchasePrice: number;
  salePrice: number;
  discount: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
}

export type PurchaseStatus = "Received" | "Ordered" | "In Transit" | "Cancelled";
export type PurchasePaymentStatus =
  | "Paid"
  | "Pending"
  | "Partial"
  | "Unpaid"
  | "Partially paid";

export interface PurchaseRecord {
  id: string;
  purchaseNumber: string; // e.g. #PUR0020
  invoiceNumber: string;  // e.g. INV-0006
  purchaseName: string;   // e.g. Air Fryer Purchase-01
  challanNo?: string;     // e.g. CH-98124
  date: string;           // e.g. 11 Sep 2025 or 21/09/2026
  supplierId: string;
  supplierName: string;
  supplierCompany?: string;
  supplierPhone: string;
  supplierEmail?: string;
  supplierAddress?: string;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
  items: PurchaseItem[];
  itemsCount?: number;
  subtotal: number;
  totalItemDiscount: number;
  totalVat: number;
  shippingCost: number;
  grandTotal: number;
  flatDiscount: number;
  netTotal: number;
  account?: string;
  transactionId?: string;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseReturnItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  refundAmount: number;
  reason: string;
}

export type PurchaseReturnStatus =
  | "Approved"
  | "Pending"
  | "Rejected"
  | "Refunded"
  | "Deducted from Due";

export interface PurchaseReturnRecord {
  id: string;
  returnNumber: string;       // e.g. #PR0020
  purchaseInvoice: string;   // e.g. #PO0020 or INV-0006
  purchaseName: string;
  supplierName: string;
  supplierPhone: string;
  returnDate: string;        // e.g. 11 Sep 2025
  items: PurchaseReturnItem[];
  itemsCount?: number;
  totalRefundAmount: number;
  refundStatus: PurchaseReturnStatus;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY_PURCHASES = "nexora_purchases_data_v2";
const STORAGE_KEY_RETURNS = "nexora_purchase_returns_data_v2";
const STORAGE_EVENT_PURCHASES = "nexora_purchases_updated";
const STORAGE_EVENT_RETURNS = "nexora_purchase_returns_updated";

// Comprehensive initial data matching reference images & user information
export const initialPurchases: PurchaseRecord[] = [
  {
    id: "pur-020",
    purchaseNumber: "#PUR0020",
    invoiceNumber: "INV-0020",
    purchaseName: "Alpha Supplies Stock",
    challanNo: "CH-2026-20",
    date: "11 Sep 2025",
    supplierId: "sup-alpha",
    supplierName: "Alpha Supplies Inc",
    supplierCompany: "Rohan Drive Suite",
    supplierPhone: "+1 (555) 723-9981",
    supplierEmail: "contact@alphasupplies.com",
    supplierAddress: "Rohan Drive Suite, San Francisco, CA",
    status: "Received",
    paymentStatus: "Paid",
    itemsCount: 12,
    items: [
      {
        id: "item-a1",
        name: "VoltX Charger",
        variant: "Standard",
        stock: 45,
        qty: 1,
        purchasePrice: 1000,
        salePrice: 1350,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 1000,
      },
      {
        id: "item-a2",
        name: "PixelPro Camera",
        variant: "Dual Lens",
        stock: 18,
        qty: 1,
        purchasePrice: 250,
        salePrice: 380,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 250,
      },
      {
        id: "item-a3",
        name: "Industrial Power Adapter Unit",
        variant: "220V Heavy",
        stock: 60,
        qty: 10,
        purchasePrice: 2125,
        salePrice: 2600,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 21250,
      },
    ],
    subtotal: 22500,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 22500,
    flatDiscount: 0,
    netTotal: 22500,
    account: "Credit Card",
    transactionId: "TX-CC-99020",
    paidAmount: 22500,
    dueAmount: 0,
    createdAt: "2025-09-11",
  },
  {
    id: "pur-019",
    purchaseNumber: "#PUR0019",
    invoiceNumber: "INV-0019",
    purchaseName: "Beta Logistics Hub Restock",
    challanNo: "CH-2026-19",
    date: "05 Sep 2025",
    supplierId: "sup-beta",
    supplierName: "Beta Logistics Ltd",
    supplierCompany: "Port Commercial Zone",
    supplierPhone: "+1 (555) 641-2311",
    supplierEmail: "info@betalogistics.com",
    supplierAddress: "Port Bay 4, Seattle, WA",
    status: "Ordered",
    paymentStatus: "Pending",
    itemsCount: 8,
    items: [
      {
        id: "item-b1",
        name: "Cargo Packing Fasteners",
        variant: "Heavy Duty",
        stock: 120,
        qty: 8,
        purchasePrice: 1968.75,
        salePrice: 2400,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 15750,
      },
    ],
    subtotal: 15750,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 15750,
    flatDiscount: 0,
    netTotal: 15750,
    account: "Bank Transfer",
    paidAmount: 0,
    dueAmount: 15750,
    createdAt: "2025-09-05",
  },
  {
    id: "pur-018",
    purchaseNumber: "#PUR0018",
    invoiceNumber: "INV-0018",
    purchaseName: "Star Printers Supply",
    challanNo: "CH-2026-18",
    date: "27 Aug 2025",
    supplierId: "sup-star",
    supplierName: "Star Printers Co",
    supplierCompany: "Press District",
    supplierPhone: "+1 (555) 438-7719",
    supplierEmail: "orders@starprinters.com",
    supplierAddress: "Industrial Ave 12, Chicago, IL",
    status: "Received",
    paymentStatus: "Paid",
    itemsCount: 5,
    items: [
      {
        id: "item-s1",
        name: "High Gloss Color Cartridge Set",
        variant: "CMYK Pack",
        stock: 30,
        qty: 5,
        purchasePrice: 1720,
        salePrice: 2200,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 8600,
      },
    ],
    subtotal: 8600,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 8600,
    flatDiscount: 0,
    netTotal: 8600,
    account: "Cash",
    paidAmount: 8600,
    dueAmount: 0,
    createdAt: "2025-08-27",
  },
  {
    id: "pur-017",
    purchaseNumber: "#PUR0017",
    invoiceNumber: "INV-0017",
    purchaseName: "Quick Rentals Asset Delivery",
    challanNo: "CH-2026-17",
    date: "16 Aug 2025",
    supplierId: "sup-quick",
    supplierName: "Quick Rentals",
    supplierCompany: "Metro Transit",
    supplierPhone: "+1 (555) 912-3342",
    supplierEmail: "support@quickrentals.com",
    supplierAddress: "Fleet Depot 5, Austin, TX",
    status: "In Transit",
    paymentStatus: "Partial",
    itemsCount: 3,
    items: [
      {
        id: "item-q1",
        name: "Commercial Pallet Jack",
        variant: "Manual Hydraulic",
        stock: 6,
        qty: 3,
        purchasePrice: 1400,
        salePrice: 1850,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 4200,
      },
    ],
    subtotal: 4200,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 4200,
    flatDiscount: 0,
    netTotal: 4200,
    account: "City Bank Ltd",
    paidAmount: 2000,
    dueAmount: 2200,
    createdAt: "2025-08-16",
  },
  {
    id: "pur-016",
    purchaseNumber: "#PUR0016",
    invoiceNumber: "INV-0016",
    purchaseName: "Bright Cleaning Consumables",
    challanNo: "CH-2026-16",
    date: "25 Jul 2025",
    supplierId: "sup-bright",
    supplierName: "Bright Cleaning",
    supplierCompany: "Sanitation Products",
    supplierPhone: "+1 (555) 674-8890",
    supplierEmail: "sales@brightcleaning.com",
    supplierAddress: "Cleaning Way, Dallas, TX",
    status: "Received",
    paymentStatus: "Paid",
    itemsCount: 15,
    items: [
      {
        id: "item-c1",
        name: "Industrial Disinfectant 20L",
        variant: "Bulk Drum",
        stock: 50,
        qty: 15,
        purchasePrice: 1893.33,
        salePrice: 2400,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 28400,
      },
    ],
    subtotal: 28400,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 28400,
    flatDiscount: 0,
    netTotal: 28400,
    account: "Cash",
    paidAmount: 28400,
    dueAmount: 0,
    createdAt: "2025-07-25",
  },
  {
    id: "pur-015",
    purchaseNumber: "#PUR0015",
    invoiceNumber: "INV-0015",
    purchaseName: "Green Cafe Supplies Packaging",
    challanNo: "CH-2026-15",
    date: "12 Jul 2025",
    supplierId: "sup-green",
    supplierName: "Green Cafe Supplies",
    supplierCompany: "Eco Pack Group",
    supplierPhone: "+1 (555) 345-8120",
    supplierEmail: "sales@greencafe.com",
    supplierAddress: "Eco Park 8, Portland, OR",
    status: "Received",
    paymentStatus: "Paid",
    itemsCount: 6,
    items: [
      {
        id: "item-g1",
        name: "Biodegradable Hot Cups 12oz",
        variant: "1000pc Carton",
        stock: 25,
        qty: 6,
        purchasePrice: 1066.67,
        salePrice: 1450,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 6400,
      },
    ],
    subtotal: 6400,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 6400,
    flatDiscount: 0,
    netTotal: 6400,
    account: "Dutch Bangla Bank",
    paidAmount: 6400,
    dueAmount: 0,
    createdAt: "2025-07-12",
  },
  {
    id: "pur-014",
    purchaseNumber: "#PUR0014",
    invoiceNumber: "INV-0014",
    purchaseName: "Tech Soft Ltd Server Parts",
    challanNo: "CH-2026-14",
    date: "23 Jun 2025",
    supplierId: "sup-techsoft",
    supplierName: "Tech Soft Ltd",
    supplierCompany: "Hardware Division",
    supplierPhone: "+1 (555) 789-0123",
    supplierEmail: "procurement@techsoft.com",
    supplierAddress: "Silicon Square 10, San Jose, CA",
    status: "Ordered",
    paymentStatus: "Pending",
    itemsCount: 10,
    items: [
      {
        id: "item-t1",
        name: "Rackmount Power Distributor 16A",
        variant: "Smart Metered",
        stock: 15,
        qty: 10,
        purchasePrice: 1130,
        salePrice: 1450,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 11300,
      },
    ],
    subtotal: 11300,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 11300,
    flatDiscount: 0,
    netTotal: 11300,
    account: "Bank Transfer",
    paidAmount: 0,
    dueAmount: 11300,
    createdAt: "2025-06-23",
  },
  {
    id: "pur-013",
    purchaseNumber: "#PUR0013",
    invoiceNumber: "INV-0013",
    purchaseName: "Metro Cabs Fleet Batteries",
    challanNo: "CH-2026-13",
    date: "07 Jun 2025",
    supplierId: "sup-metro",
    supplierName: "Metro Cabs",
    supplierCompany: "Fleet Services",
    supplierPhone: "+1 (555) 234-9081",
    supplierEmail: "parts@metrocabs.com",
    supplierAddress: "Transport Blvd 9, Detroit, MI",
    status: "Cancelled",
    paymentStatus: "Paid",
    itemsCount: 4,
    items: [
      {
        id: "item-m1",
        name: "Commercial AGM Car Battery 12V",
        variant: "75Ah Sealed",
        stock: 12,
        qty: 4,
        purchasePrice: 1962.5,
        salePrice: 2400,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 7850,
      },
    ],
    subtotal: 7850,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 7850,
    flatDiscount: 0,
    netTotal: 7850,
    account: "Credit Card",
    paidAmount: 7850,
    dueAmount: 0,
    createdAt: "2025-06-07",
  },
  {
    id: "pur-012",
    purchaseNumber: "#PUR0012",
    invoiceNumber: "INV-0012",
    purchaseName: "Horizon Supplies Hardware",
    challanNo: "CH-2026-12",
    date: "28 May 2025",
    supplierId: "sup-horizon",
    supplierName: "Horizon Supplies",
    supplierCompany: "Commercial Hardware",
    supplierPhone: "+1 (555) 456-7812",
    supplierEmail: "contact@horizonsupplies.com",
    supplierAddress: "Harbor Rd 44, Boston, MA",
    status: "Received",
    paymentStatus: "Paid",
    itemsCount: 9,
    items: [
      {
        id: "item-h1",
        name: "Stainless Steel Fastener Box",
        variant: "M6-M12 Assorted",
        stock: 40,
        qty: 9,
        purchasePrice: 1488.89,
        salePrice: 1900,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 13400,
      },
    ],
    subtotal: 13400,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 13400,
    flatDiscount: 0,
    netTotal: 13400,
    account: "City Bank Ltd",
    paidAmount: 13400,
    dueAmount: 0,
    createdAt: "2025-05-28",
  },
  {
    id: "pur-011",
    purchaseNumber: "#PUR0011",
    invoiceNumber: "INV-0011",
    purchaseName: "City Power Backup Cells",
    challanNo: "CH-2026-11",
    date: "18 May 2025",
    supplierId: "sup-citypower",
    supplierName: "City Power",
    supplierCompany: "Grid Equipment",
    supplierPhone: "+1 (555) 678-2234",
    supplierEmail: "orders@citypower.com",
    supplierAddress: "Energy Way 1, Philadelphia, PA",
    status: "Received",
    paymentStatus: "Paid",
    itemsCount: 7,
    items: [
      {
        id: "item-cp1",
        name: "LiFePO4 Backup Cells 3.2V",
        variant: "100Ah Grade A",
        stock: 35,
        qty: 7,
        purchasePrice: 700,
        salePrice: 920,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 4900,
      },
    ],
    subtotal: 4900,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 4900,
    flatDiscount: 0,
    netTotal: 4900,
    account: "Cash",
    paidAmount: 4900,
    dueAmount: 0,
    createdAt: "2025-05-18",
  },
  // Existing records from earlier images to preserve all user information
  {
    id: "pur-006",
    purchaseNumber: "#PUR0010",
    invoiceNumber: "INV-0006",
    purchaseName: "xyz",
    challanNo: "CH-2026-06",
    date: "21 Sep 2026",
    supplierId: "sup-dhruv",
    supplierName: "Dhruv Rathee",
    supplierCompany: "DR Grouop",
    supplierPhone: "0145618549",
    supplierEmail: "dhruv@drgroup.com",
    supplierAddress: "Dhaka Trade Center, Floor 4",
    status: "Ordered",
    paymentStatus: "Unpaid",
    itemsCount: 1,
    items: [
      {
        id: "item-p1",
        name: "Electric Kettle 1.8L",
        variant: "No variants",
        stock: 5,
        qty: 1,
        purchasePrice: 1050,
        salePrice: 1400,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 1050,
      },
    ],
    subtotal: 1050,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 1050,
    flatDiscount: 0,
    netTotal: 1050,
    account: "Cash",
    paidAmount: 0,
    dueAmount: 1050,
    createdAt: "2026-09-21",
  },
  {
    id: "pur-005",
    purchaseNumber: "#PUR0009",
    invoiceNumber: "INV-0005",
    purchaseName: "Iron Grinder purchase",
    challanNo: "CH-2026-05",
    date: "16 Sep 2026",
    supplierId: "sup-akash",
    supplierName: "Akash Islam",
    supplierCompany: "Ma Traders",
    supplierPhone: "01900000000",
    supplierEmail: "akash@matraders.com",
    supplierAddress: "Shop 12, New Market, Dhaka",
    status: "Received",
    paymentStatus: "Paid",
    itemsCount: 5,
    items: [
      {
        id: "item-p2",
        name: "Industrial Angle Grinder 850W",
        variant: "Heavy Duty",
        stock: 12,
        qty: 5,
        purchasePrice: 3850,
        salePrice: 4800,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 19250,
      },
    ],
    subtotal: 19250,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 19250,
    flatDiscount: 0,
    netTotal: 19250,
    account: "City Bank Ltd",
    paidAmount: 19250,
    dueAmount: 0,
    createdAt: "2026-09-16",
  },
  {
    id: "pur-004",
    purchaseNumber: "#PUR0008",
    invoiceNumber: "INV-0004",
    purchaseName: "Ac purchase-01",
    challanNo: "CH-2026-04",
    date: "12 Sep 2026",
    supplierId: "sup-akiz",
    supplierName: "Akiz Alom",
    supplierCompany: "Akiz group",
    supplierPhone: "0175894563",
    supplierEmail: "akiz@akizgroup.com",
    supplierAddress: "Corporate Tower, Gulshan-2, Dhaka",
    status: "Received",
    paymentStatus: "Partially paid",
    itemsCount: 5,
    items: [
      {
        id: "item-p3",
        name: "Inverter AC 1.5 Ton Copper",
        variant: "1.5 Ton Eco",
        stock: 8,
        qty: 5,
        purchasePrice: 70000,
        salePrice: 82000,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 350000,
      },
    ],
    subtotal: 350000,
    totalItemDiscount: 0,
    totalVat: 0,
    shippingCost: 0,
    grandTotal: 350000,
    flatDiscount: 0,
    netTotal: 350000,
    account: "Dutch Bangla Bank",
    paidAmount: 50000,
    dueAmount: 300000,
    createdAt: "2026-09-12",
  },
];

// Initial Return seed data matching reference Image 2
export const initialReturns: PurchaseReturnRecord[] = [
  {
    id: "ret-020",
    returnNumber: "#PR0020",
    purchaseInvoice: "#PO0020",
    purchaseName: "Alpha Supplies Return",
    supplierName: "Alpha Supplies Inc",
    supplierPhone: "+1 (555) 723-9981",
    returnDate: "11 Sep 2025",
    itemsCount: 2,
    items: [
      {
        id: "ri-20",
        name: "VoltX Charger Replacement Unit",
        qty: 2,
        unitPrice: 625,
        refundAmount: 1250,
        reason: "Surge protection failure in batch",
      },
    ],
    totalRefundAmount: 1250,
    refundStatus: "Approved",
    notes: "Supplier approved credit voucher.",
    createdAt: "2025-09-11",
  },
  {
    id: "ret-019",
    returnNumber: "#PR0019",
    purchaseInvoice: "#PO0019",
    purchaseName: "Beta Logistics Return",
    supplierName: "Beta Logistics Ltd",
    supplierPhone: "+1 (555) 641-2311",
    returnDate: "05 Sep 2025",
    itemsCount: 1,
    items: [
      {
        id: "ri-19",
        name: "Cargo Straps 50m",
        qty: 1,
        unitPrice: 450,
        refundAmount: 450,
        reason: "Wrong tensile rating",
      },
    ],
    totalRefundAmount: 450,
    refundStatus: "Pending",
    notes: "Waiting for return authorization from supplier.",
    createdAt: "2025-09-05",
  },
  {
    id: "ret-018",
    returnNumber: "#PR0018",
    purchaseInvoice: "#PO0018",
    purchaseName: "Star Printers Return",
    supplierName: "Star Printers Co",
    supplierPhone: "+1 (555) 438-7719",
    returnDate: "27 Aug 2025",
    itemsCount: 3,
    items: [
      {
        id: "ri-18",
        name: "Magenta Ink Tank Cartridge",
        qty: 3,
        unitPrice: 296.67,
        refundAmount: 890,
        reason: "Nozzle leak upon delivery",
      },
    ],
    totalRefundAmount: 890,
    refundStatus: "Approved",
    notes: "Credited to corporate balance.",
    createdAt: "2025-08-27",
  },
  {
    id: "ret-017",
    returnNumber: "#PR0017",
    purchaseInvoice: "#PO0017",
    purchaseName: "Quick Rentals Return",
    supplierName: "Quick Rentals",
    supplierPhone: "+1 (555) 912-3342",
    returnDate: "16 Aug 2025",
    itemsCount: 1,
    items: [
      {
        id: "ri-17",
        name: "Hydraulic Jack Handle",
        qty: 1,
        unitPrice: 210,
        refundAmount: 210,
        reason: "Mismatch specifications",
      },
    ],
    totalRefundAmount: 210,
    refundStatus: "Rejected",
    notes: "Supplier confirmed seal was broken post-acceptance.",
    createdAt: "2025-08-16",
  },
  {
    id: "ret-016",
    returnNumber: "#PR0016",
    purchaseInvoice: "#PO0016",
    purchaseName: "Bright Cleaning Return",
    supplierName: "Bright Cleaning",
    supplierPhone: "+1 (555) 674-8890",
    returnDate: "25 Jul 2025",
    itemsCount: 4,
    items: [
      {
        id: "ri-16",
        name: "Sanitizer Gel 5L Jug",
        qty: 4,
        unitPrice: 385,
        refundAmount: 1540,
        reason: "Damaged container in transit",
      },
    ],
    totalRefundAmount: 1540,
    refundStatus: "Approved",
    notes: "Cash refund credited.",
    createdAt: "2025-07-25",
  },
  {
    id: "ret-015",
    returnNumber: "#PR0015",
    purchaseInvoice: "#PO0015",
    purchaseName: "Green Cafe Supplies Return",
    supplierName: "Green Cafe Supplies",
    supplierPhone: "+1 (555) 345-8120",
    returnDate: "12 Jul 2025",
    itemsCount: 2,
    items: [
      {
        id: "ri-15",
        name: "Hot Cup Lids 1000pc Carton",
        qty: 2,
        unitPrice: 320,
        refundAmount: 640,
        reason: "Defective sealing rim",
      },
    ],
    totalRefundAmount: 640,
    refundStatus: "Pending",
    notes: "Under vendor inspection.",
    createdAt: "2025-07-12",
  },
  {
    id: "ret-014",
    returnNumber: "#PR0014",
    purchaseInvoice: "#PO0014",
    purchaseName: "Tech Soft Return",
    supplierName: "Tech Soft Ltd",
    supplierPhone: "+1 (555) 789-0123",
    returnDate: "23 Jun 2025",
    itemsCount: 5,
    items: [
      {
        id: "ri-14",
        name: "Rack PDU Mounting Brackets",
        qty: 5,
        unitPrice: 430,
        refundAmount: 2150,
        reason: "Wrong mounting depth",
      },
    ],
    totalRefundAmount: 2150,
    refundStatus: "Approved",
    notes: "Credit memo issued.",
    createdAt: "2025-06-23",
  },
  {
    id: "ret-013",
    returnNumber: "#PR0013",
    purchaseInvoice: "#PO0013",
    purchaseName: "Metro Cabs Return",
    supplierName: "Metro Cabs",
    supplierPhone: "+1 (555) 234-9081",
    returnDate: "07 Jun 2025",
    itemsCount: 2,
    items: [
      {
        id: "ri-13",
        name: "Battery Terminal Connectors",
        qty: 2,
        unitPrice: 192.5,
        refundAmount: 385,
        reason: "Excess stock adjustment",
      },
    ],
    totalRefundAmount: 385,
    refundStatus: "Approved",
    notes: "Adjusted against next billing.",
    createdAt: "2025-06-07",
  },
  {
    id: "ret-012",
    returnNumber: "#PR0012",
    purchaseInvoice: "#PO0012",
    purchaseName: "Horizon Supplies Return",
    supplierName: "Horizon Supplies",
    supplierPhone: "+1 (555) 456-7812",
    returnDate: "28 May 2025",
    itemsCount: 3,
    items: [
      {
        id: "ri-12",
        name: "Fastener Pack M10",
        qty: 3,
        unitPrice: 546.67,
        refundAmount: 1640,
        reason: "Incorrect thread pitch",
      },
    ],
    totalRefundAmount: 1640,
    refundStatus: "Rejected",
    notes: "Custom order non-refundable.",
    createdAt: "2025-05-28",
  },
  {
    id: "ret-011",
    returnNumber: "#PR0011",
    purchaseInvoice: "#PO0011",
    purchaseName: "City Power Return",
    supplierName: "City Power",
    supplierPhone: "+1 (555) 678-2234",
    returnDate: "18 May 2025",
    itemsCount: 1,
    items: [
      {
        id: "ri-11",
        name: "Backup Battery Cell 3.2V",
        qty: 1,
        unitPrice: 320,
        refundAmount: 320,
        reason: "Low voltage test failure",
      },
    ],
    totalRefundAmount: 320,
    refundStatus: "Approved",
    notes: "Direct supplier replacement credit.",
    createdAt: "2025-05-18",
  },
];

// Helper to get stored purchases
export function getStoredPurchases(): PurchaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PURCHASES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(initialPurchases));
      return initialPurchases;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(initialPurchases));
      return initialPurchases;
    }
    // Ensure all records have valid paidAmount and dueAmount numbers
    return parsed.map((p: PurchaseRecord) => {
      const net = typeof p.netTotal === "number" ? p.netTotal : 0;
      const paid = typeof p.paidAmount === "number" ? p.paidAmount : (p.paymentStatus === "Paid" ? net : 0);
      const due = typeof p.dueAmount === "number" ? p.dueAmount : Math.max(0, net - paid);
      return {
        ...p,
        paidAmount: paid,
        dueAmount: due,
      };
    });
  } catch {
    return initialPurchases;
  }
}

// Helper to save purchases
export function saveStoredPurchases(list: PurchaseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(list));
    window.dispatchEvent(new Event(STORAGE_EVENT_PURCHASES));
  } catch (err) {
    console.error("Failed to save purchases to localStorage", err);
  }
}

// Find single purchase by id or invoice or purchaseNumber
export function getStoredPurchaseById(identifier: string): PurchaseRecord | null {
  const list = getStoredPurchases();
  const clean = identifier.replace("#", "").toLowerCase().trim();
  return (
    list.find(
      (p) =>
        p.id.toLowerCase() === clean ||
        p.purchaseNumber.replace("#", "").toLowerCase() === clean ||
        p.invoiceNumber.toLowerCase() === clean
    ) || null
  );
}

// Add a new purchase
export function addStoredPurchase(
  record: Omit<PurchaseRecord, "id" | "purchaseNumber" | "invoiceNumber" | "createdAt">
): PurchaseRecord {
  const current = getStoredPurchases();
  const nextNumber = current.length + 21;
  const purNum = `#PUR00${nextNumber}`;
  const invNum = `INV-00${nextNumber < 10 ? `0${nextNumber}` : nextNumber}`;

  const newRecord: PurchaseRecord = {
    ...record,
    id: `pur-${Date.now()}`,
    purchaseNumber: purNum,
    invoiceNumber: invNum,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newRecord, ...current];
  saveStoredPurchases(updated);
  return newRecord;
}

// Update purchase
export function updateStoredPurchase(
  id: string,
  updates: Partial<PurchaseRecord>
): PurchaseRecord | null {
  const current = getStoredPurchases();
  const idx = current.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  current[idx] = { ...current[idx], ...updates };
  saveStoredPurchases([...current]);
  return current[idx];
}

// Record Quick Payment on a Purchase
export function recordPurchasePayment(
  purchaseId: string,
  amount: number,
  accountName: string = "Cash"
): PurchaseRecord | null {
  const current = getStoredPurchases();
  const idx = current.findIndex((p) => p.id === purchaseId);
  if (idx === -1) return null;

  const target = current[idx];
  const newPaid = Math.min(target.netTotal, target.paidAmount + amount);
  const newDue = Math.max(0, target.netTotal - newPaid);
  const newPaymentStatus: PurchasePaymentStatus =
    newDue <= 0 ? "Paid" : newPaid > 0 ? "Partial" : "Pending";

  target.paidAmount = newPaid;
  target.dueAmount = newDue;
  target.paymentStatus = newPaymentStatus;
  if (!target.account) target.account = accountName;

  current[idx] = { ...target };
  saveStoredPurchases([...current]);
  return current[idx];
}

// Delete purchase
export function deleteStoredPurchase(id: string): boolean {
  const current = getStoredPurchases();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredPurchases(filtered);
  return true;
}

// ====================== PURCHASE RETURNS STORAGE ======================
export function getStoredPurchaseReturns(): PurchaseReturnRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RETURNS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RETURNS, JSON.stringify(initialReturns));
      return initialReturns;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_RETURNS, JSON.stringify(initialReturns));
      return initialReturns;
    }
    return parsed;
  } catch {
    return initialReturns;
  }
}

export function saveStoredPurchaseReturns(list: PurchaseReturnRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RETURNS, JSON.stringify(list));
    window.dispatchEvent(new Event(STORAGE_EVENT_RETURNS));
  } catch (err) {
    console.error("Failed to save purchase returns to localStorage", err);
  }
}

export function addStoredPurchaseReturn(
  record: Omit<PurchaseReturnRecord, "id" | "returnNumber" | "createdAt">
): PurchaseReturnRecord {
  const current = getStoredPurchaseReturns();
  const nextNum = current.length + 21;
  const returnNum = `#PR00${nextNum}`;

  const newReturn: PurchaseReturnRecord = {
    ...record,
    id: `ret-${Date.now()}`,
    returnNumber: returnNum,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newReturn, ...current];
  saveStoredPurchaseReturns(updated);

  // If status is "Deducted from Due", adjust original purchase due
  if (record.refundStatus === "Deducted from Due") {
    const purchases = getStoredPurchases();
    const targetPur = purchases.find(
      (p) =>
        p.invoiceNumber === record.purchaseInvoice ||
        p.purchaseNumber === record.purchaseInvoice
    );
    if (targetPur) {
      const adjustedDue = Math.max(0, targetPur.dueAmount - record.totalRefundAmount);
      updateStoredPurchase(targetPur.id, {
        dueAmount: adjustedDue,
        paymentStatus: adjustedDue === 0 ? "Paid" : "Partial",
      });
    }
  }

  return newReturn;
}

export function deleteStoredPurchaseReturn(id: string): boolean {
  const current = getStoredPurchaseReturns();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;

  saveStoredPurchaseReturns(filtered);
  return true;
}

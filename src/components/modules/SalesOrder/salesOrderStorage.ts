export interface SalesOrderItem {
  id: string;
  description: string;
  model?: string;
  qty: number;
  rate: number;
  discount?: number;
  vat?: number;
  total: number;
}

export type SalesOrderStatus =
  | "Delivered"
  | "Processing"
  | "Shipped"
  | "Cancelled"
  | "Returned";

export type PaymentStatus = "Paid" | "Unpaid" | "Partial" | "Returned";

export interface SalesOrder {
  id: string;
  orderNumber: string; // e.g. #SO0020
  invoiceNumber?: string; // e.g. INV-0016
  customer: string;
  customerCompany?: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCountry?: string;
  orderDate: string; // e.g. 11 Sep 2025
  deliveryDate: string; // e.g. 18 Sep 2025
  paymentMethod: "Credit Card" | "Cash" | "Bank Transfer" | "Mobile Pay" | "PayPal";
  reference: string;
  status: SalesOrderStatus;
  paymentStatus: PaymentStatus;
  items: SalesOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
}

const STORAGE_KEY = "nexora_sales_orders_data";
const STORAGE_EVENT = "nexora_sales_orders_updated";

export const initialSalesOrders: SalesOrder[] = [
  {
    id: "so-20",
    orderNumber: "#SO0020",
    invoiceNumber: "INV-0020",
    customer: "Alexander Kenn",
    customerCompany: "TechCorp Inc",
    customerEmail: "alexander@techcorp.com",
    customerPhone: "+1 (555) 234-5678",
    customerAddress: "123 Tech Blvd, San Francisco, CA",
    customerCountry: "United States",
    orderDate: "11 Sep 2025",
    deliveryDate: "18 Sep 2025",
    paymentMethod: "Credit Card",
    reference: "For Purchase",
    status: "Delivered",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-1",
        description: "VoltX Charger",
        model: "VX-CH-01",
        qty: 1,
        rate: 1000,
        discount: 0,
        vat: 0,
        total: 1000,
      },
      {
        id: "item-2",
        description: "PixelPro Camera",
        model: "PX-CAM-9",
        qty: 1,
        rate: 250,
        discount: 0,
        vat: 0,
        total: 250,
      },
      {
        id: "item-3",
        description: "Industrial Multi-Port Hub",
        model: "HUB-PRO-4",
        qty: 3,
        rate: 3750,
        discount: 0,
        vat: 0,
        total: 11250,
      },
    ],
    subtotal: 12500,
    discount: 0,
    tax: 0,
    totalAmount: 12500,
    paidAmount: 12500,
    dueAmount: 0,
    notes: "Express commercial delivery requested.",
  },
  {
    id: "so-19",
    orderNumber: "#SO0019",
    invoiceNumber: "INV-0019",
    customer: "Gabriella White",
    customerCompany: "White & Co Design",
    customerEmail: "gabriella@whitedesign.com",
    customerPhone: "+1 (555) 876-5432",
    customerAddress: "456 Market St, Chicago, IL",
    customerCountry: "United States",
    orderDate: "05 Sep 2025",
    deliveryDate: "12 Sep 2025",
    paymentMethod: "Credit Card",
    reference: "PO-7749",
    status: "Processing",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-4",
        description: "Design Pro Tablet",
        model: "DPT-11X",
        qty: 2,
        rate: 3500,
        discount: 250,
        vat: 0,
        total: 6750,
      },
      {
        id: "item-5",
        description: "Stylus Pen Ultra",
        model: "SP-U2",
        qty: 4,
        rate: 500,
        discount: 0,
        vat: 0,
        total: 2000,
      },
    ],
    subtotal: 9000,
    discount: 250,
    tax: 0,
    totalAmount: 8750,
    paidAmount: 8750,
    dueAmount: 0,
    notes: "Fragile electronics packaging required.",
  },
  {
    id: "so-18",
    orderNumber: "#SO0018",
    invoiceNumber: "INV-0018",
    customer: "Christopher Rey",
    customerCompany: "Apex Logistics",
    customerEmail: "christopher@apexlogistics.com",
    customerPhone: "+1 (555) 432-8765",
    customerAddress: "789 Freight Way, Seattle, WA",
    customerCountry: "United States",
    orderDate: "27 Aug 2025",
    deliveryDate: "04 Sep 2025",
    paymentMethod: "Bank Transfer",
    reference: "Corporate PO-890",
    status: "Shipped",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-6",
        description: "Barcode Scanning Terminals",
        model: "BST-9000",
        qty: 4,
        rate: 3000,
        discount: 0,
        vat: 0,
        total: 12000,
      },
      {
        id: "item-7",
        description: "Docking Stations & Cables",
        model: "DS-CAB-SET",
        qty: 3,
        rate: 1200,
        discount: 0,
        vat: 0,
        total: 3600,
      },
    ],
    subtotal: 15600,
    discount: 0,
    tax: 0,
    totalAmount: 15600,
    paidAmount: 15600,
    dueAmount: 0,
    notes: "Dispatched via standard freight.",
  },
  {
    id: "so-17",
    orderNumber: "#SO0017",
    invoiceNumber: "INV-0017",
    customer: "Penelope Ton",
    customerCompany: "Ton Enterprises",
    customerEmail: "penelope@tonent.com",
    customerPhone: "+1 (555) 321-9876",
    customerAddress: "321 Oak St, Austin, TX",
    customerCountry: "United States",
    orderDate: "16 Aug 2025",
    deliveryDate: "23 Aug 2025",
    paymentMethod: "Credit Card",
    reference: "REF-4451",
    status: "Cancelled",
    paymentStatus: "Unpaid",
    items: [
      {
        id: "item-8",
        description: "Ergonomic Office Chair",
        model: "EOC-CHAIR-BLK",
        qty: 2,
        rate: 1600,
        discount: 0,
        vat: 0,
        total: 3200,
      },
    ],
    subtotal: 3200,
    discount: 0,
    tax: 0,
    totalAmount: 3200,
    paidAmount: 0,
    dueAmount: 3200,
    notes: "Order cancelled by client before dispatch.",
  },
  {
    id: "so-16",
    orderNumber: "#SO0016",
    invoiceNumber: "INV-0016",
    customer: "Walking Customer",
    customerCompany: "Walk-in Retail",
    customerEmail: "walking@customer.com",
    customerPhone: "0000000000",
    customerAddress: "Industrial Area 2, Sharjah, UAE",
    customerCountry: "United Arab Emirates",
    orderDate: "19 Oct 2026",
    deliveryDate: "19 Oct 2026",
    paymentMethod: "Cash",
    reference: "Retail Sale",
    status: "Returned",
    paymentStatus: "Returned",
    items: [
      {
        id: "item-9",
        description: "Heavy Dry Iron",
        model: "241000TCRB",
        qty: 1,
        rate: 1600,
        discount: 10,
        vat: 0,
        total: 1590,
      },
    ],
    subtotal: 1600,
    discount: 10,
    tax: 0,
    totalAmount: 1590,
    paidAmount: 1430,
    dueAmount: 160,
    notes: "Customer returned product due to model exchange requirement.",
  },
  {
    id: "so-15",
    orderNumber: "#SO0015",
    invoiceNumber: "INV-0015",
    customer: "Anwar Ali",
    customerCompany: "Ali Traders",
    customerEmail: "anwar.ali@alitrades.com",
    customerPhone: "0125698745",
    customerAddress: "Plot 45, Gulshan, Dhaka",
    customerCountry: "Bangladesh",
    orderDate: "19 Oct 2026",
    deliveryDate: "20 Oct 2026",
    paymentMethod: "Cash",
    reference: "Invoice #15",
    status: "Delivered",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-10",
        description: "Cotton Polo Shirt Premium",
        model: "CPS-NAVY-L",
        qty: 2,
        rate: 270,
        discount: 0,
        vat: 0,
        total: 540,
      },
    ],
    subtotal: 540,
    discount: 0,
    tax: 0,
    totalAmount: 540,
    paidAmount: 540,
    dueAmount: 0,
    notes: "Counter cash payment completed.",
  },
  {
    id: "so-14",
    orderNumber: "#SO0014",
    invoiceNumber: "INV-0014",
    customer: "Daniel Foster",
    customerCompany: "Foster Tech Services",
    customerEmail: "daniel@fostertech.com",
    customerPhone: "+1 (555) 765-4321",
    customerAddress: "100 Pine St, Boston, MA",
    customerCountry: "United States",
    orderDate: "25 Jul 2025",
    deliveryDate: "02 Aug 2025",
    paymentMethod: "Bank Transfer",
    reference: "PO-3329",
    status: "Delivered",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-11",
        description: "Rackmount Server Units",
        model: "SRV-RACK-4U",
        qty: 4,
        rate: 4500,
        discount: 0,
        vat: 0,
        total: 18000,
      },
      {
        id: "item-12",
        description: "Redundant Power Modules",
        model: "PWR-MOD-750",
        qty: 6,
        rate: 733.33,
        discount: 0,
        vat: 0,
        total: 4400,
      },
    ],
    subtotal: 22400,
    discount: 0,
    tax: 0,
    totalAmount: 22400,
    paidAmount: 22400,
    dueAmount: 0,
    notes: "Server equipment delivered to data center.",
  },
  {
    id: "so-13",
    orderNumber: "#SO0013",
    invoiceNumber: "INV-0013",
    customer: "Anastasia Leton",
    customerCompany: "Leton Media Hub",
    customerEmail: "anastasia@letonmedia.com",
    customerPhone: "+1 (555) 654-3210",
    customerAddress: "654 Sunset Blvd, Los Angeles, CA",
    customerCountry: "United States",
    orderDate: "12 Jul 2025",
    deliveryDate: "19 Jul 2025",
    paymentMethod: "Credit Card",
    reference: "MEDIA-881",
    status: "Shipped",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-13",
        description: "4K Studio Broadcast Monitor",
        model: "MON-4K-27",
        qty: 2,
        rate: 2600,
        discount: 0,
        vat: 0,
        total: 5200,
      },
      {
        id: "item-14",
        description: "Heavy Duty Boom Arm & Mount",
        model: "BOOM-ARM-PRO",
        qty: 2,
        rate: 600,
        discount: 0,
        vat: 0,
        total: 1200,
      },
    ],
    subtotal: 6400,
    discount: 0,
    tax: 0,
    totalAmount: 6400,
    paidAmount: 6400,
    dueAmount: 0,
    notes: "Direct courier delivery in progress.",
  },
  {
    id: "so-12",
    orderNumber: "#SO0012",
    invoiceNumber: "INV-0012",
    customer: "Noah Bennett",
    customerCompany: "Bennett Industrial",
    customerEmail: "noah@bennettind.com",
    customerPhone: "+1 (555) 987-1234",
    customerAddress: "888 Factory Rd, Detroit, MI",
    customerCountry: "United States",
    orderDate: "23 Jun 2025",
    deliveryDate: "30 Jun 2025",
    paymentMethod: "Bank Transfer",
    reference: "REF-IND-76",
    status: "Delivered",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-15",
        description: "Industrial Thermal Printers",
        model: "PRN-TH-500",
        qty: 6,
        rate: 1883.33,
        discount: 0,
        vat: 0,
        total: 11300,
      },
    ],
    subtotal: 11300,
    discount: 0,
    tax: 0,
    totalAmount: 11300,
    paidAmount: 11300,
    dueAmount: 0,
    notes: "Installation and testing completed on delivery.",
  },
  {
    id: "so-11",
    orderNumber: "#SO0011",
    invoiceNumber: "INV-0011",
    customer: "Victoria Ellsworth",
    customerCompany: "Ellsworth Fashion House",
    customerEmail: "victoria@ellsworth.co",
    customerPhone: "+1 (555) 543-2109",
    customerAddress: "500 5th Ave, New York, NY",
    customerCountry: "United States",
    orderDate: "07 Jun 2025",
    deliveryDate: "14 Jun 2025",
    paymentMethod: "Credit Card",
    reference: "SPRING-COLL-25",
    status: "Processing",
    paymentStatus: "Partial",
    items: [
      {
        id: "item-16",
        description: "Silk Evening Gown Collection",
        model: "SILK-EVE-04",
        qty: 3,
        rate: 2616.67,
        discount: 0,
        vat: 0,
        total: 7850,
      },
    ],
    subtotal: 7850,
    discount: 0,
    tax: 0,
    totalAmount: 7850,
    paidAmount: 4000,
    dueAmount: 3850,
    notes: "50% deposit received. Balance due upon delivery.",
  },
  {
    id: "so-10",
    orderNumber: "#SO0010",
    invoiceNumber: "INV-0010",
    customer: "Tariqul Islam",
    customerCompany: "Apex Textiles Ltd",
    customerEmail: "tariqul@apextextiles.com",
    customerPhone: "01675617719",
    customerAddress: "Sector 3, Uttara, Dhaka",
    customerCountry: "Bangladesh",
    orderDate: "11 Oct 2026",
    deliveryDate: "18 Oct 2026",
    paymentMethod: "Bank Transfer",
    reference: "TEX-9901",
    status: "Delivered",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-17",
        description: "Cotton Yarn 30s Combed",
        model: "YARN-30-CMB",
        qty: 10,
        rate: 1844,
        discount: 0,
        vat: 0,
        total: 18440,
      },
    ],
    subtotal: 18440,
    discount: 0,
    tax: 0,
    totalAmount: 18440,
    paidAmount: 18440,
    dueAmount: 0,
    notes: "Bulk yarn dispatch verified.",
  },
  {
    id: "so-09",
    orderNumber: "#SO0009",
    invoiceNumber: "INV-0009",
    customer: "Noah Kensington",
    customerCompany: "Kensington Corp",
    customerEmail: "noah.k@kensington.org",
    customerPhone: "+1 (555) 345-6789",
    customerAddress: "220 Broad St, Philadelphia, PA",
    customerCountry: "United States",
    orderDate: "28 May 2025",
    deliveryDate: "04 Jun 2025",
    paymentMethod: "Bank Transfer",
    reference: "PO-KEN-440",
    status: "Delivered",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-18",
        description: "Enterprise Workstation PCs",
        model: "WS-XEON-E5",
        qty: 8,
        rate: 1675,
        discount: 0,
        vat: 0,
        total: 13400,
      },
    ],
    subtotal: 13400,
    discount: 0,
    tax: 0,
    totalAmount: 13400,
    paidAmount: 13400,
    dueAmount: 0,
    notes: "Multi-seat workstation setup.",
  },
  {
    id: "so-08",
    orderNumber: "#SO0008",
    invoiceNumber: "INV-0008",
    customer: "Catherine Lan",
    customerCompany: "Lan Creative",
    customerEmail: "catherine@lancreative.io",
    customerPhone: "+1 (555) 789-0123",
    customerAddress: "77 Innovation Ave, San Jose, CA",
    customerCountry: "United States",
    orderDate: "18 May 2025",
    deliveryDate: "25 May 2025",
    paymentMethod: "Credit Card",
    reference: "REF-LAN-88",
    status: "Delivered",
    paymentStatus: "Paid",
    items: [
      {
        id: "item-19",
        description: "Color Calibrated Display",
        model: "DISP-CC-32",
        qty: 2,
        rate: 2450,
        discount: 0,
        vat: 0,
        total: 4900,
      },
    ],
    subtotal: 4900,
    discount: 0,
    tax: 0,
    totalAmount: 4900,
    paidAmount: 4900,
    dueAmount: 0,
    notes: "Includes 3-year commercial on-site warranty.",
  },
];

export function getStoredSalesOrders(): SalesOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSalesOrders));
      return initialSalesOrders;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSalesOrders));
    return initialSalesOrders;
  } catch {
    return initialSalesOrders;
  }
}

export function getStoredSalesOrderById(id: string): SalesOrder | undefined {
  const orders = getStoredSalesOrders();
  return orders.find(
    (o) =>
      o.id === id ||
      o.orderNumber.toLowerCase() === id.toLowerCase() ||
      o.orderNumber.replace("#", "").toLowerCase() === id.replace("#", "").toLowerCase() ||
      (o.invoiceNumber && o.invoiceNumber.toLowerCase() === id.toLowerCase())
  );
}

function saveSalesOrders(orders: SalesOrder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error("Failed to save sales orders to localStorage", err);
  }
}

export function addStoredSalesOrder(
  orderData: Omit<SalesOrder, "id" | "orderNumber" | "totalAmount" | "dueAmount"> & {
    orderNumber?: string;
  }
): SalesOrder {
  const orders = getStoredSalesOrders();
  const nextNum = orders.length + 21;
  const orderNumber = orderData.orderNumber || `#SO00${nextNum}`;
  const totalAmount = Math.max(0, orderData.subtotal - (orderData.discount || 0) + (orderData.tax || 0));
  const dueAmount = Math.max(0, totalAmount - (orderData.paidAmount || 0));

  const newOrder: SalesOrder = {
    ...orderData,
    id: `so-${Date.now()}`,
    orderNumber,
    totalAmount,
    dueAmount,
  };

  const updated = [newOrder, ...orders];
  saveSalesOrders(updated);
  return newOrder;
}

export function updateStoredSalesOrder(
  id: string,
  updates: Partial<SalesOrder>
): SalesOrder | null {
  const orders = getStoredSalesOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const current = orders[index];
  const merged: SalesOrder = {
    ...current,
    ...updates,
  };

  // Recalculate totals
  const totalAmount = Math.max(
    0,
    merged.subtotal - (merged.discount || 0) + (merged.tax || 0)
  );
  merged.totalAmount = totalAmount;
  merged.dueAmount = Math.max(0, totalAmount - (merged.paidAmount || 0));

  orders[index] = merged;
  saveSalesOrders(orders);
  return merged;
}

export function deleteStoredSalesOrder(id: string): boolean {
  const orders = getStoredSalesOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) return false;
  saveSalesOrders(filtered);
  return true;
}

export function processReturnSalesOrder(id: string): SalesOrder | null {
  return updateStoredSalesOrder(id, {
    status: "Returned",
    paymentStatus: "Returned",
  });
}

export function resetSalesOrdersToDefault(): SalesOrder[] {
  saveSalesOrders(initialSalesOrders);
  return initialSalesOrders;
}

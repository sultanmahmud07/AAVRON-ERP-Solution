import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  Plus,
  Calendar,
  X,
  Printer,
  Download,
  Mail,
  MessageSquare,
  ArrowLeft,
  Search,
  CheckCircle2,
  UserPlus,
  ArrowRightLeft,
  Save,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredCustomers,
  addStoredCustomer,
  CustomerItem,
} from "../Customer/customerStorage";
import {
  getStoredQuotationById,
  addStoredQuotation,
  updateStoredQuotation,
  QuotationItem,
  QuotationLineItem,
} from "./quotationStorage";
import { addStoredSalesOrder, SalesOrder } from "../SalesOrder/salesOrderStorage";
import { getStoredProducts } from "../Product/productStorage";

// Sample catalog for quick autocomplete
const SAMPLE_CATALOG = [
  {
    name: "Air Fryer 1500W [271474]",
    variant: "No variants",
    stock: "14",
    saleRate: 8500,
    vatPercent: 0,
  },
  {
    name: "Rice Cooker [625125]",
    variant: "No variants",
    stock: "20",
    saleRate: 3500,
    vatPercent: 0,
  },
  {
    name: "Ac installation [459377]",
    variant: "Not applicable",
    stock: "-",
    saleRate: 1500,
    vatPercent: 5,
  },
  {
    name: "VoltX Fast Charger 65W",
    variant: "Type-C GaN",
    stock: "35",
    saleRate: 1650,
    vatPercent: 5,
  },
  {
    name: "Inverter AC 1.5 Ton Copper",
    variant: "1.5 Ton Eco",
    stock: "8",
    saleRate: 82000,
    vatPercent: 7.5,
  },
  {
    name: "Industrial Angle Grinder 850W",
    variant: "Heavy Duty",
    stock: "12",
    saleRate: 4800,
    vatPercent: 5,
  },
];

interface FormLineItem {
  id: string;
  name: string;
  variant: string;
  qty: number | string;
  rate: number | string;
  discountStr: string;
  vatPercent: number | string;
}

interface PaymentRow {
  id: string;
  account: string;
  transactionId: string;
  amount: number | string;
}

interface CreateQuotationProps {
  initialMode?: "create" | "edit" | "convert";
}

export default function CreateQuotation({ initialMode }: CreateQuotationProps) {
  const navigate = useNavigate();
  const { quoteId } = useParams<{ quoteId?: string }>();

  // Determine mode
  const mode = useMemo<"create" | "edit" | "convert">(() => {
    if (initialMode) return initialMode;
    if (window.location.pathname.includes("/convert")) return "convert";
    if (window.location.pathname.includes("/edit")) return "edit";
    return "create";
  }, [initialMode]);

  // Currency symbol toggle ($ or ৳)
  const [currencySymbol, setCurrencySymbol] = useState<"৳" | "$">("৳");

  // Clients
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Invoice / Quotation Date (e.g. 09/12/2026)
  const [invoiceDate, setInvoiceDate] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });

  // Quotation line items (matching image 2 defaults for Abul Hasnat)
  const [items, setItems] = useState<FormLineItem[]>([
    {
      id: "qrow-1",
      name: "Air Fryer 1500W [271474]",
      variant: "No variants",
      qty: 10,
      rate: 8500,
      discountStr: "0.00",
      vatPercent: 0,
    },
    {
      id: "qrow-2",
      name: "Rice Cooker [625125]",
      variant: "No variants",
      qty: 10,
      rate: 3500,
      discountStr: "0.00",
      vatPercent: 0,
    },
  ]);

  // Adjustments (Image 2 shows Shipping 500.00, Discount 200.00)
  const [shippingCost, setShippingCost] = useState<number | string>(500);
  const [discountStr, setDiscountStr] = useState<string>("200");

  // Payments
  const [hasMultiplePayments, setHasMultiplePayments] = useState<boolean>(false);
  const [singleAccount, setSingleAccount] = useState<string>("");
  const [singleTransactionId, setSingleTransactionId] = useState<string>("");
  const [singleAmountPaid, setSingleAmountPaid] = useState<number | string>(0);
  const [payments, setPayments] = useState<PaymentRow[]>([
    { id: "p-1", account: "Bkash", transactionId: "", amount: 0 },
  ]);

  // Note
  const [note, setNote] = useState<string>("");

  // Quick Add Client Modal
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientCountry, setNewClientCountry] = useState("Bangladesh");

  // Active search index for item autocomplete
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);

  // Existing quote being edited or converted
  const [existingQuote, setExistingQuote] = useState<QuotationItem | null>(null);

  // Post-convert order modal
  const [convertedOrder, setConvertedOrder] = useState<SalesOrder | null>(null);
  const [invoiceViewMode, setInvoiceViewMode] = useState<"default" | "pos">("default");

  // Load clients & initial data
  useEffect(() => {
    const custs = getStoredCustomers();
    setCustomers(custs);

    if (quoteId) {
      const found = getStoredQuotationById(quoteId);
      if (found) {
        setExistingQuote(found);
        setSelectedCustomerId(found.clientId);
        setInvoiceDate(found.date);
        setShippingCost(found.shippingCost);
        setDiscountStr(String(found.discount));
        setNote(found.note || "");
        if (found.items && found.items.length > 0) {
          setItems(
            found.items.map((it, idx) => ({
              id: it.id || `qrow-${idx}`,
              name: it.name,
              variant: it.variant,
              qty: it.qty,
              rate: it.rate,
              discountStr: it.discountStr || String(it.discount || 0),
              vatPercent: it.vatPercent,
            }))
          );
        }
        if (found.hasMultiplePayments && found.payments) {
          setHasMultiplePayments(true);
          setPayments(
            found.payments.map((p, idx) => ({
              id: `p-${idx}`,
              account: p.account,
              transactionId: p.transactionId,
              amount: p.amount,
            }))
          );
        } else {
          setSingleAccount(found.paymentAccount || "");
          setSingleTransactionId(found.transactionId || "");
          setSingleAmountPaid(found.paidAmount || 0);
        }
        return;
      }
    }

    // Default select "Abul Hasnat" matching image 2, or first
    const hasnat = custs.find((c) => c.name.toLowerCase().includes("abul hasnat"));
    if (hasnat) {
      setSelectedCustomerId(hasnat.id);
    } else if (custs.length > 0) {
      setSelectedCustomerId(custs[0].id);
    }
  }, [quoteId]);

  // Current client details
  const currentCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Calculation per row
  const calculateRow = (row: FormLineItem) => {
    const qty = Number(row.qty) || 0;
    const rate = Number(row.rate) || 0;
    const baseSubtotal = qty * rate;

    // Row Discount
    let rowDiscount = 0;
    const rawDisc = (row.discountStr || "").trim();
    if (rawDisc.endsWith("%")) {
      const pct = parseFloat(rawDisc.replace("%", "")) || 0;
      rowDiscount = (pct / 100) * baseSubtotal;
    } else {
      rowDiscount = parseFloat(rawDisc) || 0;
    }
    rowDiscount = Math.min(baseSubtotal, Math.max(0, rowDiscount));

    const discountedBase = Math.max(0, baseSubtotal - rowDiscount);
    const vatAmount = (Number(row.vatPercent || 0) / 100) * discountedBase;
    const total = discountedBase + vatAmount;

    return {
      baseSubtotal,
      rowDiscount,
      discountedBase,
      vatAmount,
      total,
    };
  };

  // Grand totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, row) => sum + calculateRow(row).baseSubtotal, 0);
  }, [items]);

  const totalItemDiscount = useMemo(() => {
    return items.reduce((sum, row) => sum + calculateRow(row).rowDiscount, 0);
  }, [items]);

  const totalVat = useMemo(() => {
    return items.reduce((sum, row) => sum + calculateRow(row).vatAmount, 0);
  }, [items]);

  const numShipping = Number(shippingCost) || 0;

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - totalItemDiscount + totalVat + numShipping);
  }, [subtotal, totalItemDiscount, totalVat, numShipping]);

  const overallDiscount = useMemo(() => {
    const raw = (discountStr || "").trim();
    if (raw.endsWith("%")) {
      const pct = parseFloat(raw.replace("%", "")) || 0;
      return (pct / 100) * grandTotal;
    }
    return parseFloat(raw) || 0;
  }, [discountStr, grandTotal]);

  const netTotal = useMemo(() => {
    return Math.max(0, grandTotal - overallDiscount);
  }, [grandTotal, overallDiscount]);

  // Total Paid & Due
  const totalPaid = useMemo(() => {
    if (hasMultiplePayments) {
      return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }
    return Number(singleAmountPaid) || 0;
  }, [hasMultiplePayments, payments, singleAmountPaid]);

  const dueAmount = useMemo(() => {
    return Math.max(0, netTotal - totalPaid);
  }, [netTotal, totalPaid]);

  // Handle Item Row Changes
  const handleItemChange = (
    index: number,
    field: keyof FormLineItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Select item from catalog
  const handleSelectCatalogItem = (
    index: number,
    cat: { name: string; variant: string; saleRate: number; vatPercent: number }
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            name: cat.name,
            variant: cat.variant,
            rate: cat.saleRate,
            vatPercent: cat.vatPercent,
            qty: 1,
            discountStr: "0.00",
          };
        }
        return item;
      })
    );
    setActiveSearchIndex(null);
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: "qrow-" + Date.now(),
        name: "",
        variant: "No variants",
        qty: 1,
        rate: 0,
        discountStr: "0.00",
        vatPercent: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) {
      toast.info("At least one product item is required");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Multiple Payments Handlers
  const handleAddPaymentRow = () => {
    setPayments((prev) => [
      ...prev,
      { id: "p-" + Date.now(), account: "Cash", transactionId: "", amount: 0 },
    ]);
  };

  const handleUpdatePayment = (
    index: number,
    field: keyof PaymentRow,
    value: string | number
  ) => {
    setPayments((prev) =>
      prev.map((p, i) => {
        if (i === index) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleRemovePayment = (index: number) => {
    if (payments.length <= 1) {
      toast.info("At least one payment row is required");
      return;
    }
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick Add Client
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error("Please enter client name");
      return;
    }
    if (!newClientPhone.trim()) {
      toast.error("Please enter client phone number");
      return;
    }

    const created = addStoredCustomer(
      newClientName.trim(),
      newClientEmail.trim() || `${newClientName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      newClientPhone.trim(),
      newClientCountry,
      newClientAddress.trim() || undefined,
      "Active"
    );

    const updated = getStoredCustomers();
    setCustomers(updated);
    setSelectedCustomerId(created.id);
    setIsAddClientModalOpen(false);
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientCompany("");
    setNewClientAddress("");
    toast.success(`Client "${created.name}" added successfully!`);
  };

  // Build quotation line items payload
  const buildQuotationPayload = () => {
    const validItems = items.filter((it) => it.name.trim() !== "");
    const lineItems: QuotationLineItem[] = validItems.map((row, idx) => {
      const calc = calculateRow(row);
      return {
        id: `item-${Date.now()}-${idx}`,
        name: row.name,
        variant: row.variant,
        qty: Number(row.qty) || 1,
        rate: Number(row.rate) || 0,
        discount: calc.rowDiscount,
        discountStr: row.discountStr,
        vatPercent: Number(row.vatPercent) || 0,
        vatAmount: calc.vatAmount,
        total: calc.total,
      };
    });

    const cust = currentCustomer || {
      name: "Abul Hasnat",
      phone: "0158459632",
      email: "abul.hasnat@example.com",
      company: "Hasnat Enterprises Ltd",
      address: "Gulshan-1, Dhaka",
    };

    return {
      clientId: selectedCustomerId,
      clientName: cust.name,
      clientPhone: cust.phone,
      clientEmail: cust.email,
      clientCompany: ("company" in cust ? (cust as { company?: string }).company : undefined) || newClientCompany || "Hasnat Enterprises Ltd",
      clientAddress: cust.address || "Dhaka, Bangladesh",
      date: invoiceDate,
      items: lineItems,
      subtotal,
      totalVat,
      shippingCost: numShipping,
      grandTotal,
      discount: overallDiscount,
      netTotal,
      paidAmount: totalPaid,
      dueAmount,
      hasMultiplePayments,
      payments: hasMultiplePayments
        ? payments.map((p) => ({
          account: p.account,
          transactionId: p.transactionId,
          amount: Number(p.amount) || 0,
        }))
        : undefined,
      paymentAccount: !hasMultiplePayments ? singleAccount : undefined,
      transactionId: !hasMultiplePayments ? singleTransactionId : undefined,
      note,
    };
  };

  // Save Quotation (as Quote without converting)
  const handleSaveQuotation = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a client");
      return;
    }
    const validItems = items.filter((it) => it.name.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    const payload = buildQuotationPayload();

    if (existingQuote) {
      updateStoredQuotation(existingQuote.id, {
        ...payload,
        status: existingQuote.status,
      });
      toast.success(`Quotation "${existingQuote.quotationNumber}" saved successfully!`);
    } else {
      const newQ = addStoredQuotation({
        ...payload,
        status: "Pending",
      });
      toast.success(`Quotation "${newQ.quotationNumber}" created successfully!`);
    }
    navigate("/sales/quotes/list");
  };

  // Convert Quotation To Live Invoice
  const handleConvertToInvoice = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a client");
      return;
    }
    const validItems = items.filter((it) => it.name.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    const payload = buildQuotationPayload();

    // 1. Create or update quotation as Converted
    const quoteNum = existingQuote ? existingQuote.quotationNumber : "INV-0001";
    let quoteRecord = existingQuote;
    if (!quoteRecord) {
      quoteRecord = addStoredQuotation({
        ...payload,
        status: "Converted",
      });
    }

    // 2. Generate Sales Order in salesOrderStorage
    const orderItems = payload.items.map((it, idx) => ({
      id: `so-item-${Date.now()}-${idx}`,
      description: it.name,
      model: it.variant,
      qty: it.qty,
      rate: it.rate,
      discount: it.discount,
      vat: it.vatAmount,
      total: it.total,
    }));

    let payMethod: SalesOrder["paymentMethod"] = "Cash";
    let refInfo = `Converted from Quote ${quoteNum}`;
    if (hasMultiplePayments && payments.length > 0) {
      const firstAcc = payments[0].account;
      if (firstAcc === "Bkash" || firstAcc === "Nagad") payMethod = "Mobile Pay";
      else if (firstAcc === "Credit Card") payMethod = "Credit Card";
      else if (firstAcc === "Bank Transfer") payMethod = "Bank Transfer";
      refInfo = payments.map((p) => `${p.account}: ${p.amount}`).join(", ");
    } else if (singleAccount) {
      if (singleAccount === "Bkash" || singleAccount === "Nagad") payMethod = "Mobile Pay";
      else if (singleAccount === "Credit Card") payMethod = "Credit Card";
      else if (singleAccount === "Bank Transfer") payMethod = "Bank Transfer";
      refInfo = singleTransactionId || singleAccount;
    }

    const paymentStatus: SalesOrder["paymentStatus"] =
      dueAmount <= 0 ? "Paid" : totalPaid > 0 ? "Partial" : "Unpaid";

    const nextInvCode = `INV-00${Math.floor(10 + Math.random() * 89)}`;

    const newOrder = addStoredSalesOrder({
      orderNumber: `#SO00${Math.floor(20 + Math.random() * 80)}`,
      invoiceNumber: nextInvCode,
      customer: payload.clientName,
      customerCompany: payload.clientCompany,
      customerEmail: payload.clientEmail || "client@example.com",
      customerPhone: payload.clientPhone,
      customerAddress: payload.clientAddress,
      customerCountry: "Bangladesh",
      orderDate: invoiceDate,
      deliveryDate: invoiceDate,
      paymentMethod: payMethod,
      reference: refInfo,
      status: "Delivered",
      paymentStatus,
      items: orderItems,
      subtotal,
      discount: totalItemDiscount + overallDiscount,
      tax: totalVat,
      paidAmount: totalPaid,
      notes: note || `Converted from sales quote ${quoteNum}`,
    });

    // Mark quote as converted
    updateStoredQuotation(quoteRecord.id, {
      status: "Converted",
      convertedInvoiceNumber: nextInvCode,
    });

    setConvertedOrder(newOrder);
    toast.success(`Quotation converted to Invoice "${nextInvCode}" successfully!`);
  };

  const fmt = (num: number) => {
    return `${currencySymbol} ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const availableCatalog = useMemo(() => {
    const products = getStoredProducts();
    const fromStorage = products.map((p) => ({
      name: `${p.name} [${p.sku || p.barcode.slice(-6)}]`,
      variant: p.category || "Standard",
      saleRate: p.sellingPrice,
      vatPercent: 0,
    }));
    return [...SAMPLE_CATALOG, ...fromStorage];
  }, []);

  const pageTitle =
    mode === "convert"
      ? "Convert to Invoice"
      : mode === "edit"
        ? "Edit Quotation"
        : "Create Quotation";

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header matching Reference Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link
              to="/sales/quotes/list"
              className="hover:text-[#0c6760] dark:hover:text-teal-400 transition-colors"
            >
              Sales Quotes
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {pageTitle}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-[#0c6760]" />
            {pageTitle}
            {existingQuote && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                #{existingQuote.quotationNumber}
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Currency Toggle */}
          <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181b24] p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrencySymbol("৳")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${currencySymbol === "৳"
                ? "bg-[#0c6760] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              BDT (৳)
            </button>
            <button
              type="button"
              onClick={() => setCurrencySymbol("$")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${currencySymbol === "$"
                ? "bg-[#0c6760] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              USD ($)
            </button>
          </div>

          {/* Manage Quotations button matching Image 2 top right */}
          <Link
            to="/sales/quotes/list"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Manage Quotations</span>
          </Link>
        </div>
      </div>

      {/* Main Card (Exact layout matching Image 2) */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-7 space-y-6">
        {/* Client Selection & Invoice Date */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          <div className="lg:col-span-7 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Client <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] transition"
                >
                  <option value="" disabled>
                    Select client / customer...
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Add Client Button */}
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(true)}
                className="p-2.5 rounded-md bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors shrink-0 cursor-pointer"
                title="Add New Client"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Invoice Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md pl-3.5 pr-10 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760] transition"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Line Items Table (Matching Reference Image 2) */}
        <div className="overflow-x-auto rounded-md border border-slate-200/80 dark:border-slate-800/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-3.5 min-w-[220px]">
                  Item <span className="text-rose-500">*</span>
                </th>
                <th className="py-3 px-3.5 min-w-[140px]">Variant</th>
                <th className="py-3 px-3.5 min-w-[80px] text-center">
                  Qty <span className="text-rose-500">*</span>
                </th>
                <th className="py-3 px-3.5 min-w-[110px]">
                  Rate <span className="text-rose-500">*</span>
                </th>
                <th className="py-3 px-3.5 min-w-[110px]">Discount</th>
                <th className="py-3 px-3.5 min-w-[90px] text-center">VAT %</th>
                <th className="py-3 px-3.5 min-w-[90px] text-right">VAT</th>
                <th className="py-3 px-3.5 min-w-[100px] text-right">Total</th>
                <th className="py-3 px-3.5 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((row, index) => {
                const calc = calculateRow(row);
                const isSearching = activeSearchIndex === index;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Item Name / Search */}
                    <td className="py-2.5 px-3.5 relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => {
                            handleItemChange(index, "name", e.target.value);
                            setActiveSearchIndex(index);
                          }}
                          onFocus={() => setActiveSearchIndex(index)}
                          placeholder="Search product..."
                          className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-7 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760]"
                        />
                        {row.name ? (
                          <button
                            type="button"
                            onClick={() => {
                              handleItemChange(index, "name", "");
                              handleItemChange(index, "rate", 0);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>

                      {/* Autocomplete Dropdown */}
                      {isSearching && (
                        <div className="absolute left-3.5 right-3.5 top-full mt-1 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700 rounded-md shadow-xl z-30 max-h-56 overflow-y-auto p-1.5 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                            Available Inventory Products
                          </div>
                          {availableCatalog
                            .filter(
                              (p) =>
                                !row.name ||
                                p.name.toLowerCase().includes(row.name.toLowerCase())
                            )
                            .slice(0, 8)
                            .map((item, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleSelectCatalogItem(index, item)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition"
                              >
                                <div>
                                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                                    {item.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    Variant: {item.variant}
                                  </p>
                                </div>
                                <span className="font-bold text-[#0c6760] dark:text-teal-400 ml-2">
                                  {currencySymbol} {item.saleRate}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </td>

                    {/* Variant */}
                    <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400 font-medium">
                      {row.variant}
                    </td>

                    {/* Qty */}
                    <td className="py-2.5 px-3.5 text-center">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) =>
                          handleItemChange(index, "qty", parseFloat(e.target.value) || 1)
                        }
                        className="w-16 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-center text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760]"
                      />
                    </td>

                    {/* Rate */}
                    <td className="py-2.5 px-3.5">
                      <input
                        type="number"
                        min="0"
                        value={row.rate}
                        onChange={(e) =>
                          handleItemChange(index, "rate", parseFloat(e.target.value) || 0)
                        }
                        className="w-24 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760]"
                      />
                    </td>

                    {/* Discount */}
                    <td className="py-2.5 px-3.5">
                      <input
                        type="text"
                        value={row.discountStr}
                        onChange={(e) => handleItemChange(index, "discountStr", e.target.value)}
                        placeholder="0.00"
                        className="w-20 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760]"
                      />
                    </td>

                    {/* VAT % */}
                    <td className="py-2.5 px-3.5 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.vatPercent}
                        onChange={(e) =>
                          handleItemChange(index, "vatPercent", parseFloat(e.target.value) || 0)
                        }
                        className="w-16 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-center text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760]"
                      />
                    </td>

                    {/* VAT Amount */}
                    <td className="py-2.5 px-3.5 text-right font-medium text-slate-700 dark:text-slate-200">
                      {calc.vatAmount.toFixed(2)}
                    </td>

                    {/* Total */}
                    <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {calc.total.toFixed(2)}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Remove row"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Item Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddItemRow}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold border border-emerald-600 dark:border-teal-500 text-emerald-600 dark:text-teal-400 hover:bg-emerald-50 dark:hover:bg-teal-950/30 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Calculations Breakdown (Matching Image 2) */}
        <div className="flex flex-col items-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-full max-w-sm space-y-2.5 text-xs">
            {/* Subtotal */}
            <div className="flex items-center justify-between font-semibold text-slate-600 dark:text-slate-300">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {subtotal.toFixed(2)}
              </span>
            </div>

            {/* Total VAT */}
            <div className="flex items-center justify-between font-semibold text-slate-600 dark:text-slate-300">
              <span>Total VAT</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {totalVat.toFixed(2)}
              </span>
            </div>

            {/* Shipping Cost */}
            <div className="flex items-center justify-between font-semibold text-slate-600 dark:text-slate-300">
              <span>Shipping Cost</span>
              <div className="w-24">
                <input
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0c6760]"
                />
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between pt-1 font-bold text-sm text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800">
              <span>Grand Total</span>
              <span className="text-base font-black font-mono">
                {grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between font-semibold text-slate-600 dark:text-slate-300">
              <span>Discount</span>
              <div className="w-24">
                <input
                  type="text"
                  value={discountStr}
                  onChange={(e) => setDiscountStr(e.target.value)}
                  placeholder="200.00"
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0c6760]"
                />
              </div>
            </div>

            {/* Net Total */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white">
              <span className="text-base">Net Total</span>
              <span className="text-lg font-black font-mono text-[#0c6760] dark:text-teal-400">
                {netTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Options (Matching Image 2) */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={hasMultiplePayments}
              onChange={(e) => setHasMultiplePayments(e.target.checked)}
              className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] border-slate-300 dark:border-slate-700 cursor-pointer"
            />
            <span>Multiple Payment Options</span>
          </label>

          {!hasMultiplePayments ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account (Optional)
                </label>
                <select
                  value={singleAccount}
                  onChange={(e) => setSingleAccount(e.target.value)}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                >
                  <option value="">Select Account</option>
                  <option value="Cash">Cash Account</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank Transfer">City Bank Ltd</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={singleTransactionId}
                  onChange={(e) => setSingleTransactionId(e.target.value)}
                  placeholder="Reference / Transaction ID"
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={singleAmountPaid}
                    onChange={(e) => setSingleAmountPaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                  <button
                    type="button"
                    onClick={() => setSingleAmountPaid(netTotal)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0c6760] dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Pay Full
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {payments.map((p, pIdx) => (
                <div key={p.id} className="flex flex-col md:flex-row items-center gap-3">
                  <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Account <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={p.account}
                      onChange={(e) => handleUpdatePayment(pIdx, "account", e.target.value)}
                      className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    >
                      <option value="Bkash">Bkash</option>
                      <option value="Cash">Cash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={p.transactionId}
                      onChange={(e) => handleUpdatePayment(pIdx, "transactionId", e.target.value)}
                      placeholder="Reference / Transaction ID"
                      className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                    />
                  </div>

                  <div className="w-full md:w-1/3 flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Amount <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={p.amount}
                        onChange={(e) => handleUpdatePayment(pIdx, "amount", e.target.value)}
                        placeholder="500"
                        className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePayment(pIdx)}
                      className="p-2.5 rounded-md border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPaymentRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Payment</span>
              </button>
            </div>
          )}

          {/* Paid & Due Amounts */}
          <div className="flex flex-col items-end pt-3">
            <div className="w-full max-w-sm space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-600 dark:text-slate-300">
                <span>Paid Amount</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {totalPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-rose-600 dark:text-rose-400">
                <span>Due Amount</span>
                <span className="font-black text-sm font-mono">
                  {dueAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note & Action Buttons matching Image 2 */}
        <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note for this quotation"
              className="w-full min-w-[200px] sm:w-[320px] lg:w-[480px] bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
            />
          </div>

          {/* Save & Convert to Invoice buttons (Exact from Image 2) */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSaveQuotation}
              className="px-5 py-2.5 rounded-md font-bold text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>

            <button
              type="button"
              onClick={handleConvertToInvoice}
              className="px-5 py-2.5 rounded-md font-bold text-xs bg-[#0c6760] hover:bg-[#09544e] text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Convert to Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0c6760]" />
                Add New Client
              </h3>
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Abul Hasnat"
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="e.g. 0158459632"
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="hasnat@gmail.com"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    placeholder="Hasnat Agro"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <select
                    value={newClientCountry}
                    onChange={(e) => setNewClientCountry(e.target.value)}
                    className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="United States">United States</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Converted Invoice View Window (Matching Reference Images 3 & 4) */}
      {convertedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            {/* View Invoice Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 bg-white dark:bg-[#181b24] z-20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Invoice Created from Quotation
                </h2>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs">
                {/* Default vs POS toggle */}
                <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setInvoiceViewMode("default")}
                    className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${invoiceViewMode === "default"
                      ? "bg-[#0c6760] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300"
                      }`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceViewMode("pos")}
                    className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${invoiceViewMode === "pos"
                      ? "bg-[#0c6760] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300"
                      }`}
                  >
                    POS
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toast.success("SMS invoice link dispatched to customer!")}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  SMS
                </button>

                <button
                  type="button"
                  onClick={() => toast.success("Email invoice sent to customer!")}
                  className="px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.info("Preparing invoice download...");
                    setTimeout(() => window.print(), 300);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConvertedOrder(null);
                    navigate("/sales/quotes/list");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold cursor-pointer"
                >
                  Back to Quotes
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-8">
              {invoiceViewMode === "default" ? (
                <div className="bg-white dark:bg-[#12141c] rounded-md border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-6 text-slate-800 dark:text-slate-100 shadow-sm">
                  {/* Company Header & Barcode */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-md bg-[#0c6760] flex items-center justify-center text-white font-black text-lg">
                          N
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                            Redion IT Solution
                          </h3>
                          <p className="text-[10px] text-slate-400">NEXORA Enterprise ERP</p>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right space-y-1">
                      <svg className="w-48 h-8 text-slate-900 dark:text-white ml-auto" viewBox="0 0 160 32">
                        <rect x="0" y="0" width="3" height="32" fill="currentColor" />
                        <rect x="5" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="9" y="0" width="4" height="32" fill="currentColor" />
                        <rect x="15" y="0" width="1" height="32" fill="currentColor" />
                        <rect x="18" y="0" width="3" height="32" fill="currentColor" />
                        <rect x="23" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="27" y="0" width="5" height="32" fill="currentColor" />
                        <rect x="34" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="38" y="0" width="1" height="32" fill="currentColor" />
                        <rect x="41" y="0" width="4" height="32" fill="currentColor" />
                        <rect x="47" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="51" y="0" width="3" height="32" fill="currentColor" />
                        <rect x="56" y="0" width="1" height="32" fill="currentColor" />
                        <rect x="59" y="0" width="5" height="32" fill="currentColor" />
                        <rect x="66" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="70" y="0" width="3" height="32" fill="currentColor" />
                        <rect x="75" y="0" width="1" height="32" fill="currentColor" />
                        <rect x="78" y="0" width="4" height="32" fill="currentColor" />
                        <rect x="84" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="88" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="92" y="0" width="5" height="32" fill="currentColor" />
                        <rect x="99" y="0" width="1" height="32" fill="currentColor" />
                        <rect x="102" y="0" width="3" height="32" fill="currentColor" />
                        <rect x="107" y="0" width="4" height="32" fill="currentColor" />
                        <rect x="113" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="117" y="0" width="1" height="32" fill="currentColor" />
                        <rect x="120" y="0" width="4" height="32" fill="currentColor" />
                        <rect x="126" y="0" width="3" height="32" fill="currentColor" />
                        <rect x="131" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="135" y="0" width="5" height="32" fill="currentColor" />
                        <rect x="142" y="0" width="2" height="32" fill="currentColor" />
                        <rect x="146" y="0" width="1" height="32" fill="currentColor" />
                        <rect x="149" y="0" width="4" height="32" fill="currentColor" />
                        <rect x="155" y="0" width="3" height="32" fill="currentColor" />
                      </svg>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Invoice Number: #{convertedOrder.invoiceNumber || convertedOrder.orderNumber}
                      </p>
                      <div className="inline-block px-3 py-1 rounded bg-[#0c6760] text-white text-xs font-bold">
                        Invoice Date: {convertedOrder.orderDate}
                      </div>
                    </div>
                  </div>

                  {/* To / From */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase">Invoice To:</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {convertedOrder.customer}
                      </p>
                      {convertedOrder.customerCompany && <p>{convertedOrder.customerCompany}</p>}
                      <p>Email: {convertedOrder.customerEmail}</p>
                      <p>Mobile: {convertedOrder.customerPhone}</p>
                      <p>{convertedOrder.customerAddress}</p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        Redion IT Solution
                      </p>
                      <p>0565495023</p>
                      <p>Email: Redion@gmail.com</p>
                      <p>industrial Area2 Sharjah UAE</p>
                      <p>Mobile: 0565495023</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#1e293b] text-white text-[11px] font-bold uppercase">
                          <th className="py-2.5 px-3 text-left w-12">Sl.</th>
                          <th className="py-2.5 px-3 text-left">Item</th>
                          <th className="py-2.5 px-3 text-center w-16">Qty</th>
                          <th className="py-2.5 px-3 text-right">Price</th>
                          <th className="py-2.5 px-3 text-right">Discount</th>
                          <th className="py-2.5 px-3 text-right">Vat</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {convertedOrder.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold">{it.description}</td>
                            <td className="py-2.5 px-3 text-center">{it.qty}</td>
                            <td className="py-2.5 px-3 text-right">{fmt(it.rate)}</td>
                            <td className="py-2.5 px-3 text-right">{fmt(it.discount || 0)}</td>
                            <td className="py-2.5 px-3 text-right">{fmt(it.vat || 0)}</td>
                            <td className="py-2.5 px-3 text-right font-bold">{fmt(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end text-xs">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Subtotal:</span>
                        <span className="font-semibold">{fmt(convertedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">VAT / Tax:</span>
                        <span className="font-semibold">{fmt(convertedOrder.tax || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Shipping:</span>
                        <span className="font-semibold">{fmt(numShipping)}</span>
                      </div>
                      <div className="flex justify-between text-rose-500 font-semibold">
                        <span>Discount:</span>
                        <span>{fmt(convertedOrder.discount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span>Total:</span>
                        <span>{fmt(convertedOrder.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold">
                        <span>Paid Amount:</span>
                        <span>{fmt(convertedOrder.paidAmount || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-center text-slate-400">
                    <div>
                      <p className="font-mono">.....................................</p>
                      <p className="mt-1 font-semibold text-slate-600 dark:text-slate-300">
                        Authorized Signature
                      </p>
                    </div>
                    <div>
                      <p className="font-mono">.....................................</p>
                      <p className="mt-1 font-semibold text-slate-600 dark:text-slate-300">
                        Customer Signature
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 italic">
                    <p>Just wanted to say thank you for your purchase. We're so lucky to have customers like you!</p>
                    <p className="mt-1 font-semibold not-italic text-slate-500">Powered by NEXORA ERP</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-xs mx-auto bg-white text-slate-900 p-6 rounded-md border border-slate-300 shadow-md font-mono text-[11px] leading-relaxed select-text">
                  <div className="text-center space-y-0.5">
                    <p className="font-bold text-xs uppercase tracking-wider">REDION IT SOLUTION</p>
                    <p className="text-[10px] text-slate-600">industrial Area2 Sharjah UAE</p>
                    <p className="text-[10px] text-slate-600">Tel: 0565495023</p>
                  </div>

                  <div className="border-t border-dashed border-slate-400 my-2" />
                  <p className="text-center font-bold tracking-widest text-xs">INVOICE</p>
                  <div className="border-t border-dashed border-slate-400 my-2" />

                  <div className="space-y-0.5 text-[10px]">
                    <p>Bill No: {convertedOrder.invoiceNumber || convertedOrder.orderNumber}</p>
                    <p>Date: {convertedOrder.orderDate}</p>
                    <p>Name: {convertedOrder.customer}</p>
                    <p>Phone: {convertedOrder.customerPhone}</p>
                    <p>Billed By: Admin User</p>
                  </div>

                  <div className="border-t border-dashed border-slate-400 my-2" />

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-slate-300">
                      <span># Item</span>
                      <span>Qty</span>
                      <span>Amount</span>
                    </div>
                    {convertedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[10px]">
                        <span className="truncate max-w-[140px]">
                          {idx + 1} {it.description}
                        </span>
                        <span>{it.qty}</span>
                        <span className="font-bold">{fmt(it.total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-slate-400 my-2" />

                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{fmt(convertedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{fmt(numShipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{fmt(convertedOrder.discount || 0)}</span>
                    </div>
                    <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                      <span>Grand Total:</span>
                      <span>{fmt(convertedOrder.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-400 my-2" />

                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span>Paid Amount:</span>
                      <span>{fmt(convertedOrder.paidAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-600">
                      <span>Status:</span>
                      <span>
                        {convertedOrder.dueAmount <= 0
                          ? "PAID"
                          : convertedOrder.paidAmount > 0
                            ? "PARTIALLY PAID"
                            : "UNPAID"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-400 my-2" />

                  <div className="text-center text-[10px] text-slate-600 space-y-1">
                    <p>Thank you for choosing Us!</p>
                    <p>We look forward to serving you again.</p>
                    <p className="font-bold pt-1 text-slate-800">Powered By NEXORA ERP</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

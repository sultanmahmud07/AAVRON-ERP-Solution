import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Plus,
  Calendar,
  UserPlus,
  X,
  Trash2,
  Building2,
  Package,
  CreditCard,
  Receipt,
  RotateCcw,
  Hash,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredSuppliers,
  addStoredSupplier,
  SupplierItem,
} from "../Supplier/supplierStorage";
import {
  addStoredPurchase,
  PurchaseItem,
} from "./purchaseStorage";

// Pre-defined sample items for quick autocomplete
const QUICK_ITEMS = [
  { name: "Air Fryer 1500W", variant: "No variants", purchasePrice: 7000, salePrice: 8500, stock: 14 },
  { name: "Industrial Angle Grinder 850W", variant: "Heavy Duty", purchasePrice: 3850, salePrice: 4800, stock: 12 },
  { name: "Inverter AC 1.5 Ton Copper", variant: "1.5 Ton Eco", purchasePrice: 70000, salePrice: 82000, stock: 8 },
  { name: "Deluxe Rice Cooker 2.8L", variant: "Dual Pot", purchasePrice: 2500, salePrice: 3200, stock: 20 },
  { name: "Electric Kettle 1.8L", variant: "No variants", purchasePrice: 1050, salePrice: 1400, stock: 5 },
  { name: "Premium Cotton Crew Neck T-Shirt", variant: "Assorted (M, L, XL)", purchasePrice: 370, salePrice: 650, stock: 150 },
  { name: "VoltX Smart Fast Charger 65W", variant: "Type-C GaN", purchasePrice: 1200, salePrice: 1650, stock: 35 },
  { name: "Ergonomic Mesh Office Chair", variant: "High Back Black", purchasePrice: 9500, salePrice: 12800, stock: 10 },
];

export default function AddPurchase() {
  const navigate = useNavigate();

  // Currency selection ($ or ৳)
  const [currency, setCurrency] = useState<"৳" | "$">("৳");

  // Suppliers state
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // Top Form Fields
  const [purchaseDate, setPurchaseDate] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  });
  const [purchaseName, setPurchaseName] = useState<string>("");
  const [challanNo, setChallanNo] = useState<string>("");

  // Dynamic Item Rows
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: "item-" + Date.now(),
      name: "Air Fryer 1500W",
      variant: "No variants",
      stock: 14,
      qty: 1,
      purchasePrice: 7000,
      salePrice: 8500,
      discount: 0,
      vatPercent: 0,
      vatAmount: 0,
      total: 7000,
    },
  ]);

  // Calculations fields
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [flatDiscount, setFlatDiscount] = useState<number>(0);

  // Payment section
  const [hasMultiplePayments, setHasMultiplePayments] = useState<boolean>(false);
  const [paymentAccount, setPaymentAccount] = useState<string>("Cash");
  const [transactionId, setTransactionId] = useState<string>("");
  const [amountPaidInput, setAmountPaidInput] = useState<number | string>(0);

  // Quick Add Supplier Modal
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [newSupName, setNewSupName] = useState("");
  const [newSupCompany, setNewSupCompany] = useState("");
  const [newSupPhone, setNewSupPhone] = useState("");
  const [newSupEmail, setNewSupEmail] = useState("");
  const [newSupCountry, setNewSupCountry] = useState("Bangladesh");

  // Load suppliers on mount
  useEffect(() => {
    const list = getStoredSuppliers();
    setSuppliers(list);
    if (list.length > 0) {
      setSelectedSupplierId((prev) => prev || list[0].id);
    }
  }, []);

  // Format currency helper
  const formatMoney = (amount: number) => {
    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return currency === "৳" ? `৳ ${formatted}` : `$${formatted}`;
  };

  // Recompute single row totals
  const handleItemChange = (
    index: number,
    field: keyof PurchaseItem,
    val: string | number
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: val };

      // Ensure numbers
      const qty = Number(target.qty) || 0;
      const pPrice = Number(target.purchasePrice) || 0;
      const sPrice = Number(target.salePrice) || 0;
      const disc = Number(target.discount) || 0;
      const vatPct = Number(target.vatPercent) || 0;

      target.qty = qty;
      target.purchasePrice = pPrice;
      target.salePrice = sPrice;
      target.discount = disc;
      target.vatPercent = vatPct;

      // VAT and Line Total computation
      const baseAfterDisc = Math.max(0, pPrice * qty - disc);
      const vatCalculated = baseAfterDisc * (vatPct / 100);
      target.vatAmount = Math.round(vatCalculated * 100) / 100;
      target.total = Math.round((baseAfterDisc + target.vatAmount) * 100) / 100;

      copy[index] = target;
      return copy;
    });
  };

  // Quick apply sample item
  const handleSelectSampleItem = (index: number, sampleName: string) => {
    const sample = QUICK_ITEMS.find((q) => q.name === sampleName);
    if (!sample) return;

    setItems((prev) => {
      const copy = [...prev];
      const current = copy[index] || {
        id: "item-" + Date.now(),
        name: "",
        variant: "",
        stock: 0,
        qty: 1,
        purchasePrice: 0,
        salePrice: 0,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 0,
      };
      const qty = current.qty || 1;
      const baseAfterDisc = Math.max(0, sample.purchasePrice * qty - current.discount);
      const vatCalculated = baseAfterDisc * (current.vatPercent / 100);

      copy[index] = {
        ...current,
        name: sample.name,
        variant: sample.variant,
        stock: sample.stock,
        purchasePrice: sample.purchasePrice,
        salePrice: sample.salePrice,
        vatAmount: Math.round(vatCalculated * 100) / 100,
        total: Math.round((baseAfterDisc + vatCalculated) * 100) / 100,
      };
      return copy;
    });
  };

  // Add Item Row
  const handleAddItem = () => {
    const nextItem: PurchaseItem = {
      id: "item-" + Date.now(),
      name: "",
      variant: "No variants",
      stock: 0,
      qty: 1,
      purchasePrice: 0,
      salePrice: 0,
      discount: 0,
      vatPercent: 0,
      vatAmount: 0,
      total: 0,
    };
    setItems((prev) => [...prev, nextItem]);
  };

  // Remove Item Row
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("Purchase order must have at least one line item.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Summary calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.purchasePrice * it.qty), 0);
  }, [items]);

  const totalItemDiscount = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.discount || 0), 0);
  }, [items]);

  const totalVat = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.vatAmount || 0), 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - totalItemDiscount + totalVat + (Number(shippingCost) || 0));
  }, [subtotal, totalItemDiscount, totalVat, shippingCost]);

  const netTotal = useMemo(() => {
    return Math.max(0, grandTotal - (Number(flatDiscount) || 0));
  }, [grandTotal, flatDiscount]);

  const effectivePaidAmount = useMemo(() => {
    return Math.min(netTotal, Math.max(0, Number(amountPaidInput) || 0));
  }, [netTotal, amountPaidInput]);

  const dueAmount = useMemo(() => {
    return Math.max(0, netTotal - effectivePaidAmount);
  }, [netTotal, effectivePaidAmount]);

  const paidPercentage = useMemo(() => {
    if (netTotal <= 0) return 100;
    return Math.min(100, Math.round((effectivePaidAmount / netTotal) * 100));
  }, [effectivePaidAmount, netTotal]);

  // Quick Add Supplier Submit
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }

    const created = addStoredSupplier(
      newSupName.trim(),
      newSupEmail.trim() || `${newSupName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      newSupPhone.trim() || "01700000000",
      newSupCountry || "Bangladesh",
      "Active"
    );

    if (newSupCompany.trim()) {
      created.name = `${newSupName.trim()} (${newSupCompany.trim()})`;
    }

    const updated = [created, ...suppliers];
    setSuppliers(updated);
    setSelectedSupplierId(created.id);
    setIsAddSupplierModalOpen(false);
    setNewSupName("");
    setNewSupCompany("");
    setNewSupPhone("");
    setNewSupEmail("");
    toast.success(`Supplier "${created.name}" created and selected!`);
  };

  // Submit Purchase
  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (!purchaseName.trim()) {
      toast.error("Please enter a purchase name");
      return;
    }

    const invalidItem = items.find((it) => !it.name.trim() || it.qty <= 0);
    if (invalidItem) {
      toast.error("Please ensure all items have a name and quantity greater than 0");
      return;
    }

    const selectedSup = suppliers.find((s) => s.id === selectedSupplierId);

    const paymentStatus =
      dueAmount <= 0 ? "Paid" : effectivePaidAmount > 0 ? "Partially paid" : "Unpaid";

    const newRecord = addStoredPurchase({
      purchaseName: purchaseName.trim(),
      challanNo: challanNo.trim() || undefined,
      date: purchaseDate,
      supplierId: selectedSupplierId,
      supplierName: selectedSup?.name || "General Supplier",
      supplierCompany: selectedSup?.country || "Supplier Co",
      supplierPhone: selectedSup?.phone || "01700000000",
      supplierEmail: selectedSup?.email || "supplier@example.com",
      supplierAddress: "Store Warehouse",
      status: "Received",
      paymentStatus,
      items: items.map((it) => ({ ...it })),
      itemsCount: items.length,
      subtotal,
      totalItemDiscount,
      totalVat,
      shippingCost: Number(shippingCost) || 0,
      grandTotal,
      flatDiscount: Number(flatDiscount) || 0,
      netTotal,
      account: paymentAccount || (hasMultiplePayments ? "Multiple Accounts" : "Cash"),
      transactionId: transactionId.trim() || undefined,
      paidAmount: effectivePaidAmount,
      dueAmount,
    });

    toast.success(`Purchase ${newRecord.purchaseNumber} created successfully!`);
    navigate(`/purchase/manage`);
  };

  // Reset form
  const handleResetForm = () => {
    setPurchaseName("");
    setChallanNo("");
    setShippingCost(0);
    setFlatDiscount(0);
    setAmountPaidInput(0);
    setPaymentAccount("Cash");
    setTransactionId("");
    setItems([
      {
        id: "item-" + Date.now(),
        name: "Air Fryer 1500W",
        variant: "No variants",
        stock: 14,
        qty: 1,
        purchasePrice: 7000,
        salePrice: 8500,
        discount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: 7000,
      },
    ]);
    toast.info("Form reset to defaults");
  };

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-slate-100 pb-16">
      {/* ===================== TOP BREADCRUMB & HEADER ===================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/purchase/manage" className="hover:text-indigo-600 transition-colors">
              Purchases
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Add Purchase
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Add Purchase
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              <Sparkles className="w-3 h-3" />
              Procurement Order
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create procurement stock orders, manage item valuations, discounts, and supplier payment balances
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#181b24] p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrency("৳")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === "৳"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              ৳ BDT
            </button>
            <button
              type="button"
              onClick={() => setCurrency("$")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === "$"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetForm}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs transition"
            title="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Back to Purchases Button */}
          <Link
            to="/purchase/manage"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Purchases List</span>
          </Link>

          {/* Top Save Button */}
          <button
            type="button"
            onClick={handleSubmitPurchase}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition active:scale-98"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Purchase</span>
          </button>
        </div>
      </div>

      {/* ===================== MAIN FORM ===================== */}
      <form onSubmit={handleSubmitPurchase} className="space-y-6">
        {/* ===================== SECTION 1: SUPPLIER & ORDER DETAILS ===================== */}
        <div className="bg-white dark:bg-[#141824] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Supplier & Invoice Details
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Select procurement vendor and link order tracking reference
                </p>
              </div>
            </div>

            {selectedSupplier && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Vendor: {selectedSupplier.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Select Supplier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Supplier <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition cursor-pointer"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} {sup.phone ? `(${sup.phone})` : ""}
                    </option>
                  ))}
                </select>

                {/* Quick Add Supplier '+' Button */}
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(true)}
                  className="w-10 h-10 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all shadow-xs hover:shadow-indigo-500/30"
                  title="Quick Add New Supplier"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Purchase Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Purchase Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  required
                  className="w-full pl-3.5 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition"
                />
                <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 3. Enter a Purchase Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Purchase Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={purchaseName}
                  onChange={(e) => setPurchaseName(e.target.value)}
                  placeholder="e.g. Air Fryer 1500W Batch"
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition"
                />
              </div>
            </div>

            {/* 4. Challan No */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Challan / Bill No
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  placeholder="e.g. CH-2026-904"
                  className="w-full pl-3.5 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition"
                />
                <Hash className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 2: DYNAMIC PRODUCT ITEMS TABLE ===================== */}
        <div className="bg-white dark:bg-[#141824] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs space-y-0">
          {/* Card Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Order Items
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                    {items.length} {items.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Specify products, quantities, costs, taxes, and margins
                </p>
              </div>
            </div>

            {/* Quick Autocomplete Suggestions Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium whitespace-nowrap">
                Quick Insert:
              </span>
              {QUICK_ITEMS.slice(0, 4).map((qi) => (
                <button
                  key={qi.name}
                  type="button"
                  onClick={() => handleSelectSampleItem(items.length - 1 >= 0 ? items.length - 1 : 0, qi.name)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-[#0d111d] hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-nowrap transition text-[11px] font-medium"
                >
                  + {qi.name.split(" ")[0]} {qi.name.split(" ")[1] || ""}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/90 dark:bg-[#0d111d]/90 text-slate-600 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 min-w-[220px]">Item Description *</th>
                  <th className="py-3.5 px-3 min-w-[140px]">Variant</th>
                  <th className="py-3.5 px-3 min-w-[70px] text-center">Stock</th>
                  <th className="py-3.5 px-3 min-w-[90px] text-center">Qty *</th>
                  <th className="py-3.5 px-3 min-w-[120px] text-right">Purchase Price *</th>
                  <th className="py-3.5 px-3 min-w-[120px] text-right">Sale Price *</th>
                  <th className="py-3.5 px-3 min-w-[95px] text-right">Discount</th>
                  <th className="py-3.5 px-3 min-w-[85px] text-right">VAT %</th>
                  <th className="py-3.5 px-3 min-w-[95px] text-right">VAT Amt</th>
                  <th className="py-3.5 px-4 min-w-[120px] text-right">Line Total</th>
                  <th className="py-3.5 px-3 min-w-[50px] text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {items.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-colors"
                  >
                    {/* Item Name with Autocomplete datalist */}
                    <td className="py-3 px-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          placeholder="Type or select product item"
                          required
                          list={`items-list-${idx}`}
                          className="w-full pl-3 pr-7 py-1.5 text-xs bg-slate-50/50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        />
                        <datalist id={`items-list-${idx}`}>
                          {QUICK_ITEMS.map((q) => (
                            <option key={q.name} value={q.name} />
                          ))}
                        </datalist>
                        {row.name && (
                          <button
                            type="button"
                            onClick={() => handleItemChange(idx, "name", "")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Variant */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.variant}
                        onChange={(e) => handleItemChange(idx, "variant", e.target.value)}
                        placeholder="Variant / Specs"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50/50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </td>

                    {/* Stock Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-1 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {row.stock}
                      </span>
                    </td>

                    {/* Qty */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-full px-2 py-1.5 text-xs text-center font-bold font-mono bg-slate-50/50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Purchase Price */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.purchasePrice}
                          onChange={(e) =>
                            handleItemChange(idx, "purchasePrice", parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-2 pr-2 py-1.5 text-xs text-right font-semibold font-mono bg-slate-50/50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </td>

                    {/* Sale Price */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.salePrice}
                        onChange={(e) =>
                          handleItemChange(idx, "salePrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1.5 text-xs text-right font-medium font-mono bg-slate-50/50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.discount}
                        onChange={(e) =>
                          handleItemChange(idx, "discount", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1.5 text-xs text-right font-mono bg-slate-50/50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* VAT % */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={row.vatPercent}
                        onChange={(e) =>
                          handleItemChange(idx, "vatPercent", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1.5 text-xs text-right font-mono bg-slate-50/50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* VAT (Calculated) */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {row.vatAmount.toFixed(2)}
                    </td>

                    {/* Total (Calculated) */}
                    <td className="py-3 px-4 text-right font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {row.total.toFixed(2)}
                    </td>

                    {/* Del */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                        title="Delete line item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Item Bottom Row */}
          <div className="p-4 bg-slate-50/60 dark:bg-[#0d111d]/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Need to add more goods to this purchase order?
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-emerald-500/20 transition-all active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Item</span>
            </button>
          </div>
        </div>

        {/* ===================== SECTION 3: 2-COLUMN PAYMENT & SUMMARY GRID ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================== LEFT: PAYMENT OPTIONS & SETTLEMENT ===================== */}
          <div className="lg:col-span-7 bg-white dark:bg-[#141824] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Payment & Settlement
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Record immediate paid amounts, bank accounts, or defer due balances
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  dueAmount <= 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                    : effectivePaidAmount > 0
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
                }`}
              >
                {dueAmount <= 0 ? "Paid in Full" : effectivePaidAmount > 0 ? "Partially Paid" : "Unpaid / Due"}
              </span>
            </div>

            {/* Multiple Payment Checkbox */}
            <div className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-[#0d111d] rounded-xl border border-slate-200/70 dark:border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasMultiplePayments}
                  onChange={(e) => setHasMultiplePayments(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    Multiple Payment Options
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Split payment across multiple bank accounts or merchants
                  </span>
                </div>
              </label>
            </div>

            {/* Account, Transaction ID, and Amount Paid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Account
                </label>
                <select
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition cursor-pointer"
                >
                  <option value="Cash">Cash in Hand</option>
                  <option value="City Bank Ltd">City Bank Ltd</option>
                  <option value="Dutch Bangla Bank">Dutch Bangla Bank</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="bKash Merchant">bKash Merchant</option>
                  <option value="Nagad Business">Nagad Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Transaction ID / Ref
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TX-982410"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition"
                />
              </div>
            </div>

            {/* Amount Paid with Quick Presets */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Amount Paid Now
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAmountPaidInput(netTotal)}
                    className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Pay Full ({formatMoney(netTotal)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPaidInput(Math.round((netTotal * 0.5) * 100) / 100)}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:underline"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPaidInput(0)}
                    className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 font-medium hover:underline"
                  >
                    Pay 0 (Full Due)
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-base sm:text-lg font-bold font-mono bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Paid vs Due Progress & Summary Banner */}
            <div className="p-4 bg-slate-50 dark:bg-[#0d111d] rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Payment Progress ({paidPercentage}%)
                </span>
                <span className="font-mono text-slate-500">
                  {formatMoney(effectivePaidAmount)} / {formatMoney(netTotal)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${paidPercentage}%` }}
                ></div>
              </div>

              {/* Metrics cards inside payment */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white dark:bg-[#141824] p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    Paid Amount
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatMoney(effectivePaidAmount)}
                  </span>
                </div>
                <div className="bg-white dark:bg-[#141824] p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    Remaining Due
                  </span>
                  <span
                    className={`text-base font-bold font-mono ${
                      dueAmount > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {formatMoney(dueAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== RIGHT: FINANCIAL TOTALS BREAKDOWN ===================== */}
          <div className="lg:col-span-5 bg-white dark:bg-[#141824] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Purchase Summary
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Calculated order financial amounts
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {formatMoney(subtotal)}
                </span>
              </div>

              {/* Total Item Discount */}
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">Total Item Discount</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  -{formatMoney(totalItemDiscount)}
                </span>
              </div>

              {/* Total VAT */}
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">Total VAT</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  +{formatMoney(totalVat)}
                </span>
              </div>

              {/* Shipping Cost */}
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1">
                <span className="font-medium">Shipping Cost</span>
                <div className="w-32">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1 text-right text-xs font-mono font-semibold bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-bold">
                <span>Grand Total</span>
                <span className="font-mono">{formatMoney(grandTotal)}</span>
              </div>

              {/* Flat Discount */}
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">Flat Discount</span>
                <div className="w-32">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={flatDiscount}
                    onChange={(e) => setFlatDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1 text-right text-xs font-mono font-semibold bg-slate-50/70 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Net Total Highlight Box */}
              <div className="p-4 rounded-xl bg-slate-900 text-white dark:bg-indigo-950/40 dark:border dark:border-indigo-800/60 shadow-xs space-y-1 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-indigo-300 font-bold">
                    Net Total Amount
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    {formatMoney(netTotal)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-indigo-300/80">
                  Total invoice liability after all discounts and tax
                </p>
              </div>

              {/* Paid & Due Breakdown Row */}
              <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Paid Amount:
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatMoney(effectivePaidAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Due Amount:
                  </span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      dueAmount > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {formatMoney(dueAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== BOTTOM ACTION BUTTONS ===================== */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition shadow-2xs"
          >
            Reset Form
          </button>

          <button
            type="submit"
            className="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-indigo-500/25 transition-all transform active:scale-98 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Purchase</span>
          </button>
        </div>
      </form>

      {/* ===================== QUICK ADD SUPPLIER MODAL ===================== */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Quick Add Supplier
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Instantly enroll new procurement vendor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="e.g. Akash Islam"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={newSupCompany}
                  onChange={(e) => setNewSupCompany(e.target.value)}
                  placeholder="e.g. Ma Traders / DR Group"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  placeholder="e.g. 01900000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                  placeholder="supplier@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Country / Region
                </label>
                <input
                  type="text"
                  value={newSupCountry}
                  onChange={(e) => setNewSupCountry(e.target.value)}
                  placeholder="e.g. Bangladesh"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d111d] border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Create & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

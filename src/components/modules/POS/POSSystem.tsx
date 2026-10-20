import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  LayoutGrid,
  Headphones,
  Footprints,
  Smartphone,
  Watch,
  Laptop,
  Tv,
  Lightbulb,
  Plus,
  Minus,
  Trash2,
  X,
  Printer,
  CheckCircle2,
  Bell,
  Mail,
  Languages,
  UserPlus,
  ExternalLink,
  CreditCard,
  Building2,
  Wallet,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import ModeToggler from "@/components/layout/ModeToggler";
import {
  POSProduct,
  POSCartItem,
  POS_CATEGORIES,
  INITIAL_POS_PRODUCTS,
  INITIAL_CART_ITEMS,
} from "./posData";
import {
  CustomerItem,
  getStoredCustomers,
  addStoredCustomer,
} from "../Customer/customerStorage";
import {
  addStoredSalesOrder,
  SalesOrderItem,
} from "../SalesOrder/salesOrderStorage";

export default function POSSystem() {
  const navigate = useNavigate();
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Currency selection ($ or ৳)
  const [currency, setCurrency] = useState<"$" | "৳">("$");

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [topSearch, setTopSearch] = useState("");

  // Customers & Date state
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("#ORD0021");
  const [invoiceDate, setInvoiceDate] = useState<string>("10/21/2026");

  // Cart state
  const [cartItems, setCartItems] = useState<POSCartItem[]>(INITIAL_CART_ITEMS);
  const [orderId, setOrderId] = useState<string>("#ORD0020");

  // Taxes, Shipping, Discount
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [shippingCost, setShippingCost] = useState<number>(10);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "MFS / Bank" | "Multi Pay">("Cash");
  const [customPaidAmount, setCustomPaidAmount] = useState<string>("");
  const [customerGive, setCustomerGive] = useState<string>("");

  // Modal states
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  // Completed order for invoice modal & printing
  const [completedOrder, setCompletedOrder] = useState<{
    orderNumber: string;
    invoiceNumber: string;
    date: string;
    customer: CustomerItem | null;
    items: POSCartItem[];
    subtotal: number;
    vat: number;
    shipping: number;
    discount: number;
    grandTotal: number;
    paidAmount: number;
    customerGive: number;
    dueAmount: number;
    changeAmount: number;
    paymentMethod: string;
  } | null>(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Load customers from storage
  useEffect(() => {
    const list = getStoredCustomers();
    setCustomers(list);

    // Default select Akkas Ali (matching reference) or Alexander Kenn
    const akkas = list.find((c) => c.name.toLowerCase().includes("akkas"));
    if (akkas) {
      setSelectedCustomerId(akkas.id);
    } else {
      const alex = list.find((c) => c.name.toLowerCase().includes("alexander"));
      if (alex) {
        setSelectedCustomerId(alex.id);
      } else if (list.length > 0) {
        setSelectedCustomerId(list[0].id);
      }
    }
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return INITIAL_POS_PRODUCTS.filter((prod) => {
      const matchCat =
        selectedCategory === "all" || prod.category === selectedCategory;
      const q = (searchQuery || topSearch).toLowerCase().trim();
      const matchSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.code.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery, topSearch]);

  // Active customer object
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Cart helper functions
  const addToCart = (product: POSProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
              ...item,
              qty: item.qty + 1,
              total: (item.qty + 1) * item.price,
            }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${product.id}`,
          product,
          qty: 1,
          price: product.price,
          total: product.price,
        },
      ];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return {
              ...item,
              qty: newQty,
              total: newQty * item.price,
            };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    toast.info("Cart cleared");
  };

  // Financial calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + it.total, 0);
  }, [cartItems]);

  const vatAmount = useMemo(() => {
    return (subtotal * taxPercent) / 100;
  }, [subtotal, taxPercent]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + vatAmount + shippingCost - discountAmount);
  }, [subtotal, vatAmount, shippingCost, discountAmount]);

  const effectivePaidAmount = useMemo(() => {
    if (customPaidAmount !== "") {
      const val = parseFloat(customPaidAmount);
      return isNaN(val) ? 0 : val;
    }
    return grandTotal;
  }, [customPaidAmount, grandTotal]);

  const effectiveCustomerGive = useMemo(() => {
    if (customerGive !== "") {
      const val = parseFloat(customerGive);
      return isNaN(val) ? 0 : val;
    }
    return effectivePaidAmount;
  }, [customerGive, effectivePaidAmount]);

  const dueAmount = useMemo(() => {
    return Math.max(0, grandTotal - effectivePaidAmount);
  }, [grandTotal, effectivePaidAmount]);

  const changeAmount = useMemo(() => {
    return Math.max(0, effectiveCustomerGive - effectivePaidAmount);
  }, [effectiveCustomerGive, effectivePaidAmount]);

  // Currency formatter
  const formatMoney = (val: number) => {
    const formatted = val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return currency === "৳" ? `৳ ${formatted}` : `$${formatted}`;
  };

  // Quick Add Customer Handler
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }

    const created = addStoredCustomer(
      newCustName,
      newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      newCustPhone || "+1 (555) 000-0000",
      currency === "৳" ? "Bangladesh" : "United States",
      newCustAddress || "Store Counter",
      "Active"
    );

    setCustomers((prev) => [created, ...prev]);
    setSelectedCustomerId(created.id);
    setIsNewCustomerOpen(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustEmail("");
    setNewCustAddress("");
    toast.success(`Customer "${created.name}" added and selected!`);
  };

  // Submit and Automatic Print Invoice Handler
  const handleSubmitPOSOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Please add at least one product to the order list");
      return;
    }

    const orderNum = orderId || `#ORD00${Date.now().toString().slice(-4)}`;
    const invoiceNum = `INV-${Date.now().toString().slice(-4)}`;
    const today =
      invoiceDate ||
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    // Map to SalesOrderItem format
    const salesItems: SalesOrderItem[] = cartItems.map((c) => ({
      id: c.id,
      description: c.product.name,
      model: c.product.code,
      qty: c.qty,
      rate: c.price,
      discount: 0,
      vat: (c.total * taxPercent) / 100,
      total: c.total,
    }));

    // Record into sales order persistent storage
    addStoredSalesOrder({
      orderNumber: orderNum,
      invoiceNumber: invoiceNum,
      customer: activeCustomer ? activeCustomer.name : "Alexander Kenn",
      customerCompany: "Retail Walk-in",
      customerEmail: activeCustomer?.email || "customer@example.com",
      customerPhone: activeCustomer?.phone || "+1 (555) 000-0000",
      customerAddress: activeCustomer?.address || "Counter POS",
      customerCountry: activeCustomer?.country || (currency === "৳" ? "Bangladesh" : "United States"),
      orderDate: today,
      deliveryDate: today,
      paymentMethod:
        paymentMethod === "Cash"
          ? "Cash"
          : paymentMethod === "MFS / Bank"
            ? "Bank Transfer"
            : "Credit Card",
      reference: "POS Terminal #01",
      status: "Delivered",
      paymentStatus: dueAmount === 0 ? "Paid" : "Partial",
      items: salesItems,
      subtotal,
      discount: discountAmount,
      tax: vatAmount,
      paidAmount: effectivePaidAmount,
      notes: `POS transaction. Customer gave: ${formatMoney(effectiveCustomerGive)}. Change: ${formatMoney(changeAmount)}.`,
    });

    // Prepare completed order details for receipt
    const orderDetails = {
      orderNumber: orderNum,
      invoiceNumber: invoiceNum,
      date: today,
      customer: activeCustomer,
      items: [...cartItems],
      subtotal,
      vat: vatAmount,
      shipping: shippingCost,
      discount: discountAmount,
      grandTotal,
      paidAmount: effectivePaidAmount,
      customerGive: effectiveCustomerGive,
      dueAmount,
      changeAmount,
      paymentMethod,
    };

    setCompletedOrder(orderDetails);
    setIsSuccessModalOpen(true);

    toast.success(`Order ${orderNum} completed! Printing invoice automatically...`);

    // Automatic Print Invoice (with small timeout to let the print template mount)
    setTimeout(() => {
      window.print();
    }, 250);

    // Refresh next order ID
    const nextSuffix = (parseInt(orderNum.replace(/\D/g, "") || "20") + 1).toString().padStart(4, "0");
    setOrderId(`#ORD${nextSuffix}`);
  };

  // Reset POS for next sale
  const handleResetForNewSale = () => {
    setCartItems([]);
    setCustomPaidAmount("");
    setCustomerGive("");
    setIsSuccessModalOpen(false);
    toast.success("Ready for next sale!");
  };

  // Category Icon helper
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "LayoutGrid":
        return <LayoutGrid className="w-3.5 h-3.5" />;
      case "Headphones":
        return <Headphones className="w-3.5 h-3.5" />;
      case "Footprints":
        return <Footprints className="w-3.5 h-3.5" />;
      case "Smartphone":
        return <Smartphone className="w-3.5 h-3.5" />;
      case "Watch":
        return <Watch className="w-3.5 h-3.5" />;
      case "Laptop":
        return <Laptop className="w-3.5 h-3.5" />;
      case "Tv":
        return <Tv className="w-3.5 h-3.5" />;
      case "Lightbulb":
        return <Lightbulb className="w-3.5 h-3.5" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  // Category Badge Colors
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "Computers":
        return "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300";
      case "Smartphones":
        return "bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300";
      case "Footwear":
        return "bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300";
      case "Headphones":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300";
      case "Watches":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300";
      case "Appliances":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300";
      case "Lighting":
        return "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/60 dark:text-yellow-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1920px] w-full mx-auto overflow-hidden">
        {/* ===================== LEFT COLUMN: CATALOG (Cols 1-7 or 1-8) ===================== */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-5 min-w-0">
          {/* Categories Horizontal Chips (Matching Image 1) */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Categories
            </h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {POS_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs font-semibold"
                      : "bg-white dark:bg-[#181b24] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                  >
                    {renderCategoryIcon(cat.icon)}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Header & In-grid Search */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Products
            </h2>
            <div className="relative w-56">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Products Grid (Matching Image 1 cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
            {filteredProducts.map((prod) => {
              const inCart = cartItems.find((item) => item.product.id === prod.id);
              const qtyInCart = inCart ? inCart.qty : 0;

              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Product Image Container */}
                    <div
                      onClick={() => addToCart(prod)}
                      className="cursor-pointer bg-slate-50 dark:bg-[#12141c] rounded-xl h-36 flex items-center justify-center p-2 mb-2.5 overflow-hidden transition-transform group-hover:scale-[1.02]"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                        loading="lazy"
                      />
                    </div>

                    {/* Category pill */}
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${getCategoryBadgeClass(
                        prod.category
                      )}`}
                    >
                      {prod.category}
                    </span>

                    {/* Product Name */}
                    <h3
                      onClick={() => addToCart(prod)}
                      className="cursor-pointer font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"
                      title={prod.name}
                    >
                      {prod.name}
                    </h3>
                  </div>

                  {/* Price & Counter Row (Matching Image 1) */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {formatMoney(prod.price)}
                    </span>

                    {/* Stepper matching Image 1: (-) 01 (+) */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-[#12141c] px-1 py-0.5 text-xs">
                      <button
                        onClick={() => updateCartQty(prod.id, -1)}
                        disabled={qtyInCart === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Decrease"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>

                      <span className="w-6 text-center font-mono font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                        {qtyInCart.toString().padStart(2, "0")}
                      </span>

                      <button
                        onClick={() => addToCart(prod)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                        title="Increase"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================== RIGHT COLUMN: ORDER LIST & CHECKOUT (Cols 8-12) ===================== */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-[#181b24] border border-slate-200/80 dark:border-slate-800/80 rounded-md shadow-xs flex flex-col h-[calc(100vh-100px)] overflow-hidden">
          {/* Order List Top Header */}
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Order List
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                id : {orderId}
              </p>
            </div>

            {/* Trash Clear Button */}
            <button
              onClick={clearCart}
              disabled={cartItems.length === 0}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-40"
              title="Clear Cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Middle Content: Customer Info + Product Added + Tax/Shipping + Calculations */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Customer & Invoice Date Header matching Reference Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              {/* Customer Dropdown + '+' Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Customer
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer truncate shadow-2xs"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.phone ? `(${c.phone})` : ""}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNewCustomerOpen(true)}
                    className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/40 transition shadow-2xs"
                    title="Add New Customer"
                  >
                    <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </button>
                </div>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Invoice Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium shadow-2xs"
                  />
                  <Calendar className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Added Section (Matching Image 1) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Product Added
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {cartItems.reduce((acc, it) => acc + it.qty, 0)}
                  </span>
                </div>

                <button
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                  className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition flex items-center gap-0.5 disabled:opacity-40"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No items in cart. Click a product on the left to add.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#12141c] border border-slate-200/60 dark:border-slate-800/60"
                    >
                      {/* Left: Thumbnail & Code & Title */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 p-1 shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-slate-800">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                            {item.product.code}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {formatMoney(item.price)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Stepper & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-[#181b24] px-1 py-0.5 text-xs">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-[11px] text-slate-900 dark:text-white">
                            {item.qty.toString().padStart(2, "0")}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Order Tax, Shipping, Discount (Matching Image 1) */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Order Tax *
                </label>
                <select
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Shipping *
                </label>
                <input
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Discount(%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            {/* Financial Cards (Matching Image 2) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-[#12141c] rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                    Subtotal
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatMoney(subtotal)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#12141c] rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                    Total VAT ({taxPercent}%)
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatMoney(vatAmount)}
                  </span>
                </div>
              </div>

              {/* Grand Total Box (Matching Image 2's purple banner) */}
              <div className="p-3.5 bg-green-50/80 dark:bg-green-950/40 border border-green-100 dark:border-green-800/50 rounded-xl">
                <span className="text-[11px] font-semibold text-green-700 dark:text-green-300 block">
                  Grand Total
                </span>
                <span className="text-xl sm:text-2xl font-black text-green-900 dark:text-green-200 tracking-tight">
                  {formatMoney(grandTotal)}
                </span>
              </div>

              {/* Paid Amount & Customer Give (Matching Image 2) */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    value={customPaidAmount}
                    placeholder={grandTotal.toFixed(2)}
                    onChange={(e) => setCustomPaidAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Customer Give
                  </label>
                  <input
                    type="number"
                    value={customerGive}
                    placeholder={effectivePaidAmount.toFixed(2)}
                    onChange={(e) => setCustomerGive(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              {/* Summary Breakdown (Net Total, Paid, Due, Change) */}
              <div className="space-y-1.5 pt-2 text-xs font-medium">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Net Total</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Paid</span>
                  <span className="font-bold">{formatMoney(effectivePaidAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-rose-500">
                  <span>Due</span>
                  <span className="font-bold">{formatMoney(dueAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-amber-500">
                  <span>Change</span>
                  <span className="font-bold">{formatMoney(changeAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Fixed Checkout Actions: Payment Methods + Submit Button */}
          <div className="p-4 bg-slate-50/80 dark:bg-[#12141c]/80 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3 shrink-0">
            {/* Payment Method Selector (Cash: Green, MFS/Bank: Pink, Multi Pay: Yellow) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("Cash")}
                className={`py-2 px-1 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${paymentMethod === "Cash"
                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400 dark:ring-emerald-500"
                  : "bg-emerald-500/90 hover:bg-emerald-600 text-white opacity-85"
                  }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Cash
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("MFS / Bank")}
                className={`py-2 px-1 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${paymentMethod === "MFS / Bank"
                  ? "bg-red-500 text-white shadow-sm ring-2 ring-pink-400 dark:ring-pink-500"
                  : "bg-red-500 hover:bg-red-600 text-white opacity-85"
                  }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                MFS / Bank
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Multi Pay")}
                className={`py-2 px-1 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${paymentMethod === "Multi Pay"
                  ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-400 dark:ring-amber-500"
                  : "bg-amber-500/90 hover:bg-amber-600 text-white opacity-85"
                  }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Multi Pay
              </button>
            </div>

            {/* Big Blue Submit Button (Automatic Print Invoice upon submit!) */}
            <button
              onClick={() => handleSubmitPOSOrder()}
              disabled={cartItems.length === 0}
              className="w-full py-3 bg-[#1e293b] hover:bg-[#334155] cursor-pointer disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4" />
              Submit & Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* 3. QUICK ADD NEW CUSTOMER MODAL */}
      {isNewCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-500" />
                Add New Customer
              </h3>
              <button
                onClick={() => setIsNewCustomerOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Akkas Ali"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Phone / Mobile
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01745968975"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Street / City"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ORDER SUCCESS & PRINT INVOICE MODAL */}
      {isSuccessModalOpen && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#181b24] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Invoice Printed Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Order <span className="font-mono font-bold">{completedOrder.orderNumber}</span> (
                <span className="font-mono font-bold">{completedOrder.invoiceNumber}</span>) has been
                processed and saved to Sales Orders.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="p-3 bg-slate-50 dark:bg-[#12141c] rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold">{completedOrder.customer?.name || "Counter Customer"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grand Total:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatMoney(completedOrder.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Paid Amount:</span>
                <span className="font-semibold">{formatMoney(completedOrder.paidAmount)}</span>
              </div>
              {completedOrder.changeAmount > 0 && (
                <div className="flex justify-between text-amber-500">
                  <span>Change Given:</span>
                  <span className="font-semibold">{formatMoney(completedOrder.changeAmount)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Again
              </button>

              <button
                onClick={() =>
                  navigate(`/sales/orders/${completedOrder.orderNumber.replace("#", "")}`)
                }
                className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181b24] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Invoice
              </button>

              <button
                onClick={handleResetForNewSale}
                className="py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PRINTABLE INVOICE AREA (Only visible when printing) */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-9999 font-sans">
        <div ref={printAreaRef} className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-300">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                NEXORA ERP
              </h1>
              <p className="text-xs text-slate-600 mt-1">123 Business Ave, New York, NY 10001</p>
              <p className="text-xs text-slate-600">contact@dreamserp.com • +1 (555) 019-2834</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black uppercase text-slate-900">TAX INVOICE</h2>
              <p className="text-xs font-mono font-bold mt-1">
                {completedOrder ? completedOrder.invoiceNumber : "INV-0020"}
              </p>
              <p className="text-xs text-slate-600">
                Order: {completedOrder ? completedOrder.orderNumber : orderId}
              </p>
              <p className="text-xs text-slate-600">
                Date: {completedOrder ? completedOrder.date : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-300 text-xs">
            <div>
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Billed To:
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {completedOrder?.customer?.name || activeCustomer?.name || "Counter Customer"}
              </p>
              <p className="text-slate-600">
                {completedOrder?.customer?.address || activeCustomer?.address || "Walk-in"}
              </p>
              <p className="text-slate-600">
                Phone: {completedOrder?.customer?.phone || activeCustomer?.phone || "N/A"}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-slate-600">
                Payment Method:{" "}
                <span className="font-bold text-slate-900">
                  {completedOrder?.paymentMethod || paymentMethod}
                </span>
              </p>
              <p className="text-slate-600">
                Payment Status: <span className="font-bold text-emerald-600">PAID</span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-400 font-bold text-slate-800">
                <th className="py-2 px-1 w-10">#</th>
                <th className="py-2 px-2">Item Description</th>
                <th className="py-2 px-2 text-center w-16">Qty</th>
                <th className="py-2 px-2 text-right w-24">Price</th>
                <th className="py-2 px-2 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(completedOrder?.items || cartItems).map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-1 text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <span className="font-bold text-slate-900">{it.product.name}</span>
                    <span className="text-[10px] text-slate-500 block">
                      Code: {it.product.code}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-semibold">{it.qty}</td>
                  <td className="py-2 px-2 text-right">{formatMoney(it.price)}</td>
                  <td className="py-2 px-2 text-right font-bold">{formatMoney(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Breakdown */}
          <div className="pt-4 border-t border-slate-300 flex justify-end text-xs">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  {formatMoney(completedOrder ? completedOrder.subtotal : subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order Tax ({taxPercent}%):</span>
                <span>{formatMoney(completedOrder ? completedOrder.vat : vatAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Cost:</span>
                <span>{formatMoney(completedOrder ? completedOrder.shipping : shippingCost)}</span>
              </div>
              {(completedOrder ? completedOrder.discount : discountAmount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>
                    -{formatMoney(completedOrder ? completedOrder.discount : discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-b border-slate-400 py-1 font-black text-sm">
                <span>Grand Total:</span>
                <span>
                  {formatMoney(completedOrder ? completedOrder.grandTotal : grandTotal)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Paid Amount:</span>
                <span>
                  {formatMoney(
                    completedOrder ? completedOrder.paidAmount : effectivePaidAmount
                  )}
                </span>
              </div>
              {(completedOrder ? completedOrder.changeAmount : changeAmount) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Change Returned:</span>
                  <span>
                    {formatMoney(
                      completedOrder ? completedOrder.changeAmount : changeAmount
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dual Signatures */}
          <div className="mt-16 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-dashed border-slate-400 w-44 mx-auto mb-1"></div>
              <p className="font-semibold text-slate-700">Authorized Signature</p>
            </div>
            <div>
              <div className="border-b border-dashed border-slate-400 w-44 mx-auto mb-1"></div>
              <p className="font-semibold text-slate-700">Customer Signature</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 text-[11px] text-slate-500 border-t border-slate-200">
            <p className="italic">
              "Thank you for shopping with us! Please come again."
            </p>
            <p className="font-semibold mt-0.5">Powered by NEXORA ERP • Modern Enterprise Management</p>
          </div>
        </div>
      </div>

      {/* Footer Copyright matching Image 1 */}
      <footer className="py-2.5 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/60 shrink-0">
        2026 © Dreams ERP. All Rights Reserved
      </footer>

      {/* Print Style Injections */}
      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            body * {
              visibility: hidden;
            }
            .print\\:block, .print\\:block * {
              visibility: visible !important;
            }
            .print\\:block {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              display: block !important;
            }
          }
        `}
      </style>
    </div>
  );
}

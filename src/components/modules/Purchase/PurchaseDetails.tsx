import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import {
  Printer,
  Edit2,
  Package,
} from "lucide-react";
import DreamsLogo from "@/components/common/DreamsLogo";
import {
  PurchaseRecord,
  getStoredPurchaseById,
  getStoredPurchases,
} from "./purchaseStorage";

export default function PurchaseDetails() {
  const { id } = useParams<{ id: string }>();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [purchase, setPurchase] = useState<PurchaseRecord | null>(null);

  useEffect(() => {
    if (!id) return;
    const found = getStoredPurchaseById(id);
    if (found) {
      setPurchase(found);
    } else {
      const list = getStoredPurchases();
      if (list.length > 0) {
        setPurchase(list[0]);
      }
    }
  }, [id]);

  const formatMoney = (val: number) => {
    return `$${val.toLocaleString("en-US", {
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (!purchase) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-8 flex flex-col items-center justify-center space-y-4">
        <Package className="w-12 h-12 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Purchase Record Not Found
        </h2>
        <Link
          to="/purchase/manage"
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          Back to Purchases
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 text-slate-900 dark:text-slate-100">
      {/* ===================== TOP BREADCRUMB & HEADER (Exact Reference Image 3) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb: Purchases > #PO0020 */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/purchase/manage" className="hover:text-indigo-600 transition">
              Purchases
            </Link>
            <span>›</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
              {purchase.purchaseNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Purchase Details
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Print Button (Exact style from Reference Image 3) */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Edit Button (Solid dark button matching Reference Image 3) */}
          <Link
            to="/purchase/add"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* ===================== INVOICE CARD (Exact Layout of Reference Image 3) ===================== */}
      <div
        ref={printAreaRef}
        className="bg-white dark:bg-[#181b24] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-10 shadow-2xs space-y-8"
      >
        {/* Top Header: Dreams ERP Logo (Left) vs PURCHASE ORDER Header (Right) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          {/* Left: Dreams ERP Logo & Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DreamsLogo className="h-7 w-auto text-indigo-600 dark:text-indigo-400" />
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Dreams ERP
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <p>123 Business Ave</p>
              <p>New York, NY 10001</p>
            </div>
          </div>

          {/* Right: PURCHASE ORDER title, #PO0020, and Status Badge */}
          <div className="sm:text-right space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              PURCHASE ORDER
            </h2>
            <p className="font-mono text-sm text-slate-500 dark:text-slate-400 font-semibold">
              {purchase.purchaseNumber}
            </p>
            <div className="pt-1">
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                  purchase.status === "Received" || purchase.paymentStatus === "Paid"
                    ? "bg-[#e8f8ee] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-[#fff8eb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400"
                }`}
              >
                {purchase.status === "Received" ? "Received" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To & Meta Attributes Row (Matching Reference Image 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-4">
          {/* Left: Bill To */}
          <div className="space-y-1">
            <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
              Bill To
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {purchase.supplierName}
            </h3>
            {purchase.supplierCompany && (
              <p className="text-slate-600 dark:text-slate-300">
                {purchase.supplierCompany}
              </p>
            )}
            <p className="text-slate-500 dark:text-slate-400">
              {purchase.supplierAddress || "San Francisco, CA"}
            </p>
          </div>

          {/* Right: Purchase Date, Payment Method, Reference */}
          <div className="sm:text-right space-y-1.5 text-slate-600 dark:text-slate-400">
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Purchase Date:{" "}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {purchase.date}
              </span>
            </p>
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Payment Method:{" "}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {purchase.account || "Credit Card"}
              </span>
            </p>
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Reference:{" "}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {purchase.purchaseName || "For Purchase"}
              </span>
            </p>
          </div>
        </div>

        {/* Table: Description | Qty | Rate | Amount (Exact Reference Image 3) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40">
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 w-28 text-center">Qty</th>
                <th className="py-3 px-4 w-32 text-center">Rate</th>
                <th className="py-3 px-4 w-36 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {purchase.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {it.name}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                    {it.qty}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                    {formatMoney(it.purchasePrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-900 dark:text-white">
                    {formatMoney(it.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section (Exact Reference Image 3 + Paid & Due Amounts) */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {formatMoney(purchase.subtotal)}
              </span>
            </div>

            {purchase.totalItemDiscount > 0 && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-medium">Item Discount</span>
                <span className="font-mono text-emerald-600">
                  -{formatMoney(purchase.totalItemDiscount)}
                </span>
              </div>
            )}

            {purchase.flatDiscount > 0 && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-medium">Flat Discount</span>
                <span className="font-mono text-emerald-600">
                  -{formatMoney(purchase.flatDiscount)}
                </span>
              </div>
            )}

            {purchase.totalVat > 0 && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-medium">Total VAT</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  +{formatMoney(purchase.totalVat)}
                </span>
              </div>
            )}

            {purchase.shippingCost > 0 && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-medium">Shipping Cost</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  +{formatMoney(purchase.shippingCost)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm sm:text-base font-extrabold pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-900 dark:text-white">Total</span>
              <span className="font-mono text-[#16a34a] dark:text-emerald-400">
                {formatMoney(purchase.netTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-medium text-slate-600 dark:text-slate-400">Paid Amount</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatMoney(purchase.paidAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-medium text-slate-600 dark:text-slate-400">Due Balance</span>
              <span
                className={`font-bold font-mono ${
                  purchase.dueAmount > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {formatMoney(purchase.dueAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

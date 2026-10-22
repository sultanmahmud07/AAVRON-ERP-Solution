import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  PieChart,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  ArrowUpRight,
  Receipt,
  Percent,
  BarChart3,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { getStoredExpenses, ExpenseRecord } from "./expenseStorage";
import { getStoredPayments, PaymentRecord } from "./paymentStorage";
import { getStoredBudgets, BudgetRecord } from "./budgetingStorage";
import { getStoredTaxes, TaxRecord } from "./taxStorage";

export type ReportType =
  | "expense-summary"
  | "income-summary"
  | "profit-loss"
  | "income-vs-expense"
  | "tax-summary";

interface ReportTab {
  id: ReportType;
  title: string;
  icon: React.ElementType;
  description: string;
}

const REPORT_TABS: ReportTab[] = [
  {
    id: "expense-summary",
    title: "Expense Summary",
    icon: Receipt,
    description: "Detailed breakdown of operational spending, categories, and payment types.",
  },
  {
    id: "income-summary",
    title: "Income Summary",
    icon: TrendingUp,
    description: "Total sales revenue, invoice receipts, and top revenue drivers.",
  },
  {
    id: "profit-loss",
    title: "Profit & Loss",
    icon: Scale,
    description: "Income statement showing gross margins, operating overheads, and net profit.",
  },
  {
    id: "income-vs-expense",
    title: "Income vs Expense",
    icon: BarChart3,
    description: "Comparative cash flow performance and monthly net financial balance.",
  },
  {
    id: "tax-summary",
    title: "Tax Summary",
    icon: Percent,
    description: "GST, VAT, and Sales Tax collection vs obligations with filing statuses.",
  },
];

export default function FinanceReportView() {
  const { reportType } = useParams<{ reportType?: string }>();
  const navigate = useNavigate();

  // Validate active tab or default to 'expense-summary'
  const activeReport: ReportType = useMemo(() => {
    if (
      reportType &&
      REPORT_TABS.some((tab) => tab.id === reportType.toLowerCase())
    ) {
      return reportType.toLowerCase() as ReportType;
    }
    return "expense-summary";
  }, [reportType]);

  // Currency & period state
  const [currencySymbol, setCurrencySymbol] = useState<"$" | "৳">("$");
  const [periodFilter, setPeriodFilter] = useState<string>("Q2 2026");

  // Loaded data
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [taxes, setTaxes] = useState<TaxRecord[]>([]);

  useEffect(() => {
    setExpenses(getStoredExpenses());
    setPayments(getStoredPayments());
    setBudgets(getStoredBudgets());
    setTaxes(getStoredTaxes());
  }, []);

  const formatAmount = (val: number) => {
    const isNegative = val < 0;
    const formatted = Math.abs(val).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${isNegative ? "-" : ""}${currencySymbol}${formatted}`;
  };

  // Switch tab
  const handleTabChange = (tabId: ReportType) => {
    navigate(`/finance/reports/${tabId}`);
  };

  // Mock sales income records based on clothing business
  const salesIncomeData = useMemo(() => {
    return [
      { id: "inc-1", channel: "Men's Apparel Retail", amount: 68500, orders: 420, growth: "+14.2%" },
      { id: "inc-2", channel: "Women's Collection", amount: 84200, orders: 580, growth: "+18.5%" },
      { id: "inc-3", channel: "Denim & Outerwear", amount: 46800, orders: 310, growth: "+8.1%" },
      { id: "inc-4", channel: "Corporate Bulk Uniforms", amount: 39500, orders: 45, growth: "+22.4%" },
      { id: "inc-5", channel: "Online Marketplace Exports", amount: 28400, orders: 215, growth: "+6.9%" },
    ];
  }, []);

  // Aggregations
  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0) || 124500;
  }, [expenses]);

  const totalIncomeAmount = useMemo(() => {
    return salesIncomeData.reduce((sum, s) => sum + s.amount, 0); // 267,400
  }, [salesIncomeData]);

  const totalCOGS = useMemo(() => {
    // Estimated direct materials & garment production: 48% of gross sales
    return Math.round(totalIncomeAmount * 0.48);
  }, [totalIncomeAmount]);

  const grossProfit = totalIncomeAmount - totalCOGS;
  const netProfit = grossProfit - totalExpenseAmount;
  const netMargin = totalIncomeAmount > 0 ? ((netProfit / totalIncomeAmount) * 100).toFixed(1) : "0.0";

  // Category breakdown for expenses
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / (totalExpenseAmount || 1)) * 100),
    }));
  }, [expenses, totalExpenseAmount]);

  // Monthly income vs expense data
  const monthlyComparison = [
    { month: "Jan 2026", income: 64000, expense: 38000 },
    { month: "Feb 2026", income: 72000, expense: 41000 },
    { month: "Mar 2026", income: 81000, expense: 46000 },
    { month: "Apr 2026", income: 89000, expense: 49500 },
    { month: "May 2026", income: 94000, expense: 52000 },
    { month: "Jun 2026", income: 98500, expense: 54000 },
  ];

  // Handle Export CSV
  const handleExportCSV = () => {
    let csvRows: string[][] = [];
    let filename = `${activeReport}_${Date.now()}.csv`;

    if (activeReport === "expense-summary") {
      csvRows = [
        ["Expense ID", "Name", "Category", "Amount", "Method", "Date", "Status"],
        ...expenses.map((e) => [
          e.expenseId,
          e.name,
          e.category,
          e.amount.toString(),
          e.paymentMethod,
          e.date,
          e.status,
        ]),
      ];
    } else if (activeReport === "income-summary") {
      csvRows = [
        ["Sales Channel", "Amount", "Orders Count", "Growth"],
        ...salesIncomeData.map((s) => [s.channel, s.amount.toString(), s.orders.toString(), s.growth]),
      ];
    } else if (activeReport === "profit-loss") {
      csvRows = [
        ["Line Item", "Amount", "% of Revenue"],
        ["Gross Revenue", totalIncomeAmount.toString(), "100%"],
        ["Cost of Goods Sold (COGS)", totalCOGS.toString(), `${((totalCOGS / totalIncomeAmount) * 100).toFixed(1)}%`],
        ["Gross Profit", grossProfit.toString(), `${((grossProfit / totalIncomeAmount) * 100).toFixed(1)}%`],
        ["Total Operating Expenses", totalExpenseAmount.toString(), `${((totalExpenseAmount / totalIncomeAmount) * 100).toFixed(1)}%`],
        ["Net Profit", netProfit.toString(), `${netMargin}%`],
      ];
    } else if (activeReport === "income-vs-expense") {
      csvRows = [
        ["Month", "Total Income", "Total Expense", "Net Cashflow"],
        ...monthlyComparison.map((m) => [
          m.month,
          m.income.toString(),
          m.expense.toString(),
          (m.income - m.expense).toString(),
        ]),
      ];
    } else {
      csvRows = [
        ["Tax ID", "Tax Name", "Type", "Rate (%)", "Applied To", "Status"],
        ...taxes.map((t) => [t.taxId, t.taxName, t.type, `${t.rate}%`, t.appliedTo, t.status]),
      ];
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report downloaded as CSV");
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#0c6760]/10 text-[#0c6760] dark:bg-[#0c6760]/20">
              <PieChart className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Finance Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time financial analytics, revenue tracking, profit and loss, and tax liabilities.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          {/* Currency Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrencySymbol("$")}
              className={`px-2.5 py-1 rounded ${currencySymbol === "$"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => setCurrencySymbol("৳")}
              className={`px-2.5 py-1 rounded ${currencySymbol === "৳"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              ৳ BDT
            </button>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="This Month">This Month</option>
              <option value="Q1 2026">Q1 2026</option>
              <option value="Q2 2026">Q2 2026</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Annual 2026">Annual 2026</option>
            </select>
          </div>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          {/* Print button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Navigation Submenu Tabs matching the 5 items in Image 5 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-gray-200 dark:border-gray-800">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${isActive
                ? "bg-[#0c6760] text-white shadow-sm"
                : "bg-white dark:bg-[#181b24] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 1. EXPENSE SUMMARY VIEW */}
      {/* ==================================================================== */}
      {activeReport === "expense-summary" && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Total Operating Expenses</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatAmount(totalExpenseAmount)}
              </p>
              <div className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+4.8% from last quarter</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Paid Direct Overheads</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {formatAmount(Math.round(totalExpenseAmount * 0.88))}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">88% settled invoices</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Pending Approvals</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {formatAmount(Math.round(totalExpenseAmount * 0.12))}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">3 supplier bills in queue</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Top Cost Center</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                Rent & Logistics
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Central warehouse facility</span>
            </div>
          </div>

          {/* Expense Category Breakdown Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
                Expense Distribution by Category
              </h3>
              <div className="space-y-3.5">
                {expenseByCategory.slice(0, 6).map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{cat.category}</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {formatAmount(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0c6760] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
                Payment Channel Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#12141c] border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      BT
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Bank Transfer / EFT</p>
                      <p className="text-[11px] text-gray-400">Vendor bulk payouts</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatAmount(Math.round(totalExpenseAmount * 0.62))}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#12141c] border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
                      CC
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Corporate Credit Card</p>
                      <p className="text-[11px] text-gray-400">Software subscriptions & travel</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatAmount(Math.round(totalExpenseAmount * 0.25))}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#12141c] border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold text-xs">
                      CS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Petty Cash & UPI</p>
                      <p className="text-[11px] text-gray-400">Local supplies & refreshments</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatAmount(Math.round(totalExpenseAmount * 0.13))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. INCOME SUMMARY VIEW */}
      {/* ==================================================================== */}
      {activeReport === "income-summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Gross Sales Revenue</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatAmount(totalIncomeAmount)}
              </p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+16.4% YoY performance</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Total Fulfilled Orders</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                1,570
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Avg. ticket: {formatAmount(170)}</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Direct Invoiced B2B</span>
              <p className="text-2xl font-bold text-[#0c6760] mt-1">
                {formatAmount(67900)}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Wholesale retailer network</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Realized Collections</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                98.2%
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Minimal overdue accounts</span>
            </div>
          </div>

          {/* Revenue by Apparel Category */}
          <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
              Revenue Breakdown by Category
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14161f]/50 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    <th className="py-3 px-4">Sales Segment</th>
                    <th className="py-3 px-4">Order Volume</th>
                    <th className="py-3 px-4">Gross Revenue</th>
                    <th className="py-3 px-4">Growth</th>
                    <th className="py-3 px-4">Share of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {salesIncomeData.map((item) => {
                    const share = Math.round((item.amount / totalIncomeAmount) * 100);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-gray-100">
                          {item.channel}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                          {item.orders.toLocaleString()} orders
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-gray-100">
                          {formatAmount(item.amount)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.growth}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-500">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. PROFIT & LOSS (P&L) VIEW */}
      {/* ==================================================================== */}
      {activeReport === "profit-loss" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Gross Profit (After COGS)</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatAmount(grossProfit)}
              </p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                {((grossProfit / totalIncomeAmount) * 100).toFixed(1)}% Gross Margin
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Operating Overheads</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {formatAmount(totalExpenseAmount)}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Facilities, payroll, marketing</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-[#0c6760]/30 dark:border-[#0c6760]/40 rounded-md shadow-sm bg-[#0c6760]/5">
              <span className="text-xs font-semibold text-[#0c6760] dark:text-teal-400">
                Net Profit (EBITDA)
              </span>
              <p className="text-2xl font-black text-[#0c6760] dark:text-teal-300 mt-1">
                {formatAmount(netProfit)}
              </p>
              <span className="text-xs font-bold text-[#0c6760] mt-1 block">
                {netMargin}% Net Margin
              </span>
            </div>
          </div>

          {/* Detailed Statement Table */}
          <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Income Statement ({periodFilter})
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#14161f]/50 font-bold text-gray-900 dark:text-gray-100">
                <span>1. Revenue from Operations</span>
                <span>{formatAmount(totalIncomeAmount)}</span>
              </div>
              <div className="flex items-center justify-between px-6 py-3 text-xs text-gray-600 dark:text-gray-300 pl-8">
                <span>Direct Garment Sales & Invoiced Orders</span>
                <span>{formatAmount(totalIncomeAmount)}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#14161f]/50 font-bold text-gray-900 dark:text-gray-100">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span className="text-rose-600">-{formatAmount(totalCOGS)}</span>
              </div>
              <div className="flex items-center justify-between px-6 py-3 text-xs text-gray-600 dark:text-gray-300 pl-8">
                <span>Raw Fabric, Trim Accessories, Sewing Labor</span>
                <span>-{formatAmount(totalCOGS)}</span>
              </div>

              <div className="flex items-center justify-between p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">
                <span>Gross Profit Margin</span>
                <span>{formatAmount(grossProfit)}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#14161f]/50 font-bold text-gray-900 dark:text-gray-100">
                <span>3. Operating & Administrative Expenses</span>
                <span className="text-rose-600">-{formatAmount(totalExpenseAmount)}</span>
              </div>
              {expenseByCategory.map((c) => (
                <div key={c.category} className="flex items-center justify-between px-6 py-2 text-xs text-gray-600 dark:text-gray-300 pl-8">
                  <span>{c.category}</span>
                  <span>-{formatAmount(c.amount)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between p-4 font-bold text-lg text-white bg-[#0c6760] rounded-b-xl">
                <span>Net Profit Before Taxes</span>
                <span>{formatAmount(netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. INCOME VS EXPENSE VIEW */}
      {/* ==================================================================== */}
      {activeReport === "income-vs-expense" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
                Monthly Comparison (H1 2026)
              </h3>
              <div className="space-y-4">
                {monthlyComparison.map((m) => {
                  const surplus = m.income - m.expense;
                  return (
                    <div key={m.month} className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14161f]/40">
                      <div className="flex justify-between items-center text-xs font-bold mb-2">
                        <span className="text-gray-800 dark:text-gray-200">{m.month}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Surplus: +{formatAmount(surplus)}
                        </span>
                      </div>
                      {/* Income Bar */}
                      <div className="mb-1.5">
                        <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
                          <span>Income: {formatAmount(m.income)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>
                      {/* Expense Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
                          <span>Expense: {formatAmount(m.expense)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${Math.round((m.expense / m.income) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Net Cash Flow Summary */}
            <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Cash Flow Equilibrium
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  For Q2 2026, total income exceeds operational overheads by a solid 53%, providing substantial runway for warehouse expansion and inventory scaling.
                </p>

                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-md space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    <span>Cash Inflow Efficiency</span>
                    <span>1.84x Inflow/Outflow</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    <span>Working Capital Surplus</span>
                    <span>{formatAmount(142900)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <span>Audited automated ledger</span>
                <span className="font-semibold text-[#0c6760]">Healthy Liquidity</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. TAX SUMMARY VIEW */}
      {/* ==================================================================== */}
      {activeReport === "tax-summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Total Output Tax (Collected)</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatAmount(Math.round(totalIncomeAmount * 0.12))}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">GST / VAT charged on sales</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Input Tax Credit (ITC)</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {formatAmount(Math.round(totalExpenseAmount * 0.08))}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Claimable on vendor purchases</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Net Tax Payable</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {formatAmount(Math.round(totalIncomeAmount * 0.12 - totalExpenseAmount * 0.08))}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Due by 20th of next month</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
              <span className="text-xs font-medium text-gray-500">Filing Status</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                Compliant
              </p>
              <span className="text-xs text-gray-400 mt-1 block">All Q1 returns filed</span>
            </div>
          </div>

          {/* Active Tax Rates Table */}
          <div className="bg-white dark:bg-[#181b24] border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Registered Tax Codes & Liability
              </h3>
              <button
                type="button"
                onClick={() => navigate("/finance/taxes")}
                className="text-xs font-semibold text-[#0c6760] hover:underline"
              >
                Manage Taxes →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14161f]/50 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    <th className="py-3 px-4">Tax Code</th>
                    <th className="py-3 px-4">Tax Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Rate (%)</th>
                    <th className="py-3 px-4">Applied Jurisdiction</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {taxes.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                      <td className="py-3.5 px-4 font-medium text-gray-600 dark:text-gray-400 text-xs">
                        {t.taxId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-gray-100">
                        {t.taxName}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 text-xs">
                        {t.type}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        {t.rate}%
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 text-xs">
                        {t.appliedTo}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${t.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                            }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

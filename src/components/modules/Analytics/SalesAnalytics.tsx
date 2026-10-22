import { useState, useMemo } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Coins,
  Activity,
  Printer,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  BarChart3,
  Sparkles,
  PieChart as PieIcon,
  RotateCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import {
  ClothingProductSalesStat,
  initialSalesSummary,
  getStoredSalesAnalytics,
  monthlyClothingSalesTrend,
  clothingCategoryBreakdown,
} from "./salesAnalyticsData";

export default function SalesAnalytics() {
  // Data state
  const [products] = useState<ClothingProductSalesStat[]>(() =>
    getStoredSalesAnalytics()
  );
  const summary = initialSalesSummary;

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currencySymbol, setCurrencySymbol] = useState<"$" | "৳">("$");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Currency multiplier for BDT conversion ($1 = ~120 BDT)
  const currencyMultiplier = currencySymbol === "৳" ? 120 : 1;

  // Format currency
  const fmt = (val: number) => {
    const computed = val * currencyMultiplier;
    return `${currencySymbol}${computed.toLocaleString()}`;
  };

  // Distinct clothing categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.product.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      return true;
    });
  }, [products, searchQuery, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Product", "Category", "Brand", "SKU", "Units Sold", "Revenue", "Growth"];
    const rows = filteredProducts.map((p) => [
      `"${p.product}"`,
      `"${p.category}"`,
      `"${p.brand}"`,
      `"${p.sku}"`,
      p.unitsSold,
      `"${fmt(p.revenue)}"`,
      `"${p.growth > 0 ? "+" : ""}${p.growth}%"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clothing_Sales_Analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("Clothing sales analytics exported successfully.");
  };

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-slate-100">
      {/* ===================== 1. TOP HEADER (Matching Reference Image) ===================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Sales Analytics</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#0c6760] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              Clothing Retail
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time clothing merchandise performance, category velocity & revenue trends
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Currency Toggle */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181b24] p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrencySymbol("$")}
              className={`px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer ${currencySymbol === "$"
                ? "bg-[#0c6760] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrencySymbol("৳")}
              className={`px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer ${currencySymbol === "৳"
                ? "bg-[#0c6760] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              BDT (৳)
            </button>
          </div>

          {/* Toggle Interactive Visual Charts */}
          <button
            type="button"
            onClick={() => setShowCharts(!showCharts)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${showCharts
              ? "bg-teal-50 border-teal-300 text-teal-800 dark:bg-teal-950/60 dark:border-teal-700 dark:text-teal-300"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{showCharts ? "Hide Visual Charts" : "Visual Charts"}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition dark:bg-[#181b24] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transform transition-transform ${isExportOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#181b24] rounded-md shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                >
                  Export as CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
                >
                  Export as PDF / Print
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== 2. FOUR KPI SUMMARY CARDS (Exact Layout of Reference Image) ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Sales
            </span>
            <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {fmt(summary.totalSales)}
            </h3>
            <div className="flex items-center">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                {summary.totalSalesGrowth}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-md bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {summary.totalOrders.toLocaleString()}
            </h3>
            <div className="flex items-center">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                {summary.totalOrdersGrowth}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Avg Order Value
            </span>
            <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {fmt(summary.avgOrderValue)}
            </h3>
            <div className="flex items-center">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                {summary.avgOrderValueGrowth}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Conversion Rate
            </span>
            <div className="w-9 h-9 rounded-md bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {summary.conversionRate}%
            </h3>
            <div className="flex items-center">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/50">
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                {Math.abs(summary.conversionRateGrowth)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== OPTIONAL: INTERACTIVE VISUAL CHARTS ===================== */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
          {/* Monthly Trend Area Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0c6760]" />
                  Annual Clothing Sales Velocity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monthly apparel volume & gross merchandise value
                </p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyClothingSalesTrend}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c6760" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0c6760" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value: unknown) => [
                      fmt(Number(value) || 0),
                      "Sales Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#0c6760"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Donut Chart */}
          <div className="lg:col-span-4 bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-[#0c6760]" />
                Category Revenue Share
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Sales breakdown across clothing categories
              </p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clothingCategoryBreakdown}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {clothingCategoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                    formatter={(val: unknown) => [fmt(Number(val) || 0), "Revenue"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 3. TOP SELLING PRODUCTS CARD (Exact Reference Layout) ===================== */}
      <div className="bg-white dark:bg-[#181b24] rounded-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Top Selling Products
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Best-performing clothing apparel by order velocity and profit margin
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:flex-initial sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search clothing..."
                className="w-full bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0c6760]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchQuery || categoryFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setCurrentPage(1);
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                title="Reset filters"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ===================== TABLE (Matching Reference Image) ===================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-6 font-bold text-slate-900 dark:text-slate-200 min-w-[240px]">
                  Product
                </th>
                <th className="py-3.5 px-6 font-bold text-slate-900 dark:text-slate-200">
                  Category
                </th>
                <th className="py-3.5 px-6 font-bold text-slate-900 dark:text-slate-200 text-center">
                  Units Sold
                </th>
                <th className="py-3.5 px-6 font-bold text-slate-900 dark:text-slate-200 text-right">
                  Revenue
                </th>
                <th className="py-3.5 px-6 font-bold text-slate-900 dark:text-slate-200 text-right">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No clothing products match your filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((item) => {
                  const isPositive = item.growth >= 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Product (Bold font matching image) */}
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.product}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {item.product}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {item.brand} • SKU: {item.sku}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      {/* Units Sold */}
                      <td className="py-4 px-6 text-center font-mono text-slate-700 dark:text-slate-300">
                        {item.unitsSold.toLocaleString()}
                      </td>

                      {/* Revenue */}
                      <td className="py-4 px-6 text-right font-black font-mono text-slate-900 dark:text-white">
                        {fmt(item.revenue)}
                      </td>

                      {/* Growth (Matching badge style in reference image) */}
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isPositive
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/50"
                            }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                          )}
                          {Math.abs(item.growth)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ===================== 4. BOTTOM PAGINATION (Exact Reference Layout) ===================== */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          {/* Showing 10 / Pages dropdown matching reference image */}
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10 / Pages</option>
              <option value={20}>20 / Pages</option>
              <option value={50}>50 / Pages</option>
            </select>
          </div>

          {/* Pagination Controls [1] 2 3 < > */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded-md font-semibold text-xs transition cursor-pointer ${currentPage === pageNum
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

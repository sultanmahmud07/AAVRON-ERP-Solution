export interface ClothingProductSalesStat {
  id: string;
  product: string;
  category: string;
  unitsSold: number;
  revenue: number;
  growth: number; // e.g. 18 for +18%, -4 for -4%
  brand: string;
  sku: string;
  averagePrice: number;
  stockLeft: number;
  image?: string;
}

export interface SalesAnalyticsSummary {
  totalSales: number;
  totalSalesGrowth: number;
  totalOrders: number;
  totalOrdersGrowth: number;
  avgOrderValue: number;
  avgOrderValueGrowth: number;
  conversionRate: number;
  conversionRateGrowth: number;
}

export const initialSalesSummary: SalesAnalyticsSummary = {
  totalSales: 152000,
  totalSalesGrowth: 12.5,
  totalOrders: 486,
  totalOrdersGrowth: 8.2,
  avgOrderValue: 312,
  avgOrderValueGrowth: 4.5,
  conversionRate: 3.8,
  conversionRateGrowth: -1.2,
};

export const initialClothingTopProducts: ClothingProductSalesStat[] = [
  {
    id: "cl-stat-1",
    product: "Premium Slim-Fit Cotton Shirt",
    category: "Shirts",
    unitsSold: 340,
    revenue: 42500,
    growth: 18,
    brand: "NEXORA Menswear",
    sku: "625125",
    averagePrice: 125,
    stockLeft: 45,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-2",
    product: "Classic Stretch Indigo Denim Jeans",
    category: "Denim & Jeans",
    unitsSold: 280,
    revenue: 38400,
    growth: 12,
    brand: "Levi's",
    sku: "482910",
    averagePrice: 137,
    stockLeft: 32,
    image: "https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-3",
    product: "Embroidered Silk Blend Panjabi",
    category: "Panjabi & Kurta",
    unitsSold: 220,
    revenue: 29700,
    growth: 25,
    brand: "Aarong Heritage",
    sku: "739102",
    averagePrice: 135,
    stockLeft: 18,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-4",
    product: "Vintage Sherpa-Lined Denim Jacket",
    category: "Jackets & Coats",
    unitsSold: 198,
    revenue: 24800,
    growth: -4,
    brand: "Levi's",
    sku: "501928",
    averagePrice: 125,
    stockLeft: 6,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-5",
    product: "Heavyweight Cotton Crewneck T-Shirt",
    category: "T-Shirts",
    unitsSold: 156,
    revenue: 19500,
    growth: 8,
    brand: "Zara",
    sku: "192847",
    averagePrice: 125,
    stockLeft: 80,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-6",
    product: "Floral Print Chiffon Maxi Dress",
    category: "Womenswear",
    unitsSold: 125,
    revenue: 16800,
    growth: 15,
    brand: "H&M",
    sku: "392019",
    averagePrice: 134,
    stockLeft: 14,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-7",
    product: "Tailored Italian Wool Blend Blazer",
    category: "Formal Wear",
    unitsSold: 112,
    revenue: 15400,
    growth: 6,
    brand: "Tommy Hilfiger",
    sku: "381920",
    averagePrice: 138,
    stockLeft: 12,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-8",
    product: "Slim Fit Stretch Khaki Chino Pants",
    category: "Trousers & Pants",
    unitsSold: 98,
    revenue: 12800,
    growth: 11,
    brand: "Dockers",
    sku: "829104",
    averagePrice: 130,
    stockLeft: 28,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-9",
    product: "Oversized Fleece Pullover Hoodie",
    category: "Hoodies & Sweaters",
    unitsSold: 68,
    revenue: 8900,
    growth: -2,
    brand: "Nike Sportswear",
    sku: "647281",
    averagePrice: 131,
    stockLeft: 16,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-10",
    product: "Classic Pique Cotton Polo Shirt",
    category: "Polo Shirts",
    unitsSold: 42,
    revenue: 5500,
    growth: 3,
    brand: "Ralph Lauren",
    sku: "918273",
    averagePrice: 131,
    stockLeft: 35,
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-11",
    product: "Pure Linen Cuban Collar Summer Shirt",
    category: "Shirts",
    unitsSold: 38,
    revenue: 4940,
    growth: 14,
    brand: "Massimo Dutti",
    sku: "772910",
    averagePrice: 130,
    stockLeft: 22,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-12",
    product: "Embroidered Georgette Salwar Suit",
    category: "Ethnic Wear",
    unitsSold: 31,
    revenue: 4340,
    growth: 9,
    brand: "Aarong Heritage",
    sku: "884102",
    averagePrice: 140,
    stockLeft: 15,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-13",
    product: "Merino Wool V-Neck Knitted Sweater",
    category: "Hoodies & Sweaters",
    unitsSold: 28,
    revenue: 3640,
    growth: 7,
    brand: "Uniqlo",
    sku: "991204",
    averagePrice: 130,
    stockLeft: 19,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-stat-14",
    product: "Relaxed Fit 6-Pocket Tactical Cargo Pants",
    category: "Trousers & Pants",
    unitsSold: 25,
    revenue: 3250,
    growth: -1,
    brand: "NEXORA Menswear",
    sku: "551920",
    averagePrice: 130,
    stockLeft: 26,
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80",
  },
];

// Monthly Sales trend for clothing retail
export const monthlyClothingSalesTrend = [
  { month: "Jan", sales: 112000, orders: 380, units: 1420 },
  { month: "Feb", sales: 124000, orders: 410, units: 1560 },
  { month: "Mar", sales: 138000, orders: 435, units: 1720 },
  { month: "Apr", sales: 145000, orders: 460, units: 1890 },
  { month: "May", sales: 152000, orders: 486, units: 2010 },
  { month: "Jun", sales: 149000, orders: 472, units: 1940 },
  { month: "Jul", sales: 158000, orders: 504, units: 2150 },
  { month: "Aug", sales: 164000, orders: 520, units: 2280 },
  { month: "Sep", sales: 171000, orders: 545, units: 2410 },
  { month: "Oct", sales: 178000, orders: 568, units: 2560 },
  { month: "Nov", sales: 189000, orders: 595, units: 2720 },
  { month: "Dec", sales: 210000, orders: 640, units: 3100 },
];

// Clothing category distribution
export const clothingCategoryBreakdown = [
  { name: "Shirts", value: 42500, color: "#0c6760" },
  { name: "Denim & Jeans", value: 38400, color: "#14b8a6" },
  { name: "Panjabi & Kurta", value: 29700, color: "#f59e0b" },
  { name: "Jackets & Coats", value: 24800, color: "#3b82f6" },
  { name: "T-Shirts", value: 19500, color: "#8b5cf6" },
  { name: "Womenswear", value: 16800, color: "#ec4899" },
  { name: "Formal Wear", value: 15400, color: "#10b981" },
  { name: "Others", value: 12800, color: "#64748b" },
];

const STORAGE_KEY = "nexora_clothing_sales_analytics";

export function getStoredSalesAnalytics(): ClothingProductSalesStat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClothingTopProducts));
      return initialClothingTopProducts;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return initialClothingTopProducts;
  } catch {
    return initialClothingTopProducts;
  }
}

export function saveStoredSalesAnalytics(items: ClothingProductSalesStat[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("nexora_sales_analytics_updated"));
  } catch (e) {
    console.error("Failed to save sales analytics", e);
  }
}

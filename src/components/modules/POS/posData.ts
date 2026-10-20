export interface POSProduct {
  id: string;
  code: string;
  name: string;
  category: "Computers" | "Smartphones" | "Footwear" | "Headphones" | "Watches" | "Appliances" | "Lighting";
  price: number;
  image: string;
  stock: number;
  variant?: string;
}

export interface POSCartItem {
  id: string;
  product: POSProduct;
  qty: number;
  price: number;
  total: number;
}

export const POS_CATEGORIES = [
  { id: "all", name: "All Categories", icon: "LayoutGrid" },
  { id: "Headphones", name: "Headphones", icon: "Headphones" },
  { id: "Footwear", name: "Footwear", icon: "Footprints" },
  { id: "Smartphones", name: "Smartphones", icon: "Smartphone" },
  { id: "Watches", name: "Watches", icon: "Watch" },
  { id: "Computers", name: "Computers", icon: "Laptop" },
  { id: "Appliances", name: "Appliances", icon: "Tv" },
  { id: "Lighting", name: "Lighting", icon: "Lightbulb" },
] as const;

export const INITIAL_POS_PRODUCTS: POSProduct[] = [
  {
    id: "pos-prod-1",
    code: "PRO0011",
    name: "MacBook Pro",
    category: "Computers",
    price: 1800,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80",
    stock: 24,
    variant: "14-inch Space Gray",
  },
  {
    id: "pos-prod-2",
    code: "PRO0012",
    name: "iPhone 14",
    category: "Smartphones",
    price: 800,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80",
    stock: 40,
    variant: "128GB Midnight",
  },
  {
    id: "pos-prod-3",
    code: "PRO0014",
    name: "Nike Angelo Red",
    category: "Footwear",
    price: 300,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    stock: 55,
    variant: "Size 42 / Red",
  },
  {
    id: "pos-prod-4",
    code: "PRO0015",
    name: "Airpod 2",
    category: "Headphones",
    price: 150,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=80",
    stock: 60,
    variant: "White Charging Case",
  },
  {
    id: "pos-prod-5",
    code: "PRO0018",
    name: "Adidas IX Blue",
    category: "Footwear",
    price: 280,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop&q=80",
    stock: 35,
    variant: "Size 41 / Blue",
  },
  {
    id: "pos-prod-6",
    code: "PRO0019",
    name: "IdeaPad Slim 5",
    category: "Computers",
    price: 1200,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80",
    stock: 18,
    variant: "15.6-inch Core i7",
  },
  {
    id: "pos-prod-7",
    code: "PRO0020",
    name: "Beats Pro",
    category: "Headphones",
    price: 450,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    stock: 22,
    variant: "Matte Black Wireless",
  },
  {
    id: "pos-prod-8",
    code: "PRO0021",
    name: "Tablet 1.02",
    category: "Smartphones",
    price: 600,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80",
    stock: 29,
    variant: "10.2-inch Retina 64GB",
  },
  {
    id: "pos-prod-9",
    code: "PRO0023",
    name: "Nike Neo Green",
    category: "Footwear",
    price: 320,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=80",
    stock: 30,
    variant: "Size 43 / Neon",
  },
  {
    id: "pos-prod-10",
    code: "PRO0025",
    name: "Office Shoes",
    category: "Footwear",
    price: 400,
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&auto=format&fit=crop&q=80",
    stock: 20,
    variant: "Brown Leather Oxford",
  },
  {
    id: "pos-prod-11",
    code: "PRO0028",
    name: "Heavy Dry Iron",
    category: "Appliances",
    price: 1600,
    image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500&auto=format&fit=crop&q=80",
    stock: 45,
    variant: "--no variants--",
  },
  {
    id: "pos-prod-12",
    code: "PRO0030",
    name: "Smart Watch Ultra",
    category: "Watches",
    price: 350,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
    stock: 50,
    variant: "Titanium 49mm",
  },
  {
    id: "pos-prod-13",
    code: "PRO0032",
    name: "Desk LED Lamp",
    category: "Lighting",
    price: 85,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80",
    stock: 35,
    variant: "Dimmable Touch Control",
  },
];

export const INITIAL_CART_ITEMS: POSCartItem[] = [
  {
    id: "cart-1",
    product: INITIAL_POS_PRODUCTS[2], // Nike Angelo Red
    qty: 4,
    price: 300,
    total: 1200,
  },
  {
    id: "cart-2",
    product: INITIAL_POS_PRODUCTS[4], // Adidas IX Blue
    qty: 1,
    price: 280,
    total: 280,
  },
  {
    id: "cart-3",
    product: INITIAL_POS_PRODUCTS[8], // Nike Neo Green
    qty: 1,
    price: 320,
    total: 320,
  },
  {
    id: "cart-4",
    product: INITIAL_POS_PRODUCTS[9], // Office Shoes
    qty: 1,
    price: 400,
    total: 400,
  },
];

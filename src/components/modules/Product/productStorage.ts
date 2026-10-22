export interface ProductVariantItem {
  id: string;
  optionName: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  status?: "In Stock" | "Low Stock" | "No Stock";
}

export interface ProductItem {
  id: string;
  code?: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory?: string;
  brand: string;
  model?: string;
  unit: string;
  quantity: number;
  status: "In Stock" | "Low Stock" | "No Stock";
  sellingPrice: number;
  purchasePrice: number;
  costPrice?: number;
  reorderLevel?: number;
  alertQuantity?: number;
  taxRate?: string;
  taxType?: string;
  expiryDate?: string;
  warrantyType?: string;
  warrantyPeriod?: string;
  warehouse?: string;
  section?: string;
  subsection?: string;
  variants?: ProductVariantItem[];
  description?: string;
  image: string;
  activeStatus?: "Active" | "Inactive";
  createdAt: string;
}

const STORAGE_KEY = "nexora_erp_clothing_products_v2";

export const initialClothingProducts: ProductItem[] = [
  {
    id: "prod-clo-1",
    code: "#CLO001",
    name: "Premium Slim-Fit Cotton Shirt",
    sku: "625125",
    barcode: "625125890123",
    category: "Shirts",
    brand: "NEXORA Menswear",
    unit: "Piece",
    quantity: 45,
    status: "In Stock",
    sellingPrice: 1850,
    purchasePrice: 1300,
    costPrice: 1250,
    reorderLevel: 10,
    taxRate: "5% VAT",
    description: "100% Egyptian combed cotton slim-fit formal shirt with easy-iron finish.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "prod-clo-2",
    code: "#CLO002",
    name: "Classic Stretch Indigo Denim Jeans",
    sku: "482910",
    barcode: "482910712390",
    category: "Denim & Jeans",
    brand: "Levi's",
    unit: "Piece",
    quantity: 32,
    status: "In Stock",
    sellingPrice: 3200,
    purchasePrice: 2400,
    costPrice: 2300,
    reorderLevel: 8,
    taxRate: "5% VAT",
    description: "Classic 5-pocket straight fit stretch jeans with authentic vintage stone wash.",
    image: "https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-19T11:20:00Z",
  },
  {
    id: "prod-clo-3",
    code: "#CLO003",
    name: "Embroidered Silk Blend Panjabi",
    sku: "739102",
    barcode: "739102849102",
    category: "Panjabi & Kurta",
    brand: "Aarong Heritage",
    unit: "Piece",
    quantity: 18,
    status: "In Stock",
    sellingPrice: 4500,
    purchasePrice: 3400,
    costPrice: 3200,
    reorderLevel: 5,
    taxRate: "5% VAT",
    description: "Traditional designer festive Panjabi with intricate hand embroidery along the collar and placket.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-18T14:15:00Z",
  },
  {
    id: "prod-clo-4",
    code: "#CLO004",
    name: "Heavyweight Cotton Crewneck T-Shirt",
    sku: "192847",
    barcode: "192847659102",
    category: "T-Shirts",
    brand: "Zara",
    unit: "Piece",
    quantity: 80,
    status: "In Stock",
    sellingPrice: 950,
    purchasePrice: 600,
    costPrice: 550,
    reorderLevel: 20,
    taxRate: "5% VAT",
    description: "240 GSM ultra-soft combed cotton minimalist everyday crewneck t-shirt.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-17T09:40:00Z",
  },
  {
    id: "prod-clo-5",
    code: "#CLO005",
    name: "Floral Print Chiffon Maxi Dress",
    sku: "392019",
    barcode: "392019812903",
    category: "Womenswear",
    brand: "H&M",
    unit: "Piece",
    quantity: 14,
    status: "In Stock",
    sellingPrice: 3800,
    purchasePrice: 2800,
    costPrice: 2650,
    reorderLevel: 6,
    taxRate: "5% VAT",
    description: "Flowy floral summer evening maxi dress with tiered hem and breathable lining.",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-16T16:00:00Z",
  },
  {
    id: "prod-clo-6",
    code: "#CLO006",
    name: "Vintage Sherpa-Lined Denim Jacket",
    sku: "501928",
    barcode: "501928746192",
    category: "Jackets & Coats",
    brand: "Levi's",
    unit: "Piece",
    quantity: 6,
    status: "Low Stock",
    sellingPrice: 5200,
    purchasePrice: 4100,
    costPrice: 3950,
    reorderLevel: 8,
    taxRate: "5% VAT",
    description: "Rugged trucker style denim jacket featuring warm sherpa fleece interior lining.",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-15T12:30:00Z",
  },
  {
    id: "prod-clo-7",
    code: "#CLO007",
    name: "Slim Fit Stretch Khaki Chino Pants",
    sku: "829104",
    barcode: "829104619283",
    category: "Trousers & Pants",
    brand: "Dockers",
    unit: "Piece",
    quantity: 28,
    status: "In Stock",
    sellingPrice: 2600,
    purchasePrice: 1950,
    costPrice: 1850,
    reorderLevel: 10,
    taxRate: "5% VAT",
    description: "Smart-casual twill chino trousers with flexible waistband and wrinkle-resistant fabric.",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-14T10:10:00Z",
  },
  {
    id: "prod-clo-8",
    code: "#CLO008",
    name: "Oversized Fleece Pullover Hoodie",
    sku: "647281",
    barcode: "647281928471",
    category: "Hoodies & Sweaters",
    brand: "Nike Sportswear",
    unit: "Piece",
    quantity: 4,
    status: "Low Stock",
    sellingPrice: 3400,
    purchasePrice: 2600,
    costPrice: 2450,
    reorderLevel: 8,
    taxRate: "5% VAT",
    description: "Cozy brushed-back cotton blend fleece hoodie with kangaroo pocket and double-layer hood.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-13T13:45:00Z",
  },
  {
    id: "prod-clo-9",
    code: "#CLO009",
    name: "Classic Pique Cotton Polo Shirt",
    sku: "918273",
    barcode: "918273849102",
    category: "Polo Shirts",
    brand: "Ralph Lauren",
    unit: "Piece",
    quantity: 35,
    status: "In Stock",
    sellingPrice: 2100,
    purchasePrice: 1550,
    costPrice: 1450,
    reorderLevel: 10,
    taxRate: "5% VAT",
    description: "Breathable textured cotton pique knit polo with ribbed collar and mother-of-pearl buttons.",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-12T15:20:00Z",
  },
  {
    id: "prod-clo-10",
    code: "#CLO010",
    name: "Tailored Italian Wool Blend Blazer",
    sku: "381920",
    barcode: "381920194829",
    category: "Formal Wear",
    brand: "Tommy Hilfiger",
    unit: "Piece",
    quantity: 0,
    status: "No Stock",
    sellingPrice: 8500,
    purchasePrice: 6500,
    costPrice: 6200,
    reorderLevel: 3,
    taxRate: "5% VAT",
    description: "Two-button single-breasted structured blazer crafted from premium wool blend fabric.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80",
    activeStatus: "Active",
    createdAt: "2026-01-11T08:50:00Z",
  },
];

export const getStoredProducts = (): ProductItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClothingProducts));
      return initialClothingProducts;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClothingProducts));
    return initialClothingProducts;
  } catch (e) {
    console.error("Error reading products from localStorage", e);
    return initialClothingProducts;
  }
};

export const saveStoredProducts = (products: ProductItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("nexora_products_updated"));
  } catch (e) {
    console.error("Error saving products to localStorage", e);
  }
};

export const addStoredProduct = (
  product: Omit<ProductItem, "id" | "createdAt" | "status"> & {
    status?: "In Stock" | "Low Stock" | "No Stock";
  }
): ProductItem => {
  const current = getStoredProducts();
  const nextNum = current.length + 1;
  const code = `#CLO${String(nextNum).padStart(3, "0")}`;

  const qty = Number(product.quantity) || 0;
  const alertThreshold =
    product.alertQuantity !== undefined
      ? Number(product.alertQuantity)
      : product.reorderLevel !== undefined
      ? Number(product.reorderLevel)
      : 5;
  const reorder =
    product.reorderLevel !== undefined
      ? Number(product.reorderLevel)
      : alertThreshold;

  let computedStatus: "In Stock" | "Low Stock" | "No Stock" = "In Stock";
  if (qty <= 0) {
    computedStatus = "No Stock";
  } else if (qty <= alertThreshold) {
    computedStatus = "Low Stock";
  }

  // Fallback image if none provided
  const defaultImage =
    product.image ||
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80";

  const newProduct: ProductItem = {
    ...product,
    id: `prod-clo-${Date.now()}`,
    code,
    image: defaultImage,
    quantity: qty,
    status: product.status || computedStatus,
    activeStatus: product.activeStatus || "Active",
    sellingPrice: Number(product.sellingPrice) || 0,
    purchasePrice: Number(product.purchasePrice) || Number(product.costPrice) || 0,
    costPrice: Number(product.costPrice) || Number(product.purchasePrice) || 0,
    reorderLevel: reorder,
    alertQuantity: alertThreshold,
    taxRate: product.taxRate || "5% VAT",
    unit: product.unit || "Piece",
    createdAt: new Date().toISOString(),
  };

  const updated = [newProduct, ...current];
  saveStoredProducts(updated);
  return newProduct;
};

export const updateStoredProduct = (
  id: string,
  updates: Partial<ProductItem>
): ProductItem | null => {
  const current = getStoredProducts();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const item = current[index];
  const newQty = updates.quantity !== undefined ? Number(updates.quantity) : item.quantity;
  const alertThreshold =
    updates.alertQuantity !== undefined
      ? Number(updates.alertQuantity)
      : item.alertQuantity !== undefined
      ? Number(item.alertQuantity)
      : updates.reorderLevel !== undefined
      ? Number(updates.reorderLevel)
      : item.reorderLevel || 5;

  let computedStatus: "In Stock" | "Low Stock" | "No Stock" = item.status;
  if (newQty <= 0) {
    computedStatus = "No Stock";
  } else if (newQty <= alertThreshold) {
    computedStatus = "Low Stock";
  } else {
    computedStatus = "In Stock";
  }

  const updatedItem: ProductItem = {
    ...item,
    ...updates,
    quantity: newQty,
    status: updates.status || computedStatus,
  };

  current[index] = updatedItem;
  saveStoredProducts(current);
  return updatedItem;
};

export const deleteStoredProduct = (id: string): boolean => {
  const current = getStoredProducts();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredProducts(filtered);
  return true;
};

export const resetStoredProducts = (): ProductItem[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClothingProducts));
  window.dispatchEvent(new Event("nexora_products_updated"));
  return initialClothingProducts;
};

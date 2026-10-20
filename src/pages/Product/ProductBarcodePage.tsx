import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ProductBarcode } from "@/components/modules/Product/ProductBarcode";
import { getStoredProducts, ProductItem } from "@/components/modules/Product/productStorage";
import { toast } from "sonner";

export const ProductBarcodePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    const products = getStoredProducts();
    if (id) {
      const found = products.find((p) => p.id === id || p.sku === id);
      if (found) {
        setProduct(found);
      } else {
        toast.error("Product not found");
        navigate("/inventory/products");
      }
    } else if (products.length > 0) {
      setProduct(products[0]);
    }
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="py-12 text-center text-slate-400">Loading product...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <ProductBarcode
        product={product}
        onClose={() => navigate("/inventory/products")}
        isStandalonePage={true}
      />
    </div>
  );
};

export default ProductBarcodePage;

import { Link, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/getDateFormater";
import Loader from "@/pages/Spinner";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit,
  ImageIcon,
  Link as LinkIcon,
  List,
  Package
} from "lucide-react";
import { useGetProductDetailsQuery } from "@/redux/features/product/product.api";
import { useState } from "react";

// Assuming you have an IProduct type imported
import { IProduct, IProductVariation, ISpecification } from "@/types/product.type";

const ViewProductDetails = () => {
  const { slug } = useParams();
  const { data: responseData, isLoading } = useGetProductDetailsQuery(slug);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  // Extract the actual product data from the nested response
  const product: IProduct = responseData?.data;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-xl font-medium text-gray-500 dark:text-gray-400">Product not found</p>
        <Link to="/admin/products">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Products</Button>
        </Link>
      </div>
    );
  }

  // Set initial selected image if available
  const mainImage = selectedImage || (product.images && product.images[0]);

  return (
    <div className="w-full mx-auto p-2 md:p-4 lg:p-5">

      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Link
          to="/products"
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <Link to={`/product/edit/${product._id}`}>
          <Button className="bg-primary hover:bg-secondary cursor-pointer text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        </Link>
      </div>

      {/* Split Layout Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ================= LEFT SIDE: IMAGE GALLERY ================= */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 sticky top-6">
          {/* Main Large Image */}
          <Card className="overflow-hidden border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl">
            <div className="aspect-square bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-sm">No images uploaded</p>
                </div>
              )}
            </div>
          </Card>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${mainImage === imgUrl ? "border-primary shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDE: PRODUCT DETAILS ================= */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">

          {/* Main Info Header */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-3xl font-extrabold text-primary">
                ${product.basePrice.toFixed(2)}
              </span>
              <Badge variant="outline" className="px-3 py-1 text-sm bg-gray-50 dark:bg-zinc-900 font-mono text-gray-500">
                /{product.slug}
              </Badge>
            </div>
          </div>

          {/* Highlights / Bullet Points */}
          {product.bulletPoints && product.bulletPoints.length > 0 && (
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} /> Key Highlights
              </h3>
              <ul className="grid gap-2">
                {product.bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start text-gray-700 dark:text-gray-300 text-sm">
                    <span className="mr-2 text-blue-500 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variations (Colors/Sizes) */}
          {product.variations && product.variations.length > 0 && (
            <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" /> Inventory & Variations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-3">
                  {product.variations.map((v: IProductVariation, idx) => (
                    <div key={idx} className="flex flex-col bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 min-w-[120px]">
                      <span className="text-xs font-semibold text-gray-500 uppercase">{v.color || v.size || "Standard"}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{v.stock} in stock</span>
                        {v.price && <span className="text-sm text-primary">+${v.price}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description Card (HTML Content) */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg">Product Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {product.description ? (
                // Dangerously set HTML to render the TextEditor content safely inside this controlled container
                <div
                  className="prose prose-sm md:prose-base prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <span className="text-gray-400 italic">No description provided.</span>
              )}
            </CardContent>
          </Card>

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <List className="w-5 h-5 text-gray-400" /> Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                  {product.specifications.map((spec: ISpecification, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-1/3">{spec.name}</span>
                      <span className="text-sm text-gray-900 dark:text-gray-200 w-2/3 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Images Strip */}
          {product.featureImages && product.featureImages.length > 0 && (
            <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800/50">
                <CardTitle className="text-lg">Feature Banners</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.featureImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Feature ${idx}`} className="w-full rounded-xl border border-gray-200 dark:border-zinc-800" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta Data Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800/50 pt-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>Created: {formatDate(product.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span>ID: {product._id?.slice(-8)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewProductDetails;
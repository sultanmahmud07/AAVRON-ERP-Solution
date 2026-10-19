/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ExternalLink, ImageIcon, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "@/utils/getDateFormater";
// Adjust import path based on your actual API slice
import { useGetDashboardAnalyticsQuery } from "@/redux/features/product/product.api"; 

// Using the type inferred from your JSON data
interface IRecentProduct {
  _id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: string[];
  variations: any[];
  createdAt: string;
}

const RecentProductForOverview = () => {
  // We use the same query as the dashboard. RTK Query caches this, 
  // so it won't make a duplicate network request if already fetched by the parent.
  const { data: response, isLoading } = useGetDashboardAnalyticsQuery(undefined);

  const recentProducts: IRecentProduct[] = response?.data?.data?.recent?.products || [];

  if (isLoading) {
    return (
      <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
        <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="w-48 h-6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Skeleton Rows */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
              <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-zinc-800 animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="w-3/4 h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                <div className="flex gap-3">
                  <div className="w-16 h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                  <div className="w-12 h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
      <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#1BAE70]/10 rounded-lg">
            <Package className="w-5 h-5 text-[#1BAE70]" />
          </div>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Recently Added Products</CardTitle>
        </div>
        <Link to="/products">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#1BAE70] dark:text-gray-400 dark:hover:text-[#1BAE70] hover:bg-[#1BAE70]/10 dark:hover:bg-[#1BAE70]/10 transition-colors -mr-2">
            View All Catalog <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="p-0">
        {recentProducts.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400 dark:text-zinc-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No products added recently.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
            {recentProducts.map((product) => (
              <div 
                key={product._id} 
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  
                  {/* Thumbnail with zoom effect */}
                  <div className="w-14 h-14 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 bg-white dark:bg-zinc-900 relative">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-zinc-800">
                        <ImageIcon className="w-5 h-5 text-gray-300 dark:text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-4">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-bold text-[#1BAE70] dark:text-[#25d38a]">
                        ${product.basePrice?.toFixed(2) || "0.00"}
                      </span>
                      {/* Variations Badge */}
                      <Badge variant="secondary" className="px-2 py-0 text-[10px] font-semibold tracking-wide bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-0 uppercase">
                        {product.variations?.length || 0} Variant{(product.variations?.length !== 1) ? 's' : ''}
                      </Badge>
                      <span className="hidden sm:flex items-center text-xs text-gray-400 dark:text-zinc-500 font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(product.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action - Visible on mobile, hover on desktop */}
                <div className="flex-shrink-0 ml-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <Link to={`/product/edit/${product.slug}`}>
                    <Button variant="outline" size="sm" className="h-8 shadow-sm dark:border-zinc-700 dark:hover:bg-zinc-800 hover:text-[#1BAE70] dark:hover:text-[#25d38a]">
                      Manage <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentProductForOverview;
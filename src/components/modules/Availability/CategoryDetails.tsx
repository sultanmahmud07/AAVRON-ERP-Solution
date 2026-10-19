import { Link, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/getDateFormater";
import { useGetCategoryDetailsQuery } from "@/redux/features/category/category.api";
import Loader from "@/pages/Spinner";
import { 
  ArrowLeft, 
  CalendarDays, 
  Edit, 
  Eye, 
  EyeOff, 
  Hash, 
  ImageIcon, 
  Link as LinkIcon 
} from "lucide-react";

const CategoryDetails = () => {
  const { slug } = useParams();
  const { data, isLoading } = useGetCategoryDetailsQuery(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  // Assuming your backend response wraps the object in a "data" property
  // based on the JSON you provided: { success: true, data: { _id: "...", name: "..." } }
  const category = data;

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-xl font-medium text-gray-500 dark:text-gray-400">Category not found</p>
        <Link to="/categories">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Link 
          to="/categories" 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Link>
        
        <Link to={`/category/edit/${category.slug}`}>
          <Button className="bg-primary hover:bg-secondary cursor-pointer text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit Category
          </Button>
        </Link>
      </div>

      {/* Split Layout Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ================= LEFT SIDE: THUMBNAIL ================= */}
        <div className="w-full lg:w-1/3 sticky top-6">
          <Card className="overflow-hidden border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl">
            <div className="aspect-square bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4">
              {category.thumbnail ? (
                <img
                  src={category.thumbnail}
                  alt={category.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-sm">No thumbnail uploaded</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ================= RIGHT SIDE: DETAILS ================= */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Main Info Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              {category.visibility ? (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 px-3 py-1 text-xs">
                  <Eye className="w-3 h-3 mr-1" /> Public
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  <EyeOff className="w-3 h-3 mr-1" /> Hidden (Draft)
                </Badge>
              )}
            </div>
          </div>

          {/* Description Card */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {category.description || <span className="text-gray-400 italic">No description provided for this category.</span>}
              </p>
            </CardContent>
          </Card>

          {/* Meta Data Grid */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg">Category Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
                
                {/* Slug */}
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg text-gray-500 h-fit">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">URL Slug</p>
                    <p className="font-mono text-sm bg-gray-50 dark:bg-zinc-900 px-2 py-1 rounded-md w-fit border border-gray-100 dark:border-zinc-800">
                      /{category.slug}
                    </p>
                  </div>
                </div>

                {/* Display Order */}
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg text-gray-500 h-fit">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Display Order</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {category.order}
                    </p>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg text-gray-500 h-fit">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(category.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Updated At */}
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg text-gray-500 h-fit">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(category.updatedAt)}
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;
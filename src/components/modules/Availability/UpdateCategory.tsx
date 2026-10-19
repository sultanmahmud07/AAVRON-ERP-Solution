import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IApiError } from "@/types";
import { useNavigate, useParams } from "react-router";
import { Loader2, LayoutGrid, X, ImageIcon } from "lucide-react";
// Import your GET and UPDATE hooks
import { 
  useGetCategoryDetailsQuery,
  useUpdateCategoryMutation
} from "@/redux/features/category/category.api";

// 1. Zod schema matched to your Mongoose Model
const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  visibility: z.boolean(),
  order: z.number(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const UpdateCategoryComponent = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const navigate = useNavigate();
  const { slug } = useParams(); // Get the slug/id from the route URL
  
  // Fetch existing data
  const { data: existingData, isLoading: isFetching } = useGetCategoryDetailsQuery(slug);
  
  // Use Update mutation instead of Add
  const [updateCategory, { isLoading: isSubmitting }] = useUpdateCategoryMutation();

  // State for file upload & preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      visibility: true,
      order: 0,
    },
  });

  // 2. Populate form with fetched data
  useEffect(() => {
    if (existingData) {
      const category = existingData;
      
      form.reset({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        visibility: category.visibility ?? true,
        order: category.order || 0,
      });

      // Set the existing image as the preview
      if (category.thumbnail) {
        setPreviewUrl(category.thumbnail);
      }
    }
  }, [existingData, form]);

  // Handle File Selection & Generate Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Generate local preview URL
    }
  };

  // Handle File Removal
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null); // This clears the preview, showing the upload prompt
  };

  const onSubmit = async (data: CategoryFormValues) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    // Only append the file if the user actually uploaded a NEW image
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      // Assuming your update mutation expects { id, data } 
      // Adjust this based on how your RTK Query endpoint is structured
      const res = await updateCategory({ 
        categoryId: existingData?._id, 
        categoryInfo: formData 
      }).unwrap();

      if (res.success) {
        toast.success("Category updated successfully");
        navigate("/categories");
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to update category");
      if (error?.data?.errorSources) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?.data?.errorSources.forEach((er: any) => toast.error(er.message));
      }
    }
  };

  // Show a loading state while fetching the initial data
  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#1BAE70]" />
        <p className="text-gray-500 font-medium">Loading category details...</p>
      </div>
    );
  }

  return (
    <div className={cn("max-w-6xl mx-auto p-4 md:p-8", className)}>
      
      {/* Header */}
      <div className="space-y-2 border-b border-gray-100 dark:border-zinc-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="w-7 h-7 text-[#1BAE70]" />
          Update Category
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Modify the details or thumbnail of your existing category.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* ================= LEFT SIDE: IMAGE UPLOAD ================= */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4 sticky top-6">
            <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white">Category Thumbnail</FormLabel>
            
            <div className="relative flex flex-col items-center justify-center w-full aspect-square md:aspect-auto md:h-80 border-2 border-dashed rounded-2xl border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 overflow-hidden transition-all">
              
              {previewUrl ? (
                // Image Preview State
                <div className="relative w-full h-full group">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  {/* Remove Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="rounded-full w-12 h-12 shadow-lg"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Upload Prompt State
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-6 text-center group-hover:text-[#1BAE70] transition-colors">
                    <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                      <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-[#1BAE70] transition-colors" />
                    </div>
                    <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Upload an image</p>
                    <p className="text-sm">Drag and drop or click to browse</p>
                    <p className="text-xs text-gray-400 mt-4">JPG, PNG or WEBP (Max 2MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ================= RIGHT SIDE: FORM FIELDS ================= */}
          <div className="w-full lg:w-2/3 bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/50 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Category Name</FormLabel>
                    <FormControl>
                      <Input className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl" placeholder="e.g. Electronics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Slug</FormLabel>
                    <FormControl>
                      <Input className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl font-mono text-sm" placeholder="e.g. electronics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order */}
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl"
                        placeholder="0"
                        defaultValue={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Visibility Switch */}
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="space-y-1 mr-4">
                      <FormLabel className="text-base text-gray-900 dark:text-white">Public Visibility</FormLabel>
                      <FormDescription className="text-xs">
                        {field.value ? "Category is visible to users." : "Category is hidden (Draft)."}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#1BAE70]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-gray-50 dark:bg-zinc-900 resize-none h-32 rounded-xl"
                      placeholder="Write a brief description about this category..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
              <Button
                type="submit"
                className="w-full md:w-auto px-10 h-12 bg-primary hover:bg-secondary cursor-pointer text-white rounded-xl font-medium text-base transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                {isSubmitting ? "Updating..." : "Update Category"}
              </Button>
            </div>
            
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateCategoryComponent;
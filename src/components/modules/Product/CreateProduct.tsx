/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, UploadCloud, X } from "lucide-react";

import { useAddProductMutation } from "@/redux/features/product/product.api";
import { IApiError } from "@/types";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import "react-quill-new/dist/quill.snow.css";
import TextEditor from "./TextEditor";

// 1. Zod Schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  basePrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
  description: z.string().optional(),
  category: z.string().optional(),
  bulletPoints: z.array(z.object({ value: z.string().min(1, "Cannot be empty") })).optional(),
  specifications: z.array(
    z.object({
      name: z.string().min(1, "Name required"),
      value: z.string().min(1, "Value required"),
    })
  ).optional(),
  variations: z.array(
    z.object({
      color: z.string().optional(),
      size: z.string().optional(),
      stock: z.coerce.number().min(0, "Stock cannot be negative"),
      price: z.coerce.number().optional(),
    })
  ).min(1, "At least one variation is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [createProduct, { isLoading: isSubmitting }] = useAddProductMutation();
  const { data: categoryData, isLoading: isLoadingCategories } = useGetAllCategoriesQuery(undefined);
  const categories = categoryData?.data || [];
  
  // 2. Separate State for Files
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [featureFiles, setFeatureFiles] = useState<File[]>([]);

  // 3. Initialize Form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      basePrice: 0,
      description: "",
      category: "",
      bulletPoints: [{ value: "" }],
      specifications: [{ name: "", value: "" }],
      variations: [{ color: "", stock: 0 }],
    },
  });

  // Dynamic Array Handlers
  const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({ control, name: "variations" });
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: "specifications" });
  const { fields: bulletFields, append: appendBullet, remove: removeBullet } = useFieldArray({ control, name: "bulletPoints" });

  // 4. Form Submission
  const onSubmit = async (data: ProductFormValues) => {
    const formattedData = {
      ...data,
      bulletPoints: data.bulletPoints?.map((bp) => bp.value) || [],
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(formattedData));

    galleryFiles.forEach((file) => formData.append("images", file));
    featureFiles.forEach((file) => formData.append("featureImages", file));

    try {
      const res = await createProduct(formData).unwrap();
      if (res.success) {
        toast.success("Product created successfully");
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to create product");
      if (error?.data?.errorSources) {
        error?.data?.errorSources.forEach((er: any) => toast.error(er.message));
      }
    }
  };

  // --- NEW: Helper functions to handle file selection and removal safely ---
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...newFiles]); // Append new images instead of replacing
    }
    // Reset the input so the same file can be selected again if needed
    e.target.value = "";
  };

  const removeGalleryFile = (indexToRemove: number) => {
    setGalleryFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFeatureFiles((prev) => [...prev, ...newFiles]); // Append new images
    }
    e.target.value = "";
  };

  const removeFeatureFile = (indexToRemove: number) => {
    setFeatureFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 md:pt-3">
      <div className="mb-5">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-gray-500">Create a new product listing for your store.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input placeholder="AMKOV 5K V-Log Camera..." {...register("name")} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>URL Slug</Label>
              <Input placeholder="amkov-5k-vlog-camera" {...register("slug")} />
              {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Base Price ($)</Label>
              <Input type="number" step="0.01" {...register("basePrice")} />
              {errors.basePrice && <p className="text-red-500 text-sm">{errors.basePrice.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextEditor
                    label="Product Description (HTML allowed)"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Variations */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Inventory & Variations</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => appendVariation({ color: "", size: "", stock: 0 })}>
              <Plus className="w-4 h-4 mr-2" /> Add Variation
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {variationFields.map((field, index) => (
              <div key={field.id} className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                <div className="space-y-2 flex-1 min-w-[150px]">
                  <Label>Color</Label>
                  <Input placeholder="Matte Black" {...register(`variations.${index}.color` as const)} />
                </div>
                <div className="space-y-2 flex-1 min-w-[150px]">
                  <Label>Size</Label>
                  <Input placeholder="XL (optional)" {...register(`variations.${index}.size` as const)} />
                </div>
                <div className="space-y-2 w-24">
                  <Label>Stock</Label>
                  <Input type="number" {...register(`variations.${index}.stock` as const)} />
                </div>
                <div className="space-y-2 w-32">
                  <Label>Extra Price (+)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" {...register(`variations.${index}.price` as const)} />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeVariation(index)} disabled={variationFields.length === 1}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {errors.variations && <p className="text-red-500 text-sm">{errors.variations.message}</p>}
          </CardContent>
        </Card>

        {/* Specs and Bullets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Specifications</CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={() => appendSpec({ name: "", value: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {specFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <Input placeholder="Sensor Type" {...register(`specifications.${index}.name` as const)} />
                  <Input placeholder="CMOS" {...register(`specifications.${index}.value` as const)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Bullet Points</CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={() => appendBullet({ value: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {bulletFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <Input placeholder="5K Ultra HD video resolution..." {...register(`bulletPoints.${index}.value` as const)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeBullet(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ================= MEDIA UPLOADS (UPDATED) ================= */}
        <Card>
          <CardHeader>
            <CardTitle>Media Files</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Gallery Images */}
            <div className="space-y-4">
              <Label>Gallery Images</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:dark:bg-gray-800 transition-colors relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleGalleryChange}
                />
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Click to Add Gallery Images</p>
                <p className="text-xs text-gray-500 mt-1">{galleryFiles.length} files selected</p>
              </div>

              {/* Preview Grid */}
              {galleryFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {galleryFiles.map((file, index) => (
                    <div key={index} className="relative w-20 h-20 group rounded-md overflow-hidden border">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`gallery-preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Banner Images */}
            <div className="space-y-4">
              <Label>Feature Banner Images</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:dark:bg-gray-800 transition-colors relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFeatureChange}
                />
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Click to Add Feature Images</p>
                <p className="text-xs text-gray-500 mt-1">{featureFiles.length} files selected</p>
              </div>

              {/* Preview Grid */}
              {featureFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {featureFiles.map((file, index) => (
                    <div key={index} className="relative w-32 h-20 group rounded-md overflow-hidden border">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`feature-preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeatureFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default CreateProduct;
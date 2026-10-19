/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner"; // Switched to sonner to match your other components
import { IApiError } from "@/types";
import { Loader2, LayoutGrid, UploadCloud, X, Plus } from "lucide-react";

// RTK Query Hook (Make sure this exists in your API slice)
import { useAddBlogMutation } from "@/redux/features/blog/blog.api";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TextEditor from "../Product/TextEditor";

type FormDataType = {
  title: string;
  slug: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  readTime: string;
  commentCount: string;
  tags: string[];
  keywords: string[]; // Added keywords array
  content: string;
  image: File | null;
};

const AddBlog = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const navigate = useNavigate();
  const [createBlog, { isLoading: isSubmitting }] = useAddBlogMutation();

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    slug: "",
    category: "",
    metaTitle: "",
    metaDescription: "",
    description: "",
    readTime: "",
    commentCount: "",
    tags: [],
    keywords: [], // Initialize keywords
    content: "",
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<string>("");
  const [keywordInput, setKeywordInput] = useState<string>("");

  // Auto-generate slug from title
  useEffect(() => {
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    };

    setFormData((prev) => ({
      ...prev,
      slug: prev.title ? generateSlug(prev.title) : "",
    }));
  }, [formData.title]);

  // Handle Input Changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "slug") {
      const cleaned = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setFormData({ ...formData, slug: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle Image Selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = ""; // Reset input
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setPreviewUrl(null);
  };

  // Handle Tags
  const handleTagAdd = (e?: React.KeyboardEvent | React.MouseEvent): void => {
    e?.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleTagDelete = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // Handle Keywords
  const handleKeywordAdd = (e?: React.KeyboardEvent | React.MouseEvent): void => {
    e?.preventDefault();
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleKeywordDelete = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  // Handle Text Editor content
  // Assuming your TextEditor component accepts value and onChange props now
  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  // Handle Submission using RTK Query
// Handle Submission using RTK Query
  const handleCreateBlog = async (): Promise<void> => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required.");
      return;
    }

    const bodyFormData = new FormData();

    // 1. Group all text, number, and array fields into a single object.
    // We also convert readTime and commentCount to numbers so Zod doesn't complain.
    const payloadData = {
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      content: formData.content,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      description: formData.description,
      readTime: formData.readTime ? Number(formData.readTime) : 0,
      commentCount: formData.commentCount ? Number(formData.commentCount) : 0,
      tags: formData.tags,
      keywords: formData.keywords,
      reference: "default-reference" // Added because your previous Zod error said this was required
    };

    // 2. Append the entire object as a JSON string under the "data" key
    bodyFormData.append("data", JSON.stringify(payloadData));
    
    // 3. Append the image under the "file" key
    if (formData.image) {
      bodyFormData.append("file", formData.image);
    }

    try {
      const res = await createBlog(bodyFormData).unwrap();
      if (res.success) { 
        toast.success("Blog published successfully!");
        navigate("/news");
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to publish blog");
      if (error?.data?.errorSources) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?.data?.errorSources.forEach((er: any) => toast.error(er.message));
      }
    }
  };

  return (
    <div className={cn("  p-4 md:p-5", className)}>
      
      {/* Header */}
      <div className="space-y-2 border-b border-gray-100 dark:border-zinc-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="w-7 h-7 text-primary" />
          Create New Post
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Write and publish a new article for your blog.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ================= LEFT SECTION (MAIN CONTENT) ================= */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          
          {/* Basic Fields Card */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
              <CardTitle className="text-lg">Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div className="space-y-2">
                <Label className="text-base">Post Title</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a captivating title..."
                  className="h-12 text-lg font-medium bg-gray-50 dark:bg-zinc-900 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Short Description (Excerpt)</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A brief summary of the article..."
                  className="h-24 resize-none bg-gray-50 dark:bg-zinc-900 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Technology"
                    className="bg-gray-50 dark:bg-zinc-900 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Read Time (mins)</Label>
                  <Input
                    name="readTime"
                    type="number"
                    value={formData.readTime}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="bg-gray-50 dark:bg-zinc-900 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Initial Comments</Label>
                  <Input
                    name="commentCount"
                    type="number"
                    value={formData.commentCount}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-gray-50 dark:bg-zinc-900 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Editor Card */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
              <CardTitle className="text-lg">Article Content</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <TextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  label=""
                />
            </CardContent>
          </Card>

        </div>

        {/* ================= RIGHT SECTION (SIDEBAR) ================= */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-6">
          
          {/* Thumbnail Upload */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
              <CardTitle className="text-lg">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 overflow-hidden transition-all">
                {previewUrl ? (
                  <div className="relative w-full h-full group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="icon" className="rounded-full w-10 h-10" onClick={removeImage}>
                        <X className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-4 text-center group-hover:text-primary transition-colors">
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <p className="text-sm font-medium">Upload Thumbnail</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO & Meta */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
              <CardTitle className="text-lg">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input name="slug" value={formData.slug} onChange={handleInputChange} className="bg-gray-50 dark:bg-zinc-900 font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className="bg-gray-50 dark:bg-zinc-900" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} rows={3} className="bg-gray-50 dark:bg-zinc-900 resize-none" />
              </div>
            </CardContent>
          </Card>

          {/* Tags & Keywords */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
              <CardTitle className="text-lg">Taxonomy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleTagAdd(e)}
                    placeholder="Add a tag..." 
                    className="bg-gray-50 dark:bg-zinc-900" 
                  />
                  <Button type="button" onClick={handleTagAdd} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="bg-primary/10 text-primary dark:bg-primary/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => handleTagDelete(index)} className="hover:text-red-500 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input 
                    value={keywordInput} 
                    onChange={(e) => setKeywordInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleKeywordAdd(e)}
                    placeholder="Add a keyword..." 
                    className="bg-gray-50 dark:bg-zinc-900" 
                  />
                  <Button type="button" onClick={handleKeywordAdd} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.keywords.map((keyword, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        {keyword}
                        <button type="button" onClick={() => handleKeywordDelete(index)} className="hover:text-red-500 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
        <Button 
          type="button" 
          variant="outline" 
          className="h-12 px-8 rounded-xl"
          onClick={() => navigate("/news")}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          className="h-12 px-10 bg-primary hover:bg-[#16965f] text-white rounded-xl font-medium"
          onClick={handleCreateBlog}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>
          ) : (
            "Publish Post"
          )}
        </Button>
      </div>

    </div>
  );
};

export default AddBlog;
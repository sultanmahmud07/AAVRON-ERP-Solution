import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Eye, EyeOff, User, Mail, Lock } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { IApiError } from "@/types";

// Note: Ensure you have added this mutation to your userApi slice!
// e.g., addAdmin: builder.mutation({ query: (data) => ({ url: '/user/create-admin', method: 'POST', body: data }) })
import { useAddAdminMutation } from "@/redux/features/user/user.api";

// 1. Zod Schema
const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // We don't need the user to type the role, we will just hardcode it in the payload
});

type AdminFormValues = z.infer<typeof adminSchema>;

const AddAdmin = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const navigate = useNavigate();
  const [addAdmin, { isLoading: isSubmitting }] = useAddAdminMutation();
  const [showPassword, setShowPassword] = useState(false);

  // 2. Initialize Form
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 3. Form Submission
  const onSubmit = async (data: AdminFormValues) => {
    // Construct the payload exactly as your backend expects
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: "ADMIN", // Hardcoded per your requirement
    };

    try {
      const res = await addAdmin(payload).unwrap();
      if (res.success) {
        toast.success("Admin user created successfully!");
        navigate("/admin"); // Adjust route to your actual admin list page
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to create admin");
      if (error?.data?.errorSources) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?.data?.errorSources.forEach((er: any) => toast.error(er.message));
      }
    }
  };

  return (
    <div className={cn("max-w-5xl mx-auto p-4 md:p-8", className)}>
      
      {/* Header */}
      <div className="space-y-2 border-b border-gray-100 dark:border-zinc-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-[#1BAE70]" />
          Add New Admin
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Create a new administrator account with full system access.
        </p>
      </div>

      <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
        <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
          <CardTitle className="text-lg">Admin Credentials</CardTitle>
          <CardDescription>All fields are required to register a new admin.</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" /> Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl" 
                          placeholder="e.g. Mr Admin" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" /> Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl" 
                          placeholder="dev.mrshimul@gmail.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" /> Secure Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl pr-12" 
                          placeholder="A@12345678" 
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Readonly Role Indicator */}
              <div className="max-w-md space-y-2 pt-2">
                <Label className="text-gray-700 dark:text-gray-300 font-medium">Assigned Role</Label>
                <div className="flex items-center h-12 px-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl cursor-not-allowed">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">ADMIN</span>
                  <span className="ml-auto text-xs text-emerald-600/70 dark:text-emerald-500/70">(Locked via system)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 px-8 rounded-xl"
                  onClick={() => navigate("/admin")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-12 px-10 bg-[#1BAE70] hover:bg-[#16965f] text-white rounded-xl font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAdmin;
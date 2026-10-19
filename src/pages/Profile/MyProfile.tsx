import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formatDate } from "@/utils/getDateFormater";
import { useChangePasswordMutation, useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { IApiError } from "@/types";
import { Camera, Shield, Mail, User, CalendarDays, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateProfileMutation } from "@/redux/features/user/user.api";
import ProfileSkeleton from "@/components/modules/loader/ProfileSkeleton";

// ---- Zod schema for password change ----
const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 chars"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const MyProfile = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { data: userInfo, isLoading } = useUserInfoQuery(undefined);
  const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();
  
  // Assume you have an endpoint to update the profile picture
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // Profile Picture State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Set initial profile picture if it exists in DB
  useEffect(() => {
    if (userInfo?.data?.picture) {
      setPreviewUrl(userInfo.data.picture);
    }
  }, [userInfo]);

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    const toastId = toast.loading("Updating password...");
    const newData = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    };
    try {
      const res = await changePassword(newData).unwrap();
      if (res.success) {
        toast.dismiss(toastId);
        toast.success("Password changed successfully");
        form.reset();
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to update password", { id: toastId });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const toastId = toast.loading("Uploading profile picture...");
    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      // Uncomment and use your actual RTK Query mutation here:
      const res = await updateProfile(formData).unwrap();
      if (res.success) { 
        toast.dismiss(toastId);
        toast.success("Profile picture updated successfully!");
        setSelectedImage(null); 
      }

      
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image", { id: toastId });
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const user = userInfo?.data;

  return (
    <div className={cn(" p-4 md:p-6", className)}>
      
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile information and security preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ================= LEFT COLUMN: PROFILE IDENTITY ================= */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden text-center bg-white dark:bg-zinc-950">
            <CardContent className="pt-8 pb-8 flex flex-col items-center">
              
              {/* Profile Picture Upload System */}
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 dark:border-zinc-900 shadow-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center relative">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-300" />
                  )}
                  
                  {/* Hover Edit Overlay */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center text-white"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Change</span>
                  </div>
                </div>
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Upload Action Button (Only visible if a new image is selected) */}
              {selectedImage && (
                <Button 
                  onClick={handleImageUpload} 
                  disabled={isUpdatingProfile}
                  className="mb-6 bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-9 transition-all animate-in fade-in zoom-in"
                >
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                  Save New Photo
                </Button>
              )}

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{user?.email}</p>

              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role}
                </span>
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                  user?.isActive === "ACTIVE" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {user?.isActive}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* System Metadata Card */}
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-zinc-800">
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">Verification</span>
                </div>
                {user?.isVerified ? (
                  <span className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4 mr-1"/> Verified</span>
                ) : (
                  <span className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400"><XCircle className="w-4 h-4 mr-1"/> Pending</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  <span className="text-sm">Joined</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  <span className="text-sm">Last Updated</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(user?.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= RIGHT COLUMN: SECURITY SETTINGS ================= */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 pb-6">
              <CardTitle className="text-xl">Security Preferences</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                  
                  <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Current Password</FormLabel>
                        <FormControl>
                          <Input className="bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl" type="password" placeholder="Enter current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">New Password</FormLabel>
                        <FormControl>
                          <Input className="bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl" type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input className="bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl" type="password" placeholder="Confirm new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white"
                      disabled={isChanging}
                    >
                      {isChanging ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                      {isChanging ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default MyProfile;
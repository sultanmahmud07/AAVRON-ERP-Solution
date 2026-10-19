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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formatDate } from "@/utils/getDateFormater";
import { useResetPasswordMutation, useUserInfoQuery } from "@/redux/features/auth/auth.api";
import Loader from "../Spinner";
import { IApiError } from "@/types";

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

const MyProfile = () => {
  const { data: userInfo, isLoading } = useUserInfoQuery(undefined);
  const [resetPassword] = useResetPasswordMutation();
  
 
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    const toastId = toast.loading("Removing...");
    const newData = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    }
    try {
      const res = await resetPassword(newData).unwrap();
      if (res.success) {
        toast.dismiss(toastId);
        toast.success("Password changed successfully");
        form.reset();
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(`${error.data.message}`);
      toast.dismiss(toastId)
    }
  };
 if (isLoading) {
    return (<Loader></Loader>)
  }
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 p-4">
      <Card className="shadow-md h-full mb-5">
        <CardHeader>
          <CardTitle className="text-xl font-bold">My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Name:</strong> {userInfo?.data?.name}
            </p>
            <p>
              <strong>Email:</strong> {userInfo?.data?.email}
            </p>
            <p>
              <strong>Role:</strong> {userInfo?.data?.role}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`${userInfo?.data?.isActive === "ACTIVE"
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {userInfo?.data?.isActive}
              </span>
            </p>
            <p>
              <strong>Verified:</strong>{" "}
              {userInfo?.data?.isVerified ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {formatDate(userInfo?.data?.createdAt)}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {formatDate(userInfo?.data?.updatedAt)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-md h-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Old Password */}
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter old password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" className="w-full md:w-auto">
                  Save Password
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfile;

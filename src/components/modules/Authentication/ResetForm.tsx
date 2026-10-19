import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
      Form,
      FormControl,
      FormField,
      FormItem,
      FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/redux/features/auth/auth.api";
import { IApiError } from "@/types";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router";
// Updated icons for setting a new password
import { Lock, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";

export function ResetForm({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      className,
      ...props
}: React.HTMLAttributes<HTMLDivElement>) {
      const form = useForm({});
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();

      // Usually, the email link contains a token like: /reset-password?token=abc123xyz
      const token = searchParams.get("token");
      const id = searchParams.get("id");

      const [showPassword, setShowPassword] = useState(false);
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);

      const [reset, { isLoading }] = useResetPasswordMutation();

      const onSubmit: SubmitHandler<FieldValues> = async (data) => {
            // Basic validation to ensure passwords match
            if (data.password !== data.confirmPassword) {
                  toast.error("Passwords do not match");
                  return;
            }

            try {
                  // Pass the new password and the token to your API
                  const res = await reset({
                        password: data.password,
                        id: id,
                        token: token
                  }).unwrap();

                  if (res.success) {
                        toast.success("Password reset successfully");
                        form.reset();
                        navigate("/login"); // Send them to login so they can use the new password
                  }
            } catch (err) {
                  const error = err as IApiError;
                  console.log(err);
                  toast.error(error?.data?.message || "Failed to reset password");
            }
      };

      return (
            <div
                  className="flex flex-col items-center w-full bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[32px] p-8 md:p-10"
                  {...props}
            >
                  {/* Top Icon */}
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                        <KeyRound className="w-6 h-6 text-gray-800" />
                  </div>

                  {/* Header Text */}
                  <div className="flex flex-col gap-2 text-center mb-8 w-full">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                              Set new password
                        </h1>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                              Your new password must be different from previously used passwords.
                        </p>
                  </div>

                  <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">

                              {/* New Password Field */}
                              <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                          <FormItem>
                                                <FormControl>
                                                      <div className="relative flex items-center">
                                                            <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
                                                            <Input
                                                                  type={showPassword ? "text" : "password"}
                                                                  placeholder="New password"
                                                                  required
                                                                  className="pl-12 pr-12 text-black h-14 bg-[#F4F4F5] hover:bg-[#E4E4E7] border-transparent focus:bg-white focus:border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-200 rounded-xl transition-colors text-base"
                                                                  {...field}
                                                                  value={field.value || ""}
                                                            />
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setShowPassword(!showPassword)}
                                                                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                                            >
                                                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                            </button>
                                                      </div>
                                                </FormControl>
                                                <FormMessage />
                                          </FormItem>
                                    )}
                              />

                              {/* Confirm Password Field */}
                              <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                          <FormItem>
                                                <FormControl>
                                                      <div className="relative flex items-center">
                                                            <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
                                                            <Input
                                                                  type={showConfirmPassword ? "text" : "password"}
                                                                  placeholder="Confirm new password"
                                                                  required
                                                                  className="pl-12 pr-12 text-black h-14 bg-[#F4F4F5] hover:bg-[#E4E4E7] border-transparent focus:bg-white focus:border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-200 rounded-xl transition-colors text-base"
                                                                  {...field}
                                                                  value={field.value || ""}
                                                            />
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                                            >
                                                                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                            </button>
                                                      </div>
                                                </FormControl>
                                                <FormMessage />
                                          </FormItem>
                                    )}
                              />

                              {/* Submit Button */}
                              <Button
                                    type="submit"
                                    className="w-full h-14 mt-4 bg-[#1C1C1E] hover:bg-black text-white font-medium text-base rounded-xl transition-all duration-300"
                                    disabled={isLoading}
                              >
                                    {isLoading ? "Resetting..." : "Reset Password"}
                              </Button>
                        </form>
                  </Form>

                  {/* Back to Login Link */}
                  <div className="mt-8 text-center text-sm">
                        <Link
                              to="/login"
                              className="flex items-center justify-center gap-2 font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                              <ArrowLeft className="w-4 h-4" />
                              Back to log in
                        </Link>
                  </div>
            </div>
      );
}
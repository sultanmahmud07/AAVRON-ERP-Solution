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
import { Lock, Eye, EyeOff, ArrowLeft, RotateCw } from "lucide-react";
import DreamsLogo from "@/components/common/DreamsLogo";

export function ResetForm({
      className,
      ...props
}: React.HTMLAttributes<HTMLDivElement>) {
      const form = useForm({
            defaultValues: {
                  password: "",
                  confirmPassword: "",
            },
      });
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();

      const token = searchParams.get("token");
      const id = searchParams.get("id");

      const [showPassword, setShowPassword] = useState(false);
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);

      const [reset, { isLoading }] = useResetPasswordMutation();

      const onSubmit: SubmitHandler<FieldValues> = async (data) => {
            if (data.password !== data.confirmPassword) {
                  toast.error("Passwords do not match");
                  return;
            }

            try {
                  const res = await reset({
                        password: data.password,
                        id: id,
                        token: token,
                  }).unwrap();

                  if (res.success) {
                        toast.success("Password reset successfully");
                        form.reset();
                        navigate("/login");
                  }
            } catch (err) {
                  const error = err as IApiError;
                  console.warn("Reset password error:", err);
                  toast.error(error?.data?.message || "Failed to reset password");
            }
      };

      return (
            <div
                  className={`w-full bg-white dark:bg-[#181b24] shadow-2xl shadow-emerald-950/20 rounded-2xl p-7 sm:p-10 border border-slate-100/50 dark:border-slate-800 transition-all ${className || ""}`}
                  {...props}
            >
                  {/* Brand Logo & Header */}
                  <div className="flex flex-col items-center text-center">
                        <DreamsLogo
                              title="NEXORA"
                              subtitle="ERP"
                              size="lg"
                              showText={true}
                              className="justify-center scale-105"
                        />

                        <h1 className="text-[25px] sm:text-[27px] font-bold text-slate-800 dark:text-white mt-4 tracking-tight">
                              Set New Password
                        </h1>
                        <p className="text-[13px] sm:text-[13.5px] text-slate-500 dark:text-slate-400 mt-1 mb-7 font-normal text-center max-w-[340px]">
                              Your new password must be secure and different from previously used passwords.
                        </p>
                  </div>

                  <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                              {/* New Password Field */}
                              <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                          <FormItem className="space-y-1.5">
                                                <label className="block text-left text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                                                      New Password
                                                </label>
                                                <FormControl>
                                                      <div className="relative flex items-center">
                                                            <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            <Input
                                                                  type={showPassword ? "text" : "password"}
                                                                  placeholder="••••••••••••"
                                                                  required
                                                                  className="pl-10 pr-10 h-11 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus-visible:ring-2 focus-visible:ring-teal-600/25 focus-visible:border-teal-600 transition-all tracking-wider"
                                                                  {...field}
                                                                  value={field.value || ""}
                                                            />
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setShowPassword(!showPassword)}
                                                                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                                                  title={showPassword ? "Hide password" : "Show password"}
                                                            >
                                                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                          <FormItem className="space-y-1.5">
                                                <label className="block text-left text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                                                      Confirm New Password
                                                </label>
                                                <FormControl>
                                                      <div className="relative flex items-center">
                                                            <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                                            <Input
                                                                  type={showConfirmPassword ? "text" : "password"}
                                                                  placeholder="••••••••••••"
                                                                  required
                                                                  className="pl-10 pr-10 h-11 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus-visible:ring-2 focus-visible:ring-teal-600/25 focus-visible:border-teal-600 transition-all tracking-wider"
                                                                  {...field}
                                                                  value={field.value || ""}
                                                            />
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                                                  title={showConfirmPassword ? "Hide password" : "Show password"}
                                                            >
                                                                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                    className="w-full h-11 mt-6 bg-[#202938] hover:bg-[#141b25] text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white dark:shadow-lg dark:shadow-teal-950/40 active:scale-[0.99] font-bold text-[14px] rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                    disabled={isLoading}
                              >
                                    {isLoading ? (
                                          <span className="inline-flex items-center gap-2">
                                                <RotateCw className="w-4 h-4 animate-spin" />
                                                Resetting...
                                          </span>
                                    ) : (
                                          "Reset Password"
                                    )}
                              </Button>
                        </form>
                  </Form>

                  {/* Back to Login Link */}
                  <div className="mt-7 text-center">
                        <Link
                              to="/login"
                              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#2D7A68] dark:text-teal-400 hover:text-teal-700 hover:underline transition-colors cursor-pointer"
                        >
                              <ArrowLeft className="w-4 h-4" />
                              Back to Sign In
                        </Link>
                  </div>
            </div>
      );
}
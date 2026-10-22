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
import { useLoginMutation } from "@/redux/features/auth/auth.api";
import { IApiError } from "@/types";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, RotateCw } from "lucide-react";
import DreamsLogo from "@/components/common/DreamsLogo";

export function LoginForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      const res = await login(data).unwrap();
      if (res?.success || res?.data) {
        toast.success("Logged in successfully");
        navigate("/");
      }
    } catch (err) {
      const error = err as IApiError;
      console.warn("Login API error:", err);
      const errorMsg = error?.data?.message || "Invalid credentials or backend unreachable";
      toast.error(errorMsg);
    }
  };

  return (
    <div
      className={`w-full bg-white dark:bg-[#181b24] shadow-2xl shadow-emerald-950/20 rounded p-7 sm:p-10 border border-slate-100/50 dark:border-slate-800 transition-all ${className || ""}`}
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
          Welcome Back!
        </h1>
        <p className="text-[13px] sm:text-[13.5px] text-slate-500 dark:text-slate-400 mt-1 mb-7 font-normal">
          Sign in to your NEXORA ERP account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          {/* Email Address Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <label className="block text-left text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                  Email Address
                </label>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 px-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus-visible:ring-2 focus-visible:ring-teal-600/25 focus-visible:border-teal-600 transition-all"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[13px] font-semibold text-[#2D7A68] dark:text-teal-400 hover:text-teal-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="pl-10 pr-10 h-11 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus-visible:ring-2 focus-visible:ring-teal-600/25 focus-visible:border-teal-600 transition-all tracking-wider"
                      {...field}
                      value={field.value || ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sign In Button: dark mode themed with rich teal/emerald accent */}
          <Button
            type="submit"
            className="w-full h-11 mt-6 bg-[#202938] hover:bg-[#141b25] text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white dark:shadow-lg dark:shadow-teal-950/40 active:scale-[0.99] font-bold text-[14px] rounded transition-all shadow-sm cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin" />
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
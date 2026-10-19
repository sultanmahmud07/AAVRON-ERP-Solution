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
// Updated Lucide icons for the new design
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react"; 

export function LoginForm({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate();
  const form = useForm({});
  
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      const res = await login(data).unwrap();
      if (res.success) {
        toast.success("Logged in successfully");
       navigate("/");
      }
    } catch (err) {
      const error = err as IApiError;
      console.log(err)
      toast.error(`${error.data.message}`);
    }
  };

  return (
    <div 
      className="flex flex-col items-center w-full bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[22px] p-8 md:p-10" 
      {...props}
    >
      {/* Top Icon */}
      <div className="w-14 h-14 bg-gray-50 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
        <LogIn className="w-6 h-6 text-gray-800" />
      </div>

      {/* Header Text */}
      <div className="flex flex-col gap-2 text-center mb-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Sign in with email
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mx-auto">
          Make a new doc to bring your words, data, and teams together. For free
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      className="pl-12 text-black h-14 bg-[#F4F4F5] hover:bg-[#E4E4E7] border-transparent focus:bg-white focus:border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-200 rounded-xl transition-colors text-base"
                      {...field}
                      value={field.value || ""}
                    />
                  </div>
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
              <FormItem>
                <FormControl>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password"
                      className="pl-12 text-black pr-12 h-14 bg-[#F4F4F5] hover:bg-[#E4E4E7] border-transparent focus:bg-white focus:border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-200 rounded-xl transition-colors text-base"
                      {...field}
                      value={field.value || ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end w-full pt-1 pb-2">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-14 bg-[linear-gradient(135deg,#4fc3ff_0%,#0c7ac3_100%)] text-white font-medium text-base rounded-xl transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Get Started"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
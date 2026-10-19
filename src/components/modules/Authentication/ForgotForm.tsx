import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/redux/features/auth/auth.api";
import { IApiError } from "@/types";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link } from "react-router"; 
// Updated icons for password reset context
import { Mail, KeyRound, ArrowLeft } from "lucide-react"; 

export function ForgotForm({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const form = useForm({});
  const [forgot, { isLoading }] = useForgotPasswordMutation();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      const res = await forgot(data).unwrap();
      if (res.success) {
        toast.success("Password reset email sent successfully");
        form.reset(); // Clear the form after success
      }
    } catch (err) {
      const error = err as IApiError;
      console.log(err);
      toast.error(error?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div 
      className="flex flex-col items-center w-full bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl p-8 md:p-10" 
      {...props}
    >
      {/* Top Icon */}
      <div className="w-14 h-14 bg-gray-50 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
        <KeyRound className="w-6 h-6 text-gray-800" />
      </div>

      {/* Header Text */}
      <div className="flex flex-col gap-2 text-center mb-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Forgot Password?
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mx-auto">
          No worries, we'll send you reset instructions to your email.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
          
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
                      placeholder="Enter your email"
                      required
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

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-14 mt-2 bg-[#1C1C1E] hover:bg-black text-white font-medium text-base rounded-xl transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Sending link..." : "Send Reset Link"}
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
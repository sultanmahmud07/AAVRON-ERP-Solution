import { LoginForm } from "@/components/modules/Authentication/LoginForm";
import logoDark from "../assets/images/logo/logo.png";
export default function Login() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#A5D6F7] via-[#D0EBFB] to-white p-4 overflow-hidden">

      {/* Top Left Logo (Ebolt) */}
      <div className="absolute top-6 left-6 flex items-center gap-2 font-bold text-gray-900 text-xl">
        <img
          src={logoDark}
          alt="DropX Logo"
          width={200}
          height={100}
          className="w-32"
        />
      </div>

      {/* Decorative background circles (optional, to mimic the faint lines in the image) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full border border-white/20"></div>
        <div className="absolute h-[800px] w-[800px] rounded-full border border-white/20"></div>
      </div>

      {/* Centered Form Container */}
      <div className="relative z-10 w-full max-w-[420px]">
        <LoginForm />
      </div>

    </div>
  );
}
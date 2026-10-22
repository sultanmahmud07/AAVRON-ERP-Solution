import { LoginForm } from "@/components/modules/Authentication/LoginForm";

export default function Login() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#2b7462] bg-gradient-to-br from-[#246756] via-[#2b7462] to-[#1f5749] p-4 sm:p-6 overflow-hidden">
      {/* Subtle atmospheric ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-300/10 blur-3xl"></div>

      {/* Centered Card */}
      <div className="relative z-10 w-full max-w-[460px]">
        <LoginForm />
      </div>
    </div>
  );
}
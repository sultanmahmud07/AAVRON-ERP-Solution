import loginImg from "@/assets/images/register-img.jpg"; // Keeping your image import
import { RegisterForm } from "@/components/modules/Authentication/RegisterForm";

export default function Register() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-[800px] mt-20">
      {/* Left Side: Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto grid w-full max-w-[550px] gap-6">
          <RegisterForm />
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden bg-muted lg:block relative overflow-hidden">
        <img
          src={loginImg}
          alt="Register Visual"
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
}
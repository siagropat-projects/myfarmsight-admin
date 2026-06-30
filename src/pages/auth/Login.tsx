import { useEffect, useState } from "react";
import { ChevronLeft, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Images } from "../../assets";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../stores/auth";

// Define the form fields for TS
type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login, user, token, logout } = useAuth();

  useEffect(() => {
    if (token && user?.role === "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);

    try {
      await login(data);
      const state = useAuth.getState();

      if (state.user?.role !== "admin") {
        toast.error("Unauthorized", {
          description: "Admin access only",
        });
        logout();
        return;
      }

      navigate("/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 p-6">
        <div className="relative w-full h-full rounded-[40px] overflow-hidden">
          <img src={Images.loginBg} alt="Branding" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 lg:px-24 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-16 w-fit">
          <div className="bg-gray-100 p-2 rounded-full">
            <ChevronLeft size={20} />
          </div>
          <span className="font-medium">Back</span>
        </button>

        <div className="max-w-md w-full mx-auto flex flex-col justify-center flex-1 pb-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Sign in</h1>
          <p className="text-gray-500 mb-8">Enter your admin details to sign in into account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input
              label="Admin email address"
              type="email"
              placeholder="Enter admin email"
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter admin password"
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            <Button type="submit" variant="primary" className="w-full mt-4" isLoading={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
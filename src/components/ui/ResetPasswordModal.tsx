import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, X } from "lucide-react";
import Input from "./Input";
import Button from "./Button";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  userType: "farmer" | "vet"; // Useful for API routing
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  userId,
  userName,
  userType,
}: ResetPasswordModalProps) {
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setIsLoading(true);
    try {
      // Logic for your universal endpoint
      console.log(
        `Resetting ${userType} password for ID: ${userId}`,
        passwords.password,
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onClose();
      setPasswords({ password: "", confirm: "" });
    } catch (error) {
      console.error("Reset failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInvalid =
    !passwords.password ||
    passwords.password !== passwords.confirm ||
    passwords.password.length < 6;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="text-lg font-bold text-[#1D2939]">Reset Password</h3>
            <p className="text-xs text-gray-500">
              Updating credentials for{" "}
              <span className="text-brand font-semibold">
                {userName || "User"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-gray-100"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock size={18} />}
              value={passwords.password}
              onChange={(e) =>
                setPasswords({ ...passwords, password: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
            error={
              passwords.confirm && passwords.password !== passwords.confirm
                ? "Passwords do not match"
                : ""
            }
          />

          <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
            <div className="p-1 bg-blue-100 rounded-md mt-0.5">
              <Lock size={14} className="text-blue-600" />
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Ensure the password is at least 6 characters long. The user will
              be required to log in with these new credentials immediately.
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 bg-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-brand hover:bg-brand/90 text-white disabled:opacity-50"
            onClick={handleReset}
            disabled={isInvalid || isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

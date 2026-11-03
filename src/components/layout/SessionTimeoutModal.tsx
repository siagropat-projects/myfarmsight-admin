import { Clock, X } from "lucide-react";
import Button from "../ui/Button";

interface SessionTimeoutModalProps {
  secondsLeft: number;
  onContinue: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutModal({ secondsLeft, onContinue, onLogout }: SessionTimeoutModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
        className="bg-white rounded-2xl p-6 w-full max-w-[440px] shadow-2xl relative animate-in fade-in zoom-in duration-200"
      >
        <button onClick={onContinue} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <X size={20} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 border bg-green-50 border-green-100 text-brand">
            <Clock size={24} />
          </div>
          <h3 id="session-timeout-title" className="text-lg font-bold text-[#101828] mb-2">Session Time Out</h3>
          <p className="text-[#667085] text-sm leading-relaxed mb-8">
            Due to inactivity, your session will time out in{" "}
            <span className="font-bold text-[#101828] tabular-nums">{secondsLeft}</span>{" "}
            {secondsLeft === 1 ? "second" : "seconds"}.
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={onLogout} className="flex-1 whitespace-nowrap">
              Logout
            </Button>
            <Button variant="primary" onClick={onContinue} className="flex-1 whitespace-nowrap" autoFocus>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

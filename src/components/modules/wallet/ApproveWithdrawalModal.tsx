import { useEffect, useState } from "react";
import { Loader2, Mail, ShieldCheck, X } from "lucide-react";
import Button from "../../ui/Button";
import { useWalletStore, type PendingWithdrawal } from "../../../stores/wallet";
import { getWithdrawalDetails } from "./withdrawalDetails";

const RESEND_COOLDOWN = 60;

interface ApproveWithdrawalModalProps {
  withdrawal: PendingWithdrawal;
  onClose: () => void;
}

export default function ApproveWithdrawalModal({ withdrawal, onClose }: ApproveWithdrawalModalProps) {
  const { requestApprovalCode, approveWithdrawal, actioningId, banks } = useWalletStore();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const details = getWithdrawalDetails(withdrawal, banks);
  const isBusy = actioningId === withdrawal.id;

  const handleSendCode = async () => {
    try {
      await requestApprovalCode(withdrawal.id);
      setCodeSent(true);
      setCooldown(RESEND_COOLDOWN);
    } catch {
      // Error handled by store
    }
  };

  const handleApprove = async () => {
    try {
      await approveWithdrawal(withdrawal.id, code);
    } catch {
      // Error toast shown by store
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isBusy && onClose()} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Approve Withdrawal</h2>
            <p className="text-xs text-gray-500 mt-0.5">Confirm with the code sent to your email.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200"
            disabled={isBusy}
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-gray-900">{details.requester}</p>
                <p className="text-[10px] text-gray-400 capitalize">{details.role || "N/A"}</p>
                {details.reference && <p className="text-[10px] text-gray-400 font-mono mt-0.5">{details.reference}</p>}
              </div>
              <p className="text-lg font-black text-gray-900">₦{details.amount.toLocaleString()}</p>
            </div>
            {(details.accountName || details.accountNumber || details.bankName) && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Paying to</p>
                {details.accountName && <p className="text-sm font-bold text-gray-900">{details.accountName}</p>}
                <p className="text-xs text-gray-500">
                  {[details.accountNumber, details.bankName].filter(Boolean).join(" • ")}
                </p>
              </div>
            )}
          </div>

          {!codeSent ? (
            <Button
              variant="primary"
              className="w-full rounded-xl py-4 flex items-center justify-center gap-2"
              onClick={handleSendCode}
              disabled={isBusy}
            >
              {isBusy ? <Loader2 size={20} className="animate-spin" /> : <><Mail size={18} /> Send Approval Code</>}
            </Button>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Approval Code</label>
                  <button
                    className="text-xs font-bold text-brand hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    onClick={handleSendCode}
                    disabled={cooldown > 0 || isBusy}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand outline-none text-xl font-bold tracking-[0.5em] text-center"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && code.length === 6 && !isBusy && handleApprove()}
                />
                <p className="text-[11px] text-gray-400">
                  The code is valid for 10 minutes and can be used once. After 5 wrong attempts it stops working and you'll need a new one.
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full rounded-xl py-4 flex items-center justify-center gap-2"
                onClick={handleApprove}
                disabled={code.length !== 6 || isBusy}
              >
                {isBusy ? <Loader2 size={20} className="animate-spin" /> : <><ShieldCheck size={18} /> Approve Withdrawal</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

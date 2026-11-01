import { useState } from "react";
import { X } from "lucide-react";
import Button from "../../ui/Button";
import { useWalletStore, type PendingWithdrawal } from "../../../stores/wallet";
import { getWithdrawalDetails } from "./withdrawalDetails";

interface RejectWithdrawalModalProps {
  withdrawal: PendingWithdrawal;
  onClose: () => void;
}

export default function RejectWithdrawalModal({ withdrawal, onClose }: RejectWithdrawalModalProps) {
  const { rejectWithdrawal, actioningId, banks } = useWalletStore();
  const [reason, setReason] = useState("");

  const details = getWithdrawalDetails(withdrawal, banks);
  const isBusy = actioningId === withdrawal.id;

  const handleReject = async () => {
    try {
      await rejectWithdrawal(withdrawal.id, reason.trim() || undefined);
      onClose();
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isBusy && onClose()} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reject Withdrawal</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ₦{details.amount.toLocaleString()} requested by {details.requester}
            </p>
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
          <p className="text-sm text-gray-500">
            The withdrawal will be marked as failed and the money refunded to the requester's wallet.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Reason <span className="normal-case tracking-normal font-medium text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Account details don't match the user's records"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand outline-none text-sm resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 whitespace-nowrap" onClick={onClose} disabled={isBusy}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1 whitespace-nowrap" onClick={handleReject} isLoading={isBusy}>
              Reject Withdrawal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

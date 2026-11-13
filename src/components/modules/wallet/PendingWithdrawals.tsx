import { useState } from "react";
import { Check, Clock, Loader2, RefreshCcw, X } from "lucide-react";
import { useWalletStore, type PendingWithdrawal } from "../../../stores/wallet";
import { getWithdrawalDetails } from "./withdrawalDetails";
import ApproveWithdrawalModal from "./ApproveWithdrawalModal";
import RejectWithdrawalModal from "./RejectWithdrawalModal";

export default function PendingWithdrawals() {
  const { pendingWithdrawals, isLoadingPending, actioningId, fetchPendingWithdrawals, banks } = useWalletStore();
  const [approving, setApproving] = useState<PendingWithdrawal | null>(null);
  const [rejecting, setRejecting] = useState<PendingWithdrawal | null>(null);

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
        <p className="text-xs text-gray-400">Farmer, vet and admin withdrawals waiting for approval.</p>
        <button
          onClick={fetchPendingWithdrawals}
          disabled={isLoadingPending}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 disabled:cursor-not-allowed"
          title="Refresh"
        >
          <RefreshCcw size={18} className={isLoadingPending ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">Requested By</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Bank Account</th>
              <th className="px-6 py-4">Requested</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pendingWithdrawals.map((w) => {
              const details = getWithdrawalDetails(w, banks);
              const isBusy = actioningId === w.id;
              return (
                <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      {/* new */}
                    <span className="font-bold text-gray-900">
                       {w.requested_by_name || (w.metadata?.adminWithdrawal ? "Unknown admin" : details.requester)}
                    </span>
                      <span className="text-[10px] text-gray-400 capitalize">{details.role || details.email || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">₦{details.amount.toLocaleString()}</span>
                      {details.reference && (
                        <span className="text-[10px] text-gray-400 font-mono truncate max-w-[160px]" title={details.reference}>
                          {details.reference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{details.accountName || details.accountNumber || "—"}</span>
                      <span className="text-[10px] text-gray-400">
                        {[details.accountName ? details.accountNumber : "", details.bankName].filter(Boolean).join(" • ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(details.requestedAt).toLocaleDateString()}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                        {new Date(details.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRejecting(w)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        onClick={() => setApproving(w)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pendingWithdrawals.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {isLoadingPending ? (
                    <Loader2 size={20} className="animate-spin mx-auto text-brand" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Clock size={20} className="text-gray-300" />
                      No withdrawals waiting for approval.
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {approving && (
        <ApproveWithdrawalModal key={approving.id} withdrawal={approving} onClose={() => setApproving(null)} />
      )}
      {rejecting && (
        <RejectWithdrawalModal key={rejecting.id} withdrawal={rejecting} onClose={() => setRejecting(null)} />
      )}
    </div>
  );
}

import { AlertCircle, CheckCircle2, Clock, Loader2, Undo2 } from "lucide-react";
import type { ReactNode } from "react";

const statusConfig: Record<string, { label: string; className: string; icon: ReactNode; title?: string }> = {
  successful: {
    label: "Successful",
    className: "bg-green-50 text-green-600 border-green-100",
    icon: <CheckCircle2 size={12} />,
  },
  pending: {
    label: "Pending",
    className: "bg-orange-50 text-orange-600 border-orange-100",
    icon: <Loader2 size={12} className="animate-spin" />,
  },
  awaiting_approval: {
    label: "Awaiting approval",
    className: "bg-blue-50 text-blue-600 border-blue-100",
    icon: <Clock size={12} />,
    title: "Waiting for an admin to approve this withdrawal.",
  },
  reversed: {
    label: "Reversed",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <Undo2 size={12} />,
    title: "The bank returned the money and the balance was restored.",
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-600 border-red-100",
    icon: <AlertCircle size={12} />,
  },
};

// Failed withdrawals (including rejected ones) are refunded to the requester's wallet
const failedWithdrawal = {
  label: "Failed, refunded",
  className: "bg-red-50 text-red-600 border-red-100",
  icon: <AlertCircle size={12} />,
  title: "The withdrawal didn't go through and the money was refunded to the wallet.",
};

const rejectedWithdrawal = {
  label: "Rejected, refunded",
  className: "bg-red-50 text-red-600 border-red-100",
  icon: <AlertCircle size={12} />,
  title: "An admin rejected this withdrawal and the money was refunded to the wallet.",
};

export default function WalletStatusBadge({
  status,
  type,
  failureSource,
}: {
  status: string;
  type?: string;
  failureSource?: string | null;
}) {
  const isFailedWithdrawal = status?.toLowerCase() === "failed" && type === "withdrawal";
  const isRejected = isFailedWithdrawal && failureSource === "admin_reject";
  const config = (isRejected ? rejectedWithdrawal : isFailedWithdrawal ? failedWithdrawal : statusConfig[status?.toLowerCase()]) ?? {
    label: status?.replace(/_/g, " ") || "Unknown",
    className: "bg-gray-50 text-gray-600 border-gray-100",
    icon: null,
  };

  return (
    <span
      title={config.title}
      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit border whitespace-nowrap ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import Button from "../../ui/Button";
import type { ReconcileResult } from "../../../stores/wallet";

interface ReconcileResultModalProps {
  result: ReconcileResult;
  onClose: () => void;
}

// needsReview items aren't documented yet, so show whatever identifies them best
function describeReviewItem(item: unknown) {
  if (typeof item === "string" || typeof item === "number") return { title: String(item), detail: "" };
  const obj = (item ?? {}) as Record<string, unknown>;
  const title = String(obj.reference ?? obj.id ?? JSON.stringify(obj));
  const detail = [obj.reason, obj.status, obj.message].filter(Boolean).map(String).join(" • ");
  return { title, detail };
}

export default function ReconcileResultModal({ result, onClose }: ReconcileResultModalProps) {
  const needsReview = result.needsReview ?? [];
  const stats = [
    { label: "Checked", value: result.checked },
    { label: "Completed", value: result.completed },
    { label: "Refunded", value: result.refunded },
    { label: "Still pending", value: result.stillPending },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reconciliation Complete</h2>
            <p className="text-xs text-gray-500 mt-0.5">Stuck withdrawals were checked against the bank.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900">{stat.value ?? 0}</p>
              </div>
            ))}
          </div>

          {needsReview.length > 0 ? (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle size={18} />
                <p className="text-sm font-bold">{needsReview.length} need manual review</p>
              </div>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {needsReview.map((item, i) => {
                  const { title, detail } = describeReviewItem(item);
                  return (
                    <li key={i} className="bg-white rounded-xl px-3 py-2 border border-amber-100">
                      <p className="text-xs font-bold text-gray-900 font-mono break-all">{title}</p>
                      {detail && <p className="text-[11px] text-gray-500 mt-0.5">{detail}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              <p className="text-sm font-bold">Nothing needs manual review.</p>
            </div>
          )}

          <Button variant="primary" className="w-full rounded-xl py-3" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

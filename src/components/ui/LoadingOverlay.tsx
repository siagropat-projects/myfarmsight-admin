import { Loader2 } from "lucide-react";

export default function LoadingOverlay({
  message = "Processing...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-brand" size={40} />
        <p className="text-gray-900 font-bold text-sm uppercase tracking-widest">
          {message}
        </p>
      </div>
    </div>
  );
}

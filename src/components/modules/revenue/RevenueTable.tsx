import { useState } from "react";
import { MoreVertical, ArrowUpDown } from "lucide-react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import ConfirmationModal from "../../ui/ConfirmationModal";
import Pagination from "../../ui/Pagination";
import { useRevenueStore } from "../../../stores/revenue";
import { EmptyState } from "./EmptyState";

export default function RevenueTable() {
  const {
    transactions,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    deleteTransactions,
    loading,
    pagination,
    fetchTransactions,
  } = useRevenueStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const menuRef = useClickOutside<HTMLDivElement>(() => setActiveMenu(null));

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "completed":
        return "bg-green-50 text-green-600 border-green-100";
      case "pending":
        return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "failed":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-100" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 border-b border-gray-50 animate-pulse"
          >
            <div className="w-4 h-4 bg-gray-200 rounded mr-4" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-3 bg-gray-50 rounded w-1/6" />
            </div>
            <div className="w-24 h-8 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && transactions.length === 0) {
    return <EmptyState onClear={() => fetchTransactions()} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-visible relative">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden z-10">
          <div className="h-full bg-brand animate-progress-loop" />
        </div>
      )}
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-100 text-[#667085] font-medium">
          <tr>
            <th className="p-4 w-10">
              <input
                type="checkbox"
                checked={
                  transactions.length > 0 && selectedIds.length === transactions.length
                }
                onChange={() =>
                  selectedIds.length === transactions.length
                    ? clearSelection()
                    : selectAll()
                }
                className="accent-green-600 rounded"
              />
            </th>
            <th className="p-4">
              Transaction ID <ArrowUpDown size={14} className="inline ml-1" />
            </th>
            <th className="p-4">
              User Type <ArrowUpDown size={14} className="inline ml-1" />
            </th>
            <th className="p-4">
              Payment Type <ArrowUpDown size={14} className="inline ml-1" />
            </th>
            <th className="p-4">
              Amount <ArrowUpDown size={14} className="inline ml-1" />
            </th>
            <th className="p-4">
              Date <ArrowUpDown size={14} className="inline ml-1" />
            </th>
            <th className="p-4">
              Status <ArrowUpDown size={14} className="inline ml-1" />
            </th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((item) => (
            <tr key={item.transaction_id} className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.transaction_id)}
                  onChange={() => toggleSelection(item.transaction_id)}
                  className="accent-green-600 rounded"
                />
              </td>
              <td className="p-4 font-bold text-[#101828]">
                {item.transaction_id}
              </td>
              <td className="p-4 text-[#667085] capitalize">{item.user_type}</td>
              <td className="p-4 text-[#667085] capitalize">{item.payment_type}</td>
              <td className="p-4 font-medium text-[#101828]">
                ₦{item.amount.toLocaleString()}
              </td>
              <td className="p-4 text-[#667085]">
                {new Date(item.date).toLocaleDateString()}
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyles(item.status)}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${item.status === "success" ? "bg-green-600" : item.status === "pending" ? "bg-yellow-600" : "bg-red-600"}`}
                  />
                  {item.status}
                </span>
              </td>
              <td className="p-4 relative text-right">
                <div
                  className="flex justify-end"
                  ref={activeMenu === item.transaction_id ? menuRef : null}
                >
                  <button
                    onClick={() =>
                      setActiveMenu(activeMenu === item.transaction_id ? null : item.transaction_id)
                    }
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                  {activeMenu === item.transaction_id && (
                    <div className="absolute right-10 top-8 w-32 bg-white shadow-xl border border-gray-100 rounded-lg z-50 py-1">
                      <button
                        onClick={() => {
                          setDeleteId(item.transaction_id);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-500 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && transactions.length > 0 && (
        <Pagination
          currentRecords={transactions}
          totalRecords={pagination.total}
          currentPage={pagination.page}
          totalPages={pagination.lastPage}
          onPageChange={(p) => fetchTransactions({ page: p })}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          deleteTransactions([deleteId!]);
          setDeleteId(null);
        }}
        title="Delete Transaction?"
        description="This will permanently remove this transaction record."
      />
    </div>
  );
}

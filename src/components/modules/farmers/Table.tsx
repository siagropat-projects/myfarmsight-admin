import { useState } from "react";
import { MoreVertical, Loader2, Trash2, Eye } from "lucide-react";
import { useFarmerStore } from "../../../stores/farmers";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { EmptyState } from "./EmptyState";
import ConfirmationModal from "../../ui/ConfirmationModal";
import { useNavigate } from "react-router";
import Pagination from "../../ui/Pagination";

export default function Table() {
  const {
    farmers,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    deleteFarmers,
    pagination,
    fetchFarmers,
    loading,
  } = useFarmerStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const menuRef = useClickOutside<HTMLDivElement>(() => setActiveMenu(null));

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-20 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-brand mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading farmers list...</p>
      </div>
    );
  }

  if (farmers.length === 0) return <EmptyState />;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-visible relative">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-100 text-[#667085] font-medium">
          <tr>
            <th className="p-4 w-10">
              <input
                type="checkbox"
                checked={selectedIds.length === farmers.length}
                onChange={() =>
                  selectedIds.length === farmers.length
                    ? clearSelection()
                    : selectAll()
                }
                className="accent-brand rounded"
              />
            </th>
            <th className="p-4">Farmer Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Status</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {farmers.map((farmer) => (
            <tr
              key={farmer.id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(farmer.id)}
                  onChange={() => toggleSelection(farmer.id)}
                  className="accent-brand rounded"
                />
              </td>
              <td className="p-4 font-bold text-[#101828]">
                {farmer.fullName || "Unnamed Farmer"}
              </td>
              <td className="p-4 text-[#667085]">{farmer.email}</td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    farmer.isSuspended
                      ? "bg-red-50 text-red-500"
                      : farmer.isActive
                        ? "bg-green-50 text-brand"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      farmer.isSuspended
                        ? "bg-red-400"
                        : farmer.isActive
                          ? "bg-brand"
                          : "bg-gray-400"
                    }`}
                  />
                  {farmer.isSuspended
                    ? "Suspended"
                    : farmer.isActive
                      ? "Active"
                      : "Inactive"}
                </span>
              </td>
              <td className="p-4 relative">
                <div
                  className="flex justify-end"
                  ref={activeMenu === farmer.id ? menuRef : null}
                >
                  <button
                    onClick={() =>
                      setActiveMenu(activeMenu === farmer.id ? null : farmer.id)
                    }
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                  {activeMenu === farmer.id && (
                    <div className="absolute right-10 top-8 w-44 bg-white shadow-xl border border-gray-100 rounded-lg z-50 py-1 animate-in fade-in slide-in-from-top-1">
                      <button
                        onClick={() => navigate(`/farmers/${farmer.id}`)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Eye size={16} className="text-gray-400" /> Farmer
                        Details
                      </button>
                      <div className="h-px bg-gray-100 my-1" />
                      <button
                        onClick={() => {
                          setDeleteId(farmer.id);
                          setActiveMenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentRecords={farmers}
        totalRecords={pagination.total}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => fetchFarmers({ page: p })}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          deleteFarmers([deleteId!]);
          setDeleteId(null);
        }}
        title="Delete Farm?"
        description="This action is irreversible and will move the farm record to trash."
        confirmText="Yes, Delete"
      />
    </div>
  );
}

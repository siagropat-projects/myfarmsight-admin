import { useState } from "react";
import { useNavigate } from "react-router";
import { MoreVertical, ArrowUpDown, Eye, Trash2 } from "lucide-react";
import { useVetStore } from "../../../stores/vets";
import { useClickOutside } from "../../../hooks/useClickOutside";
import Pagination from "../../ui/Pagination";
import ConfirmationModal from "../../ui/ConfirmationModal";
import { VetEmptyState } from "./EmptyState";

function VetActions({
  vet,
  onDelete,
  onView,
}: {
  vet: any;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  return (
    <div className="relative flex justify-end" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical size={18} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in zoom-in duration-150">
          <button
            onClick={() => {
              onView(vet.id);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <Eye size={16} className="text-gray-400" /> Vet Details
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button
            onClick={() => {
              onDelete(vet.id);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function VetTable() {
  const navigate = useNavigate();
  const {
    vets,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    loading: isLoading,
    pagination,
    fetchVets,
    softDeleteVet,
  } = useVetStore();

  const [vetIdToDelete, setVetIdToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (vetIdToDelete) {
      await softDeleteVet(vetIdToDelete);
      setVetIdToDelete(null);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/vets/${id}`);
  };

  if (isLoading && vets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#2D8A39] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 animate-pulse font-medium">
          Fetching professionals...
        </p>
      </div>
    );
  }

  if (!isLoading && vets.length === 0) {
    return <VetEmptyState />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-[#667085] font-medium">
            <tr>
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  checked={
                    vets.length > 0 && selectedIds.length === vets.length
                  }
                  onChange={() =>
                    selectedIds.length === vets.length
                      ? clearSelection()
                      : selectAll()
                  }
                  className="w-4 h-4 accent-[#2D8A39] cursor-pointer rounded border-gray-300 shadow-sm focus:ring-[#2D8A39]"
                />
              </th>
              <th className="p-4 cursor-pointer hover:text-gray-900 transition-colors">
                Vet Names{" "}
                <ArrowUpDown size={14} className="inline ml-1 opacity-50" />
              </th>
              <th className="p-4 cursor-pointer hover:text-gray-900 transition-colors">
                Licence Numbers{" "}
                <ArrowUpDown size={14} className="inline ml-1 opacity-50" />
              </th>
              <th className="p-4 cursor-pointer hover:text-gray-900 transition-colors">
                Specialization{" "}
                <ArrowUpDown size={14} className="inline ml-1 opacity-50" />
              </th>
              <th className="p-4 cursor-pointer hover:text-gray-900 transition-colors">
                Date Joined{" "}
                <ArrowUpDown size={14} className="inline ml-1 opacity-50" />
              </th>
              <th className="p-4 cursor-pointer hover:text-gray-900 transition-colors">
                Email{" "}
                <ArrowUpDown size={14} className="inline ml-1 opacity-50" />
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vets.map((vet) => (
              <tr
                key={vet.id}
                className={`hover:bg-gray-50/80 transition-colors ${selectedIds.includes(vet.id) ? "bg-green-50/30" : ""}`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(vet.id)}
                    onChange={() => toggleSelection(vet.id)}
                    className="w-4 h-4 accent-[#2D8A39] cursor-pointer rounded border-gray-300 shadow-sm focus:ring-[#2D8A39]"
                  />
                </td>
                <td
                  className="p-4 font-bold text-[#101828] cursor-pointer hover:text-[#2D8A39] transition-colors"
                  onClick={() => handleViewDetails(vet.id)}
                >
                  {vet.fullName}
                </td>
                <td className="p-4 text-[#667085]">{vet.vcn || "N/A"}</td>
                <td className="p-4 text-[#667085]">
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                    {vet.profession}
                  </span>
                </td>
                <td className="p-4 text-[#667085] whitespace-nowrap">
                  {vet.createdAt}
                </td>
                <td className="p-4 text-[#667085] lowercase">{vet.email}</td>
                <td className="p-4">
                  <VetActions
                    vet={vet}
                    onDelete={(id) => setVetIdToDelete(id)}
                    onView={(id) => handleViewDetails(id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 px-4">
        <Pagination
          currentRecords={vets}
          totalRecords={pagination.total}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => fetchVets({ page: p })}
        />
      </div>

      <ConfirmationModal
        isOpen={!!vetIdToDelete}
        onClose={() => setVetIdToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Professional?"
        description="Are you sure you want to remove this veterinarian from your records? This action is permanent and cannot be reversed."
        confirmText="Yes, Delete"
        variant="danger"
      />
    </div>
  );
}

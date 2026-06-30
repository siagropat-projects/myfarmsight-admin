import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DownloadIcon, Trash2, Search, Plus } from "lucide-react";
import { useVetStore } from "../../stores/vets";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import VetTable from "../../components/modules/vets/VetTable";
import ExportModal, { type ExportParams } from "../../components/ui/ExportModal";

export default function Vets() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { selectedIds, fetchVets, bulkDeleteVets, summary, fetchSummary, exportVets } = useVetStore();

  useEffect(() => {
    fetchVets();
    fetchSummary();
  }, [fetchVets, fetchSummary]);

  const handleExport = async (params: ExportParams) => {
    await exportVets(params);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="space-y-1 border-r border-gray-100">
          <p className="text-sm text-gray-500">Total Registered Vets</p>
          <h2 className="text-3xl font-bold text-[#1D2939]">
            {summary?.total_vets?.toLocaleString() || "0"}
          </h2>
          <p className="text-xs text-gray-400">Updated: Just now</p>
        </div>
        <div className="space-y-1 border-r border-gray-100 md:pl-6">
          <p className="text-sm text-gray-500">Total Tickets Handled</p>
          <h2 className="text-3xl font-bold text-[#1D2939]">
            {summary?.total_tickets?.toLocaleString() || "0"}
          </h2>
          <p className="text-xs text-gray-400">Updated: Just now</p>
        </div>
        <div className="space-y-1 md:pl-6">
          <p className="text-sm text-gray-500">Pending Verification</p>
          <h2 className="text-3xl font-bold text-red-600">
            {summary?.unverified_vets?.toLocaleString() || "0"}
          </h2>
          <p className="text-xs text-gray-400">Updated: Just now</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-[#1D2939]">
            All Vets & Professionals
          </h1>
          <p className="text-sm text-gray-500">
            Manage and monitor all registered veterinary professionals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center bg-white border rounded-lg px-3 py-2 transition-all ${isSearchOpen ? "w-64 border-[#2D8A39]" : "w-10 border-transparent cursor-pointer"}`}
            onClick={() => !isSearchOpen && setIsSearchOpen(true)}
          >
            <Search size={18} className="text-gray-500 shrink-0" />
            {isSearchOpen && (
              <input
                autoFocus
                placeholder="Search vets..."
                className="ml-2 outline-none text-sm w-full"
                onChange={(e) => fetchVets({ search: e.target.value })}
              />
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-red-500 text-sm font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} /> Delete Selected
            </button>
          )}

          <Button variant="secondary" className="border-gray-200" onClick={() => setIsExportModalOpen(true)}>
            <DownloadIcon size={18} /> Export
          </Button>

          <Button
            variant="primary"
            className="bg-[#2D8A39] hover:bg-[#246e2d] text-white flex items-center gap-2"
            onClick={() => navigate("/vets/create")}
          >
            <Plus size={18} /> Add new Vet/Pro.
          </Button>
        </div>
      </div>

      <VetTable />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          bulkDeleteVets(selectedIds);
          setIsModalOpen(false);
        }}
        title="Delete Professionals?"
        description={`You are about to delete ${selectedIds.length} professional(s). This action is permanent and cannot be undone.`}
        confirmText="Yes, Delete All"
        variant="danger"
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}

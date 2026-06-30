import { useState } from "react";
import {
  Filter,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  // Loader2,
} from "lucide-react";
import Button from "../../ui/Button";
import ConfirmationModal from "../../ui/ConfirmationModal";
import { useVetStore } from "../../../stores/vets";
import { useParams } from "react-router";

export default function Tickets() {
  const { id: vetId } = useParams();
  const { 
    tickets, 
    ticketMeta, 
    fetchVetTickets, 
    bulkDeleteTickets, 
    loading: isLoading 
  } = useVetStore();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTicket = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? tickets.map((t) => t.id) : []);
  };

  const handleDelete = async () => {
    if (!vetId) return;
    await bulkDeleteTickets(vetId, selectedIds);
    setIsModalOpen(false);
    setSelectedIds([]);
    fetchVetTickets(vetId, { page: ticketMeta.page });
  };

  const handlePageChange = (newPage: number) => {
    if (vetId) {
      fetchVetTickets(vetId, { page: newPage });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#1D2939]">All Tickets</h3>
          <p className="text-sm text-gray-500">
            Track and manage service requests for this professional
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              className="text-red-600 border-red-100 bg-red-50 hover:bg-red-100"
            >
              <Trash2 size={16} /> Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button variant="secondary" className="text-gray-600 border-gray-200">
            <Filter size={16} /> Filters
          </Button>
          <Button variant="secondary" className="text-gray-600 border-gray-200">
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      tickets.length > 0 && selectedIds.length === tickets.length
                    }
                    className="accent-[#2D8A39] w-4 h-4 rounded"
                  />
                </th>
                <th className="p-4">Job Ticket</th>
                <th className="p-4">Issue Type</th>
                <th className="p-4">Resolution</th>
                <th className="p-4">Title</th>
                <th className="p-4">Date created</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600">
              {isLoading ? (
                // Skeleton Loading State
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="p-4">
                        <div className="h-10 bg-gray-50 rounded-lg w-full" />
                      </td>
                    </tr>
                  ))
              ) : tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onChange={() => toggleTicket(t.id)}
                        className="accent-[#2D8A39] w-4 h-4 rounded"
                      />
                    </td>
                    <td className="p-4 font-bold text-[#1D2939]">{t.id}</td>
                    <td className="p-4">{t.issue_type}</td>
                    <td className="p-4 truncate max-w-[200px]">
                      {t.resolution || "No resolution yet"}
                    </td>
                    <td className="p-4">{t.title || "Unknown"}</td>
                    <td className="p-4">
                      {new Date(t.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === "completed" || t.status === "accepted"
                            ? "bg-green-50 text-[#2D8A39]"
                            : t.status === "cancelled"
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === "completed" || t.status === "accepted"
                              ? "bg-[#2D8A39]"
                              : t.status === "cancelled"
                                ? "bg-red-600"
                                : "bg-gray-400"
                          }`}
                        />
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <Trash2 size={24} />
                      </div>
                      <p className="font-medium">No tickets found</p>
                      <p className="text-xs">
                        There are no service requests recorded for this
                        professional.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {!isLoading && tickets.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white">
            <span>
              Showing {tickets.length} of {ticketMeta.total} tickets
            </span>
            <div className="flex gap-2 items-center">
              <Button
                variant="secondary"
                className="!p-2 border-gray-200"
                disabled={ticketMeta.page === 1}
                onClick={() => handlePageChange(ticketMeta.page - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#2D8A39] bg-green-50 text-[#2D8A39] font-bold text-xs">
                {ticketMeta.page}
              </span>
              <Button 
                variant="secondary" 
                className="!p-2 border-gray-200"
                disabled={tickets.length < 10} // Assuming 10 per page
                onClick={() => handlePageChange(ticketMeta.page + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Selected Tickets?"
        description={`You are about to delete ${selectedIds.length} ticket(s). This action is irreversible.`}
        confirmText="Yes, Delete"
      />
    </div>
  );
}

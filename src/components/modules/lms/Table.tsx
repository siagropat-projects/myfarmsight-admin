import { useState } from "react";
import { useLearningStore } from "../../../stores/learning";
import {
  MoreVertical,
  Loader2,
  Trash2,
  Eye,
  CheckCircle,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useNavigate } from "react-router";
import Pagination from "../../ui/Pagination";
import ConfirmationModal from "../../ui/ConfirmationModal";
import LoadingOverlay from "../../ui/LoadingOverlay";
import { EmptyState } from "./EmptyState";

export default function Table() {
  const {
    modules,
    loading,
    pagination,
    fetchModules,
    deleteModule,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    activateModule,
    hideModule,
  } = useLearningStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const navigate = useNavigate();

  const menuRef = useClickOutside<HTMLDivElement>(() => setActiveMenu(null));

  const handleAction = async (action: () => Promise<void>) => {
    setIsActionLoading(true);
    try {
      await action();
    } finally {
      setIsActionLoading(false);
      setActiveMenu(null);
    }
  };

  if (loading && modules.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-20 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-brand mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading learning modules...</p>
      </div>
    );
  }

  if (modules.length === 0) return <EmptyState />;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-visible relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-[#667085] font-medium">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    modules.length > 0 && selectedIds.length === modules.length
                  }
                  onChange={() =>
                    selectedIds.length === modules.length
                      ? clearSelection()
                      : selectAll()
                  }
                  className="accent-brand rounded"
                />
              </th>
              <th className="p-4">Category Name</th>
              <th className="p-4">Total Lessons</th>
              <th className="p-4">Date Created</th>
              <th className="p-4">Status</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {modules.map((module) => (
              <tr
                key={module.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(module.id)}
                    onChange={() => toggleSelection(module.id)}
                    className="accent-brand rounded"
                  />
                </td>
                <td className="p-4 font-bold text-[#101828]">{module.title}</td>
                <td className="p-4 text-[#667085]">{module.totalLessons}</td>
                <td className="p-4 text-[#667085]">
                  {format(new Date(module.createdAt), "MMM. dd, yyyy")}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      module.status === "active"
                        ? "bg-green-50 text-brand"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        module.status === "active" ? "bg-brand" : "bg-red-400"
                      }`}
                    />
                    {module.status === "active" ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-4 relative">
                  <div
                    className="flex justify-end"
                    ref={activeMenu === module.id ? menuRef : null}
                  >
                    <button
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === module.id ? null : module.id,
                        )
                      }
                      className="p-1 cursor-pointer hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical size={18} className="text-gray-400" />
                    </button>
                    {activeMenu === module.id && (
                      <div className="absolute right-10 top-8 w-44 bg-white shadow-xl border border-gray-100 rounded-lg z-50 py-1 animate-in fade-in slide-in-from-top-1">
                        <button
                          onClick={() => navigate(`/lms/${module.id}`)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          <Eye size={16} className="text-gray-400" /> Module
                          Details
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        {module.status === "active" ? (
                          <button
                            onClick={() =>
                              handleAction(() => hideModule(module.id))
                            }
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <EyeOff size={16} className="text-gray-400" /> Hide
                            Module
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleAction(() => activateModule(module.id))
                            }
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-brand hover:bg-green-50 transition-colors text-left font-medium"
                          >
                            <CheckCircle size={16} /> Activate Module
                          </button>
                        )}
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={() => {
                            setDeleteId(module.id);
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
      </div>

      <Pagination
        currentRecords={modules}
        totalRecords={pagination.total}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => fetchModules({ page: p })}
      />

      {isActionLoading && (
        <LoadingOverlay message="Updating module status..." />
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          deleteModule(deleteId!);
          setDeleteId(null);
        }}
        title="Delete Learning Module?"
        description="This action is irreversible and will move the learning module to trash."
        confirmText="Yes, Delete"
      />
    </div>
  );
}

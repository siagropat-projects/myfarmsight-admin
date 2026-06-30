import { useEffect, useState } from "react";
import Table from "../../components/modules/lms/Table";
import { BookOpen, CheckCircle, EyeOff, DownloadIcon, Trash2, Plus, ArrowLeft, Search, X } from "lucide-react";
import { useLearningStore } from "../../stores/learning";
import { useNavigate } from "react-router";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import ExportModal, { type ExportParams } from "../../components/ui/ExportModal";

export default function LMS() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { 
    summary, 
    fetchSummary, 
    selectedIds, 
    fetchModules, 
    bulkDeleteModules,
    exportLearning,
  } = useLearningStore();

  useEffect(() => {
    fetchSummary();
    fetchModules();
  }, [fetchSummary, fetchModules]);

  const handleBulkDelete = async () => {
    await bulkDeleteModules(selectedIds);
    setIsModalOpen(false);
  };

  const handleExport = async (params: ExportParams) => {
    await exportLearning(params);
  };

  const stats = [
    {
      label: "Total Published Courses",
      value: summary?.total_lessons || 0,
      icon: <BookOpen className="text-blue-600" size={20} />,
      color: "text-gray-900",
    },
    {
      label: "Active Courses",
      value: summary?.active_lessons || 0,
      icon: <CheckCircle className="text-green-600" size={20} />,
      color: "text-gray-900",
    },
    {
      label: "Hidden Courses",
      value: summary?.hidden_lessons || 0,
      icon: <EyeOff className="text-red-600" size={20} />,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#1D2939]">LMS Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center bg-white border rounded-lg px-3 py-2 transition-all duration-300 ${isSearchOpen ? 'w-64 border-brand' : 'w-10 border-transparent cursor-pointer'}`} onClick={() => !isSearchOpen && setIsSearchOpen(true)}>
            <Search size={18} className="text-gray-500 shrink-0" />
            {isSearchOpen && (
              <>
                <input autoFocus placeholder="Search modules..." className="ml-2 outline-none text-sm w-full" onChange={(e) => fetchModules({ search: e.target.value })} />
                <X size={14} className="cursor-pointer text-gray-400" onClick={() => setIsSearchOpen(false)} />
              </>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-red-500 text-sm font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={18} /> Delete
            </button>
          )}

          <Button variant="secondary" className="border-gray-200" onClick={() => setIsExportModalOpen(true)}><DownloadIcon size={18} /> Export</Button>
          <Button variant="primary" className="bg-brand hover:bg-brand/90" onClick={() => navigate('/lms/create')}><Plus size={18} /> Create new module</Button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
            </div>
            <p className="text-xs text-gray-400 mt-4 font-medium">Updated: Just now</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <Table />
      </div>

      <ConfirmationModal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleBulkDelete}
        title="Delete Selected Modules?"
        description={`You are about to delete ${selectedIds.length} learning module(s). This action is irreversible and will move them to the trash.`}
        confirmText="Yes, Delete"
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
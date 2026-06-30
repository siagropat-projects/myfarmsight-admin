import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import Farmers from "../../components/modules/reports/Farmers";
import Lms from "../../components/modules/reports/Lms";
import Vets from "../../components/modules/reports/Vets";
import { useReportStore } from "../../stores/reports";
import ExportModal, { type ExportParams } from "../../components/ui/ExportModal";

type ReportTab = "farmer" | "veterinarian" | "lms";

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>("farmer");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { isLoading, exportReports } = useReportStore();

  const handleExport = async (params: ExportParams) => {
    // For reports, we need to ensure reportType is provided
    if (params.reportType) {
      await exportReports({
        reportType: params.reportType,
        startDate: params.startDate,
        endDate: params.endDate
      });
    }
  };

  const tabs = [
    { id: "farmer", label: "Farmer Report" },
    { id: "veterinarian", label: "Veterinarian Report" },
    { id: "lms", label: "LMS Reports" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor platform performance and user engagement metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600">
            <Calendar size={14} className="text-brand" />
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button 
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            disabled={isLoading}
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download size={16} className="text-brand" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 bg-white rounded-t-xl px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTab)}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${
              activeTab === tab.id
                ? "text-brand"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full animate-in slide-in-from-bottom-1 duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Dynamic Content */}
      <div className="bg-white p-6 rounded-b-xl border-x border-b border-gray-100 shadow-sm min-h-[600px]">
        {activeTab === "farmer" && <Farmers />}
        {activeTab === "veterinarian" && <Vets />}
        {activeTab === "lms" && <Lms />}
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        showReportType={true}
      />
    </div>
  );
}
import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../utils/api";

interface SummaryItem {
  label: string;
  value: number | string;
  trend?: "up" | "down" | "stable";
  percentage?: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface ReportData {
  summary: SummaryItem[];
  charts: ChartData[];
}

type Period = "quarter" | "biannual" | "annual";

interface ReportState {
  farmers: ReportData | null;
  vets: ReportData | null;
  lms: ReportData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFarmerReports: (period?: Period) => Promise<void>;
  fetchVetReports: (period?: Period) => Promise<void>;
  fetchLmsReports: (period?: Period) => Promise<void>;
  exportReports: (params: { reportType: 'farmer' | 'vet' | 'lms'; startDate: string; endDate: string }) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  farmers: null,
  vets: null,
  lms: null,
  isLoading: false,
  error: null,

  fetchFarmerReports: async (period = "annual") => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/admin/reports/farmers?period=${period}`);
      set({ farmers: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchVetReports: async (period = "annual") => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/admin/reports/vets?period=${period}`);
      set({ vets: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchLmsReports: async (period = "annual") => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/admin/reports/learning?period=${period}`);
      set({ lms: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  exportReports: async (params) => {
    try {
      const res = await api.get("/admin/reports/export", { 
        params: {
          report: params.reportType,
          startDate: params.startDate,
          endDate: params.endDate
        }
      });
      const { fileUrl, fileName } = res.data.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Reports exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  },
}));

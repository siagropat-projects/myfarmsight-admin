import { create } from "zustand";
import { api } from "../utils/api";

export interface TrendInfo {
  value: number;
  trend: "up" | "down" | "stable";
  percentage: number;
}

export interface DashboardSummary {
  totalFarmers: TrendInfo;
  activeFarmers: TrendInfo;
  totalVets: TrendInfo;
}

export interface Activity {
  id: string | number;
  action: string;
  description: string;
  created_at: string;
}

export interface Farmer {
  id: string | number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  is_active: boolean;
  is_suspended: boolean;
}

export interface ChartDataPoint {
  name: string;
  subscriptions: number;
  commissions: number;
}

export type Period = "day" | "month" | "year";

interface DashboardState {
  summary: DashboardSummary | null;
  activities: Activity[];
  topFarmers: Farmer[];
  chartData: ChartDataPoint[];
  currentPeriod: Period;
  isLoading: boolean;
  error: string | null;

  setPeriod: (period: Period) => void;
  fetchSummary: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchTopFarmers: () => Promise<void>;
  fetchChartData: (period?: Period) => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  activities: [],
  topFarmers: [],
  chartData: [],
  currentPeriod: "month",
  isLoading: false,
  error: null,

  setPeriod: (period: Period) => {
    set({ currentPeriod: period });
    get().fetchChartData(period);
  },

  fetchSummary: async () => {
    try {
      const res = await api.get("/admin/dashboard/summary");
      set({ summary: res.data.data });
    } catch (err: any) {
      const message = err.response?.data?.message || "Error fetching summary";
      set({ error: message });
      throw err;
    }
  },

  fetchActivities: async () => {
    try {
      const res = await api.get("/admin/dashboard/latest-activities");
      set({ activities: res.data.data });
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Error fetching activities";
      set({ error: message });
      throw err;
    }
  },

  fetchTopFarmers: async () => {
    try {
      const res = await api.get("/admin/dashboard/top-farmers");
      set({ topFarmers: res.data.data });
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Error fetching top farmers";
      set({ error: message });
      throw err;
    }
  },

  fetchChartData: async (period) => {
    const activePeriod = period || get().currentPeriod;
    try {
      const res = await api.get(`/admin/dashboard/chart?period=${activePeriod}`);
      set({ chartData: res.data.data });
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Error fetching chart data";
      set({ error: message });
      throw err;
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const results = await Promise.allSettled([
        get().fetchSummary(),
        get().fetchActivities(),
        get().fetchTopFarmers(),
        get().fetchChartData(),
      ]);

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        console.error("Some dashboard requests failed:", failed);
      }
    } catch (err) {
      set({ error: "Critical dashboard load failure" });
    } finally {
      set({ isLoading: false });
    }
  },
}));

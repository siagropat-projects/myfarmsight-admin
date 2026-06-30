import { create } from "zustand";
import { api } from "../utils/api";

export interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface Pagination {
  total: number;
  current_page: number;
  last_page: number;
}

interface ActivityState {
  activities: ActivityLog[];
  selectedActivity: ActivityLog | null;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;

  fetchActivities: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => Promise<void>;
  fetchActivityById: (id: string) => Promise<void>;

  getActivityTheme: (actionType: string) => { color: string; label: string };
}

export const useActivityStore = create<ActivityState>((set, _get) => ({
  activities: [],
  selectedActivity: null,
  pagination: {
    total: 0,
    current_page: 1,
    last_page: 1,
  },
  isLoading: false,
  error: null,

  fetchActivities: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { page = 1, limit = 20, search = "" } = params;
      const res = await api.get("/admin/activity/", {
        params: { page, limit, search },
      });

      const { data, ...pagination } = res.data.data;

      set({
        activities: data,
        pagination,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch activities",
        isLoading: false,
      });
    }
  },

  fetchActivityById: async (id: string) => {
    set({ isLoading: true, error: null, selectedActivity: null });
    try {
      const res = await api.get(`/admin/activity/${id}`);
      set({ selectedActivity: res.data.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Activity log not found",
        isLoading: false,
      });
    }
  },

  /**
   * Maps action_type to the brand colors and clean labels for the UI
   */
  getActivityTheme: (actionType: string) => {
    const type = actionType.toLowerCase();

    if (type.includes("create") || type.includes("register")) {
      return { color: "bg-orange-500", label: "Registration" };
    }
    if (type.includes("vet") || type.includes("ticket")) {
      return { color: "bg-blue-900", label: "Vet Service" };
    }
    if (type.includes("update") || type.includes("edit")) {
      return { color: "bg-brand", label: "Update" };
    }
    if (type.includes("suspend") || type.includes("delete")) {
      return { color: "bg-red-600", label: "Security" };
    }

    return { color: "bg-gray-500", label: "System" };
  },
}));

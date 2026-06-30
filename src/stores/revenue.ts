import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../utils/api";

export interface RevenueOverview {
  total_revenue: number;
  revenue_this_month: number;
  active_subscriptions: number;
  fetched_at: string;
}

export interface RevenueTransaction {
  transaction_id: string;
  user_type: "farmer" | "vet" | "admin" | "super_admin";
  payment_type: "subscription" | "vet commission";
  amount: number;
  date: string;
  status: "success" | "pending" | "failed";
  full_name: string;
  email: string;
}

export interface RevenueFilters {
  page?: number;
  limit?: number;
  user_type?: "farmer" | "vet" | "admin" | "super_admin";
  payment_type?: "subscription" | "vet commission";
  status?: "success" | "pending" | "failed";
  search?: string;
}

export interface RevenueState {
  overview: RevenueOverview | null;
  transactions: RevenueTransaction[];
  loading: boolean;
  selectedIds: string[];

  pagination: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };

  fetchOverview: () => Promise<void>;
  fetchTransactions: (params?: RevenueFilters) => Promise<void>;
  deleteTransactions: (ids: string[]) => Promise<void>;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  resetFilters: () => void;
  exportRevenue: (params: { startDate: string; endDate: string }) => Promise<void>;
}

export const useRevenueStore = create<RevenueState>((set, get) => ({
  overview: null,
  transactions: [],
  loading: false,
  selectedIds: [],
  pagination: {
    total: 0,
    page: 1,
    lastPage: 1,
    limit: 10,
  },

  fetchOverview: async () => {
    set({ loading: true });
    try {
      const response = await api.get("/admin/revenue/overview");
      set({ overview: response.data.data });
    } catch (error) {
      console.error("Error fetching revenue overview:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchTransactions: async (params = {}) => {
    set({ loading: true });
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined),
      );

      const response = await api.get("/admin/revenue", { params: cleanParams });
      const { data, total, current_page, last_page } = response.data.data;

      set({
        transactions: data,
        pagination: {
          total,
          page: current_page,
          lastPage: last_page,
          limit: params.limit || 10,
        },
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      set({ loading: false });
    }
  },

  deleteTransactions: async (ids) => {
    set({ loading: true });
    try {
      await api.delete("/admin/revenue", { data: { ids } });
      set({
        transactions: get().transactions.filter(
          (t) => !ids.includes(t.transaction_id),
        ),
        selectedIds: get().selectedIds.filter((id) => !ids.includes(id)),
      });
    } catch (error) {
      console.error("Error deleting transactions:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  toggleSelection: (id) => {
    const { selectedIds } = get();
    set({
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    });
  },

  selectAll: () => {
    set({ selectedIds: get().transactions.map((t) => t.transaction_id) });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  /**
   * Clears transaction list and resets to page 1
   */
  resetFilters: () => {
    set((state) => ({
      pagination: { ...state.pagination, page: 1 },
      transactions: [],
    }));
    get().fetchTransactions({ page: 1, limit: 10 });
  },

  exportRevenue: async (params) => {
    try {
      const res = await api.get("/admin/revenue/export", { params });
      const { fileUrl, fileName } = res.data.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Revenue data exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  },
}));

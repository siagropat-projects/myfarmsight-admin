import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../utils/api";

export interface Ticket {
  id: string;
  subject: string;
  status: "open" | "closed" | "pending";
  priority: "low" | "medium" | "high";
  created_at: string;
}

export interface FinanceRecord {
  id: string;
  amount: string;
  entry_type: "credit" | "debit";
  source: string;
  created_at: string;
}

interface FarmersState {
  farmers: any[];
  tickets: Ticket[];
  financeTransactions: FinanceRecord[];

  selectedFarmerProfile: any | null;
  selectedFarmhouse: any | null;

  loading: boolean;
  selectedIds: string[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  ticketMeta: { total: number; page: number };
  financeMeta: { total: number; page: number };

  fetchFarmers: (params?: any) => Promise<void>;
  createFarmer: (data: any) => Promise<void>;
  getProfile: (id: string) => Promise<void>;
  updateProfile: (id: string, data: any) => Promise<void>;
  getFarm: (id: string) => Promise<void>;
  updateFarm: (id: string, data: any) => Promise<void>;

  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteFarmers: (ids: string[]) => Promise<void>;

  fetchFarmerTickets: (id: string, params?: any) => Promise<void>;
  bulkDeleteTickets: (farmerId: string, ticketIds: string[]) => Promise<void>;
  fetchFarmerFinance: (id: string, params?: any) => Promise<void>;

  resetPassword: (id: string, data: any) => Promise<void>;
  suspendFarmer: (id: string, reason: string) => Promise<void>;
  activateFarmer: (id: string) => Promise<void>;
  softDeleteFarmer: (id: string) => Promise<void>;
  exportFarmers: (params: { startDate: string; endDate: string }) => Promise<void>;
}

export const useFarmerStore = create<FarmersState>((set, get) => ({
  farmers: [],
  tickets: [],
  financeTransactions: [],
  selectedFarmerProfile: null,
  selectedFarmhouse: null,
  loading: false,
  selectedIds: [],
  pagination: { total: 0, page: 1, totalPages: 1 },
  ticketMeta: { total: 0, page: 1 },
  financeMeta: { total: 0, page: 1 },

  fetchFarmers: async (params) => {
    set({ loading: true });
    try {
      const res = await api.get("/admin/farmers", { 
        params: { limit: 10, ...params } 
      });
      set({
        farmers: res.data.data.data,
        pagination: {
          total: res.data.data.total,
          page: res.data.data.current_page || 1,
          totalPages: res.data.data.last_page || 1,
        },
      });
    } catch (error) {
      toast.error("Failed to load farmers list");
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
    set({ selectedIds: get().farmers.map((f) => f.id) });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  deleteFarmers: async (ids) => {
    try {
      await api.post(`/admin/farmers/bulk-delete`, { ids });
      toast.success(`${ids.length} farmers moved to trash`);
      get().fetchFarmers();
      set({ selectedIds: [] });
    } catch (error) {
      toast.error("Bulk deletion failed");
    }
  },

  fetchFarmerTickets: async (id, params) => {
    set({ loading: true });
    try {
      const res = await api.get(`/admin/farmers/${id}/tickets`, { 
        params: { limit: 10, ...params } 
      });
      set({
        tickets: res.data.data.data,
        ticketMeta: { total: res.data.data.total, page: params?.page || 1 },
      });
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      set({ loading: false });
    }
  },

  bulkDeleteTickets: async (farmerId, ids) => {
    try {
      await api.post(`/admin/farmers/${farmerId}/tickets/bulk-delete`, { ids });
      toast.success("Tickets deleted successfully");
      set({ tickets: get().tickets.filter((t) => !ids.includes(t.id)) });
    } catch (error) {
      toast.error("Bulk ticket deletion failed");
    }
  },

  fetchFarmerFinance: async (id, params) => {
    set({ loading: true });
    try {
      const res = await api.get(`/admin/farmers/${id}/finance`, { 
        params: { limit: 10, ...params } 
      });
      set({
        financeTransactions: res.data.data.data,
        financeMeta: { total: res.data.data.total, page: params?.page || 1 },
      });
    } catch (error) {
      toast.error("Failed to load financial records");
    } finally {
      set({ loading: false });
    }
  },

  getProfile: async (id) => {
    try {
      const res = await api.get(`/admin/farmers/${id}/profile`);
      set({ selectedFarmerProfile: res.data.data });
    } catch (error) {
      toast.error("Failed to load profile");
    }
  },

  updateProfile: async (id, data) => {
    try {
      const res = await api.patch(`/admin/farmers/${id}/profile`, data);
      set({ selectedFarmerProfile: res.data.data });
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Update failed");
    }
  },

  getFarm: async (id) => {
    try {
      const res = await api.get(`/admin/farmers/${id}/farm`);
      set({ selectedFarmhouse: res.data.data });
    } catch (error) {
      toast.error("Failed to load farm details");
    }
  },

  updateFarm: async (id, data) => {
    try {
      const res = await api.patch(`/admin/farmers/${id}/farm`, data);
      set({ selectedFarmhouse: res.data.data });
      toast.success("Farmhouse updated");
    } catch (error) {
      toast.error("Farm update failed");
    }
  },

  createFarmer: async (data) => {
    set({ loading: true });
    try {
      await api.post("/admin/farmers", data);
      toast.success("Farmer created successfully");
      get().fetchFarmers();
    } catch (error) {
      toast.error("Farmer creation failed");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (id, data) => {
    try {
      await api.post(`/admin/farmers/${id}/reset-password`, data);
      toast.success("Password reset successful");
    } catch (error) {
      toast.error("Password reset failed");
    }
  },

  suspendFarmer: async (id, reason) => {
    try {
      await api.post(`/admin/farmers/${id}/suspend`, { reason });
      toast.warning("Account suspended");
      get().getProfile(id);
    } catch (error) {
      toast.error("Suspension failed");
    }
  },

  activateFarmer: async (id) => {
    try {
      await api.post(`/admin/farmers/${id}/activate`);
      toast.success("Account activated");
      get().getProfile(id);
    } catch (error) {
      toast.error("Activation failed");
    }
  },

  softDeleteFarmer: async (id) => {
    try {
      await api.delete(`/admin/farmers/${id}`);
      toast.success("Farmer moved to trash");
      set({ farmers: get().farmers.filter((f) => f.id !== id) });
    } catch (error) {
      toast.error("Deletion failed");
    }
  },

  exportFarmers: async (params) => {
    try {
      const res = await api.get("/admin/farmers/export", { params });
      const { fileUrl, fileName } = res.data.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Farmers data exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  },
}));

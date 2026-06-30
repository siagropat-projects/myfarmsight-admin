import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../utils/api";

export interface VetSummary {
  total_vets: number;
  unverified_vets: number;
  total_tickets: number;
}

export interface Ticket {
  id: string;
  farmer_id: string;
  vet_id: string | null;
  title: string;
  description: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  price: string;
  location: string;
  livestock: string;
  issue_type: string;
  resolution: string | null;
  date_requested: string;
  created_at: string;
}

export interface FinanceRecord {
  id: string;
  amount: string;
  entry_type: "credit" | "debit";
  source: string;
  created_at: string;
}

interface VetState {
  vets: any[];
  summary: VetSummary | null;
  tickets: Ticket[];
  financeTransactions: FinanceRecord[];

  selectedVetProfile: any | null;
  selectedVetBusiness: any | null;

  loading: boolean;
  selectedIds: string[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  ticketMeta: { total: number; page: number };
  financeMeta: { total: number; page: number };

  fetchVets: (params?: any) => Promise<void>;
  fetchSummary: () => Promise<void>;
  createVet: (data: any) => Promise<void>;
  getProfile: (id: string) => Promise<void>;
  updateProfile: (id: string, data: any) => Promise<void>;
  getBusiness: (id: string) => Promise<void>;
  updateBusiness: (id: string, data: any) => Promise<void>;
  approveVet: (id: string, approved: boolean, note?: string) => Promise<void>;

  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  bulkDeleteVets: (ids: string[]) => Promise<void>;

  fetchVetTickets: (id: string, params?: any) => Promise<void>;
  bulkDeleteTickets: (vetId: string, ticketIds: string[]) => Promise<void>;
  fetchVetFinance: (id: string, params?: any) => Promise<void>;

  resetPassword: (id: string, data: any) => Promise<void>;
  suspendVet: (id: string, reason: string) => Promise<void>;
  activateVet: (id: string) => Promise<void>;
  softDeleteVet: (id: string) => Promise<void>;
  exportVets: (params: { startDate: string; endDate: string }) => Promise<void>;
}

export const useVetStore = create<VetState>((set, get) => ({
  vets: [],
  summary: null,
  tickets: [],
  financeTransactions: [],
  selectedVetProfile: null,
  selectedVetBusiness: null,
  loading: false,
  selectedIds: [],
  pagination: { total: 0, page: 1, totalPages: 1 },
  ticketMeta: { total: 0, page: 1 },
  financeMeta: { total: 0, page: 1 },

  fetchVets: async (params) => {
    set({ loading: true });
    try {
      const res = await api.get("/admin/vets", { params });
      const { data, total, current_page, last_page } = res.data.data;
      set({
        vets: data,
        pagination: { total, page: current_page, totalPages: last_page },
      });
    } catch (error) {
      toast.error("Failed to load vets");
    } finally {
      set({ loading: false });
    }
  },

  fetchSummary: async () => {
    try {
      const res = await api.get("/admin/vets/summary");
      set({ summary: res.data.data });
    } catch (error) {
      console.error("Summary fetch failed", error);
    }
  },

  createVet: async (data) => {
    set({ loading: true });
    try {
      await api.post("/admin/vets", data);
      toast.success("Vet successfully created");
      get().fetchVets();
      get().fetchSummary();
    } catch (error) {
      toast.error("Failed to create vet");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getProfile: async (id) => {
    try {
      const res = await api.get(`/admin/vets/${id}/profile`);
      set({ selectedVetProfile: res.data.data });
    } catch (error) {
      toast.error("Failed to load vet profile");
    }
  },

  updateProfile: async (id, data) => {
    try {
      const res = await api.patch(`/admin/vets/${id}/profile`, data);
      set({ selectedVetProfile: res.data.data });
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Profile update failed");
    }
  },

  getBusiness: async (id) => {
    try {
      const res = await api.get(`/admin/vets/${id}/business`);
      set({ selectedVetBusiness: res.data.data });
    } catch (error) {
      toast.error("Failed to load business details");
    }
  },

  updateBusiness: async (id, data) => {
    try {
      const res = await api.patch(`/admin/vets/${id}/business`, data);
      set({ selectedVetBusiness: res.data.data });
      toast.success("Business details updated");
    } catch (error) {
      toast.error("Business update failed");
    }
  },

  approveVet: async (id, approved, note) => {
    try {
      await api.post(`/admin/vets/${id}/approve`, { approved, note });
      toast.success(approved ? "Vet approved" : "Vet approval denied");
      get().getBusiness(id);
      get().fetchSummary();
    } catch (error) {
      toast.error("Approval action failed");
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
    set({ selectedIds: get().vets.map((v) => v.id) });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  bulkDeleteVets: async (ids) => {
    try {
      await api.post(`/admin/vets/bulk-delete`, { ids });
      toast.success(`${ids.length} vets moved to trash`);
      get().fetchVets();
      get().fetchSummary();
      set({ selectedIds: [] });
    } catch (error) {
      toast.error("Bulk deletion failed");
    }
  },

  fetchVetTickets: async (id, params) => {
    set({ loading: true });
    try {
      const res = await api.get(`/admin/vets/${id}/tickets`, { params });
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

  bulkDeleteTickets: async (vetId, ids) => {
    try {
      await api.post(`/admin/vets/${vetId}/tickets/bulk-delete`, { ids });
      toast.success("Tickets deleted successfully");
      set({ tickets: get().tickets.filter((t) => !ids.includes(t.id)) });
      get().fetchSummary();
    } catch (error) {
      toast.error("Ticket deletion failed");
    }
  },

  fetchVetFinance: async (id, params) => {
    set({ loading: true });
    try {
      const res = await api.get(`/admin/vets/${id}/finance`, { params });
      set({
        financeTransactions: res.data.data.data,
        financeMeta: { total: res.data.data.total, page: params?.page || 1 },
      });
    } catch (error) {
      toast.error("Failed to load finance records");
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (id, data) => {
    try {
      await api.post(`/admin/vets/${id}/reset-password`, data);
      toast.success("Password reset successful");
    } catch (error) {
      toast.error("Failed to reset password");
    }
  },

  suspendVet: async (id, reason) => {
    try {
      await api.post(`/admin/vets/${id}/suspend`, { reason });
      toast.warning("Vet account suspended");
      get().getProfile(id);
    } catch (error) {
      toast.error("Suspension failed");
    }
  },

  activateVet: async (id) => {
    try {
      await api.post(`/admin/vets/${id}/activate`);
      toast.success("Vet account activated");
      get().getProfile(id);
    } catch (error) {
      toast.error("Activation failed");
    }
  },

  softDeleteVet: async (id) => {
    try {
      await api.delete(`/admin/vets/${id}`);
      toast.success("Vet moved to trash");
      set({ vets: get().vets.filter((v) => v.id !== id) });
      get().fetchSummary();
    } catch (error) {
      toast.error("Deletion failed");
    }
  },

  exportVets: async (params) => {
    try {
      const res = await api.get("/admin/vets/export", { params });
      const { fileUrl, fileName } = res.data.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Vets data exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  },
}));

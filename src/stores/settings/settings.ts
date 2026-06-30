import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../../utils/api";

// --- Types ---

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  ticket: boolean;
}

export interface CommissionSettings {
  commission_value: number;
  commission_type: "percentage" | "fixed_amount";
  payout_schedule: "monthly" | "weekly";
  minimum_payout_threshold: number;
}

export type UpdateNotificationPayload = Partial<NotificationSettings>;
export type UpdateCommissionPayload = Partial<CommissionSettings>;

interface SettingsState {
  notifications: NotificationSettings | null;
  commission: CommissionSettings | null;
  loading: boolean;

  // Actions
  fetchNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (data: UpdateNotificationPayload) => Promise<void>;
  
  fetchCommissionSettings: () => Promise<void>;
  updateCommissionSettings: (data: UpdateCommissionPayload) => Promise<void>;
}

// --- Store ---

export const useSettingsStore = create<SettingsState>((set, _get) => ({
  notifications: null,
  commission: null,
  loading: false,

  fetchNotificationSettings: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/admin/settings/notifications");
      set({ notifications: res.data.data });
    } catch (error: any) {
      console.error("Fetch Notifications Error:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateNotificationSettings: async (data) => {
    set({ loading: true });
    try {
      const res = await api.patch("/admin/settings/notifications", data);
      set({ notifications: res.data.data });
      toast.success("Notification settings updated");
    } catch (error: any) {
      toast.error("Failed to update notification settings", {
        description: error.response?.data?.message || "An error occurred",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchCommissionSettings: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/admin/settings/commission");
      set({ commission: res.data.data });
    } catch (error: any) {
      console.error("Fetch Commission Error:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateCommissionSettings: async (data) => {
    set({ loading: true });
    try {
      const res = await api.patch("/admin/settings/commission", data);
      set({ commission: res.data.data });
      toast.success("Commission settings updated");
    } catch (error: any) {
      toast.error("Failed to update commission settings", {
        description: error.response?.data?.message || "An error occurred",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
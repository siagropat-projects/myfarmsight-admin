import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../../utils/api";

export type SubscriptionStatus = "active" | "inactive" | "archived";

export interface SubscriptionDiscount {
  id: string;
  subscription_plan_id: string;
  type: "fixed" | "percentage";
  value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  status: SubscriptionStatus;
  discount?: SubscriptionDiscount | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertDiscountPayload {
  subscription_plan_id: string;
  type: "fixed" | "percentage";
  value: number;
  is_active?: boolean;
}

export interface CreateSubscriptionPayload {
  name: string;
  price: number;
  features: string[];
}

export type UpdateSubscriptionPayload = Partial<CreateSubscriptionPayload>;

interface SubscriptionState {
  plans: SubscriptionPlan[];
  currentPlan: SubscriptionPlan | null;
  loading: boolean;

  fetchPlans: () => Promise<void>;
  getPlan: (id: string) => Promise<void>;
  createPlan: (data: CreateSubscriptionPayload) => Promise<string | void>;
  updatePlan: (id: string, data: UpdateSubscriptionPayload) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  activatePlan: (id: string) => Promise<void>;
  deactivatePlan: (id: string) => Promise<void>;
  
  upsertDiscount: (data: UpsertDiscountPayload) => Promise<void>;
  toggleDiscount: (id: string, is_active: boolean) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: [],
  currentPlan: null,
  loading: false,

  fetchPlans: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/admin/subscription");
      set({ plans: res.data.data });
    } catch (error: any) {
      toast.error("Failed to fetch subscription plans");
    } finally {
      set({ loading: false });
    }
  },

  getPlan: async (id: string) => {
    set({ loading: true });
    try {
      const res = await api.get(`/admin/subscription/${id}`);
      set({ currentPlan: res.data.data });
    } catch (error: any) {
      toast.error("Error loading plan details");
    } finally {
      set({ loading: false });
    }
  },

  createPlan: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post("/admin/subscription", data);
      toast.success("Subscription plan created!");
      await get().fetchPlans();
      return res.data.data.id;
    } catch (error: any) {
      toast.error("Creation failed", {
        description: error.response?.data?.message || "Check your inputs",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePlan: async (id, data) => {
    set({ loading: true });
    try {
      await api.patch(`/admin/subscription/${id}`, data);
      toast.success("Plan updated successfully");
      await get().fetchPlans();
    } catch (error: any) {
      toast.error("Update failed", {
        description: error.response?.data?.message,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deletePlan: async (id) => {
    try {
      await api.delete(`/admin/subscription/${id}`);
      toast.success("Plan deleted");
      set({ plans: get().plans.filter((p) => p.id !== id) });
    } catch (error: any) {
      toast.error("Delete failed");
    }
  },

  activatePlan: async (id) => {
    try {
      await api.patch(`/admin/subscription/${id}/activate`);
      toast.success("Plan is now active");
      await get().fetchPlans();
    } catch (error: any) {
      toast.error("Activation failed");
    }
  },

  deactivatePlan: async (id) => {
    try {
      await api.patch(`/admin/subscription/${id}/deactivate`);
      toast.info("Plan deactivated");
      await get().fetchPlans();
    } catch (error: any) {
      toast.error("Deactivation failed");
    }
  },

  upsertDiscount: async (data) => {
    set({ loading: true });
    try {
      await api.post("/admin/subscription/discounts", data);
      toast.success("Discount updated");
      await get().fetchPlans();
      if (get().currentPlan?.id === data.subscription_plan_id) {
        await get().getPlan(data.subscription_plan_id);
      }
    } catch (error: any) {
      toast.error("Failed to update discount");
    } finally {
      set({ loading: false });
    }
  },

  toggleDiscount: async (id, is_active) => {
    set({ loading: true });
    try {
      await api.patch(`/admin/subscription/discounts/${id}/toggle`, { is_active });
      toast.success(`Discount ${is_active ? 'enabled' : 'disabled'}`);
      await get().fetchPlans();
      if (get().currentPlan?.discount?.id === id) {
        await get().getPlan(get().currentPlan!.id);
      }
    } catch (error: any) {
      toast.error("Failed to toggle discount");
    } finally {
      set({ loading: false });
    }
  },
}));

import axios from "axios";
import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../../utils/api";

export type SubscriptionStatus = "active" | "inactive" | "archived";

export const UNLIMITED = -1;

export interface SubscriptionDiscount {
  id: string;
  subscription_plan_id: string;
  type: "fixed" | "percentage";
  value: number | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_per_month: number | string;
  price_per_year: number | string;
  is_free_forever: boolean;
  max_farmhouses: number;
  max_batches_per_farmhouse: number;
  capabilities: string[];
  // The API uses both names for the same list, depending on the endpoint
  feature_descriptions?: string[];
  features?: string[];
  status: SubscriptionStatus;
  discount?: SubscriptionDiscount | null;
  created_at: string;
  updated_at: string;
}

export interface Capability {
  value: string;
  label: string;
}

export interface PlanComparison {
  id: string;
  name: string;
  price_per_year: number | string;
  is_free_forever: boolean;
  max_farmhouses: number;
  max_batches_per_farmhouse: number;
  capabilities: string[];
}

export interface UpsertDiscountPayload {
  subscription_plan_id: string;
  type: "fixed" | "percentage";
  value: number;
  is_active?: boolean;
}

export interface PlanPayload {
  name: string;
  price_per_month: number;
  price_per_year: number;
  is_free_forever: boolean;
  max_farmhouses: number;
  max_batches_per_farmhouse: number;
  capabilities: string[];
  feature_descriptions: string[];
}

export const getPlanFeatures = (plan: SubscriptionPlan) =>
  plan.feature_descriptions?.length ? plan.feature_descriptions : plan.features ?? [];

export const formatNaira = (amount: number | string | null | undefined) =>
  `₦${Number(amount || 0).toLocaleString()}`;

const errorMessage = (error: unknown): string | undefined =>
  axios.isAxiosError(error) ? error.response?.data?.message : undefined;

interface SubscriptionState {
  plans: SubscriptionPlan[];
  usage: Record<string, number>;
  capabilities: Capability[];
  capabilitiesFailed: boolean;
  comparison: PlanComparison[];
  loading: boolean;
  actioning: boolean;

  fetchPlans: () => Promise<void>;
  fetchUsage: (planIds: string[]) => Promise<void>;
  fetchCapabilities: () => Promise<void>;
  fetchComparison: () => Promise<void>;
  getPlan: (id: string) => Promise<SubscriptionPlan | null>;
  createPlan: (data: PlanPayload) => Promise<string | undefined>;
  updatePlan: (id: string, data: Partial<PlanPayload>) => Promise<void>;
  duplicatePlan: (id: string, newName: string) => Promise<string | undefined>;
  archivePlan: (id: string) => Promise<void>;
  activatePlan: (id: string) => Promise<void>;
  deactivatePlan: (id: string) => Promise<void>;

  upsertDiscount: (data: UpsertDiscountPayload) => Promise<void>;
  toggleDiscount: (planId: string, is_active: boolean) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: [],
  usage: {},
  capabilities: [],
  capabilitiesFailed: false,
  comparison: [],
  loading: false,
  actioning: false,

  fetchPlans: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/admin/subscription");
      const plans: SubscriptionPlan[] = res.data.data;
      set({ plans });
      get().fetchUsage(plans.map((p) => p.id));
    } catch {
      toast.error("Failed to fetch subscription plans");
    } finally {
      set({ loading: false });
    }
  },

  // Requested per plan: only the planId form of this endpoint has a documented response
  fetchUsage: async (planIds) => {
    const results = await Promise.allSettled(
      planIds.map((planId) => api.get("/admin/subscription/usage", { params: { planId } }))
    );
    const usage: Record<string, number> = {};
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        usage[planIds[i]] = Number(result.value.data.data?.active_users ?? 0);
      }
    });
    set({ usage });
  },

  fetchCapabilities: async () => {
    set({ capabilitiesFailed: false });
    try {
      const res = await api.get("/admin/subscription/capabilities");
      set({ capabilities: res.data.data });
    } catch {
      set({ capabilitiesFailed: true });
    }
  },

  fetchComparison: async () => {
    try {
      const res = await api.get("/admin/subscription/comparison");
      set({ comparison: res.data.data });
    } catch {
      toast.error("Failed to load plan comparison");
      throw new Error("comparison failed");
    }
  },

  getPlan: async (id) => {
    set({ loading: true });
    try {
      const res = await api.get(`/admin/subscription/${id}`);
      return res.data.data as SubscriptionPlan;
    } catch {
      toast.error("Error loading plan details");
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createPlan: async (data) => {
    try {
      const res = await api.post("/admin/subscription", data);
      toast.success("Subscription plan created!");
      await get().fetchPlans();
      return res.data.data?.id;
    } catch (error) {
      toast.error("Creation failed", { description: errorMessage(error) || "Check your inputs" });
      throw error;
    }
  },

  updatePlan: async (id, data) => {
    try {
      await api.patch(`/admin/subscription/${id}`, data);
      toast.success("Plan updated successfully");
      await get().fetchPlans();
    } catch (error) {
      toast.error("Update failed", { description: errorMessage(error) });
      throw error;
    }
  },

  // A copy comes back active, so take it off sale until the admin has reviewed it
  duplicatePlan: async (id, newName) => {
    set({ actioning: true });
    try {
      const res = await api.post(`/admin/subscription/${id}/duplicate`, { newName });
      const copyId: string | undefined = res.data.data?.id;
      if (copyId) {
        try {
          await api.patch(`/admin/subscription/${copyId}/deactivate`);
          toast.success("Plan duplicated", { description: "The copy stays inactive until you activate it." });
        } catch {
          toast.warning("Plan duplicated, but the copy is live", {
            description: "We couldn't deactivate it. Check its prices or deactivate it now.",
          });
        }
      }
      await get().fetchPlans();
      return copyId;
    } catch (error) {
      toast.error("Duplicate failed", { description: errorMessage(error) });
      throw error;
    } finally {
      set({ actioning: false });
    }
  },

  archivePlan: async (id) => {
    set({ actioning: true });
    try {
      await api.delete(`/admin/subscription/${id}`);
      toast.success("Plan archived");
      await get().fetchPlans();
    } catch (error) {
      toast.error("Archive failed", { description: errorMessage(error) });
    } finally {
      set({ actioning: false });
    }
  },

  activatePlan: async (id) => {
    set({ actioning: true });
    try {
      await api.patch(`/admin/subscription/${id}/activate`);
      toast.success("Plan is now active");
      await get().fetchPlans();
    } catch (error) {
      toast.error("Activation failed", { description: errorMessage(error) });
    } finally {
      set({ actioning: false });
    }
  },

  deactivatePlan: async (id) => {
    set({ actioning: true });
    try {
      await api.patch(`/admin/subscription/${id}/deactivate`);
      toast.info("Plan deactivated");
      await get().fetchPlans();
    } catch (error) {
      toast.error("Deactivation failed", { description: errorMessage(error) });
    } finally {
      set({ actioning: false });
    }
  },

  upsertDiscount: async (data) => {
    try {
      await api.post("/admin/subscription/discounts", data);
      toast.success("Discount updated");
      await get().fetchPlans();
    } catch (error) {
      toast.error("The discount couldn't be saved", {
        description: errorMessage(error) || "Edit the plan to try again.",
      });
      throw error;
    }
  },

  toggleDiscount: async (planId, is_active) => {
    set({ actioning: true });
    try {
      await api.patch(`/admin/subscription/discounts/${planId}/toggle`, { is_active });
      toast.success(`Discount ${is_active ? "enabled" : "disabled"}`);
      await get().fetchPlans();
    } catch (error) {
      toast.error("The discount couldn't be changed", { description: errorMessage(error) });
      throw error;
    } finally {
      set({ actioning: false });
    }
  },
}));

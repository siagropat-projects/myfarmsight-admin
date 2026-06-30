import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../../utils/api";

// --- Types ---

export type AdminRole =
  | "super_admin"
  | "operations_admin"
  | "finance_admin"
  | "content_admin";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  adminRole: AdminRole;
  createdAt?: string;
}

export interface CreateAdminPayload {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  adminRole: AdminRole;
}

export interface AssignRolePayload {
  userId: string;
  adminRole: AdminRole;
}

interface AccountsState {
  admins: AdminUser[];
  roles: string[]; // Based on your listAdminRoles endpoint
  loading: boolean;

  // Actions
  fetchAdmins: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  createAdmin: (data: CreateAdminPayload) => Promise<void>;
  assignRole: (data: AssignRolePayload) => Promise<void>;
  exportAccounts: (params: { startDate: string; endDate: string }) => Promise<void>;
}

// --- Store ---

export const useAccountsStore = create<AccountsState>((set, get) => ({
  admins: [],
  roles: [],
  loading: false,

  fetchAdmins: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/admin/accounts");
      // Assuming your backend sendResponse sends data in res.data.data
      set({ admins: res.data.data });
    } catch (error: any) {
      toast.error("Failed to fetch admins", {
        description: error.response?.data?.message || "Check your permissions",
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchRoles: async () => {
    try {
      const res = await api.get("/admin/accounts/roles");
      set({ roles: res.data.data });
    } catch (error: any) {
      console.error("Error fetching roles:", error);
    }
  },

  createAdmin: async (payload) => {
    set({ loading: true });
    try {
      await api.post("/admin/accounts", payload);
      toast.success("Admin account created successfully");
      await get().fetchAdmins(); // Refresh the list
    } catch (error: any) {
      toast.error("Account creation failed", {
        description: error.response?.data?.message || "Check input data",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  assignRole: async (payload) => {
    set({ loading: true });
    try {
      await api.post("/admin/accounts/assign-role", payload);
      toast.success("Role assigned successfully");
      await get().fetchAdmins(); // Refresh to show updated roles
    } catch (error: any) {
      toast.error("Failed to assign role", {
        description: error.response?.data?.message || "An error occurred",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  exportAccounts: async (params) => {
    try {
      const res = await api.get("/admin/accounts/export", { params });
      const { fileUrl, fileName } = res.data.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Accounts data exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  },
}));

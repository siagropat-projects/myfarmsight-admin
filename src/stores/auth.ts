import { toast } from "sonner";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "../utils/api";
import { markActivity } from "../hooks/useIdleTimeout";

export const LOGOUT_REASON_KEY = "logout-reason";

export type User = {
    id: string;
    email: string;
    name?: string;
    role?: "farmer" | "staff" | "vet" | "admin";
    profile_image?: string;
    logged_in?: string;
};

export type LoginPayload = { email: string; password: string };

type AuthState = {
    user: User | null;
    token: string | null;
    loading: boolean;

    // Actions
    setAuth: (payload: { user: User | null; token: string | null }) => void;
    clear: () => void;

    // API Actions
    login: (data: LoginPayload) => Promise<void>;
    me: () => Promise<void>;
    logout: (reason?: "inactivity") => void;
};

export const useAuth = create<AuthState>()(
    persist(
        (set, _get) => ({
            user: null,
            token: null,
            loading: false,

            setAuth: ({ user, token }) => set({ user, token }),
            clear: () => set({ user: null, token: null }),

            login: async (data) => {
                set({ loading: true });
                try {
                    const res = await api.post("/auth/login", data);
                    const { user, token } = res.data.data;
                    markActivity();
                    set({ user, token });
                    toast.success("Logged in Successfully!!!")
                } catch (error: any) {
                    toast.error("Login Failed", {
                      description: error.response?.data?.message || "An error occurred",
                    });
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },

            me: async () => {
                try {
                    const res = await api.get("/auth/me");
                    set({ user: res.data.data });
                } catch (error) {
                    console.error("Me Error:", error);
                    // If me fails (401), interceptor will handle logout
                }
            },

            logout: (reason) => {
                // Survives the redirect so the login page can explain why
                if (reason) {
                    try { sessionStorage.setItem(LOGOUT_REASON_KEY, reason); } catch { /* ignore */ }
                }
                set({ user: null, token: null });
                window.location.href = "/login"
                toast.success("Logged Out Successfully!!!")
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);

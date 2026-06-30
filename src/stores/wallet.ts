import { create } from "zustand";
import axios from "axios";
import { toast } from "sonner";
import { api } from "../utils/api";

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  reference: string;
  description: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
}

export interface WalletOverview {
  wallet?: {
    id: string;
    user_id: string;
    currency: string;
    earnings_balance: string | number;
    commission_earned: string | number;
    subscription_earned: string | number;
    withdrawable_balance: string | number;
    created_at: string;
    updated_at: string;
  };
  stats: {
    total_commissions: string | number;
    total_subscriptions: string | number;
    total_admin_withdrawable_balance: string | number;
  };
}

interface WalletState {
  overview: WalletOverview | null;
  showBalance: boolean;
  transactions: Transaction[];
  totalTransactions: number;
  currentPage: number;
  banks: Bank[];
  isLoading: boolean;
  isVerifying: boolean;
  verifiedAccountName: string | null;

  toggleBalance: () => void;
  fetchOverview: () => Promise<void>;
  fetchTransactions: (page?: number, limit?: number, type?: string, status?: string) => Promise<void>;
  fetchBanks: () => Promise<void>;
  verifyAccount: (accountNumber: string, bankCode: string) => Promise<void>;
  withdraw: (amount: number, bankCode: string, accountNumber: string) => Promise<void>;
  processPayouts: () => Promise<void>;
  resetVerification: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  overview: null,
  showBalance: false,
  transactions: [],
  totalTransactions: 0,
  currentPage: 1,
  banks: [],
  isLoading: false,
  isVerifying: false,
  verifiedAccountName: null,

  toggleBalance: () => set((state) => ({ showBalance: !state.showBalance })),

  fetchOverview: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/admin/wallet/overview");
      set({ overview: res.data.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching wallet overview:", error);
      toast.error("Failed to load wallet overview");
      set({ isLoading: false });
    }
  },

  fetchTransactions: async (page = 1, limit = 20, type, status) => {
    set({ isLoading: true });
    try {
      const params: any = { page, limit };
      if (type) params.type = type;
      if (status) params.status = status;

      const res = await api.get("/admin/wallet/transactions", { params });
      set({ 
        transactions: res.data.data.data, 
        totalTransactions: res.data.data.total,
        currentPage: page,
        isLoading: false 
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      set({ isLoading: false });
    }
  },

  fetchBanks: async () => {
    try {
      // Keep Paystack Public Banks API for frontend selection
      const res = await axios.get("https://api.paystack.co/bank");
      set({ banks: res.data.data });
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast.error("Failed to load banks");
    }
  },

  verifyAccount: async (accountNumber, bankCode) => {
    if (accountNumber.length !== 10) return;
    set({ isVerifying: true, verifiedAccountName: null });
    try {
      // Using our backend proxy for verification as it needs secret key
      const res = await api.get("/admin/wallet/verify-bank", { 
        params: { account_number: accountNumber, bank_code: bankCode } 
      });
      set({ verifiedAccountName: res.data.data.account_name, isVerifying: false });
      toast.success("Account verified");
    } catch (error) {
      set({ isVerifying: false });
      toast.error("Could not verify account details");
    }
  },

  withdraw: async (amount, bankCode, accountNumber) => {
    set({ isLoading: true });
    try {
      await api.post("/admin/wallet/withdraw", { 
        amount, 
        account_number: accountNumber, 
        bank_code: bankCode 
      });
      toast.success("Withdrawal initiated successfully");
      await get().fetchOverview();
      await get().fetchTransactions(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  processPayouts: async () => {
    set({ isLoading: true });
    try {
      await api.post("/admin/wallet/process-payouts");
      toast.success("Vet payouts processed successfully");
      await get().fetchOverview();
      await get().fetchTransactions(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process payouts");
    } finally {
      set({ isLoading: false });
    }
  },

  resetVerification: () => set({ verifiedAccountName: null, isVerifying: false }),
}));
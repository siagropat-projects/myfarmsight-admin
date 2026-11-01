import { create } from "zustand";
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

export interface PendingWithdrawal {
  id: string;
  amount: string | number;
  currency: string;
  reference: string;
  created_at: string;
  metadata: {
    accountName?: string;
    bankDetails?: {
      bank_code?: string;
      account_number?: string;
    };
    requestedBy?: string;
  } | null;
  requester_name?: string;
  requester_email?: string;
  requester_role?: string;
}

export const TRANSACTION_TYPES = [
  "deposit",
  "withdrawal",
  "transfer",
  "escrow_hold",
  "escrow_release",
  "commission_deduction",
  "commission_credit",
  "subscription_credit",
  "refund",
] as const;

export const TRANSACTION_STATUSES = ["pending", "successful", "failed", "reversed", "awaiting_approval"] as const;

export const TRANSACTIONS_PER_PAGE = 20;

export interface TransactionFilters {
  type?: string;
  status?: string;
}

export interface ReconcileResult {
  checked: number;
  completed: number;
  refunded: number;
  stillPending: number;
  needsReview: unknown[];
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
  transactionFilters: TransactionFilters;
  banks: Bank[];
  isLoading: boolean;
  isVerifying: boolean;
  verifiedAccountName: string | null;
  pendingWithdrawals: PendingWithdrawal[];
  isLoadingPending: boolean;
  actioningId: string | null;

  toggleBalance: () => void;
  fetchOverview: () => Promise<void>;
  fetchTransactions: (page?: number) => Promise<void>;
  setTransactionFilters: (filters: TransactionFilters) => Promise<void>;
  fetchBanks: () => Promise<void>;
  verifyAccount: (accountNumber: string, bankCode: string) => Promise<void>;
  withdraw: (amount: number, bankCode: string, accountNumber: string) => Promise<void>;
  processPayouts: () => Promise<void>;
  resetVerification: () => void;
  fetchPendingWithdrawals: () => Promise<void>;
  requestApprovalCode: (id: string) => Promise<void>;
  approveWithdrawal: (id: string, code: string) => Promise<void>;
  rejectWithdrawal: (id: string, reason?: string) => Promise<void>;
  removePendingWithdrawal: (id: string) => void;
  refreshAfterWithdrawalAction: () => Promise<void>;
  reconcileWithdrawals: () => Promise<ReconcileResult>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  overview: null,
  showBalance: false,
  transactions: [],
  totalTransactions: 0,
  currentPage: 1,
  transactionFilters: {},
  banks: [],
  isLoading: false,
  isVerifying: false,
  verifiedAccountName: null,
  pendingWithdrawals: [],
  isLoadingPending: false,
  actioningId: null,

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

  fetchTransactions: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { type, status } = get().transactionFilters;
      const params: any = { page, limit: TRANSACTIONS_PER_PAGE };
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

  setTransactionFilters: async (filters) => {
    set({ transactionFilters: filters });
    await get().fetchTransactions(1);
  },

  fetchBanks: async () => {
    try {
      const res = await api.get("/wallet/banks");
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
      const res = await api.post("/admin/wallet/withdraw", { 
        amount, 
        account_number: accountNumber, 
        bank_code: bankCode 
      });
      if (res.data?.data?.status === "awaiting_approval") {
        toast.success("Withdrawal submitted for approval");
      } else {
        toast.success("Withdrawal initiated successfully");
      }
      await get().fetchOverview();
      await get().fetchTransactions(1);
      await get().fetchPendingWithdrawals();
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

  fetchPendingWithdrawals: async () => {
    set({ isLoadingPending: true });
    try {
      const res = await api.get("/admin/wallet/withdrawals/pending");
      // Accept either a plain array or a paginated { data: [...] } payload
      const payload = res.data.data;
      set({ pendingWithdrawals: Array.isArray(payload) ? payload : payload?.data ?? [] });
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
      toast.error("Failed to load pending withdrawals");
    } finally {
      set({ isLoadingPending: false });
    }
  },

  requestApprovalCode: async (id) => {
    set({ actioningId: id });
    try {
      await api.post(`/admin/wallet/withdrawals/${id}/request-code`);
      toast.success("Approval code sent to your email");
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Code limit reached: only 3 codes can be sent per withdrawal each hour. Try again later.");
      } else {
        toast.error(error.response?.data?.message || "Failed to send approval code");
      }
      throw error;
    } finally {
      set({ actioningId: null });
    }
  },

  removePendingWithdrawal: (id) =>
    set((state) => ({ pendingWithdrawals: state.pendingWithdrawals.filter((w) => w.id !== id) })),

  // Reload after any approve/reject, even a failed one, since the withdrawal may
  // have changed state on the server (e.g. already actioned by another admin)
  refreshAfterWithdrawalAction: async () => {
    await Promise.all([get().fetchPendingWithdrawals(), get().fetchOverview(), get().fetchTransactions(get().currentPage)]);
  },

  approveWithdrawal: async (id, code) => {
    set({ actioningId: id });
    try {
      await api.post(`/admin/wallet/withdrawals/${id}/approve`, { code });
      toast.success("Withdrawal approved");
      get().removePendingWithdrawal(id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve withdrawal");
      throw error;
    } finally {
      set({ actioningId: null });
      get().refreshAfterWithdrawalAction();
    }
  },

  rejectWithdrawal: async (id, reason) => {
    set({ actioningId: id });
    try {
      await api.post(`/admin/wallet/withdrawals/${id}/reject`, reason ? { reason } : {});
      toast.success("Withdrawal rejected and refunded");
      get().removePendingWithdrawal(id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject withdrawal");
      throw error;
    } finally {
      set({ actioningId: null });
      get().refreshAfterWithdrawalAction();
    }
  },

  reconcileWithdrawals: async () => {
    set({ isLoading: true });
    try {
      const res = await api.post("/admin/wallet/withdrawals/reconcile");
      const result: ReconcileResult = res.data.data ?? res.data;
      await Promise.all([get().fetchPendingWithdrawals(), get().fetchOverview(), get().fetchTransactions(get().currentPage)]);
      return result;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reconcile withdrawals");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
import type { Bank, PendingWithdrawal } from "../../../stores/wallet";

// Bank details live in metadata.bankDetails; the bank name isn't sent, so look it up by code.
export function getWithdrawalDetails(w: PendingWithdrawal, banks: Bank[]) {
  const bankCode = w.metadata?.bankDetails?.bank_code || "";
  return {
    requester: w.requester_name || "Unknown user",
    role: w.requester_role || "",
    email: w.requester_email || "",
    amount: Number(w.amount || 0),
    reference: w.reference || "",
    bankName: banks.find((b) => b.code === bankCode)?.name || bankCode,
    accountNumber: w.metadata?.bankDetails?.account_number || "",
    accountName: w.metadata?.accountName || "",
    requestedAt: w.created_at,
  };
}

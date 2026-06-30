import { useState, useEffect } from "react";
import { 
  Wallet as WalletIcon, 
  Eye, 
  EyeOff,
  Search, 
  Plus, 
  MoreVertical,
  Banknote,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useWalletStore } from "../stores/wallet";
import Button from "../components/ui/Button";

export default function Wallet() {
  const { 
    overview, 
    showBalance, 
    transactions, 
    totalTransactions,
    currentPage,
    toggleBalance, 
    banks, 
    fetchBanks, 
    fetchOverview,
    fetchTransactions,
    verifyAccount, 
    verifiedAccountName, 
    isVerifying, 
    isLoading,
    withdraw,
    processPayouts,
    resetVerification
  } = useWalletStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [withdrawData, setWithdrawData] = useState({
    bankCode: "",
    accountNumber: "",
    amount: ""
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBanks();
    fetchOverview();
    fetchTransactions(1);
  }, [fetchBanks, fetchOverview, fetchTransactions]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setStep(1);
    setWithdrawData({ bankCode: "", accountNumber: "", amount: "" });
    resetVerification();
  };

  const handleVerify = () => {
    if (withdrawData.accountNumber.length === 10 && withdrawData.bankCode) {
      verifyAccount(withdrawData.accountNumber, withdrawData.bankCode);
    }
  };

  const handleProceed = () => {
    setStep(2);
  };

  const handleWithdraw = async () => {
    const amountNum = parseFloat(withdrawData.amount);
    if (amountNum > Number(overview?.wallet?.withdrawable_balance || 0)) return;
    
    try {
      await withdraw(amountNum, withdrawData.bankCode, withdrawData.accountNumber);
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleProcessPayouts = async () => {
    if (window.confirm("Are you sure you want to process all pending vet payouts? This will move earnings to withdrawable balances and credit commissions to the admin wallet.")) {
      await processPayouts();
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const withdrawableBalance = Number(overview?.wallet?.withdrawable_balance || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-sm text-gray-500">Monitor your earnings and process withdrawals.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2 border-brand text-brand hover:bg-brand/5"
            onClick={handleProcessPayouts}
            disabled={isLoading}
          >
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
            Process Vet Payouts
          </Button>
          <Button 
            variant="primary" 
            className="flex items-center gap-2"
            onClick={handleOpenModal}
            disabled={!overview?.wallet || isLoading}
          >
            <Banknote size={18} />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-brand rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-brand/20">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <WalletIcon size={180} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                <WalletIcon size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Available Balance</span>
              </div>
              <button 
                onClick={toggleBalance}
                className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/10"
              >
                {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div>
              <h2 className="text-5xl font-black tracking-tighter">
                {showBalance ? `₦${withdrawableBalance.toLocaleString()}` : "*******"}
              </h2>
              <p className="text-white/60 text-xs mt-2 font-medium">Last updated: {overview?.wallet ? new Date(overview.wallet.updated_at).toLocaleString() : "N/A"}</p>
            </div>

            <div className="flex gap-4 pt-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5 flex-1 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest mb-1">Subscriptions</p>
                <p className="text-lg font-bold">
                  {showBalance ? `₦${Number(overview?.wallet?.subscription_earned || 0).toLocaleString()}` : "****"}
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5 flex-1 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest mb-1">Vet Commissions</p>
                <p className="text-lg font-bold">
                  {showBalance ? `₦${Number(overview?.wallet?.commission_earned || 0).toLocaleString()}` : "****"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Wallet Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500 font-medium">Global Commissions</span>
              <span className={`text-sm font-bold ${showBalance ? "text-brand" : "text-gray-300"}`}>
                {showBalance ? `₦${Number(overview?.stats.total_commissions || 0).toLocaleString()}` : "****"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500 font-medium">Global Subscriptions</span>
              <span className={`text-sm font-bold ${showBalance ? "text-brand" : "text-gray-300"}`}>
                {showBalance ? `₦${Number(overview?.stats.total_subscriptions || 0).toLocaleString()}` : "****"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500 font-medium">Total Admin Balance</span>
              <span className={`text-sm font-bold ${showBalance ? "text-gray-900" : "text-gray-300"}`}>
                {showBalance ? `₦${Number(overview?.stats?.total_admin_withdrawable_balance || 0).toLocaleString()}` : "****"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-500 font-medium">Service Fee</span>
              <span className="text-sm font-bold text-gray-900">1.5%</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
            <Info size={18} className="text-brand shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Withdrawals are processed via Paystack and usually arrive in your bank account within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
            <p className="text-xs text-gray-400 mt-1">All incoming wallet credits and commissions.</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Transaction Type</th>
                <th className="px-6 py-4">User/Entity</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.type.includes("subscription") ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                        {tx.type.includes("withdrawal") ? <ArrowRight size={16} className="text-red-500" /> : <Plus size={16} />}
                      </div>
                      <span className="font-bold text-gray-900 capitalize">{tx.type.replace(/_/g, " ")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{tx.user_name || "System"}</span>
                      <span className="text-[10px] text-gray-400">{tx.user_role || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${tx.type.includes("withdrawal") ? "text-red-500" : "text-brand"}`}>
                      {tx.type.includes("withdrawal") ? "-" : "+"}₦{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(tx.created_at).toLocaleDateString()}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit border ${
                      tx.status === "successful" ? "bg-green-50 text-green-600 border-green-100" : 
                      tx.status === "pending" ? "bg-orange-50 text-orange-600 border-orange-100" : 
                      "bg-red-50 text-red-600 border-red-100"
                    }`}>
                      {tx.status === "successful" ? <CheckCircle2 size={12} /> : 
                       tx.status === "pending" ? <Loader2 size={12} className="animate-spin" /> : 
                       <AlertCircle size={12} />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-900">{filteredTransactions.length}</span> of <span className="font-bold text-gray-900">{totalTransactions}</span> transactions
          </p>
          <div className="flex gap-2">
            <button 
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={() => fetchTransactions(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button 
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={() => fetchTransactions(currentPage + 1)}
              disabled={currentPage * 20 >= totalTransactions || isLoading}
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isLoading && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
                <p className="text-xs text-gray-500 mt-0.5">Securely transfer funds to your bank account.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200"
                disabled={isLoading}
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Bank</label>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand outline-none text-sm font-medium"
                      value={withdrawData.bankCode}
                      onChange={(e) => {
                        setWithdrawData({ ...withdrawData, bankCode: e.target.value });
                        resetVerification();
                      }}
                    >
                      <option value="">Select a bank</option>
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.code}>{bank.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        maxLength={10}
                        placeholder="0123456789"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand outline-none text-sm font-medium tracking-widest"
                        value={withdrawData.accountNumber}
                        onChange={(e) => {
                          setWithdrawData({ ...withdrawData, accountNumber: e.target.value });
                          if (e.target.value.length !== 10) resetVerification();
                        }}
                      />
                      {isVerifying && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 size={18} className="animate-spin text-brand" />
                        </div>
                      )}
                    </div>
                  </div>

                  {verifiedAccountName && (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                      <CheckCircle2 size={20} className="text-green-600" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-green-600 tracking-widest">Verified Account Name</p>
                        <p className="text-sm font-bold text-gray-900">{verifiedAccountName}</p>
                      </div>
                    </div>
                  )}

                  {!verifiedAccountName && withdrawData.accountNumber.length === 10 && withdrawData.bankCode && !isVerifying && (
                    <Button 
                      variant="secondary" 
                      className="w-full rounded-xl py-3 border-brand text-brand hover:bg-brand/5"
                      onClick={handleVerify}
                    >
                      Verify Account
                    </Button>
                  )}

                  <Button 
                    variant="primary" 
                    className="w-full rounded-xl py-4 flex items-center justify-center gap-2"
                    disabled={!verifiedAccountName || isVerifying}
                    onClick={handleProceed}
                  >
                    Proceed <ArrowRight size={18} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 font-medium">Recipient</span>
                      <button 
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-brand hover:underline"
                      >
                        Change Account
                      </button>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{verifiedAccountName}</p>
                    <p className="text-xs text-gray-500">{withdrawData.accountNumber} • {banks.find(b => b.code === withdrawData.bankCode)?.name}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount to Withdraw</label>
                      <span className="text-xs font-bold text-brand">Max: ₦{withdrawableBalance.toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₦</span>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full p-4 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand outline-none text-xl font-bold"
                        value={withdrawData.amount}
                        onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                      />
                    </div>
                    {parseFloat(withdrawData.amount) > withdrawableBalance && (
                      <div className="flex items-center gap-1.5 text-red-500 mt-1">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-bold">Insufficient wallet balance</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button 
                      variant="primary" 
                      className="w-full rounded-xl py-4 flex items-center justify-center gap-2"
                      disabled={!withdrawData.amount || parseFloat(withdrawData.amount) <= 0 || parseFloat(withdrawData.amount) > withdrawableBalance || isLoading}
                      onClick={handleWithdraw}
                    >
                      {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Complete Withdrawal"}
                    </Button>
                    <button 
                      className="w-full text-center text-sm font-bold text-gray-400 py-2 hover:text-gray-600 transition-colors"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Filter, DownloadIcon, Trash2, Search, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import RevenueTable from '../../components/modules/revenue/RevenueTable';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ExportModal, { type ExportParams } from '../../components/ui/ExportModal';
import { useRevenueStore } from '../../stores/revenue';

export default function Revenue() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const { 
        selectedIds, 
        fetchTransactions, 
        fetchOverview, 
        overview, 
        deleteTransactions,
        exportRevenue
    } = useRevenueStore();

    useEffect(() => {
        fetchOverview();
        fetchTransactions();
    }, []);

    const handleBulkDelete = async () => {
        await deleteTransactions(selectedIds);
        setIsModalOpen(false);
    };

    const handleExport = async (params: ExportParams) => {
        await exportRevenue(params);
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="space-y-2 border-r border-gray-100">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <h2 className="text-3xl font-bold">
                        ₦{overview?.total_revenue?.toLocaleString() || "0"}
                    </h2>
                    <p className="text-xs text-gray-400">
                        Updated: {overview?.fetched_at ? new Date(overview.fetched_at).toLocaleTimeString() : "Just now"}
                    </p>
                </div>
                <div className="space-y-2 border-r border-gray-100 md:pl-6">
                    <p className="text-sm text-gray-500">Revenue this Month</p>
                    <h2 className="text-3xl font-bold">
                        ₦{overview?.revenue_this_month?.toLocaleString() || "0"}
                    </h2>
                    <p className="text-xs text-gray-400">
                        Updated: {overview?.fetched_at ? new Date(overview.fetched_at).toLocaleTimeString() : "Just now"}
                    </p>
                </div>
                <div className="space-y-2 md:pl-6">
                    <p className="text-sm text-gray-500">Active Subscriptions</p>
                    <h2 className="text-3xl font-bold">
                        {overview?.active_subscriptions || "0"}
                    </h2>
                    <p className="text-xs text-gray-400">
                        Updated: {overview?.fetched_at ? new Date(overview.fetched_at).toLocaleTimeString() : "Just now"}
                    </p>
                </div>
            </div>

            {/* Table Header Actions */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold text-[#1D2939]">Revenue</h1>
                    <p className="text-sm text-gray-500">Manage and monitor all transaction records</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center bg-white border rounded-lg px-3 py-2 transition-all duration-300 ${isSearchOpen ? 'w-64 border-brand' : 'w-10 border-transparent cursor-pointer'}`} onClick={() => !isSearchOpen && setIsSearchOpen(true)}>
                        <Search size={18} className="text-gray-500 shrink-0" />
                        {isSearchOpen && (
                            <>
                                <input autoFocus placeholder="Search transactions..." className="ml-2 outline-none text-sm w-full" onChange={(e) => fetchTransactions({ search: e.target.value })} />
                                <X size={14} className="cursor-pointer text-gray-400" onClick={() => setIsSearchOpen(false)} />
                            </>
                        )}
                    </div>

                    {selectedIds.length > 0 && (
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-red-500 text-sm font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} /> Delete
                        </button>
                    )}

                    <Button variant="secondary" className="border-gray-200"><Filter size={18} /> Filters</Button>
                    <Button variant="secondary" className="border-gray-200" onClick={() => setIsExportModalOpen(true)}><DownloadIcon size={18} /> Export</Button>
                </div>
            </div>

            <RevenueTable />

            <ConfirmationModal
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleBulkDelete}
                title="Delete Transactions?"
                description={`You are about to delete ${selectedIds.length} records. This action cannot be undone.`}
                confirmText="Yes, Delete"
            />
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
            />
        </div>
    );
}
import { useState, useEffect } from 'react';
import { Trash2, Filter, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router';
import Button from '../../ui/Button';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { useFarmerStore } from '../../../stores/farmers';

export default function Finance() {
    const { id: farmerId } = useParams();
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { 
        financeTransactions: payments, 
        financeMeta, 
        fetchFarmerFinance, 
        loading,
    } = useFarmerStore();

    useEffect(() => {
        if (farmerId) {
            fetchFarmerFinance(farmerId);
        }
    }, [farmerId, fetchFarmerFinance]);

    const toggleRow = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Finance</h3>
                    <p className="text-sm text-gray-500">Manage and monitor all financial records</p>
                </div>
                <div className="flex gap-2">
                    {/* Delete button only appears on selection */}
                    {selectedRows.length > 0 && (
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsModalOpen(true)}
                            className="!py-2 text-sm text-red-600 border-red-100 bg-red-50/50 hover:bg-red-50"
                        >
                            <Trash2 size={16} /> Delete Selected
                        </Button>
                    )}
                    <Button variant="secondary" className="!py-2 text-sm"><Filter size={16} /> Filters</Button>
                    <Button variant="secondary" className="!py-2 text-sm"><Download size={16} /> Export</Button>
                    <Button variant="primary" className="!py-2 text-sm bg-brand hover:bg-brand/90">
                        <FileText size={16} /> Download Receipts
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-brand focus:ring-brand"
                                    onChange={(e) => setSelectedRows(e.target.checked ? payments.map(p => p.id) : [])} 
                                    checked={selectedRows.length === payments.length && payments.length > 0}
                                />
                            </th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Amount</th>
                            <th className="px-6 py-4 font-semibold">Entry Type</th>
                            <th className="px-6 py-4 font-semibold text-right">Source</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedRows.includes(p.id)} 
                                        onChange={() => toggleRow(p.id)}
                                        className="rounded border-gray-300 text-brand focus:ring-brand"
                                    />
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{new Date(p.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                    ₦{Number(p.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                        p.entry_type === 'debit' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-brand'
                                    }`}>
                                        {p.entry_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 text-right capitalize">{p.source}</td>
                            </tr>
                        ))}
                        {payments.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                    No financial records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                <span>Showing {payments.length} of {financeMeta.total} records</span>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        className="!p-2 h-9 w-9 flex items-center justify-center"
                        disabled={financeMeta.page === 1}
                        onClick={() => farmerId && fetchFarmerFinance(farmerId, { page: financeMeta.page - 1 })}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <button className="h-9 w-9 rounded-lg border border-brand bg-green-50 text-brand font-bold">{financeMeta.page}</button>
                    <Button 
                        variant="secondary" 
                        className="!p-2 h-9 w-9 flex items-center justify-center"
                        disabled={payments.length < 10}
                        onClick={() => farmerId && fetchFarmerFinance(farmerId, { page: financeMeta.page + 1 })}
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={() => { setIsModalOpen(false); setSelectedRows([]); }}
                title="Delete Selected Finance Records?"
                description={`You are about to delete ${selectedRows.length} record(s). This action is irreversible.`}
                confirmText="Yes, Delete"
            />
        </div>
    );
}
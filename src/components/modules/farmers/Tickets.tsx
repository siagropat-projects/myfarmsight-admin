import { useState, useEffect } from 'react';
import { Filter, Trash2, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router';
import Button from '../../ui/Button';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { useFarmerStore } from '../../../stores/farmers';

export default function Tickets() {
    const { id: farmerId } = useParams();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { tickets, ticketMeta, fetchFarmerTickets, bulkDeleteTickets, loading } = useFarmerStore();

    useEffect(() => {
        if (farmerId) {
            fetchFarmerTickets(farmerId);
        }
    }, [farmerId, fetchFarmerTickets]);

    const toggleTicket = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleDelete = async () => {
        if (!farmerId) return;
        await bulkDeleteTickets(farmerId, selectedIds);
        setIsModalOpen(false);
        setSelectedIds([]);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">All Tickets</h3>
                    <p className="text-sm text-gray-500">Track and manage service requests</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsModalOpen(true)}
                            className="!py-2 text-sm text-red-600 border-red-100 bg-red-50/50"
                        >
                            <Trash2 size={16} /> Delete Selected
                        </Button>
                    )}
                    <Button variant="secondary" className="!py-2 text-sm"><Filter size={16} /> Filters</Button>
                    <Button variant="secondary" className="!py-2 text-sm"><Download size={16} /> Export</Button>
                    <Button variant="primary" className="!py-2 text-sm bg-brand hover:bg-brand/90">
                        <Plus size={16} /> Add new Ticket
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
                                    onChange={(e) => setSelectedIds(e.target.checked ? tickets.map(t => t.id) : [])}
                                    checked={selectedIds.length === tickets.length && tickets.length > 0}
                                    className="rounded border-gray-300 text-brand"
                                />
                            </th>
                            <th className="px-6 py-4">Job Ticket</th>
                            <th className="px-6 py-4">Issue Type</th>
                            <th className="px-6 py-4">Resolution</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tickets.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(t.id)} 
                                        onChange={() => toggleTicket(t.id)}
                                        className="rounded border-gray-300 text-brand"
                                    />
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{t.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{t.subject || 'Veterinary Consultation'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 italic">"{t.status}"</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(t.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                        t.status === 'open' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-brand'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'open' ? 'bg-yellow-400' : 'bg-brand'}`} />
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {tickets.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                    No tickets found for this farmer.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                <span>Showing {tickets.length} of {ticketMeta.total} tickets</span>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        className="!p-2"
                        disabled={ticketMeta.page === 1}
                        onClick={() => farmerId && fetchFarmerTickets(farmerId, { page: ticketMeta.page - 1 })}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <button className="h-9 w-9 rounded-lg border border-brand bg-green-50 text-brand font-bold text-xs">{ticketMeta.page}</button>
                    <Button 
                        variant="secondary" 
                        className="!p-2"
                        disabled={tickets.length < 10} // Assuming 10 per page
                        onClick={() => farmerId && fetchFarmerTickets(farmerId, { page: ticketMeta.page + 1 })}
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={handleDelete}
                title="Delete Selected Tickets?"
                description={`You are about to delete ${selectedIds.length} ticket(s). This action is irreversible.`}
                confirmText="Yes, Delete"
            />
        </div>
    );
}
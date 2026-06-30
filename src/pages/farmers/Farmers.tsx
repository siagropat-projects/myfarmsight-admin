import { useState, useEffect } from 'react';
import { DownloadIcon, Trash2, Plus, ArrowLeft, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useFarmerStore } from '../../stores/farmers';
import Button from '../../components/ui/Button';
import Table from '../../components/modules/farmers/Table';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ExportModal, { type ExportParams } from '../../components/ui/ExportModal';

export default function Farmers() {
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const { selectedIds, fetchFarmers, deleteFarmers, exportFarmers } = useFarmerStore();

    useEffect(() => {
        fetchFarmers();
    }, [fetchFarmers]);

    const handleBulkDelete = async () => {
        await deleteFarmers(selectedIds);
        setIsModalOpen(false);
    };

    const handleExport = async (params: ExportParams) => {
        await exportFarmers(params);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                    <h1 className="text-xl font-bold text-[#1D2939]">Manage Farms</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center bg-white border rounded-lg px-3 py-2 transition-all duration-300 ${isSearchOpen ? 'w-64 border-brand' : 'w-10 border-transparent cursor-pointer'}`} onClick={() => !isSearchOpen && setIsSearchOpen(true)}>
                        <Search size={18} className="text-gray-500 shrink-0" />
                        {isSearchOpen && (
                            <>
                                <input autoFocus placeholder="Search farms..." className="ml-2 outline-none text-sm w-full" onChange={(e) => fetchFarmers({ search: e.target.value })} />
                                <X size={14} className="cursor-pointer text-gray-400" onClick={() => setIsSearchOpen(false)} />
                            </>
                        )}
                    </div>

                    {selectedIds.length > 0 && (
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-red-500 text-sm font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} /> Delete
                        </button>
                    )}

                    <Button variant="secondary" className="border-gray-200" onClick={() => setIsExportModalOpen(true)}><DownloadIcon size={18} /> Export</Button>
                    <Button variant="primary" className="bg-brand hover:bg-brand/90" onClick={() => navigate('/farmers/create')}><Plus size={18} /> Add New Farm</Button>
                </div>
            </div>

            <Table />

            <ConfirmationModal
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleBulkDelete}
                title="Delete Selected Farms?"
                description={`You are about to delete ${selectedIds.length} farm(s). This action is irreversible and will move them to the trash.`}
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
import { Plus, Tractor } from 'lucide-react';
import Button from '../../ui/Button';
import { useNavigate } from 'react-router';

export const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
      <div className="w-20 h-20 bg-green-50 text-brand rounded-full flex items-center justify-center mb-6">
        <Tractor size={40} />
      </div>
      <h3 className="text-xl font-bold text-gray-900">No farmers found</h3>
      <p className="text-gray-500 mb-8 max-w-xs text-center">
        It looks like you haven't added any farmers yet. Start by creating your first entry.
      </p>
      <Button variant="primary" onClick={() => navigate('/farmers/create')}>
        <Plus size={18} /> Add Your First Farmer
      </Button>
    </div>
  );
};
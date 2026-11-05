import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import Button from '../../ui/Button';
import { useSubscriptionStore, type SubscriptionPlan } from '../../../stores/settings/subscription';

interface DuplicatePlanModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onDuplicated: (copyId: string) => void;
}

export default function DuplicatePlanModal({ plan, onClose, onDuplicated }: DuplicatePlanModalProps) {
  const { duplicatePlan, actioning } = useSubscriptionStore();
  const [newName, setNewName] = useState(`${plan.name} Copy`);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const copyId = await duplicatePlan(plan.id, newName.trim());
      if (copyId) onDuplicated(copyId);
      else onClose();
    } catch {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !actioning && onClose()} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Duplicate {plan.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              The copy stays inactive so you can review it. Its feature list starts empty, and the edit form opens next.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={actioning} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">New Plan Name</label>
          <input
            type="text"
            autoFocus
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1 whitespace-nowrap" onClick={onClose} disabled={actioning}>Cancel</Button>
          <Button variant="primary" type="submit" className="flex-1 whitespace-nowrap" isLoading={actioning} disabled={!newName.trim()}>
            Duplicate
          </Button>
        </div>
      </form>
    </div>
  );
}

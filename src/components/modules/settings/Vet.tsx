import { useEffect, useState } from 'react';
import Button from '../../ui/Button';
import { useSettingsStore, type CommissionSettings } from '../../../stores/settings/settings';
import { Loader2 } from 'lucide-react';

export default function Vet() {
  const { commission, loading, fetchCommissionSettings, updateCommissionSettings } = useSettingsStore();
  const [formData, setFormData] = useState<CommissionSettings | null>(null);

  useEffect(() => {
    fetchCommissionSettings();
  }, [fetchCommissionSettings]);

  useEffect(() => {
    if (commission) {
      setFormData(commission);
    }
  }, [commission]);

  const handleSave = async () => {
    if (!formData) return;
    try {
      await updateCommissionSettings(formData);
    } catch (error) {
      // Error handled by store toast
    }
  };

  if (loading && !formData) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-8 relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Commission Type</label>
          <select 
            className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-brand appearance-none"
            value={formData.commission_type}
            onChange={(e) => setFormData({ ...formData, commission_type: e.target.value as 'percentage' | 'fixed_amount' })}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Commission Value</label>
          <input 
            type="number" 
            className="w-full p-3 border border-gray-200 rounded-lg" 
            value={formData.commission_value}
            onChange={(e) => setFormData({ ...formData, commission_value: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Payout Schedule</label>
          <select 
            className="w-full p-3 border border-gray-200 rounded-lg bg-white appearance-none"
            value={formData.payout_schedule}
            onChange={(e) => setFormData({ ...formData, payout_schedule: e.target.value as 'monthly' | 'weekly' })}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Minimum Payout Threshold</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
            <input 
              type="number" 
              className="w-full p-3 pl-8 border border-gray-200 rounded-lg" 
              value={formData.minimum_payout_threshold}
              onChange={(e) => setFormData({ ...formData, minimum_payout_threshold: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <Button 
          variant="secondary" 
          className="px-8 border-gray-200"
          onClick={() => setFormData(commission)}
          disabled={loading}
        >
          Reset
        </Button>
        <Button 
          variant="primary" 
          className="bg-brand px-8"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save details'}
        </Button>
      </div>
    </div>
  );
}
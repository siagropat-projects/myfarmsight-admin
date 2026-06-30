import { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, X, Plus, Loader2, Tag, Percent, Banknote } from 'lucide-react';
import Button from '../../ui/Button';
import Pagination from '../../ui/Pagination';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { useSubscriptionStore, type SubscriptionPlan, type CreateSubscriptionPayload, type UpsertDiscountPayload } from '../../../stores/settings/subscription';

export default function Subscription() {
  const { 
    plans, loading, fetchPlans, createPlan, updatePlan, deletePlan, activatePlan, deactivatePlan, upsertDiscount, toggleDiscount
  } = useSubscriptionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'activate' | 'deactivate' | 'delete' | 'toggle_discount';
    planId: string | null;
    discountId?: string;
    isActive?: boolean;
  }>({
    isOpen: false,
    type: 'delete',
    planId: null,
  });

  // Form state
  const [formData, setFormData] = useState<CreateSubscriptionPayload>({
    name: '',
    price: 0,
    features: [],
  });
  const [newFeature, setNewFeature] = useState('');

  // Discount state
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountData, setDiscountData] = useState<Omit<UpsertDiscountPayload, 'subscription_plan_id'>>({
    type: 'percentage',
    value: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        price: Number(editingPlan.price),
        features: editingPlan.features,
      });
      if (editingPlan.discount) {
        setHasDiscount(true);
        setDiscountData({
          type: editingPlan.discount.type,
          value: Number(editingPlan.discount.value),
          is_active: editingPlan.discount.is_active,
        });
      } else {
        setHasDiscount(false);
        setDiscountData({ type: 'percentage', value: 0, is_active: true });
      }
    } else {
      setFormData({ name: '', price: 0, features: [] });
      setHasDiscount(false);
      setDiscountData({ type: 'percentage', value: 0, is_active: true });
    }
  }, [editingPlan]);

  const handleOpenModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
    } else {
      setEditingPlan(null);
    }
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let planId = editingPlan?.id;
      
      const payload = {
        ...formData,
        price: Number(formData.price)
      };

      if (editingPlan) {
        await updatePlan(editingPlan.id, payload);
      } else {
        const newPlanId = await createPlan(payload);
        if (typeof newPlanId === 'string') {
          planId = newPlanId;
        }
      }

      // If we have a planId and hasDiscount is true, upsert discount
      if (planId && hasDiscount) {
        await upsertDiscount({
          subscription_plan_id: planId,
          ...discountData,
          value: Number(discountData.value)
        });
      }
      
      setIsModalOpen(false);
    } catch (error) {
      // Handled by store
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.planId && confirmModal.type !== 'toggle_discount') return;
    try {
      if (confirmModal.type === 'activate') {
        await activatePlan(confirmModal.planId!);
      } else if (confirmModal.type === 'deactivate') {
        await deactivatePlan(confirmModal.planId!);
      } else if (confirmModal.type === 'delete') {
        await deletePlan(confirmModal.planId!);
      } else if (confirmModal.type === 'toggle_discount') {
        if (confirmModal.discountId) {
          await toggleDiscount(confirmModal.discountId, !confirmModal.isActive);
        }
      }
      setConfirmModal({ ...confirmModal, isOpen: false, planId: null });
    } catch (error) {
      // Handled by store
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Subscription Plans</h2>
          <p className="text-sm text-gray-500">Manage and monitor all subscription plans</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Filter size={20} /></button>
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Search size={20} /></button>
          <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download size={18} /> Export
          </button>
          <Button 
            variant="primary" 
            className="bg-brand flex items-center gap-2"
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} /> Add New Plan
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-100 overflow-hidden min-h-[400px] relative">
        {loading && !isModalOpen && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        )}
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium">Plan Name</th>
              <th className="p-4 font-medium">Monthly Price</th>
              <th className="p-4 font-medium">Discount</th>
              <th className="p-4 font-medium">Features included</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {plans.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No subscription plans found</td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{plan.name}</td>
                  <td className="p-4 text-gray-600">₦{plan.price.toLocaleString()}</td>
                  <td className="p-4">
                    {plan.discount ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-bold ${plan.discount.is_active ? 'text-brand' : 'text-gray-400 line-through'}`}>
                          {plan.discount.type === 'percentage' ? `${plan.discount.value}% OFF` : `₦${plan.discount.value.toLocaleString()} OFF`}
                        </span>
                        <span className="text-[10px] text-gray-400 capitalize">{plan.discount.type} • {plan.discount.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No discount</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {plan.features.slice(0, 2).map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] text-gray-600">
                          {f}
                        </span>
                      ))}
                      {plan.features.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] text-gray-600">
                          +{plan.features.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      plan.status === 'active' ? 'bg-green-50 text-brand' : 'bg-gray-50 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${plan.status === 'active' ? 'bg-brand' : 'bg-gray-400'}`} />
                      {plan.status}
                    </span>
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === plan.id ? null : plan.id)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical size={18} className="text-gray-400" />
                    </button>
                    {activeMenu === plan.id && (
                      <div className="absolute right-10 top-8 w-48 bg-white shadow-xl border border-gray-100 rounded-lg z-50 py-1 text-left animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          onClick={() => handleOpenModal(plan)}
                          className="w-full px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                          Edit Plan & Discount
                        </button>
                        {plan.discount && (
                          <button 
                            onClick={() => {
                              setConfirmModal({ 
                                isOpen: true, 
                                type: 'toggle_discount', 
                                planId: plan.id, 
                                discountId: plan.discount?.id, 
                                isActive: plan.discount?.is_active 
                              });
                              setActiveMenu(null);
                            }}
                            className={`w-full px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 font-medium ${plan.discount.is_active ? 'text-amber-600' : 'text-brand'}`}
                          >
                            {plan.discount.is_active ? 'Disable Discount' : 'Enable Discount'}
                          </button>
                        )}
                        <div className="h-px bg-gray-50 my-1" />
                        {plan.status === 'active' ? (
                          <button 
                            onClick={() => {
                              setConfirmModal({ isOpen: true, type: 'deactivate', planId: plan.id });
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-amber-600 font-medium flex items-center gap-2"
                          >
                            Deactivate Plan
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setConfirmModal({ isOpen: true, type: 'activate', planId: plan.id });
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-brand font-medium flex items-center gap-2"
                          >
                            Activate Plan
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setConfirmModal({ isOpen: true, type: 'delete', planId: plan.id });
                            setActiveMenu(null);
                          }}
                          className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-red-500 font-medium border-t border-gray-50 flex items-center gap-2"
                        >
                          Delete Plan
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination 
          totalRecords={plans.length} 
          currentPage={1} 
          totalPages={1} 
          onPageChange={() => {}} 
          currentRecords={plans} 
        />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h2>
                <p className="text-sm text-gray-500">{editingPlan ? 'Update existing subscription details.' : 'Create a new subscription tier.'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Plan Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Basic" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Monthly Price (₦)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="0.00" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm" 
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Discount Section */}
                <div className="space-y-3 pt-2 border-t border-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-brand" />
                      <label className="text-sm font-bold text-gray-700">Plan Discount</label>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setHasDiscount(!hasDiscount)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${hasDiscount ? 'bg-brand' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${hasDiscount ? 'translate-x-5.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {hasDiscount && (
                    <div className="bg-brand/[0.03] border border-brand/10 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-600">Discount Type</label>
                          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                            <button 
                              type="button"
                              onClick={() => setDiscountData({ ...discountData, type: 'percentage' })}
                              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${discountData.type === 'percentage' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                              <Percent size={14} /> Percentage
                            </button>
                            <button 
                              type="button"
                              onClick={() => setDiscountData({ ...discountData, type: 'fixed' })}
                              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${discountData.type === 'fixed' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                              <Banknote size={14} /> Fixed
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-600">
                            {discountData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'}
                          </label>
                          <input 
                            required={hasDiscount}
                            type="number" 
                            placeholder="0" 
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm" 
                            value={discountData.value}
                            onChange={e => setDiscountData({ ...discountData, value: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Features Included</label>
                  <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add a feature..." 
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-brand focus:border-brand"
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      />
                      <Button type="button" variant="secondary" className="px-4 text-sm" onClick={handleAddFeature}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((f, i) => (
                        <span key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600">
                          {f} 
                          <X 
                            size={14} 
                            className="cursor-pointer text-gray-400 hover:text-red-500" 
                            onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })} 
                          />
                        </span>
                      ))}
                      {formData.features.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No features added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="bg-white border-gray-200">Cancel</Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="bg-brand px-8"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingPlan ? 'Save Changes' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false, planId: null })}
        onConfirm={handleConfirmAction}
        isLoading={loading}
        title={
          confirmModal.type === 'activate' ? 'Activate Plan?' :
          confirmModal.type === 'deactivate' ? 'Deactivate Plan?' : 
          confirmModal.type === 'toggle_discount' ? (confirmModal.isActive ? 'Disable Discount?' : 'Enable Discount?') :
          'Delete Plan?'
        }
        description={
          confirmModal.type === 'activate' ? 'This plan will be visible and available for users to subscribe.' :
          confirmModal.type === 'deactivate' ? 'Users will not be able to subscribe to this plan anymore.' :
          confirmModal.type === 'toggle_discount' ? `This will ${confirmModal.isActive ? 'disable' : 'enable'} the discount for this subscription plan.` :
          'This action cannot be undone. All data associated with this plan will be removed.'
        }
        confirmText={
          confirmModal.type === 'activate' ? 'Activate' :
          confirmModal.type === 'deactivate' ? 'Deactivate' : 
          confirmModal.type === 'toggle_discount' ? (confirmModal.isActive ? 'Disable' : 'Enable') :
          'Delete'
        }
        variant={confirmModal.type === 'delete' ? 'danger' : 'proceed'}
      />
    </div>
  );
}
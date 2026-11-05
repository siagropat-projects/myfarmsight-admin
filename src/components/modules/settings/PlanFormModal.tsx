import { useEffect, useState, type FormEvent } from 'react';
import { Banknote, Check, Percent, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../ui/Button';
import {
  getPlanFeatures,
  UNLIMITED,
  useSubscriptionStore,
  type SubscriptionPlan,
} from '../../../stores/settings/subscription';
import { generatePlanFeatures } from './planFeatures';

interface PlanFormModalProps {
  plan: SubscriptionPlan | null;
  onClose: () => void;
}

const inputClass = 'w-full p-2.5 border border-gray-200 rounded-lg focus:ring-brand focus:border-brand text-sm disabled:bg-gray-50 disabled:text-gray-400';

const isValidLimit = (value: string) => Number.isInteger(Number(value)) && Number(value) >= 1;

const isSameList = (a: string[], b: string[] = []) =>
  a.length === b.length && a.every((item) => b.includes(item));

function LimitField({ label, value, unlimited, onValueChange, onUnlimitedChange }: {
  label: string;
  value: string;
  unlimited: boolean;
  onValueChange: (value: string) => void;
  onUnlimitedChange: (unlimited: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      <input
        type="number"
        min={1}
        step={1}
        className={inputClass}
        value={unlimited ? '' : value}
        placeholder={unlimited ? 'Unlimited' : ''}
        disabled={unlimited}
        onChange={(e) => onValueChange(e.target.value)}
      />
      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
        <input type="checkbox" className="accent-brand" checked={unlimited} onChange={(e) => onUnlimitedChange(e.target.checked)} />
        Unlimited
      </label>
    </div>
  );
}

export default function PlanFormModal({ plan, onClose }: PlanFormModalProps) {
  const {
    capabilities: availableCapabilities, capabilitiesFailed, fetchCapabilities,
    createPlan, updatePlan, upsertDiscount, toggleDiscount,
  } = useSubscriptionStore();

  const existingDiscount = plan?.discount?.id ? plan.discount : null;

  const [name, setName] = useState(plan?.name ?? '');
  const [isFree, setIsFree] = useState(plan?.is_free_forever ?? false);
  const [pricePerMonth, setPricePerMonth] = useState(plan ? String(Number(plan.price_per_month || 0)) : '');
  const [pricePerYear, setPricePerYear] = useState(plan ? String(Number(plan.price_per_year || 0)) : '');
  const [maxFarmhouses, setMaxFarmhouses] = useState(plan && plan.max_farmhouses !== UNLIMITED ? String(plan.max_farmhouses) : '1');
  const [unlimitedFarmhouses, setUnlimitedFarmhouses] = useState(plan?.max_farmhouses === UNLIMITED);
  const [maxBatches, setMaxBatches] = useState(plan && plan.max_batches_per_farmhouse !== UNLIMITED ? String(plan.max_batches_per_farmhouse) : '1');
  const [unlimitedBatches, setUnlimitedBatches] = useState(plan?.max_batches_per_farmhouse === UNLIMITED);
  const [capabilities, setCapabilities] = useState<string[]>(plan?.capabilities ?? []);
  const [hasDiscount, setHasDiscount] = useState(existingDiscount?.is_active ?? false);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>(existingDiscount?.type ?? 'percentage');
  const [discountValue, setDiscountValue] = useState(existingDiscount ? String(Number(existingDiscount.value)) : '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!availableCapabilities.length) fetchCapabilities();
  }, [availableCapabilities.length, fetchCapabilities]);

  const farmhouseLimit = unlimitedFarmhouses ? UNLIMITED : isValidLimit(maxFarmhouses) ? Number(maxFarmhouses) : null;
  const batchLimit = unlimitedBatches ? UNLIMITED : isValidLimit(maxBatches) ? Number(maxBatches) : null;

  // A plan keeps its saved wording until its capabilities or limits change
  const savedFeatures = plan ? getPlanFeatures(plan) : [];
  const keepSavedFeatures = savedFeatures.length > 0
    && isSameList(capabilities, plan?.capabilities)
    && farmhouseLimit === plan?.max_farmhouses
    && batchLimit === plan?.max_batches_per_farmhouse;
  const features = keepSavedFeatures
    ? savedFeatures
    : generatePlanFeatures(capabilities, farmhouseLimit, batchLimit, availableCapabilities);

  const toggleCapability = (value: string) => {
    setCapabilities(capabilities.includes(value)
      ? capabilities.filter((c) => c !== value)
      : [...capabilities, value]);
  };

  const wantsDiscount = hasDiscount && !isFree;

  const validate = (): string | null => {
    if (!name.trim()) return 'Enter a plan name.';
    if (!isFree && !(Number(pricePerMonth) > 0 && Number(pricePerYear) > 0)) {
      return 'Enter a monthly and a yearly price, or mark the plan as free forever.';
    }
    if (!unlimitedFarmhouses && !isValidLimit(maxFarmhouses)) return 'Max farmhouses must be a whole number of at least 1.';
    if (!unlimitedBatches && !isValidLimit(maxBatches)) return 'Max batches must be a whole number of at least 1.';
    if (capabilities.length === 0) return 'Select at least one capability.';
    if (wantsDiscount) {
      const value = Number(discountValue);
      if (!(value > 0)) return 'Enter a discount greater than 0.';
      if (discountType === 'percentage' && value > 100) return "A percentage discount can't be more than 100%.";
      if (discountType === 'fixed' && value >= Math.min(Number(pricePerMonth), Number(pricePerYear))) {
        return 'A fixed discount must be less than both the monthly and yearly price.';
      }
    }
    return null;
  };

  const saveDiscount = async (planId: string) => {
    if (wantsDiscount) {
      const value = Number(discountValue);
      const unchanged = existingDiscount?.is_active
        && existingDiscount.type === discountType
        && Number(existingDiscount.value) === value;
      if (!unchanged) {
        await upsertDiscount({ subscription_plan_id: planId, type: discountType, value, is_active: true });
      }
    } else if (existingDiscount?.is_active) {
      // The API has no way to delete a discount, so switching it off disables it
      await toggleDiscount(planId, false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }

    const payload = {
      name: name.trim(),
      price_per_month: isFree ? 0 : Number(pricePerMonth),
      price_per_year: isFree ? 0 : Number(pricePerYear),
      is_free_forever: isFree,
      max_farmhouses: unlimitedFarmhouses ? UNLIMITED : Number(maxFarmhouses),
      max_batches_per_farmhouse: unlimitedBatches ? UNLIMITED : Number(maxBatches),
      capabilities,
      feature_descriptions: features,
    };

    setSaving(true);
    let planId = plan?.id;
    try {
      if (plan) {
        // Leave out lists that didn't change: the API currently fails when it saves
        // feature_descriptions, and this keeps prices and limits editable meanwhile
        const changes: Partial<typeof payload> = { ...payload };
        if (isSameList(payload.capabilities, plan.capabilities)) delete changes.capabilities;
        if (isSameList(payload.feature_descriptions, savedFeatures)) delete changes.feature_descriptions;
        await updatePlan(plan.id, changes);
      } else {
        planId = await createPlan(payload);
      }
    } catch {
      // Keep the form open so the details can be corrected; the store shows the error
      setSaving(false);
      return;
    }

    try {
      if (planId) await saveDiscount(planId);
    } catch {
      // The plan itself saved, so saving again from here could create a second plan.
      // The store's error tells the admin to edit the plan to retry.
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{plan ? 'Edit Plan' : 'Add New Plan'}</h2>
            <p className="text-sm text-gray-500">{plan ? 'Update existing subscription details.' : 'Create a new subscription tier.'}</p>
          </div>
          <button onClick={onClose} disabled={saving} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Plan Name</label>
              <input type="text" placeholder="e.g. Basic" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" className="accent-brand" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
                Free forever
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Monthly Price (₦)</label>
                  <input type="number" min={0} placeholder="0" className={inputClass} disabled={isFree} value={isFree ? '0' : pricePerMonth} onChange={(e) => setPricePerMonth(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Yearly Price (₦)</label>
                  <input type="number" min={0} placeholder="0" className={inputClass} disabled={isFree} value={isFree ? '0' : pricePerYear} onChange={(e) => setPricePerYear(e.target.value)} />
                </div>
              </div>
            </div>

            {isFree ? (
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">Plan Discount</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Free forever plans can't have a discount.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-brand" />
                      <span className="text-sm font-bold text-gray-700">Plan Discount</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {hasDiscount ? 'Farmers get this off the monthly and yearly price.' : 'Switch on to add a discount to this plan.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasDiscount}
                    aria-label="Plan discount"
                    onClick={() => setHasDiscount(!hasDiscount)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors shrink-0 focus:outline-none ${hasDiscount ? 'bg-brand' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${hasDiscount ? 'translate-x-5.5' : 'translate-x-1'}`} />
                  </button>
                </div>

                {hasDiscount && (
                  <div className="bg-brand/[0.03] border border-brand/10 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600">Discount Type</label>
                        <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => setDiscountType('percentage')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${discountType === 'percentage' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            <Percent size={14} /> Percentage
                          </button>
                          <button
                            type="button"
                            onClick={() => setDiscountType('fixed')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${discountType === 'fixed' ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            <Banknote size={14} /> Fixed
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600">
                          {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'}
                        </label>
                        <input type="number" min={0} placeholder="0" className={inputClass} value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <LimitField label="Max Farmhouses" value={maxFarmhouses} unlimited={unlimitedFarmhouses} onValueChange={setMaxFarmhouses} onUnlimitedChange={setUnlimitedFarmhouses} />
              <LimitField label="Max Batches per Farmhouse" value={maxBatches} unlimited={unlimitedBatches} onValueChange={setMaxBatches} onUnlimitedChange={setUnlimitedBatches} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700">
                  Capabilities <span className="font-medium text-gray-400">({capabilities.length} selected)</span>
                </label>
                {availableCapabilities.length > 0 && (
                  <div className="flex gap-3 text-xs font-medium">
                    <button type="button" className="text-brand hover:underline" onClick={() => setCapabilities(availableCapabilities.map((c) => c.value))}>Select all</button>
                    <button type="button" className="text-gray-500 hover:underline" onClick={() => setCapabilities([])}>Clear</button>
                  </div>
                )}
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                {capabilitiesFailed ? (
                  <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                    Couldn't load capabilities.
                    <Button type="button" variant="secondary" className="px-4 !py-1.5 text-sm" onClick={fetchCapabilities}>Retry</Button>
                  </div>
                ) : availableCapabilities.length === 0 ? (
                  <p className="text-sm text-gray-400">Loading capabilities...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto custom-scrollbar">
                    {availableCapabilities.map((capability) => (
                      <label key={capability.value} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" className="accent-brand" checked={capabilities.includes(capability.value)} onChange={() => toggleCapability(capability.value)} />
                        {capability.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Features shown to farmers</label>
              <p className="text-xs text-gray-500">
                {keepSavedFeatures
                  ? "This plan's saved list. It's rebuilt if you change its capabilities or limits."
                  : 'Built automatically from the capabilities and limits above.'}
              </p>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                {features.length > 0 ? (
                  <ul className="space-y-2">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check size={16} className="text-brand shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">Select capabilities to build this list.</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={onClose} disabled={saving} className="bg-white border-gray-200">Cancel</Button>
            <Button variant="primary" type="submit" className="bg-brand px-8" isLoading={saving}>
              {plan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

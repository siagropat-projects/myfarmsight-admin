import { useEffect, useState, type MouseEvent } from 'react';
import { Columns3, Download, Filter, Loader2, MoreVertical, Plus, Search } from 'lucide-react';
import Button from '../../ui/Button';
import Pagination from '../../ui/Pagination';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  formatNaira,
  getPlanFeatures,
  UNLIMITED,
  useSubscriptionStore,
  type SubscriptionPlan,
} from '../../../stores/settings/subscription';
import ComparePlansModal from './ComparePlansModal';
import DuplicatePlanModal from './DuplicatePlanModal';
import PlanFormModal from './PlanFormModal';

type ConfirmType = 'activate' | 'deactivate' | 'archive' | 'toggle_discount';

const MENU_HEIGHT = 260;

// Fixed to the viewport so the table's scroll area can't cut it off on the bottom rows
function PlanActionsMenu({ position, onClose, children }: {
  position: { top?: number; bottom?: number; right: number };
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useClickOutside<HTMLDivElement>(onClose);
  return (
    <div
      ref={ref}
      style={position}
      className="fixed w-48 bg-white shadow-xl border border-gray-100 rounded-lg z-50 py-1 text-left animate-in fade-in zoom-in-95 duration-100"
    >
      {children}
    </div>
  );
}

const formatLimit = (limit: number, singular: string, plural: string) =>
  limit === UNLIMITED ? `Unlimited ${plural}` : `${limit} ${limit === 1 ? singular : plural}`;

export default function Subscription() {
  const {
    plans, usage, loading, actioning, fetchPlans, fetchCapabilities, getPlan,
    archivePlan, activatePlan, deactivatePlan, toggleDiscount,
  } = useSubscriptionStore();

  const [form, setForm] = useState<{ plan: SubscriptionPlan | null } | null>(null);
  const [menu, setMenu] = useState<{ planId: string; top?: number; bottom?: number; right: number } | null>(null);
  const [duplicating, setDuplicating] = useState<SubscriptionPlan | null>(null);
  const [comparing, setComparing] = useState(false);
  const [confirm, setConfirm] = useState<{ type: ConfirmType; plan: SubscriptionPlan } | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchCapabilities();
  }, [fetchPlans, fetchCapabilities]);

  const openEdit = async (planId: string) => {
    setMenu(null);
    const plan = await getPlan(planId);
    if (plan) setForm({ plan });
  };

  const openMenu = (e: MouseEvent<HTMLButtonElement>, planId: string) => {
    if (menu?.planId === planId) {
      setMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const right = window.innerWidth - rect.right;
    setMenu(rect.bottom + MENU_HEIGHT > window.innerHeight
      ? { planId, bottom: window.innerHeight - rect.top + 4, right }
      : { planId, top: rect.bottom + 4, right });
  };

  const askConfirm = (type: ConfirmType, plan: SubscriptionPlan) => {
    setConfirm({ type, plan });
    setMenu(null);
  };

  const handleConfirmAction = async () => {
    if (!confirm) return;
    const { type, plan } = confirm;
    try {
      if (type === 'activate') await activatePlan(plan.id);
      else if (type === 'deactivate') await deactivatePlan(plan.id);
      else if (type === 'archive') await archivePlan(plan.id);
      else if (plan.discount) await toggleDiscount(plan.id, !plan.discount.is_active);
    } catch {
      // Error shown by the store
    } finally {
      setConfirm(null);
    }
  };

  // The list includes archived plans; keep them out of the way at the bottom
  const sortedPlans = [...plans].sort((a, b) => Number(a.status === 'archived') - Number(b.status === 'archived'));

  const activeUsersWarning = (plan: SubscriptionPlan) => {
    const count = usage[plan.id];
    const users = count > 0 ? ` ${count} ${count === 1 ? 'user is' : 'users are'} currently on this plan.` : '';
    const free = plan.is_free_forever ? ' Users without a paid subscription rely on this free plan.' : '';
    return users + free;
  };

  const confirmContent = confirm && {
    activate: {
      title: confirm.plan.status === 'archived' ? 'Restore Plan?' : 'Activate Plan?',
      description: 'This plan will be visible and available for users to subscribe.',
      confirmText: confirm.plan.status === 'archived' ? 'Restore' : 'Activate',
    },
    deactivate: {
      title: 'Deactivate Plan?',
      description: `Users will not be able to subscribe to this plan anymore.${activeUsersWarning(confirm.plan)}`,
      confirmText: 'Deactivate',
    },
    archive: {
      title: 'Archive Plan?',
      description: `The plan will be archived and no longer available to subscribe to.${activeUsersWarning(confirm.plan)}`,
      confirmText: 'Archive',
    },
    toggle_discount: {
      title: confirm.plan.discount?.is_active ? 'Disable Discount?' : 'Enable Discount?',
      description: `This will ${confirm.plan.discount?.is_active ? 'disable' : 'enable'} the discount for this subscription plan.`,
      confirmText: confirm.plan.discount?.is_active ? 'Disable' : 'Enable',
    },
  }[confirm.type];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 flex flex-wrap gap-3 justify-between items-center">
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
          <button
            onClick={() => setComparing(true)}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
          >
            <Columns3 size={18} /> Compare Plans
          </button>
          <Button
            variant="primary"
            className="bg-brand flex items-center gap-2 whitespace-nowrap"
            onClick={() => setForm({ plan: null })}
          >
            <Plus size={18} /> Add New Plan
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-100 overflow-hidden min-h-[400px] relative">
        {loading && !form && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium">Plan Name</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Limits</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium">Features included</th>
                <th className="p-4 font-medium whitespace-nowrap">Active Users</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plans.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No subscription plans found</td>
                </tr>
              ) : (
                sortedPlans.map((plan) => {
                  const features = getPlanFeatures(plan);
                  const discount = plan.discount?.id ? plan.discount : null;
                  const isArchived = plan.status === 'archived';
                  return (
                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{plan.name}</td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {plan.is_free_forever ? (
                          'Free forever'
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span>{formatNaira(plan.price_per_month)} / month</span>
                            <span className="text-xs text-gray-400">{formatNaira(plan.price_per_year)} / year</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-600 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span>{formatLimit(plan.max_farmhouses, 'farmhouse', 'farmhouses')}</span>
                          <span className="text-gray-400">{formatLimit(plan.max_batches_per_farmhouse, 'batch', 'batches')} each</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {discount ? (
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-xs font-bold ${discount.is_active ? 'text-brand' : 'text-gray-400 line-through'}`}>
                              {discount.type === 'percentage' ? `${Number(discount.value)}% OFF` : `${formatNaira(discount.value)} OFF`}
                            </span>
                            <span className="text-[10px] text-gray-400 capitalize">{discount.type} • {discount.is_active ? 'Active' : 'Inactive'}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic whitespace-nowrap">No discount</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {features.slice(0, 2).map((feature) => (
                            <span key={feature} className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] text-gray-600">{feature}</span>
                          ))}
                          {features.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] text-gray-600">+{features.length - 2}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{plan.capabilities?.length ?? 0} capabilities</p>
                      </td>
                      <td className="p-4 text-gray-600">{usage[plan.id] ?? '—'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          plan.status === 'active' ? 'bg-green-50 text-brand' : 'bg-gray-50 text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${plan.status === 'active' ? 'bg-brand' : 'bg-gray-400'}`} />
                          {plan.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => openMenu(e, plan.id)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                          aria-label={`Actions for ${plan.name}`}
                        >
                          <MoreVertical size={18} className="text-gray-400" />
                        </button>
                        {menu?.planId === plan.id && (
                          <PlanActionsMenu position={{ top: menu.top, bottom: menu.bottom, right: menu.right }} onClose={() => setMenu(null)}>
                            {!isArchived && (
                              <button onClick={() => openEdit(plan.id)} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-left">
                                Edit Plan & Discount
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setDuplicating(plan);
                                setMenu(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-left"
                            >
                              Duplicate Plan
                            </button>
                            {discount && !isArchived && (
                              <button
                                onClick={() => askConfirm('toggle_discount', plan)}
                                className={`w-full px-4 py-2 hover:bg-gray-50 text-sm text-left font-medium ${discount.is_active ? 'text-amber-600' : 'text-brand'}`}
                              >
                                {discount.is_active ? 'Disable Discount' : 'Enable Discount'}
                              </button>
                            )}
                            <div className="h-px bg-gray-50 my-1" />
                            {plan.status === 'active' ? (
                              <button onClick={() => askConfirm('deactivate', plan)} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-left text-amber-600 font-medium">
                                Deactivate Plan
                              </button>
                            ) : (
                              <button onClick={() => askConfirm('activate', plan)} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-left text-brand font-medium">
                                {isArchived ? 'Restore Plan' : 'Activate Plan'}
                              </button>
                            )}
                            {!isArchived && (
                              <button onClick={() => askConfirm('archive', plan)} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-left text-red-500 font-medium border-t border-gray-50">
                                Archive Plan
                              </button>
                            )}
                          </PlanActionsMenu>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalRecords={plans.length}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          currentRecords={plans}
        />
      </div>

      {form && <PlanFormModal plan={form.plan} onClose={() => setForm(null)} />}

      {duplicating && (
        <DuplicatePlanModal
          plan={duplicating}
          onClose={() => setDuplicating(null)}
          onDuplicated={(copyId) => {
            setDuplicating(null);
            openEdit(copyId);
          }}
        />
      )}

      {comparing && <ComparePlansModal onClose={() => setComparing(false)} />}

      <ConfirmationModal
        isOpen={!!confirm}
        onClose={() => !actioning && setConfirm(null)}
        onConfirm={handleConfirmAction}
        isLoading={actioning}
        title={confirmContent?.title}
        description={confirmContent?.description}
        confirmText={confirmContent?.confirmText}
        variant={confirm?.type === 'archive' ? 'danger' : 'proceed'}
      />
    </div>
  );
}

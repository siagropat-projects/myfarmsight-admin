import { useEffect, useState } from 'react';
import { Check, Loader2, Minus, X } from 'lucide-react';
import { formatNaira, UNLIMITED, useSubscriptionStore } from '../../../stores/settings/subscription';

const formatLimit = (limit: number) => (limit === UNLIMITED ? 'Unlimited' : limit);

export default function ComparePlansModal({ onClose }: { onClose: () => void }) {
  const { comparison, capabilities, fetchComparison, fetchCapabilities } = useSubscriptionStore();
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    fetchComparison().then(() => setStatus('ready'), () => setStatus('failed'));
  }, [fetchComparison]);

  useEffect(() => {
    if (!capabilities.length) fetchCapabilities();
  }, [capabilities.length, fetchCapabilities]);

  // Capabilities on a plan that the capability list doesn't name still get a row
  const rows = [
    ...capabilities,
    ...[...new Set(comparison.flatMap((plan) => plan.capabilities))]
      .filter((value) => !capabilities.some((c) => c.value === value))
      .map((value) => ({ value, label: value })),
  ];

  const labelCell = 'p-3 text-gray-600 sticky left-0 bg-white min-w-[220px]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Compare Plans</h2>
            <p className="text-sm text-gray-500">Active plans, side by side.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto custom-scrollbar">
          {status === 'loading' && (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>
          )}
          {status === 'failed' && <p className="p-12 text-center text-sm text-gray-500">The comparison couldn't be loaded.</p>}
          {status === 'ready' && comparison.length === 0 && (
            <p className="p-12 text-center text-sm text-gray-500">There are no active plans to compare.</p>
          )}
          {status === 'ready' && comparison.length > 0 && (
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3 font-medium sticky left-0 bg-gray-50">Feature</th>
                  {comparison.map((plan) => (
                    <th key={plan.id} className="p-3 font-bold text-gray-900 text-center min-w-[120px]">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className={labelCell}>Yearly price</td>
                  {comparison.map((plan) => (
                    <td key={plan.id} className="p-3 text-center font-medium text-gray-900">
                      {plan.is_free_forever ? 'Free' : formatNaira(plan.price_per_year)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className={labelCell}>Max farmhouses</td>
                  {comparison.map((plan) => <td key={plan.id} className="p-3 text-center text-gray-900">{formatLimit(plan.max_farmhouses)}</td>)}
                </tr>
                <tr>
                  <td className={labelCell}>Max batches per farmhouse</td>
                  {comparison.map((plan) => <td key={plan.id} className="p-3 text-center text-gray-900">{formatLimit(plan.max_batches_per_farmhouse)}</td>)}
                </tr>
                {rows.map((capability) => (
                  <tr key={capability.value}>
                    <td className={labelCell}>{capability.label}</td>
                    {comparison.map((plan) => (
                      <td key={plan.id} className="p-3">
                        {plan.capabilities.includes(capability.value)
                          ? <Check size={16} className="mx-auto text-brand" aria-label="Included" />
                          : <Minus size={16} className="mx-auto text-gray-300" aria-label="Not included" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

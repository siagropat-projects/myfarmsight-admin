import { useState, useEffect, useMemo } from "react";
import {
  Download as DownloadIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts";
import Button from "../../ui/Button";
import { useVetStore } from "../../../stores/vets";
import { useParams } from "react-router";

import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

const formatTooltip: TooltipProps<ValueType, NameType>["formatter"] = (
  value,
) => {
  if (value == null) return ["₦0", "Earnings"];

  let numericValue: number;

  if (Array.isArray(value)) {
    const first = value[0];
    numericValue =
      typeof first === "number" ? first : parseFloat(String(first));
  } else if (typeof value === "number") {
    numericValue = value;
  } else {
    numericValue = parseFloat(value as string);
  }

  return [`₦${numericValue.toLocaleString()}`, "Earnings"];
};

export default function Earnings() {
  const { id: vetId } = useParams();
  const { 
    financeTransactions, 
    financeMeta, 
    fetchVetFinance, 
    loading: isLoading 
  } = useVetStore();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (vetId) {
      fetchVetFinance(vetId);
    }
  }, [vetId, fetchVetFinance]);

  // Transform financeTransactions into chart data
  const chartData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const data = months.map(name => ({ name, amount: 0 }));
    
    financeTransactions.forEach(tx => {
      const date = new Date(tx.created_at);
      if (date.getFullYear() === selectedYear && tx.entry_type === "credit") {
        const monthIndex = date.getMonth();
        data[monthIndex].amount += parseFloat(tx.amount);
      }
    });
    
    return data;
  }, [financeTransactions, selectedYear]);

  const totalEarnings = useMemo(() => {
    return financeTransactions
      .filter(tx => tx.entry_type === "credit")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  }, [financeTransactions]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handlePageChange = (newPage: number) => {
    if (vetId) {
      fetchVetFinance(vetId, { page: newPage });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Earnings Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center space-y-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Total earnings
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-[#1D2939]">
              ₦{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span className="text-xs text-gray-400 font-medium">( NGN )</span>
          </div>
          <p className="text-xs text-gray-400 italic">
            Historical data from account creation to Present
          </p>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm font-bold text-[#1D2939]">
              Earnings Analysis
            </p>
            <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-100">
              <button
                onClick={() =>
                  setSelectedYear(selectedYear - 1)
                }
                className="p-1 hover:bg-white hover:shadow-sm rounded transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold w-10 text-center">
                {selectedYear}
              </span>
              <button
                onClick={() =>
                  setSelectedYear(selectedYear + 1)
                }
                className="p-1 hover:bg-white hover:shadow-sm rounded transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-[200px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Loader2 className="animate-spin text-[#2D8A39]" size={24} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F9FAFB"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={formatTooltip}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={12}>
                    {chartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="#2D8A39"
                        fillOpacity={0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-[#1D2939]">
              Transaction History
            </h3>
            <p className="text-sm text-gray-500">
              View and manage all financial settlements
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="text-gray-600 border-gray-200 text-xs"
            >
              <Filter size={14} /> Filters
            </Button>
            <Button
              variant="secondary"
              className="text-gray-600 border-gray-200 text-xs"
            >
              <DownloadIcon size={14} /> Export
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    className="accent-[#2D8A39]"
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked ? financeTransactions.map((t) => t.id) : [],
                      )
                    }
                    checked={financeTransactions.length > 0 && selectedIds.length === financeTransactions.length}
                  />
                </th>
                <th className="p-4 font-medium uppercase text-[10px] tracking-wider">
                  Date
                </th>
                <th className="p-4 font-medium uppercase text-[10px] tracking-wider">
                  Amount
                </th>
                <th className="p-4 font-medium uppercase text-[10px] tracking-wider">
                  Type
                </th>
                <th className="p-4 font-medium uppercase text-[10px] tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="p-6">
                          <div className="h-4 bg-gray-50 animate-pulse rounded w-full" />
                        </td>
                      </tr>
                    ))
                : financeTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="accent-[#2D8A39]"
                          checked={selectedIds.includes(tx.id)}
                          onChange={() => toggleSelect(tx.id)}
                        />
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(tx.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className={`p-4 font-bold ${tx.entry_type === "credit" ? "text-[#2D8A39]" : "text-red-600"}`}>
                        {tx.entry_type === "credit" ? "+" : "-"} ₦{parseFloat(tx.amount).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit ${
                            tx.entry_type === "credit"
                              ? "bg-green-50 text-[#2D8A39]"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              tx.entry_type === "credit"
                                ? "bg-[#2D8A39]"
                                : "bg-red-600"
                            }`}
                          />
                          {tx.entry_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 italic">
                        {tx.source}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* Pagination */}
          {!isLoading && financeTransactions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
              <span>Showing {financeTransactions.length} of {financeMeta.total} records</span>
              <div className="flex gap-2">
                <button
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={financeMeta.page === 1}
                  onClick={() => handlePageChange(financeMeta.page - 1)}
                >
                  <ChevronLeft size={14} />
                </button>
                <button className="h-8 w-8 rounded-lg bg-green-50 border border-[#2D8A39] text-[#2D8A39] font-bold">
                  {financeMeta.page}
                </button>
                <button 
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={financeTransactions.length < 10}
                  onClick={() => handlePageChange(financeMeta.page + 1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

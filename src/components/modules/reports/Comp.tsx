import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { Loader2 } from "lucide-react";

type Period = "quarter" | "biannual" | "annual";

interface CardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
  percentage?: number;
  isPrimary?: boolean;
  isLoading?: boolean;
}

export const ReportCard = ({
  label,
  value,
  trend,
  percentage,
  isPrimary,
  isLoading,
}: CardProps) => {
  if (isLoading) {
    return (
      <div className={`p-6 rounded-xl border animate-pulse ${isPrimary ? "bg-brand/20 border-brand/10" : "bg-white border-gray-100"}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    );
  }
  const isUp = trend === "up";
  const isDown = trend === "down";
  const trendColor = isUp ? "text-green-500" : isDown ? "text-red-500" : "text-gray-400";
  const trendIcon = isUp ? "↗" : isDown ? "↘" : "→";

  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-md ${
        isPrimary ? "bg-brand text-white border-brand shadow-brand/10" : "bg-white text-gray-800 border-gray-100"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className={`text-sm font-medium ${isPrimary ? "text-white/80" : "text-gray-500"}`}>{label}</p>
        <span className={`text-lg ${isPrimary ? "text-white" : trendColor}`}>{trendIcon}</span>
      </div>
      <h3 className="text-3xl font-bold tracking-tight">{formattedValue}</h3>
      {trend && (
        <p className={`text-xs mt-3 flex items-center gap-1.5 ${isPrimary ? "text-white/80" : "text-gray-500"}`}>
          <span
            className={`font-bold px-1.5 py-0.5 rounded-md ${
              isPrimary 
                ? "bg-white/20 text-white" 
                : isUp ? "bg-green-50 text-green-600" : isDown ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"
            }`}
          >
            {trend === "stable" ? "0%" : `${isUp ? "+" : ""}${percentage}%`}
          </span>{" "}
          from last period
        </p>
      )}
    </div>
  );
};

interface ChartSectionProps {
  title: string;
  data: { name: string; value: number }[];
  currentPeriod: Period;
  onPeriodChange: (period: Period) => void;
  isLoading?: boolean;
}

export const ChartSection = ({
  title,
  data,
  currentPeriod,
  onPeriodChange,
  isLoading,
}: ChartSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 relative overflow-hidden transition-all duration-300">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">Overview for {currentPeriod} period</p>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
          {(["quarter", "biannual", "annual"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              disabled={isLoading}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                currentPeriod === p
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white"
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {p === "biannual" ? "Bi-Annual" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        {!data || data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <div className="p-3 bg-white rounded-full border border-gray-100 shadow-sm">
              <BarChart width={24} height={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium">No data available for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 500 }}
              />
              <Tooltip 
                cursor={{ fill: "rgba(45, 138, 57, 0.05)", radius: 4 }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #f3f4f6', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                barSize={data?.length > 6 ? 16 : 48}
              >
                {data?.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    className="fill-brand transition-all duration-300 hover:fill-brand/80" 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Users,
  Stethoscope,
  MoreVertical,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { useDashboardStore, type Period, type TrendInfo } from "../stores/dashboard";
import { useNavigate } from "react-router";

const StatCard = ({ label, summary, icon: Icon, color, isLoading }: { label: string, summary?: TrendInfo | null, icon: any, color: string, isLoading: boolean }) => {
  if (isLoading || !summary) {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="p-5 bg-gray-100 rounded-lg w-10 h-10" />
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
        <div className="h-8 w-16 bg-gray-100 rounded" />
      </div>
    );
  }

  const { value, trend, percentage } = summary;
  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          isUp ? "text-green-600 bg-green-50" : 
          isDown ? "text-red-600 bg-red-50" : 
          "text-gray-500 bg-gray-50"
        }`}>
          {isUp ? <ArrowUpRight size={14} /> : isDown ? <ArrowDownRight size={14} /> : <Minus size={14} />}
          <span>{percentage}%</span>
        </div>
      </div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <div className="flex justify-between items-end mt-1">
        <h3 className="text-2xl font-bold text-gray-800">{value?.toLocaleString()}</h3>
        <p className="text-[10px] text-gray-400">Update: Just now</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { 
    summary, 
    activities, 
    topFarmers, 
    chartData, 
    currentPeriod, 
    isLoading, 
    setPeriod, 
    fetchAll 
  } = useDashboardStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const viewModes: { label: string, value: Period }[] = [
    { label: "Year", value: "year" },
    { label: "Month", value: "month" },
    { label: "Day", value: "day" },
  ];

  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen text-gray-800">
      <main className="flex-1 overflow-y-auto">

        <div className="mx-auto space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <StatCard
              label="Total Registered Farmers"
              summary={summary?.totalFarmers}
              isLoading={isLoading}
              icon={Users}
              color="text-brand"
            />
            <StatCard
              label="Total Active Farmers"
              summary={summary?.activeFarmers}
              isLoading={isLoading}
              icon={Users}
              color="text-orange-500"
            />
            <StatCard
              label="Total Registered Vets"
              summary={summary?.totalVets}
              isLoading={isLoading}
              icon={Stethoscope}
              color="text-blue-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Activity Overview</h3>
                <button
                  onClick={() => navigate("/activity-log")}
                  className="text-xs font-medium text-gray-400 border px-3 py-1 rounded-md hover:bg-gray-50"
                >
                  View all
                </button>
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {activities.length === 0 && !isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 italic text-sm">
                    No recent activities
                  </div>
                ) : (
                  activities.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start group">
                      <div className="mt-1 p-2 rounded-lg bg-gray-50 text-brand group-hover:bg-brand group-hover:text-white transition-colors shrink-0">
                        <Users size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">
                          {item.action}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                          {new Date(item.created_at)?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && activities.length === 0 && (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-100 rounded w-1/2" />
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                  <Loader2 className="w-8 h-8 text-brand animate-spin" />
                </div>
              )}
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Revenue Performance</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subscriptions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Commissions</span>
                    </div>
                  </div>
                </div>
                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                  {viewModes.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setPeriod(m.value)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentPeriod === m.value ? "bg-brand text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full">
                {chartData.length === 0 && !isLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">
                    No data available for this period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 10 }}
                        tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(45, 138, 57, 0.05)", radius: 4 }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                          fontWeight: 600
                        }}
                        formatter={(value) => value != null ? [`₦${value?.toLocaleString()}`] : ["₦0"]}
                      />
                      <Bar
                        dataKey="subscriptions"
                        name="Subscriptions"
                        stackId="a"
                        fill="#2D8A39"
                        radius={[0, 0, 0, 0]}
                        barSize={currentPeriod === "day" ? 40 : 30}
                      />
                      <Bar
                        dataKey="commissions"
                        name="Commissions"
                        stackId="a"
                        fill="#FB923C"
                        radius={[4, 4, 0, 0]}
                        barSize={currentPeriod === "day" ? 40 : 30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
            {isLoading && topFarmers.length === 0 && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
              </div>
            )}
            <div className="p-6 flex justify-between items-center border-b border-gray-50">
              <div>
                <h3 className="font-bold text-lg">Top farmers</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Recent and high-performing registered farmers
                </p>
              </div>
              <button
                onClick={() => navigate("/farmers")}
                className="text-xs font-bold text-gray-400 border px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-brand focus:ring-brand"
                      />
                    </th>
                    <th className="px-6 py-4 font-bold">Farmer Name</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold text-center">
                      Phone
                    </th>
                    <th className="px-6 py-4 font-bold">Date Joined</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topFarmers.length === 0 && !isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                        No farmers found
                      </td>
                    </tr>
                  ) : (
                    topFarmers.map((farmer, idx) => (
                      <tr
                        key={farmer.id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"} hover:bg-gray-50 transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brand focus:ring-brand"
                          />
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {farmer.full_name}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{farmer.email}</td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {farmer.phone}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(farmer.created_at)?.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit ${
                              farmer.is_active && !farmer.is_suspended 
                                ? "bg-green-50 text-green-600 border border-green-100" 
                                : farmer.is_suspended 
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-gray-50 text-gray-500 border border-gray-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                farmer.is_active && !farmer.is_suspended 
                                  ? "bg-green-500" 
                                  : farmer.is_suspended 
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {farmer.is_suspended ? "Suspended" : farmer.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 cursor-pointer hover:text-gray-600">
                          <MoreVertical size={16} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

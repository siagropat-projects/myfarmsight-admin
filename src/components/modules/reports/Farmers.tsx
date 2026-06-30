import { useEffect, useState } from "react";
import { ChartSection, ReportCard } from "./Comp";
import { useReportStore } from "../../../stores/reports";

export default function Farmers() {
  const { farmers, isLoading, fetchFarmerReports } = useReportStore();
  const [period, setPeriod] = useState<"quarter" | "biannual" | "annual">("annual");

  useEffect(() => {
    fetchFarmerReports(period);
  }, [period, fetchFarmerReports]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {farmers?.summary ? (
          farmers.summary.map((stat, i) => (
            <ReportCard 
              key={i} 
              {...stat} 
              isPrimary={i === 0} 
              isLoading={isLoading} 
            />
          ))
        ) : (
          [...Array(3)].map((_, i) => (
            <ReportCard key={i} label="" value="" isLoading={true} isPrimary={i === 0} />
          ))
        )}
      </div>
      <ChartSection 
        title="Registration Volume" 
        data={farmers?.charts || []} 
        currentPeriod={period}
        onPeriodChange={setPeriod}
        isLoading={isLoading}
      />
    </div>
  );
}
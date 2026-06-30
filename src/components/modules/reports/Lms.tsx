import { useEffect, useState } from "react";
import { ChartSection, ReportCard } from "./Comp";
import { useReportStore } from "../../../stores/reports";

export default function Lms() {
  const { lms, isLoading, fetchLmsReports } = useReportStore();
  const [period, setPeriod] = useState<"quarter" | "biannual" | "annual">("annual");

  useEffect(() => {
    fetchLmsReports(period);
  }, [period, fetchLmsReports]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lms?.summary ? (
          lms.summary.map((stat, i) => (
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
        title="Learning Engagement" 
        data={lms?.charts || []} 
        currentPeriod={period}
        onPeriodChange={setPeriod}
        isLoading={isLoading}
      />
    </div>
  );
}
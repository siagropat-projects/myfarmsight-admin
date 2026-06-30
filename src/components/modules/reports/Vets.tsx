import { useEffect, useState } from "react";
import { ChartSection, ReportCard } from "./Comp";
import { useReportStore } from "../../../stores/reports";

export default function Vets() {
  const { vets, isLoading, fetchVetReports } = useReportStore();
  const [period, setPeriod] = useState<"quarter" | "biannual" | "annual">("annual");

  useEffect(() => {
    fetchVetReports(period);
  }, [period, fetchVetReports]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {vets?.summary ? (
          vets.summary.map((stat, i) => (
            <ReportCard 
              key={i} 
              {...stat} 
              isPrimary={i === 0} 
              isLoading={isLoading} 
            />
          ))
        ) : (
          [...Array(4)].map((_, i) => (
            <ReportCard key={i} label="" value="" isLoading={true} isPrimary={i === 0} />
          ))
        )}
      </div>
      <ChartSection 
        title="Ticket Volume" 
        data={vets?.charts || []} 
        currentPeriod={period}
        onPeriodChange={setPeriod}
        isLoading={isLoading}
      />
    </div>
  );
}
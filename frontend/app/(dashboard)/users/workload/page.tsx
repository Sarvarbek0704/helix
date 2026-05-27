"use client";
import { BarChart2, TrendingUp, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useGetWorkloadQuery } from "@/store/api/analyticsApi";

export default function WorkloadPage() {
  const { data = [], isLoading } = useGetWorkloadQuery();

  const sortedData = [...data].sort((a, b) => b.totalAppointments - a.totalAppointments);

  const totals = data.reduce(
    (acc, d) => ({
      totalAppts: acc.totalAppts + (d.totalAppointments || 0),
      todayAppts: acc.todayAppts + (d.todayCount || 0),
      monthAppts: acc.monthAppts + (d.monthCount || 0),
      pendingAppts: acc.pendingAppts + (d.pendingCount || 0),
    }),
    { totalAppts: 0, todayAppts: 0, monthAppts: 0, pendingAppts: 0 }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-helix-600" /> Doctor Workload
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor appointment load across all physicians</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Appointments", value: totals.totalAppts, icon: TrendingUp, color: "text-helix-600" },
          { label: "Today's Appointments", value: totals.todayAppts, icon: Clock, color: "text-amber-600" },
          { label: "This Month", value: totals.monthAppts, icon: Users, color: "text-health-600" },
          { label: "Pending Review", value: totals.pendingAppts, icon: AlertCircle, color: "text-rose-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{isLoading ? "—" : stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Workload table */}
      <div className="bg-card border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">Doctor Workload Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Doctor</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Department</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Today</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">This Month</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Total</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Pending</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Rating</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Load</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${40 + Math.random() * 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">No doctors found</td>
                </tr>
              ) : (
                sortedData.map((doc: any) => {
                  const maxAppts = Math.max(...sortedData.map((d: any) => d.totalAppointments), 1);
                  const loadPct = Math.min((doc.totalAppointments / maxAppts) * 100, 100);
                  const loadColor = loadPct > 70 ? "bg-rose-500" : loadPct > 40 ? "bg-amber-500" : "bg-health-500";

                  return (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium">
                            Dr. {doc.doctor?.firstName} {doc.doctor?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{doc.doctor?.specialization || "—"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{doc.department || "—"}</td>
                      <td className="px-5 py-3 text-right font-medium">{doc.todayCount}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{doc.monthCount}</td>
                      <td className="px-5 py-3 text-right font-bold">{doc.totalAppointments}</td>
                      <td className="px-5 py-3 text-right">
                        {doc.pendingCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            {doc.pendingCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-amber-500">★</span>
                          <span className="font-medium">{Number(doc.rating || 0).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${loadColor}`} style={{ width: `${loadPct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(loadPct)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

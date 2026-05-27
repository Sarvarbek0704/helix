"use client";
import { Users, Stethoscope, Calendar, DollarSign, TrendingUp, Activity, UserCheck } from "lucide-react";
import { useGetAdminDashboardQuery } from "@/store/api/analyticsApi";
import { StatCard } from "@/components/ui/StatCard";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { format } from "date-fns";

export function AdminDashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { data, isLoading } = useGetAdminDashboardQuery();

  const stats = [
    { label: "Total Patients", value: data?.totalPatients ?? "—", icon: Users, color: "helix" as const, change: "+12% this month" },
    { label: "Active Doctors", value: data?.totalDoctors ?? "—", icon: Stethoscope, color: "health" as const, change: "+3 new this week" },
    { label: "Today's Appointments", value: data?.todayAppointments ?? "—", icon: Calendar, color: "amber" as const },
    { label: "Monthly Revenue", value: data?.monthlyRevenue ? `$${data.monthlyRevenue.toLocaleString()}` : "—", icon: DollarSign, color: "purple" as const, change: "+8.2% vs last month" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Good {greeting()}, {user?.firstName} 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} loading={isLoading} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-helix-600" /> Recent Activity</h3>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {(data?.recentAppointments || []).slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{a.patientName || "Patient"}</p>
                    <p className="text-xs text-muted-foreground">{a.reason || "Appointment"}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
              {!data?.recentAppointments?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-helix-600" /> Department Stats</h3>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.departmentStats || []).slice(0, 5).map((d: any) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-muted-foreground">{d.appointments}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-helix-500 rounded-full" style={{ width: `${Math.min((d.appointments / (data?.todayAppointments || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {!data?.departmentStats?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">No department data</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-card p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><UserCheck className="w-4 h-4 text-helix-600" /> User Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Patients", value: data?.totalPatients, color: "bg-helix-500" },
            { label: "Doctors", value: data?.totalDoctors, color: "bg-health-500" },
            { label: "Nurses", value: data?.totalNurses, color: "bg-amber-500" },
            { label: "Admins", value: data?.totalAdmins, color: "bg-purple-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <div>
                <p className="text-xl font-bold">{isLoading ? "—" : (item.value ?? "—")}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-health-100 text-health-700",
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-helix-100 text-helix-700",
    cancelled: "bg-destructive/10 text-destructive",
    in_progress: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

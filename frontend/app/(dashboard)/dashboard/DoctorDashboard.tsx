"use client";
import { Calendar, Users, ClipboardList, Clock } from "lucide-react";
import { useGetDoctorDashboardQuery } from "@/store/api/analyticsApi";
import { useGetDoctorAppointmentsQuery } from "@/store/api/appointmentsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Link from "next/link";
import { format } from "date-fns";
import { StatCard } from "@/components/ui/StatCard";

export function DoctorDashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { data: dash, isLoading } = useGetDoctorDashboardQuery();
  const { data: appts } = useGetDoctorAppointmentsQuery({ limit: 5, status: "confirmed" });
  const today = format(new Date(), "yyyy-MM-dd");

  const stats = [
    { label: "Today's Appointments", value: dash?.todayAppointments ?? "—", icon: Calendar, color: "helix" as const },
    { label: "Total Patients", value: dash?.totalPatients ?? "—", icon: Users, color: "health" as const },
    { label: "Pending", value: dash?.pendingAppointments ?? "—", icon: Clock, color: "amber" as const },
    { label: "Completed Today", value: dash?.completedToday ?? "—", icon: ClipboardList, color: "purple" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Good {greeting()}, Dr. {user?.lastName} 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} loading={isLoading} />)}
      </div>

      <div className="bg-card rounded-xl border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-helix-600" /> Today&apos;s Schedule</h3>
          <Link href="/appointments" className="text-xs text-helix-600 hover:underline">View all</Link>
        </div>
        {appts?.data?.length ? (
          <div className="space-y-2">
            {appts.data.map((a: any) => (
              <Link key={a.id} href={`/appointments/${a.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition group">
                <div className="w-14 text-center shrink-0">
                  <p className="text-sm font-semibold text-helix-600">{a.appointmentTime?.slice(0, 5) || "—"}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.patient?.firstName ? `${a.patient.firstName} ${a.patient.lastName}` : "Patient"}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.reason}</p>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No appointments for today</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border shadow-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-helix-600" /> Recent Patients</h3>
          {(dash?.recentPatients || []).length ? (
            <div className="space-y-2">
              {dash.recentPatients.slice(0, 5).map((p: any) => (
                <Link key={p.id} href={`/patients/${p.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition">
                  <div className="w-8 h-8 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-xs font-bold shrink-0">
                    {p.firstName?.[0]}{p.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted-foreground">{p.patientNumber}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No recent patients</p>
          )}
        </div>

        <div className="bg-card rounded-xl border shadow-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-helix-600" /> Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: "/appointments", label: "View all appointments", desc: "Manage your schedule" },
              { href: "/patients", label: "Browse patients", desc: "View patient records" },
              { href: "/medical-records", label: "Medical records", desc: "Create & review records" },
              { href: "/prescriptions", label: "Prescriptions", desc: "Issue prescriptions" },
              { href: "/schedule", label: "My schedule", desc: "Set availability" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition group">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">›</span>
              </Link>
            ))}
          </div>
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
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${map[status] || "bg-muted text-muted-foreground"}`}>
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

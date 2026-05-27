"use client";
import { Activity, Users, Calendar, ClipboardList, Bell } from "lucide-react";
import { useGetAllPatientsQuery } from "@/store/api/patientsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Link from "next/link";
import { format } from "date-fns";
import { StatCard } from "@/components/ui/StatCard";

export function NurseDashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { data: patientsData, isLoading } = useGetAllPatientsQuery({ limit: 5 });

  const recentPatients = patientsData?.data || [];

  const stats = [
    { label: "Total Patients", value: patientsData?.total ?? "—", icon: Users, color: "helix" as const },
    { label: "Today", value: format(new Date(), "MMM d"), icon: Calendar, color: "amber" as const },
    { label: "Vitals Ready", value: "Record", icon: Activity, color: "health" as const },
    { label: "Actions", value: "4", icon: ClipboardList, color: "purple" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Good {greeting()}, {user?.firstName} 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} loading={isLoading} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-helix-600" /> Recent Patients</h3>
            <Link href="/patients" className="text-xs text-helix-600 hover:underline">View all</Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : recentPatients.length ? (
            <div className="space-y-2">
              {recentPatients.map((p: any) => (
                <Link key={p.id} href={`/patients/${p.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition">
                  <div className="w-8 h-8 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-xs font-bold shrink-0">
                    {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.user?.firstName} {p.user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{p.patientNumber}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No patients found</p>
          )}
        </div>

        <div className="bg-card rounded-xl border shadow-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-helix-600" /> Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: "/vitals", label: "Record vitals", desc: "Measure and log patient vitals", icon: Activity },
              { href: "/patients", label: "Browse patients", desc: "View all registered patients", icon: Users },
              { href: "/appointments", label: "Appointments", desc: "Check today's schedule", icon: Calendar },
              { href: "/notifications", label: "Notifications", desc: "View alerts and messages", icon: Bell },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition group">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

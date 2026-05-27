"use client";
import { FlaskConical, Clock, CheckCircle, ClipboardList, Bell, Settings } from "lucide-react";
import { useGetAllOrdersQuery } from "@/store/api/labApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Link from "next/link";
import { format } from "date-fns";
import { StatCard } from "@/components/ui/StatCard";

export function LabTechDashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { data: pendingData, isLoading } = useGetAllOrdersQuery({ status: "pending", limit: 50 });
  const { data: completedData } = useGetAllOrdersQuery({ status: "completed", limit: 1 });
  const { data: allData } = useGetAllOrdersQuery({ limit: 1 });

  const pendingOrders = pendingData?.data || [];

  const stats = [
    { label: "Pending Orders", value: pendingData?.total ?? "—", icon: Clock, color: "amber" as const },
    { label: "Completed", value: completedData?.total ?? "—", icon: CheckCircle, color: "health" as const },
    { label: "Total Orders", value: allData?.total ?? "—", icon: FlaskConical, color: "helix" as const },
    { label: "Today", value: format(new Date(), "MMM d"), icon: ClipboardList, color: "purple" as const },
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

      <div className="bg-card rounded-xl border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" /> Pending Lab Orders
          </h3>
          <Link href="/lab" className="text-xs text-helix-600 hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : pendingOrders.length ? (
          <div className="space-y-2">
            {pendingOrders.slice(0, 8).map((o: any) => (
              <div key={o.id} className="flex items-center gap-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <FlaskConical className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{(o.tests || []).join(", ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.patient?.firstName} {o.patient?.lastName} · {o.createdAt ? format(new Date(o.createdAt), "MMM d, h:mm a") : "—"}
                  </p>
                </div>
                {o.priority === "urgent" && (
                  <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full font-medium shrink-0">Urgent</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <CheckCircle className="w-10 h-10 text-health-500/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pending orders — all clear!</p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border shadow-card p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-helix-600" /> Quick Actions</h3>
        <div className="space-y-2">
          {[
            { href: "/lab", label: "All lab orders", desc: "View and process orders", icon: FlaskConical },
            { href: "/notifications", label: "Notifications", desc: "View alerts and messages", icon: Bell },
            { href: "/settings", label: "Settings", desc: "Update your profile", icon: Settings },
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
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

"use client";
import { useSelector } from "react-redux";
import { useGetMyBillsQuery, useGetAllQuery, useGetSummaryQuery } from "@/store/api/billingApi";
import { CreditCard, DollarSign, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import type { RootState } from "@/store";
import { useState } from "react";

export default function BillingPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const [status, setStatus] = useState("all");

  const myBills = useGetMyBillsQuery({ status: status === "all" ? undefined : status }, { skip: role !== "patient" });
  const allBills = useGetAllQuery({ status: status === "all" ? undefined : status }, { skip: role !== "admin" });
  const { data: summary } = useGetSummaryQuery(undefined, { skip: role !== "admin" });

  const bills = role === "patient" ? (myBills.data?.data || []) : (allBills.data?.data || []);
  const isLoading = role === "patient" ? myBills.isLoading : allBills.isLoading;

  return (
    <div className="space-y-5 animate-fade-in">
      {role === "admin" && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: `$${summary.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: "text-health-600" },
            { label: "Pending", value: `$${summary.pendingAmount?.toLocaleString() || 0}`, icon: Clock, color: "text-amber-600" },
            { label: "This Month", value: `$${summary.monthlyRevenue?.toLocaleString() || 0}`, icon: TrendingUp, color: "text-helix-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        {["all", "pending", "partially_paid", "paid", "overdue"].map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${status === s ? "bg-helix-600 text-white" : "bg-muted text-muted-foreground"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : bills.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No bills found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((b: any) => (
            <div key={b.id} className="bg-card rounded-xl border shadow-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Bill #{b.id?.slice(-6).toUpperCase()}</p>
                  {role === "admin" && <p className="text-xs text-muted-foreground">{b.patient?.firstName} {b.patient?.lastName}</p>}
                  <p className="text-xs text-muted-foreground">{b.createdAt ? format(new Date(b.createdAt), "MMM d, yyyy") : "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${b.totalAmount?.toLocaleString()}</p>
                  <StatusBadge status={b.status} />
                </div>
              </div>
              {b.dueDate && (
                <p className="text-xs text-muted-foreground mt-2">Due: {format(new Date(b.dueDate), "MMM d, yyyy")}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-health-100 text-health-700",
    pending: "bg-amber-100 text-amber-700",
    partially_paid: "bg-helix-100 text-helix-700",
    overdue: "bg-destructive/10 text-destructive",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>{status?.replace("_", " ")}</span>;
}

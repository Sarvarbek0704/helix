"use client";
import { useSelector } from "react-redux";
import { useGetMyOrdersQuery, useGetMyResultsQuery, useGetAllOrdersQuery } from "@/store/api/labApi";
import { FlaskConical, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { RootState } from "@/store";
import { useState } from "react";

export default function LabPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const [tab, setTab] = useState<"orders" | "results">("orders");

  const myOrders = useGetMyOrdersQuery({ limit: 20 }, { skip: role !== "patient" });
  const allOrders = useGetAllOrdersQuery({ limit: 20 }, { skip: role === "patient" });
  const myResults = useGetMyResultsQuery({ limit: 20 }, { skip: role !== "patient" });

  const orders = role === "patient" ? (myOrders.data?.data || []) : (allOrders.data?.data || []);
  const results = myResults.data?.data || [];
  const isLoading = role === "patient" ? myOrders.isLoading : allOrders.isLoading;

  return (
    <div className="space-y-5 animate-fade-in">
      {role === "patient" && (
        <div className="flex gap-1.5">
          {(["orders", "results"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${tab === t ? "bg-helix-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (tab === "orders" || role !== "patient") ? (
        orders.length === 0 ? (
          <div className="text-center py-16">
            <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No lab orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o: any) => (
              <div key={o.id} className="bg-card rounded-xl border shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">Order #{o.id?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(o.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(o.tests || []).map((test: string, i: number) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full">{test}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        results.length === 0 ? (
          <div className="text-center py-16">
            <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No lab results yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r: any) => (
              <div key={r.id} className="bg-card rounded-xl border shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">Result #{r.id?.slice(-6).toUpperCase()}</p>
                  <span className="text-xs text-health-600 font-medium">Available</span>
                </div>
                <div className="space-y-1">
                  {(r.results || []).map((item: any, i: number) => (
                    <div key={i} className="text-sm flex gap-2">
                      <span className="font-medium">{item.test}:</span>
                      <span className="text-muted-foreground">{item.value} {item.unit}</span>
                      {item.flag && <span className="text-destructive text-xs font-medium">{item.flag}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-helix-100 text-helix-700",
    completed: "bg-health-100 text-health-700",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
}

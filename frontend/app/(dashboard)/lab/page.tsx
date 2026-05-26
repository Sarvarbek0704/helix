"use client";
import { useSelector } from "react-redux";
import { useGetMyOrdersQuery, useGetAllOrdersQuery } from "@/store/api/labApi";
import { FlaskConical } from "lucide-react";
import { format } from "date-fns";
import type { RootState } from "@/store";
import { useState } from "react";

export default function LabPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const [tab, setTab] = useState<"orders" | "results">("orders");

  const myOrdersQuery = useGetMyOrdersQuery({ limit: 50 }, { skip: role !== "patient" });
  const allOrdersQuery = useGetAllOrdersQuery({ limit: 50 }, { skip: role === "patient" });

  const orders: any[] = role === "patient" ? (myOrdersQuery.data?.data || []) : (allOrdersQuery.data?.data || []);
  const isLoading = role === "patient" ? myOrdersQuery.isLoading : allOrdersQuery.isLoading;

  // Results are embedded inside each order
  const completedOrdersWithResults = orders.filter((o) => o.results?.length > 0);

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
                    <p className="font-semibold text-sm">
                      Order #{o.orderNumber || o.id?.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(o.createdAt), "MMM d, yyyy")}
                      {o.priority && ` · ${o.priority.toUpperCase()}`}
                    </p>
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
        completedOrdersWithResults.length === 0 ? (
          <div className="text-center py-16">
            <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No lab results yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedOrdersWithResults.map((o: any) => (
              <div key={o.id} className="bg-card rounded-xl border shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">Order #{o.orderNumber || o.id?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(o.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <span className="text-xs text-health-600 font-medium">Results Available</span>
                </div>
                <div className="space-y-1.5">
                  {(o.results || []).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                      <span className="font-medium w-40 shrink-0">{item.testName}</span>
                      <span className="text-muted-foreground">{item.value} {item.unit}</span>
                      {item.referenceRange && <span className="text-xs text-muted-foreground">({item.referenceRange})</span>}
                      {item.flag && (
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${item.flag === "CRITICAL" ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-700"}`}>
                          {item.flag}
                        </span>
                      )}
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
    ordered: "bg-amber-100 text-amber-700",
    sample_collected: "bg-blue-100 text-blue-700",
    processing: "bg-helix-100 text-helix-700",
    completed: "bg-health-100 text-health-700",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

"use client";
import { useSelector } from "react-redux";
import { useGetMyOrdersQuery, useGetAllOrdersQuery, useUpdateOrderStatusMutation, useUploadResultsMutation } from "@/store/api/labApi";
import { FlaskConical, ChevronDown, Plus, X, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { RootState } from "@/store";
import { useState } from "react";

const STATUS_FLOW = ["ordered", "sample_collected", "processing", "completed", "cancelled"];
const STATUS_LABELS: Record<string, string> = {
  ordered: "Ordered",
  sample_collected: "Sample Collected",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function LabPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const [tab, setTab] = useState<"orders" | "results">("orders");
  const [uploadOrderId, setUploadOrderId] = useState<string | null>(null);
  const [results, setResults] = useState([{ testName: "", value: "", unit: "", referenceRange: "", flag: "" }]);

  const myOrdersQuery = useGetMyOrdersQuery({ limit: 50 }, { skip: role !== "patient" });
  const allOrdersQuery = useGetAllOrdersQuery({ limit: 100 }, { skip: role === "patient" });

  const [updateStatus] = useUpdateOrderStatusMutation();
  const [uploadResults, { isLoading: uploading }] = useUploadResultsMutation();

  const orders: any[] = role === "patient" ? (myOrdersQuery.data?.data || []) : (allOrdersQuery.data?.data || []);
  const isLoading = role === "patient" ? myOrdersQuery.isLoading : allOrdersQuery.isLoading;
  const completedOrdersWithResults = orders.filter((o) => o.results?.length > 0);

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Status updated to ${STATUS_LABELS[status] || status}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleUploadResults(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadOrderId) return;
    const validResults = results.filter((r) => r.testName && r.value);
    if (!validResults.length) { toast.error("Add at least one result"); return; }
    try {
      await uploadResults({ orderId: uploadOrderId, results: validResults }).unwrap();
      toast.success("Results uploaded successfully");
      setUploadOrderId(null);
      setResults([{ testName: "", value: "", unit: "", referenceRange: "", flag: "" }]);
    } catch {
      toast.error("Failed to upload results");
    }
  }

  function addResultRow() {
    setResults([...results, { testName: "", value: "", unit: "", referenceRange: "", flag: "" }]);
  }

  function removeResultRow(i: number) {
    setResults(results.filter((_, idx) => idx !== i));
  }

  function setResultField(i: number, key: string, value: string) {
    setResults(results.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  }

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
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">
                        Order #{o.orderNumber || o.id?.slice(-6).toUpperCase()}
                      </p>
                      {o.priority && o.priority !== "routine" && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${o.priority === "stat" ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-700"}`}>
                          {o.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(o.createdAt), "MMM d, yyyy")}
                      {(role === "admin" || role === "lab_tech" || role === "doctor") && o.patient &&
                        ` · ${o.patient.firstName} ${o.patient.lastName}`}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(o.tests || []).map((test: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full">{test}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={o.status} />
                    {role === "lab_tech" && o.status !== "cancelled" && o.status !== "completed" && (
                      <StatusDropdown
                        current={o.status}
                        onChange={(s) => handleStatusChange(o.id, s)}
                      />
                    )}
                  </div>
                </div>

                {role === "lab_tech" && o.status === "processing" && (
                  <button
                    onClick={() => { setUploadOrderId(o.id); setResults([{ testName: "", value: "", unit: "", referenceRange: "", flag: "" }]); }}
                    className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 bg-helix-600 text-white rounded-lg hover:bg-helix-700 transition">
                    <Upload className="w-3.5 h-3.5" /> Upload Results
                  </button>
                )}

                {o.results?.length > 0 && (
                  <div className="mt-3 border-t pt-3 space-y-1">
                    {o.results.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="font-medium w-36 shrink-0 truncate">{item.testName}</span>
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
                )}
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

      {uploadOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold">Upload Lab Results</h3>
              <button onClick={() => setUploadOrderId(null)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUploadResults} className="p-5 space-y-4">
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <input required value={r.testName} onChange={(e) => setResultField(i, "testName", e.target.value)}
                      placeholder="Test name *" className="col-span-3 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                    <input required value={r.value} onChange={(e) => setResultField(i, "value", e.target.value)}
                      placeholder="Value *" className="col-span-2 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                    <input value={r.unit} onChange={(e) => setResultField(i, "unit", e.target.value)}
                      placeholder="Unit" className="col-span-2 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                    <input value={r.referenceRange} onChange={(e) => setResultField(i, "referenceRange", e.target.value)}
                      placeholder="Ref. range" className="col-span-2 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                    <select value={r.flag} onChange={(e) => setResultField(i, "flag", e.target.value)}
                      className="col-span-2 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                      <option value="">Normal</option>
                      <option value="LOW">LOW</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                    <button type="button" onClick={() => removeResultRow(i)} disabled={results.length === 1}
                      className="col-span-1 h-9 flex items-center justify-center text-muted-foreground hover:text-destructive disabled:opacity-30 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addResultRow}
                className="flex items-center gap-1.5 text-sm text-helix-600 hover:underline">
                <Plus className="w-4 h-4" /> Add another test
              </button>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setUploadOrderId(null)}
                  className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">
                  Cancel
                </button>
                <button type="submit" disabled={uploading}
                  className="flex-1 h-10 rounded-lg bg-helix-600 text-white text-sm font-semibold hover:bg-helix-700 disabled:opacity-60 transition">
                  {uploading ? "Uploading..." : "Upload Results"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function StatusDropdown({ current, onChange }: { current: string; onChange: (s: string) => void }) {
  const nextStatuses = STATUS_FLOW.filter((s) => STATUS_FLOW.indexOf(s) > STATUS_FLOW.indexOf(current) && s !== "cancelled");
  return (
    <div className="relative group">
      <button type="button" className="flex items-center gap-1 text-xs px-2.5 py-1.5 border rounded-lg hover:bg-muted transition">
        Update <ChevronDown className="w-3 h-3" />
      </button>
      <div className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg z-10 min-w-36 hidden group-hover:block">
        {nextStatuses.map((s) => (
          <button key={s} type="button" onClick={() => onChange(s)}
            className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition capitalize">
            {STATUS_LABELS[s]}
          </button>
        ))}
        <button type="button" onClick={() => onChange("cancelled")}
          className="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/5 transition">
          Cancel Order
        </button>
      </div>
    </div>
  );
}

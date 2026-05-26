"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyClaimsQuery, useGetAllClaimsQuery, useGetPlansQuery, useSubmitClaimMutation, useProcessClaimMutation } from "@/store/api/insuranceApi";
import { Shield, Plus, X, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { RootState } from "@/store";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-health-100 text-health-700",
  rejected: "bg-destructive/10 text-destructive",
  processing: "bg-helix-100 text-helix-700",
};

export default function InsurancePage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const isAdmin = role === "admin";

  const myClaimsQuery = useGetMyClaimsQuery({ limit: 50 }, { skip: isAdmin });
  const allClaimsQuery = useGetAllClaimsQuery({ limit: 100 }, { skip: !isAdmin });
  const { data: plansData } = useGetPlansQuery({ limit: 100 });

  const [submitClaim, { isLoading: submitting }] = useSubmitClaimMutation();
  const [processClaim] = useProcessClaimMutation();

  const claims = isAdmin ? (allClaimsQuery.data?.data || []) : (myClaimsQuery.data?.data || []);
  const isLoading = isAdmin ? allClaimsQuery.isLoading : myClaimsQuery.isLoading;
  const plans = plansData?.data || plansData || [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ billId: "", insurancePlanId: "", memberId: "", notes: "" });
  const [processing, setProcessing] = useState<string | null>(null);
  const [processForm, setProcessForm] = useState({ status: "approved", approvedAmount: "", notes: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submitClaim(form).unwrap();
      toast.success("Insurance claim submitted");
      setShowForm(false);
      setForm({ billId: "", insurancePlanId: "", memberId: "", notes: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit claim");
    }
  }

  async function handleProcess(e: React.FormEvent) {
    e.preventDefault();
    if (!processing) return;
    try {
      await processClaim({
        id: processing,
        status: processForm.status,
        approvedAmount: processForm.approvedAmount ? Number(processForm.approvedAmount) : undefined,
        notes: processForm.notes || undefined,
      }).unwrap();
      toast.success(`Claim ${processForm.status}`);
      setProcessing(null);
    } catch {
      toast.error("Failed to process claim");
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{isAdmin ? "All insurance claims" : "Your insurance claims"}</p>
        {!isAdmin && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus className="w-4 h-4" /> Submit Claim
          </button>
        )}
      </div>

      {!isAdmin && plans.length > 0 && (
        <div className="bg-helix-50 dark:bg-helix-900/20 rounded-xl border border-helix-200 dark:border-helix-800 p-4">
          <p className="text-sm font-semibold text-helix-800 dark:text-helix-200 mb-2">Available Insurance Plans</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plans.slice(0, 4).map((plan: any) => (
              <div key={plan.id} className="text-sm bg-white dark:bg-helix-900/30 rounded-lg p-3 border">
                <p className="font-medium">{plan.name}</p>
                <p className="text-muted-foreground text-xs">{plan.coveragePercent}% coverage{plan.maxCoverageAmount ? ` · up to $${plan.maxCoverageAmount.toLocaleString()}` : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : claims.length === 0 ? (
        <div className="text-center py-16">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No insurance claims found</p>
          {!isAdmin && <p className="text-xs text-muted-foreground mt-1">Submit a claim to get reimbursed for medical expenses</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((c: any) => (
            <div key={c.id} className="bg-card rounded-xl border shadow-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">Claim #{c.id?.slice(-6).toUpperCase()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[c.status] || "bg-muted text-muted-foreground"}`}>
                      {c.status}
                    </span>
                  </div>
                  {isAdmin && c.patient && (
                    <p className="text-xs text-muted-foreground mt-0.5">{c.patient.firstName} {c.patient.lastName}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.insurancePlan?.name || "—"} · {c.createdAt ? format(new Date(c.createdAt), "MMM d, yyyy") : "—"}
                  </p>
                  {c.approvedAmount && (
                    <p className="text-sm font-medium text-health-700 mt-1">Approved: ${c.approvedAmount.toLocaleString()}</p>
                  )}
                  {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
                </div>
                {isAdmin && c.status === "pending" && (
                  <button onClick={() => { setProcessing(c.id); setProcessForm({ status: "approved", approvedAmount: "", notes: "" }); }}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg border hover:bg-muted transition">
                    Process
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold">Submit Insurance Claim</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Bill ID</label>
                <input required value={form.billId} onChange={(e) => setForm({ ...form, billId: e.target.value })}
                  placeholder="Enter bill UUID"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Insurance Plan</label>
                <select required value={form.insurancePlanId} onChange={(e) => setForm({ ...form, insurancePlanId: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                  <option value="">Select a plan</option>
                  {plans.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.coveragePercent}% coverage)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Member ID</label>
                <input required value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                  placeholder="Your insurance member ID"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Additional information..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 h-10 rounded-lg bg-helix-600 text-white text-sm font-semibold hover:bg-helix-700 disabled:opacity-60 transition">
                  {submitting ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {processing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold">Process Claim</h3>
              <button onClick={() => setProcessing(null)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleProcess} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  {["approved", "rejected"].map((s) => (
                    <button key={s} type="button" onClick={() => setProcessForm({ ...processForm, status: s })}
                      className={`h-10 rounded-lg border text-sm font-medium capitalize transition flex items-center justify-center gap-2 ${processForm.status === s ? (s === "approved" ? "bg-health-600 text-white border-health-600" : "bg-destructive text-destructive-foreground border-destructive") : "hover:bg-muted"}`}>
                      {s === "approved" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {processForm.status === "approved" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Approved Amount ($)</label>
                  <input type="number" min={0} value={processForm.approvedAmount}
                    onChange={(e) => setProcessForm({ ...processForm, approvedAmount: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Notes</label>
                <textarea value={processForm.notes} onChange={(e) => setProcessForm({ ...processForm, notes: e.target.value })}
                  rows={2} placeholder="Reason or notes..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setProcessing(null)}
                  className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                <button type="submit"
                  className="flex-1 h-10 rounded-lg bg-helix-600 text-white text-sm font-semibold hover:bg-helix-700 transition">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useSelector } from "react-redux";
import { useGetMyBillsQuery, useGetAllQuery, useGetSummaryQuery, useCreateMutation, useRecordPaymentMutation } from "@/store/api/billingApi";
import { useGetAllPatientsQuery } from "@/store/api/patientsApi";
import { CreditCard, DollarSign, TrendingUp, Clock, Plus, X, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { RootState } from "@/store";
import { useState } from "react";

const emptyItem = () => ({ description: "", quantity: "1", unitPrice: "", category: "consultation" });
const CATEGORIES = ["consultation", "procedure", "medication", "lab_test", "room_charge", "other"];

export default function BillingPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const [status, setStatus] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [billForm, setBillForm] = useState({ patientId: "", dueDate: "" });
  const [billItems, setBillItems] = useState([emptyItem()]);
  const [payForm, setPayForm] = useState({ amount: "", method: "cash" });

  const myBills = useGetMyBillsQuery({ status: status === "all" ? undefined : status }, { skip: role !== "patient" });
  const allBills = useGetAllQuery({ status: status === "all" ? undefined : status }, { skip: role === "patient" });
  const { data: summary } = useGetSummaryQuery(undefined, { skip: role !== "admin" });
  const { data: patientsData } = useGetAllPatientsQuery({ limit: 200 }, { skip: role !== "admin" });
  const patients = patientsData?.data || [];

  const [create, { isLoading: creating }] = useCreateMutation();
  const [recordPayment, { isLoading: paying }] = useRecordPaymentMutation();

  const bills = role === "patient" ? (myBills.data?.data || []) : (allBills.data?.data || []);
  const isLoading = role === "patient" ? myBills.isLoading : allBills.isLoading;

  function setItem(i: number, k: string, v: string) {
    setBillItems(billItems.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const validItems = billItems.filter((it) => it.description && it.unitPrice);
    if (!validItems.length) { toast.error("Add at least one billing item"); return; }
    try {
      await create({
        patientId: billForm.patientId,
        dueDate: billForm.dueDate || undefined,
        items: validItems.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice),
          category: it.category,
        })),
      }).unwrap();
      toast.success("Bill created");
      setShowCreate(false);
      setBillForm({ patientId: "", dueDate: "" });
      setBillItems([emptyItem()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create bill");
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!showPayment) return;
    try {
      await recordPayment({ id: showPayment, amount: Number(payForm.amount), method: payForm.method }).unwrap();
      toast.success("Payment recorded");
      setShowPayment(null);
      setPayForm({ amount: "", method: "cash" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to record payment");
    }
  }

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

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {["all", "pending", "partially_paid", "paid", "overdue"].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${status === s ? "bg-helix-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        {role === "admin" && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition shrink-0">
            <Plus className="w-4 h-4" /> Create Bill
          </button>
        )}
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
                <div className="text-right flex flex-col items-end gap-1.5">
                  <p className="font-bold text-lg">${b.totalAmount?.toLocaleString()}</p>
                  <StatusBadge status={b.status} />
                  {role === "admin" && !["paid"].includes(b.status) && (
                    <button onClick={() => { setShowPayment(b.id); setPayForm({ amount: "", method: "cash" }); }}
                      className="text-xs px-2.5 py-1 bg-health-600 hover:bg-health-700 text-white rounded-lg transition font-medium">
                      Record Payment
                    </button>
                  )}
                </div>
              </div>
              {b.dueDate && (
                <p className="text-xs text-muted-foreground mt-2">Due: {format(new Date(b.dueDate), "MMM d, yyyy")}</p>
              )}
              {b.paidAmount > 0 && (
                <p className="text-xs text-health-600 mt-1">Paid: ${b.paidAmount?.toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Bill Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card">
              <h3 className="font-semibold">Create Bill</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Patient *</label>
                  <select required value={billForm.patientId} onChange={(e) => setBillForm({ ...billForm, patientId: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                    <option value="">Select patient...</option>
                    {patients.map((p: any) => (
                      <option key={p.id} value={p.userId}>{p.user?.firstName} {p.user?.lastName} — {p.patientNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Due Date</label>
                  <input type="date" value={billForm.dueDate} onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Bill Items *</label>
                  <button type="button" onClick={() => setBillItems([...billItems, emptyItem()])}
                    className="flex items-center gap-1 text-xs text-helix-600 hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add item
                  </button>
                </div>
                <div className="space-y-3">
                  {billItems.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Item {i + 1}</span>
                        {billItems.length > 1 && (
                          <button type="button" onClick={() => setBillItems(billItems.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-destructive transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <input required value={item.description} onChange={(e) => setItem(i, "description", e.target.value)}
                            placeholder="Description *" className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        </div>
                        <select value={item.category} onChange={(e) => setItem(i, "category", e.target.value)}
                          className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                        </select>
                        <input type="number" min={1} value={item.quantity} onChange={(e) => setItem(i, "quantity", e.target.value)}
                          placeholder="Qty" className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        <div className="col-span-2">
                          <input required type="number" step="0.01" min={0} value={item.unitPrice} onChange={(e) => setItem(i, "unitPrice", e.target.value)}
                            placeholder="Unit price ($) *" className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 h-10 rounded-lg bg-helix-600 text-white text-sm font-semibold hover:bg-helix-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />} Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold">Record Payment</h3>
              <button onClick={() => setShowPayment(null)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handlePayment} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount ($) *</label>
                <input required type="number" step="0.01" min={0.01} value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Payment Method *</label>
                <select required value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                  {["cash", "card", "insurance", "bank_transfer", "check"].map((m) => (
                    <option key={m} value={m}>{m.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPayment(null)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                <button type="submit" disabled={paying} className="flex-1 h-10 rounded-lg bg-health-600 text-white text-sm font-semibold hover:bg-health-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                  {paying && <Loader2 className="w-4 h-4 animate-spin" />} Record
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
    paid: "bg-health-100 text-health-700",
    pending: "bg-amber-100 text-amber-700",
    partially_paid: "bg-helix-100 text-helix-700",
    overdue: "bg-destructive/10 text-destructive",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>{status?.replace("_", " ")}</span>;
}

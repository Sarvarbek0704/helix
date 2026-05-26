"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyPrescriptionsQuery, useGetDoctorPrescriptionsQuery, useCreateMutation } from "@/store/api/prescriptionsApi";
import { useGetAllPatientsQuery } from "@/store/api/patientsApi";
import { Pill, Plus, X, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { RootState } from "@/store";

const emptyItem = () => ({ medicationName: "", dosage: "", frequency: "", duration: "", instructions: "", quantity: "" });

export default function PrescriptionsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const isDoctor = role === "doctor";

  const myRx = useGetMyPrescriptionsQuery({ limit: 30 }, { skip: isDoctor });
  const doctorRx = useGetDoctorPrescriptionsQuery({ limit: 30 }, { skip: !isDoctor });

  const { data: patientsData } = useGetAllPatientsQuery({ limit: 200 }, { skip: !isDoctor });
  const patients = patientsData?.data || [];

  const [create, { isLoading: creating }] = useCreateMutation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: "", diagnosis: "", notes: "", validUntil: "" });
  const [items, setItems] = useState([emptyItem()]);

  const prescriptions = isDoctor ? (doctorRx.data?.data || []) : (myRx.data?.data || []);
  const isLoading = isDoctor ? doctorRx.isLoading : myRx.isLoading;

  function setItem(i: number, k: string, v: string) {
    setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter((it) => it.medicationName && it.dosage && it.frequency);
    if (!validItems.length) { toast.error("Add at least one medication with name, dosage and frequency"); return; }
    try {
      await create({
        patientId: form.patientId,
        diagnosis: form.diagnosis || undefined,
        notes: form.notes || undefined,
        validUntil: form.validUntil || undefined,
        items: validItems.map((it) => ({
          medicationName: it.medicationName,
          dosage: it.dosage,
          frequency: it.frequency,
          duration: it.duration || undefined,
          instructions: it.instructions || undefined,
          quantity: it.quantity ? Number(it.quantity) : undefined,
        })),
      }).unwrap();
      toast.success("Prescription created");
      setShowForm(false);
      setForm({ patientId: "", diagnosis: "", notes: "", validUntil: "" });
      setItems([emptyItem()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create prescription");
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{(isDoctor ? doctorRx.data?.total : myRx.data?.total) || 0} prescription{prescriptions.length !== 1 ? "s" : ""}</p>
        {isDoctor && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus className="w-4 h-4" /> New Prescription
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16">
          <Pill className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No prescriptions found</p>
          {isDoctor && <p className="text-xs text-muted-foreground mt-1">Create your first prescription using the button above</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p: any) => (
            <div key={p.id} className="bg-card rounded-xl border shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">Prescription #{p.id?.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {isDoctor
                      ? `${p.patient?.firstName} ${p.patient?.lastName} · ${format(new Date(p.createdAt), "MMM d, yyyy")}`
                      : `By Dr. ${p.doctor?.user?.firstName} ${p.doctor?.user?.lastName} · ${format(new Date(p.createdAt), "MMM d, yyyy")}`}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.diagnosis && <p className="text-xs text-muted-foreground mb-2">Diagnosis: {p.diagnosis}</p>}
              <div className="space-y-1">
                {(p.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Pill className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="font-medium">{item.medicationName}</span>
                    <span className="text-muted-foreground">— {item.dosage}, {item.frequency}{item.duration ? `, ${item.duration}` : ""}</span>
                  </div>
                ))}
              </div>
              {p.notes && <p className="text-xs text-muted-foreground mt-2 italic">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card">
              <h3 className="font-semibold">New Prescription</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Patient *</label>
                  <select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                    <option value="">Select patient...</option>
                    {patients.map((p: any) => (
                      <option key={p.id} value={p.userId}>{p.user?.firstName} {p.user?.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Diagnosis</label>
                  <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    placeholder="e.g. Type 2 Diabetes"
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Medications *</label>
                  <button type="button" onClick={() => setItems([...items, emptyItem()])}
                    className="flex items-center gap-1 text-xs text-helix-600 hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add medication
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Medication {i + 1}</span>
                        {items.length > 1 && (
                          <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-destructive transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <input required value={item.medicationName} onChange={(e) => setItem(i, "medicationName", e.target.value)}
                            placeholder="Medication name *" className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        </div>
                        <input required value={item.dosage} onChange={(e) => setItem(i, "dosage", e.target.value)}
                          placeholder="Dosage e.g. 500mg *" className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        <input required value={item.frequency} onChange={(e) => setItem(i, "frequency", e.target.value)}
                          placeholder="Frequency e.g. twice daily *" className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        <input value={item.duration} onChange={(e) => setItem(i, "duration", e.target.value)}
                          placeholder="Duration e.g. 7 days" className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        <input value={item.quantity} type="number" min={0} onChange={(e) => setItem(i, "quantity", e.target.value)}
                          placeholder="Quantity" className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        <div className="col-span-2">
                          <input value={item.instructions} onChange={(e) => setItem(i, "instructions", e.target.value)}
                            placeholder="Instructions (e.g. Take with meals)" className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Additional notes for pharmacist or patient..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 h-10 rounded-lg bg-helix-600 text-white text-sm font-semibold hover:bg-helix-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />} Create Prescription
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
    active: "bg-health-100 text-health-700",
    completed: "bg-helix-100 text-helix-700",
    dispensed: "bg-helix-100 text-helix-700",
    cancelled: "bg-destructive/10 text-destructive",
    expired: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

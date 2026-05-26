"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyVitalsQuery, useRecordMutation } from "@/store/api/vitalsApi";
import { useGetAllPatientsQuery } from "@/store/api/patientsApi";
import { Activity, Heart, Thermometer, Wind, Plus, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { RootState } from "@/store";

export default function VitalsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const isPatient = role === "patient";

  const { data, isLoading } = useGetMyVitalsQuery({ limit: 20 }, { skip: !isPatient });
  const vitals = data?.data || [];

  const { data: patientsData } = useGetAllPatientsQuery({ limit: 200 }, { skip: isPatient });
  const patients = patientsData?.data || [];

  const [record, { isLoading: recording }] = useRecordMutation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: "", temperature: "", systolicBP: "", diastolicBP: "",
    heartRate: "", respiratoryRate: "", oxygenSaturation: "",
    weight: "", height: "", glucoseLevel: "", notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patientId) { toast.error("Select a patient"); return; }
    const payload: any = { patientId: form.patientId };
    if (form.temperature) payload.temperature = Number(form.temperature);
    if (form.systolicBP) payload.systolicBP = Number(form.systolicBP);
    if (form.diastolicBP) payload.diastolicBP = Number(form.diastolicBP);
    if (form.heartRate) payload.heartRate = Number(form.heartRate);
    if (form.respiratoryRate) payload.respiratoryRate = Number(form.respiratoryRate);
    if (form.oxygenSaturation) payload.oxygenSaturation = Number(form.oxygenSaturation);
    if (form.weight) payload.weight = Number(form.weight);
    if (form.height) payload.height = Number(form.height);
    if (form.glucoseLevel) payload.glucoseLevel = Number(form.glucoseLevel);
    if (form.notes) payload.notes = form.notes;
    try {
      await record(payload).unwrap();
      toast.success("Vitals recorded successfully");
      setShowForm(false);
      setForm({ patientId: "", temperature: "", systolicBP: "", diastolicBP: "", heartRate: "", respiratoryRate: "", oxygenSaturation: "", weight: "", height: "", glucoseLevel: "", notes: "" });
    } catch {
      toast.error("Failed to record vitals");
    }
  }

  if (!isPatient) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">Record vital signs for patients</p>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus className="w-4 h-4" /> Record Vitals
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-8 text-center">
          <Activity className="w-16 h-16 text-helix-200 mx-auto mb-4" />
          <p className="font-semibold mb-1">Record Patient Vitals</p>
          <p className="text-sm text-muted-foreground mb-4">Select a patient from the list below and enter their vital measurements.</p>
          <button onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
            Start Recording
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card">
                <h3 className="font-semibold">Record Vital Signs</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleRecord} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Patient *</label>
                  <select required value={form.patientId} onChange={(e) => set("patientId", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                    <option value="">Select patient...</option>
                    {patients.map((p: any) => (
                      <option key={p.id} value={p.userId}>{p.user?.firstName} {p.user?.lastName} — {p.patientNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Systolic BP (mmHg)</label>
                    <input type="number" min={0} value={form.systolicBP} onChange={(e) => set("systolicBP", e.target.value)} placeholder="120" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Diastolic BP (mmHg)</label>
                    <input type="number" min={0} value={form.diastolicBP} onChange={(e) => set("diastolicBP", e.target.value)} placeholder="80" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Heart Rate (bpm)</label>
                    <input type="number" min={0} value={form.heartRate} onChange={(e) => set("heartRate", e.target.value)} placeholder="72" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Temperature (°C)</label>
                    <input type="number" step="0.1" min={0} value={form.temperature} onChange={(e) => set("temperature", e.target.value)} placeholder="36.6" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">O₂ Saturation (%)</label>
                    <input type="number" min={0} max={100} step="0.1" value={form.oxygenSaturation} onChange={(e) => set("oxygenSaturation", e.target.value)} placeholder="98" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Respiratory Rate (/min)</label>
                    <input type="number" min={0} value={form.respiratoryRate} onChange={(e) => set("respiratoryRate", e.target.value)} placeholder="16" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Weight (kg)</label>
                    <input type="number" step="0.1" min={0} value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="75" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Height (cm)</label>
                    <input type="number" min={0} value={form.height} onChange={(e) => set("height", e.target.value)} placeholder="178" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Glucose Level (mg/dL)</label>
                    <input type="number" min={0} value={form.glucoseLevel} onChange={(e) => set("glucoseLevel", e.target.value)} placeholder="95" className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
                    placeholder="Additional observations..."
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                  <button type="submit" disabled={recording} className="flex-1 h-10 rounded-lg bg-helix-600 text-white text-sm font-semibold hover:bg-helix-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                    {recording && <Loader2 className="w-4 h-4 animate-spin" />} Save Vitals
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : vitals.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No vitals recorded yet</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl border shadow-card p-5">
            <h3 className="font-semibold mb-4">Latest Readings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Blood Pressure", value: vitals[0]?.systolicBP && vitals[0]?.diastolicBP ? `${vitals[0].systolicBP}/${vitals[0].diastolicBP}` : null, unit: "mmHg", icon: Heart, color: "text-rose-600" },
                { label: "Heart Rate", value: vitals[0]?.heartRate, unit: "bpm", icon: Activity, color: "text-helix-600" },
                { label: "Temperature", value: vitals[0]?.temperature, unit: "°C", icon: Thermometer, color: "text-amber-600" },
                { label: "O₂ Saturation", value: vitals[0]?.oxygenSaturation, unit: "%", icon: Wind, color: "text-health-600" },
              ].map(({ label, value, unit, icon: Icon, color }) => (
                <div key={label} className="p-4 rounded-xl bg-muted/50 flex items-start gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value || "—"}</p>
                    <p className="text-xs text-muted-foreground">{unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">History</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground uppercase">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Blood Pressure</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Heart Rate</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Temp</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">O₂ Sat</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vitals.map((v: any) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition text-sm">
                    <td className="px-4 py-3 text-muted-foreground">{format(new Date(v.createdAt), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3 font-medium">{v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP}` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{v.heartRate ? `${v.heartRate} bpm` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{v.temperature ? `${v.temperature}°C` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{v.oxygenSaturation ? `${v.oxygenSaturation}%` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{v.weight ? `${v.weight} kg` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

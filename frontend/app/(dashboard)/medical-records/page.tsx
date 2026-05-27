"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyRecordsQuery, useGetAllRecordsQuery, useCreateMutation } from "@/store/api/medicalApi";
import { useGetAllPatientsQuery } from "@/store/api/patientsApi";
import { FileText, ChevronRight, Plus, X, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import type { RootState } from "@/store";

const RECORD_TYPES = ["visit_note", "diagnosis", "procedure", "surgery", "vaccination", "allergy", "chronic_condition"] as const;

export default function MedicalRecordsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const isPatient = role === "patient";
  const canCreate = ["doctor", "nurse", "admin"].includes(role || "");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const myQuery = useGetMyRecordsQuery({ page, limit: 15 }, { skip: !isPatient });
  const allQuery = useGetAllRecordsQuery({ page, limit: 15, search: search || undefined }, { skip: isPatient });

  const data = isPatient ? myQuery.data : allQuery.data;
  const isLoading = isPatient ? myQuery.isLoading : allQuery.isLoading;
  const records = data?.data || [];

  const { data: patientsData } = useGetAllPatientsQuery({ limit: 200 }, { skip: !canCreate });
  const patients = patientsData?.data || [];

  const [create, { isLoading: creating }] = useCreateMutation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: "", type: "visit_note" as typeof RECORD_TYPES[number],
    title: "", description: "", icdCode: "", recordDate: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create({
        patientId: form.patientId,
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        icdCode: form.icdCode || undefined,
        recordDate: form.recordDate || undefined,
      }).unwrap();
      toast.success("Medical record created");
      setShowForm(false);
      setForm({ patientId: "", type: "visit_note", title: "", description: "", icdCode: "", recordDate: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create record");
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm shrink-0">{data?.total || 0} records</p>
        {!isPatient && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search records..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
          </div>
        )}
        {canCreate && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition shrink-0">
            <Plus className="w-4 h-4" /> New Record
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No medical records found</p>
          {canCreate && (
            <button onClick={() => setShowForm(true)} className="mt-3 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
              Create First Record
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r: any) => (
            <Link key={r.id} href={`/medical-records/${r.id}`}
              className="bg-card rounded-xl border shadow-card p-4 flex items-start gap-4 hover:shadow-card-hover transition group">
              <div className="w-10 h-10 bg-helix-50 rounded-lg flex items-center justify-center text-helix-600 shrink-0 dark:bg-helix-900/30">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{r.title}</p>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full capitalize text-muted-foreground">
                    {r.type?.replace(/_/g, " ")}
                  </span>
                </div>
                {!isPatient && r.patient && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Patient: {r.patient?.firstName} {r.patient?.lastName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {r.doctor ? `Dr. ${r.doctor?.user?.firstName} ${r.doctor?.user?.lastName} · ` : ""}
                  {r.recordDate ? format(new Date(r.recordDate), "MMM d, yyyy") : format(new Date(r.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      )}

      {(data?.totalPages || 0) > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(data.totalPages)].map((_: any, i: number) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === i + 1 ? "bg-helix-600 text-white" : "bg-muted hover:bg-muted/80"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card z-10">
              <h3 className="font-semibold">New Medical Record</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Patient *</label>
                <select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                  <option value="">Select patient...</option>
                  {patients.map((p: any) => (
                    <option key={p.id} value={p.userId}>{p.user?.firstName} {p.user?.lastName} — {p.patientNumber}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Record Type *</label>
                  <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                    {RECORD_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Record Date</label>
                  <input type="date" value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Physical Examination"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">ICD Code</label>
                <input value={form.icdCode} onChange={(e) => setForm({ ...form, icdCode: e.target.value })}
                  placeholder="e.g. I10 (optional)"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4} placeholder="Detailed notes, findings, treatment plan..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 h-10 rounded-lg bg-helix-600 text-white text-sm font-semibold hover:bg-helix-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />} Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

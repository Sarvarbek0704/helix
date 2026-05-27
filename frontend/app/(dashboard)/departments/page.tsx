"use client";
import { useState } from "react";
import { useGetAllQuery, useCreateMutation, useDeleteMutation } from "@/store/api/departmentsApi";
import { Building2, Plus, Trash2, Loader2, Users, CheckCircle2, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function DepartmentsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const isAdmin = user?.role === "admin";
  const { data, isLoading } = useGetAllQuery();
  const [create, { isLoading: creating }] = useCreateMutation();
  const [del] = useDeleteMutation();
  const departments = data?.data || data || [];

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const activeDepts = departments.filter((d: any) => d.isActive !== false);
  const totalDoctors = departments.reduce((sum: number, d: any) => sum + (d.doctorCount || 0), 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create(form).unwrap();
      toast.success("Department created");
      setForm({ name: "", description: "" });
      setShowModal(false);
    } catch {
      toast.error("Failed to create department");
    }
  }

  async function handleDelete(id: string) {
    try {
      await del(id).unwrap();
      toast.success("Department deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  const DEPT_COLORS = [
    "from-helix-500 to-helix-600",
    "from-health-500 to-health-600",
    "from-amber-500 to-amber-600",
    "from-purple-500 to-purple-600",
    "from-rose-500 to-rose-600",
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-orange-500 to-orange-600",
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-helix-50 dark:bg-helix-900/20 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-helix-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{departments.length}</p>
            <p className="text-xs text-muted-foreground">Total Departments</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-health-50 dark:bg-health-900/20 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-health-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeDepts.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalDoctors}</p>
            <p className="text-xs text-muted-foreground">Total Doctors</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{departments.length} department{departments.length !== 1 ? "s" : ""}</p>
        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus className="w-4 h-4" /> New Department
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No departments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d: any, idx: number) => (
            <div key={d.id} className="bg-card rounded-xl border shadow-card overflow-hidden group hover:shadow-card-hover transition">
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${DEPT_COLORS[idx % DEPT_COLORS.length]}`} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${DEPT_COLORS[idx % DEPT_COLORS.length]} flex items-center justify-center`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {d.isActive !== false ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-health-100 text-health-700">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                    )}
                    {isAdmin && (
                      <button onClick={() => handleDelete(d.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold mt-3 text-base">{d.name}</h3>
                {d.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{d.description}</p>
                )}

                <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {d.doctorCount !== undefined ? `${d.doctorCount} doctor${d.doctorCount !== 1 ? "s" : ""}` : "—"}
                  </span>
                  {d.headDoctorName && (
                    <span className="truncate">Head: Dr. {d.headDoctorName}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold">Create Department</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Department Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Cardiology, Orthopedics"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the department's focus and services..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 h-10 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

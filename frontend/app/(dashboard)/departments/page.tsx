"use client";
import { useState } from "react";
import { useGetAllQuery, useCreateMutation, useDeleteMutation } from "@/store/api/departmentsApi";
import { Building2, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function DepartmentsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { data, isLoading } = useGetAllQuery();
  const [create, { isLoading: creating }] = useCreateMutation();
  const [del] = useDeleteMutation();
  const departments = data?.data || data || [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create(form).unwrap();
      toast.success("Department created");
      setForm({ name: "", description: "" });
      setShowForm(false);
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

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{departments.length} department{departments.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
          <Plus className="w-4 h-4" /> New Department
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border shadow-card p-5">
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">Department name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Cardiology"
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
            </div>
            <button type="submit" disabled={creating}
              className="h-10 px-4 bg-helix-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-60">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No departments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d: any) => (
            <div key={d.id} className="bg-card rounded-xl border shadow-card p-5 group hover:shadow-card-hover transition">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-helix-50 rounded-lg flex items-center justify-center dark:bg-helix-900/30">
                  <Building2 className="w-5 h-5 text-helix-600" />
                </div>
                <button onClick={() => handleDelete(d.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold mt-3">{d.name}</h3>
              {d.description && <p className="text-sm text-muted-foreground mt-1">{d.description}</p>}
              {d.doctorCount !== undefined && (
                <p className="text-xs text-muted-foreground mt-2">{d.doctorCount} doctors</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchQuery, useCreateMutation, useRemoveMutation, useSeedMutation } from "@/store/api/medicationsApi";
import { Pill, Plus, X, Loader2, Search, Trash2, Database } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/store";

const CATEGORIES = ["antibiotic", "analgesic", "antihypertensive", "antidiabetic", "antihistamine", "antidepressant", "antifungal", "antiviral", "cardiovascular", "respiratory", "other"];

export default function MedicationsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const isAdmin = role === "admin";

  const [q, setQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", genericName: "", category: "other", description: "", form: "" });

  const { data, isLoading, isFetching } = useSearchQuery({ search: q || undefined, limit: 50 });
  const medications = data?.data || [];

  const [create, { isLoading: creating }] = useCreateMutation();
  const [remove] = useRemoveMutation();
  const [seed, { isLoading: seeding }] = useSeedMutation();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create({
        name: form.name,
        genericName: form.genericName || undefined,
        category: form.category || undefined,
        description: form.description || undefined,
        form: form.form || undefined,
      }).unwrap();
      toast.success("Medication added to catalog");
      setShowCreate(false);
      setForm({ name: "", genericName: "", category: "other", description: "", form: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create medication");
    }
  }

  async function handleRemove(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the catalog?`)) return;
    try {
      await remove(id).unwrap();
      toast.success("Medication removed");
    } catch {
      toast.error("Failed to remove medication");
    }
  }

  async function handleSeed() {
    try {
      await seed().unwrap();
      toast.success("Medication catalog seeded successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to seed catalog");
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search medications..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500"
          />
        </div>
        {isAdmin && (
          <div className="flex gap-2 shrink-0">
            <button onClick={handleSeed} disabled={seeding}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition disabled:opacity-60">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Seed Catalog
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
              <Plus className="w-4 h-4" /> Add Medication
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{data?.total || 0} medications in catalog{isFetching && " · Searching..."}</p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-16">
          <Pill className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{q ? "No medications match your search" : "No medications in catalog"}</p>
          {isAdmin && !q && (
            <button onClick={handleSeed} disabled={seeding}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 mx-auto">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Seed Default Catalog
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {medications.map((med: any) => (
            <div key={med.id} className="bg-card rounded-xl border shadow-card p-4 flex items-start gap-3 group">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 shrink-0 dark:bg-purple-900/30">
                <Pill className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{med.name}</p>
                {med.genericName && <p className="text-xs text-muted-foreground">Generic: {med.genericName}</p>}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {med.category && (
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full capitalize">{med.category.replace("_", " ")}</span>
                  )}
                  {med.form && (
                    <span className="text-xs px-2 py-0.5 bg-helix-50 text-helix-700 rounded-full capitalize dark:bg-helix-900/30 dark:text-helix-300">{med.form}</span>
                  )}
                </div>
                {med.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{med.description}</p>}
              </div>
              {isAdmin && (
                <button onClick={() => handleRemove(med.id, med.name)}
                  className="text-muted-foreground hover:text-destructive transition opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Medication Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card">
              <h3 className="font-semibold">Add Medication</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Brand Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Amoxil"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Generic Name</label>
                <input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                  placeholder="e.g. Amoxicillin"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Form</label>
                <input value={form.form} onChange={(e) => setForm({ ...form, form: e.target.value })}
                  placeholder="e.g. tablet, capsule, liquid..."
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Brief description of uses, contraindications..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 h-10 rounded-lg bg-helix-600 text-white text-sm font-semibold hover:bg-helix-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />} Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

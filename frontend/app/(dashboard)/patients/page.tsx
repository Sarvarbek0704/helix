"use client";
import { useState } from "react";
import { useGetAllPatientsQuery } from "@/store/api/patientsApi";
import { Search, Users, ChevronRight, Download, UserPlus, Droplets } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const BLOOD_TYPE_COLORS: Record<string, string> = {
  "A+": "bg-rose-100 text-rose-700",
  "A-": "bg-rose-50 text-rose-600",
  "B+": "bg-blue-100 text-blue-700",
  "B-": "bg-blue-50 text-blue-600",
  "AB+": "bg-purple-100 text-purple-700",
  "AB-": "bg-purple-50 text-purple-600",
  "O+": "bg-amber-100 text-amber-700",
  "O-": "bg-amber-50 text-amber-600",
  "unknown": "bg-muted text-muted-foreground",
};

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAllPatientsQuery({ page, limit: 20, search: search || undefined });
  const patients = data?.data || [];
  const total = data?.total || 0;

  // Stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-helix-50 dark:bg-helix-900/20 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-helix-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Patients</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-health-50 dark:bg-health-900/20 rounded-lg flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-health-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{isLoading ? "—" : patients.length}</p>
            <p className="text-xs text-muted-foreground">Showing on page</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3 md:col-span-1 col-span-2">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{isLoading ? "—" : patients.filter((p: any) => p.bloodType && p.bloodType !== "unknown").length}</p>
            <p className="text-xs text-muted-foreground">With blood type on page</p>
          </div>
        </div>
      </div>

      {/* Search & actions */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search patients by name or email..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
        </div>
        <button
          className="flex items-center gap-2 px-3 h-10 rounded-lg border text-sm font-medium text-muted-foreground hover:bg-muted transition"
          title="Export (visual only)">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{search ? "No patients match your search" : "No patients registered yet"}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-muted-foreground uppercase bg-muted/30">
                <th className="px-4 py-3 text-left font-medium">Patient</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Patient #</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Blood Type</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium hidden xl:table-cell">Last Visit</th>
                <th className="px-4 py-3 text-left font-medium hidden xl:table-cell">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {patients.map((p: any) => {
                const bloodType = p.bloodType || "unknown";
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-xs font-bold shrink-0">
                          {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.user?.firstName} {p.user?.lastName}</p>
                          {p.gender && <p className="text-xs text-muted-foreground capitalize">{p.gender}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground font-mono">{p.patientNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${BLOOD_TYPE_COLORS[bloodType] || BLOOD_TYPE_COLORS.unknown}`}>
                        {bloodType === "unknown" ? "—" : bloodType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground hidden lg:table-cell">{p.user?.email}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground hidden xl:table-cell">
                      {p.lastVisitAt ? format(new Date(p.lastVisitAt), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground hidden xl:table-cell">
                      {p.createdAt ? format(new Date(p.createdAt), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/patients/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(data.totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === i + 1 ? "bg-helix-600 text-white" : "bg-muted hover:bg-muted/80"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

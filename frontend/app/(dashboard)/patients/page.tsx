"use client";
import { useState } from "react";
import { useGetAllPatientsQuery } from "@/store/api/patientsApi";
import { Search, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAllPatientsQuery({ page, limit: 20, search: search || undefined });
  const patients = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{total} patient{total !== 1 ? "s" : ""} registered</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search patients by email..."
          className="w-full h-10 pl-9 pr-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
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
              <tr className="border-b text-xs text-muted-foreground uppercase">
                <th className="px-4 py-3 text-left font-medium">Patient</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Patient #</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {patients.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-xs font-bold shrink-0">
                        {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                      </div>
                      <span className="text-sm font-medium">{p.user?.firstName} {p.user?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{p.patientNumber}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{p.user?.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{p.createdAt ? format(new Date(p.createdAt), "MMM d, yyyy") : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/patients/${p.id}`} className="text-muted-foreground hover:text-foreground transition">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
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

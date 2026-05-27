"use client";
import { useState } from "react";
import { useGetAllDoctorsQuery } from "@/store/api/doctorsApi";
import { Search, Stethoscope, Star, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAllDoctorsQuery({ page, limit: 16, search: search || undefined });
  const doctors = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search doctors by name or specialty..."
          className="w-full h-10 pl-9 pr-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16">
          <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{search ? "No doctors match your search" : "No doctors registered yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {doctors.map((d: any) => (
            <Link key={d.id} href={`/doctors/${d.id}`}
              className="bg-card rounded-xl border shadow-card hover:shadow-card-hover p-5 flex flex-col gap-3 group transition">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-lg font-bold shrink-0">
                  {d.user?.firstName?.[0]}{d.user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">Dr. {d.user?.firstName} {d.user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.specialization}</p>
                </div>
              </div>
              {d.department?.name && (
                <span className="text-xs px-2 py-0.5 bg-helix-50 text-helix-700 dark:bg-helix-900/30 dark:text-helix-300 rounded-full w-fit">
                  {d.department.name}
                </span>
              )}
              <div className="flex items-center justify-between mt-auto">
                {d.rating ? (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {Number(d.rating).toFixed(1)}
                  </div>
                ) : <span />}
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
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

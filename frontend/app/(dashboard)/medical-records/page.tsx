"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyRecordsQuery } from "@/store/api/medicalApi";
import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { RootState } from "@/store";

export default function MedicalRecordsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyRecordsQuery({ page, limit: 15 });
  const records = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-muted-foreground text-sm">{data?.total || 0} records found</p>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No medical records found</p>
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
                <p className="font-semibold text-sm">{r.title}</p>
                {r.diagnosis && <p className="text-sm text-muted-foreground truncate">Diagnosis: {r.diagnosis}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">
                  By Dr. {r.doctor?.user?.firstName} {r.doctor?.user?.lastName} · {format(new Date(r.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
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

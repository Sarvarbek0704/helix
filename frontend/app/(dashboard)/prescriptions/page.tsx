"use client";
import { useGetMyPrescriptionsQuery } from "@/store/api/prescriptionsApi";
import { Pill, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PrescriptionsPage() {
  const { data, isLoading } = useGetMyPrescriptionsQuery({ limit: 20 });
  const prescriptions = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-muted-foreground text-sm">{data?.total || 0} prescription{data?.total !== 1 ? "s" : ""}</p>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16">
          <Pill className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p: any) => (
            <div key={p.id} className="bg-card rounded-xl border shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">Prescription #{p.id?.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    By Dr. {p.doctor?.firstName} {p.doctor?.lastName} · {format(new Date(p.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="space-y-1">
                {(p.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Pill className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="font-medium">{item.medicationName}</span>
                    <span className="text-muted-foreground">— {item.dosage}, {item.frequency}</span>
                  </div>
                ))}
              </div>
              {p.notes && <p className="text-xs text-muted-foreground mt-2 italic">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-health-100 text-health-700",
    dispensed: "bg-helix-100 text-helix-700",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

"use client";
import { use } from "react";
import { useGetByIdQuery } from "@/store/api/medicalApi";
import { ArrowLeft, FileText, User, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function MedicalRecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: record, isLoading } = useGetByIdQuery(id);

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>;
  if (!record) return <div className="text-center py-16 text-muted-foreground">Record not found</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <Link href="/medical-records" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" /> Back to Medical Records
      </Link>

      <div className="bg-card rounded-xl border shadow-card p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-helix-50 rounded-xl flex items-center justify-center dark:bg-helix-900/30">
            <FileText className="w-6 h-6 text-helix-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{record.title}</h2>
            <p className="text-sm text-muted-foreground">{format(new Date(record.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-0.5">Doctor</p>
            <p className="text-sm font-medium">Dr. {record.doctor?.firstName} {record.doctor?.lastName}</p>
          </div>
          {record.diagnosis && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-0.5">Diagnosis</p>
              <p className="text-sm font-medium">{record.diagnosis}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Description</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{record.description}</p>
        </div>

        {record.attachments?.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Attachments</p>
            <div className="space-y-2">
              {record.attachments.map((a: any, i: number) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" /> {a.name || `Attachment ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

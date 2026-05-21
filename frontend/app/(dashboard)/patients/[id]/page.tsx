"use client";
import { use } from "react";
import { useGetPatientByIdQuery } from "@/store/api/patientsApi";
import { useGetPatientVitalsQuery } from "@/store/api/vitalsApi";
import { useGetPatientRecordsQuery } from "@/store/api/medicalApi";
import { useGetDoctorAppointmentsQuery } from "@/store/api/appointmentsApi";
import { ArrowLeft, Activity, FileText, Calendar, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: patient, isLoading } = useGetPatientByIdQuery(id);
  const { data: vitalsData } = useGetPatientVitalsQuery({ id, limit: 1 });
  const { data: records } = useGetPatientRecordsQuery({ id, limit: 5 });

  const latest = vitalsData?.data?.[0];

  if (isLoading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>;
  }

  if (!patient) return <div className="text-center py-16 text-muted-foreground">Patient not found</div>;

  const u = patient.user || patient;

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <Link href="/patients" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" /> Back to Patients
      </Link>

      <div className="bg-card rounded-xl border shadow-card p-6 flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-2xl font-bold shrink-0">
          {u.firstName?.[0]}{u.lastName?.[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{u.firstName} {u.lastName}</h2>
          <p className="text-muted-foreground text-sm">{patient.patientNumber}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 mt-3">
            {[
              { label: "Email", value: u.email },
              { label: "Phone", value: u.phone || "—" },
              { label: "Blood Type", value: patient.bloodType || "—" },
              { label: "DOB", value: patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM d, yyyy") : "—" },
              { label: "Allergies", value: patient.allergies || "None" },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-xs text-muted-foreground">{label}: </span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {latest && (
        <div className="bg-card rounded-xl border shadow-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-helix-600" /> Latest Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Blood Pressure", value: latest.bloodPressure, unit: "mmHg" },
              { label: "Heart Rate", value: latest.heartRate, unit: "bpm" },
              { label: "Temperature", value: latest.temperature, unit: "°C" },
              { label: "O₂ Saturation", value: latest.oxygenSaturation, unit: "%" },
            ].map((v) => (
              <div key={v.label} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{v.label}</p>
                <p className="text-base font-bold">{v.value || "—"} <span className="text-xs font-normal text-muted-foreground">{v.unit}</span></p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Recorded {format(new Date(latest.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
        </div>
      )}

      <div className="bg-card rounded-xl border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-helix-600" /> Recent Medical Records</h3>
        </div>
        {records?.data?.length ? (
          <div className="space-y-2">
            {records.data.map((r: any) => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.diagnosis && `Diagnosis: ${r.diagnosis} · `}{format(new Date(r.createdAt), "MMM d, yyyy")}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No records found</p>
        )}
      </div>
    </div>
  );
}

"use client";
import { Calendar, FileText, Activity, Pill, FlaskConical, CreditCard } from "lucide-react";
import { useGetPatientDashboardQuery } from "@/store/api/analyticsApi";
import { useGetMyLatestQuery } from "@/store/api/vitalsApi";
import { useGetMyAppointmentsQuery } from "@/store/api/appointmentsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Link from "next/link";
import { format } from "date-fns";

export function PatientDashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { data: dash } = useGetPatientDashboardQuery();
  const { data: vitals } = useGetMyLatestQuery();
  const { data: appts } = useGetMyAppointmentsQuery({ limit: 3, status: "confirmed" });

  const quickLinks = [
    { href: "/appointments", icon: Calendar, label: "Book Appointment", color: "bg-helix-50 text-helix-700 dark:bg-helix-900/30" },
    { href: "/medical-records", icon: FileText, label: "Medical Records", color: "bg-health-50 text-health-700 dark:bg-health-900/30" },
    { href: "/vitals", icon: Activity, label: "My Vitals", color: "bg-amber-50 text-amber-700" },
    { href: "/prescriptions", icon: Pill, label: "Prescriptions", color: "bg-purple-50 text-purple-700" },
    { href: "/lab", icon: FlaskConical, label: "Lab Results", color: "bg-rose-50 text-rose-700" },
    { href: "/billing", icon: CreditCard, label: "Billing", color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Hello, {user?.firstName} 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickLinks.map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href} className={`rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:scale-105 transition-transform ${color}`}>
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-helix-600" /> Upcoming Appointments</h3>
            <Link href="/appointments" className="text-xs text-helix-600 hover:underline">View all</Link>
          </div>
          {appts?.data?.length ? (
            <div className="space-y-3">
              {appts.data.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 bg-helix-100 rounded-lg flex flex-col items-center justify-center text-helix-700 shrink-0">
                    <span className="text-xs font-bold">{a.appointmentDate ? format(new Date(a.appointmentDate), "MMM") : "—"}</span>
                    <span className="text-base font-bold leading-none">{a.appointmentDate ? format(new Date(a.appointmentDate), "d") : "—"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Dr. {a.doctor?.user?.firstName ?? ""} {a.doctor?.user?.lastName ?? ""}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.reason}</p>
                    <p className="text-xs text-muted-foreground">{a.appointmentTime || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              <Link href="/appointments" className="text-xs text-helix-600 hover:underline mt-1 inline-block">Book one now</Link>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-helix-600" /> Latest Vitals</h3>
            <Link href="/vitals" className="text-xs text-helix-600 hover:underline">History</Link>
          </div>
          {vitals ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Blood Pressure", value: vitals.systolicBP && vitals.diastolicBP ? `${vitals.systolicBP}/${vitals.diastolicBP}` : "—", unit: "mmHg" },
                { label: "Heart Rate", value: vitals.heartRate || "—", unit: "bpm" },
                { label: "Temperature", value: vitals.temperature || "—", unit: "°C" },
                { label: "O₂ Saturation", value: vitals.oxygenSaturation || "—", unit: "%" },
              ].map((v) => (
                <div key={v.label} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{v.label}</p>
                  <p className="text-lg font-bold">{v.value} <span className="text-xs font-normal text-muted-foreground">{v.unit}</span></p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No vitals recorded yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Appointments", value: dash?.totalAppointments, icon: Calendar },
          { label: "Medical Records", value: dash?.totalRecords, icon: FileText },
          { label: "Prescriptions", value: dash?.totalPrescriptions, icon: Pill },
          { label: "Pending Bills", value: dash?.pendingBills ?? dash?.unpaidBills, icon: CreditCard },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4.5 h-4.5 text-helix-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{value ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

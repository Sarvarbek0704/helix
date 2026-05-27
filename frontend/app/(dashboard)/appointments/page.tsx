"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { Calendar, Plus, Clock, ChevronRight, Loader2, CheckCircle2, XCircle, AlertCircle, Activity } from "lucide-react";
import { clsx } from "clsx";
import type { RootState } from "@/store";
import { useGetMyAppointmentsQuery, useGetDoctorAppointmentsQuery, useGetAllQuery, useCancelMutation } from "@/store/api/appointmentsApi";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_TABS = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled"];

function getSummaryStats(appointments: any[]) {
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return {
    today: appointments.filter((a) => a.appointmentDate === today).length,
    pending: appointments.filter((a) => a.status === "pending").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
  };
}

export default function AppointmentsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const [status, setStatus] = useState("all");
  const [showBook, setShowBook] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  const patientQ = useGetMyAppointmentsQuery({ status: status === "all" ? undefined : status }, { skip: role !== "patient" });
  const doctorQ = useGetDoctorAppointmentsQuery({ status: status === "all" ? undefined : status, date: dateFilter || undefined }, { skip: role !== "doctor" && role !== "nurse" });
  const adminQ = useGetAllQuery({ status: status === "all" ? undefined : status, date: dateFilter || undefined }, { skip: role !== "admin" });

  const query = role === "patient" ? patientQ : role === "admin" ? adminQ : doctorQ;
  const appointments: any[] = query.data?.data || [];
  const isLoading = query.isLoading;

  // For summary stats, fetch all
  const allPatientQ = useGetMyAppointmentsQuery({}, { skip: role !== "patient" });
  const allDoctorQ = useGetDoctorAppointmentsQuery({ limit: 200 }, { skip: role !== "doctor" && role !== "nurse" });
  const allAdminQ = useGetAllQuery({ limit: 200 }, { skip: role !== "admin" });
  const allAppts: any[] = (role === "patient" ? allPatientQ.data?.data : role === "admin" ? allAdminQ.data?.data : allDoctorQ.data?.data) || [];
  const stats = getSummaryStats(allAppts);

  const [cancel] = useCancelMutation();

  async function handleCancel(id: string) {
    try {
      await cancel({ id, reason: "Cancelled by user" }).unwrap();
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  }

  const summaryCards = [
    { label: "Today", value: stats.today, icon: Calendar, color: "text-helix-600", bg: "bg-helix-50 dark:bg-helix-900/20" },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-health-600", bg: "bg-health-50 dark:bg-health-900/20" },
    { label: "Pending", value: stats.pending, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completed", value: stats.completed, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-muted-foreground text-sm">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""} found</p>
        <div className="flex items-center gap-2">
          {(role === "doctor" || role === "admin") && (
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
          )}
          {role === "patient" && (
            <button onClick={() => setShowBook(true)}
              className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
              <Plus className="w-4 h-4" /> Book Appointment
            </button>
          )}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={clsx("px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition",
              status === s ? "bg-helix-600 text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground")}>
            {s.replace("_", " ")}
          </button>
        ))}
        {dateFilter && (
          <button onClick={() => setDateFilter("")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Clear date
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No appointments found</p>
          {role === "patient" && (
            <button onClick={() => setShowBook(true)} className="mt-3 text-sm text-helix-600 hover:underline">Book your first appointment</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a, idx) => {
            const personName = role === "patient"
              ? `Dr. ${a.doctor?.user?.firstName ?? ""} ${a.doctor?.user?.lastName ?? ""}`.trim() || "Doctor"
              : `${a.patient?.firstName ?? ""} ${a.patient?.lastName ?? ""}`.trim() || "Patient";
            const initials = role === "patient"
              ? `${a.doctor?.user?.firstName?.[0] ?? ""}${a.doctor?.user?.lastName?.[0] ?? ""}`
              : `${a.patient?.firstName?.[0] ?? ""}${a.patient?.lastName?.[0] ?? ""}`;

            return (
              <div key={a.id} className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-4 hover:shadow-card-hover transition">
                {/* Date block */}
                <div className="w-12 text-center shrink-0">
                  <div className="text-xs font-semibold text-helix-600 uppercase">
                    {a.appointmentDate ? format(new Date(a.appointmentDate), "MMM") : "—"}
                  </div>
                  <div className="text-2xl font-bold leading-tight">
                    {a.appointmentDate ? format(new Date(a.appointmentDate), "d") : "—"}
                  </div>
                </div>
                <div className="w-px h-10 bg-border" />

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-helix-100 text-helix-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {initials || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate">{personName}</p>
                    {a.type && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 capitalize shrink-0">
                        {a.type.replace("_", " ")}
                      </span>
                    )}
                    {a.department?.name && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                        {a.department.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{a.reason}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.appointmentTime?.slice(0, 5) || "—"}</span>
                    {a.appointmentNumber && <span className="font-mono">#{a.appointmentNumber}</span>}
                  </div>
                </div>

                <StatusBadge status={a.status} />
                <div className="flex items-center gap-2 shrink-0">
                  {a.status === "confirmed" && role === "patient" && (
                    <button onClick={() => handleCancel(a.id)}
                      className="text-xs text-destructive hover:underline">Cancel</button>
                  )}
                  <Link href={`/appointments/${a.id}`} className="text-muted-foreground hover:text-foreground transition">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showBook && <BookAppointmentModal onClose={() => setShowBook(false)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-health-100 text-health-700",
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-helix-100 text-helix-700",
    cancelled: "bg-destructive/10 text-destructive",
    in_progress: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { Calendar, Plus, Clock, ChevronRight, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import type { RootState } from "@/store";
import { useGetMyAppointmentsQuery, useGetDoctorAppointmentsQuery, useGetAllQuery, useCancelMutation } from "@/store/api/appointmentsApi";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_TABS = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled"];

export default function AppointmentsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const [status, setStatus] = useState("all");
  const [showBook, setShowBook] = useState(false);

  const patientQ = useGetMyAppointmentsQuery({ status: status === "all" ? undefined : status }, { skip: role !== "patient" });
  const doctorQ = useGetDoctorAppointmentsQuery({ status: status === "all" ? undefined : status }, { skip: role !== "doctor" && role !== "nurse" });
  const adminQ = useGetAllQuery({ status: status === "all" ? undefined : status }, { skip: role !== "admin" });

  const query = role === "patient" ? patientQ : role === "admin" ? adminQ : doctorQ;
  const appointments: any[] = query.data?.data || [];
  const isLoading = query.isLoading;

  const [cancel] = useCancelMutation();

  async function handleCancel(id: string) {
    try {
      await cancel({ id, reason: "Cancelled by user" }).unwrap();
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""} found</p>
        {role === "patient" && (
          <button onClick={() => setShowBook(true)}
            className="flex items-center gap-2 px-4 py-2 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={clsx("px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition",
              status === s ? "bg-helix-600 text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground")}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
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
          {appointments.map((a) => (
            <div key={a.id} className="bg-card rounded-xl border shadow-card p-4 flex items-center gap-4 hover:shadow-card-hover transition">
              <div className="w-12 text-center shrink-0">
                <div className="text-xs font-semibold text-helix-600 uppercase">{format(new Date(a.scheduledAt), "MMM")}</div>
                <div className="text-2xl font-bold leading-tight">{format(new Date(a.scheduledAt), "d")}</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {role === "patient" ? `Dr. ${a.doctorName || "Doctor"}` : a.patientName || "Patient"}
                </p>
                <p className="text-sm text-muted-foreground truncate">{a.reason}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {format(new Date(a.scheduledAt), "h:mm a")}
                </div>
              </div>
              <StatusBadge status={a.status} />
              <div className="flex items-center gap-2">
                {a.status === "confirmed" && role === "patient" && (
                  <button onClick={() => handleCancel(a.id)}
                    className="text-xs text-destructive hover:underline">Cancel</button>
                )}
                <Link href={`/appointments/${a.id}`} className="text-muted-foreground hover:text-foreground transition">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
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

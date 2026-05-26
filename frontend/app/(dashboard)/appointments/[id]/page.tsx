"use client";
import { use, useState } from "react";
import { useSelector } from "react-redux";
import { useGetByIdQuery, useConfirmMutation, useStartMutation, useCompleteMutation, useCancelMutation } from "@/store/api/appointmentsApi";
import { ArrowLeft, Calendar, Clock, User, Loader2, CheckCircle, PlayCircle, XCircle, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import type { RootState } from "@/store";

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;
  const { data: appt, isLoading } = useGetByIdQuery(id);

  const [confirm, { isLoading: confirming }] = useConfirmMutation();
  const [start, { isLoading: starting }] = useStartMutation();
  const [complete, { isLoading: completing }] = useCompleteMutation();
  const [cancel] = useCancelMutation();

  const [showComplete, setShowComplete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [completeForm, setCompleteForm] = useState({ diagnosis: "", doctorNotes: "" });
  const [cancelReason, setCancelReason] = useState("");

  async function handleAction(action: "confirm" | "start") {
    try {
      if (action === "confirm") await confirm(id).unwrap();
      else if (action === "start") await start(id).unwrap();
      toast.success(`Appointment ${action}ed`);
    } catch {
      toast.error(`Failed to ${action} appointment`);
    }
  }

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    try {
      await complete({ id, diagnosis: completeForm.diagnosis || undefined, notes: completeForm.doctorNotes || undefined }).unwrap();
      toast.success("Appointment completed");
      setShowComplete(false);
    } catch {
      toast.error("Failed to complete appointment");
    }
  }

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault();
    try {
      await cancel({ id, reason: cancelReason || "Cancelled" }).unwrap();
      toast.success("Appointment cancelled");
      setShowCancel(false);
    } catch {
      toast.error("Failed to cancel appointment");
    }
  }

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>;
  if (!appt) return <div className="text-center py-16 text-muted-foreground">Appointment not found</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <Link href="/appointments" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" /> Back to Appointments
      </Link>

      <div className="bg-card rounded-xl border shadow-card p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold">Appointment Details</h2>
            <p className="text-xs text-muted-foreground">#{appt.id?.slice(-8).toUpperCase()}</p>
          </div>
          <StatusBadge status={appt.status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Calendar, label: "Date", value: appt.appointmentDate ? format(new Date(appt.appointmentDate), "EEEE, MMMM d, yyyy") : "—" },
            { icon: Clock, label: "Time", value: appt.appointmentTime || "—" },
            { icon: User, label: role === "patient" ? "Doctor" : "Patient", value: role === "patient" ? `Dr. ${appt.doctor?.user?.firstName ?? ""} ${appt.doctor?.user?.lastName ?? ""}`.trim() : `${appt.patient?.firstName ?? ""} ${appt.patient?.lastName ?? ""}`.trim() },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Reason</p>
            <p className="text-sm">{appt.reason}</p>
          </div>
          {appt.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{appt.notes}</p>
            </div>
          )}
          {appt.diagnosis && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Diagnosis</p>
              <p className="text-sm font-medium">{appt.diagnosis}</p>
            </div>
          )}
        </div>

        {(role === "doctor" || role === "admin") && (
          <div className="flex gap-2 mt-6 pt-4 border-t">
            {appt.status === "pending" && (
              <button onClick={() => handleAction("confirm")} disabled={confirming}
                className="flex items-center gap-2 px-4 h-9 bg-health-600 hover:bg-health-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
                {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm
              </button>
            )}
            {appt.status === "confirmed" && (
              <button onClick={() => handleAction("start")} disabled={starting}
                className="flex items-center gap-2 px-4 h-9 bg-helix-600 hover:bg-helix-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                Start
              </button>
            )}
            {appt.status === "in_progress" && (
              <button onClick={() => setShowComplete(true)}
                className="flex items-center gap-2 px-4 h-9 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition">
                <CheckCircle className="w-4 h-4" /> Complete
              </button>
            )}
            {!["completed", "cancelled"].includes(appt.status) && (
              <button onClick={() => setShowCancel(true)}
                className="flex items-center gap-2 px-4 h-9 border border-destructive/50 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/10 transition">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {showComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold">Complete Appointment</h3>
              <button onClick={() => setShowComplete(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleComplete} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Diagnosis</label>
                <input value={completeForm.diagnosis} onChange={(e) => setCompleteForm({ ...completeForm, diagnosis: e.target.value })}
                  placeholder="e.g. Hypertension, Stage 1"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Doctor Notes</label>
                <textarea value={completeForm.doctorNotes} onChange={(e) => setCompleteForm({ ...completeForm, doctorNotes: e.target.value })}
                  rows={3} placeholder="Treatment notes, follow-up instructions..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowComplete(false)}
                  className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
                <button type="submit" disabled={completing}
                  className="flex-1 h-10 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                  {completing && <Loader2 className="w-4 h-4 animate-spin" />} Mark Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold">Cancel Appointment</h3>
              <button onClick={() => setShowCancel(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCancel} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Reason</label>
                <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  rows={2} placeholder="Reason for cancellation..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCancel(false)}
                  className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Back</button>
                <button type="submit"
                  className="flex-1 h-10 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition">
                  Cancel Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    <span className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

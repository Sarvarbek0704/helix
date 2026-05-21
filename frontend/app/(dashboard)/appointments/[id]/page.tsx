"use client";
import { use } from "react";
import { useSelector } from "react-redux";
import { useGetByIdQuery, useConfirmMutation, useStartMutation, useCompleteMutation, useCancelMutation } from "@/store/api/appointmentsApi";
import { ArrowLeft, Calendar, Clock, User, Loader2, CheckCircle, PlayCircle, XCircle } from "lucide-react";
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

  async function handleAction(action: "confirm" | "start" | "complete" | "cancel") {
    try {
      if (action === "confirm") await confirm(id).unwrap();
      else if (action === "start") await start(id).unwrap();
      else if (action === "complete") await complete({ id }).unwrap();
      else await cancel({ id, reason: "Cancelled by staff" }).unwrap();
      toast.success(`Appointment ${action}ed`);
    } catch {
      toast.error(`Failed to ${action} appointment`);
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
            { icon: Calendar, label: "Date", value: format(new Date(appt.scheduledAt), "EEEE, MMMM d, yyyy") },
            { icon: Clock, label: "Time", value: format(new Date(appt.scheduledAt), "h:mm a") },
            { icon: User, label: role === "patient" ? "Doctor" : "Patient", value: role === "patient" ? `Dr. ${appt.doctorName}` : appt.patientName },
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
              <button onClick={() => handleAction("complete")} disabled={completing}
                className="flex items-center gap-2 px-4 h-9 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
                {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Complete
              </button>
            )}
            {!["completed", "cancelled"].includes(appt.status) && (
              <button onClick={() => handleAction("cancel")}
                className="flex items-center gap-2 px-4 h-9 border border-destructive/50 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/10 transition">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        )}
      </div>
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

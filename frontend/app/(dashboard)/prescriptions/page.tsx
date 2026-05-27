"use client";
import { useState } from "react";
import { useGetMyPrescriptionsQuery } from "@/store/api/prescriptionsApi";
import { Pill, QrCode, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function PrescriptionsPage() {
  const { data, isLoading } = useGetMyPrescriptionsQuery({ limit: 20 });
  const prescriptions = data?.data || [];
  const [qrPrescription, setQrPrescription] = useState<any | null>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [interactionsPrescriptionId, setInteractionsPrescriptionId] = useState<string | null>(null);

  async function checkInteractions(prescription: any) {
    const meds = (prescription.items || []).map((i: any) => i.medicationName).filter(Boolean);
    if (meds.length < 2) {
      toast.info("Need at least 2 medications to check interactions");
      return;
    }
    setCheckingInteractions(true);
    setInteractionsPrescriptionId(prescription.id);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api"}/prescriptions/check-interactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ medications: meds }),
        }
      );
      const resData = await res.json();
      setInteractions(resData.interactions || resData.data?.interactions || []);
    } catch {
      toast.error("Failed to check interactions");
    } finally {
      setCheckingInteractions(false);
    }
  }

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
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => checkInteractions(p)}
                    disabled={checkingInteractions && interactionsPrescriptionId === p.id}
                    className="text-xs px-2.5 py-1 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition flex items-center gap-1 disabled:opacity-60"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {checkingInteractions && interactionsPrescriptionId === p.id ? "Checking..." : "Check Interactions"}
                  </button>
                  <button
                    onClick={() => setQrPrescription(p)}
                    className="text-xs px-2.5 py-1 border rounded-lg hover:bg-muted transition flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> QR
                  </button>
                  <StatusBadge status={p.status} />
                </div>
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

              {/* Interaction results for this prescription */}
              {interactionsPrescriptionId === p.id && interactions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Drug Interactions Found</p>
                  {interactions.map((interaction: any, i: number) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                        interaction.severity === "high" || interaction.severity === "major"
                          ? "bg-destructive/10 text-destructive"
                          : interaction.severity === "moderate"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-50 text-blue-800"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold capitalize">{interaction.severity || "Unknown"} severity</p>
                        <p>{interaction.description || interaction.message || `${interaction.drug1} + ${interaction.drug2}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {interactionsPrescriptionId === p.id && interactions.length === 0 && !checkingInteractions && (
                <div className="mt-3 p-2.5 rounded-lg bg-health-50 text-health-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  No known drug interactions detected
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-semibold mb-1">Prescription QR Code</h3>
            <p className="text-xs text-muted-foreground mb-4">Show this at the pharmacy</p>
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                value={JSON.stringify({
                  id: qrPrescription.id,
                  date: qrPrescription.createdAt,
                  medications: (qrPrescription.items || []).map((i: any) => i.medicationName),
                  diagnosis: qrPrescription.diagnosis,
                })}
                size={200}
                level="M"
                includeMargin
              />
            </div>
            <p className="text-xs text-muted-foreground">Rx #{qrPrescription.id?.slice(-8).toUpperCase()}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 h-9 border rounded-lg text-sm hover:bg-muted transition"
              >
                Print
              </button>
              <button
                onClick={() => setQrPrescription(null)}
                className="flex-1 h-9 bg-helix-600 text-white rounded-lg text-sm hover:bg-helix-700 transition"
              >
                Close
              </button>
            </div>
          </div>
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

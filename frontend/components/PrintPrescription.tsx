"use client";
import { X, Printer } from "lucide-react";
import { format } from "date-fns";

interface PrintPrescriptionProps {
  prescription: any;
  onClose: () => void;
}

export function PrintPrescription({ prescription, onClose }: PrintPrescriptionProps) {
  const handlePrint = () => window.print();
  const meds = prescription.medications || [];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 print:bg-transparent print:p-0 print:inset-auto print:relative">
      <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto print:shadow-none print:rounded-none print:max-h-none">
        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="font-semibold text-lg">Prescription Preview</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-helix-600 text-white rounded-lg text-sm hover:bg-helix-700 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Prescription content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center border-b-2 border-helix-700 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-helix-700">HELIX Healthcare</h1>
            <p className="text-sm text-gray-500">123 Medical Center Drive | contact@helixhealthcare.com</p>
          </div>

          {/* Rx symbol */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-4xl font-serif text-helix-700 font-bold">℞</span>
            <div>
              <p className="text-xs text-gray-500">PRESCRIPTION</p>
              <p className="text-xs text-gray-400">#{prescription.id?.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-600">
                Date: {prescription.createdAt ? format(new Date(prescription.createdAt), "MMM d, yyyy") : "—"}
              </p>
              {prescription.validUntil && (
                <p className="text-sm text-gray-600">
                  Valid until: {format(new Date(prescription.validUntil), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Patient */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Patient</p>
              <p className="font-semibold">
                {prescription.patient
                  ? `${prescription.patient.firstName} ${prescription.patient.lastName}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Prescribed By</p>
              <p className="font-semibold">
                {prescription.doctor?.user
                  ? `Dr. ${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`
                  : "—"}
              </p>
              {prescription.doctor?.specialization && (
                <p className="text-xs text-gray-500">{prescription.doctor.specialization}</p>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Diagnosis</p>
              <p className="text-sm">{prescription.diagnosis}</p>
            </div>
          )}

          {/* Medications */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Medications</p>
            {meds.length > 0 ? (
              <div className="space-y-3">
                {meds.map((med: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-sm">{med.name}</p>
                      <p className="text-sm text-helix-700 font-medium">{med.dosage}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{med.frequency} — {med.duration}</p>
                    {med.instructions && <p className="text-xs text-gray-600 mt-1 italic">{med.instructions}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No medications listed</p>
            )}
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Notes</p>
              <p className="text-sm">{prescription.notes}</p>
            </div>
          )}

          {/* Signature */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
            <div className="flex justify-between">
              <div>
                <div className="w-40 border-b border-gray-400 mb-1 h-8" />
                <p className="text-xs text-gray-500">Patient Signature</p>
              </div>
              <div className="text-right">
                <div className="w-40 border-b border-gray-400 mb-1 h-8 ml-auto" />
                <p className="text-xs text-gray-500">Doctor Signature & Stamp</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            This prescription is valid only when signed and stamped by a licensed physician.
          </p>
        </div>
      </div>
    </div>
  );
}

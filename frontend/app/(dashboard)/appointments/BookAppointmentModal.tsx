"use client";
import { useState } from "react";
import { toast } from "sonner";
import { X, Loader2, Search } from "lucide-react";
import { useCreateMutation } from "@/store/api/appointmentsApi";
import { useGetAllDoctorsQuery } from "@/store/api/doctorsApi";
import { useGetAvailableSlotsQuery } from "@/store/api/schedulesApi";
import { format } from "date-fns";

interface Props { onClose: () => void; }

export function BookAppointmentModal({ onClose }: Props) {
  const [create, { isLoading }] = useCreateMutation();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: format(new Date(), "yyyy-MM-dd"),
    appointmentTime: "",
    type: "in_person" as "in_person" | "telemedicine" | "follow_up" | "emergency",
    reason: "",
    symptoms: "",
  });

  const { data: doctorsData } = useGetAllDoctorsQuery({ search, limit: 20 });
  const doctors = doctorsData?.data || [];
  const selectedDoctor = doctors.find((d: any) => d.id === form.doctorId);

  const { data: slotsData } = useGetAvailableSlotsQuery(
    { doctorId: form.doctorId, date: form.appointmentDate },
    { skip: !form.doctorId || !form.appointmentDate }
  );
  const availableSlots: { time: string; available: boolean }[] =
    (slotsData?.slots ?? []).filter((s: any) => s.available);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.appointmentTime) {
      toast.error("Please select or enter an appointment time");
      return;
    }
    try {
      await create({
        doctorId: form.doctorId,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        type: form.type,
        reason: form.reason,
        symptoms: form.symptoms || undefined,
      }).unwrap();
      toast.success("Appointment booked successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Booking failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Book Appointment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {step === 1 && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doctors..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {doctors.map((d: any) => (
                  <button key={d.id} type="button"
                    onClick={() => { setForm({ ...form, doctorId: d.id }); setStep(2); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-helix-500 hover:bg-helix-50/50 transition text-left">
                    <div className="w-9 h-9 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-sm font-bold shrink-0">
                      {d.user?.firstName?.[0]}{d.user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Dr. {d.user?.firstName} {d.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.specialization} · {d.department?.name}</p>
                    </div>
                  </button>
                ))}
                {doctors.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No doctors found</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-xs font-bold shrink-0">
                  {selectedDoctor?.user?.firstName?.[0]}{selectedDoctor?.user?.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{selectedDoctor?.specialization}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-helix-600 hover:underline">Change</button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Date</label>
                <input type="date" value={form.appointmentDate}
                  onChange={(e) => setForm({ ...form, appointmentDate: e.target.value, appointmentTime: "" })}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>

              {availableSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Available time</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button key={slot.time} type="button"
                        onClick={() => setForm({ ...form, appointmentTime: slot.time })}
                        className={`py-1.5 text-xs rounded-lg border transition font-medium ${
                          form.appointmentTime === slot.time ? "bg-helix-600 text-white border-helix-600" : "hover:border-helix-400"
                        }`}>
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableSlots.length === 0 && form.appointmentDate && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Time</label>
                  <input type="time" value={form.appointmentTime}
                    onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500">
                  <option value="in_person">In Person</option>
                  <option value="telemedicine">Telemedicine</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Reason for visit</label>
                <input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Symptoms (optional)</label>
                <textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                  rows={2} placeholder="Any symptoms to describe..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition">Cancel</button>
            {step === 2 && (
              <button type="submit" disabled={isLoading || !form.reason || !form.appointmentTime}
                className="flex-1 h-10 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Book Appointment
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import {
  useGetMyScheduleQuery,
  useCreateScheduleSlotMutation,
  useUpdateScheduleSlotMutation,
  useDeleteScheduleSlotMutation,
} from "@/store/api/schedulesApi";
import { Clock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DAYS = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

interface DaySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  slotDurationMinutes: number;
}

export default function SchedulePage() {
  const { data: fetchedSchedule, isLoading } = useGetMyScheduleQuery();
  const [create] = useCreateScheduleSlotMutation();
  const [update] = useUpdateScheduleSlotMutation();
  const [remove] = useDeleteScheduleSlotMutation();
  const [saving, setSaving] = useState(false);

  const [slots, setSlots] = useState<DaySlot[]>(
    DAYS.map((d) => ({
      dayOfWeek: d.value,
      startTime: "09:00",
      endTime: "17:00",
      isActive: d.value !== "saturday" && d.value !== "sunday",
      slotDurationMinutes: 30,
    }))
  );

  useEffect(() => {
    if (!fetchedSchedule) return;
    setSlots(
      DAYS.map((d) => {
        const existing = (fetchedSchedule as any[]).find(
          (s: any) => s.dayOfWeek === d.value
        );
        return existing
          ? { id: existing.id, dayOfWeek: d.value, startTime: existing.startTime, endTime: existing.endTime, isActive: existing.isActive, slotDurationMinutes: existing.slotDurationMinutes }
          : { dayOfWeek: d.value, startTime: "09:00", endTime: "17:00", isActive: false, slotDurationMinutes: 30 };
      })
    );
  }, [fetchedSchedule]);

  function toggle(day: string) {
    setSlots(slots.map((s) => (s.dayOfWeek === day ? { ...s, isActive: !s.isActive } : s)));
  }

  function setTime(day: string, field: "startTime" | "endTime", val: string) {
    setSlots(slots.map((s) => (s.dayOfWeek === day ? { ...s, [field]: val } : s)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(
        slots.map(async (slot) => {
          if (slot.isActive && !slot.id) {
            await create({ dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, slotDurationMinutes: slot.slotDurationMinutes }).unwrap();
          } else if (slot.isActive && slot.id) {
            await update({ id: slot.id, startTime: slot.startTime, endTime: slot.endTime, isActive: true }).unwrap();
          } else if (!slot.isActive && slot.id) {
            await remove(slot.id).unwrap();
          }
        })
      );
      toast.success("Schedule updated");
    } catch {
      toast.error("Failed to update schedule");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <p className="text-muted-foreground text-sm">Set your weekly availability for appointments.</p>

      {isLoading ? (
        <div className="space-y-3">{[...Array(7)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="bg-card rounded-xl border shadow-card divide-y">
          {slots.map((slot) => {
            const label = DAYS.find((d) => d.value === slot.dayOfWeek)?.label ?? slot.dayOfWeek;
            return (
              <div key={slot.dayOfWeek} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-28 flex items-center gap-2.5">
                  <button onClick={() => toggle(slot.dayOfWeek)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${slot.isActive ? "bg-helix-600" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${slot.isActive ? "translate-x-4" : ""}`} />
                  </button>
                  <span className={`text-sm font-medium ${!slot.isActive && "text-muted-foreground"}`}>{label.slice(0, 3)}</span>
                </div>
                {slot.isActive ? (
                  <div className="flex items-center gap-2 text-sm flex-1">
                    <input type="time" value={slot.startTime} onChange={(e) => setTime(slot.dayOfWeek, "startTime", e.target.value)}
                      className="h-8 px-2 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-helix-500" />
                    <span className="text-muted-foreground">to</span>
                    <input type="time" value={slot.endTime} onChange={(e) => setTime(slot.dayOfWeek, "endTime", e.target.value)}
                      className="h-8 px-2 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 flex-1">
                    <Clock className="w-3.5 h-3.5" /> Not available
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-5 h-10 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save schedule
      </button>
    </div>
  );
}

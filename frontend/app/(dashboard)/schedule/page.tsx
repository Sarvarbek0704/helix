"use client";
import { useState, useEffect } from "react";
import { useGetMyScheduleQuery, useUpdateMyScheduleMutation } from "@/store/api/schedulesApi";
import { Clock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Slot { day: string; startTime: string; endTime: string; isAvailable: boolean; }

const DEFAULT: Slot[] = DAYS.map((day) => ({
  day,
  startTime: "09:00",
  endTime: "17:00",
  isAvailable: day !== "Saturday" && day !== "Sunday",
}));

export default function SchedulePage() {
  const { data, isLoading } = useGetMyScheduleQuery();
  const [update, { isLoading: saving }] = useUpdateMyScheduleMutation();
  const [slots, setSlots] = useState<Slot[]>(DEFAULT);

  useEffect(() => {
    if (data?.length) setSlots(data);
  }, [data]);

  function toggle(day: string) {
    setSlots(slots.map((s) => s.day === day ? { ...s, isAvailable: !s.isAvailable } : s));
  }

  function setTime(day: string, field: "startTime" | "endTime", val: string) {
    setSlots(slots.map((s) => s.day === day ? { ...s, [field]: val } : s));
  }

  async function handleSave() {
    try {
      await update(slots).unwrap();
      toast.success("Schedule updated");
    } catch {
      toast.error("Failed to update schedule");
    }
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <p className="text-muted-foreground text-sm">Set your weekly availability for appointments.</p>

      {isLoading ? (
        <div className="space-y-3">{[...Array(7)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="bg-card rounded-xl border shadow-card divide-y">
          {slots.map((slot) => (
            <div key={slot.day} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-28 flex items-center gap-2.5">
                <button onClick={() => toggle(slot.day)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${slot.isAvailable ? "bg-helix-600" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${slot.isAvailable ? "translate-x-4" : ""}`} />
                </button>
                <span className={`text-sm font-medium ${!slot.isAvailable && "text-muted-foreground"}`}>{slot.day.slice(0, 3)}</span>
              </div>
              {slot.isAvailable ? (
                <div className="flex items-center gap-2 text-sm flex-1">
                  <input type="time" value={slot.startTime} onChange={(e) => setTime(slot.day, "startTime", e.target.value)}
                    className="h-8 px-2 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  <span className="text-muted-foreground">to</span>
                  <input type="time" value={slot.endTime} onChange={(e) => setTime(slot.day, "endTime", e.target.value)}
                    className="h-8 px-2 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-helix-500" />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground flex items-center gap-1.5 flex-1">
                  <Clock className="w-3.5 h-3.5" /> Not available
                </span>
              )}
            </div>
          ))}
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

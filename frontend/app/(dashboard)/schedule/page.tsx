"use client";
import { useState, useEffect } from "react";
import {
  useGetMyScheduleQuery,
  useCreateScheduleSlotMutation,
  useUpdateScheduleSlotMutation,
  useDeleteScheduleSlotMutation,
} from "@/store/api/schedulesApi";
import { useGetDoctorAppointmentsQuery } from "@/store/api/appointmentsApi";
import { Clock, Save, Loader2, Calendar, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfWeek } from "date-fns";

const DAYS = [
  { label: "Monday", short: "Mon", value: "monday" },
  { label: "Tuesday", short: "Tue", value: "tuesday" },
  { label: "Wednesday", short: "Wed", value: "wednesday" },
  { label: "Thursday", short: "Thu", value: "thursday" },
  { label: "Friday", short: "Fri", value: "friday" },
  { label: "Saturday", short: "Sat", value: "saturday" },
  { label: "Sunday", short: "Sun", value: "sunday" },
];

interface DaySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  slotDurationMinutes: number;
}

function getWeekDates(weekOffset: number) {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  return DAYS.map((_, i) => addDays(monday, i + weekOffset * 7));
}

export default function SchedulePage() {
  const { data: fetchedSchedule, isLoading } = useGetMyScheduleQuery();
  const [create] = useCreateScheduleSlotMutation();
  const [update] = useUpdateScheduleSlotMutation();
  const [remove] = useDeleteScheduleSlotMutation();
  const [saving, setSaving] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const nextMonday = weekDates[0];
  const nextSunday = weekDates[6];

  const { data: upcomingAppts } = useGetDoctorAppointmentsQuery({
    limit: 20,
  });

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
        const existing = (fetchedSchedule as any[]).find((s: any) => s.dayOfWeek === d.value);
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

  function setDuration(day: string, val: number) {
    setSlots(slots.map((s) => (s.dayOfWeek === day ? { ...s, slotDurationMinutes: val } : s)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(
        slots.map(async (slot) => {
          if (slot.isActive && !slot.id) {
            await create({ dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, slotDurationMinutes: slot.slotDurationMinutes }).unwrap();
          } else if (slot.isActive && slot.id) {
            await update({ id: slot.id, startTime: slot.startTime, endTime: slot.endTime, isActive: true, slotDurationMinutes: slot.slotDurationMinutes }).unwrap();
          } else if (!slot.isActive && slot.id) {
            await remove(slot.id).unwrap();
          }
        })
      );
      toast.success("Schedule updated successfully");
    } catch {
      toast.error("Failed to update schedule");
    } finally {
      setSaving(false);
    }
  }

  const activeDays = slots.filter((s) => s.isActive).length;
  const appts = upcomingAppts?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Configure your weekly availability for patient appointments.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-muted">
            {activeDays} day{activeDays !== 1 ? "s" : ""} active
          </span>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 h-9 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      {/* Weekly calendar overview */}
      <div className="bg-card rounded-xl border shadow-card">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-helix-600" /> Weekly Overview
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-lg hover:bg-muted transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">
              {format(nextMonday, "MMM d")} – {format(nextSunday, "MMM d, yyyy")}
            </span>
            <button onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-lg hover:bg-muted transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 divide-x text-center">
          {DAYS.map((day, idx) => {
            const date = weekDates[idx];
            const slot = slots.find((s) => s.dayOfWeek === day.value);
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const dayAppts = appts.filter((a: any) => a.appointmentDate === format(date, "yyyy-MM-dd"));
            return (
              <div key={day.value} className={`py-3 px-1 ${isToday ? "bg-helix-50 dark:bg-helix-900/20" : ""}`}>
                <p className="text-xs font-medium text-muted-foreground">{day.short}</p>
                <p className={`text-sm font-bold mt-0.5 ${isToday ? "text-helix-600" : ""}`}>{format(date, "d")}</p>
                <div className="mt-1.5">
                  {slot?.isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-health-500 mx-auto" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                  )}
                </div>
                {dayAppts.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs font-semibold text-helix-600 bg-helix-50 px-1.5 py-0.5 rounded-full">
                      {dayAppts.length}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule editor */}
      <div className="bg-card rounded-xl border shadow-card">
        <div className="px-5 py-3.5 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-helix-600" /> Availability Settings
          </h3>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">{[...Array(7)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : (
          <div className="divide-y">
            {slots.map((slot) => {
              const day = DAYS.find((d) => d.value === slot.dayOfWeek)!;
              const isWeekend = slot.dayOfWeek === "saturday" || slot.dayOfWeek === "sunday";
              return (
                <div key={slot.dayOfWeek}
                  className={`flex items-center gap-4 px-5 py-4 ${!slot.isActive ? "opacity-60" : ""}`}>
                  {/* Toggle */}
                  <button onClick={() => toggle(slot.dayOfWeek)}
                    className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${slot.isActive ? "bg-helix-600" : "bg-muted"}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${slot.isActive ? "translate-x-4" : ""}`} />
                  </button>

                  {/* Day name */}
                  <div className="w-28 shrink-0">
                    <p className="text-sm font-semibold">{day.label}</p>
                    {isWeekend && <p className="text-xs text-muted-foreground">Weekend</p>}
                  </div>

                  {/* Time inputs */}
                  {slot.isActive ? (
                    <>
                      <div className="flex items-center gap-2 text-sm flex-1">
                        <input type="time" value={slot.startTime}
                          onChange={(e) => setTime(slot.dayOfWeek, "startTime", e.target.value)}
                          className="h-8 px-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-helix-500" />
                        <span className="text-muted-foreground text-xs">to</span>
                        <input type="time" value={slot.endTime}
                          onChange={(e) => setTime(slot.dayOfWeek, "endTime", e.target.value)}
                          className="h-8 px-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-helix-500" />
                      </div>
                      <div className="shrink-0">
                        <select value={slot.slotDurationMinutes}
                          onChange={(e) => setDuration(slot.dayOfWeek, Number(e.target.value))}
                          className="h-8 px-2 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-helix-500">
                          <option value={15}>15 min slots</option>
                          <option value={20}>20 min slots</option>
                          <option value={30}>30 min slots</option>
                          <option value={45}>45 min slots</option>
                          <option value={60}>60 min slots</option>
                        </select>
                      </div>
                      {slot.startTime && slot.endTime && (
                        <div className="text-xs text-muted-foreground shrink-0 hidden lg:block">
                          ~{Math.floor((
                            (parseInt(slot.endTime.split(":")[0]) * 60 + parseInt(slot.endTime.split(":")[1])) -
                            (parseInt(slot.startTime.split(":")[0]) * 60 + parseInt(slot.startTime.split(":")[1]))
                          ) / slot.slotDurationMinutes)} slots
                        </div>
                      )}
                    </>
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
      </div>

      {/* Upcoming appointments for the week */}
      {appts.length > 0 && (
        <div className="bg-card rounded-xl border shadow-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-helix-600" /> Upcoming Appointments
          </h3>
          <div className="space-y-2">
            {appts.slice(0, 6).map((a: any) => (
              <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <div className="w-20 shrink-0">
                  <p className="text-xs font-semibold text-helix-600">{a.appointmentDate}</p>
                  <p className="text-xs text-muted-foreground">{a.appointmentTime?.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : "Patient"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{a.reason}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                  a.status === "confirmed" ? "bg-health-100 text-health-700" :
                  a.status === "pending" ? "bg-amber-100 text-amber-700" :
                  "bg-muted text-muted-foreground"
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

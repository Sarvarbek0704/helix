"use client";
import { useSelector } from "react-redux";
import { useGetMyVitalsQuery } from "@/store/api/vitalsApi";
import { Activity, Heart, Thermometer, Wind, Weight } from "lucide-react";
import { format } from "date-fns";
import type { RootState } from "@/store";

export default function VitalsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { data, isLoading } = useGetMyVitalsQuery({ limit: 20 });
  const vitals = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : vitals.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No vitals recorded yet</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl border shadow-card p-5">
            <h3 className="font-semibold mb-4">Latest Readings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Blood Pressure", value: vitals[0]?.systolicBP && vitals[0]?.diastolicBP ? `${vitals[0].systolicBP}/${vitals[0].diastolicBP}` : null, unit: "mmHg", icon: Heart, color: "text-rose-600" },
                { label: "Heart Rate", value: vitals[0]?.heartRate, unit: "bpm", icon: Activity, color: "text-helix-600" },
                { label: "Temperature", value: vitals[0]?.temperature, unit: "°C", icon: Thermometer, color: "text-amber-600" },
                { label: "O₂ Saturation", value: vitals[0]?.oxygenSaturation, unit: "%", icon: Wind, color: "text-health-600" },
              ].map(({ label, value, unit, icon: Icon, color }) => (
                <div key={label} className="p-4 rounded-xl bg-muted/50 flex items-start gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value || "—"}</p>
                    <p className="text-xs text-muted-foreground">{unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">History</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground uppercase">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Blood Pressure</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Heart Rate</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Temp</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">O₂ Sat</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vitals.map((v: any) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition text-sm">
                    <td className="px-4 py-3 text-muted-foreground">{format(new Date(v.createdAt), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3 font-medium">{v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP}` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{v.heartRate ? `${v.heartRate} bpm` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{v.temperature ? `${v.temperature}°C` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{v.oxygenSaturation ? `${v.oxygenSaturation}%` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{v.weight ? `${v.weight} kg` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

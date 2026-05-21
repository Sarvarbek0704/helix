import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

type Color = "helix" | "health" | "amber" | "purple";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: Color;
  change?: string;
  loading?: boolean;
}

const styles: Record<Color, string> = {
  helix: "bg-helix-50 text-helix-600 dark:bg-helix-900/30 dark:text-helix-300",
  health: "bg-health-50 text-health-600 dark:bg-health-900/30 dark:text-health-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
};

export function StatCard({ label, value, icon: Icon, color, change, loading }: Props) {
  return (
    <div className="bg-card rounded-xl border shadow-card p-5">
      <div className="flex items-start justify-between">
        <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", styles[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {change && <p className="text-xs text-health-600 dark:text-health-400 mt-1">{change}</p>}
      </div>
    </div>
  );
}

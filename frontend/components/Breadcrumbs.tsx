"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Patients",
  doctors: "Doctors",
  appointments: "Appointments",
  departments: "Departments",
  "medical-records": "Medical Records",
  vitals: "Vitals",
  prescriptions: "Prescriptions",
  lab: "Lab",
  billing: "Billing",
  insurance: "Insurance",
  medications: "Medications",
  notifications: "Notifications",
  settings: "Settings",
  schedule: "Schedule",
  users: "Users",
  audit: "Audit Logs",
  workload: "Workload",
  timeline: "Timeline",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABELS[seg] || (seg.length > 16 ? seg.slice(0, 8) + "…" : seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4 flex-wrap">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((c) => (
        <span key={c.href} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 shrink-0" />
          {c.isLast ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

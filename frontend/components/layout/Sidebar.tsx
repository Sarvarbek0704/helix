"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clsx } from "clsx";
import {
  Heart, LayoutDashboard, Users, UserCheck, Calendar, FileText,
  Activity, FlaskConical, Pill, CreditCard, Bell, Settings, LogOut,
  Building2, Stethoscope, ChevronLeft, UserCog, Shield,
} from "lucide-react";
import { logout } from "@/store/slices/authSlice";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { RootState } from "@/store";

const NAV = {
  admin: [
    { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
    { href: "/users", icon: UserCog, key: "nav.users" },
    { href: "/patients", icon: Users, key: "nav.patients" },
    { href: "/doctors", icon: Stethoscope, key: "nav.doctors" },
    { href: "/appointments", icon: Calendar, key: "nav.appointments" },
    { href: "/departments", icon: Building2, key: "nav.departments" },
    { href: "/billing", icon: CreditCard, key: "nav.billing" },
    { href: "/insurance", icon: Shield, key: "nav.insurance" },
    { href: "/medications", icon: Pill, key: "nav.medications" },
    { href: "/users/workload", icon: Activity, key: "nav.workload" },
    { href: "/notifications", icon: Bell, key: "nav.notifications" },
    { href: "/settings", icon: Settings, key: "nav.settings" },
    { href: "/settings/audit", icon: Shield, key: "nav.audit" },
  ],
  patient: [
    { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
    { href: "/appointments", icon: Calendar, key: "nav.appointments" },
    { href: "/medical-records", icon: FileText, key: "nav.medical_records" },
    { href: "/vitals", icon: Activity, key: "nav.vitals" },
    { href: "/prescriptions", icon: Pill, key: "nav.prescriptions" },
    { href: "/lab", icon: FlaskConical, key: "nav.lab_results" },
    { href: "/billing", icon: CreditCard, key: "nav.billing" },
    { href: "/insurance", icon: Shield, key: "nav.insurance" },
    { href: "/notifications", icon: Bell, key: "nav.notifications" },
    { href: "/settings", icon: Settings, key: "nav.settings" },
  ],
  doctor: [
    { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
    { href: "/patients", icon: Users, key: "nav.patients" },
    { href: "/appointments", icon: Calendar, key: "nav.appointments" },
    { href: "/medical-records", icon: FileText, key: "nav.records" },
    { href: "/prescriptions", icon: Pill, key: "nav.prescriptions" },
    { href: "/lab", icon: FlaskConical, key: "nav.lab_orders" },
    { href: "/medications", icon: Pill, key: "nav.medications" },
    { href: "/schedule", icon: UserCheck, key: "nav.schedule" },
    { href: "/notifications", icon: Bell, key: "nav.notifications" },
    { href: "/settings", icon: Settings, key: "nav.settings" },
  ],
  nurse: [
    { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
    { href: "/patients", icon: Users, key: "nav.patients" },
    { href: "/appointments", icon: Calendar, key: "nav.appointments" },
    { href: "/vitals", icon: Activity, key: "nav.record_vitals" },
    { href: "/notifications", icon: Bell, key: "nav.notifications" },
    { href: "/settings", icon: Settings, key: "nav.settings" },
  ],
  lab_tech: [
    { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
    { href: "/lab", icon: FlaskConical, key: "nav.lab_orders" },
    { href: "/notifications", icon: Bell, key: "nav.notifications" },
    { href: "/settings", icon: Settings, key: "nav.settings" },
  ],
};

interface Props { collapsed: boolean; onToggle: () => void; onMobileClose?: () => void; }

export function Sidebar({ collapsed, onToggle, onMobileClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role || "patient";
  const navItems = NAV[role as keyof typeof NAV] || NAV.patient;
  const { t } = useT();

  return (
    <aside className={clsx(
      "h-screen flex flex-col border-r bg-card transition-all duration-300 shrink-0",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-helix-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-helix-600">Helix</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-helix-600 rounded-lg flex items-center justify-center mx-auto">
            <Heart className="w-4 h-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={onToggle} className="flex justify-center py-2 text-muted-foreground hover:text-foreground transition">
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      )}

      {!collapsed && (
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 font-semibold text-sm shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground capitalize">{role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
        {navItems.map(({ href, icon: Icon, key }) => {
          const label = t(key);
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={onMobileClose}
              className={clsx(
                "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition",
                active ? "bg-helix-50 text-helix-700 font-semibold dark:bg-helix-900/30 dark:text-helix-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center"
              )}>
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-3 pb-2">
          <LanguageSwitcher />
        </div>
      )}

      <div className="p-2 border-t">
        <button onClick={() => { dispatch(logout()); router.push("/login"); }}
          className={clsx("w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition", collapsed && "justify-center")}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && t("nav.signout")}
        </button>
      </div>
    </aside>
  );
}

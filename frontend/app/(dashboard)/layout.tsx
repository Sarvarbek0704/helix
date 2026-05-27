"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LanguageProvider, useT } from "@/lib/i18n";
import { GlobalSearch } from "@/components/GlobalSearch";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { RootState } from "@/store";

const TITLE_KEYS: Record<string, string> = {
  "/dashboard": "nav.dashboard",
  "/patients": "nav.patients",
  "/doctors": "nav.doctors",
  "/appointments": "nav.appointments",
  "/departments": "nav.departments",
  "/medical-records": "nav.medical_records",
  "/vitals": "nav.vitals",
  "/prescriptions": "nav.prescriptions",
  "/lab": "nav.lab",
  "/billing": "nav.billing",
  "/insurance": "nav.insurance",
  "/medications": "nav.medications",
  "/notifications": "nav.notifications",
  "/settings": "nav.settings",
  "/schedule": "nav.schedule",
  "/users": "nav.users",
};

function Inner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const user = useSelector((s: RootState) => s.auth.user);
  const { t } = useT();

  const titleKey = Object.entries(TITLE_KEYS).find(([key]) => pathname === key || pathname.startsWith(key + "/"))?.[1];
  const title = titleKey ? t(titleKey) : "Helix";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 md:static md:flex md:z-auto transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onMobileClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        {(user as any)?.isDemo && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-sm text-amber-800 dark:text-amber-200 text-center font-medium">
            {t("demo.banner")}
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Breadcrumbs />
          {children}
        </main>
        <GlobalSearch />
        <KeyboardShortcuts />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Inner>{children}</Inner>
    </LanguageProvider>
  );
}

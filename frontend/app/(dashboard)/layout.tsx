"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/patients": "Patients",
  "/doctors": "Doctors",
  "/appointments": "Appointments",
  "/departments": "Departments",
  "/medical-records": "Medical Records",
  "/vitals": "Vitals",
  "/prescriptions": "Prescriptions",
  "/lab": "Lab",
  "/billing": "Billing",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/schedule": "My Schedule",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const title = Object.entries(TITLES).find(([key]) => pathname === key || pathname.startsWith(key + "/"))?.[1] || "Helix";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

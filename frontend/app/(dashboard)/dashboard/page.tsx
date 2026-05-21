"use client";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { AdminDashboard } from "./AdminDashboard";
import { PatientDashboard } from "./PatientDashboard";
import { DoctorDashboard } from "./DoctorDashboard";

export default function DashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;

  if (role === "admin") return <AdminDashboard />;
  if (role === "doctor") return <DoctorDashboard />;
  return <PatientDashboard />;
}

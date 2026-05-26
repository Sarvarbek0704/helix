"use client";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { AdminDashboard } from "./AdminDashboard";
import { PatientDashboard } from "./PatientDashboard";
import { DoctorDashboard } from "./DoctorDashboard";
import { NurseDashboard } from "./NurseDashboard";
import { LabTechDashboard } from "./LabTechDashboard";

export default function DashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;

  if (role === "admin") return <AdminDashboard />;
  if (role === "doctor") return <DoctorDashboard />;
  if (role === "nurse") return <NurseDashboard />;
  if (role === "lab_tech") return <LabTechDashboard />;
  return <PatientDashboard />;
}

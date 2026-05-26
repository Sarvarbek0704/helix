"use client";
import { use } from "react";
import { useGetDoctorByIdQuery } from "@/store/api/doctorsApi";
import { ArrowLeft, Star, Stethoscope, Building2, Globe, GraduationCap, Clock, UserCheck } from "lucide-react";
import Link from "next/link";

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: doctor, isLoading } = useGetDoctorByIdQuery(id);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (!doctor) return <div className="text-center py-16 text-muted-foreground">Doctor not found</div>;

  const u = doctor.user;

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <Link href="/doctors" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" /> Back to Doctors
      </Link>

      <div className="bg-card rounded-xl border shadow-card p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-3xl font-bold shrink-0">
            {u?.firstName?.[0]}{u?.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold">Dr. {u?.firstName} {u?.lastName}</h2>
                <p className="text-helix-600 font-medium mt-0.5">{doctor.specialization}</p>
                {doctor.subSpecialization && (
                  <p className="text-sm text-muted-foreground">{doctor.subSpecialization}</p>
                )}
              </div>
              {doctor.isAcceptingPatients && (
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-health-100 text-health-700 rounded-full font-medium">
                  <UserCheck className="w-3 h-3" /> Accepting Patients
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
              {doctor.department?.name && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" /> {doctor.department.name}
                </div>
              )}
              {doctor.yearsOfExperience && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {doctor.yearsOfExperience} years experience
                </div>
              )}
              {doctor.rating > 0 && (
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  {Number(doctor.rating).toFixed(1)} ({doctor.reviewCount} reviews)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Patients", value: doctor.totalPatients || 0, icon: "👥" },
          { label: "Appointments", value: doctor.totalAppointments || 0, icon: "📅" },
          { label: "Consultation Fee", value: doctor.consultationFee ? `$${doctor.consultationFee}` : "—", icon: "💳" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-card rounded-xl border shadow-card p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {doctor.bio && (
        <div className="bg-card rounded-xl border shadow-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Stethoscope className="w-4 h-4 text-helix-600" /> About
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{doctor.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctor.education && (
          <div className="bg-card rounded-xl border shadow-card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-helix-600" /> Education
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{doctor.education}</p>
          </div>
        )}

        {doctor.languages?.length > 0 && (
          <div className="bg-card rounded-xl border shadow-card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-helix-600" /> Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((lang: string) => (
                <span key={lang} className="text-xs px-2.5 py-1 bg-helix-50 text-helix-700 dark:bg-helix-900/30 dark:text-helix-300 rounded-full">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border shadow-card p-5">
        <h3 className="font-semibold mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {u?.email && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <p className="text-sm font-medium">{u.email}</p>
            </div>
          )}
          {u?.phone && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
              <p className="text-sm font-medium">{u.phone}</p>
            </div>
          )}
          {doctor.licenseNumber && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">License Number</p>
              <p className="text-sm font-medium">{doctor.licenseNumber}</p>
            </div>
          )}
          {doctor.doctorNumber && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Doctor ID</p>
              <p className="text-sm font-medium">{doctor.doctorNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

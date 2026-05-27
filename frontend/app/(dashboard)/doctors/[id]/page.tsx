"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetDoctorByIdQuery } from "@/store/api/doctorsApi";
import { useAddToWaitlistMutation } from "@/store/api/waitlistApi";
import { ArrowLeft, Star, Stethoscope, Building2, Globe, GraduationCap, Clock, UserCheck, Users, Calendar, CreditCard, ListPlus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { RootState } from "@/store";

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: doctor, isLoading } = useGetDoctorByIdQuery(id);
  const user = useSelector((s: RootState) => s.auth.user);
  const isPatient = user?.role === "patient";

  const [addToWaitlist, { isLoading: addingWaitlist }] = useAddToWaitlistMutation();
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({ preferredDate: "", reason: "" });

  async function handleJoinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addToWaitlist({
        doctorId: id,
        preferredDate: waitlistForm.preferredDate || undefined,
        reason: waitlistForm.reason || undefined,
      }).unwrap();
      toast.success("Added to waitlist successfully");
      setShowWaitlistModal(false);
      setWaitlistForm({ preferredDate: "", reason: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to join waitlist");
    }
  }

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
              <div className="flex items-center gap-2 flex-wrap">
                {doctor.isAcceptingPatients && (
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-health-100 text-health-700 rounded-full font-medium">
                    <UserCheck className="w-3 h-3" /> Accepting Patients
                  </span>
                )}
                {isPatient && (
                  <button
                    onClick={() => setShowWaitlistModal(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-helix-600 hover:bg-helix-700 text-white rounded-full font-medium transition"
                  >
                    <ListPlus className="w-3.5 h-3.5" /> Join Waitlist
                  </button>
                )}
              </div>
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
          { label: "Total Patients", value: doctor.totalPatients || 0, icon: Users },
          { label: "Appointments", value: doctor.totalAppointments || 0, icon: Calendar },
          { label: "Consultation Fee", value: doctor.consultationFee ? `$${doctor.consultationFee}` : "—", icon: CreditCard },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border shadow-card p-4 text-center">
            <div className="flex justify-center mb-2">
              <Icon className="w-6 h-6 text-helix-600" />
            </div>
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

      {/* Join Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold">Join Waitlist</h3>
              <button onClick={() => setShowWaitlistModal(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleJoinWaitlist} className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Join the waitlist for Dr. {u?.firstName} {u?.lastName}. You&apos;ll be notified when an appointment slot opens up.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1.5">Preferred Date (optional)</label>
                <input
                  type="date"
                  value={waitlistForm.preferredDate}
                  onChange={(e) => setWaitlistForm({ ...waitlistForm, preferredDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Reason (optional)</label>
                <textarea
                  value={waitlistForm.reason}
                  onChange={(e) => setWaitlistForm({ ...waitlistForm, reason: e.target.value })}
                  rows={3}
                  placeholder="Brief description of your concern..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowWaitlistModal(false)}
                  className="flex-1 h-10 border rounded-lg text-sm font-medium hover:bg-muted transition">
                  Cancel
                </button>
                <button type="submit" disabled={addingWaitlist}
                  className="flex-1 h-10 bg-helix-600 text-white rounded-lg text-sm font-semibold hover:bg-helix-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                  {addingWaitlist && <Loader2 className="w-4 h-4 animate-spin" />}
                  Join Waitlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

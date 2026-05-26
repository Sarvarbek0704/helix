"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { User, Lock, Loader2, Eye, EyeOff, Stethoscope } from "lucide-react";
import { useUpdateMeMutation } from "@/store/api/usersApi";
import { useChangePasswordMutation } from "@/store/api/authApi";
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from "@/store/api/doctorsApi";
import { setUser } from "@/store/slices/authSlice";
import type { RootState } from "@/store";

export default function SettingsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const [tab, setTab] = useState<"profile" | "password" | "doctor">("profile");

  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [changePass, { isLoading: changing }] = useChangePasswordMutation();
  const { data: doctorProfile } = useGetMyProfileQuery(undefined, { skip: user?.role !== "doctor" });
  const [updateDoctorProfile, { isLoading: savingDoctor }] = useUpdateMyProfileMutation();

  const [doctorForm, setDoctorForm] = useState({
    specialization: "", subSpecialization: "", bio: "", education: "",
    yearsOfExperience: "", consultationFee: "", followUpFee: "",
    licenseNumber: "", languages: "", isAcceptingPatients: true,
  });

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  const resolvedDoctorForm = doctorProfile ? {
    specialization: doctorForm.specialization || doctorProfile.specialization || "",
    subSpecialization: doctorForm.subSpecialization || doctorProfile.subSpecialization || "",
    bio: doctorForm.bio || doctorProfile.bio || "",
    education: doctorForm.education || doctorProfile.education || "",
    yearsOfExperience: doctorForm.yearsOfExperience || String(doctorProfile.yearsOfExperience || ""),
    consultationFee: doctorForm.consultationFee || String(doctorProfile.consultationFee || ""),
    followUpFee: doctorForm.followUpFee || String(doctorProfile.followUpFee || ""),
    licenseNumber: doctorForm.licenseNumber || doctorProfile.licenseNumber || "",
    languages: doctorForm.languages || (doctorProfile.languages || []).join(", "),
    isAcceptingPatients: doctorForm.isAcceptingPatients,
  } : doctorForm;

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updated = await updateMe(profile).unwrap();
      dispatch(setUser(updated));
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  async function handleDoctorProfileSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        specialization: resolvedDoctorForm.specialization,
        subSpecialization: resolvedDoctorForm.subSpecialization || undefined,
        bio: resolvedDoctorForm.bio || undefined,
        education: resolvedDoctorForm.education || undefined,
        licenseNumber: resolvedDoctorForm.licenseNumber || undefined,
        isAcceptingPatients: resolvedDoctorForm.isAcceptingPatients,
      };
      if (resolvedDoctorForm.yearsOfExperience) payload.yearsOfExperience = Number(resolvedDoctorForm.yearsOfExperience);
      if (resolvedDoctorForm.consultationFee) payload.consultationFee = Number(resolvedDoctorForm.consultationFee);
      if (resolvedDoctorForm.followUpFee) payload.followUpFee = Number(resolvedDoctorForm.followUpFee);
      if (resolvedDoctorForm.languages) payload.languages = resolvedDoctorForm.languages.split(",").map((l: string) => l.trim()).filter(Boolean);
      await updateDoctorProfile(payload).unwrap();
      toast.success("Doctor profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      await changePass({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }).unwrap();
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change password");
    }
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <div className="flex gap-1.5 flex-wrap">
        {([["profile", User, "Profile"], ["password", Lock, "Password"]] as const).map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === key ? "bg-helix-600 text-white" : "bg-muted text-muted-foreground"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
        {user?.role === "doctor" && (
          <button onClick={() => setTab("doctor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "doctor" ? "bg-helix-600 text-white" : "bg-muted text-muted-foreground"}`}>
            <Stethoscope className="w-4 h-4" /> Doctor Profile
          </button>
        )}
      </div>

      {tab === "profile" && (
        <div className="bg-card rounded-xl border shadow-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-2xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace("_", " ")} · {user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">First name</label>
                <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last name</label>
                <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input value={user?.email} disabled
                className="w-full h-10 px-3 rounded-lg border bg-muted text-sm text-muted-foreground cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
            </div>
            <button type="submit" disabled={saving}
              className="h-10 px-6 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
          </form>
        </div>
      )}

      {tab === "password" && (
        <div className="bg-card rounded-xl border shadow-card p-6">
          <h3 className="font-semibold mb-4">Change password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { key: "currentPassword", label: "Current password" },
              { key: "newPassword", label: "New password" },
              { key: "confirm", label: "Confirm new password" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} required
                    value={passwords[key as keyof typeof passwords]}
                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                    className="w-full h-10 px-3 pr-9 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
                  {key === "confirm" && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={changing}
              className="h-10 px-6 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-60">
              {changing && <Loader2 className="w-4 h-4 animate-spin" />}
              Change password
            </button>
          </form>
        </div>
      )}

      {tab === "doctor" && user?.role === "doctor" && (
        <div className="bg-card rounded-xl border shadow-card p-6">
          <h3 className="font-semibold mb-4">Doctor Profile</h3>
          <form onSubmit={handleDoctorProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Specialization</label>
                <input required value={resolvedDoctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  placeholder="e.g. Cardiology"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Sub-specialization</label>
                <input value={resolvedDoctorForm.subSpecialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, subSpecialization: e.target.value })}
                  placeholder="Optional"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea value={resolvedDoctorForm.bio}
                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                rows={3} placeholder="Brief professional bio..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Education</label>
              <textarea value={resolvedDoctorForm.education}
                onChange={(e) => setDoctorForm({ ...doctorForm, education: e.target.value })}
                rows={2} placeholder="MD, Harvard Medical School, 2010..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Years of Experience</label>
                <input type="number" min={0} value={resolvedDoctorForm.yearsOfExperience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, yearsOfExperience: e.target.value })}
                  placeholder="10"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Consultation Fee ($)</label>
                <input type="number" min={0} value={resolvedDoctorForm.consultationFee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                  placeholder="150"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Follow-up Fee ($)</label>
                <input type="number" min={0} value={resolvedDoctorForm.followUpFee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, followUpFee: e.target.value })}
                  placeholder="75"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">License Number</label>
                <input value={resolvedDoctorForm.licenseNumber}
                  onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                  placeholder="MD-12345"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Languages (comma-separated)</label>
                <input value={resolvedDoctorForm.languages}
                  onChange={(e) => setDoctorForm({ ...doctorForm, languages: e.target.value })}
                  placeholder="English, Spanish"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="accepting"
                checked={resolvedDoctorForm.isAcceptingPatients}
                onChange={(e) => setDoctorForm({ ...doctorForm, isAcceptingPatients: e.target.checked })}
                className="w-4 h-4 rounded border accent-helix-600" />
              <label htmlFor="accepting" className="text-sm font-medium">Currently accepting new patients</label>
            </div>
            <button type="submit" disabled={savingDoctor}
              className="h-10 px-6 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-60">
              {savingDoctor && <Loader2 className="w-4 h-4 animate-spin" />}
              Save profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { User, Lock, Loader2, Eye, EyeOff, Stethoscope, Heart } from "lucide-react";
import { useUpdateMeMutation } from "@/store/api/usersApi";
import { useChangePasswordMutation } from "@/store/api/authApi";
import { useGetMyProfileQuery as useGetDoctorProfile, useUpdateMyProfileMutation } from "@/store/api/doctorsApi";
import { useGetMyProfileQuery as useGetPatientProfile, useUpdateMyProfileMutation as useUpdatePatientProfile } from "@/store/api/patientsApi";
import { setUser } from "@/store/slices/authSlice";
import type { RootState } from "@/store";

const BLOOD_TYPES = ["unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function SettingsPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const isPatient = user?.role === "patient";
  const isDoctor = user?.role === "doctor";

  const [tab, setTab] = useState<"profile" | "password" | "doctor" | "health">("profile");

  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [changePass, { isLoading: changing }] = useChangePasswordMutation();

  const { data: doctorProfile } = useGetDoctorProfile(undefined, { skip: !isDoctor });
  const [updateDoctorProfile, { isLoading: savingDoctor }] = useUpdateMyProfileMutation();

  const { data: patientProfile } = useGetPatientProfile(undefined, { skip: !isPatient });
  const [updatePatientProfile, { isLoading: savingHealth }] = useUpdatePatientProfile();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  const [doctorForm, setDoctorForm] = useState({
    specialization: "", subSpecialization: "", bio: "", education: "",
    yearsOfExperience: "", consultationFee: "", followUpFee: "",
    licenseNumber: "", languages: "", isAcceptingPatients: true,
  });

  const [healthForm, setHealthForm] = useState({
    dateOfBirth: "", gender: "", bloodType: "unknown",
    height: "", weight: "",
    allergies: "", chronicConditions: "",
    emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "",
    address: "", city: "", country: "",
  });

  const resolvedDoctor = doctorProfile ? {
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

  const resolvedHealth = patientProfile ? {
    dateOfBirth: healthForm.dateOfBirth || (patientProfile.dateOfBirth ? patientProfile.dateOfBirth.slice(0, 10) : ""),
    gender: healthForm.gender || patientProfile.gender || "",
    bloodType: healthForm.bloodType !== "unknown" ? healthForm.bloodType : (patientProfile.bloodType || "unknown"),
    height: healthForm.height || String(patientProfile.height || ""),
    weight: healthForm.weight || String(patientProfile.weight || ""),
    allergies: healthForm.allergies || (patientProfile.allergies || []).join(", "),
    chronicConditions: healthForm.chronicConditions || (patientProfile.chronicConditions || []).join(", "),
    emergencyContactName: healthForm.emergencyContactName || patientProfile.emergencyContactName || "",
    emergencyContactPhone: healthForm.emergencyContactPhone || patientProfile.emergencyContactPhone || "",
    emergencyContactRelation: healthForm.emergencyContactRelation || patientProfile.emergencyContactRelation || "",
    address: healthForm.address || patientProfile.address || "",
    city: healthForm.city || patientProfile.city || "",
    country: healthForm.country || patientProfile.country || "",
  } : healthForm;

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updated = await updateMe(profile).unwrap();
      dispatch(setUser(updated));
      toast.success("Profile updated");
    } catch { toast.error("Failed to update profile"); }
  }

  async function handleHealthSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        bloodType: resolvedHealth.bloodType,
        gender: resolvedHealth.gender || undefined,
        address: resolvedHealth.address || undefined,
        city: resolvedHealth.city || undefined,
        country: resolvedHealth.country || undefined,
        emergencyContactName: resolvedHealth.emergencyContactName || undefined,
        emergencyContactPhone: resolvedHealth.emergencyContactPhone || undefined,
        emergencyContactRelation: resolvedHealth.emergencyContactRelation || undefined,
      };
      if (resolvedHealth.dateOfBirth) payload.dateOfBirth = resolvedHealth.dateOfBirth;
      if (resolvedHealth.height) payload.height = Number(resolvedHealth.height);
      if (resolvedHealth.weight) payload.weight = Number(resolvedHealth.weight);
      if (resolvedHealth.allergies) payload.allergies = resolvedHealth.allergies.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (resolvedHealth.chronicConditions) payload.chronicConditions = resolvedHealth.chronicConditions.split(",").map((s: string) => s.trim()).filter(Boolean);
      await updatePatientProfile(payload).unwrap();
      toast.success("Health profile updated");
    } catch { toast.error("Failed to update health profile"); }
  }

  async function handleDoctorProfileSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        specialization: resolvedDoctor.specialization,
        subSpecialization: resolvedDoctor.subSpecialization || undefined,
        bio: resolvedDoctor.bio || undefined,
        education: resolvedDoctor.education || undefined,
        licenseNumber: resolvedDoctor.licenseNumber || undefined,
        isAcceptingPatients: resolvedDoctor.isAcceptingPatients,
      };
      if (resolvedDoctor.yearsOfExperience) payload.yearsOfExperience = Number(resolvedDoctor.yearsOfExperience);
      if (resolvedDoctor.consultationFee) payload.consultationFee = Number(resolvedDoctor.consultationFee);
      if (resolvedDoctor.followUpFee) payload.followUpFee = Number(resolvedDoctor.followUpFee);
      if (resolvedDoctor.languages) payload.languages = resolvedDoctor.languages.split(",").map((l: string) => l.trim()).filter(Boolean);
      await updateDoctorProfile(payload).unwrap();
      toast.success("Doctor profile updated");
    } catch { toast.error("Failed to update profile"); }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error("Passwords don't match"); return; }
    try {
      await changePass({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }).unwrap();
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change password");
    }
  }

  const inp = "w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500";

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <div className="flex gap-1.5 flex-wrap">
        <TabBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={<User className="w-4 h-4" />} label="Profile" />
        <TabBtn active={tab === "password"} onClick={() => setTab("password")} icon={<Lock className="w-4 h-4" />} label="Password" />
        {isPatient && <TabBtn active={tab === "health"} onClick={() => setTab("health")} icon={<Heart className="w-4 h-4" />} label="Health Profile" />}
        {isDoctor && <TabBtn active={tab === "doctor"} onClick={() => setTab("doctor")} icon={<Stethoscope className="w-4 h-4" />} label="Doctor Profile" />}
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
                <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last name</label>
                <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input value={user?.email} disabled className="w-full h-10 px-3 rounded-lg border bg-muted text-sm text-muted-foreground cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 234 567 8900" className={inp} />
            </div>
            <button type="submit" disabled={saving} className="h-10 px-6 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
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
                    className={inp + " pr-9"} />
                  {key === "confirm" && (
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={changing} className="h-10 px-6 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-60">
              {changing && <Loader2 className="w-4 h-4 animate-spin" />} Change password
            </button>
          </form>
        </div>
      )}

      {tab === "health" && isPatient && (
        <div className="bg-card rounded-xl border shadow-card p-6">
          <h3 className="font-semibold mb-4">Health Profile</h3>
          <form onSubmit={handleHealthSave} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input type="date" value={resolvedHealth.dateOfBirth}
                  onChange={(e) => setHealthForm({ ...healthForm, dateOfBirth: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Gender</label>
                <select value={resolvedHealth.gender} onChange={(e) => setHealthForm({ ...healthForm, gender: e.target.value })} className={inp}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Blood Type</label>
                <select value={resolvedHealth.bloodType} onChange={(e) => setHealthForm({ ...healthForm, bloodType: e.target.value })} className={inp}>
                  {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt === "unknown" ? "Unknown" : bt}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Height (cm)</label>
                <input type="number" min={0} value={resolvedHealth.height}
                  onChange={(e) => setHealthForm({ ...healthForm, height: e.target.value })} placeholder="178" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Weight (kg)</label>
                <input type="number" min={0} value={resolvedHealth.weight}
                  onChange={(e) => setHealthForm({ ...healthForm, weight: e.target.value })} placeholder="75" className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Allergies (comma-separated)</label>
              <input value={resolvedHealth.allergies}
                onChange={(e) => setHealthForm({ ...healthForm, allergies: e.target.value })}
                placeholder="Penicillin, Shellfish, Pollen" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Chronic Conditions (comma-separated)</label>
              <input value={resolvedHealth.chronicConditions}
                onChange={(e) => setHealthForm({ ...healthForm, chronicConditions: e.target.value })}
                placeholder="Hypertension, Type 2 Diabetes" className={inp} />
            </div>
            <p className="text-sm font-semibold pt-1">Emergency Contact</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input value={resolvedHealth.emergencyContactName}
                  onChange={(e) => setHealthForm({ ...healthForm, emergencyContactName: e.target.value })}
                  placeholder="Jane Doe" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input value={resolvedHealth.emergencyContactPhone}
                  onChange={(e) => setHealthForm({ ...healthForm, emergencyContactPhone: e.target.value })}
                  placeholder="+1 555 000 0000" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Relation</label>
                <input value={resolvedHealth.emergencyContactRelation}
                  onChange={(e) => setHealthForm({ ...healthForm, emergencyContactRelation: e.target.value })}
                  placeholder="Spouse, Parent..." className={inp} />
              </div>
            </div>
            <p className="text-sm font-semibold pt-1">Address</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-1.5">Street Address</label>
                <input value={resolvedHealth.address}
                  onChange={(e) => setHealthForm({ ...healthForm, address: e.target.value })}
                  placeholder="123 Main St" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <input value={resolvedHealth.city}
                  onChange={(e) => setHealthForm({ ...healthForm, city: e.target.value })}
                  placeholder="New York" className={inp} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Country</label>
                <input value={resolvedHealth.country}
                  onChange={(e) => setHealthForm({ ...healthForm, country: e.target.value })}
                  placeholder="United States" className={inp} />
              </div>
            </div>
            <button type="submit" disabled={savingHealth} className="h-10 px-6 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-60">
              {savingHealth && <Loader2 className="w-4 h-4 animate-spin" />} Save health profile
            </button>
          </form>
        </div>
      )}

      {tab === "doctor" && isDoctor && (
        <div className="bg-card rounded-xl border shadow-card p-6">
          <h3 className="font-semibold mb-4">Doctor Profile</h3>
          <form onSubmit={handleDoctorProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Specialization</label>
                <input required value={resolvedDoctor.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  placeholder="e.g. Cardiology" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Sub-specialization</label>
                <input value={resolvedDoctor.subSpecialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, subSpecialization: e.target.value })}
                  placeholder="Optional" className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea value={resolvedDoctor.bio}
                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                rows={3} placeholder="Brief professional bio..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Education</label>
              <textarea value={resolvedDoctor.education}
                onChange={(e) => setDoctorForm({ ...doctorForm, education: e.target.value })}
                rows={2} placeholder="MD, Harvard Medical School, 2010..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-helix-500 resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Years Experience</label>
                <input type="number" min={0} value={resolvedDoctor.yearsOfExperience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, yearsOfExperience: e.target.value })}
                  placeholder="10" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Consultation Fee ($)</label>
                <input type="number" min={0} value={resolvedDoctor.consultationFee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                  placeholder="150" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Follow-up Fee ($)</label>
                <input type="number" min={0} value={resolvedDoctor.followUpFee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, followUpFee: e.target.value })}
                  placeholder="75" className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">License Number</label>
                <input value={resolvedDoctor.licenseNumber}
                  onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                  placeholder="MD-12345" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Languages (comma-separated)</label>
                <input value={resolvedDoctor.languages}
                  onChange={(e) => setDoctorForm({ ...doctorForm, languages: e.target.value })}
                  placeholder="English, Spanish" className={inp} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="accepting"
                checked={resolvedDoctor.isAcceptingPatients}
                onChange={(e) => setDoctorForm({ ...doctorForm, isAcceptingPatients: e.target.checked })}
                className="w-4 h-4 rounded border accent-helix-600" />
              <label htmlFor="accepting" className="text-sm font-medium">Currently accepting new patients</label>
            </div>
            <button type="submit" disabled={savingDoctor} className="h-10 px-6 bg-helix-600 hover:bg-helix-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition disabled:opacity-60">
              {savingDoctor && <Loader2 className="w-4 h-4 animate-spin" />} Save profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${active ? "bg-helix-600 text-white" : "bg-muted text-muted-foreground"}`}>
      {icon} {label}
    </button>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Heart, Loader2 } from "lucide-react";
import { useRegisterMutation } from "@/store/api/authApi";
import Link from "next/link";

const ROLES = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "lab_tech", label: "Lab Tech" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "", role: "patient" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register(form).unwrap();
      toast.success("Account created! Check your email for the verification code.");
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      const msg = err?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Registration failed");
    }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-card p-8 border">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-helix-600" />
          <span className="text-xl font-bold text-helix-600">Helix</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-muted-foreground text-sm mb-6">Join Helix to manage your healthcare</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">First name</label>
              <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 text-sm transition" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last name</label>
              <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 text-sm transition" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email address</label>
            <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 text-sm transition" placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 text-sm transition" placeholder="+1 234 567 8900" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button key={r.value} type="button" onClick={() => set("role", r.value)}
                  className={`h-10 rounded-lg border text-sm font-medium transition ${form.role === r.value ? "bg-helix-600 text-white border-helix-600" : "bg-background hover:border-helix-400"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 text-sm transition" placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full h-11 bg-helix-600 hover:bg-helix-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create account
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-helix-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

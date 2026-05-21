"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Eye, EyeOff, Heart, Loader2 } from "lucide-react";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login(form).unwrap();
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }));
      toast.success(`Welcome back, ${res.user.firstName}!`);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.data?.message;
      if (err?.data?.requiresVerification) {
        toast.error("Email not verified");
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
      } else {
        toast.error(typeof msg === "string" ? msg : "Invalid credentials");
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-helix-600 via-helix-700 to-helix-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xl font-bold">Helix</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Healthcare<br />management,<br />simplified.
          </h2>
          <p className="text-helix-200 text-lg">Connecting patients, doctors, and staff in one unified platform.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[["10k+", "Patients"], ["500+", "Doctors"], ["99.9%", "Uptime"]].map(([val, label]) => (
            <div key={label} className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-helix-200 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Heart className="w-6 h-6 text-helix-600" />
            <span className="text-xl font-bold text-helix-600">Helix</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sign in</h1>
          <p className="text-muted-foreground mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 transition"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-sm text-helix-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 pr-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 transition"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-helix-600 hover:bg-helix-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-helix-600 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

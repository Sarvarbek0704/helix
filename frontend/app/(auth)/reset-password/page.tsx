"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Heart, Loader2 } from "lucide-react";
import { useResetPasswordMutation } from "@/store/api/authApi";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [reset, { isLoading }] = useResetPasswordMutation();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await reset({ token, password }).unwrap();
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Reset failed. Link may have expired.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-card p-8 border">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-helix-600" />
          <span className="text-lg font-bold text-helix-600">Helix</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Set new password</h1>
        <p className="text-muted-foreground text-sm mb-6">Choose a strong password for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">New password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 pr-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 transition" placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full h-11 bg-helix-600 hover:bg-helix-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Reset password
          </button>
        </form>
        <p className="text-center mt-5 text-sm">
          <Link href="/login" className="text-helix-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-helix-600" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

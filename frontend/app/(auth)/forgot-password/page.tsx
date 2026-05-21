"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, Loader2, ArrowLeft } from "lucide-react";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [forgot, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await forgot({ email }).unwrap();
      setSent(true);
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-card p-8 border">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-helix-600" />
          <span className="text-lg font-bold text-helix-600">Helix</span>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-health-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Check your email</h2>
            <p className="text-muted-foreground text-sm mb-6">If that email is registered, you'll receive a reset link shortly.</p>
            <Link href="/login" className="text-helix-600 font-medium hover:underline text-sm">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
            <p className="text-muted-foreground text-sm mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-helix-500 transition" placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full h-11 bg-helix-600 hover:bg-helix-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send reset link
              </button>
            </form>
            <Link href="/login" className="flex items-center justify-center gap-1.5 mt-5 text-sm text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

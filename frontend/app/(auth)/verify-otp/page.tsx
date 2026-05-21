"use client";
import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Heart, Loader2, Mail } from "lucide-react";
import { useVerifyOtpMutation, useResendOtpMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";

function VerifyOtpContent() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();
  const email = params.get("email") || "";

  const [verify, { isLoading }] = useVerifyOtpMutation();
  const [resend, { isLoading: resending }] = useResendOtpMutation();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d)) handleSubmit(next.join(""));
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  async function handleSubmit(otp: string) {
    try {
      const res = await verify({ email, otp }).unwrap();
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }));
      toast.success("Email verified! Welcome to Helix.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid code");
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    }
  }

  async function handleResend() {
    try {
      await resend({ email }).unwrap();
      toast.success("Code resent!");
      setCountdown(60);
    } catch {
      toast.error("Failed to resend");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-card p-8 border text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-helix-100 rounded-full flex items-center justify-center">
            <Mail className="w-7 h-7 text-helix-600" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-helix-600" />
          <span className="text-lg font-bold text-helix-600">Helix</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-muted-foreground text-sm mb-2">We sent a 6-digit code to</p>
        <p className="font-semibold text-helix-600 mb-8">{email}</p>

        <div className="flex gap-2 justify-center mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-bold rounded-lg border-2 focus:border-helix-500 focus:outline-none bg-background transition"
            />
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-helix-600" />
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {countdown > 0 ? (
            <>Resend code in <span className="font-semibold text-foreground">{countdown}s</span></>
          ) : (
            <button onClick={handleResend} disabled={resending} className="text-helix-600 font-medium hover:underline disabled:opacity-60">
              {resending ? "Resending..." : "Resend code"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-helix-600" /></div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
    else router.replace("/login");
  }, [isAuthenticated, router]);

  return null;
}

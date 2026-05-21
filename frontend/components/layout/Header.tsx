"use client";
import { useSelector } from "react-redux";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import type { RootState } from "@/store";
import { useGetUnreadCountQuery } from "@/store/api/notificationsApi";

interface Props { title: string; }

export function Header({ title }: Props) {
  const { theme, setTheme } = useTheme();
  const user = useSelector((s: RootState) => s.auth.user);
  const { data: unread } = useGetUnreadCountQuery();

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition">
          <Search className="w-4 h-4" />
        </button>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <Link href="/notifications" className="relative w-9 h-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition">
          <Bell className="w-4 h-4" />
          {unread?.count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread.count > 9 ? "9+" : unread.count}
            </span>
          )}
        </Link>
        <Link href="/settings" className="w-8 h-8 rounded-full bg-helix-100 dark:bg-helix-900/30 flex items-center justify-center text-helix-700 dark:text-helix-300 font-semibold text-sm">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Link>
      </div>
    </header>
  );
}

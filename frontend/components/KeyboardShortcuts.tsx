"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { keys: ["Cmd/Ctrl", "K"], label: "Open global search" },
  { keys: ["?"], label: "Show keyboard shortcuts" },
  { keys: ["Alt", "D"], label: "Go to Dashboard" },
  { keys: ["Alt", "P"], label: "Go to Patients" },
  { keys: ["Alt", "A"], label: "Go to Appointments" },
  { keys: ["Alt", "N"], label: "Go to Notifications" },
  { keys: ["Alt", "S"], label: "Go to Settings" },
  { keys: ["Esc"], label: "Close modals / overlays" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;

      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.altKey && !isInput) {
        switch (e.key.toLowerCase()) {
          case "d": e.preventDefault(); router.push("/dashboard"); break;
          case "p": e.preventDefault(); router.push("/patients"); break;
          case "a": e.preventDefault(); router.push("/appointments"); break;
          case "n": e.preventDefault(); router.push("/notifications"); break;
          case "s": e.preventDefault(); router.push("/settings"); break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-helix-600" />
            Keyboard Shortcuts
          </h2>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, ki) => (
                  <span key={ki} className="px-2 py-0.5 text-xs font-mono bg-muted border rounded-md">{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">?</kbd> to toggle this panel
        </p>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, Stethoscope, Calendar, FileText, Loader2 } from "lucide-react";
import { useLazySearchQuery } from "@/store/api/searchApi";

const TYPE_ICONS: Record<string, any> = {
  patient: User,
  doctor: Stethoscope,
  appointment: Calendar,
  record: FileText,
};

const TYPE_LABELS: Record<string, string> = {
  patient: "Patients",
  doctor: "Doctors",
  appointment: "Appointments",
  record: "Medical Records",
};

const TYPE_ROUTES: Record<string, (id: string) => string> = {
  patient: (id) => `/patients/${id}`,
  doctor: (id) => `/doctors/${id}`,
  appointment: (id) => `/appointments/${id}`,
  record: (id) => `/medical-records/${id}`,
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [trigger, { data, isFetching }] = useLazySearchQuery();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Open with Cmd+K or Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  // Debounced search
  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setSelected(0);
    clearTimeout(debounceRef.current);
    if (q.trim().length >= 2) {
      debounceRef.current = setTimeout(() => trigger(q), 300);
    }
  }, [trigger]);

  // Flatten results for keyboard nav
  const results: { type: string; item: any }[] = [];
  if (data) {
    Object.entries(data).forEach(([type, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item) => results.push({ type, item }));
      }
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) {
      navigate(results[selected]);
    }
  };

  const navigate = (result: { type: string; item: any }) => {
    const route = TYPE_ROUTES[result.type];
    if (route) {
      router.push(route(result.item.id));
      setOpen(false);
    }
  };

  const getLabel = (type: string, item: any) => {
    if (type === "patient" || type === "doctor") {
      return `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email || "—";
    }
    if (type === "appointment") return `${item.appointmentDate || "—"} — ${item.appointmentTime || ""}`.trim();
    if (type === "record") return item.title || item.chiefComplaint || "Medical Record";
    return item.name || item.title || "—";
  };

  const getSub = (type: string, item: any) => {
    if (type === "patient") return item.email || "";
    if (type === "doctor") return item.specialization || item.user?.email || "";
    if (type === "appointment") return item.status || "";
    if (type === "record") return item.icdCode || "";
    return "";
  };

  // Group results by type
  const grouped: Record<string, { type: string; item: any }[]> = {};
  results.forEach((r) => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  });

  if (!open) return null;

  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search patients, doctors, appointments..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          {isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {query && !isFetching && (
            <button onClick={() => handleSearch("")} className="p-0.5 hover:bg-muted rounded transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center px-1.5 py-0.5 text-xs border rounded font-mono text-muted-foreground">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.length < 2 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search…
            </div>
          ) : results.length === 0 && !isFetching ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase bg-muted/40">
                  {TYPE_LABELS[type] || type}
                </div>
                {items.map(({ item }) => {
                  const Icon = TYPE_ICONS[type] || FileText;
                  const isActive = flatIdx === selected;
                  const idx = flatIdx++;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate({ type, item })}
                      onMouseEnter={() => setSelected(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive ? "bg-helix-50 dark:bg-helix-900/20" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isActive ? "bg-helix-100 text-helix-700" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getLabel(type, item)}</p>
                        {getSub(type, item) && (
                          <p className="text-xs text-muted-foreground truncate">{getSub(type, item)}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t flex items-center gap-3 text-xs text-muted-foreground bg-muted/20">
          <span><kbd className="px-1 border rounded font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 border rounded font-mono">↵</kbd> open</span>
          <span><kbd className="px-1 border rounded font-mono">Esc</kbd> close</span>
          <span className="ml-auto"><kbd className="px-1 border rounded font-mono">⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}

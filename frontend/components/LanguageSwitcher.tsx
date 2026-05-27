"use client";
import { useT } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useT();

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
      <button
        onClick={() => setLang("uz")}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
          lang === "uz" ? "bg-helix-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        UZ
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
          lang === "en" ? "bg-helix-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}

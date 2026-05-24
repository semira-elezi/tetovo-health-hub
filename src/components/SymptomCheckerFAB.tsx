import { Link, useLocation } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function SymptomCheckerFAB() {
  const { language } = useTranslation();
  const { pathname } = useLocation();
  // Don't show on the symptom-checker page itself or admin/auth pages
  if (/^\/(symptom-checker|auth|admin)/.test(pathname)) return null;

  const label =
    language === "sq" ? "Ndihmësi AI" : language === "mk" ? "AI Помошник" : "AI Assistant";

  return (
    <Link
      to="/symptom-checker"
      aria-label={label}
      className={cn(
        "group fixed bottom-32 right-4 z-40 md:bottom-20",
        "flex items-center gap-2 rounded-full bg-primary px-3.5 py-3 text-primary-foreground",
        "shadow-lg ring-1 ring-primary/20 transition-all duration-200",
        "hover:px-4 hover:shadow-xl hover:scale-105 print:hidden",
        "animate-pulse-slow"
      )}
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
        <Stethoscope className="relative h-5 w-5" />
      </span>
      <span className="hidden text-sm font-semibold sm:inline">{label}</span>
    </Link>
  );
}

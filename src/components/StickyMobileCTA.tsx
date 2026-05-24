import { Link, useLocation } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function StickyMobileCTA() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  // Hide on auth, portal, admin, doctor screens and on the booking page itself
  const hide = /^\/(auth|portal|admin|doctor|patient|appointments)/.test(pathname);
  if (hide) return null;
  return (
    <Link
      to="/appointments"
      className="fixed bottom-4 left-4 right-4 z-40 md:hidden print:hidden flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
    >
      <CalendarPlus className="h-4 w-4" />
      {t("hero.cta.appointment")}
    </Link>
  );
}

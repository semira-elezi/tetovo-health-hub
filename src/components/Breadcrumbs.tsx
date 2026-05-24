import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Breadcrumbs({ items }: { items?: { label: string; to?: string }[] }) {
  const { t } = useTranslation();
  const location = useLocation();

  const computed = items || location.pathname
    .split("/")
    .filter(Boolean)
    .map((seg, i, arr) => ({
      label: seg.replace(/-/g, " ").replace(/^\w/, c => c.toUpperCase()),
      to: "/" + arr.slice(0, i + 1).join("/"),
    }));

  if (computed.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="container py-3 text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap print:hidden">
      <Link to="/" className="flex items-center hover:text-foreground"><Home className="h-3.5 w-3.5" /></Link>
      {computed.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {item.to && i < computed.length - 1 ? (
            <Link to={item.to} className="hover:text-foreground capitalize">{item.label}</Link>
          ) : (
            <span className="text-foreground font-medium capitalize">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

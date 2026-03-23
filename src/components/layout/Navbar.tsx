import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const languages: { code: Language; label: string }[] = [
  { code: "mk", label: "МК" },
  { code: "sq", label: "SQ" },
  { code: "en", label: "EN" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const location = useLocation();

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/departments", label: t("nav.departments") },
    { to: "/appointments", label: t("nav.appointments") },
    { to: "/news", label: t("nav.news") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">КБ</span>
          </div>
          <span className="hidden font-semibold sm:inline-block">
            {language === "sq" ? "SKT" : language === "en" ? "CHT" : "КБТ"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                isActive(link.to) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                {languages.find((l) => l.code === language)?.label}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(language === lang.code && "bg-accent")}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/auth/login">{t("nav.login")}</Link>
          </Button>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t md:hidden">
          <nav className="container flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isActive(link.to) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-primary"
            >
              {t("nav.login")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

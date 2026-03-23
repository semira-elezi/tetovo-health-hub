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
  { code: "sq", label: "SQ" },
  { code: "mk", label: "МК" },
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
    <header className="sticky top-0 z-50 glass-navbar">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-md transition-transform duration-300 group-hover:scale-110">
            <span className="text-sm font-bold text-primary-foreground">SKT</span>
          </div>
          <span className="hidden font-bold text-foreground sm:inline-block tracking-tight">
            {language === "sq" ? "Spitali Klinik Tetovë" : language === "en" ? "Clinical Hospital Tetovo" : "Клиничка Болница Тетово"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-300 hover:bg-primary/5",
                isActive(link.to)
                  ? "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-5 after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
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
              <Button variant="ghost" size="sm" className="gap-1.5 rounded-lg hover:bg-primary/5">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{languages.find((l) => l.code === language)?.label}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn("rounded-md", language === lang.code && "bg-primary/10 text-primary")}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild size="sm" className="hidden sm:inline-flex rounded-lg gradient-primary border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Link to="/auth/login">{t("nav.login")}</Link>
          </Button>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border/50 md:hidden animate-slide-up">
          <nav className="container flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5",
                  isActive(link.to) ? "text-primary bg-primary/5" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground text-center gradient-primary"
            >
              {t("nav.login")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

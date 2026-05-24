import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Phone, LogIn, LogOut, User, Search, ChevronDown,
  Home, Info, Stethoscope, Newspaper, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation, Language } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationBell from "@/components/features/notifications/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu as DM,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const languages: { code: Language; label: string }[] = [
  { code: "mk", label: "MK" },
  { code: "sq", label: "SQ" },
  { code: "en", label: "EN" },
];

function NavDropdown({ label, items, isActive }: {
  label: string;
  items: { to: string; label: string }[];
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={cn(
          "flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors",
          isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
        )}
      >
        {label}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="min-w-[200px] rounded-xl border bg-popover p-1.5 shadow-xl animate-fade-in">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-accent/10 hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const servicesItems = [
    { to: "/departments", label: t("nav.departments") },
    { to: "/appointments", label: t("nav.appointments") },
    { to: "/symptom-checker", label: language === "mk" ? "Проверка на симптоми" : language === "sq" ? "Kontrollo simptomat" : "Symptom Checker" },
  ];
  const resourcesItems = [
    { to: "/news", label: t("nav.news") },
    { to: "/public-info", label: t("publicInfo.title") },
    { to: "/contact", label: t("nav.contact") },
    { to: "/faq", label: language === "mk" ? "ЧПП" : language === "sq" ? "FAQ" : "FAQ" },
    { to: "/working-hours", label: language === "mk" ? "Работно време" : language === "sq" ? "Orari" : "Hours" },
  ];

  const isServicesActive = ["/departments", "/appointments", "/symptom-checker"].some((p) => location.pathname.startsWith(p));
  const isResourcesActive = ["/news", "/public-info", "/contact", "/faq", "/working-hours"].some((p) => location.pathname.startsWith(p));

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border/60 transition-shadow duration-200",
          scrolled && "shadow-sm"
        )}
      >
        <div className="container flex h-14 items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.svg" alt="Clinical Hospital Tetovo" className="h-9 w-9" width={36} height={36} />
            <span className="hidden text-sm font-bold tracking-tight text-foreground lg:inline-block leading-tight">
              {t("footer.hospitalName")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            <Link to="/" className={cn("px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors",
              location.pathname === "/" ? "text-primary" : "text-foreground/70 hover:text-foreground")}>
              {t("nav.home")}
            </Link>
            <Link to="/about" className={cn("px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors",
              isActive("/about") ? "text-primary" : "text-foreground/70 hover:text-foreground")}>
              {t("nav.about")}
            </Link>
            <NavDropdown
              label={language === "mk" ? "Услуги" : language === "sq" ? "Shërbimet" : "Services"}
              items={servicesItems}
              isActive={isServicesActive}
            />
            <NavDropdown
              label={language === "mk" ? "Ресурси" : language === "sq" ? "Burimet" : "Resources"}
              items={resourcesItems}
              isActive={isResourcesActive}
            />
          </nav>

          {/* Right — icons only */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Search" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>

            <a
              href="tel:+38975200304"
              aria-label="Call +389 75 200 304"
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 hover:text-foreground hover:bg-accent/10 transition-colors"
            >
              <Phone className="h-4 w-4" />
            </a>

            <ThemeToggle />

            {user && <NotificationBell />}

            {/* Language as icon dropdown */}
            <DM>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Language" className="h-9 w-9">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn("cursor-pointer", language === lang.code && "bg-accent/10 text-accent font-semibold")}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DM>

            {/* Auth */}
            {user ? (
              <DM>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account" className="h-9 w-9">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                    {profile?.full_name || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/portal"><User className="h-4 w-4 mr-2" />{t("nav.portal")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />{t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DM>
            ) : (
              <Link to="/auth/login" className="hidden sm:inline-flex">
                <Button size="sm" className="h-9 gap-1.5 ml-1 rounded-md">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden lg:inline">{t("nav.login")}</span>
                </Button>
              </Link>
            )}

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 top-14 z-50 bg-background md:hidden animate-fade-in">
            <nav className="container flex flex-col gap-0.5 py-4 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
              {[
                { to: "/", label: t("nav.home"), icon: Home },
                { to: "/about", label: t("nav.about"), icon: Info },
              ].map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.to) ? "text-primary bg-accent/10" : "text-foreground/80 hover:bg-muted")}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Link>
              ))}

              <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Stethoscope className="h-3 w-3" />{language === "mk" ? "Услуги" : language === "sq" ? "Shërbimet" : "Services"}
              </p>
              {servicesItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className={cn("px-6 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.to) ? "text-primary bg-accent/10" : "text-foreground/80 hover:bg-muted")}>
                  {item.label}
                </Link>
              ))}

              <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Newspaper className="h-3 w-3" />{language === "mk" ? "Ресурси" : language === "sq" ? "Burimet" : "Resources"}
              </p>
              {resourcesItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className={cn("px-6 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.to) ? "text-primary bg-accent/10" : "text-foreground/80 hover:bg-muted")}>
                  {item.label}
                </Link>
              ))}

              <div className="mt-3 border-t pt-3">
                {user ? (
                  <>
                    <Link to="/portal" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-foreground/80 hover:bg-muted">
                      <User className="h-4 w-4" />{t("nav.portal")}
                    </Link>
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-medium rounded-lg text-foreground/80 hover:bg-muted">
                      <LogOut className="h-4 w-4" />{t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <Link to="/auth/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg text-primary bg-accent/10">
                    <LogIn className="h-4 w-4" />{t("nav.login")}
                  </Link>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1 px-3">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => setLanguage(lang.code)}
                    className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      language === lang.code ? "bg-primary text-primary-foreground" : "text-foreground/70 border border-border")}>
                    {lang.label}
                  </button>
                ))}
                <a href="tel:+38975200304" className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Phone className="h-3.5 w-3.5" /> +389 75 200 304
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, LogIn, LogOut, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation, Language } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearch from "@/components/GlobalSearch";

const navLinks = [
  { to: "/", labelKey: "nav.home" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/departments", labelKey: "nav.departments" },
  { to: "/news", labelKey: "nav.news" },
  { to: "/public-info", labelKey: "publicInfo.title" },
  { to: "/contact", labelKey: "nav.contact" },
] as const;

const languages: { code: Language; label: string }[] = [
  { code: "mk", label: "MK" },
  { code: "sq", label: "SQ" },
  { code: "en", label: "EN" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();
  const { user, profile, isAdmin, isStaff, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-card border-b transition-shadow duration-200",
          scrolled && "shadow-card"
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M7 3h2v10H7V3z" fill="white" />
                <path d="M3 7h10v2H3V7z" fill="white" />
              </svg>
            </div>
            <span className="hidden text-sm font-bold text-foreground sm:inline-block">
              {t("footer.hospitalName")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                  isActive(link.to)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>

            {/* Language switcher */}
            <div className="hidden sm:flex items-center gap-0.5 rounded-lg border p-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-md transition-colors duration-150",
                    language === lang.code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Auth buttons */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/portal">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{profile?.full_name || t("nav.portal")}</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">{t("nav.logout")}</span>
                </Button>
              </div>
            ) : (
              <Link to="/auth/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  {t("nav.login")}
                </Button>
              </Link>
            )}

            {/* Phone */}
            <a
              href="tel:+38975200304"
              className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Phone className="h-4 w-4 text-primary" />
              +389 75 200 304
            </a>

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

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 top-16 z-50 bg-card md:hidden animate-fade-in">
            <nav className="container flex flex-col gap-1 py-6">
              {/* Mobile Search */}
              <button
                onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
                className="px-4 py-3 text-left text-base font-medium rounded-lg text-muted-foreground hover:bg-secondary flex items-center gap-2"
              >
                <Search className="h-4 w-4" /> Search
              </button>

              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 text-base font-medium rounded-lg transition-colors",
                    isActive(link.to)
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              ))}

              {/* Mobile auth links */}
              {user ? (
                <>
                  <Link
                    to="/portal"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:bg-secondary"
                  >
                    {t("nav.portal")}
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="px-4 py-3 text-left text-base font-medium rounded-lg text-muted-foreground hover:bg-secondary"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg text-primary hover:bg-secondary"
                >
                  {t("nav.login")}
                </Link>
              )}

              <div className="mt-6 flex items-center gap-1 px-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      language === lang.code
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground border"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <a
                href="tel:+38975200304"
                className="mt-4 mx-4 flex items-center gap-2 text-sm font-medium text-primary"
              >
                <Phone className="h-4 w-4" />
                +389 75 200 304
              </a>
            </nav>
          </div>
        )}
      </header>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

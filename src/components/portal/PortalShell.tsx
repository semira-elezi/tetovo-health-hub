import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Bell, Menu, X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import NotificationBell from "@/components/features/notifications/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";

export type PortalNavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  uppercase?: boolean;
};

export type PortalRole = "patient" | "doctor" | "admin";

interface PortalShellProps {
  role: PortalRole;
  brandTitle: string;
  brandSubtitle?: ReactNode;
  userBadge: { name: string; subtitle: string; avatarUrl?: string | null };
  nav: PortalNavItem[];
  activeKey: string;
  onNavChange: (key: string) => void;
  pageTitle: string;
  pageSubtitle?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
}

export default function PortalShell({
  brandTitle, brandSubtitle, userBadge, nav, activeKey, onNavChange,
  pageTitle, pageSubtitle, headerAction, children,
}: PortalShellProps) {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await signOut(); navigate("/"); };

  const SidebarBody = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link to="/" className="px-6 pt-7 pb-5 block">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="PHI" className="h-8 w-8" />
          <div className="leading-tight">
            <p className="text-base font-bold text-primary tracking-tight">{brandTitle}</p>
            {brandSubtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{brandSubtitle}</p>}
          </div>
        </div>
      </Link>

      {/* User badge */}
      <div className="px-4">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-semibold text-sm">
            {userBadge.avatarUrl
              ? <img src={userBadge.avatarUrl} alt="" className="h-full w-full object-cover" />
              : userBadge.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{userBadge.subtitle}</p>
            <p className="text-sm font-semibold text-foreground truncate">{userBadge.name}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-5 px-3 flex-1 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              onClick={() => { onNavChange(item.key); setMobileOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left",
                item.uppercase && "uppercase tracking-wider text-[12px]",
                active
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-border/60 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-[12px] text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border/60 bg-card sticky top-0 h-screen">
        {SidebarBody}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl animate-fade-in">
            {SidebarBody}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/50 px-5 md:px-10 py-5 md:py-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <button
                className="lg:hidden mt-1 h-9 w-9 rounded-lg border border-border/60 bg-card flex items-center justify-center"
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary truncate">{pageTitle}</h1>
                {pageSubtitle && (
                  <p className="text-[11px] md:text-xs uppercase tracking-wider text-muted-foreground mt-1">
                    {pageSubtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <NotificationBell />
              {headerAction}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 md:px-10 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}

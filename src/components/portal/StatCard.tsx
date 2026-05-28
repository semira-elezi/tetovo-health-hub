import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  tone?: "primary" | "amber" | "red" | "green";
  badge?: { label: string; tone?: "primary" | "amber" | "red" | "green" };
}

const toneIcon: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  red: "bg-destructive/10 text-destructive",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

const toneBadge: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  red: "bg-destructive/10 text-destructive",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
};

export default function StatCard({ icon: Icon, label, value, subtitle, tone = "primary", badge }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", toneIcon[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
            toneBadge[badge.tone || tone]
          )}>
            {badge.label}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground tabular-nums tracking-tight">{value}</p>
      {subtitle && <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground/80">{subtitle}</p>}
    </div>
  );
}

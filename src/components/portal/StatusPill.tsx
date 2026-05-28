import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  waiting: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/10 text-primary",
  confirmed: "bg-primary/10 text-primary",
  arrived: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  cancelled: "bg-destructive/10 text-destructive",
  no_show: "bg-muted text-muted-foreground",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  draft: "bg-muted text-muted-foreground",
  published: "bg-primary/10 text-primary",
  normal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  low: "bg-primary/10 text-primary",
  critical: "bg-destructive/10 text-destructive",
};

export default function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = (status || "").toLowerCase();
  const cls = MAP[key] || "bg-muted text-muted-foreground";
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap",
      cls,
      className
    )}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

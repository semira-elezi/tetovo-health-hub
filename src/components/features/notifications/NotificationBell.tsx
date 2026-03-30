import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";
import { markAllNotificationsRead } from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, string> = {
  appointment: "📅",
  lab_result: "🧬",
  message: "💬",
  system: "⚙️",
  emergency: "🚨",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-card shadow-lg z-50 animate-fade-in">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <ScrollArea className="max-h-80">
            {!notifications?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markRead.mutate(n.id);
                    }}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !n.is_read && "bg-primary/5"
                    )}
                  >
                    <span className="mt-0.5 text-base">
                      {typeIcons[n.type] || "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !n.is_read && "font-semibold")}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

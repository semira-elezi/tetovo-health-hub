import { useQuery } from "@tanstack/react-query";
import { fetchPatientTimeline, TimelineEvent } from "@/services/timelineService";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Stethoscope, FlaskConical, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

const iconMap = {
  appointment: Calendar,
  diagnosis: Stethoscope,
  lab_result: FlaskConical,
  prescription: Pill,
};

const colorMap = {
  appointment: "border-l-primary",
  diagnosis: "border-l-warning",
  lab_result: "border-l-accent",
  prescription: "border-l-success",
};

const labelMap = {
  appointment: "Appointment",
  diagnosis: "Diagnosis",
  lab_result: "Lab Result",
  prescription: "Prescription",
};

function groupByMonth(events: TimelineEvent[]) {
  const groups: Record<string, TimelineEvent[]> = {};
  events.forEach((e) => {
    const key = e.date.substring(0, 7); // YYYY-MM
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

export default function PatientTimeline() {
  const { user } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ["patient-timeline", user?.id],
    queryFn: () => fetchPatientTimeline(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No medical history found yet.
      </p>
    );
  }

  const grouped = groupByMonth(events);

  return (
    <div className="space-y-8">
      {grouped.map(([monthKey, items]) => (
        <div key={monthKey}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {format(parseISO(monthKey + "-01"), "MMMM yyyy")}
          </h3>
          <div className="relative space-y-3 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {items.map((event) => {
              const Icon = iconMap[event.type];
              return (
                <Card
                  key={`${event.type}-${event.id}`}
                  className={`border-l-4 ${colorMap[event.type]} overflow-hidden`}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[18px] top-4 flex h-4 w-4 items-center justify-center rounded-full bg-card border-2 border-border">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  </div>
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {labelMap[event.type]}
                        </Badge>
                        {event.status && (
                          <Badge
                            variant={
                              event.status === "completed" || event.status === "resolved"
                                ? "default"
                                : event.status === "active"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[10px] px-1.5 py-0"
                          >
                            {event.status}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium">{event.title}</p>
                      {event.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.metadata?.doctor && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Dr. {event.metadata.doctor}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {format(parseISO(event.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

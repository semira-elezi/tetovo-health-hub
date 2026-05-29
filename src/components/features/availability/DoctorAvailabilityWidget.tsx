import { Link } from "react-router-dom";
import { CalendarClock, ArrowRight, UserRound } from "lucide-react";
import { format } from "date-fns";
import { useDoctorAvailability } from "@/hooks/useDoctorAvailability";
import { useTranslation } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorAvailabilityWidget() {
  const { data, isLoading } = useDoctorAvailability();
  const { language } = useTranslation();

  const titles = {
    mk: "Достапни доктори",
    sq: "Mjekë të Disponueshëm",
    en: "Doctors Available Now",
  } as const;
  const subtitle = {
    mk: "Резервирајте го следниот слободен термин",
    sq: "Rezervoni terminin tuaj të radhës",
    en: "Book the next open slot",
  } as const;

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl flex items-center gap-2">
              <CalendarClock className="h-6 w-6 text-accent" />
              {titles[language]}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle[language]}</p>
          </div>
          <Link
            to="/appointments"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {language === "sq" ? "Shiko të gjithë" : language === "mk" ? "Види ги сите" : "View all"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="surface p-8 text-center text-sm text-muted-foreground">
            {language === "sq"
              ? "Nuk ka termine të disponueshëm këtë javë."
              : language === "mk"
              ? "Нема достапни термини оваа недела."
              : "No openings available this week."}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((d) => (
              <Link
                key={d.doctor_id}
                to="/appointments"
                className="group surface surface-hover p-5 card-hover flex gap-4"
              >
                <div className="h-14 w-14 shrink-0 rounded-full bg-accent/10 text-accent flex items-center justify-center overflow-hidden">
                  {d.image_url ? (
                    <img src={d.image_url} alt={d.doctor_name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <UserRound className="h-7 w-7" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-primary truncate group-hover:underline">
                    {d.doctor_name}
                  </h3>
                  {d.specialization && (
                    <p className="text-xs text-muted-foreground truncate">{d.specialization}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {language === "sq" ? "I lirë" : language === "mk" ? "Слободно" : "Available"}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(d.next_slot_date), "d MMM")} · {d.next_slot_time.slice(0, 5)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

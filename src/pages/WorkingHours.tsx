import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { Clock } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_MK = ["Нед", "Пон", "Вто", "Сре", "Чет", "Пет", "Саб"];
const DAYS_SQ = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];

export default function WorkingHours() {
  const { language } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["working-hours-all"],
    queryFn: async () => {
      const [depts, hours] = await Promise.all([
        supabase.from("departments").select("*").eq("is_active", true).order("name_en"),
        (supabase.from as any)("working_hours").select("*"),
      ]);
      if (depts.error) throw depts.error;
      if (hours.error) throw hours.error;
      return { depts: depts.data, hours: hours.data };
    },
  });

  const dayLabel = (i: number) => language === "mk" ? DAYS_MK[i] : language === "sq" ? DAYS_SQ[i] : DAYS[i];
  const getName = (d: any) => language === "mk" ? (d.name_mk || d.name_en) : language === "sq" ? (d.name_sq || d.name_en) : d.name_en;
  const heading = language === "mk" ? "Работно време" : language === "sq" ? "Orari i punës" : "Working Hours";

  return (
    <Layout>
      <Breadcrumbs />
      <section className="container py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{heading}</h1>
            <p className="text-sm text-muted-foreground">
              {language === "mk" ? "Распоред по оддел" : language === "sq" ? "Orari sipas departamentit" : "Schedule by department"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.depts.map((d: any) => {
              const deptHours = data.hours.filter((h: any) => h.department_id === d.id).sort((a: any, b: any) => a.day_of_week - b.day_of_week);
              return (
                <Card key={d.id} className="rounded-2xl">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3">{getName(d)}</h3>
                    <div className="space-y-1.5 text-sm">
                      {deptHours.map((h: any) => (
                        <div key={h.id} className="flex justify-between">
                          <span className="text-muted-foreground">{dayLabel(h.day_of_week)}</span>
                          <span className={h.is_closed ? "text-destructive" : "font-medium"}>
                            {h.is_closed ? (language === "mk" ? "Затворено" : language === "sq" ? "Mbyllur" : "Closed") :
                              `${h.open_time?.slice(0, 5)} – ${h.close_time?.slice(0, 5)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}

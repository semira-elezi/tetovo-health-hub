import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, ArrowRight, Stethoscope, Star } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useDepartment, useDepartments } from "@/hooks/useDepartments";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export default function DepartmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const { data: dept, isLoading } = useDepartment(slug || "");
  const { data: allDepartments } = useDepartments();

  const getName = (d: any) => {
    if (language === "mk") return d.name_mk || d.name_en;
    if (language === "sq") return d.name_sq || d.name_en;
    return d.name_en;
  };

  const getDesc = (d: any) => {
    if (language === "mk") return d.description_mk || d.description_en;
    if (language === "sq") return d.description_sq || d.description_en;
    return d.description_en;
  };

  if (isLoading) {
    return <Layout><div className="container py-20 text-center"><p className="text-muted-foreground">{t("common.loading")}</p></div></Layout>;
  }

  if (!dept) {
    return <Layout><div className="container py-20 text-center"><p className="text-muted-foreground">{language === "mk" ? "Одделението не е пронајдено" : language === "sq" ? "Departamenti nuk u gjet" : "Department not found"}</p></div></Layout>;
  }

  const overviewText = getDesc(dept) || (language === "mk" ? `Одделението за ${getName(dept)} при Клиничка Болница Тетово обезбедува сеопфатна грижа со модерна опрема и искусен медицински тим.` : language === "sq" ? `Departamenti i ${getName(dept)} në Spitalin Klinik Tetovë ofron kujdes gjithëpërfshirës me pajisje moderne dhe ekip mjekësor me përvojë.` : `The ${getName(dept)} department at Clinical Hospital Tetovo provides comprehensive care with modern equipment and an experienced medical team.`);

  const services = language === "mk"
    ? ["Дијагностички прегледи", "Амбулантски консултации", "Хоспитализација", "Следење на пациенти", "Рехабилитација"]
    : language === "sq"
    ? ["Ekzaminime diagnostike", "Konsultime ambulantore", "Hospitalizim", "Monitorim i pacientëve", "Rehabilitim"]
    : ["Diagnostic examinations", "Outpatient consultations", "Hospitalization", "Patient monitoring", "Rehabilitation"];

  const relatedDepts = (allDepartments || [])
    .filter((d) => d.category === dept.category && d.slug !== dept.slug)
    .slice(0, 3);

  return (
    <Layout>
      <section className="bg-primary py-14">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-4">
            <Link to="/" className="hover:text-primary-foreground">{t("nav.home")}</Link>
            <span>/</span>
            <Link to="/departments" className="hover:text-primary-foreground">{t("nav.departments")}</Link>
            <span>/</span>
            <span className="text-primary-foreground">{getName(dept)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <Stethoscope className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">{getName(dept)}</h1>
              <p className="text-primary-foreground/70">{getDesc(dept)?.slice(0, 100)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start rounded-2xl">
                <TabsTrigger value="overview">{t("departments.overview")}</TabsTrigger>
                <TabsTrigger value="services">{t("departments.services")}</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="contact">{t("footer.contact")}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="rounded-2xl border shadow-card">
                  <CardContent className="p-6">
                    {overviewText.split("\n\n").map((para, i) => (
                      <p key={i} className={`text-muted-foreground leading-[1.7] ${i > 0 ? "mt-4" : ""}`}>{para}</p>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <Card className="rounded-2xl border shadow-card">
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      {services.map((s) => (
                        <li key={s} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <DepartmentReviews departmentId={dept.id} isLoggedIn={!!user} />
              </TabsContent>

              <TabsContent value="contact" className="mt-6">
                <Card className="rounded-2xl border shadow-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      {dept.phone || "+389 75 200 304"}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      {dept.email || "kbtetovo@zdravstvo.gov.mk"}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      {language === "mk" ? "Клиничка Болница Тетово, ул. 29 Ноември, 1200 Тетово" : language === "sq" ? "Spitali Klinik Tetovë, rr. 29 Nëntori, 1200 Tetovë" : "Clinical Hospital Tetovo, st. 29 Noemvri, 1200 Tetovo"}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border shadow-card">
              <CardContent className="p-6 space-y-4">
                <h4 className="font-semibold">{t("contact.workingHours")}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> {language === "mk" ? "Пон – Пет: 07:00 – 15:00" : language === "sq" ? "Hën – Pre: 07:00 – 15:00" : "Mon – Fri: 07:00 – 15:00"}
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-destructive">{t("contact.emergencyLine")}</h4>
                  <p className="mt-1 text-lg font-bold text-destructive">194</p>
                </div>
              </CardContent>
            </Card>

            {relatedDepts.length > 0 && (
              <Card className="rounded-2xl border shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">{language === "mk" ? "Поврзани одделенија" : language === "sq" ? "Departamente të ngjashme" : "Related Departments"}</h4>
                  <div className="space-y-3">
                    {relatedDepts.map((rd) => (
                      <Link key={rd.slug} to={`/departments/${rd.slug}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <ArrowRight className="h-3 w-3" />
                        {getName(rd)}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DepartmentReviews({ departmentId, isLoggedIn }: { departmentId: string; isLoggedIn: boolean }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["dept-reviews", departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("rating, comment, is_anonymous, created_at, admin_response")
        .eq("department_id", departmentId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const avgRating = reviews?.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";
  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews?.filter(r => r.rating === s).length || 0,
    pct: reviews?.length ? ((reviews.filter(r => r.rating === s).length / reviews.length) * 100) : 0,
  }));

  if (isLoading) return <div className="space-y-3"><div className="h-20 bg-muted animate-pulse rounded-xl" /><div className="h-20 bg-muted animate-pulse rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold">{avgRating}</span>
            <div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className={`h-4 w-4 ${n <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{reviews?.length || 0} reviews</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {starCounts.map(s => (
              <div key={s.star} className="flex items-center gap-2 text-sm">
                <span className="w-3">{s.star}</span>
                <Star className="h-3 w-3 text-amber-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
                <span className="text-muted-foreground w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!isLoggedIn && (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            <Link to="/auth/login" className="text-primary hover:underline">Log in</Link> to leave a review
          </CardContent>
        </Card>
      )}

      {reviews?.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews?.map((r, i) => (
            <Card key={i} className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {r.is_anonymous ? "Anonymous" : "Patient"} · {new Date(r.created_at).toLocaleDateString("en", { month: "short", year: "numeric" })}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                {r.admin_response && (
                  <div className="mt-3 pl-3 border-l-2 border-primary/30">
                    <p className="text-xs font-medium text-primary">Hospital Response</p>
                    <p className="text-sm text-muted-foreground">{r.admin_response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

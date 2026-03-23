import { Link } from "react-router-dom";
import {
  Heart, AlertTriangle, Scissors, Brain, Baby, Users,
  Clock, Activity, FlaskConical, Stethoscope, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";

const departments = [
  { key: "cardiology", icon: Heart, slug: "cardiology" },
  { key: "emergency", icon: AlertTriangle, slug: "emergency" },
  { key: "surgery", icon: Scissors, slug: "surgery" },
  { key: "neurology", icon: Brain, slug: "neurology" },
  { key: "pediatrics", icon: Baby, slug: "pediatrics" },
  { key: "gynecology", icon: Users, slug: "gynecology" },
] as const;

const waitTimes = [
  { key: "er.emergency", time: 15, status: "green" },
  { key: "er.outpatient", time: 35, status: "yellow" },
  { key: "er.lab", time: 20, status: "green" },
] as const;

const news = [
  {
    date: "2026-03-20",
    title: { mk: "Нов MRI апарат во болницата", sq: "Aparat i ri MRI në spital", en: "New MRI Machine Installed" },
    excerpt: {
      mk: "Современ апарат за магнетна резонанца почна со работа",
      sq: "Aparat modern i rezonancës magnetike filloi punën",
      en: "A state-of-the-art MRI machine has begun operations",
    },
  },
  {
    date: "2026-03-15",
    title: { mk: "Бесплатни прегледи за деца", sq: "Kontrolle falas për fëmijë", en: "Free Pediatric Checkups" },
    excerpt: {
      mk: "Кампања за бесплатни педијатриски прегледи до крајот на месецот",
      sq: "Fushatë për kontrolle falas pediatrike deri në fund të muajit",
      en: "Free pediatric checkup campaign running through month end",
    },
  },
  {
    date: "2026-03-10",
    title: { mk: "Меѓународна конференција", sq: "Konferencë ndërkombëtare", en: "International Conference" },
    excerpt: {
      mk: "Болницата ќе биде домаќин на меѓународна медицинска конференција",
      sq: "Spitali do të jetë nikoqir i konferencës ndërkombëtare mjekësore",
      en: "The hospital will host an international medical conference",
    },
  },
];

const statusColor: Record<string, string> = {
  green: "bg-success text-success-foreground",
  yellow: "bg-warning text-warning-foreground",
  red: "bg-destructive text-destructive-foreground",
};

export default function HomePage() {
  const { t, language } = useTranslation();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-primary py-20 md:py-28">
        <div className="container text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/appointments">{t("hero.cta.appointment")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/departments">{t("hero.cta.departments")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-muted/30">
        <div className="container grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
          {[
            { value: "300,000+", label: t("stats.patients") },
            { value: "31", label: t("stats.departments") },
            { value: "50+", label: t("stats.years") },
            { value: "24/7", label: t("stats.emergency") },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-primary md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Departments */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-center text-2xl font-bold md:text-3xl">{t("dept.featured")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <Card key={dept.key} className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{t(`dept.${dept.key}` as any)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{t(`dept.${dept.key}.desc` as any)}</p>
                    <Link
                      to={`/departments/${dept.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t("dept.learnMore")} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ER Wait Times */}
      <section className="border-y bg-muted/20 py-16">
        <div className="container">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">{t("er.title")}</h2>
          </div>
          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-3">
            {waitTimes.map((wt) => (
              <Card key={wt.key} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">{t(wt.key as any)}</p>
                  <p className="mt-2 text-3xl font-bold">{wt.time}</p>
                  <p className="text-xs text-muted-foreground">{t("er.minutes")}</p>
                  <Badge className={`mt-3 ${statusColor[wt.status]}`}>
                    {wt.status === "green" ? "Low" : wt.status === "yellow" ? "Moderate" : "High"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Symptom Checker */}
      <section className="py-16">
        <div className="container text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">{t("symptom.title")}</h2>
          <Button asChild size="lg" className="mt-6">
            <Link to="/symptom-checker">{t("symptom.cta")}</Link>
          </Button>
        </div>
      </section>

      {/* News */}
      <section className="border-t bg-muted/20 py-16">
        <div className="container">
          <h2 className="text-center text-2xl font-bold">{t("news.title")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 bg-accent" />
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                  <h3 className="mt-1 font-semibold">{item.title[language]}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.excerpt[language]}</p>
                  <Link
                    to="/news"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {t("news.readMore")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {[
              language === "mk" ? "Министерство за здравство" : language === "sq" ? "Ministria e Shëndetësisë" : "Ministry of Health",
              language === "mk" ? "Фонд за здравство" : language === "sq" ? "Fondi Shëndetësor" : "Health Insurance Fund",
              language === "mk" ? "Регулаторна агенција" : language === "sq" ? "Agjencia Rregullatore" : "Drug Registry Agency",
            ].map((name) => (
              <div key={name} className="flex h-12 items-center rounded-lg border bg-muted/30 px-6 text-xs font-medium">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

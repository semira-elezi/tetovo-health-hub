import { Link } from "react-router-dom";
import {
  Heart, AlertTriangle, Scissors, Brain, Baby, Users,
  Clock, Activity, FlaskConical, Stethoscope, ArrowRight,
  Phone, Shield, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";
import heroImg from "@/assets/hero-hospital.jpg";
import medicalBg from "@/assets/medical-pattern.jpg";

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
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <img
          src={heroImg}
          alt="Clinical Hospital Tetovo"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 gradient-hero opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />

        <div className="container relative z-10 py-20">
          <div className="max-w-2xl animate-slide-up">
            <Badge className="mb-6 rounded-full bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20 backdrop-blur-sm px-4 py-1.5 text-sm">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              {language === "sq" ? "50+ vite përvojë" : language === "en" ? "50+ years experience" : "50+ години искуство"}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground md:text-6xl lg:text-7xl leading-[1.1]">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-primary-foreground/75 md:text-xl animate-slide-up-delay-1">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-slide-up-delay-2">
              <Button asChild size="lg" className="rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg text-base px-8 h-12">
                <Link to="/appointments">{t("hero.cta.appointment")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground backdrop-blur-sm text-base px-8 h-12">
                <Link to="/departments">{t("hero.cta.departments")}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating stats on hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container pb-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 -mb-12">
              {[
                { value: "300,000+", label: t("stats.patients"), icon: Users },
                { value: "31", label: t("stats.departments"), icon: Award },
                { value: "50+", label: t("stats.years"), icon: Clock },
                { value: "24/7", label: t("stats.emergency"), icon: Phone },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`glass-card p-4 md:p-5 text-center hover-lift animate-slide-up-delay-${Math.min(i + 1, 3)}`}
                >
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for floating stats */}
      <div className="h-20" />

      {/* Featured Departments */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-3 rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-1">
              {language === "sq" ? "Shërbimet tona" : language === "en" ? "Our services" : "Наши услуги"}
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">{t("dept.featured")}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, i) => {
              const Icon = dept.icon;
              return (
                <Card key={dept.key} className="glass-card hover-lift group border-border/50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                  <CardHeader className="flex flex-row items-center gap-4 pb-2 relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-md transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-base font-semibold">{t(`dept.${dept.key}` as any)}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(`dept.${dept.key}.desc` as any)}</p>
                    <Link
                      to={`/departments/${dept.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all duration-300"
                    >
                      {t("dept.learnMore")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ER Wait Times */}
      <section
        className="relative py-20 overflow-hidden"
      >
        <img
          src={medicalBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          loading="lazy"
          width={1920}
          height={512}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/80" />
        <div className="container relative z-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">{t("er.title")}</h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-3">
            {waitTimes.map((wt) => (
              <Card key={wt.key} className="glass-card text-center hover-lift border-border/50">
                <CardContent className="pt-8 pb-8">
                  <p className="text-sm font-medium text-muted-foreground">{t(wt.key as any)}</p>
                  <p className="mt-3 text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{wt.time}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("er.minutes")}</p>
                  <Badge className={`mt-4 rounded-full px-3 ${statusColor[wt.status]}`}>
                    {wt.status === "green" ? "Low" : wt.status === "yellow" ? "Moderate" : "High"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Symptom Checker */}
      <section className="py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl gradient-hero p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(203_73%_50%/0.3),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(210_60%_45%/0.3),transparent_50%)]" />
            <div className="relative z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm mb-6 animate-float">
                <Stethoscope className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">{t("symptom.title")}</h2>
              <p className="mt-3 text-primary-foreground/70 max-w-md mx-auto">
                {language === "sq" ? "AI asistenti ynë do t'ju ndihmojë të gjeni departamentin e duhur" : language === "en" ? "Our AI assistant will help you find the right department" : "Нашиот AI асистент ќе ви помогне да го најдете вистинското одделение"}
              </p>
              <Button asChild size="lg" className="mt-8 rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg px-8 h-12">
                <Link to="/symptom-checker">{t("symptom.cta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-20 gradient-accent">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-3 rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-1">
              {language === "sq" ? "Lajme" : language === "en" ? "News" : "Вести"}
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">{t("news.title")}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item, i) => (
              <Card key={i} className="glass-card overflow-hidden hover-lift group border-border/50">
                <div className="h-44 bg-gradient-to-br from-primary/10 via-primary/5 to-accent relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(203_73%_38%/0.15),transparent_60%)]" />
                  <div className="absolute bottom-3 left-4">
                    <Badge variant="secondary" className="rounded-full text-xs backdrop-blur-sm bg-background/80">{item.date}</Badge>
                  </div>
                </div>
                <CardContent className="pt-5">
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors duration-300">{item.title[language]}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.excerpt[language]}</p>
                  <Link
                    to="/news"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all duration-300"
                  >
                    {t("news.readMore")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-8">
            {language === "sq" ? "Partnerët tanë" : language === "en" ? "Our partners" : "Наши партнери"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              language === "mk" ? "Министерство за здравство" : language === "sq" ? "Ministria e Shëndetësisë" : "Ministry of Health",
              language === "mk" ? "Фонд за здравство" : language === "sq" ? "Fondi Shëndetësor" : "Health Insurance Fund",
              language === "mk" ? "Регулаторна агенција" : language === "sq" ? "Agjencia Rregullatore" : "Drug Registry Agency",
            ].map((name) => (
              <div key={name} className="glass-card flex h-14 items-center px-8 text-sm font-medium text-muted-foreground hover-lift">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

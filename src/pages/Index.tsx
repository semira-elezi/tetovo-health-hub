import { Link } from "react-router-dom";
import {
  Heart, AlertTriangle, Scissors, Brain, Baby, Users,
  ArrowRight, CheckCircle2, FileText, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNews } from "@/hooks/useNews";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/* ─── Counter animation hook ─── */
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ─── Stagger animation hook ─── */
function useStaggerIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

/* ─── Data ─── */
const departments = [
  { nameKey: "dept.cardiology", descKey: "dept.cardiology.desc", icon: Heart, slug: "cardiology" },
  { nameKey: "dept.emergency", descKey: "dept.emergency.desc", icon: AlertTriangle, slug: "emergency-medicine" },
  { nameKey: "dept.surgery", descKey: "dept.surgery.desc", icon: Scissors, slug: "general-surgery-traumatology" },
  { nameKey: "dept.neurology", descKey: "dept.neurology.desc", icon: Brain, slug: "neurology" },
  { nameKey: "dept.gynecology", descKey: "dept.gynecology.desc", icon: Baby, slug: "gynecology" },
  { nameKey: "dept.pediatrics", descKey: "dept.pediatrics.desc", icon: Users, slug: "pediatrics" },
];

const partners = [
  { nameKey: "ministry", name: { mk: "Министерство за здравство", sq: "Ministria e Shëndetësisë", en: "Ministry of Health" }, url: "http://zdravstvo.gov.mk/" },
  { nameKey: "fzo", name: { mk: "Фонд за здравствено осигурување", sq: "Fondi i Sigurimit Shëndetësor", en: "Health Insurance Fund" }, url: "https://fzo.org.mk/" },
  { nameKey: "mojtermin", name: { mk: "Мој Термин", sq: "Moj Termin", en: "Moj Termin" }, url: "http://zdravstvo.gov.mk/" },
  { nameKey: "chamber", name: { mk: "Лекарска комора", sq: "Dhoma e Mjekëve", en: "Medical Chamber" }, url: "http://www.lkm.org.mk/" },
  { nameKey: "drugs", name: { mk: "Регистар на лекови", sq: "Regjistri i Barnave", en: "Drug Registry" }, url: "https://lekovi.zdravstvo.gov.mk/" },
];

const usefulLinks = [
  { name: "Alo Doktore", url: "http://alodoktore.mk/" },
  { name: { mk: "Центар за медицинска симулација", sq: "Qendra e Simulimit Mjekësor", en: "Medical Simulation Centre" }, url: "https://msc.gov.mk/" },
  { name: { mk: "Влада на Северна Македонија", sq: "Qeveria e Maqedonisë së Veriut", en: "Government of North Macedonia" }, url: "https://vlada.mk/" },
  { name: { mk: "Правна база на податоци", sq: "Baza e të dhënave ligjore", en: "Legal Database" }, url: "https://ldbis.pravda.gov.mk/" },
];

/* ─── Stats counters ─── */
function StatsBar() {
  const { t } = useTranslation();
  const s1 = useCountUp(100000);
  const s2 = useCountUp(30);
  const s3 = useCountUp(500);
  const s4 = useCountUp(31);

  const stats = [
    { ref: s1.ref, value: `${s1.count.toLocaleString()}+`, label: t("stats.inspections") },
    { ref: s2.ref, value: `${s2.count}+`, label: t("stats.operations") },
    { ref: s3.ref, value: `${s3.count}+`, label: t("stats.outpatient") },
    { ref: s4.ref, value: String(s4.count), label: t("stats.specializedDepts") },
  ];

  return (
    <section className="bg-primary py-10 md:py-12">
      <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} ref={stat.ref} className="text-center">
            <p className="text-2xl font-extrabold text-primary-foreground md:text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs md:text-sm text-primary-foreground/75">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  const deptAnim = useStaggerIn();
  const { t, language } = useTranslation();

  const getLocalName = (obj: any) => {
    if (typeof obj === "string") return obj;
    return obj[language] || obj.en;
  };

  const { data: latestNews } = useNews();
  const { data: procurementDocs } = useQuery({
    queryKey: ["procurement-documents-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("procurement_documents").select("category");
      if (error) throw error;
      return data;
    },
  });

  const publicInfoItems = [
    { key: "documents", label: t("publicInfo.documents") },
    { key: "budget", label: t("publicInfo.budget") },
    { key: "quarterly_reports", label: t("publicInfo.quarterlyReports") },
    { key: "annual_financial_reports", label: t("publicInfo.annualReports") },
    { key: "internal_job_listings", label: t("publicInfo.jobListings") },
    { key: "annual_procurement_plan", label: t("publicInfo.procurementPlan") },
    { key: "procurement_announcements", label: t("publicInfo.procurementAnnouncements") },
    { key: "patient_rights", label: t("publicInfo.patientRights") },
  ];

  return (
    <Layout>
      {/* ══════ HERO ══════ */}
      <section className="py-10 md:py-16">
        <div className="container grid items-center gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="animate-hero text-xs font-semibold uppercase tracking-widest text-accent">
              {t("hero.badge")}
            </p>
            <h1 className="animate-hero-delay-1 mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="animate-hero-delay-2 mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="animate-hero-delay-3 mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-7 btn-press">
                <Link to="/appointments">{t("hero.cta.appointment")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-7 btn-press">
                <Link to="/departments">{t("hero.cta.departments")}</Link>
              </Button>
            </div>
            <div className="animate-hero-delay-3 mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> {t("hero.24emergency")}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> {t("hero.31depts")}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> {t("hero.50years")}</span>
            </div>
          </div>

          <div className="relative lg:col-span-2 animate-hero-delay-2">
            <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80" alt="Clinical Hospital Tetovo" className="w-full rounded-2xl object-cover aspect-[4/5]" width={800} height={1000} />
            <div className="absolute -bottom-4 -left-4 rounded-2xl border bg-card p-4 shadow-card sm:bottom-6 sm:left-[-2rem]">
              <p className="text-2xl font-extrabold text-primary">300,000+</p>
              <p className="text-xs text-muted-foreground">{t("hero.patientsYear")}</p>
            </div>
          </div>
        </div>
      </section>

      <StatsBar />

      {/* ══════ DEPARTMENTS ══════ */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">{t("dept.ourDepartments")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("dept.specializedCare")}</p>
            </div>
            <Link to="/departments" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              {t("dept.learnMore")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div ref={deptAnim.ref} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, i) => {
              const Icon = dept.icon;
              return (
                <Link
                  key={dept.slug}
                  to={`/departments/${dept.slug}`}
                  className="group block surface surface-hover p-5 card-hover"
                  style={{ opacity: deptAnim.visible ? 1 : 0, transform: deptAnim.visible ? "translateY(0)" : "translateY(16px)", transition: `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s` }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{t(dept.nameKey as any)}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">{t(dept.descKey as any)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {t("dept.learnMore")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ ABOUT ══════ */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80" alt="Hospital exterior" className="rounded-xl object-cover w-full h-40 lg:h-52" loading="lazy" />
            <img src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&q=80" alt="Hospital hallway" className="rounded-xl object-cover w-full h-40 lg:h-52" loading="lazy" />
            <img src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80" alt="Operating room" className="rounded-xl object-cover w-full h-40 lg:h-52" loading="lazy" />
            <img src="https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600&q=80" alt="Doctor with patient" className="rounded-xl object-cover w-full h-40 lg:h-52" loading="lazy" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("about.badge")}</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">{t("about.title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t("about.description")}</p>
            <Button asChild variant="outline" size="lg" className="mt-6 w-fit rounded-full px-7 btn-press">
              <Link to="/about">{t("about.moreAbout")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════ PUBLIC INFORMATION ══════ */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">{t("publicInfo.title")}</h2>
            <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground">{t("publicInfo.description")}</p>
          </div>
          <div className="mt-8 grid gap-3 grid-cols-2 md:grid-cols-4">
            {publicInfoItems.map((item) => {
              const count = (procurementDocs || []).filter((d: any) => d.category === item.key).length;
              return (
                <Link
                  key={item.key}
                  to={`/public-info?cat=${item.key}`}
                  className="surface surface-hover card-hover p-5 flex flex-col items-center gap-2.5 text-center"
                >
                  <FileText className="h-7 w-7 text-primary" />
                  <p className="text-sm font-semibold leading-snug">{item.label}</p>
                  <Badge variant="outline" className="rounded-full text-[11px] font-medium">
                    {count} {language === "mk" ? "док." : language === "sq" ? "dok." : "docs"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ NEWS ══════ */}
      <section className="py-12 md:py-16 bg-muted/40">
        <div className="container">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-2xl font-bold md:text-3xl">{t("news.title")}</h2>
            <Link to="/news" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              {t("news.readMore")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(latestNews || []).slice(0, 3).map((item: any) => {
              const catKey = item.category === "hospital_news" ? "news.hospital" : item.category === "health_tips" ? "news.healthTips" : item.category === "events" ? "news.events" : "news.announcements";
              return (
                <Link
                  key={item.id}
                  to={`/news/${item.slug}`}
                  className="group block surface surface-hover card-hover overflow-hidden"
                >
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {item.published_at ? format(new Date(item.published_at), "MMM d, yyyy") : ""}
                      </span>
                      <Badge className="rounded-full bg-accent text-accent-foreground text-[10px] px-2 py-0">{t(catKey as any)}</Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold leading-snug line-clamp-2">{item.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.excerpt}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      {t("news.readMore")} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
            {latestNews && latestNews.length === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground">{language === "mk" ? "Нема вести" : language === "sq" ? "Nuk ka lajme" : "No news yet"}</p>
            )}
          </div>
        </div>
      </section>

      {/* ══════ PARTNERS ══════ */}
      <section className="py-10 md:py-12">
        <div className="container">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">{t("partners.title")}</h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {partners.map((p) => (
              <a key={p.nameKey} href={p.url} target="_blank" rel="noopener noreferrer"
                className="surface surface-hover card-hover flex items-center gap-2 px-4 py-2.5 text-sm font-medium">
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                {getLocalName(p.name)}
              </a>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {usefulLinks.map((link) => (
              <a key={typeof link.name === "string" ? link.name : link.name.en} href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                {getLocalName(link.name)}
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

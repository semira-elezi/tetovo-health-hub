import { Link } from "react-router-dom";
import {
  Heart, AlertTriangle, Scissors, Brain, Baby, Users,
  ArrowRight, Calendar, Stethoscope, Asterisk, Phone, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNews } from "@/hooks/useNews";
import { useERWaitTimes } from "@/hooks/useERWaitTimes";
import DoctorAvailabilityWidget from "@/components/features/availability/DoctorAvailabilityWidget";
import { format } from "date-fns";

/* ─── Counter ─── */
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setCount(Math.floor(p * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { count, ref };
}

const departments = [
  { nameKey: "dept.cardiology", descKey: "dept.cardiology.desc", icon: Heart, slug: "cardiology",
    mk: "Кардиологија", en: "Cardiology" },
  { nameKey: "dept.neurology", descKey: "dept.neurology.desc", icon: Brain, slug: "neurology",
    mk: "Неврологија", en: "Neurology" },
  { nameKey: "dept.pediatrics", descKey: "dept.pediatrics.desc", icon: Baby, slug: "pediatrics",
    mk: "Педијатрија", en: "Pediatrics" },
  { nameKey: "dept.surgery", descKey: "dept.surgery.desc", icon: Scissors, slug: "general-surgery-traumatology",
    mk: "Хирургија", en: "Surgery" },
];

function dotColor(mins: number) {
  if (mins <= 15) return "bg-emerald-400";
  if (mins <= 30) return "bg-yellow-400";
  return "bg-orange-400";
}

export default function HomePage() {
  const { t, language } = useTranslation();
  const { data: latestNews } = useNews();
  const { data: erWaits } = useERWaitTimes();

  const s1 = useCountUp(300);
  const s2 = useCountUp(500);
  const s3 = useCountUp(31);

  const featured = (latestNews || [])[0];
  const sideNews = (latestNews || []).slice(1, 3);

  const waitItems = (erWaits || []).slice(0, 3);

  return (
    <Layout>
      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden bg-[hsl(222_60%_18%)] text-white">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1600&q=80')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222_60%_15%)] via-[hsl(222_60%_18%)]/85 to-[hsl(222_60%_22%)]/70" aria-hidden />

        <div className="container relative grid gap-10 py-14 md:py-20 lg:grid-cols-5 lg:gap-12">
          {/* Left */}
          <div className="lg:col-span-3 animate-hero">
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
              {t("hero.title")}
            </h1>
            <p className="mt-3 text-xs uppercase tracking-widest text-white/55 animate-hero-delay-1">
              Вашата грижа, наш приоритет. / Your care, our priority.
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 animate-hero-delay-2 md:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row animate-hero-delay-3">
              <Button asChild size="lg" className="rounded-lg bg-white text-primary hover:bg-white/90 px-6 btn-press">
                <Link to="/appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("hero.cta.appointment")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white px-6 btn-press">
                <Link to="/symptom-checker">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  {language === "mk" ? "Проверка на симптоми" : language === "sq" ? "Symptom Checker" : "Symptom Checker"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right — ER wait times card (glassmorphic) */}
          <div className="lg:col-span-2 animate-hero-delay-2">
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md p-5 shadow-2xl">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Asterisk className="h-4 w-4 text-red-300" />
                {language === "mk" ? "Време на чекање во Ургенција" : language === "sq" ? "Koha e Pritjes në Urgjencë" : "ER Wait Times"}
              </div>

              <div className="mt-4 space-y-2.5">
                {(waitItems.length > 0 ? waitItems : [
                  { id: "a", department: "Cardiology", department_mk: "Кардиологија", department_sq: "Kardiologji", wait_minutes: 15 },
                  { id: "b", department: "Pediatrics", department_mk: "Педијатрија", department_sq: "Pediatri", wait_minutes: 5 },
                  { id: "c", department: "Orthopedics", department_mk: "Ортопедија", department_sq: "Ortopedi", wait_minutes: 45 },
                ]).map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">
                        {language === "sq" ? (w.department_sq || w.department) : language === "mk" ? (w.department_mk || w.department) : w.department}
                      </p>
                      <p className="text-[11px] text-white/55 leading-tight mt-0.5">
                        {w.department_mk || w.department} / {w.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`h-2 w-2 rounded-full ${dotColor(w.wait_minutes)}`} />
                      <span className="text-sm font-semibold tabular-nums">{w.wait_minutes} min</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[11px] italic text-white/45">
                * {language === "mk" ? "Времињата се приближни и се ажурираат на секои 5 минути." : language === "sq" ? "Kohët e pritjes janë të përafërta dhe përditësohen çdo 5 minuta." : "Wait times are approximate and updated every 5 minutes."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ STATS BAR ══════ */}
      <section className="border-b bg-card">
        <div className="container grid grid-cols-3 divide-x divide-border">
          {[
            { ref: s1.ref, value: `${s1.count}k+`, sq: "Pacientë në vit", mk: "Пациенти годишно", en: "Patients per year" },
            { ref: s2.ref, value: `${s2.count}+`, sq: "Mjekë Specialistë", mk: "Специјалисти", en: "Medical Specialists" },
            { ref: s3.ref, value: `${s3.count}`,  sq: "Reparte", mk: "Одели", en: "Departments" },
          ].map((s, i) => (
            <div key={i} ref={s.ref} className="py-7 text-center px-4">
              <p className="text-3xl md:text-4xl font-extrabold text-primary tabular-nums">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {language === "sq" ? s.sq : language === "mk" ? s.mk : s.en}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.mk} / {s.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ DEPARTMENTS ══════ */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                {language === "sq" ? "Repartet Kryesore" : language === "mk" ? "Главни Одели" : "Featured Departments"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Главни Одели / Featured Departments</p>
            </div>
            <Link to="/departments" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((d) => {
              const Icon = d.icon;
              return (
                <Link key={d.slug} to={`/departments/${d.slug}`} className="group block surface surface-hover p-5 card-hover">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-primary">{t(d.nameKey as any)}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{d.mk} / {d.en}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{t(d.descKey as any)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ DOCTOR AVAILABILITY ══════ */}
      <DoctorAvailabilityWidget />

      {/* ══════ NEWS ══════ */}
      <section className="py-12 md:py-16 bg-muted/40">
        <div className="container">
          <div className="mb-6">
            <h2 className="text-2xl font-bold md:text-3xl">
              {language === "sq" ? "Lajmet e Fundit" : language === "mk" ? "Последни Вести" : "Latest News"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Последни Вести / Latest News</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            {featured && (
              <Link to={`/news/${featured.slug}`} className="lg:col-span-3 group block surface overflow-hidden card-hover">
                {featured.image_url && (
                  <div className="relative h-72 md:h-96 overflow-hidden">
                    <img src={featured.image_url} alt={featured.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <span className="inline-block rounded-md bg-white/15 backdrop-blur px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {language === "sq" ? "Investim i ri" : language === "mk" ? "Инвестиција" : "Investment"}
                      </span>
                      <h3 className="mt-3 text-lg md:text-xl font-bold leading-snug line-clamp-2">{featured.title}</h3>
                      {featured.excerpt && <p className="mt-1.5 text-sm text-white/80 line-clamp-2">{featured.excerpt}</p>}
                      {featured.published_at && (
                        <p className="mt-2 text-xs text-white/65">{format(new Date(featured.published_at), "d MMM, yyyy")}</p>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            )}

            <div className="lg:col-span-2 flex flex-col gap-5">
              {sideNews.map((item: any) => (
                <Link key={item.id} to={`/news/${item.slug}`} className="group block surface surface-hover card-hover p-5 flex-1">
                  <span className="inline-block rounded-md bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    {item.category === "events" ? (language === "sq" ? "Ngjarje" : "Event") : (language === "sq" ? "Njoftim" : "Notice")}
                  </span>
                  <h3 className="mt-3 text-base font-bold text-primary leading-snug line-clamp-2 group-hover:underline">{item.title}</h3>
                  {item.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>}
                  {item.published_at && (
                    <p className="mt-3 text-xs text-muted-foreground">{format(new Date(item.published_at), "d MMM, yyyy")}</p>
                  )}
                </Link>
              ))}
              {sideNews.length === 0 && !featured && (
                <p className="text-sm text-muted-foreground">{language === "sq" ? "Nuk ka lajme" : language === "mk" ? "Нема вести" : "No news yet"}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ EMERGENCY CTA ══════ */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="rounded-2xl bg-primary text-primary-foreground px-6 md:px-10 py-10 md:py-12 text-center">
            <h3 className="text-xl md:text-2xl font-bold">
              {language === "sq" ? "Keni nevojë për ndihmë mjekësore?" : language === "mk" ? "Ви треба медицинска помош?" : "Need medical assistance?"}
            </h3>
            <p className="mt-2 text-sm md:text-base text-primary-foreground/80 max-w-2xl mx-auto">
              {language === "sq" ? "Ekipi ynë është në dispozicion 24/7 për urgjencat dhe konsultat tuaja." :
               language === "mk" ? "Нашиот тим е достапен 24/7 за итни случаи и консултации." :
               "Our team is available 24/7 for emergencies and consultations."}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="tel:194" className="inline-flex items-center gap-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6 py-3 text-sm font-semibold btn-press">
                <Phone className="h-4 w-4" />
                {language === "sq" ? "Urgjenca: 194" : language === "mk" ? "Итна: 194" : "Emergency: 194"}
              </a>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-white text-primary hover:bg-white/90 px-6 py-3 text-sm font-semibold btn-press">
                <Mail className="h-4 w-4" />
                {language === "sq" ? "Na Kontaktoni" : language === "mk" ? "Контакт" : "Contact Us"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

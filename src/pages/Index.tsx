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
  { name: "Cardiology", desc: "Diagnosis and treatment of heart and vascular diseases.", icon: Heart, slug: "cardiology" },
  { name: "Emergency Medicine", desc: "24/7 emergency and acute care services.", icon: AlertTriangle, slug: "emergency-medicine" },
  { name: "General Surgery", desc: "Surgical treatment of injuries and trauma.", icon: Scissors, slug: "general-surgery" },
  { name: "Neurology", desc: "Diagnosis and treatment of neurological diseases.", icon: Brain, slug: "neurology" },
  { name: "Gynecology & Obstetrics", desc: "Women's health, pregnancy, and childbirth.", icon: Baby, slug: "gynecology" },
  { name: "Pediatrics", desc: "Pediatric medicine and child healthcare.", icon: Users, slug: "pediatrics" },
];

const newsItems = [
  {
    slug: "new-medical-equipment",
    title: "New Medical Equipment for the Oncology Department",
    date: "March 10, 2025",
    category: "Hospital News",
    excerpt: "The hospital has received new state-of-the-art equipment for the application of cytostatic therapy, significantly improving treatment capabilities.",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=80",
  },
  {
    slug: "health-screening-campaign",
    title: "Annual Health Screening Campaign Launches This Spring",
    date: "February 22, 2025",
    category: "Health Tips",
    excerpt: "Free preventive examinations will be available to citizens of the Tetovo region throughout April and May as part of our community health initiative.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  },
  {
    slug: "50-years",
    title: "Clinical Hospital Tetovo Celebrates 50 Years of Service",
    date: "January 15, 2025",
    category: "Events",
    excerpt: "This year marks five decades of dedicated medical service to the communities of northwestern North Macedonia.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
  },
];

const publicInfoItems = [
  "Documents", "Budget", "Quarterly Reports", "Annual Financial Reports",
  "Internal Job Listings", "Annual Procurement Plan", "Procurement Announcements", "Patient Rights & Obligations",
];

const partners = [
  { name: "Ministry of Health", url: "http://zdravstvo.gov.mk/" },
  { name: "Health Insurance Fund", url: "https://fzo.org.mk/" },
  { name: "Moj Termin", url: "http://zdravstvo.gov.mk/" },
  { name: "Medical Chamber", url: "http://www.lkm.org.mk/" },
  { name: "Drug Registry", url: "https://lekovi.zdravstvo.gov.mk/" },
];

const usefulLinks = [
  { name: "Alo Doktore", url: "http://alodoktore.mk/" },
  { name: "Medical Simulation Centre", url: "https://msc.gov.mk/" },
  { name: "Government of North Macedonia", url: "https://vlada.mk/" },
  { name: "Legal Database", url: "https://ldbis.pravda.gov.mk/" },
];

/* ─── Stats counters ─── */
function StatsBar() {
  const s1 = useCountUp(100000);
  const s2 = useCountUp(30);
  const s3 = useCountUp(500);
  const s4 = useCountUp(31);

  const stats = [
    { ref: s1.ref, value: `${s1.count.toLocaleString()}+`, label: "Inspections & services performed" },
    { ref: s2.ref, value: `${s2.count}+`, label: "Operations performed daily" },
    { ref: s3.ref, value: `${s3.count}+`, label: "Outpatient examinations daily" },
    { ref: s4.ref, value: String(s4.count), label: "Specialized departments" },
  ];

  return (
    <section className="bg-primary py-16">
      <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} ref={stat.ref} className="text-center">
            <p className="text-3xl font-extrabold text-primary-foreground md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-primary-foreground/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  const deptAnim = useStaggerIn();

  return (
    <Layout>
      {/* ══════ HERO ══════ */}
      <section className="py-16 md:py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-5">
          {/* Left 60% */}
          <div className="lg:col-span-3">
            <p className="animate-hero text-xs font-semibold uppercase tracking-widest text-accent">
              Public Health Institution — Tetovo, North Macedonia
            </p>
            <h1 className="animate-hero-delay-1 mt-4 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Five Decades of Trusted Medical Care
            </h1>
            <p className="animate-hero-delay-2 mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Serving 300,000 patients per year from across the entire region with 31 specialized departments and modern medical standards.
            </p>
            <div className="animate-hero-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 py-3 btn-press">
                <Link to="/contact">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-3 btn-press">
                <Link to="/departments">Explore Departments</Link>
              </Button>
            </div>
            <div className="animate-hero-delay-3 mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> 24/7 Emergency</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> 31 Departments</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> 50+ Years Experience</span>
            </div>
          </div>

          {/* Right 40% */}
          <div className="relative lg:col-span-2 animate-hero-delay-2">
            <img
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80"
              alt="Clinical Hospital Tetovo"
              className="w-full rounded-2xl object-cover aspect-[4/5]"
              width={800}
              height={1000}
            />
            {/* Floating stat card */}
            <div className="absolute -bottom-4 -left-4 rounded-2xl border bg-card p-5 shadow-card sm:bottom-6 sm:left-[-2rem]">
              <p className="text-3xl font-extrabold text-primary">300,000+</p>
              <p className="text-sm text-muted-foreground">Patients per year</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ STATS BAR ══════ */}
      <StatsBar />

      {/* ══════ DEPARTMENTS ══════ */}
      <section className="py-24">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Our Departments</h2>
            <p className="mt-3 text-muted-foreground">Specialized care across 31 medical fields</p>
          </div>
          <div
            ref={deptAnim.ref}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {departments.map((dept, i) => {
              const Icon = dept.icon;
              return (
                <Card
                  key={dept.slug}
                  className="card-hover rounded-2xl border shadow-card overflow-hidden"
                  style={{
                    opacity: deptAnim.visible ? 1 : 0,
                    transform: deptAnim.visible ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`,
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{dept.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{dept.desc}</p>
                    <Link
                      to={`/departments/${dept.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ ABOUT SECTION ══════ */}
      <section className="py-24 bg-secondary">
        <div className="container grid gap-12 lg:grid-cols-2">
          {/* Image grid */}
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80" alt="Hospital exterior" className="rounded-2xl object-cover w-full h-48 lg:h-56" loading="lazy" />
            <img src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&q=80" alt="Hospital hallway" className="rounded-2xl object-cover w-full h-48 lg:h-56" loading="lazy" />
            <img src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80" alt="Operating room" className="rounded-2xl object-cover w-full h-48 lg:h-56" loading="lazy" />
            <img src="https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600&q=80" alt="Doctor with patient" className="rounded-2xl object-cover w-full h-48 lg:h-56" loading="lazy" />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">About the hospital</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Health care according to modern medical standards
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              PHI Clinical Hospital Tetovo is a Public Health Institution with rights, obligations and responsibilities established by law, collective agreement, statute and other general acts. Health care is one of the important elements for preserving and improving the health, living and working environment of citizens, and a significant factor for economic development.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-8 w-fit rounded-full px-8 btn-press">
              <Link to="/about">More about the hospital <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════ PUBLIC INFORMATION ══════ */}
      <section className="py-24 bg-muted">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Public Information</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              In accordance with the Law on Free Access to Public Information, openness in the operation of the Hospital is ensured.
            </p>
          </div>
          <div className="mt-12 grid gap-4 grid-cols-2 md:grid-cols-4">
            {publicInfoItems.map((item) => (
              <Card key={item} className="card-hover rounded-2xl border shadow-card cursor-pointer">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="text-sm font-semibold">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ NEWS ══════ */}
      <section className="py-24">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Latest News</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <Card key={item.slug} className="card-hover rounded-2xl border shadow-card overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                    <Badge className="rounded-full bg-accent text-accent-foreground text-xs px-2.5 py-0.5">
                      {item.category}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-base font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.excerpt}</p>
                  <Link
                    to={`/news/${item.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PARTNERS ══════ */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <h3 className="text-center text-lg font-semibold mb-8">Our Partners</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {partners.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover flex items-center gap-2 rounded-2xl border bg-card px-6 py-4 text-sm font-medium shadow-card"
              >
                <ExternalLink className="h-4 w-4 text-primary" />
                {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ USEFUL LINKS ══════ */}
      <section className="py-12">
        <div className="container flex flex-wrap items-center justify-center gap-6">
          {usefulLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              {link.name}
            </a>
          ))}
        </div>
      </section>
    </Layout>
  );
}

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, Award, Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useTranslation } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1400&q=80" alt="Clinical Hospital Tetovo" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">{t("about.heroTitle")}</h1>
          <p className="mt-4 text-lg text-white/80">{t("about.heroSubtitle")}</p>
        </div>
      </section>

      <section className="py-24">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-base leading-[1.7] text-muted-foreground">{t("about.p1")}</p>
            <p className="mt-4 text-base leading-[1.7] text-muted-foreground">{t("about.p2")}</p>
            <p className="mt-4 text-base leading-[1.7] text-muted-foreground">{t("about.p3")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, value: "50+", label: t("about.yearsService") },
              { icon: Award, value: "31", label: t("about.departments") },
              { icon: Users, value: "300,000+", label: t("about.patientsYear") },
              { icon: Heart, value: "24/7", label: t("about.emergencyCare") },
            ].map((stat) => (
              <Card key={stat.label} className="rounded-2xl border shadow-card">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto" />
                  <p className="mt-3 text-2xl font-extrabold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary">
        <div className="container">
          <h2 className="text-center text-3xl font-bold md:text-4xl">{t("about.management")}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { role: t("about.director") },
              { role: t("about.deputyMedical") },
              { role: t("about.deputyEconomic") },
            ].map((person) => (
              <Card key={person.role} className="rounded-2xl border shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-semibold">Dr. [Name]</h3>
                  <p className="text-sm text-muted-foreground">{person.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-bold md:text-4xl">{t("about.administration")}</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[t("about.aboutUs"), t("about.laws"), t("footer.management"), t("footer.administration")].map((item) => (
              <Card key={item} className="card-hover rounded-2xl border shadow-card cursor-pointer">
                <CardContent className="p-6 text-center">
                  <p className="font-semibold">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

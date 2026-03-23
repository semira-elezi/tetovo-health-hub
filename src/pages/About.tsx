import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Award, Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1400&q=80"
          alt="Clinical Hospital Tetovo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">About Clinical Hospital Tetovo</h1>
          <p className="mt-4 text-lg text-white/80">A legacy of medical excellence since 1974</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-base leading-[1.7] text-muted-foreground">
              PHI Clinical Hospital Tetovo is a Public Health Institution established by law with full rights and obligations set out by the collective agreement, statute, and other general acts.
            </p>
            <p className="mt-4 text-base leading-[1.7] text-muted-foreground">
              Health care in a country is one of the important elements for preserving and improving the health of citizens. It protects the standard of living and social security, and is a significant factor for economic development.
            </p>
            <p className="mt-4 text-base leading-[1.7] text-muted-foreground">
              With 31 specialized departments and over 300,000 patients treated per year, we serve the entire northwestern region of North Macedonia, including Tetovo, Gostivar, Kičevo, and surrounding municipalities.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, value: "50+", label: "Years in service" },
              { icon: Award, value: "31", label: "Departments" },
              { icon: Users, value: "300,000+", label: "Patients per year" },
              { icon: Heart, value: "24/7", label: "Emergency care" },
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

      {/* Management */}
      <section className="py-24 bg-secondary">
        <div className="container">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Hospital Management</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { role: "Hospital Director" },
              { role: "Deputy Director for Medical Affairs" },
              { role: "Deputy Director for Economic Affairs" },
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

      {/* Administration */}
      <section className="py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Administration</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {["About Us", "Laws", "Management", "Administration"].map((item) => (
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

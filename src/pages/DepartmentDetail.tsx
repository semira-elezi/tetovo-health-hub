import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { allDepartments } from "./Departments";

export default function DepartmentDetail() {
  const { slug } = useParams<{ slug: string }>();

  const dept = allDepartments.find((d) => d.slug === slug);
  if (!dept) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Department not found</p>
        </div>
      </Layout>
    );
  }

  const Icon = dept.icon;

  const isCardiology = slug === "cardiology";

  const overviewText = isCardiology
    ? "The Department of Cardiology at Clinical Hospital Tetovo provides comprehensive diagnosis and treatment of all forms of cardiovascular disease. Our team of experienced cardiologists uses state-of-the-art diagnostic equipment including echocardiography, electrocardiography, Holter monitoring, and stress testing to deliver accurate diagnoses and effective treatment plans.\n\nThe department works closely with the Department of Interventional Cardiology for patients requiring minimally invasive procedures."
    : `The ${dept.name} department at Clinical Hospital Tetovo provides comprehensive care with modern equipment and an experienced medical team. We are committed to delivering the highest standards of medical practice to all our patients.`;

  const services = isCardiology
    ? [
        "Electrocardiogram (ECG)",
        "Echocardiography",
        "Holter monitoring (24/48/72h)",
        "Stress testing",
        "Blood pressure monitoring",
        "Diagnosis of arrhythmias",
        "Heart failure management",
        "Hypertension treatment",
      ]
    : [
        "Diagnostic examinations",
        "Outpatient consultations",
        "Hospitalization",
        "Patient monitoring",
        "Rehabilitation",
      ];

  const relatedDepts = isCardiology
    ? ["interventional-cardiology", "internal-medicine", "emergency-medicine"]
    : allDepartments
        .filter((d) => d.category === dept.category && d.slug !== dept.slug)
        .slice(0, 3)
        .map((d) => d.slug);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-14">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-4">
            <Link to="/" className="hover:text-primary-foreground">Home</Link>
            <span>/</span>
            <Link to="/departments" className="hover:text-primary-foreground">Departments</Link>
            <span>/</span>
            <span className="text-primary-foreground">{dept.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">Department of {dept.name}</h1>
              <p className="text-primary-foreground/70">{dept.desc}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div>
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start rounded-2xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
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

              <TabsContent value="contact" className="mt-6">
                <Card className="rounded-2xl border shadow-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      +389 75 200 304
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      kbtetovo@zdravstvo.gov.mk
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      Clinical Hospital Tetovo, st. 29 Noemvri, 1200 Tetovo
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl border shadow-card">
              <CardContent className="p-6 space-y-4">
                <h4 className="font-semibold">Working Hours</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Mon – Fri: 07:00 – 15:00
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold">Head of Department</h4>
                  <p className="mt-1 text-sm text-muted-foreground">Dr. [Name]</p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-destructive">Emergency Line</h4>
                  <p className="mt-1 text-lg font-bold text-destructive">194</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-card">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Related Departments</h4>
                <div className="space-y-3">
                  {relatedDepts.map((slug) => {
                    const related = allDepartments.find((d) => d.slug === slug);
                    if (!related) return null;
                    return (
                      <Link
                        key={slug}
                        to={`/departments/${slug}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ArrowRight className="h-3 w-3" />
                        {related.name}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

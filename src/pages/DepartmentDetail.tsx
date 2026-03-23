import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";
import { allDepartments, deptNames } from "./Departments";
import { Phone, Mail, Clock, MapPin } from "lucide-react";

export default function DepartmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();

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
  const name = deptNames[dept.slug]?.[language] || dept.slug;

  const doctors = [
    { name: dept.head, title: language === "mk" ? "Раководител" : language === "sq" ? "Shef" : "Head", specialty: name },
    { name: "Dr. " + (language === "mk" ? "Марија Ивановска" : language === "sq" ? "Marija Ivanovska" : "Marija Ivanovska"), title: language === "mk" ? "Специјалист" : language === "sq" ? "Specialist" : "Specialist", specialty: name },
    { name: "Dr. " + (language === "mk" ? "Ахмет Јашари" : language === "sq" ? "Ahmet Jashari" : "Ahmet Jashari"), title: language === "mk" ? "Специјалист" : language === "sq" ? "Specialist" : "Specialist", specialty: name },
  ];

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary py-12">
        <div className="container flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/10">
            <Icon className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">{name}</h1>
            <p className="text-primary-foreground/70">{dept.head}</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t("departments.overview")}</TabsTrigger>
            <TabsTrigger value="doctors">{t("departments.doctors")}</TabsTrigger>
            <TabsTrigger value="services">{t("departments.services")}</TabsTrigger>
            <TabsTrigger value="contact">{t("contact.title")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground">
                  {language === "mk"
                    ? `Одделението за ${name.toLowerCase()} во Клиничка Болница Тетово нуди комплетна дијагностика и лекување со современа опрема и искусен тим.`
                    : language === "sq"
                    ? `Departamenti i ${name.toLowerCase()} në Spitalin Klinik Tetovë ofron diagnostikim dhe trajtim të plotë me pajisje moderne dhe ekip me përvojë.`
                    : `The ${name} department at Clinical Hospital Tetovo provides comprehensive diagnosis and treatment with modern equipment and an experienced team.`}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {language === "mk" ? "Пон - Пет: 07:00 - 20:00" : language === "sq" ? "Hën - Pre: 07:00 - 20:00" : "Mon - Fri: 07:00 - 20:00"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doc) => (
                <Card key={doc.name}>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                      <span className="text-lg font-bold text-primary">{doc.name.charAt(4)}</span>
                    </div>
                    <h3 className="font-semibold">{doc.name}</h3>
                    <Badge variant="secondary" className="mt-1">{doc.title}</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">{doc.specialty}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2">
                  {[
                    language === "mk" ? "Дијагностички прегледи" : language === "sq" ? "Kontrolle diagnostike" : "Diagnostic examinations",
                    language === "mk" ? "Амбулантски прегледи" : language === "sq" ? "Kontrolle ambulantore" : "Outpatient consultations",
                    language === "mk" ? "Хоспитализација" : language === "sq" ? "Hospitalizim" : "Hospitalization",
                    language === "mk" ? "Следење на пациенти" : language === "sq" ? "Monitorimi i pacientëve" : "Patient monitoring",
                    language === "mk" ? "Рехабилитација" : language === "sq" ? "Rehabilitim" : "Rehabilitation",
                  ].map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" /> +389 44 334 {100 + allDepartments.indexOf(dept)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" /> {slug}@kbt.mk
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {language === "mk" ? "Спрат " : language === "sq" ? "Kati " : "Floor "}{Math.ceil((allDepartments.indexOf(dept) + 1) / 5)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

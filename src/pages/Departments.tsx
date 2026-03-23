import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart, AlertTriangle, Scissors, Brain, Baby, Users,
  Eye, Ear, Bone, Pill, Microscope, Syringe, Stethoscope,
  Thermometer, Activity, Scan, Droplets, Shield, Zap,
  Leaf, Smile, BrainCircuit, MonitorSpeaker, Layers,
  Radiation, Waves, CircleDot, FlaskConical, Laptop, Star, Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";

const allDepartments = [
  { slug: "cardiology", icon: Heart, category: "Internal", head: "Dr. Arben Ismaili" },
  { slug: "emergency", icon: AlertTriangle, category: "Emergency", head: "Dr. Blerim Selmani" },
  { slug: "surgery", icon: Scissors, category: "Surgery", head: "Dr. Marko Petrov" },
  { slug: "neurology", icon: Brain, category: "Internal", head: "Dr. Elena Stojanova" },
  { slug: "pediatrics", icon: Baby, category: "Internal", head: "Dr. Faton Rexhepi" },
  { slug: "gynecology", icon: Users, category: "Surgery", head: "Dr. Alma Demiri" },
  { slug: "ophthalmology", icon: Eye, category: "Diagnostics", head: "Dr. Igor Trajkov" },
  { slug: "ent", icon: Ear, category: "Surgery", head: "Dr. Shpresa Aliu" },
  { slug: "orthopedics", icon: Bone, category: "Surgery", head: "Dr. Nikola Ristov" },
  { slug: "dermatology", icon: Smile, category: "Internal", head: "Dr. Teuta Bexheti" },
  { slug: "urology", icon: Shield, category: "Surgery", head: "Dr. Risto Markovski" },
  { slug: "oncology", icon: Radiation, category: "Internal", head: "Dr. Besnik Osmani" },
  { slug: "pulmonology", icon: Waves, category: "Internal", head: "Dr. Vesna Ilievska" },
  { slug: "gastroenterology", icon: CircleDot, category: "Internal", head: "Dr. Agim Sherifi" },
  { slug: "nephrology", icon: Droplets, category: "Internal", head: "Dr. Gordana Popova" },
  { slug: "endocrinology", icon: Activity, category: "Internal", head: "Dr. Lindita Xhaferi" },
  { slug: "rheumatology", icon: Zap, category: "Internal", head: "Dr. Dejan Milosev" },
  { slug: "hematology", icon: FlaskConical, category: "Internal", head: "Dr. Nexhbedin Beadini" },
  { slug: "infectious-diseases", icon: Microscope, category: "Internal", head: "Dr. Ana Kostova" },
  { slug: "psychiatry", icon: BrainCircuit, category: "Internal", head: "Dr. Bujar Memedi" },
  { slug: "anesthesiology", icon: Syringe, category: "Surgery", head: "Dr. Maja Janeva" },
  { slug: "radiology", icon: Scan, category: "Diagnostics", head: "Dr. Driton Musliu" },
  { slug: "pathology", icon: Layers, category: "Diagnostics", head: "Dr. Suzana Petrovic" },
  { slug: "laboratory", icon: FlaskConical, category: "Diagnostics", head: "Dr. Erion Iseni" },
  { slug: "physical-therapy", icon: Leaf, category: "Internal", head: "Dr. Olivera Markova" },
  { slug: "neonatology", icon: Baby, category: "Internal", head: "Dr. Kushtrim Ademi" },
  { slug: "intensive-care", icon: MonitorSpeaker, category: "Emergency", head: "Dr. Biljana Trajkova" },
  { slug: "maxillofacial", icon: Smile, category: "Surgery", head: "Dr. Valon Krasniqi" },
  { slug: "thoracic-surgery", icon: Stethoscope, category: "Surgery", head: "Dr. Aleksandar Stoev" },
  { slug: "vascular-surgery", icon: Activity, category: "Surgery", head: "Dr. Mensur Ajdari" },
  { slug: "nuclear-medicine", icon: Laptop, category: "Diagnostics", head: "Dr. Ivana Nikolova" },
];

const categories = ["All", "Surgery", "Internal", "Diagnostics", "Emergency"];

const deptNames: Record<string, Record<string, string>> = {
  cardiology: { mk: "Кардиологија", sq: "Kardiologji", en: "Cardiology" },
  emergency: { mk: "Итна помош", sq: "Urgjenca", en: "Emergency" },
  surgery: { mk: "Хирургија", sq: "Kirurgji", en: "Surgery" },
  neurology: { mk: "Неврологија", sq: "Neurologji", en: "Neurology" },
  pediatrics: { mk: "Педијатрија", sq: "Pediatri", en: "Pediatrics" },
  gynecology: { mk: "Гинекологија", sq: "Gjinekologji", en: "Gynecology" },
  ophthalmology: { mk: "Офталмологија", sq: "Oftalmologji", en: "Ophthalmology" },
  ent: { mk: "ОРЛ", sq: "ORL", en: "ENT" },
  orthopedics: { mk: "Ортопедија", sq: "Ortopedi", en: "Orthopedics" },
  dermatology: { mk: "Дерматологија", sq: "Dermatologji", en: "Dermatology" },
  urology: { mk: "Урологија", sq: "Urologji", en: "Urology" },
  oncology: { mk: "Онкологија", sq: "Onkologji", en: "Oncology" },
  pulmonology: { mk: "Пулмологија", sq: "Pulmonologji", en: "Pulmonology" },
  gastroenterology: { mk: "Гастроентерологија", sq: "Gastroenterologji", en: "Gastroenterology" },
  nephrology: { mk: "Нефрологија", sq: "Nefrologji", en: "Nephrology" },
  endocrinology: { mk: "Ендокринологија", sq: "Endokrinologji", en: "Endocrinology" },
  rheumatology: { mk: "Ревматологија", sq: "Reumatologji", en: "Rheumatology" },
  hematology: { mk: "Хематологија", sq: "Hematologji", en: "Hematology" },
  "infectious-diseases": { mk: "Инфективни болести", sq: "Sëmundje infektive", en: "Infectious Diseases" },
  psychiatry: { mk: "Психијатрија", sq: "Psikiatri", en: "Psychiatry" },
  anesthesiology: { mk: "Анестезиологија", sq: "Anesteziologji", en: "Anesthesiology" },
  radiology: { mk: "Радиологија", sq: "Radiologji", en: "Radiology" },
  pathology: { mk: "Патологија", sq: "Patologji", en: "Pathology" },
  laboratory: { mk: "Лабораторија", sq: "Laboratori", en: "Laboratory" },
  "physical-therapy": { mk: "Физикална терапија", sq: "Fizioterapi", en: "Physical Therapy" },
  neonatology: { mk: "Неонатологија", sq: "Neonatologji", en: "Neonatology" },
  "intensive-care": { mk: "Интензивна нега", sq: "Kujdesi intensiv", en: "Intensive Care" },
  maxillofacial: { mk: "Максилофацијална", sq: "Maksilofaciale", en: "Maxillofacial" },
  "thoracic-surgery": { mk: "Торакална хирургија", sq: "Kirurgji torakale", en: "Thoracic Surgery" },
  "vascular-surgery": { mk: "Васкуларна хирургија", sq: "Kirurgji vaskulare", en: "Vascular Surgery" },
  "nuclear-medicine": { mk: "Нуклеарна медицина", sq: "Mjekësi bërthamore", en: "Nuclear Medicine" },
};

export { allDepartments, deptNames };

export default function DepartmentsPage() {
  const { t, language } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = allDepartments.filter((d) => {
    const name = deptNames[d.slug]?.[language] || d.slug;
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || d.category === category;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold">{t("departments.title")}</h1>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("departments.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={category === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dept) => {
            const Icon = dept.icon;
            const name = deptNames[dept.slug]?.[language] || dept.slug;
            return (
              <Card key={dept.slug} className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{dept.head}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-xs">{dept.category}</Badge>
                  <Button asChild variant="link" size="sm" className="mt-2 px-0">
                    <Link to={`/departments/${dept.slug}`}>{t("departments.viewDept")}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

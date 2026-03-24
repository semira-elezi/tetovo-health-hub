import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart, Activity, Scissors, Brain, Baby, Stethoscope,
  Droplets, Shield, Eye, Wind, Target, Search,
  Scan, Microscope, Pill, AlertCircle, Smile, Dumbbell,
  Volume2, Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { useTranslation } from "@/lib/i18n";
import { useDepartments } from "@/hooks/useDepartments";

const iconMap: Record<string, any> = {
  Heart, Activity, Scissors, Brain, Baby, Stethoscope,
  Droplets, Shield, Eye, Wind, Target, Search,
  Scan, Microscope, Pill, AlertCircle, Smile, Dumbbell,
  Volume2, Users,
};

const categories = ["All", "Surgery", "Internal", "Diagnostics", "Emergency", "Specialized"];

export default function DepartmentsPage() {
  const { t, language } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { data: departments, isLoading } = useDepartments();

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [search, category]);

  const getName = (d: any) => {
    if (language === "mk") return d.name_mk || d.name_en;
    if (language === "sq") return d.name_sq || d.name_en;
    return d.name_en;
  };

  const getDesc = (d: any) => {
    if (language === "mk") return d.description_mk || d.description_en;
    if (language === "sq") return d.description_sq || d.description_en;
    return d.description_en;
  };

  const filtered = (departments || []).filter((d) => {
    const name = getName(d).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchCat = category === "All" || d.category === category;
    return matchSearch && matchCat;
  });

  const categoryLabels: Record<string, Record<string, string>> = {
    All: { mk: "Сите", sq: "Të gjitha", en: "All" },
    Surgery: { mk: "Хирургија", sq: "Kirurgji", en: "Surgery" },
    Internal: { mk: "Интерна", sq: "Interne", en: "Internal" },
    Diagnostics: { mk: "Дијагностика", sq: "Diagnostikë", en: "Diagnostics" },
    Emergency: { mk: "Итна", sq: "Urgjencë", en: "Emergency" },
    Specialized: { mk: "Специјализирани", sq: "Të specializuara", en: "Specialized" },
  };

  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-3xl font-bold md:text-4xl">{t("dept.our31")}</h1>

        <div className="mt-8 relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("departments.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl text-base"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm"
              onClick={() => setCategory(cat)}
            >
              {categoryLabels[cat]?.[language] || cat}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-10 text-center text-muted-foreground">{t("common.loading")}</p>
        ) : (
          <div ref={gridRef} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((dept, i) => {
              const Icon = iconMap[dept.icon || ""] || Stethoscope;
              return (
                <Card
                  key={dept.id}
                  className="card-hover rounded-2xl border shadow-card"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.3s ease ${i * 0.05}s, transform 0.3s ease ${i * 0.05}s`,
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold leading-snug">{getName(dept)}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{getDesc(dept)}</p>
                    <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-xs text-primary">
                      <Link to={`/departments/${dept.slug}`}>{t("dept.viewDepartment")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

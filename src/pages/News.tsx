import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";

const newsItems = [
  { slug: "mri-machine", date: "2026-03-20", category: "hospital", title: { mk: "Нов MRI апарат", sq: "Aparat i ri MRI", en: "New MRI Machine" }, excerpt: { mk: "Современ апарат за магнетна резонанца почна со работа", sq: "Aparat modern i rezonancës magnetike filloi punën", en: "A state-of-the-art MRI machine has begun operations" } },
  { slug: "pediatric-checkups", date: "2026-03-15", category: "events", title: { mk: "Бесплатни прегледи за деца", sq: "Kontrolle falas për fëmijë", en: "Free Pediatric Checkups" }, excerpt: { mk: "Кампања за бесплатни педијатриски прегледи", sq: "Fushatë për kontrolle falas pediatrike", en: "Free pediatric checkup campaign" } },
  { slug: "conference", date: "2026-03-10", category: "hospital", title: { mk: "Меѓународна конференција", sq: "Konferencë ndërkombëtare", en: "International Conference" }, excerpt: { mk: "Болницата ќе биде домаќин", sq: "Spitali do të jetë nikoqir", en: "The hospital will host a conference" } },
  { slug: "heart-health", date: "2026-03-05", category: "healthTips", title: { mk: "Совети за здраво срце", sq: "Këshilla për zemër të shëndetshme", en: "Heart Health Tips" }, excerpt: { mk: "Како да го заштитите вашето срце", sq: "Si ta mbroni zemrën tuaj", en: "How to protect your heart" } },
  { slug: "blood-drive", date: "2026-02-28", category: "events", title: { mk: "Акција за донирање крв", sq: "Aksion për dhurimin e gjakut", en: "Blood Donation Drive" }, excerpt: { mk: "Донирајте крв и спасете животи", sq: "Dhuroni gjak dhe shpëtoni jetë", en: "Donate blood and save lives" } },
  { slug: "diabetes-awareness", date: "2026-02-20", category: "healthTips", title: { mk: "Превенција на дијабетес", sq: "Parandalimi i diabetit", en: "Diabetes Prevention" }, excerpt: { mk: "Научете повеќе за превенција", sq: "Mësoni më shumë rreth parandalimit", en: "Learn about prevention" } },
];

const categoryFilters = ["all", "hospital", "healthTips", "events"] as const;

export default function NewsPage() {
  const { t, language } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categoryLabels: Record<string, string> = {
    all: t("news.all"),
    hospital: t("news.hospital"),
    healthTips: t("news.healthTips"),
    events: t("news.events"),
  };

  const filtered = newsItems.filter((n) => {
    const matchSearch = n.title[language].toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || n.category === category;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold">{t("news.title")}</h1>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("news.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {categoryFilters.map((cat) => (
              <Badge key={cat} variant={category === cat ? "default" : "outline"} className="cursor-pointer" onClick={() => setCategory(cat)}>
                {categoryLabels[cat]}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.slug} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="h-40 bg-accent" />
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                  <Badge variant="secondary" className="text-xs">{categoryLabels[item.category]}</Badge>
                </div>
                <h3 className="mt-2 font-semibold">{item.title[language]}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.excerpt[language]}</p>
                <Link to={`/news/${item.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {t("news.readMore")} <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

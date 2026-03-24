import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useTranslation } from "@/lib/i18n";

const newsItems = [
  {
    slug: "new-medical-equipment",
    title: { mk: "Нова медицинска опрема за Одделението за онкологија", sq: "Pajisje të reja mjekësore për Departamentin e Onkologjisë", en: "New Medical Equipment for the Oncology Department" },
    date: "March 10, 2025",
    categoryKey: "news.hospital",
    excerpt: { mk: "Болницата доби нова современа опрема за примена на цитостатска терапија, значително подобрувајќи ги можностите за лекување.", sq: "Spitali ka marrë pajisje të reja moderne për aplikimin e terapisë citostatike, duke përmirësuar ndjeshëm mundësitë e trajtimit.", en: "The hospital has received new state-of-the-art equipment for the application of cytostatic therapy, significantly improving treatment capabilities." },
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=80",
  },
  {
    slug: "health-screening-campaign",
    title: { mk: "Годишна кампања за здравствен скрининг започнува оваа пролет", sq: "Fushata vjetore e kontrollit shëndetësor fillon këtë pranverë", en: "Annual Health Screening Campaign Launches This Spring" },
    date: "February 22, 2025",
    categoryKey: "news.healthTips",
    excerpt: { mk: "Бесплатни превентивни прегледи ќе бидат достапни за граѓаните на Тетовскиот регион во текот на април и мај.", sq: "Ekzaminime falas parandaluese do të jenë në dispozicion për qytetarët e rajonit të Tetovës gjatë prillit dhe majit.", en: "Free preventive examinations will be available to citizens of the Tetovo region throughout April and May." },
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  },
  {
    slug: "50-years",
    title: { mk: "Клиничка Болница Тетово слави 50 години служба", sq: "Spitali Klinik Tetovë feston 50 vjet shërbim", en: "Clinical Hospital Tetovo Celebrates 50 Years of Service" },
    date: "January 15, 2025",
    categoryKey: "news.events",
    excerpt: { mk: "Оваа година бележиме пет децении посветена медицинска служба за заедниците во северозападна Македонија.", sq: "Këtë vit shënojmë pesë dekada shërbim mjekësor të përkushtuar për komunitetet e Maqedonisë veriperëndimore.", en: "This year marks five decades of dedicated medical service to the communities of northwestern North Macedonia." },
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
  },
  {
    slug: "world-diabetes-day",
    title: { mk: "Светски ден на дијабетесот — Бесплатен скрининг", sq: "Dita Botërore e Diabetit — Kontroll falas", en: "World Diabetes Day — Free Screening at Our Hospital" },
    date: "November 14, 2024",
    categoryKey: "news.events",
    excerpt: { mk: "Одделението за дијабетес ќе понуди бесплатно тестирање на глукоза и консултации.", sq: "Departamenti i Diabetit do të ofrojë testime falas të glukozës dhe konsultime.", en: "The Department of Diabetes and Metabolic Diseases will offer free blood glucose testing and consultations." },
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&q=80",
  },
  {
    slug: "neonatology-unicef",
    title: { mk: "Одделението за неонатологија доби признание од UNICEF", sq: "Departamenti i Neonatologjisë merr njohje nga UNICEF", en: "Neonatology Department Receives UNICEF Recognition" },
    date: "October 5, 2024",
    categoryKey: "news.hospital",
    excerpt: { mk: "Нашето Одделение за неонатологија е признато од UNICEF за приврзаноста кон практиките за грижа на новороденчиња.", sq: "Departamenti ynë i Neonatologjisë është njohur nga UNICEF për përkushtimin ndaj praktikave të kujdesit neonatal.", en: "Our Neonatology Department has been recognized by UNICEF for its commitment to baby-friendly hospital practices." },
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
  },
  {
    slug: "mental-health-awareness",
    title: { mk: "Свесност за менталното здравје: Ресурси и поддршка", sq: "Ndërgjegjësimi për shëndetin mendor: Burime dhe mbështetje", en: "Mental Health Awareness: Resources and Support" },
    date: "October 10, 2024",
    categoryKey: "news.healthTips",
    excerpt: { mk: "На Светскиот ден на менталното здравје, Одделението за психијатрија споделува ресурси и водење.", sq: "Në Ditën Botërore të Shëndetit Mendor, Departamenti i Psikiatrisë ndan burime dhe udhëzime.", en: "On World Mental Health Day, the Department of Psychiatry shares resources and guidance for mental health support." },
    image: "https://images.unsplash.com/photo-1620220342078-56e59e9d21e9?w=600&q=80",
  },
];

export { newsItems };

export default function NewsPage() {
  const { t, language } = useTranslation();
  const [category, setCategory] = useState("All");

  const categoryFilters = [
    { key: "All", label: t("news.all") },
    { key: "news.hospital", label: t("news.hospital") },
    { key: "news.healthTips", label: t("news.healthTips") },
    { key: "news.events", label: t("news.events") },
  ];

  const filtered = newsItems.filter(
    (n) => category === "All" || n.categoryKey === category
  );

  const getLocal = (obj: Record<string, string>) => obj[language] || obj.en;

  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-3xl font-bold md:text-4xl">{t("news.pageTitle")}</h1>

        <div className="mt-8 flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <Badge
              key={cat.key}
              variant={category === cat.key ? "default" : "outline"}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm"
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.slug} className="card-hover rounded-2xl border shadow-card overflow-hidden">
              <img src={item.image} alt={getLocal(item.title)} className="h-48 w-full object-cover" loading="lazy" />
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  <Badge className="rounded-full bg-accent text-accent-foreground text-xs px-2.5 py-0.5">
                    {t(item.categoryKey as any)}
                  </Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-snug">{getLocal(item.title)}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{getLocal(item.excerpt)}</p>
                <Link to={`/news/${item.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {t("news.readMore")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

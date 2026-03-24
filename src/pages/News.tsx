import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useTranslation } from "@/lib/i18n";
import { useNews } from "@/hooks/useNews";
import { format } from "date-fns";

const categoryMap: Record<string, string> = {
  hospital_news: "news.hospital",
  health_tips: "news.healthTips",
  events: "news.events",
  announcements: "news.announcements",
};

export default function NewsPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState("All");
  const { data: articles, isLoading } = useNews(category === "All" ? undefined : category);

  const categoryFilters = [
    { key: "All", label: t("news.all") },
    { key: "hospital_news", label: t("news.hospital") },
    { key: "health_tips", label: t("news.healthTips") },
    { key: "events", label: t("news.events") },
  ];

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

        {isLoading ? (
          <div className="mt-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !articles?.length ? (
          <p className="mt-20 text-center text-muted-foreground">No articles found.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((item) => (
              <Card key={item.id} className="card-hover rounded-2xl border shadow-card overflow-hidden">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="h-48 w-full object-cover" loading="lazy" />
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.published_at ? format(new Date(item.published_at), "MMMM d, yyyy") : "Draft"}
                    </span>
                    <Badge className="rounded-full bg-accent text-accent-foreground text-xs px-2.5 py-0.5">
                      {t((categoryMap[item.category] || "news.hospital") as any)}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-base font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.excerpt}</p>
                  <Link to={`/news/${item.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    {t("news.readMore")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

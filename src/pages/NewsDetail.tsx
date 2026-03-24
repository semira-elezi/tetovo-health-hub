import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useTranslation } from "@/lib/i18n";
import { useNewsArticle, useNews } from "@/hooks/useNews";
import { format } from "date-fns";

const categoryMap: Record<string, string> = {
  hospital_news: "news.hospital",
  health_tips: "news.healthTips",
  events: "news.events",
  announcements: "news.announcements",
};

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();
  const { data: article, isLoading } = useNewsArticle(slug || "");
  const { data: allNews } = useNews();

  const backLabel = language === "mk" ? "Назад кон Вести" : language === "sq" ? "Kthehu te Lajmet" : "Back to News";
  const relatedLabel = language === "mk" ? "Поврзани статии" : language === "sq" ? "Artikuj të ngjashëm" : "Related Articles";

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Article not found</p>
        </div>
      </Layout>
    );
  }

  const related = (allNews || []).filter((n) => n.slug !== slug).slice(0, 2);

  return (
    <Layout>
      <div className="container py-16">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <article>
            <Badge className="rounded-full bg-accent text-accent-foreground text-xs px-2.5 py-0.5 mb-4">
              {t((categoryMap[article.category] || "news.hospital") as any)}
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl leading-tight">{article.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {article.published_at ? format(new Date(article.published_at), "MMMM d, yyyy") : "Draft"} · {article.author || t("footer.hospitalName")}
            </p>

            {article.image_url && (
              <img src={article.image_url} alt={article.title} className="mt-8 w-full rounded-2xl object-cover h-72 md:h-96" />
            )}

            <div className="mt-8 space-y-4">
              {(article.content || article.excerpt || "").split("\n\n").map((para, i) => (
                <p key={i} className="text-base leading-[1.7] text-muted-foreground">{para}</p>
              ))}
            </div>
          </article>

          <aside>
            <h3 className="text-lg font-semibold mb-4">{relatedLabel}</h3>
            <div className="space-y-4">
              {related.map((item) => (
                <Card key={item.id} className="card-hover rounded-2xl border shadow-card overflow-hidden">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} className="h-32 w-full object-cover" loading="lazy" />
                  )}
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {item.published_at ? format(new Date(item.published_at), "MMMM d, yyyy") : "Draft"}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold leading-snug">{item.title}</h4>
                    <Link to={`/news/${item.slug}`} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      {t("news.readMore")} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

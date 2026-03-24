import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { newsItems } from "./News";
import { useTranslation } from "@/lib/i18n";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();

  const getLocal = (obj: Record<string, string>) => obj[language] || obj.en;

  const article = newsItems.find((n) => n.slug === slug);
  if (!article) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Article not found</p>
        </div>
      </Layout>
    );
  }

  const bodyText = getLocal(article.excerpt) + "\n\n" +
    (language === "mk" ? "Клиничка Болница Тетово продолжува да ја служи заедницата со посветеност и професионалност. Нашата заложба за современи здравствени стандарди обезбедува секој пациент да добие најдобра можна грижа.\n\nЗа повеќе информации, контактирајте нè на kbtetovo@zdravstvo.gov.mk или јавете се на +389 75 200 304."
      : language === "sq" ? "Spitali Klinik Tetovë vazhdon të shërbejë komunitetin me përkushtim dhe profesionalizëm. Angazhimi ynë për standarde moderne shëndetësore siguron që çdo pacient të marrë kujdesin më të mirë të mundshëm.\n\nPër më shumë informacion, na kontaktoni në kbtetovo@zdravstvo.gov.mk ose telefononi +389 75 200 304."
      : "Clinical Hospital Tetovo continues to serve the community with dedication and professionalism. Our commitment to modern healthcare standards ensures that every patient receives the best possible care.\n\nFor more information, please contact us at kbtetovo@zdravstvo.gov.mk or call +389 75 200 304.");

  const related = newsItems.filter((n) => n.slug !== slug).slice(0, 2);

  return (
    <Layout>
      <div className="container py-16">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> {language === "mk" ? "Назад кон Вести" : language === "sq" ? "Kthehu te Lajmet" : "Back to News"}
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <article>
            <Badge className="rounded-full bg-accent text-accent-foreground text-xs px-2.5 py-0.5 mb-4">
              {t(article.categoryKey as any)}
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl leading-tight">{getLocal(article.title)}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{article.date} · {t("footer.hospitalName")}</p>

            <img
              src={article.image}
              alt={getLocal(article.title)}
              className="mt-8 w-full rounded-2xl object-cover h-72 md:h-96"
            />

            <div className="mt-8 space-y-4">
              {bodyText.split("\n\n").map((para, i) => (
                <p key={i} className="text-base leading-[1.7] text-muted-foreground">{para}</p>
              ))}
            </div>
          </article>

          <aside>
            <h3 className="text-lg font-semibold mb-4">{language === "mk" ? "Поврзани статии" : language === "sq" ? "Artikuj të ngjashëm" : "Related Articles"}</h3>
            <div className="space-y-4">
              {related.map((item) => (
                <Card key={item.slug} className="card-hover rounded-2xl border shadow-card overflow-hidden">
                  <img src={item.image} alt={getLocal(item.title)} className="h-32 w-full object-cover" loading="lazy" />
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                    <h4 className="mt-1 text-sm font-semibold leading-snug">{getLocal(item.title)}</h4>
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

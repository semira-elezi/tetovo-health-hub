import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { newsItems } from "./News";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();

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

  const bodyText = article.slug === "new-medical-equipment"
    ? "The hospital has received new state-of-the-art equipment for the application of cytostatic therapy, significantly improving treatment capabilities. This investment is part of the hospital's ongoing commitment to providing the highest quality care.\n\nThe new equipment will allow the Oncology Department to treat more patients with greater precision and fewer side effects. Training sessions for medical staff have already begun to ensure optimal utilization of the technology.\n\nDirector of the hospital stated that this acquisition represents a major step forward in cancer treatment capabilities for the entire northwestern region of North Macedonia."
    : `${article.excerpt}\n\nClinical Hospital Tetovo continues to serve the community with dedication and professionalism. Our commitment to modern healthcare standards ensures that every patient receives the best possible care.\n\nFor more information, please contact us at kbtetovo@zdravstvo.gov.mk or call +389 75 200 304.`;

  const related = newsItems.filter((n) => n.slug !== slug).slice(0, 2);

  return (
    <Layout>
      <div className="container py-16">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to News
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <article>
            <Badge className="rounded-full bg-accent text-accent-foreground text-xs px-2.5 py-0.5 mb-4">
              {article.category}
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl leading-tight">{article.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{article.date} · Clinical Hospital Tetovo</p>

            <img
              src={article.image}
              alt={article.title}
              className="mt-8 w-full rounded-2xl object-cover h-72 md:h-96"
            />

            <div className="mt-8 space-y-4">
              {bodyText.split("\n\n").map((para, i) => (
                <p key={i} className="text-base leading-[1.7] text-muted-foreground">{para}</p>
              ))}
            </div>
          </article>

          {/* Sidebar — Related */}
          <aside>
            <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
            <div className="space-y-4">
              {related.map((item) => (
                <Card key={item.slug} className="card-hover rounded-2xl border shadow-card overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-32 w-full object-cover"
                    loading="lazy"
                  />
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                    <h4 className="mt-1 text-sm font-semibold leading-snug">{item.title}</h4>
                    <Link
                      to={`/news/${item.slug}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Read more <ArrowRight className="h-3 w-3" />
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

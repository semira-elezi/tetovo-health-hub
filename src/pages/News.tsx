import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";

const newsItems = [
  {
    slug: "new-medical-equipment",
    title: "New Medical Equipment for the Oncology Department",
    date: "March 10, 2025",
    category: "Hospital News",
    excerpt: "The hospital has received new state-of-the-art equipment for the application of cytostatic therapy, significantly improving treatment capabilities.",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=80",
  },
  {
    slug: "health-screening-campaign",
    title: "Annual Health Screening Campaign Launches This Spring",
    date: "February 22, 2025",
    category: "Health Tips",
    excerpt: "Free preventive examinations will be available to citizens of the Tetovo region throughout April and May as part of our community health initiative.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  },
  {
    slug: "50-years",
    title: "Clinical Hospital Tetovo Celebrates 50 Years of Service",
    date: "January 15, 2025",
    category: "Events",
    excerpt: "This year marks five decades of dedicated medical service to the communities of northwestern North Macedonia.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
  },
  {
    slug: "world-diabetes-day",
    title: "World Diabetes Day — Free Screening at Our Hospital",
    date: "November 14, 2024",
    category: "Events",
    excerpt: "In honor of World Diabetes Day, the Department of Diabetes and Metabolic Diseases will offer free blood glucose testing and consultations.",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&q=80",
  },
  {
    slug: "neonatology-unicef",
    title: "Neonatology Department Receives UNICEF Recognition",
    date: "October 5, 2024",
    category: "Hospital News",
    excerpt: "Our Neonatology Department has been recognized by UNICEF for its commitment to baby-friendly hospital practices and neonatal intensive care.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
  },
  {
    slug: "mental-health-awareness",
    title: "Mental Health Awareness: Resources and Support",
    date: "October 10, 2024",
    category: "Health Tips",
    excerpt: "On World Mental Health Day, the Department of Psychiatry shares resources and guidance for those seeking mental health support in our region.",
    image: "https://images.unsplash.com/photo-1620220342078-56e59e9d21e9?w=600&q=80",
  },
];

export { newsItems };

const categoryFilters = ["All", "Hospital News", "Health Tips", "Events"];

export default function NewsPage() {
  const [category, setCategory] = useState("All");

  const filtered = newsItems.filter(
    (n) => category === "All" || n.category === category
  );

  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-3xl font-bold md:text-4xl">News & Announcements</h1>

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <Badge
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.slug} className="card-hover rounded-2xl border shadow-card overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  <Badge className="rounded-full bg-accent text-accent-foreground text-xs px-2.5 py-0.5">
                    {item.category}
                  </Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.excerpt}</p>
                <Link
                  to={`/news/${item.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

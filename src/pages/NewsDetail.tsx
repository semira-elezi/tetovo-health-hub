import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useTranslation();

  const titles: Record<string, Record<string, string>> = {
    "mri-machine": { mk: "Нов MRI апарат во болницата", sq: "Aparat i ri MRI në spital", en: "New MRI Machine Installed" },
    "pediatric-checkups": { mk: "Бесплатни прегледи за деца", sq: "Kontrolle falas për fëmijë", en: "Free Pediatric Checkups" },
    conference: { mk: "Меѓународна конференција", sq: "Konferencë ndërkombëtare", en: "International Conference" },
  };

  const title = titles[slug || ""]?.[language] || slug;

  return (
    <Layout>
      <div className="container max-w-3xl py-10">
        <Badge variant="secondary" className="mb-4">
          {language === "mk" ? "Болнички вести" : language === "sq" ? "Lajme spitalore" : "Hospital News"}
        </Badge>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">2026-03-20 · Admin</p>

        <div className="mt-6 h-64 rounded-lg bg-accent" />

        <Card className="mt-8">
          <CardContent className="prose max-w-none pt-6 text-muted-foreground">
            <p>
              {language === "mk"
                ? "Клиничка Болница Тетово продолжува со модернизација на медицинската опрема. Новиот апарат овозможува подобра дијагностика и поквалитетна здравствена заштита за сите пациенти."
                : language === "sq"
                ? "Spitali Klinik Tetovë vazhdon me modernizimin e pajisjeve mjekësore. Aparati i ri mundëson diagnostikim më të mirë dhe kujdes shëndetësor më cilësor për të gjithë pacientët."
                : "Clinical Hospital Tetovo continues to modernize its medical equipment. The new apparatus enables better diagnostics and higher quality healthcare for all patients."}
            </p>
            <p className="mt-4">
              {language === "mk"
                ? "Инвестицијата е дел од стратешкиот план за развој на болницата во наредните 5 години, со цел да се обезбеди современа здравствена заштита за сите граѓани."
                : language === "sq"
                ? "Investimi është pjesë e planit strategjik për zhvillimin e spitalit në 5 vitet e ardhshme, me qëllim sigurimin e kujdesit modern shëndetësor për të gjithë qytetarët."
                : "The investment is part of the hospital's strategic development plan for the next 5 years, aimed at providing modern healthcare for all citizens."}
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

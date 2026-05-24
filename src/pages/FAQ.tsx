import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const { language } = useTranslation();
  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("faqs")
        .select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const heading = language === "mk" ? "Често поставувани прашања" : language === "sq" ? "Pyetjet e bëra shpesh" : "Frequently Asked Questions";
  const sub = language === "mk" ? "Одговори на најчестите прашања на пациентите" : language === "sq" ? "Përgjigje për pyetjet më të shpeshta të pacientëve" : "Answers to the most common patient questions";

  const q = (f: any) => language === "mk" ? (f.question_mk || f.question_en) : language === "sq" ? (f.question_sq || f.question_en) : f.question_en;
  const a = (f: any) => language === "mk" ? (f.answer_mk || f.answer_en) : language === "sq" ? (f.answer_sq || f.answer_en) : f.answer_en;

  return (
    <Layout>
      <Breadcrumbs />
      <section className="container max-w-3xl py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{heading}</h1>
            <p className="text-sm text-muted-foreground">{sub}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <Accordion type="single" collapsible className="rounded-2xl border bg-card divide-y">
            {faqs?.map((f: any) => (
              <AccordionItem key={f.id} value={f.id} className="px-5">
                <AccordionTrigger className="text-left">{q(f)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a(f)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </Layout>
  );
}

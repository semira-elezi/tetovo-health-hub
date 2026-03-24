import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import Layout from "@/components/layout/Layout";

const CATEGORIES = [
  { value: "documents", labelKey: "publicInfo.documents" },
  { value: "budget", labelKey: "publicInfo.budget" },
  { value: "quarterly_reports", labelKey: "publicInfo.quarterlyReports" },
  { value: "annual_financial_reports", labelKey: "publicInfo.annualReports" },
  { value: "internal_job_listings", labelKey: "publicInfo.jobListings" },
  { value: "annual_procurement_plan", labelKey: "publicInfo.procurementPlan" },
  { value: "procurement_announcements", labelKey: "publicInfo.procurementAnnouncements" },
  { value: "patient_rights", labelKey: "publicInfo.patientRights" },
] as const;

const EXTERNAL_LINKS = [
  { name: "Ministry of Health", url: "http://zdravstvo.gov.mk/" },
  { name: "Health Insurance Fund", url: "https://fzo.org.mk/" },
  { name: "Medical Chamber", url: "http://www.lkm.org.mk/" },
  { name: "Drug Registry", url: "https://lekovi.zdravstvo.gov.mk/" },
];

const PATIENT_RIGHTS = [
  "Right to quality health care",
  "Right to information and explanation",
  "Right to consent and refusal of treatment",
  "Right to privacy and confidentiality",
  "Right to dignity and respect",
  "Right to free choice of doctor",
  "Right to a second medical opinion",
  "Right to complain and receive a response",
];

const PATIENT_OBLIGATIONS = [
  "Provide truthful health information",
  "Comply with prescribed treatment",
  "Respect hospital rules and other patients",
  "Report changes in health condition",
  "Treat medical staff with respect",
];

export default function PublicInfo() {
  const { t } = useTranslation();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["procurement-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procurement_documents")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary/5 py-14">
        <div className="container">
          <h1 className="text-2xl font-bold md:text-3xl">{t("publicInfo.title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{t("publicInfo.description")}</p>
        </div>
      </section>

      <div className="container py-10">
        <Tabs defaultValue="documents">
          <TabsList className="flex-wrap h-auto gap-1">
            {CATEGORIES.map(c => (
              <TabsTrigger key={c.value} value={c.value} className="text-xs">{t(c.labelKey)}</TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map(cat => (
            <TabsContent key={cat.value} value={cat.value} className="mt-6">
              {cat.value === "patient_rights" ? (
                <Card className="rounded-2xl">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Rights of Patients</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        {PATIENT_RIGHTS.map((r, i) => <li key={i}>{r}</li>)}
                      </ol>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Obligations of Patients</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        {PATIENT_OBLIGATIONS.map((o, i) => <li key={i}>{o}</li>)}
                      </ol>
                    </div>
                    {documents?.filter(d => d.category === "patient_rights").map(d => (
                      <a key={d.id} href={d.file_url || "#"} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Download full document</Button>
                      </a>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                    ) : (() => {
                      const docs = documents?.filter(d => d.category === cat.value) || [];
                      return docs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No documents available yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {docs.map(d => (
                            <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">{d.title}</p>
                                  {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {d.published_at && (
                                  <Badge variant="outline" className="text-xs">
                                    {new Date(d.published_at).getFullYear()}
                                  </Badge>
                                )}
                                {d.file_url && (
                                  <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* External Links */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Useful Links</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXTERNAL_LINKS.map(link => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                <Card className="card-hover rounded-2xl h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

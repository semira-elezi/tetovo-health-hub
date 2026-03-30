import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, Download, FileText, Image, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { downloadLabResultAsPdf, generateLabSummary } from "@/services/labService";
import { toast } from "sonner";
import { format } from "date-fns";

const statusColor = (status: string) => {
  if (status === "completed") return "default" as const;
  if (status === "reviewed") return "secondary" as const;
  return "outline" as const;
};

export default function PatientLabResults() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: labResults, isLoading } = useQuery({
    queryKey: ["patient-lab-results-enhanced", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*, doctors(full_name)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  if (!labResults?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No lab results yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {labResults.map((r) => (
        <LabResultCard
          key={r.id}
          result={r}
          onSummaryGenerated={() => queryClient.invalidateQueries({ queryKey: ["patient-lab-results-enhanced"] })}
        />
      ))}
    </div>
  );
}

function LabResultCard({
  result: r,
  onSummaryGenerated,
}: {
  result: any;
  onSummaryGenerated: () => void;
}) {
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const hasFile = !!(r as any).file_url;
  const hasManual = !!r.result_value;
  const hasSummary = !!(r as any).summary;
  const fileType = (r as any).file_type;

  const handleDownload = () => {
    if (hasFile) {
      window.open((r as any).file_url, "_blank");
    } else {
      downloadLabResultAsPdf(r);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      await generateLabSummary(r.id);
      toast.success("Summary generated");
      onSummaryGenerated();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate summary");
    }
    setGeneratingSummary(false);
  };

  // Determine which tabs to show
  const tabOptions: { value: string; label: string }[] = [];
  if (hasManual) tabOptions.push({ value: "results", label: "Results" });
  if (hasFile) tabOptions.push({ value: "document", label: "Document" });
  tabOptions.push({ value: "summary", label: "Summary" });

  const defaultTab = hasManual ? "results" : hasFile ? "document" : "summary";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{r.test_name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {r.test_category && `${r.test_category} · `}
                {(r as any).doctors?.full_name && `Dr. ${(r as any).doctors.full_name} · `}
                {format(new Date(r.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={statusColor(r.status)}>{r.status}</Badge>
            {(hasFile || hasManual) && r.status !== "pending" && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleDownload}>
                <Download className="h-3 w-3" />Download
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {r.status !== "pending" && (
        <CardContent className="pt-0">
          <Tabs defaultValue={defaultTab}>
            <TabsList className="h-8">
              {tabOptions.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs h-7">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {hasManual && (
              <TabsContent value="results" className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Test</TableHead>
                      <TableHead className="text-xs">Result</TableHead>
                      <TableHead className="text-xs">Reference</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm font-medium">{r.test_name}</TableCell>
                      <TableCell className="text-sm font-mono">
                        <ResultValueDisplay
                          value={r.result_value}
                          unit={r.unit}
                          referenceRange={r.reference_range}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.reference_range || "—"} {r.unit || ""}
                      </TableCell>
                      <TableCell>
                        <ResultStatusIndicator value={r.result_value} referenceRange={r.reference_range} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {r.notes && (
                  <p className="text-sm text-muted-foreground mt-3 p-3 bg-muted/50 rounded-lg">
                    <strong>Notes:</strong> {r.notes}
                  </p>
                )}
              </TabsContent>
            )}

            {hasFile && (
              <TabsContent value="document" className="mt-3">
                {fileType === "pdf" ? (
                  <iframe
                    src={(r as any).file_url}
                    className="w-full h-[400px] rounded-lg border"
                    title={`Lab result document - ${r.test_name}`}
                  />
                ) : (
                  <div className="flex justify-center p-4">
                    <img
                      src={(r as any).file_url}
                      alt={`Lab result - ${r.test_name}`}
                      className="max-h-[400px] rounded-lg border object-contain"
                    />
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="summary" className="mt-3">
              {hasSummary ? (
                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm leading-relaxed">{(r as any).summary}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      This summary is AI-generated and not a medical diagnosis. Always consult your doctor for interpretation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground mb-3">No summary available yet</p>
                  {r.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={generatingSummary}
                      onClick={handleGenerateSummary}
                    >
                      {generatingSummary ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating...</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5" />Generate AI Summary</>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}

      {r.status === "pending" && (
        <CardContent className="pt-0">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Results are pending. You will be notified when available.</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ResultValueDisplay({ value, unit, referenceRange }: { value: string; unit?: string; referenceRange?: string }) {
  const colorClass = getResultColor(value, referenceRange);
  return (
    <span className={colorClass}>
      {value} {unit || ""}
    </span>
  );
}

function ResultStatusIndicator({ value, referenceRange }: { value: string; referenceRange?: string }) {
  if (!referenceRange || !value) return <span className="text-xs text-muted-foreground">—</span>;

  const status = evaluateResult(value, referenceRange);
  const colors = {
    normal: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    abnormal: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    unknown: "bg-muted text-muted-foreground",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

function getResultColor(value: string, referenceRange?: string): string {
  if (!referenceRange || !value) return "";
  const status = evaluateResult(value, referenceRange);
  if (status === "normal") return "text-green-600 dark:text-green-400";
  if (status === "warning") return "text-yellow-600 dark:text-yellow-400";
  if (status === "abnormal") return "text-red-600 dark:text-red-400";
  return "";
}

function evaluateResult(value: string, referenceRange: string): "normal" | "warning" | "abnormal" | "unknown" {
  const num = parseFloat(value);
  if (isNaN(num)) return "unknown";

  const match = referenceRange.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (!match) return "unknown";

  const low = parseFloat(match[1]);
  const high = parseFloat(match[2]);
  if (isNaN(low) || isNaN(high)) return "unknown";

  if (num >= low && num <= high) return "normal";
  const range = high - low;
  if (num < low - range * 0.2 || num > high + range * 0.2) return "abnormal";
  return "warning";
}

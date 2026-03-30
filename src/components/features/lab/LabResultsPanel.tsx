import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, CheckCircle, Loader2, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_BADGE: Record<string, "default" | "secondary" | "outline"> = {
  pending: "outline",
  completed: "default",
  reviewed: "secondary",
};

export default function LabResultsPanel({ doctorId }: { doctorId: string }) {
  const queryClient = useQueryClient();
  const [editingResult, setEditingResult] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const { data: labResults, isLoading } = useQuery({
    queryKey: ["doctor-lab-results-full", doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*, profiles!lab_results_patient_id_fkey(full_name)")
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });
      if (error) {
        // fallback without join
        const { data: d2, error: e2 } = await supabase
          .from("lab_results")
          .select("*")
          .eq("doctor_id", doctorId)
          .order("created_at", { ascending: false });
        if (e2) throw e2;
        return d2;
      }
      return data;
    },
    enabled: !!doctorId,
  });

  const updateResult = useMutation({
    mutationFn: async ({ id, result_value, notes, status }: {
      id: string; result_value: string; notes?: string; status: string;
    }) => {
      const { error } = await supabase.from("lab_results")
        .update({ result_value, notes: notes || null, status: status as any })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-lab-results-full"] });
      toast.success("Lab result updated");

      // Notify patient when completed
      if (vars.status === "completed") {
        const result = labResults?.find((r) => r.id === vars.id);
        if (result) {
          createNotification({
            user_id: result.patient_id,
            title: "Lab Results Available",
            message: `Your ${result.test_name} results are now available.`,
            type: "lab_result",
            link: "/portal",
          }).catch(() => {});
        }
      }
      setEditingResult(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update"),
  });

  const filtered = labResults?.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  }) || [];

  const pendingCount = labResults?.filter((r) => r.status === "pending").length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="h-5 w-5" /> Lab Results
          {pendingCount > 0 && (
            <Badge variant="destructive" className="text-xs">{pendingCount} pending</Badge>
          )}
        </h2>
        <div className="flex gap-1">
          {(["all", "pending", "completed"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="text-xs h-7"
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No lab results found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                  <FlaskConical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{r.test_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(r as any).profiles?.full_name || "Patient"} · {format(new Date(r.created_at), "MMM d, yyyy")}
                    {r.test_category && ` · ${r.test_category}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.result_value && (
                    <span className="text-sm font-mono">{r.result_value} {r.unit || ""}</span>
                  )}
                  <Badge variant={STATUS_BADGE[r.status] || "outline"}>{r.status}</Badge>
                  {r.status === "pending" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => setEditingResult(r)}>
                      <CheckCircle className="h-3 w-3" /> Enter Results
                    </Button>
                  )}
                  {r.status === "completed" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs"
                      onClick={() => setEditingResult(r)}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enter/Edit Result Dialog */}
      {editingResult && (
        <EnterResultDialog
          result={editingResult}
          onClose={() => setEditingResult(null)}
          onSubmit={(values) => updateResult.mutate({ id: editingResult.id, ...values })}
          isPending={updateResult.isPending}
        />
      )}
    </div>
  );
}

function EnterResultDialog({
  result,
  onClose,
  onSubmit,
  isPending,
}: {
  result: any;
  onClose: () => void;
  onSubmit: (vals: { result_value: string; notes?: string; status: string }) => void;
  isPending: boolean;
}) {
  const [resultValue, setResultValue] = useState(result.result_value || "");
  const [notes, setNotes] = useState(result.notes || "");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter Lab Results</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Test:</strong> {result.test_name}</p>
            {result.test_category && <p><strong>Category:</strong> {result.test_category}</p>}
            {result.reference_range && <p><strong>Reference:</strong> {result.reference_range} {result.unit || ""}</p>}
          </div>
          <div className="space-y-2">
            <Label>Result Value *</Label>
            <Input placeholder={`e.g. 95 ${result.unit || ""}`} value={resultValue} onChange={(e) => setResultValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Observations..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button className="w-full" disabled={isPending || !resultValue.trim()}
            onClick={() => onSubmit({ result_value: resultValue.trim(), notes, status: "completed" })}>
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save & Notify Patient"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
